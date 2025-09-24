import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  AccountId,
  PrivateKey,
  TokenId,
  TokenInfoQuery,
  AccountBalanceQuery,
  TokenAssociateTransaction,
  Hbar,
  CustomRoyaltyFee,
  CustomFixedFee,
} from '@hashgraph/sdk';
import { HederaClient } from './client';

export interface CreateTokenParams {
  name: string;
  symbol: string;
  decimals?: number;
  initialSupply?: number;
  maxSupply?: number;
  treasuryId?: AccountId;
  adminKey?: PrivateKey;
  supplyKey?: PrivateKey;
  freezeKey?: PrivateKey;
  wipeKey?: PrivateKey;
}

export interface CreateNFTParams {
  name: string;
  symbol: string;
  maxSupply?: number;
  treasuryId?: AccountId;
  adminKey?: PrivateKey;
  supplyKey?: PrivateKey;
  royaltyFee?: {
    numerator: number;
    denominator: number;
    fallbackFee?: number; // in HBAR
  };
}

export interface MintTokenParams {
  tokenId: TokenId;
  amount: number;
  supplyKey: PrivateKey;
}

export interface MintNFTParams {
  tokenId: TokenId;
  metadata: string | Buffer;
  supplyKey: PrivateKey;
}

export interface TransferTokenParams {
  tokenId: TokenId;
  fromAccountId: AccountId;
  toAccountId: AccountId;
  amount: number;
  fromPrivateKey?: PrivateKey;
}

export interface TransferNFTParams {
  tokenId: TokenId;
  serialNumber: number;
  fromAccountId: AccountId;
  toAccountId: AccountId;
  fromPrivateKey?: PrivateKey;
}

/**
 * Hedera Token Service (HTS) operations for FileThetic
 */
export class HederaTokenService {
  /**
   * Create a new fungible token (e.g., FILE utility token)
   */
  static async createFungibleToken(params: CreateTokenParams): Promise<TokenId> {
    const client = HederaClient.getClient();
    const operatorId = HederaClient.getOperatorId();
    const operatorKey = HederaClient.getOperatorKey();

    const {
      name,
      symbol,
      decimals = 18,
      initialSupply = 0,
      maxSupply,
      treasuryId = operatorId,
      adminKey = operatorKey,
      supplyKey = operatorKey,
    } = params;

    const transaction = new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setDecimals(decimals)
      .setInitialSupply(initialSupply)
      .setTreasuryAccountId(treasuryId)
      .setAdminKey(adminKey)
      .setSupplyKey(supplyKey)
      .setTokenType(TokenType.FungibleCommon);

    if (maxSupply) {
      transaction.setSupplyType(TokenSupplyType.Finite);
      transaction.setMaxSupply(maxSupply);
    } else {
      transaction.setSupplyType(TokenSupplyType.Infinite);
    }

    const txResponse = await transaction.freezeWith(client).execute(client);
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId;

    if (!tokenId) {
      throw new Error('Token creation failed: No token ID returned');
    }

    console.log(`✅ Created fungible token: ${tokenId.toString()}`);
    console.log(`   Name: ${name} (${symbol})`);
    console.log(`   Decimals: ${decimals}`);
    console.log(`   Initial Supply: ${initialSupply}`);

    return tokenId;
  }

  /**
   * Create a new NFT collection (e.g., Dataset NFTs)
   */
  static async createNFTCollection(params: CreateNFTParams): Promise<TokenId> {
    const client = HederaClient.getClient();
    const operatorId = HederaClient.getOperatorId();
    const operatorKey = HederaClient.getOperatorKey();

    const {
      name,
      symbol,
      maxSupply,
      treasuryId = operatorId,
      adminKey = operatorKey,
      supplyKey = operatorKey,
      royaltyFee,
    } = params;

    const transaction = new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(treasuryId)
      .setAdminKey(adminKey)
      .setSupplyKey(supplyKey);

    if (maxSupply) {
      transaction.setSupplyType(TokenSupplyType.Finite);
      transaction.setMaxSupply(maxSupply);
    } else {
      transaction.setSupplyType(TokenSupplyType.Infinite);
    }

    // Add royalty fee if specified
    if (royaltyFee) {
      const royalty = new CustomRoyaltyFee()
        .setNumerator(royaltyFee.numerator)
        .setDenominator(royaltyFee.denominator)
        .setFeeCollectorAccountId(treasuryId);

      if (royaltyFee.fallbackFee) {
        royalty.setFallbackFee(
          new CustomFixedFee().setHbarAmount(new Hbar(royaltyFee.fallbackFee))
        );
      }

      transaction.setCustomFees([royalty]);
    }

    const txResponse = await transaction.freezeWith(client).execute(client);
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId;

    if (!tokenId) {
      throw new Error('NFT collection creation failed: No token ID returned');
    }

    console.log(`✅ Created NFT collection: ${tokenId.toString()}`);
    console.log(`   Name: ${name} (${symbol})`);
    if (royaltyFee) {
      console.log(`   Royalty: ${royaltyFee.numerator}/${royaltyFee.denominator} (${(royaltyFee.numerator / royaltyFee.denominator * 100).toFixed(2)}%)`);
    }

    return tokenId;
  }

