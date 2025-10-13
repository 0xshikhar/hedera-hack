// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProviderRegistry
 * @dev Registry for AI infrastructure providers on FileThetic
 * @notice Manages provider registration, staking, uptime tracking, and rewards
 */
contract ProviderRegistry is Ownable, ReentrancyGuard {
    
    // ============ State Variables ============
    
    /// @notice Minimum stake required to register as a provider (in FILE tokens)
    uint256 public minimumStake = 1000 * 10**18; // 1000 FILE tokens
    
    /// @notice HTS FILE token address
    address public fileToken;
    
    /// @notice Provider counter
    uint256 private _providerIdCounter;
    
    /// @notice Reward pool balance
    uint256 public rewardPool;
    
    /// @notice Total staked amount
    uint256 public totalStaked;
    
    // ============ Structs ============
    
    struct Provider {
        uint256 providerId;
        address owner;
        string name;
        string endpoint; // API endpoint
        string[] capabilities; // e.g., ["openai", "claude", "gemini"]
        uint256 stakedAmount;
        uint256 uptime; // Percentage (0-10000 = 0-100%)
        uint256 totalJobs;
        uint256 successfulJobs;
        uint256 totalRewards;
        uint256 registeredAt;
        bool isActive;
        bool isSlashed;
    }
    
    struct UptimeReport {
        uint256 timestamp;
        uint256 uptime; // Percentage
        address reporter;
    }
    
    // ============ Mappings ============
    
    /// @notice Mapping from provider ID to Provider
    mapping(uint256 => Provider) public providers;
    
    /// @notice Mapping from owner address to provider ID
    mapping(address => uint256) public ownerToProvider;
    
    /// @notice Mapping from provider ID to uptime reports
    mapping(uint256 => UptimeReport[]) public uptimeReports;
    
    /// @notice Authorized uptime reporters
    mapping(address => bool) public authorizedReporters;
    
    // ============ Events ============
    
    event ProviderRegistered(
        uint256 indexed providerId,
        address indexed owner,
        string name,
        uint256 stakedAmount
    );
    
    event ProviderStakeIncreased(
        uint256 indexed providerId,
        uint256 amount,
        uint256 newTotal
    );
    
    event ProviderStakeWithdrawn(
        uint256 indexed providerId,
        uint256 amount,
        uint256 remaining
    );
    
    event ProviderDeactivated(uint256 indexed providerId);
    
    event ProviderReactivated(uint256 indexed providerId);
    
    event UptimeReported(
        uint256 indexed providerId,
        uint256 uptime,
        address indexed reporter
    );
    
    event JobCompleted(
        uint256 indexed providerId,
        bool success,
        uint256 reward
    );
    
    event ProviderSlashed(
        uint256 indexed providerId,
        uint256 slashedAmount,
        string reason
    );
    
    event RewardClaimed(
        uint256 indexed providerId,
        address indexed owner,
        uint256 amount
    );
    
    // ============ Errors ============
    
    error InsufficientStake();
    error ProviderAlreadyRegistered();
    error ProviderNotFound();
    error NotProviderOwner();
    error ProviderNotActive();
    error ProviderIsSlashed();
    error NotAuthorizedReporter();
    error InvalidUptime();
    error InsufficientRewardPool();
    error ZeroAddress();
    
    // ============ Constructor ============
    
    /**
     * @dev Initialize the provider registry
     * @param _fileToken HTS FILE token address
     */
    constructor(address _fileToken) Ownable(msg.sender) {
        if (_fileToken == address(0)) revert ZeroAddress();
        fileToken = _fileToken;
        authorizedReporters[msg.sender] = true;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Register as a new provider
     * @param name Provider name
     * @param endpoint API endpoint URL
     * @param capabilities Array of supported AI models
     * @param stakeAmount Amount of FILE tokens to stake
     * @return providerId The ID of the registered provider
     */
    function registerProvider(
        string calldata name,
        string calldata endpoint,
        string[] calldata capabilities,
        uint256 stakeAmount
    ) external nonReentrant returns (uint256) {
        if (stakeAmount < minimumStake) revert InsufficientStake();
        if (ownerToProvider[msg.sender] != 0) revert ProviderAlreadyRegistered();
        
        // Note: In production, transfer FILE tokens via HTS precompile
        // For now, we assume tokens are transferred externally
        
        uint256 providerId = ++_providerIdCounter;
        
        providers[providerId] = Provider({
            providerId: providerId,
            owner: msg.sender,
            name: name,
            endpoint: endpoint,
            capabilities: capabilities,
            stakedAmount: stakeAmount,
            uptime: 10000, // Start at 100%
            totalJobs: 0,
            successfulJobs: 0,
            totalRewards: 0,
            registeredAt: block.timestamp,
            isActive: true,
            isSlashed: false
        });
        
        ownerToProvider[msg.sender] = providerId;
        totalStaked += stakeAmount;
        
        emit ProviderRegistered(providerId, msg.sender, name, stakeAmount);
        
        return providerId;
    }
    
    /**
     * @notice Increase stake for a provider
     * @param providerId Provider ID
     * @param amount Amount to add to stake
     */
    function increaseStake(uint256 providerId, uint256 amount) external nonReentrant {
        Provider storage provider = providers[providerId];
        
        if (provider.providerId == 0) revert ProviderNotFound();
        if (provider.owner != msg.sender) revert NotProviderOwner();
        
        // Note: Transfer FILE tokens via HTS precompile
        
        provider.stakedAmount += amount;
        totalStaked += amount;
        
        emit ProviderStakeIncreased(providerId, amount, provider.stakedAmount);
    }
    
    /**
     * @notice Withdraw stake (partial or full)
     * @param providerId Provider ID
     * @param amount Amount to withdraw
     */
    function withdrawStake(uint256 providerId, uint256 amount) external nonReentrant {
        Provider storage provider = providers[providerId];
        
        if (provider.providerId == 0) revert ProviderNotFound();
        if (provider.owner != msg.sender) revert NotProviderOwner();
        if (provider.stakedAmount < amount) revert InsufficientStake();
        
        uint256 remaining = provider.stakedAmount - amount;
        if (provider.isActive && remaining < minimumStake) revert InsufficientStake();
        
        // Note: Transfer FILE tokens via HTS precompile
        
        provider.stakedAmount = remaining;
        totalStaked -= amount;
        
        if (remaining == 0) {
            provider.isActive = false;
        }
        
        emit ProviderStakeWithdrawn(providerId, amount, remaining);
    }
    
    /**
     * @notice Report uptime for a provider
     * @param providerId Provider ID
     * @param uptime Uptime percentage (0-10000 = 0-100%)
     */
    function reportUptime(uint256 providerId, uint256 uptime) external {
        if (!authorizedReporters[msg.sender]) revert NotAuthorizedReporter();
        if (uptime > 10000) revert InvalidUptime();
        
        Provider storage provider = providers[providerId];
        if (provider.providerId == 0) revert ProviderNotFound();
        
        // Update provider uptime (exponential moving average)
        provider.uptime = (provider.uptime * 9 + uptime) / 10;
        
        // Store report
        uptimeReports[providerId].push(UptimeReport({
            timestamp: block.timestamp,
            uptime: uptime,
            reporter: msg.sender
        }));
        
        // Slash if uptime is too low (< 90%)
        if (uptime < 9000 && !provider.isSlashed) {
            _slashProvider(providerId, "Low uptime");
        }
        
        emit UptimeReported(providerId, uptime, msg.sender);
    }
    
    /**
     * @notice Record a completed job
     * @param providerId Provider ID
     * @param success Whether the job was successful
     * @param reward Reward amount in FILE tokens
     */
    function recordJob(
        uint256 providerId,
        bool success,
        uint256 reward
    ) external onlyOwner {
        Provider storage provider = providers[providerId];
        
        if (provider.providerId == 0) revert ProviderNotFound();
        if (!provider.isActive) revert ProviderNotActive();
        
        provider.totalJobs++;
        if (success) {
            provider.successfulJobs++;
            provider.totalRewards += reward;
            rewardPool += reward;
        }
        
        emit JobCompleted(providerId, success, reward);
    }
    
    /**
     * @notice Claim accumulated rewards
     * @param providerId Provider ID
     */
    function claimRewards(uint256 providerId) external nonReentrant {
        Provider storage provider = providers[providerId];
        
        if (provider.providerId == 0) revert ProviderNotFound();
        if (provider.owner != msg.sender) revert NotProviderOwner();
        if (provider.isSlashed) revert ProviderIsSlashed();
        
        uint256 rewards = provider.totalRewards;
        if (rewards == 0) return;
        if (rewardPool < rewards) revert InsufficientRewardPool();
        
        // Note: Transfer FILE tokens via HTS precompile
        
        provider.totalRewards = 0;
        rewardPool -= rewards;
        
        emit RewardClaimed(providerId, msg.sender, rewards);
    }
    
    /**
     * @notice Deactivate provider
     * @param providerId Provider ID
     */
    function deactivateProvider(uint256 providerId) external {
        Provider storage provider = providers[providerId];
        
        if (provider.providerId == 0) revert ProviderNotFound();
        if (provider.owner != msg.sender) revert NotProviderOwner();
        
        provider.isActive = false;
        
        emit ProviderDeactivated(providerId);
    }
    
    /**
     * @notice Reactivate provider
     * @param providerId Provider ID
     */
    function reactivateProvider(uint256 providerId) external {
        Provider storage provider = providers[providerId];
        
        if (provider.providerId == 0) revert ProviderNotFound();
        if (provider.owner != msg.sender) revert NotProviderOwner();
        if (provider.stakedAmount < minimumStake) revert InsufficientStake();
        if (provider.isSlashed) revert ProviderIsSlashed();
        
        provider.isActive = true;
        
        emit ProviderReactivated(providerId);
    }
    
    /**
     * @notice Get provider details
     * @param providerId Provider ID
     * @return Provider struct
     */
    function getProvider(uint256 providerId) external view returns (Provider memory) {
        return providers[providerId];
    }
    
    /**
     * @notice Get provider success rate
     * @param providerId Provider ID
     * @return Success rate percentage (0-10000)
     */
    function getSuccessRate(uint256 providerId) external view returns (uint256) {
        Provider memory provider = providers[providerId];
        if (provider.totalJobs == 0) return 0;
        return (provider.successfulJobs * 10000) / provider.totalJobs;
    }
    
    /**
     * @notice Get uptime reports for a provider
     * @param providerId Provider ID
     * @return Array of uptime reports
     */
    function getUptimeReports(uint256 providerId) external view returns (UptimeReport[] memory) {
        return uptimeReports[providerId];
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Set minimum stake requirement
     * @param newMinimum New minimum stake amount
     */
    function setMinimumStake(uint256 newMinimum) external onlyOwner {
        minimumStake = newMinimum;
    }
    
    /**
     * @notice Add authorized uptime reporter
     * @param reporter Reporter address
     */
    function addReporter(address reporter) external onlyOwner {
        authorizedReporters[reporter] = true;
    }
    
    /**
     * @notice Remove authorized uptime reporter
     * @param reporter Reporter address
     */
    function removeReporter(address reporter) external onlyOwner {
        authorizedReporters[reporter] = false;
    }
    
    /**
     * @notice Fund reward pool
     * @param amount Amount to add to reward pool
     */
    function fundRewardPool(uint256 amount) external onlyOwner {
        // Note: Transfer FILE tokens via HTS precompile
        rewardPool += amount;
    }
    
    /**
     * @notice Get total number of providers
     * @return Total providers registered
     */
    function getTotalProviders() external view returns (uint256) {
        return _providerIdCounter;
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Slash a provider's stake
     * @param providerId Provider ID
     * @param reason Reason for slashing
     */
    function _slashProvider(uint256 providerId, string memory reason) internal {
        Provider storage provider = providers[providerId];
        
        uint256 slashAmount = provider.stakedAmount / 10; // Slash 10%
        provider.stakedAmount -= slashAmount;
        provider.isSlashed = true;
        provider.isActive = false;
        totalStaked -= slashAmount;
        
        emit ProviderSlashed(providerId, slashAmount, reason);
    }
}
