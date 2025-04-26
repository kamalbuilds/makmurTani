// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MakmurTani RWA Farmers Token
 * @dev Smart contract that tokenizes agricultural assets as NFTs, manages the supply chain stage,
 * and enables investment and returns between farmers and investors.
 */

contract RWAFarmersToken is ERC721URIStorage, AccessControl, Pausable {
    using Counters for Counters.Counter;
    
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    enum SupplyChainStage {
        Production,
        Processing,
        Distribution,
        Completed
    }

    enum AssetType {
        Farmland,
        Crop,
        Equipment
    }

    struct AssetMetadata {
        string location; // Geographical coordinates or address
        uint256 area; // Size in square meters for land, or quantity for crops
        string assetName; // Name of the farm/crop
        AssetType assetType;
        bool verified; // Verification status by an authority
    }

    struct Params {
        uint investmentAmount;
        address investmentToken;
        address investor;
        uint returnAmount;
        uint returnDate;
        SupplyChainStage stage;
        AssetMetadata metadata;
        uint256 yieldPercentage; // Expected return on investment as percentage * 100 (e.g. 850 = 8.5%)
        uint256 duration; // Investment duration in days
    }

    Counters.Counter private _tokenIdCounter;
    mapping(uint256 => Params) private _params;
    
    // Events
    event StageUpdated(uint256 indexed tokenId, SupplyChainStage newStage);
    event AssetVerified(uint256 indexed tokenId, address verifier);
    event InvestmentMade(uint256 indexed tokenId, address investor, uint256 amount);
    event ReturnProcessed(uint256 indexed tokenId, uint256 amount, address to);
    event AssetCreated(uint256 indexed tokenId, address owner, AssetType assetType);

    constructor() ERC721("MakmurTani Asset Token", "MTANI") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Creates a new tokenized agricultural asset
     * @param investmentAmount The amount required for investment
     * @param investmentToken The token address to be used for investment (e.g., USDT, USDC)
     * @param uri The IPFS URI containing the asset details
     * @param location The geographical location of the asset
     * @param area The size of the land or quantity of crop
     * @param assetName Name or identifier for the asset
     * @param assetType Type of asset being tokenized
     * @param yieldPercentage Expected return percentage (multiplied by 100)
     * @param duration Investment duration in days
     */
    function createAsset(
        uint investmentAmount,
        address investmentToken,
        string memory uri,
        string memory location,
        uint256 area,
        string memory assetName,
        AssetType assetType,
        uint256 yieldPercentage,
        uint256 duration
    ) public whenNotPaused {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        
        AssetMetadata memory metadata = AssetMetadata({
            location: location,
            area: area,
            assetName: assetName,
            assetType: assetType,
            verified: false
        });
        
        Params memory params;
        params.investmentAmount = investmentAmount;
        params.investmentToken = investmentToken;
        params.stage = SupplyChainStage.Production;
        params.metadata = metadata;
        params.yieldPercentage = yieldPercentage;
        params.duration = duration;
        
        _params[tokenId] = params;
        
        emit AssetCreated(tokenId, msg.sender, assetType);
    }

    /**
     * @dev Updates the token URI for existing assets
     */
    function setURI(uint256 tokenId, string memory uri) public whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev Allows an investor to fund a tokenized asset
     */
    function makeInvestment(uint256 tokenId) public whenNotPaused {
        // Check investor
        require(
            _params[tokenId].investor == address(0),
            "Already has investor"
        );
        // Check allowance
        require(
            IERC20(_params[tokenId].investmentToken).allowance(
                msg.sender,
                address(this)
            ) >= _params[tokenId].investmentAmount,
            "Insufficient allowance"
        );
        // Check balance
        require(
            IERC20(_params[tokenId].investmentToken).balanceOf(msg.sender) >=
                _params[tokenId].investmentAmount,
            "Insufficient balance"
        );
        // Send tokens to owner
        require(
            IERC20(_params[tokenId].investmentToken).transferFrom(
                msg.sender,
                ownerOf(tokenId),
                _params[tokenId].investmentAmount
            ),
            "Failed to transfer"
        );
        // Update params
        _params[tokenId].investor = msg.sender;
        
        emit InvestmentMade(tokenId, msg.sender, _params[tokenId].investmentAmount);
    }

    /**
     * @dev Allows a farmer to return the investment with profit
     * @param tokenId The ID of the tokenized asset
     * @param returnAmount The amount being returned to the investor
     */
    function returnInvestment(uint256 tokenId, uint256 returnAmount) public whenNotPaused {
        // Check owner
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        // Check investor
        require(_params[tokenId].investor != address(0), "No investor");
        // Check allowance
        require(
            IERC20(_params[tokenId].investmentToken).allowance(
                msg.sender,
                address(this)
            ) >= returnAmount,
            "Insufficient allowance"
        );
        // Check balance
        require(
            IERC20(_params[tokenId].investmentToken).balanceOf(msg.sender) >=
                returnAmount,
            "Insufficient balance"
        );
        // Send tokens to investor
        IERC20(_params[tokenId].investmentToken).transferFrom(
            msg.sender,
            _params[tokenId].investor,
            returnAmount
        );
        // Update params
        _params[tokenId].returnAmount = returnAmount;
        _params[tokenId].returnDate = block.timestamp;
        _params[tokenId].stage = SupplyChainStage.Completed;
        
        emit ReturnProcessed(tokenId, returnAmount, _params[tokenId].investor);
        emit StageUpdated(tokenId, SupplyChainStage.Completed);
    }

    /**
     * @dev Updates the supply chain stage of an asset
     */
    function updateStage(uint256 tokenId, SupplyChainStage newStage) public whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(_params[tokenId].stage != SupplyChainStage.Completed, "Supply chain is already completed");
        _params[tokenId].stage = newStage;
        emit StageUpdated(tokenId, newStage);
    }

    /**
     * @dev Verifies an asset's legitimacy by an authorized verifier
     */
    function verifyAsset(uint256 tokenId) public onlyRole(VERIFIER_ROLE) whenNotPaused {
        require(!_params[tokenId].metadata.verified, "Asset already verified");
        _params[tokenId].metadata.verified = true;
        emit AssetVerified(tokenId, msg.sender);
    }

    /**
     * @dev Pause all token transfers and operations
     */
    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers and operations
     */
    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Gets the next token ID to be used
     */
    function getNextTokenId() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Gets all parameters for a given token
     */
    function getParams(uint256 tokenId) public view returns (Params memory) {
        return _params[tokenId];
    }

    /**
     * @dev Gets the current supply chain stage of an asset
     */
    function getCurrentStage(uint256 tokenId) public view returns (SupplyChainStage) {
        return _params[tokenId].stage;
    }
    
    /**
     * @dev Gets the asset metadata
     */
    function getAssetMetadata(uint256 tokenId) public view returns (AssetMetadata memory) {
        return _params[tokenId].metadata;
    }
    
    /**
     * @dev Calculates the expected return amount based on investment parameters
     */
    function calculateExpectedReturn(uint256 tokenId) public view returns (uint256) {
        Params memory params = _params[tokenId];
        return params.investmentAmount + (params.investmentAmount * params.yieldPercentage / 10000);
    }

    /**
     * @dev Check if the contract supports a given interface
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
