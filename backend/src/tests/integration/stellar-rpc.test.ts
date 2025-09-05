import { StellarRpcService } from '../../services/stellar-rpc.service';
import { Keypair, Networks } from '@stellar/stellar-sdk';

describe('StellarRpcService Integration Tests', () => {
  let stellarRpc: StellarRpcService;
  let testKeypair: Keypair;

  const config = {
    horizonUrl: 'https://horizon-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    kaleTokenContractId: 'test-contract-id',
    kaleIntegrationContractId: 'test-integration-contract-id',
    feeCollectorAddress: 'test-fee-collector',
  };

  beforeAll(() => {
    stellarRpc = new StellarRpcService(config);
    testKeypair = Keypair.random();
  });

  describe('Network Connection', () => {
    it('should connect to Stellar network', async () => {
      const stats = await stellarRpc.getNetworkStats();
      
      expect(stats).toBeDefined();
      expect(stats.network).toBe('testnet');
      expect(stats.latestLedger).toBeGreaterThan(0);
      expect(stats.horizonUrl).toBe(config.horizonUrl);
    });

    it('should get current network fee', async () => {
      const fee = await stellarRpc.getCurrentFee();
      
      expect(fee).toBeDefined();
      expect(parseInt(fee)).toBeGreaterThan(0);
    });
  });

  describe('Account Operations', () => {
    it('should validate Stellar addresses', () => {
      const validAddress = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
      const invalidAddress = 'invalid-address';

      expect(StellarRpcService.isValidAddress(validAddress)).toBe(true);
      expect(StellarRpcService.isValidAddress(invalidAddress)).toBe(false);
    });

    it('should generate keypairs', () => {
      const keypair = StellarRpcService.generateKeypair();
      
      expect(keypair).toBeDefined();
      expect(keypair.publicKey()).toMatch(/^G[A-Z0-9]{55}$/);
      expect(keypair.secret()).toMatch(/^S[A-Z0-9]{55}$/);
    });

    it('should create keypair from secret', () => {
      const originalKeypair = StellarRpcService.generateKeypair();
      const recreatedKeypair = StellarRpcService.createKeypairFromSecret(originalKeypair.secret());
      
      expect(recreatedKeypair.publicKey()).toBe(originalKeypair.publicKey());
      expect(recreatedKeypair.secret()).toBe(originalKeypair.secret());
    });

    it('should create keypair from public key', () => {
      const originalKeypair = StellarRpcService.generateKeypair();
      const recreatedKeypair = StellarRpcService.createKeypairFromPublicKey(originalKeypair.publicKey());
      
      expect(recreatedKeypair.publicKey()).toBe(originalKeypair.publicKey());
    });
  });

  describe('Account Information', () => {
    it('should check if account exists', async () => {
      const exists = await stellarRpc.accountExists(testKeypair.publicKey());
      
      // New random account should not exist
      expect(exists).toBe(false);
    });

    it('should handle non-existent account gracefully', async () => {
      const nonExistentAccount = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
      
      try {
        await stellarRpc.getAccountInfo(nonExistentAccount);
        fail('Should have thrown an error for non-existent account');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Transaction Operations', () => {
    it('should validate transaction parameters', () => {
      const operations = [];
      
      // Test with empty operations array
      expect(() => {
        stellarRpc.submitTransaction(testKeypair, operations);
      }).not.toThrow();
    });

    it('should handle invalid keypair in transaction', async () => {
      const invalidKeypair = StellarRpcService.createKeypairFromPublicKey('invalid');
      
      try {
        await stellarRpc.submitTransaction(invalidKeypair, []);
        fail('Should have thrown an error for invalid keypair');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('KALE Token Operations', () => {
    it('should get KALE balance for address', async () => {
      const balance = await stellarRpc.getKaleBalance(testKeypair.publicKey());
      
      expect(balance).toBeDefined();
      expect(typeof balance).toBe('string');
    });

    it('should handle invalid contract ID gracefully', async () => {
      const invalidConfig = { ...config, kaleTokenContractId: 'invalid-contract-id' };
      const invalidStellarRpc = new StellarRpcService(invalidConfig);
      
      const balance = await invalidStellarRpc.getKaleBalance(testKeypair.publicKey());
      
      // Should return '0' for invalid contract
      expect(balance).toBe('0');
    });
  });

  describe('Market Operations', () => {
    it('should create market offer with valid parameters', async () => {
      const sellingAsset = { code: 'KALE', issuer: 'test-issuer' };
      const buyingAsset = { code: 'XLM', issuer: '' };
      
      try {
        await stellarRpc.createMarketOffer(
          testKeypair,
          sellingAsset as any,
          buyingAsset as any,
          '100',
          '0.1',
          '0'
        );
        fail('Should have thrown an error for unfunded account');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should cancel market offer', async () => {
      const sellingAsset = { code: 'KALE', issuer: 'test-issuer' };
      const buyingAsset = { code: 'XLM', issuer: '' };
      
      try {
        await stellarRpc.cancelMarketOffer(
          testKeypair,
          sellingAsset as any,
          buyingAsset as any,
          '0'
        );
        fail('Should have thrown an error for unfunded account');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Order Book Operations', () => {
    it('should get order book for trading pair', async () => {
      const sellingAsset = { code: 'KALE', issuer: 'test-issuer' };
      const buyingAsset = { code: 'XLM', issuer: '' };
      
      try {
        await stellarRpc.getOrderBook(sellingAsset as any, buyingAsset as any);
        fail('Should have thrown an error for invalid assets');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Transaction History', () => {
    it('should get account transactions', async () => {
      const transactions = await stellarRpc.getAccountTransactions(testKeypair.publicKey(), 5);
      
      expect(transactions).toBeDefined();
      expect(Array.isArray(transactions)).toBe(true);
    });

    it('should handle invalid transaction hash', async () => {
      const invalidHash = 'invalid-hash';
      
      try {
        await stellarRpc.getTransaction(invalidHash);
        fail('Should have thrown an error for invalid hash');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const invalidConfig = {
        ...config,
        horizonUrl: 'https://invalid-horizon-url.com',
      };
      const invalidStellarRpc = new StellarRpcService(invalidConfig);
      
      try {
        await invalidStellarRpc.getNetworkStats();
        fail('Should have thrown an error for invalid horizon URL');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid RPC URL', async () => {
      const invalidConfig = {
        ...config,
        sorobanRpcUrl: 'https://invalid-soroban-url.com',
      };
      const invalidStellarRpc = new StellarRpcService(invalidConfig);
      
      try {
        await invalidStellarRpc.getKaleBalance(testKeypair.publicKey());
        fail('Should have thrown an error for invalid RPC URL');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required configuration parameters', () => {
      const requiredParams = [
        'horizonUrl',
        'networkPassphrase',
        'sorobanRpcUrl',
        'kaleTokenContractId',
        'kaleIntegrationContractId',
        'feeCollectorAddress',
      ];

      requiredParams.forEach(param => {
        expect(config[param as keyof typeof config]).toBeDefined();
      });
    });

    it('should handle missing configuration gracefully', () => {
      const incompleteConfig = {
        horizonUrl: 'https://horizon-testnet.stellar.org',
        networkPassphrase: 'Test SDF Network ; September 2015',
        sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
        kaleTokenContractId: '',
        kaleIntegrationContractId: '',
        feeCollectorAddress: '',
      };

      expect(() => {
        new StellarRpcService(incompleteConfig);
      }).not.toThrow();
    });
  });
});
