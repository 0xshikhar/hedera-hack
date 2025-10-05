// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FiletheticMarketplace
 * @dev Marketplace for trading AI dataset NFTs on Hedera
 * @notice Uses HTS (Hedera Token Service) for NFTs and tokens
 * @notice This contract handles listing, purchasing, and royalty distribution
 */
contract FiletheticMarketplace is Ownable, ReentrancyGuard {
    
    // ============ State Variables ============
    
    /// @notice Protocol fee percentage (in basis points, e.g. 250 = 2.5%)
    uint256 public protocolFeePercentage = 250; // 2.5%
    
    /// @notice Maximum protocol fee (10%)
    uint256 public constant MAX_PROTOCOL_FEE = 1000;
    
    /// @notice Protocol treasury address
    address public treasury;
    
    /// @notice HTS Dataset NFT token address
    address public datasetNFTToken;
    
    /// @notice HTS FILE token address (utility token)
    address public fileToken;
    
    /// @notice HTS Payment token address (HBAR or stablecoin)
    address public paymentToken;
    
    /// @notice Listing counter
    uint256 private _listingIdCounter;
    
    // ============ Structs ============
    
    struct Listing {
        uint256 listingId;
        address seller;
        address nftToken;
        uint256 serialNumber;
        uint256 price;
        address paymentToken;
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
    }
    
    struct Sale {
        uint256 saleId;
        uint256 listingId;
        address buyer;
        address seller;
        uint256 price;
        uint256 protocolFee;
        uint256 royaltyFee;
        uint256 timestamp;
    }
    
    // ============ Mappings ============
    
    /// @notice Mapping from listing ID to Listing
    mapping(uint256 => Listing) public listings;
    
    /// @notice Mapping from NFT token + serial to listing ID
    mapping(address => mapping(uint256 => uint256)) public nftToListing;
    
    /// @notice Mapping from sale ID to Sale
    mapping(uint256 => Sale) public sales;
    
    /// @notice Sale counter
    uint256 private _saleIdCounter;
    
    // ============ Events ============
    
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftToken,
        uint256 serialNumber,
        uint256 price,
        address paymentToken
    );
    
    event ListingCancelled(
        uint256 indexed listingId,
        address indexed seller
    );
    
    event ListingPurchased(
        uint256 indexed listingId,
        uint256 indexed saleId,
        address indexed buyer,
        address seller,
        uint256 price,
        uint256 protocolFee
    );
    
    event ProtocolFeeUpdated(uint256 oldFee, uint256 newFee);
    
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    
    // ============ Errors ============
    
    error InvalidPrice();
    error InvalidToken();
    error ListingNotActive();
    error NotListingSeller();
    error ListingExpired();
    error InsufficientPayment();
    error NFTAlreadyListed();
    error InvalidFeePercentage();
    error ZeroAddress();
    
    // ============ Constructor ============
    
    /**
     * @dev Initialize the marketplace
     * @param _treasury Protocol treasury address
     * @param _datasetNFTToken HTS Dataset NFT token address
     * @param _fileToken HTS FILE utility token address
     * @param _paymentToken HTS payment token address
     */
    constructor(
        address _treasury,
        address _datasetNFTToken,
        address _fileToken,
        address _paymentToken
    ) Ownable(msg.sender) {
        if (_treasury == address(0)) revert ZeroAddress();
        if (_datasetNFTToken == address(0)) revert ZeroAddress();
        if (_fileToken == address(0)) revert ZeroAddress();
        if (_paymentToken == address(0)) revert ZeroAddress();
        
        treasury = _treasury;
        datasetNFTToken = _datasetNFTToken;
        fileToken = _fileToken;
        paymentToken = _paymentToken;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Create a new listing for a dataset NFT
     * @param nftToken HTS NFT token address
     * @param serialNumber NFT serial number
     * @param price Listing price in payment token
     * @param _paymentToken Payment token address (HBAR or stablecoin)
     * @param duration Listing duration in seconds (0 = no expiration)
     * @return listingId The ID of the created listing
     */
    function createListing(
        address nftToken,
        uint256 serialNumber,
        uint256 price,
        address _paymentToken,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        if (price == 0) revert InvalidPrice();
        if (nftToken != datasetNFTToken) revert InvalidToken();
        if (_paymentToken != paymentToken && _paymentToken != fileToken) revert InvalidToken();
        if (nftToListing[nftToken][serialNumber] != 0) revert NFTAlreadyListed();
        
        // Note: In production, verify NFT ownership via HTS precompile
        // For now, we trust the caller owns the NFT
        
        uint256 listingId = ++_listingIdCounter;
        uint256 expiresAt = duration > 0 ? block.timestamp + duration : 0;
        
        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            nftToken: nftToken,
            serialNumber: serialNumber,
            price: price,
            paymentToken: _paymentToken,
            isActive: true,
            createdAt: block.timestamp,
            expiresAt: expiresAt
        });
        
        nftToListing[nftToken][serialNumber] = listingId;
        
        emit ListingCreated(listingId, msg.sender, nftToken, serialNumber, price, _paymentToken);
        
        return listingId;
    }
    
    /**
     * @notice Cancel an active listing
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        if (!listing.isActive) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotListingSeller();
        
        listing.isActive = false;
        delete nftToListing[listing.nftToken][listing.serialNumber];
        
        emit ListingCancelled(listingId, msg.sender);
    }
    
    /**
     * @notice Purchase a listed dataset NFT
     * @param listingId ID of the listing to purchase
     * @dev Buyer must have approved payment token transfer
     */
    function purchaseListing(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        
        if (!listing.isActive) revert ListingNotActive();
        if (listing.expiresAt > 0 && block.timestamp > listing.expiresAt) revert ListingExpired();
        
        uint256 price = listing.price;
        address seller = listing.seller;
        
        // Calculate fees
        uint256 protocolFee = (price * protocolFeePercentage) / 10000;
        uint256 sellerAmount = price - protocolFee;
        
        // Note: In production, handle HTS token transfers via precompiles
        // For now, we assume payment is handled externally
        
        // Mark listing as inactive
        listing.isActive = false;
        delete nftToListing[listing.nftToken][listing.serialNumber];
        
        // Record sale
        uint256 saleId = ++_saleIdCounter;
        sales[saleId] = Sale({
            saleId: saleId,
            listingId: listingId,
            buyer: msg.sender,
            seller: seller,
            price: price,
            protocolFee: protocolFee,
            royaltyFee: 0, // Royalties handled by HTS
            timestamp: block.timestamp
        });
        
        emit ListingPurchased(listingId, saleId, msg.sender, seller, price, protocolFee);
    }
    
    /**
     * @notice Get listing details
     * @param listingId ID of the listing
     * @return Listing struct
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }
    
    /**
     * @notice Get sale details
     * @param saleId ID of the sale
     * @return Sale struct
     */
    function getSale(uint256 saleId) external view returns (Sale memory) {
        return sales[saleId];
    }
    
    /**
     * @notice Check if NFT is listed
     * @param nftToken NFT token address
     * @param serialNumber NFT serial number
     * @return listingId (0 if not listed)
     */
    function getListingByNFT(address nftToken, uint256 serialNumber) external view returns (uint256) {
        return nftToListing[nftToken][serialNumber];
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update protocol fee percentage
     * @param newFeePercentage New fee percentage in basis points
     */
    function setProtocolFeePercentage(uint256 newFeePercentage) external onlyOwner {
        if (newFeePercentage > MAX_PROTOCOL_FEE) revert InvalidFeePercentage();
        
        uint256 oldFee = protocolFeePercentage;
        protocolFeePercentage = newFeePercentage;
        
        emit ProtocolFeeUpdated(oldFee, newFeePercentage);
    }
    
    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        
        address oldTreasury = treasury;
        treasury = newTreasury;
        
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }
    
    /**
     * @notice Get total number of listings
     * @return Total listings created
     */
    function getTotalListings() external view returns (uint256) {
        return _listingIdCounter;
    }
    
    /**
     * @notice Get total number of sales
     * @return Total sales completed
     */
    function getTotalSales() external view returns (uint256) {
        return _saleIdCounter;
    }
}