  /**
   * Mint fungible tokens
   */
  static async mintToken(params: MintTokenParams): Promise<string> {
    const client = HederaClient.getClient();
    const { tokenId, amount, supplyKey } = params;

    const transaction = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setAmount(amount)
      .freezeWith(client);

    const signedTx = await transaction.sign(supplyKey);
    const txResponse = await signedTx.execute(client);
    await txResponse.getReceipt(client);

    console.log(`✅ Minted ${amount} tokens for ${tokenId.toString()}`);
    return txResponse.transactionId.toString();
  }

  /**
   * Mint NFT with metadata
   */
  static async mintNFT(params: MintNFTParams): Promise<{ txId: string; serialNumber: number }> {
    const client = HederaClient.getClient();
    const { tokenId, metadata, supplyKey } = params;

    // Convert metadata to Buffer if it's a string
    const metadataBuffer = typeof metadata === 'string' ? Buffer.from(metadata) : metadata;

    const transaction = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .addMetadata(metadataBuffer)
      .freezeWith(client);

    const signedTx = await transaction.sign(supplyKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    const serialNumber = receipt.serials[0].toNumber();

    console.log(`✅ Minted NFT: ${tokenId.toString()} #${serialNumber}`);
    return {
      txId: txResponse.transactionId.toString(),
      serialNumber,
    };
  }

  /**
   * Transfer fungible tokens
   */
  static async transferToken(params: TransferTokenParams): Promise<string> {
    const client = HederaClient.getClient();
    const { tokenId, fromAccountId, toAccountId, amount, fromPrivateKey } = params;

    const transaction = await new TransferTransaction()
      .addTokenTransfer(tokenId, fromAccountId, -amount)
      .addTokenTransfer(tokenId, toAccountId, amount)
      .freezeWith(client);

    let txResponse;
    if (fromPrivateKey) {
      const signedTx = await transaction.sign(fromPrivateKey);
      txResponse = await signedTx.execute(client);
    } else {
      txResponse = await transaction.execute(client);
    }

    await txResponse.getReceipt(client);

    console.log(`✅ Transferred ${amount} tokens from ${fromAccountId.toString()} to ${toAccountId.toString()}`);
    return txResponse.transactionId.toString();
  }

  /**
   * Transfer NFT
   */
  static async transferNFT(params: TransferNFTParams): Promise<string> {
    const client = HederaClient.getClient();
    const { tokenId, serialNumber, fromAccountId, toAccountId, fromPrivateKey } = params;

    const transaction = await new TransferTransaction()
      .addNftTransfer(tokenId, serialNumber, fromAccountId, toAccountId)
      .freezeWith(client);

    let txResponse;
    if (fromPrivateKey) {
      const signedTx = await transaction.sign(fromPrivateKey);
      txResponse = await signedTx.execute(client);
    } else {
      txResponse = await transaction.execute(client);
    }

    await txResponse.getReceipt(client);

    console.log(`✅ Transferred NFT ${tokenId.toString()} #${serialNumber} from ${fromAccountId.toString()} to ${toAccountId.toString()}`);
    return txResponse.transactionId.toString();
  }

  /**
   * Associate token with account (required before receiving tokens)
   */
  static async associateToken(
    accountId: AccountId,
    tokenId: TokenId,
    accountKey: PrivateKey
  ): Promise<string> {
    const client = HederaClient.getClient();

    const transaction = await new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([tokenId])
      .freezeWith(client);

    const signedTx = await transaction.sign(accountKey);
    const txResponse = await signedTx.execute(client);
    await txResponse.getReceipt(client);

    console.log(`✅ Associated token ${tokenId.toString()} with account ${accountId.toString()}`);
    return txResponse.transactionId.toString();
  }

  /**
   * Get token info
   */
  static async getTokenInfo(tokenId: TokenId) {
    const client = HederaClient.getClient();
    const query = new TokenInfoQuery().setTokenId(tokenId);
    const info = await query.execute(client);
    return info;
  }

  /**
   * Get account token balance
   */
  static async getAccountBalance(accountId: AccountId, tokenId?: TokenId) {
    const client = HederaClient.getClient();
    const query = new AccountBalanceQuery().setAccountId(accountId);
    const balance = await query.execute(client);

    if (tokenId) {
      return balance.tokens?.get(tokenId)?.toNumber() || 0;
    }

    return {
      hbar: balance.hbars.toTinybars().toNumber(),
      tokens: balance.tokens,
    };
  }
}
