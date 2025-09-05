import { SorobanRpc, Networks, TransactionBuilder, Keypair, Contract, xdr } from '@stellar/stellar-sdk';
import { config } from '@/lib/config';

// KALE Protocol Integration Service
// Based on KALE proof-of-teamwork farming token on Stellar
export class KaleIntegrationService {
  private readonly rpcUrl: string;
  private readonly networkPassphrase: string;
  private readonly kaleContractId: string;
  private readonly kaleTokenId: string;
  private readonly server: SorobanRpc.Server;

  constructor() {
    this.rpcUrl = config.soroban.rpcUrl;
    this.networkPassphrase = config.soroban.networkPassphrase;
    this.kaleContractId = config.soroban.kaleContractId || 'CDBG4XY2T5RRPH7HKGZIWMR2MFPLC6RJ453ITXQGNQXG6LNVL4375MRJ'; // Testnet
    this.kaleTokenId = config.soroban.kaleTokenId || 'CDL74RF5BLYR2YBLCCI7F5FB6TPSCLKEJUBSD2RSVWZ4YHF3VMFAIGWA'; // Mainnet
    this.server = new SorobanRpc.Server(this.rpcUrl);
  }

  // Get KALE token balance for a user
  async getKaleBalance(userAddress: string): Promise<number> {
    try {
      if (!this.kaleTokenId) {
        throw new Error('KALE token contract not configured');
      }

      const contract = new Contract(this.kaleTokenId);
      const result = await contract.call('balance', userAddress);
      return parseInt(result.toString()) / 10000000; // Convert from stroops
    } catch (error) {
      console.error('Error getting KALE balance:', error);
      return 0;
    }
  }

  // Get stake information for a user
  async getStakeInfo(publicKey: string) {
    try {
      if (!this.kaleContractId) {
        throw new Error('KALE contract not configured');
      }

      const contract = new Contract(this.kaleContractId);
      
      // Get stake info from contract
      const stakeInfo = await contract.call('get_stake_info', publicKey);
      
      return {
        staker: publicKey,
        amount: stakeInfo.amount || 0,
        stakeTime: stakeInfo.stake_time || 0,
        lastRewardTime: stakeInfo.last_reward_time || 0,
        accumulatedRewards: stakeInfo.accumulated_rewards || 0,
        apy: stakeInfo.apy || 0,
      };
    } catch (error) {
      console.error('Error getting stake info:', error);
      return {
        staker: publicKey,
        amount: 0,
        stakeTime: 0,
        lastRewardTime: 0,
        accumulatedRewards: 0,
        apy: 0,
      };
    }
  }

  // Get overall staking statistics
  async getStakingStats() {
    try {
      if (!this.kaleContractId) {
        throw new Error('KALE contract not configured');
      }

      const contract = new Contract(this.kaleContractId);
      const stats = await contract.call('get_staking_stats');
      
      return {
        totalStaked: stats.total_staked || 0,
        totalStakers: stats.total_stakers || 0,
        averageAPY: stats.average_apy || 0,
        totalRewardsDistributed: stats.total_rewards_distributed || 0,
      };
    } catch (error) {
      console.error('Error getting staking stats:', error);
      return {
        totalStaked: 0,
        totalStakers: 0,
        averageAPY: 0,
        totalRewardsDistributed: 0,
      };
    }
  }

  // Plant (stake) KALE tokens - KALE farming step 1
  async plant(userAddress: string, amount: number, signTransaction: (tx: string) => Promise<string>) {
    try {
      if (!this.kaleContractId) {
        throw new Error('KALE contract not configured');
      }

      const contract = new Contract(this.kaleContractId);
      
      // Build transaction to call plant function
      const account = await this.server.getAccount(userAddress);
      const transaction = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call('plant', userAddress, amount * 10000000)) // Convert to stroops
        .setTimeout(30)
        .build();

      // Sign and submit transaction
      const signedTx = await signTransaction(transaction.toXDR());
      const result = await this.server.sendTransaction(signedTx);
      
      return {
        success: true,
        stakeId: result.hash,
        transactionHash: result.hash,
      };
    } catch (error) {
      console.error('Error planting KALE:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Work (proof-of-work) - KALE farming step 2
  async work(userAddress: string, stakeId: string, nonce: number, entropy: string, signTransaction: (tx: string) => Promise<string>) {
    try {
      if (!this.kaleContractId) {
        throw new Error('KALE contract not configured');
      }

      const contract = new Contract(this.kaleContractId);
      
      // Convert entropy string to BytesN<32>
      const entropyBytes = Buffer.from(entropy, 'hex');
      
      const account = await this.server.getAccount(userAddress);
      const transaction = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call('work', userAddress, nonce, entropyBytes))
        .setTimeout(30)
        .build();

      const signedTx = await signTransaction(transaction.toXDR());
      const result = await this.server.sendTransaction(signedTx);
      
      return {
        success: true,
        reward: 0, // Will be calculated by contract
        transactionHash: result.hash,
      };
    } catch (error) {
      console.error('Error working KALE:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Harvest (claim rewards) - KALE farming step 3
  async harvest(userAddress: string, stakeId: string, signTransaction: (tx: string) => Promise<string>) {
    try {
      if (!this.kaleContractId) {
        throw new Error('KALE contract not configured');
      }

      const contract = new Contract(this.kaleContractId);
      
      const account = await this.server.getAccount(userAddress);
      const transaction = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call('harvest', userAddress))
        .setTimeout(30)
        .build();

      const signedTx = await signTransaction(transaction.toXDR());
      const result = await this.server.sendTransaction(signedTx);
      
      return {
        success: true,
        harvestedAmount: 0, // Will be returned by contract
        transactionHash: result.hash,
      };
    } catch (error) {
      console.error('Error harvesting KALE:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Transfer KALE tokens
  async transferKale(from: string, to: string, amount: number, signTransaction: (tx: string) => Promise<string>) {
    try {
      if (!this.kaleTokenId) {
        throw new Error('KALE token contract not configured');
      }

      const contract = new Contract(this.kaleTokenId);
      
      const account = await this.server.getAccount(from);
      const transaction = new TransactionBuilder(account, {
        fee: '10000',
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contract.call('transfer', from, to, amount * 10000000)) // Convert to stroops
        .setTimeout(30)
        .build();

      const signedTx = await signTransaction(transaction.toXDR());
      const result = await this.server.sendTransaction(signedTx);
      
      return {
        success: true,
        transactionHash: result.hash,
        message: 'Transfer successful',
      };
    } catch (error) {
      console.error('Error transferring KALE:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Generate proof-of-work hash (off-chain computation)
  async generateProofOfWork(previousBlockHash: string, nonce: number, farmerAddress: string): Promise<string> {
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(previousBlockHash + nonce.toString() + farmerAddress);
    return hash.digest('hex');
  }

  // Find nonce with required difficulty (proof-of-work)
  async findNonce(previousBlockHash: string, farmerAddress: string, difficulty: number = 4): Promise<number> {
    let nonce = 0;
    const targetPrefix = '0'.repeat(difficulty);
    
    while (true) {
      const hash = await this.generateProofOfWork(previousBlockHash, nonce, farmerAddress);
      if (hash.startsWith(targetPrefix)) {
        return nonce;
      }
      nonce++;
      
      // Prevent infinite loop
      if (nonce > 1000000) {
        throw new Error('Proof-of-work timeout');
      }
    }
  }
}

export const kaleIntegrationService = new KaleIntegrationService();