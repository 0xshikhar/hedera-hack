# FileThetic Hedera Smart Contracts

Hedera-optimized smart contracts for the FileThetic AI data marketplace.

## 📦 Contracts

### 1. FiletheticMarketplace.sol
**Purpose**: Marketplace for trading AI dataset NFTs

**Features**:
- List dataset NFTs for sale
- Purchase datasets with HTS tokens
- Cancel listings
- Protocol fee collection (2.5%)
- Native HTS royalty support

**Key Functions**:
- `createListing()` - List a dataset NFT
- `purchaseListing()` - Buy a listed dataset
- `cancelListing()` - Cancel your listing
- `getListing()` - Get listing details

### 2. ProviderRegistry.sol
**Purpose**: Registry for AI infrastructure providers

**Features**:
- Provider registration with staking
- Uptime tracking and reporting
- Job completion recording
- Reward distribution
- Automatic slashing for low uptime

**Key Functions**:
- `registerProvider()` - Register as a provider
- `reportUptime()` - Report provider uptime
- `recordJob()` - Record completed job
- `claimRewards()` - Claim accumulated rewards

### 3. VerificationOracle.sol
**Purpose**: Decentralized verification for dataset quality

**Features**:
- Verifier registration with staking
- Multi-sig verification (minimum 3 verifiers)
- Quality scoring (0-100)
- Reputation system
- Consensus mechanism

**Key Functions**:
- `registerVerifier()` - Register as a verifier
- `requestVerification()` - Request dataset verification
- `submitVerification()` - Submit verification result
- `getVerificationResults()` - Get verification details

## 🚀 Deployment

### Prerequisites

1. **Compile contracts**:
```bash
cd contracts
forge build
```

2. **Set environment variables**:
```bash
HEDERA_ACCOUNT_ID="0.0.YOUR_ACCOUNT"
HEDERA_PRIVATE_KEY="your_private_key"
HEDERA_NETWORK="testnet"
```

3. **Ensure you have HBAR**:
```bash
# Check balance
bun run hedera:balance

# Get testnet HBAR if needed
# Visit: https://portal.hedera.com/faucet
```

### Deploy

```bash
# Deploy all contracts
node contracts/hedera/deploy.js
```

This will:
- Deploy FiletheticMarketplace
- Deploy ProviderRegistry
- Deploy VerificationOracle
- Update `hedera-config.json` with contract IDs

### Deployment Cost

Estimated costs on Hedera testnet:
- FiletheticMarketplace: ~5-10 HBAR
- ProviderRegistry: ~5-10 HBAR
- VerificationOracle: ~5-10 HBAR
- **Total**: ~15-30 HBAR

## 🧪 Testing

### Unit Tests

```bash
cd contracts
forge test
```

### Integration Tests

```bash
# Test marketplace
forge test --match-contract FiletheticMarketplaceTest

# Test provider registry
forge test --match-contract ProviderRegistryTest

# Test verification oracle
forge test --match-contract VerificationOracleTest
```

## 📊 Contract Architecture

```
FileThetic Smart Contracts
│
├── FiletheticMarketplace
│   ├── Listing Management
│   ├── Purchase Logic
│   ├── Fee Distribution
│   └── HTS Integration
│
├── ProviderRegistry
│   ├── Provider Registration
│   ├── Staking Mechanism
│   ├── Uptime Tracking
│   └── Reward Distribution
│
└── VerificationOracle
    ├── Verifier Registration
    ├── Verification Requests
    ├── Multi-sig Consensus
    └── Reputation System
```

## 🔗 Integration with HTS

These contracts are designed to work with Hedera Token Service (HTS):

- **Dataset NFTs**: HTS NFT collection (created via `init-hedera.ts`)
- **FILE Token**: HTS fungible token for utility
- **Payment Token**: HTS fungible token for payments

### HTS Precompile Integration

In production, these contracts will use HTS precompiles for:
- Token transfers
- NFT transfers
- Balance queries
- Token associations

Example:
```solidity
// Transfer HTS token (via precompile)
IHederaTokenService(HTS_PRECOMPILE).transferToken(
    tokenAddress,
    from,
    to,
    amount
);
```

## 🛠️ Development

### Add New Contract

1. Create contract in `contracts/hedera/`
2. Add deployment logic to `deploy.js`
3. Write tests in `contracts/test/`
4. Update this README

### Upgrade Contract

1. Deploy new version
2. Update `hedera-config.json`
3. Migrate data if needed
4. Update frontend integration

## 📝 Contract Addresses

After deployment, contract addresses are stored in `hedera-config.json`:

```json
{
  "contracts": {
    "marketplace": "0.0.XXXXXXX",
    "providerRegistry": "0.0.XXXXXXX",
    "verificationOracle": "0.0.XXXXXXX"
  }
}
```

## 🔒 Security

### Audits

- [ ] Internal security review
- [ ] External audit (recommended before mainnet)
- [ ] Bug bounty program

### Best Practices

- ✅ ReentrancyGuard on all state-changing functions
- ✅ Access control with Ownable
- ✅ Input validation
- ✅ Event emission for all important actions
- ✅ Custom errors for gas efficiency

## 📚 Resources

- [Hedera Smart Contract Service](https://docs.hedera.com/hedera/core-concepts/smart-contracts)
- [HTS Precompiles](https://docs.hedera.com/hedera/core-concepts/smart-contracts/hedera-token-service-system-contract)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## 🆘 Troubleshooting

### Deployment Fails

**Error**: `INSUFFICIENT_TX_FEE`
- **Solution**: Increase max transaction fee in deploy script

**Error**: `CONTRACT_BYTECODE_EMPTY`
- **Solution**: Run `forge build` to compile contracts

### Contract Interaction Fails

**Error**: `INVALID_CONTRACT_ID`
- **Solution**: Check contract ID in `hedera-config.json`

**Error**: `CONTRACT_REVERT_EXECUTED`
- **Solution**: Check function parameters and contract state

## 📞 Support

For issues or questions:
1. Check documentation
2. Review contract code
3. Test on testnet first
4. Open GitHub issue if needed

---

**Status**: Ready for deployment ✅  
**Network**: Hedera Testnet  
**Version**: 1.0.0
