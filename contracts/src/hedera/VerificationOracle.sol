// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VerificationOracle
 * @dev Oracle for AI dataset verification on FileThetic
 * @notice Manages verification submissions, multi-sig verification, and quality scoring
 */
contract VerificationOracle is Ownable, ReentrancyGuard {
    
    // ============ State Variables ============
    
    /// @notice Minimum verifiers required for consensus
    uint256 public minimumVerifiers = 3;
    
    /// @notice Minimum stake required to become a verifier (in FILE tokens)
    uint256 public verifierStake = 100 * 10**18; // 100 FILE tokens
    
    /// @notice HTS FILE token address
    address public fileToken;
    
    /// @notice Verification request counter
    uint256 private _verificationIdCounter;
    
    /// @notice Verifier counter
    uint256 private _verifierIdCounter;
    
    // ============ Structs ============
    
    struct VerificationRequest {
        uint256 verificationId;
        address requester;
        address nftToken;
        uint256 serialNumber;
        string ipfsCID;
        uint256 requestedAt;
        bool isComplete;
        uint256 finalScore; // 0-100
        uint256 verifierCount;
        mapping(address => bool) hasVerified;
        mapping(address => uint256) scores;
    }
    
    struct Verifier {
        uint256 verifierId;
        address verifierAddress;
        uint256 stakedAmount;
        uint256 totalVerifications;
        uint256 successfulVerifications;
        uint256 reputation; // 0-10000 (0-100%)
        bool isActive;
        bool isSlashed;
        uint256 registeredAt;
    }
    
    struct VerificationResult {
        uint256 verificationId;
        address verifier;
        uint256 score; // 0-100
        string report; // IPFS CID of detailed report
        uint256 timestamp;
        bool isValid;
    }
    
    // ============ Mappings ============
    
    /// @notice Mapping from verification ID to VerificationRequest
    mapping(uint256 => VerificationRequest) private verificationRequests;
    
    /// @notice Mapping from verifier address to Verifier
    mapping(address => Verifier) public verifiers;
    
    /// @notice Mapping from verifier ID to address
    mapping(uint256 => address) public verifierIdToAddress;
    
    /// @notice Mapping from verification ID to results
    mapping(uint256 => VerificationResult[]) public verificationResults;
    
    /// @notice Mapping from NFT to verification ID
    mapping(address => mapping(uint256 => uint256)) public nftToVerification;
    
    // ============ Events ============
    
    event VerifierRegistered(
        uint256 indexed verifierId,
        address indexed verifier,
        uint256 stakedAmount
    );
    
    event VerificationRequested(
        uint256 indexed verificationId,
        address indexed requester,
        address indexed nftToken,
        uint256 serialNumber,
        string ipfsCID
    );
    
    event VerificationSubmitted(
        uint256 indexed verificationId,
        address indexed verifier,
        uint256 score
    );
    
    event VerificationCompleted(
        uint256 indexed verificationId,
        uint256 finalScore,
        uint256 verifierCount
    );
    
    event VerifierSlashed(
        address indexed verifier,
        uint256 slashedAmount,
        string reason
    );
    
    event VerifierDeactivated(address indexed verifier);
    
    event VerifierReactivated(address indexed verifier);
    
    // ============ Errors ============
    
    error InsufficientStake();
    error VerifierAlreadyRegistered();
    error NotRegisteredVerifier();
    error VerifierNotActive();
    error VerificationNotFound();
    error AlreadyVerified();
    error VerificationAlreadyComplete();
    error InvalidScore();
    error NotVerificationRequester();
    error ZeroAddress();
    
    // ============ Constructor ============
    
    /**
     * @dev Initialize the verification oracle
     * @param _fileToken HTS FILE token address
     */
    constructor(address _fileToken) Ownable(msg.sender) {
        if (_fileToken == address(0)) revert ZeroAddress();
        fileToken = _fileToken;
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Register as a verifier
     * @param stakeAmount Amount of FILE tokens to stake
     * @return verifierId The ID of the registered verifier
     */
    function registerVerifier(uint256 stakeAmount) external nonReentrant returns (uint256) {
        if (stakeAmount < verifierStake) revert InsufficientStake();
        if (verifiers[msg.sender].verifierId != 0) revert VerifierAlreadyRegistered();
        
        // Note: Transfer FILE tokens via HTS precompile
        
        uint256 verifierId = ++_verifierIdCounter;
        
        verifiers[msg.sender] = Verifier({
            verifierId: verifierId,
            verifierAddress: msg.sender,
            stakedAmount: stakeAmount,
            totalVerifications: 0,
            successfulVerifications: 0,
            reputation: 10000, // Start at 100%
            isActive: true,
            isSlashed: false,
            registeredAt: block.timestamp
        });
        
        verifierIdToAddress[verifierId] = msg.sender;
        
        emit VerifierRegistered(verifierId, msg.sender, stakeAmount);
        
        return verifierId;
    }
    
    /**
     * @notice Request verification for a dataset NFT
     * @param nftToken HTS NFT token address
     * @param serialNumber NFT serial number
     * @param ipfsCID IPFS CID of the dataset
     * @return verificationId The ID of the verification request
     */
    function requestVerification(
        address nftToken,
        uint256 serialNumber,
        string calldata ipfsCID
    ) external nonReentrant returns (uint256) {
        uint256 verificationId = ++_verificationIdCounter;
        
        VerificationRequest storage request = verificationRequests[verificationId];
        request.verificationId = verificationId;
        request.requester = msg.sender;
        request.nftToken = nftToken;
        request.serialNumber = serialNumber;
        request.ipfsCID = ipfsCID;
        request.requestedAt = block.timestamp;
        request.isComplete = false;
        request.finalScore = 0;
        request.verifierCount = 0;
        
        nftToVerification[nftToken][serialNumber] = verificationId;
        
        emit VerificationRequested(verificationId, msg.sender, nftToken, serialNumber, ipfsCID);
        
        return verificationId;
    }
    
    /**
     * @notice Submit verification result
     * @param verificationId Verification request ID
     * @param score Quality score (0-100)
     * @param report IPFS CID of detailed verification report
     */
    function submitVerification(
        uint256 verificationId,
        uint256 score,
        string calldata report
    ) external nonReentrant {
        Verifier storage verifier = verifiers[msg.sender];
        if (verifier.verifierId == 0) revert NotRegisteredVerifier();
        if (!verifier.isActive) revert VerifierNotActive();
        if (score > 100) revert InvalidScore();
        
        VerificationRequest storage request = verificationRequests[verificationId];
        if (request.verificationId == 0) revert VerificationNotFound();
        if (request.isComplete) revert VerificationAlreadyComplete();
        if (request.hasVerified[msg.sender]) revert AlreadyVerified();
        
        // Record verification
        request.hasVerified[msg.sender] = true;
        request.scores[msg.sender] = score;
        request.verifierCount++;
        
        verificationResults[verificationId].push(VerificationResult({
            verificationId: verificationId,
            verifier: msg.sender,
            score: score,
            report: report,
            timestamp: block.timestamp,
            isValid: true
        }));
        
        verifier.totalVerifications++;
        
        emit VerificationSubmitted(verificationId, msg.sender, score);
        
        // Check if we have enough verifications for consensus
        if (request.verifierCount >= minimumVerifiers) {
            _finalizeVerification(verificationId);
        }
    }
    
    /**
     * @notice Get verification request details
     * @param verificationId Verification request ID
     * @return requester Address of requester
     * @return nftToken NFT token address
     * @return serialNumber NFT serial number
     * @return ipfsCID IPFS CID
     * @return isComplete Whether verification is complete
     * @return finalScore Final quality score
     * @return verifierCount Number of verifiers
     */
    function getVerificationRequest(uint256 verificationId) external view returns (
        address requester,
        address nftToken,
        uint256 serialNumber,
        string memory ipfsCID,
        bool isComplete,
        uint256 finalScore,
        uint256 verifierCount
    ) {
        VerificationRequest storage request = verificationRequests[verificationId];
        return (
            request.requester,
            request.nftToken,
            request.serialNumber,
            request.ipfsCID,
            request.isComplete,
            request.finalScore,
            request.verifierCount
        );
    }
    
    /**
     * @notice Get verification results
     * @param verificationId Verification request ID
     * @return Array of verification results
     */
    function getVerificationResults(uint256 verificationId) external view returns (VerificationResult[] memory) {
        return verificationResults[verificationId];
    }
    
    /**
     * @notice Get verifier details
     * @param verifierAddress Verifier address
     * @return Verifier struct
     */
    function getVerifier(address verifierAddress) external view returns (Verifier memory) {
        return verifiers[verifierAddress];
    }
    
    /**
     * @notice Get verifier success rate
     * @param verifierAddress Verifier address
     * @return Success rate percentage (0-10000)
     */
    function getVerifierSuccessRate(address verifierAddress) external view returns (uint256) {
        Verifier memory verifier = verifiers[verifierAddress];
        if (verifier.totalVerifications == 0) return 0;
        return (verifier.successfulVerifications * 10000) / verifier.totalVerifications;
    }
    
    /**
     * @notice Deactivate verifier
     */
    function deactivateVerifier() external {
        Verifier storage verifier = verifiers[msg.sender];
        if (verifier.verifierId == 0) revert NotRegisteredVerifier();
        
        verifier.isActive = false;
        
        emit VerifierDeactivated(msg.sender);
    }
    
    /**
     * @notice Reactivate verifier
     */
    function reactivateVerifier() external {
        Verifier storage verifier = verifiers[msg.sender];
        if (verifier.verifierId == 0) revert NotRegisteredVerifier();
        if (verifier.isSlashed) revert VerifierNotActive();
        
        verifier.isActive = true;
        
        emit VerifierReactivated(msg.sender);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Set minimum verifiers required
     * @param newMinimum New minimum verifier count
     */
    function setMinimumVerifiers(uint256 newMinimum) external onlyOwner {
        minimumVerifiers = newMinimum;
    }
    
    /**
     * @notice Set verifier stake requirement
     * @param newStake New stake amount
     */
    function setVerifierStake(uint256 newStake) external onlyOwner {
        verifierStake = newStake;
    }
    
    /**
     * @notice Slash a verifier for malicious behavior
     * @param verifierAddress Verifier address
     * @param reason Reason for slashing
     */
    function slashVerifier(address verifierAddress, string calldata reason) external onlyOwner {
        Verifier storage verifier = verifiers[verifierAddress];
        if (verifier.verifierId == 0) revert NotRegisteredVerifier();
        
        uint256 slashAmount = verifier.stakedAmount / 2; // Slash 50%
        verifier.stakedAmount -= slashAmount;
        verifier.isSlashed = true;
        verifier.isActive = false;
        verifier.reputation = verifier.reputation / 2; // Halve reputation
        
        emit VerifierSlashed(verifierAddress, slashAmount, reason);
    }
    
    /**
     * @notice Get total verifications
     * @return Total verification requests
     */
    function getTotalVerifications() external view returns (uint256) {
        return _verificationIdCounter;
    }
    
    /**
     * @notice Get total verifiers
     * @return Total registered verifiers
     */
    function getTotalVerifiers() external view returns (uint256) {
        return _verifierIdCounter;
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Finalize verification with consensus
     * @param verificationId Verification request ID
     */
    function _finalizeVerification(uint256 verificationId) internal {
        VerificationRequest storage request = verificationRequests[verificationId];
        
        // Calculate average score
        uint256 totalScore = 0;
        VerificationResult[] memory results = verificationResults[verificationId];
        
        for (uint256 i = 0; i < results.length; i++) {
            totalScore += results[i].score;
        }
        
        uint256 avgScore = totalScore / results.length;
        
        request.finalScore = avgScore;
        request.isComplete = true;
        
        // Update verifier reputations based on consensus
        for (uint256 i = 0; i < results.length; i++) {
            address verifierAddr = results[i].verifier;
            Verifier storage verifier = verifiers[verifierAddr];
            
            // If score is close to average, increase reputation
            uint256 scoreDiff = results[i].score > avgScore 
                ? results[i].score - avgScore 
                : avgScore - results[i].score;
            
            if (scoreDiff <= 10) { // Within 10 points
                verifier.successfulVerifications++;
                verifier.reputation = (verifier.reputation * 99 + 10000) / 100; // Increase reputation
            } else {
                // Decrease reputation for outliers
                verifier.reputation = (verifier.reputation * 99) / 100;
            }
        }
        
        emit VerificationCompleted(verificationId, avgScore, request.verifierCount);
    }
}
