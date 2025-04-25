// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./RWAFarmersToken.sol";

/**
 * @title Indonesian Farmland Registry
 * @dev Contract to manage and verify farmland registration in Indonesia
 */
contract IndonesianFarmlandRegistry is AccessControl, Pausable {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant GOVERNMENT_ROLE = keccak256("GOVERNMENT_ROLE");

    // State variables
    RWAFarmersToken public farmersToken;
    Counters.Counter private _farmlandIdCounter;

    struct Location {
        string latitude;
        string longitude;
        string province;
        string district;
        string subDistrict;
        string postalCode;
    }

    struct FarmlandDetails {
        uint256 farmlandId;
        uint256 tokenId; // Associated NFT token ID
        address owner;
        string landCertificateId; // Government-issued land certificate number
        uint256 area; // Area in square meters
        Location location;
        string soilType;
        string[] crops; // Types of crops that can be grown
        bool isVerified;
        address verifier;
        uint256 registeredAt;
        uint256 lastUpdatedAt;
    }

    // Mappings
    mapping(uint256 => FarmlandDetails) public farmlands; // farmlandId => FarmlandDetails
    mapping(string => bool) public registeredCertificates; // landCertificateId => exists
    mapping(uint256 => uint256) public tokenToFarmland; // tokenId => farmlandId
    mapping(address => uint256[]) public ownerFarmlands; // owner => farmlandIds

    // Events
    event FarmlandRegistered(
        uint256 indexed farmlandId,
        uint256 indexed tokenId,
        address indexed owner,
        string landCertificateId,
        uint256 area
    );
    event FarmlandVerified(
        uint256 indexed farmlandId,
        address indexed verifier,
        uint256 timestamp
    );
    event FarmlandTransferred(
        uint256 indexed farmlandId,
        address indexed previousOwner,
        address indexed newOwner
    );
    event FarmlandUpdated(
        uint256 indexed farmlandId,
        address indexed updater,
        uint256 timestamp
    );

    /**
     * @dev Constructor
     * @param _farmersToken Address of the RWAFarmersToken contract
     */
    constructor(address _farmersToken) {
        require(_farmersToken != address(0), "Invalid token address");
        
        farmersToken = RWAFarmersToken(_farmersToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Registers a new farmland
     * @param landCertificateId Government-issued land certificate number
     * @param area Area in square meters
     * @param latitude Latitude coordinates
     * @param longitude Longitude coordinates
     * @param province Province name
     * @param district District name
     * @param subDistrict Sub-district name
     * @param postalCode Postal code
     * @param soilType Type of soil
     * @param crops Types of crops that can be grown
     * @param tokenURI IPFS URI for the NFT metadata
     */
    function registerFarmland(
        string memory landCertificateId,
        uint256 area,
        string memory latitude,
        string memory longitude,
        string memory province,
        string memory district,
        string memory subDistrict,
        string memory postalCode,
        string memory soilType,
        string[] memory crops,
        string memory tokenURI
    ) external whenNotPaused {
        require(bytes(landCertificateId).length > 0, "Invalid certificate ID");
        require(!registeredCertificates[landCertificateId], "Certificate already registered");
        require(area > 0, "Area must be greater than zero");
        
        // Create location
        Location memory location = Location({
            latitude: latitude,
            longitude: longitude,
            province: province,
            district: district,
            subDistrict: subDistrict,
            postalCode: postalCode
        });
        
        // Create farmland ID
        uint256 farmlandId = _farmlandIdCounter.current();
        _farmlandIdCounter.increment();
        
        // Create NFT for the farmland
        farmersToken.createAsset(
            0, // No investment required initially
            address(0), // No investment token specified initially
            tokenURI,
            string.concat(latitude, ",", longitude),
            area,
            string.concat("Farmland: ", province, ", ", district),
            RWAFarmersToken.AssetType.Farmland,
            0, // No yield percentage initially
            0 // No duration initially
        );
        
        uint256 tokenId = farmersToken.getNextTokenId() - 1;
        
        // Create farmland details
        FarmlandDetails memory details = FarmlandDetails({
            farmlandId: farmlandId,
            tokenId: tokenId,
            owner: msg.sender,
            landCertificateId: landCertificateId,
            area: area,
            location: location,
            soilType: soilType,
            crops: crops,
            isVerified: false,
            verifier: address(0),
            registeredAt: block.timestamp,
            lastUpdatedAt: block.timestamp
        });
        
        // Save farmland details
        farmlands[farmlandId] = details;
        registeredCertificates[landCertificateId] = true;
        tokenToFarmland[tokenId] = farmlandId;
        ownerFarmlands[msg.sender].push(farmlandId);
        
        emit FarmlandRegistered(farmlandId, tokenId, msg.sender, landCertificateId, area);
    }

    /**
     * @dev Verifies a farmland registration
     * @param farmlandId ID of the farmland to verify
     */
    function verifyFarmland(uint256 farmlandId) external whenNotPaused onlyRole(VERIFIER_ROLE) {
        FarmlandDetails storage details = farmlands[farmlandId];
        require(details.farmlandId == farmlandId, "Farmland does not exist");
        require(!details.isVerified, "Farmland already verified");
        
        details.isVerified = true;
        details.verifier = msg.sender;
        details.lastUpdatedAt = block.timestamp;
        
        // Also verify the associated token
        farmersToken.verifyAsset(details.tokenId);
        
        emit FarmlandVerified(farmlandId, msg.sender, block.timestamp);
    }

    /**
     * @dev Updates farmland details
     * @param farmlandId ID of the farmland to update
     * @param soilType New soil type
     * @param crops New crop types
     */
    function updateFarmlandDetails(
        uint256 farmlandId,
        string memory soilType,
        string[] memory crops
    ) external whenNotPaused {
        FarmlandDetails storage details = farmlands[farmlandId];
        require(details.farmlandId == farmlandId, "Farmland does not exist");
        require(details.owner == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        
        details.soilType = soilType;
        details.crops = crops;
        details.lastUpdatedAt = block.timestamp;
        
        emit FarmlandUpdated(farmlandId, msg.sender, block.timestamp);
    }

    /**
     * @dev Transfers ownership of a farmland when the NFT is transferred
     * @notice This function should be called by the NFT contract after a transfer
     * @param tokenId ID of the token being transferred
     * @param from Previous owner
     * @param to New owner
     */
    function transferFarmlandOwnership(
        uint256 tokenId,
        address from,
        address to
    ) external whenNotPaused {
        require(msg.sender == address(farmersToken), "Only token contract can call");
        
        uint256 farmlandId = tokenToFarmland[tokenId];
        FarmlandDetails storage details = farmlands[farmlandId];
        require(details.farmlandId == farmlandId, "Farmland does not exist");
        
        // Update owner
        details.owner = to;
        details.lastUpdatedAt = block.timestamp;
        
        // Update owner mappings
        uint256[] storage fromFarmlands = ownerFarmlands[from];
        uint256[] storage toFarmlands = ownerFarmlands[to];
        
        // Remove from previous owner
        for (uint256 i = 0; i < fromFarmlands.length; i++) {
            if (fromFarmlands[i] == farmlandId) {
                fromFarmlands[i] = fromFarmlands[fromFarmlands.length - 1];
                fromFarmlands.pop();
                break;
            }
        }
        
        // Add to new owner
        toFarmlands.push(farmlandId);
        
        emit FarmlandTransferred(farmlandId, from, to);
    }

    /**
     * @dev Gets all farmlands owned by an address
     * @param owner Address of the owner
     * @return Array of farmland IDs
     */
    function getFarmlandsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerFarmlands[owner];
    }

    /**
     * @dev Gets farmland details by ID
     * @param farmlandId ID of the farmland
     * @return The farmland details
     */
    function getFarmlandDetails(uint256 farmlandId) external view returns (FarmlandDetails memory) {
        return farmlands[farmlandId];
    }

    /**
     * @dev Gets farmland ID from token ID
     * @param tokenId NFT token ID
     * @return farmlandId Corresponding farmland ID
     */
    function getFarmlandIdByToken(uint256 tokenId) external view returns (uint256) {
        return tokenToFarmland[tokenId];
    }

    /**
     * @dev Checks if a land certificate is registered
     * @param landCertificateId Certificate ID to check
     * @return True if registered, false otherwise
     */
    function isCertificateRegistered(string memory landCertificateId) external view returns (bool) {
        return registeredCertificates[landCertificateId];
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Grants a role to an account
     * @param role Role to grant
     * @param account Account to receive the role
     */
    function grantRole(bytes32 role, address account) public override onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, account);
    }
} 