// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./RWAFarmersToken.sol";

/**
 * @title MakmurTani Marketplace
 * @dev Facilitates the buying, selling, and trading of tokenized agricultural assets
 */
contract MakmurTaniMarketplace is AccessControl, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    // State variables
    RWAFarmersToken public farmersToken;
    Counters.Counter private _listingIdCounter;
    uint256 public platformFeePercentage; // Fee in basis points (e.g., 250 = 2.5%)
    address public feeCollector;

    struct Listing {
        uint256 listingId;
        uint256 tokenId;
        address seller;
        address paymentToken; // ERC20 token used for payment (address(0) for native currency)
        uint256 price;
        bool isActive;
        uint256 listedAt;
    }

    // Mappings
    mapping(uint256 => Listing) public listings; // listingId => Listing
    mapping(uint256 => bool) public tokenIsListed; // tokenId => isListed

    // Events
    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        address paymentToken,
        uint256 price
    );
    event ListingCancelled(uint256 indexed listingId, uint256 indexed tokenId);
    event ListingSold(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed buyer,
        address seller,
        uint256 price
    );
    event FeeUpdated(uint256 newFeePercentage);
    event FeeCollectorUpdated(address newFeeCollector);

    /**
     * @dev Constructor
     * @param _farmersToken Address of the RWAFarmersToken contract
     * @param _feeCollector Address that collects platform fees
     * @param _feePercentage Platform fee percentage in basis points
     */
    constructor(
        address _farmersToken,
        address _feeCollector,
        uint256 _feePercentage
    ) {
        require(_farmersToken != address(0), "Invalid token address");
        require(_feeCollector != address(0), "Invalid fee collector address");
        require(_feePercentage <= 1000, "Fee too high"); // Max fee of 10%

        farmersToken = RWAFarmersToken(_farmersToken);
        feeCollector = _feeCollector;
        platformFeePercentage = _feePercentage;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Creates a new listing for a tokenized asset
     * @param tokenId ID of the token to list
     * @param paymentToken Address of the ERC20 token to accept as payment (or address(0) for native currency)
     * @param price Listing price in the smallest units of the payment token
     */
    function createListing(
        uint256 tokenId,
        address paymentToken,
        uint256 price
    ) external whenNotPaused nonReentrant {
        require(price > 0, "Price must be greater than zero");
        require(!tokenIsListed[tokenId], "Token already listed");
        
        // Check that the seller owns the token
        require(
            farmersToken.ownerOf(tokenId) == msg.sender,
            "Not the token owner"
        );
        
        // Check that the token is approved for marketplace
        require(
            farmersToken.getApproved(tokenId) == address(this) ||
            farmersToken.isApprovedForAll(msg.sender, address(this)),
            "Token not approved for marketplace"
        );

        // Create the listing
        uint256 listingId = _listingIdCounter.current();
        _listingIdCounter.increment();

        listings[listingId] = Listing({
            listingId: listingId,
            tokenId: tokenId,
            seller: msg.sender,
            paymentToken: paymentToken,
            price: price,
            isActive: true,
            listedAt: block.timestamp
        });

        tokenIsListed[tokenId] = true;

        emit ListingCreated(listingId, tokenId, msg.sender, paymentToken, price);
    }

    /**
     * @dev Cancels an active listing
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");

        listing.isActive = false;
        tokenIsListed[listing.tokenId] = false;

        emit ListingCancelled(listingId, listing.tokenId);
    }

    /**
     * @dev Purchases a listed token
     * @param listingId ID of the listing to purchase
     */
    function purchaseListing(uint256 listingId) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.isActive, "Listing not active");
        require(farmersToken.ownerOf(listing.tokenId) == listing.seller, "Seller no longer owns token");

        // Process payment
        if (listing.paymentToken == address(0)) {
            // Payment in native currency
            require(msg.value == listing.price, "Incorrect payment amount");
            
            // Calculate and transfer fee
            uint256 feeAmount = (listing.price * platformFeePercentage) / 10000;
            uint256 sellerAmount = listing.price - feeAmount;
            
            // Transfer to fee collector and seller
            (bool feeSuccess, ) = payable(feeCollector).call{value: feeAmount}("");
            require(feeSuccess, "Fee transfer failed");
            
            (bool sellerSuccess, ) = payable(listing.seller).call{value: sellerAmount}("");
            require(sellerSuccess, "Seller transfer failed");
        } else {
            // Payment in ERC20 token
            IERC20 paymentToken = IERC20(listing.paymentToken);
            
            // Check buyer allowance and balance
            require(
                paymentToken.allowance(msg.sender, address(this)) >= listing.price,
                "Insufficient allowance"
            );
            require(
                paymentToken.balanceOf(msg.sender) >= listing.price,
                "Insufficient balance"
            );
            
            // Calculate fee
            uint256 feeAmount = (listing.price * platformFeePercentage) / 10000;
            uint256 sellerAmount = listing.price - feeAmount;
            
            // Transfer tokens
            require(
                paymentToken.transferFrom(msg.sender, feeCollector, feeAmount),
                "Fee transfer failed"
            );
            require(
                paymentToken.transferFrom(msg.sender, listing.seller, sellerAmount),
                "Seller transfer failed"
            );
        }

        // Transfer the token to buyer
        farmersToken.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);
        
        // Update listing state
        listing.isActive = false;
        tokenIsListed[listing.tokenId] = false;

        emit ListingSold(listingId, listing.tokenId, msg.sender, listing.seller, listing.price);
    }

    /**
     * @dev Updates the platform fee percentage
     * @param newFeePercentage New fee percentage in basis points
     */
    function updateFeePercentage(uint256 newFeePercentage) external onlyRole(FEE_MANAGER_ROLE) {
        require(newFeePercentage <= 1000, "Fee too high"); // Max fee of 10%
        platformFeePercentage = newFeePercentage;
        emit FeeUpdated(newFeePercentage);
    }

    /**
     * @dev Updates the fee collector address
     * @param newFeeCollector New fee collector address
     */
    function updateFeeCollector(address newFeeCollector) external onlyRole(ADMIN_ROLE) {
        require(newFeeCollector != address(0), "Invalid fee collector address");
        feeCollector = newFeeCollector;
        emit FeeCollectorUpdated(newFeeCollector);
    }

    /**
     * @dev Pauses the marketplace
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the marketplace
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Gets all active listings
     * @return Array of active listing IDs
     */
    function getActiveListings() external view returns (uint256[] memory) {
        uint256 totalListings = _listingIdCounter.current();
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 0; i < totalListings; i++) {
            if (listings[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active listing IDs
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < totalListings; i++) {
            if (listings[i].isActive) {
                activeListings[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return activeListings;
    }

    /**
     * @dev Gets a listing by ID
     * @param listingId ID of the listing to retrieve
     * @return The listing data
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    /**
     * @dev Gets listings by seller
     * @param seller Address of the seller
     * @return Array of listing IDs
     */
    function getListingsBySeller(address seller) external view returns (uint256[] memory) {
        uint256 totalListings = _listingIdCounter.current();
        uint256 sellerListingCount = 0;
        
        // Count seller's listings
        for (uint256 i = 0; i < totalListings; i++) {
            if (listings[i].seller == seller) {
                sellerListingCount++;
            }
        }
        
        // Create array of seller's listing IDs
        uint256[] memory sellerListings = new uint256[](sellerListingCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < totalListings; i++) {
            if (listings[i].seller == seller) {
                sellerListings[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return sellerListings;
    }
} 