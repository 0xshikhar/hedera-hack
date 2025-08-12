// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FiletheticStorageNetwork
 * @dev DePIN storage provider registry for FileThetic
 * Tracks decentralized IPFS storage providers contributing to the network
 */
contract FiletheticStorageNetwork is Ownable {
    
    struct StorageProvider {
        address provider;
        uint256 stakedAmount;
        uint256 bandwidthMbps;
        uint256 storageTB;
        uint256 uptime; // Basis points (10000 = 100%)
        string ipfsGateway;
        string location;
        bool isActive;
        uint256 registeredAt;
        uint256 totalEarnings;
        uint256 datasetsHosted;
    }
    
    // Mapping from provider address to provider info
    mapping(address => StorageProvider) public providers;
    
    // Array of all provider addresses for enumeration
    address[] public providerAddresses;
    
    // Mapping to check if address is already a provider
    mapping(address => bool) public isProvider;
    
    // Minimum stake required to become a provider (in wei)
    uint256 public minStakeAmount = 0.1 ether;
    
    // Total network statistics
    uint256 public totalBandwidth;
    uint256 public totalStorage;
    uint256 public activeProviderCount;
    
    // Events
    event ProviderRegistered(
        address indexed provider,
        uint256 bandwidth,
        uint256 storageCapacity,
        string location
    );
    event ProviderUpdated(address indexed provider, uint256 uptime);
    event ProviderDeactivated(address indexed provider);
    event ProviderReactivated(address indexed provider);
    event StakeIncreased(address indexed provider, uint256 amount);
    event RewardClaimed(address indexed provider, uint256 amount);
    
    // Errors
    error InsufficientStake();
    error AlreadyRegistered();
    error NotRegistered();
    error InvalidParameters();
    error NotActive();
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register as a storage provider
     * @param bandwidthMbps Bandwidth capacity in Mbps
     * @param storageTB Storage capacity in TB
     * @param ipfsGateway IPFS gateway URL
     * @param location Geographic location
     */
    function registerAsProvider(
        uint256 bandwidthMbps,
        uint256 storageTB,
        string calldata ipfsGateway,
        string calldata location
    ) external payable {
        if (msg.value < minStakeAmount) revert InsufficientStake();
        if (isProvider[msg.sender]) revert AlreadyRegistered();
        if (bandwidthMbps == 0 || storageTB == 0) revert InvalidParameters();
        
        providers[msg.sender] = StorageProvider({
            provider: msg.sender,
            stakedAmount: msg.value,
            bandwidthMbps: bandwidthMbps,
            storageTB: storageTB,
            uptime: 10000, // Start at 100%
            ipfsGateway: ipfsGateway,
            location: location,
            isActive: true,
            registeredAt: block.timestamp,
            totalEarnings: 0,
            datasetsHosted: 0
        });
        
        providerAddresses.push(msg.sender);
        isProvider[msg.sender] = true;
        
        totalBandwidth += bandwidthMbps;
        totalStorage += storageTB;
        activeProviderCount++;
        
        emit ProviderRegistered(msg.sender, bandwidthMbps, storageTB, location);
    }
    
    /**
     * @dev Update provider status and uptime
     * @param uptime New uptime in basis points (10000 = 100%)
     */
    function updateProviderStatus(uint256 uptime) external {
        if (!isProvider[msg.sender]) revert NotRegistered();
        if (uptime > 10000) revert InvalidParameters();
        
        StorageProvider storage provider = providers[msg.sender];
        provider.uptime = uptime;
        
        emit ProviderUpdated(msg.sender, uptime);
    }
    
    /**
     * @dev Increase stake amount
     */
    function increaseStake() external payable {
        if (!isProvider[msg.sender]) revert NotRegistered();
        if (msg.value == 0) revert InvalidParameters();
        
        StorageProvider storage provider = providers[msg.sender];
        provider.stakedAmount += msg.value;
        
        emit StakeIncreased(msg.sender, msg.value);
    }
    
    /**
     * @dev Deactivate provider (keeps data but stops accepting new work)
     */
    function deactivateProvider() external {
        if (!isProvider[msg.sender]) revert NotRegistered();
        
        StorageProvider storage provider = providers[msg.sender];
        if (!provider.isActive) revert NotActive();
        
        provider.isActive = false;
        totalBandwidth -= provider.bandwidthMbps;
        totalStorage -= provider.storageTB;
        activeProviderCount--;
        
        emit ProviderDeactivated(msg.sender);
    }
    
    /**
     * @dev Reactivate provider
     */
    function reactivateProvider() external {
        if (!isProvider[msg.sender]) revert NotRegistered();
        
        StorageProvider storage provider = providers[msg.sender];
        if (provider.isActive) revert InvalidParameters();
        
        provider.isActive = true;
        totalBandwidth += provider.bandwidthMbps;
        totalStorage += provider.storageTB;
        activeProviderCount++;
        
        emit ProviderReactivated(msg.sender);
    }
    
    /**
     * @dev Record that a provider is hosting a dataset
     * @param providerAddress Address of the provider
     */
    function recordDatasetHosted(address providerAddress) external {
        if (!isProvider[providerAddress]) revert NotRegistered();
        
        StorageProvider storage provider = providers[providerAddress];
        provider.datasetsHosted++;
    }
    
    /**
     * @dev Distribute rewards to a provider (called by main contract)
     * @param providerAddress Address of the provider
     * @param amount Reward amount
     */
    function distributeReward(address providerAddress, uint256 amount) external payable {
        if (!isProvider[providerAddress]) revert NotRegistered();
        
        StorageProvider storage provider = providers[providerAddress];
        provider.totalEarnings += amount;
    }
    
    /**
     * @dev Claim accumulated rewards
     */
    function claimRewards() external {
        if (!isProvider[msg.sender]) revert NotRegistered();
        
        StorageProvider storage provider = providers[msg.sender];
        uint256 rewards = provider.totalEarnings;
        
        if (rewards == 0) revert InvalidParameters();
        
        provider.totalEarnings = 0;
        payable(msg.sender).transfer(rewards);
        
        emit RewardClaimed(msg.sender, rewards);
    }
    
    /**
     * @dev Get provider count
     */
    function getProviderCount() external view returns (uint256) {
        return providerAddresses.length;
    }
    
    /**
     * @dev Get provider by index
     */
    function getProviderByIndex(uint256 index) external view returns (StorageProvider memory) {
        if (index >= providerAddresses.length) revert InvalidParameters();
        return providers[providerAddresses[index]];
    }
    
    /**
     * @dev Get provider by address
     */
    function getProvider(address providerAddress) external view returns (StorageProvider memory) {
        if (!isProvider[providerAddress]) revert NotRegistered();
        return providers[providerAddress];
    }
    
    /**
     * @dev Get all active providers
     */
    function getActiveProviders() external view returns (address[] memory) {
        address[] memory activeProviders = new address[](activeProviderCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < providerAddresses.length; i++) {
            if (providers[providerAddresses[i]].isActive) {
                activeProviders[currentIndex] = providerAddresses[i];
                currentIndex++;
            }
        }
        
        return activeProviders;
    }
    
    /**
     * @dev Update minimum stake amount (only owner)
     */
    function setMinStakeAmount(uint256 newAmount) external onlyOwner {
        minStakeAmount = newAmount;
    }
    
    /**
     * @dev Get network statistics
     */
    function getNetworkStats() external view returns (
        uint256 totalProviders,
        uint256 activeProviders,
        uint256 networkBandwidth,
        uint256 networkStorage
    ) {
        return (
            providerAddresses.length,
            activeProviderCount,
            totalBandwidth,
            totalStorage
        );
    }
}
