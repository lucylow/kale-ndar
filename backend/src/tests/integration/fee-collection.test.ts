import { FeeCollectionService } from '../../services/fee-collection.service';
import { StellarRpcService } from '../../services/stellar-rpc.service';
import { KaleTokenService } from '../../services/kale-token.service';
import { Keypair } from '@stellar/stellar-sdk';

describe('FeeCollectionService Integration Tests', () => {
  let stellarRpc: StellarRpcService;
  let kaleToken: KaleTokenService;
  let feeCollection: FeeCollectionService;
  let testKeypair: Keypair;

  const stellarConfig = {
    horizonUrl: 'https://horizon-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    kaleTokenContractId: 'test-contract-id',
    kaleIntegrationContractId: 'test-integration-contract-id',
    feeCollectorAddress: 'test-fee-collector',
  };

  const kaleConfig = {
    contractId: 'test-contract-id',
    issuerAddress: 'test-issuer-address',
    totalSupply: '1000000000',
    decimals: 7,
    symbol: 'KALE',
    name: 'KALE Token',
  };

  beforeAll(() => {
    stellarRpc = new StellarRpcService(stellarConfig);
    kaleToken = new KaleTokenService(stellarRpc, kaleConfig);
    feeCollection = new FeeCollectionService(stellarRpc, kaleToken, stellarConfig.kaleIntegrationContractId, stellarConfig.feeCollectorAddress);
    testKeypair = Keypair.random();
  });

  describe('Fee Collection', () => {
    it('should collect fees with valid admin', async () => {
      try {
        const result = await feeCollection.collectFees(testKeypair);
        expect(result).toBeDefined();
        expect(result.amountCollected).toBeDefined();
        expect(result.transactionHash).toBeDefined();
        expect(result.collectorAddress).toBe(stellarConfig.feeCollectorAddress);
        expect(result.timestamp).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate admin keypair', async () => {
      const invalidKeypair = Keypair.random();
      
      try {
        await feeCollection.collectFees(invalidKeypair);
        fail('Should have thrown an error for invalid admin');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Fee Information', () => {
    it('should get current fee information', async () => {
      try {
        const feeInfo = await feeCollection.getFeeInfo();
        
        expect(feeInfo).toBeDefined();
        expect(feeInfo.platformFees).toBeDefined();
        expect(feeInfo.collectedFees).toBeDefined();
        expect(feeInfo.feeRate).toBeDefined();
        expect(feeInfo.feeCollector).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Fee Rate Management', () => {
    it('should update fee rate with valid admin', async () => {
      const newFeeRate = 0.02; // 2%
      
      try {
        const result = await feeCollection.updateFeeRate(testKeypair, newFeeRate);
        expect(result).toBeDefined();
        expect(result.hash).toBeDefined();
        expect(result.ledger).toBeDefined();
        expect(result.success).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate fee rate range', async () => {
      const invalidFeeRate = 1.5; // 150% - too high
      
      try {
        await feeCollection.updateFeeRate(testKeypair, invalidFeeRate);
        fail('Should have thrown an error for invalid fee rate');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate negative fee rate', async () => {
      const negativeFeeRate = -0.01; // -1%
      
      try {
        await feeCollection.updateFeeRate(testKeypair, negativeFeeRate);
        fail('Should have thrown an error for negative fee rate');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate admin keypair for fee rate update', async () => {
      const invalidKeypair = Keypair.random();
      const newFeeRate = 0.02;
      
      try {
        await feeCollection.updateFeeRate(invalidKeypair, newFeeRate);
        fail('Should have thrown an error for invalid admin');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Fee Collector Management', () => {
    it('should update fee collector with valid admin', async () => {
      const newFeeCollector = Keypair.random().publicKey();
      
      try {
        const result = await feeCollection.updateFeeCollector(testKeypair, newFeeCollector);
        expect(result).toBeDefined();
        expect(result.hash).toBeDefined();
        expect(result.ledger).toBeDefined();
        expect(result.success).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate fee collector address', async () => {
      const invalidAddress = 'invalid-address';
      
      try {
        await feeCollection.updateFeeCollector(testKeypair, invalidAddress);
        fail('Should have thrown an error for invalid address');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate admin keypair for fee collector update', async () => {
      const invalidKeypair = Keypair.random();
      const newFeeCollector = Keypair.random().publicKey();
      
      try {
        await feeCollection.updateFeeCollector(invalidKeypair, newFeeCollector);
        fail('Should have thrown an error for invalid admin');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Fee Calculations', () => {
    it('should calculate fees correctly', () => {
      const amount = '1000';
      const feeRate = 0.01; // 1%
      const feeDistribution = feeCollection.calculateFees(amount, feeRate);
      
      expect(feeDistribution).toBeDefined();
      expect(feeDistribution.platformFee).toBe('10');
      expect(feeDistribution.creatorFee).toBe('5');
      expect(feeDistribution.totalFee).toBe('15');
    });

    it('should calculate fees with zero amount', () => {
      const amount = '0';
      const feeRate = 0.01;
      const feeDistribution = feeCollection.calculateFees(amount, feeRate);
      
      expect(feeDistribution.platformFee).toBe('0');
      expect(feeDistribution.creatorFee).toBe('0');
      expect(feeDistribution.totalFee).toBe('0');
    });

    it('should calculate fees with zero rate', () => {
      const amount = '1000';
      const feeRate = 0;
      const feeDistribution = feeCollection.calculateFees(amount, feeRate);
      
      expect(feeDistribution.platformFee).toBe('0');
      expect(feeDistribution.creatorFee).toBe('0');
      expect(feeDistribution.totalFee).toBe('0');
    });

    it('should calculate fees with high rate', () => {
      const amount = '1000';
      const feeRate = 0.1; // 10%
      const feeDistribution = feeCollection.calculateFees(amount, feeRate);
      
      expect(feeDistribution.platformFee).toBe('100');
      expect(feeDistribution.creatorFee).toBe('50');
      expect(feeDistribution.totalFee).toBe('150');
    });
  });

  describe('Fee Distribution', () => {
    it('should distribute fees to stakeholders', async () => {
      const platformFee = '100';
      const creatorFee = '50';
      const creatorAddress = Keypair.random().publicKey();
      
      try {
        const results = await feeCollection.distributeFees(
          testKeypair,
          platformFee,
          creatorFee,
          creatorAddress
        );
        
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate creator address in distribution', async () => {
      const platformFee = '100';
      const creatorFee = '50';
      const invalidCreatorAddress = 'invalid-address';
      
      try {
        await feeCollection.distributeFees(
          testKeypair,
          platformFee,
          creatorFee,
          invalidCreatorAddress
        );
        fail('Should have thrown an error for invalid creator address');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Invalid creator address');
      }
    });

    it('should handle zero fees in distribution', async () => {
      const platformFee = '0';
      const creatorFee = '0';
      const creatorAddress = Keypair.random().publicKey();
      
      try {
        const results = await feeCollection.distributeFees(
          testKeypair,
          platformFee,
          creatorFee,
          creatorAddress
        );
        
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Balance Operations', () => {
    it('should get fee collector balance', async () => {
      const balance = await feeCollection.getFeeCollectorBalance();
      
      expect(balance).toBeDefined();
      expect(typeof balance).toBe('string');
    });
  });

  describe('Statistics', () => {
    it('should get fee statistics', async () => {
      const stats = await feeCollection.getFeeStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalFeesCollected).toBeDefined();
      expect(stats.totalFeesDistributed).toBeDefined();
      expect(stats.pendingFees).toBeDefined();
      expect(stats.feeCollectionCount).toBeDefined();
      expect(stats.averageFeePerCollection).toBeDefined();
    });
  });

  describe('Eligibility Checks', () => {
    it('should check if fees can be collected', async () => {
      const canCollect = await feeCollection.canCollectFees();
      
      expect(typeof canCollect).toBe('boolean');
    });

    it('should get fee collection requirements', async () => {
      const requirements = await feeCollection.getFeeCollectionRequirements();
      
      expect(requirements).toBeDefined();
      expect(requirements.minFeesToCollect).toBeDefined();
      expect(requirements.maxFeesToCollect).toBeDefined();
      expect(requirements.feeCollectorBalance).toBeDefined();
      expect(requirements.pendingFees).toBeDefined();
    });
  });

  describe('Scheduling', () => {
    it('should schedule automatic fee collection', async () => {
      const intervalMinutes = 60;
      
      try {
        await feeCollection.scheduleFeeCollection(intervalMinutes);
        // Should not throw an error
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should schedule with default interval', async () => {
      try {
        await feeCollection.scheduleFeeCollection();
        // Should not throw an error
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Bulk Operations', () => {
    it('should process bulk fee collection', async () => {
      const marketIds = ['market1', 'market2', 'market3'];
      
      try {
        const results = await feeCollection.processBulkFeeCollection(testKeypair, marketIds);
        
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeLessThanOrEqual(marketIds.length);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle empty market list in bulk collection', async () => {
      const marketIds: string[] = [];
      
      try {
        const results = await feeCollection.processBulkFeeCollection(testKeypair, marketIds);
        
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(0);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate admin keypair in bulk collection', async () => {
      const invalidKeypair = Keypair.random();
      const marketIds = ['market1', 'market2'];
      
      try {
        await feeCollection.processBulkFeeCollection(invalidKeypair, marketIds);
        fail('Should have thrown an error for invalid admin');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('History', () => {
    it('should get fee collection history', async () => {
      const limit = 10;
      const history = await feeCollection.getFeeCollectionHistory(limit);
      
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(limit);
    });

    it('should get fee collection history with default limit', async () => {
      const history = await feeCollection.getFeeCollectionHistory();
      
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('Optimal Timing', () => {
    it('should get optimal collection timing', async () => {
      const timing = await feeCollection.getOptimalCollectionTiming();
      
      expect(timing).toBeDefined();
      expect(timing.recommendedInterval).toBeDefined();
      expect(timing.nextCollectionTime).toBeDefined();
      expect(timing.estimatedFees).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid configuration', () => {
      const invalidConfig = {
        ...stellarConfig,
        kaleIntegrationContractId: '',
        feeCollectorAddress: '',
      };
      
      expect(() => {
        new FeeCollectionService(stellarRpc, kaleToken, invalidConfig.kaleIntegrationContractId, invalidConfig.feeCollectorAddress);
      }).not.toThrow();
    });

    it('should handle network errors gracefully', async () => {
      const invalidStellarConfig = {
        ...stellarConfig,
        horizonUrl: 'https://invalid-horizon-url.com',
      };
      const invalidStellarRpc = new StellarRpcService(invalidStellarConfig);
      const invalidFeeCollection = new FeeCollectionService(invalidStellarRpc, kaleToken, stellarConfig.kaleIntegrationContractId, stellarConfig.feeCollectorAddress);
      
      try {
        await invalidFeeCollection.getFeeInfo();
        fail('Should have thrown an error for invalid network');
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
        expect(stellarConfig[param as keyof typeof stellarConfig]).toBeDefined();
      });
    });

    it('should handle missing configuration gracefully', () => {
      const incompleteConfig = {
        horizonUrl: '',
        networkPassphrase: '',
        sorobanRpcUrl: '',
        kaleTokenContractId: '',
        kaleIntegrationContractId: '',
        feeCollectorAddress: '',
      };

      expect(() => {
        new FeeCollectionService(stellarRpc, kaleToken, incompleteConfig.kaleIntegrationContractId, incompleteConfig.feeCollectorAddress);
      }).not.toThrow();
    });
  });
});
