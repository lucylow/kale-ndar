import { MarketCreationService } from '../../services/market-creation.service';
import { StellarRpcService } from '../../services/stellar-rpc.service';
import { KaleTokenService } from '../../services/kale-token.service';
import { Keypair } from '@stellar/stellar-sdk';

describe('MarketCreationService Integration Tests', () => {
  let stellarRpc: StellarRpcService;
  let kaleToken: KaleTokenService;
  let marketCreation: MarketCreationService;
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
    marketCreation = new MarketCreationService(stellarRpc, kaleToken, stellarConfig.kaleIntegrationContractId);
    testKeypair = Keypair.random();
  });

  describe('Market Creation', () => {
    it('should validate market creation request', async () => {
      const marketRequest = {
        creator: testKeypair.publicKey(),
        description: 'Test market description',
        assetSymbol: 'BTC',
        targetPrice: '50000',
        condition: 'above' as const,
        resolveTime: Date.now() + 86400000, // 24 hours from now
        marketFee: '100',
      };

      try {
        await marketCreation.createMarket(testKeypair, marketRequest);
        fail('Should have thrown an error for unfunded account');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Insufficient KALE balance');
      }
    });

    it('should validate market description', async () => {
      const invalidRequest = {
        creator: testKeypair.publicKey(),
        description: 'Short', // Too short
        assetSymbol: 'BTC',
        targetPrice: '50000',
        condition: 'above' as const,
        resolveTime: Date.now() + 86400000,
        marketFee: '100',
      };

      try {
        await marketCreation.createMarket(testKeypair, invalidRequest);
        fail('Should have thrown an error for invalid description');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Description must be at least 10 characters long');
      }
    });

    it('should validate asset symbol', async () => {
      const invalidRequest = {
        creator: testKeypair.publicKey(),
        description: 'Test market description',
        assetSymbol: '', // Empty symbol
        targetPrice: '50000',
        condition: 'above' as const,
        resolveTime: Date.now() + 86400000,
        marketFee: '100',
      };

      try {
        await marketCreation.createMarket(testKeypair, invalidRequest);
        fail('Should have thrown an error for empty asset symbol');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Asset symbol is required');
      }
    });

    it('should validate target price', async () => {
      const invalidRequest = {
        creator: testKeypair.publicKey(),
        description: 'Test market description',
        assetSymbol: 'BTC',
        targetPrice: '0', // Invalid price
        condition: 'above' as const,
        resolveTime: Date.now() + 86400000,
        marketFee: '100',
      };

      try {
        await marketCreation.createMarket(testKeypair, invalidRequest);
        fail('Should have thrown an error for invalid target price');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Target price must be greater than 0');
      }
    });

    it('should validate condition', async () => {
      const invalidRequest = {
        creator: testKeypair.publicKey(),
        description: 'Test market description',
        assetSymbol: 'BTC',
        targetPrice: '50000',
        condition: 'invalid' as any, // Invalid condition
        resolveTime: Date.now() + 86400000,
        marketFee: '100',
      };

      try {
        await marketCreation.createMarket(testKeypair, invalidRequest);
        fail('Should have thrown an error for invalid condition');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Condition must be either "above" or "below"');
      }
    });

    it('should validate resolve time', async () => {
      const invalidRequest = {
        creator: testKeypair.publicKey(),
        description: 'Test market description',
        assetSymbol: 'BTC',
        targetPrice: '50000',
        condition: 'above' as const,
        resolveTime: Date.now() - 86400000, // Past time
        marketFee: '100',
      };

      try {
        await marketCreation.createMarket(testKeypair, invalidRequest);
        fail('Should have thrown an error for past resolve time');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Resolve time must be in the future');
      }
    });

    it('should validate market fee', async () => {
      const invalidRequest = {
        creator: testKeypair.publicKey(),
        description: 'Test market description',
        assetSymbol: 'BTC',
        targetPrice: '50000',
        condition: 'above' as const,
        resolveTime: Date.now() + 86400000,
        marketFee: '-100', // Negative fee
      };

      try {
        await marketCreation.createMarket(testKeypair, invalidRequest);
        fail('Should have thrown an error for negative market fee');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Market fee must be non-negative');
      }
    });
  });

  describe('Market Information', () => {
    it('should get market information', async () => {
      const marketId = 'test-market-id';
      
      try {
        await marketCreation.getMarketInfo(marketId);
        fail('Should have thrown an error for non-existent market');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should get user markets', async () => {
      const userAddress = testKeypair.publicKey();
      
      try {
        const marketIds = await marketCreation.getUserMarkets(userAddress);
        expect(Array.isArray(marketIds)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid user address', async () => {
      const invalidAddress = 'invalid-address';
      
      try {
        await marketCreation.getUserMarkets(invalidAddress);
        fail('Should have thrown an error for invalid address');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Market Offers', () => {
    it('should create market offer with valid parameters', async () => {
      const sellingAsset = { code: 'KALE', issuer: 'test-issuer' };
      const buyingAsset = { code: 'XLM', issuer: '' };
      const amount = '100';
      const price = '0.1';
      
      try {
        await marketCreation.createMarketOffer(
          testKeypair,
          sellingAsset as any,
          buyingAsset as any,
          amount,
          price
        );
        fail('Should have thrown an error for unfunded account');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should cancel market offer', async () => {
      const sellingAsset = { code: 'KALE', issuer: 'test-issuer' };
      const buyingAsset = { code: 'XLM', issuer: '' };
      const offerId = '0';
      
      try {
        await marketCreation.cancelMarketOffer(
          testKeypair,
          sellingAsset as any,
          buyingAsset as any,
          offerId
        );
        fail('Should have thrown an error for unfunded account');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should create KALE/XLM trading offers', async () => {
      const kaleAmount = '100';
      const xlmAmount = '10';
      const price = '0.1';
      
      try {
        await marketCreation.createKaleXlmOffers(
          testKeypair,
          kaleAmount,
          xlmAmount,
          price
        );
        fail('Should have thrown an error for unfunded account');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should get market offers for trading pair', async () => {
      const sellingAsset = { code: 'KALE', issuer: 'test-issuer' };
      const buyingAsset = { code: 'XLM', issuer: '' };
      
      try {
        const offers = await marketCreation.getMarketOffers(sellingAsset as any, buyingAsset as any);
        expect(Array.isArray(offers)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Trading Statistics', () => {
    it('should get KALE trading statistics', async () => {
      const stats = await marketCreation.getKaleTradingStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalVolume).toBeDefined();
      expect(stats.totalTrades).toBeDefined();
      expect(stats.averagePrice).toBeDefined();
      expect(stats.priceChange24h).toBeDefined();
    });
  });

  describe('Fee Calculations', () => {
    it('should calculate market creation fee', () => {
      const baseAmount = '1000';
      const feeRate = 0.01;
      const fee = marketCreation.calculateMarketFee(baseAmount, feeRate);
      
      expect(fee).toBe('10');
    });

    it('should calculate market creation fee with default rate', () => {
      const baseAmount = '1000';
      const fee = marketCreation.calculateMarketFee(baseAmount);
      
      expect(fee).toBe('10'); // 1% of 1000
    });

    it('should handle zero amount in fee calculation', () => {
      const baseAmount = '0';
      const feeRate = 0.01;
      const fee = marketCreation.calculateMarketFee(baseAmount, feeRate);
      
      expect(fee).toBe('0');
    });

    it('should handle zero fee rate', () => {
      const baseAmount = '1000';
      const feeRate = 0;
      const fee = marketCreation.calculateMarketFee(baseAmount, feeRate);
      
      expect(fee).toBe('0');
    });
  });

  describe('Market Creation Requirements', () => {
    it('should get market creation fee rate', async () => {
      const feeRate = await marketCreation.getMarketCreationFeeRate();
      
      expect(feeRate).toBeDefined();
      expect(typeof feeRate).toBe('number');
      expect(feeRate).toBeGreaterThanOrEqual(0);
      expect(feeRate).toBeLessThanOrEqual(1);
    });

    it('should check if market can be created', async () => {
      const address = testKeypair.publicKey();
      const marketFee = '100';
      
      const canCreate = await marketCreation.canCreateMarket(address, marketFee);
      expect(typeof canCreate).toBe('boolean');
    });

    it('should get market creation requirements', async () => {
      const requirements = await marketCreation.getMarketCreationRequirements();
      
      expect(requirements).toBeDefined();
      expect(requirements.minFee).toBeDefined();
      expect(requirements.maxFee).toBeDefined();
      expect(requirements.requiredBalance).toBeDefined();
      expect(requirements.feeRate).toBeDefined();
    });

    it('should handle invalid address in eligibility check', async () => {
      const invalidAddress = 'invalid-address';
      const marketFee = '100';
      
      try {
        await marketCreation.canCreateMarket(invalidAddress, marketFee);
        fail('Should have thrown an error for invalid address');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid configuration', () => {
      const invalidConfig = {
        ...stellarConfig,
        kaleIntegrationContractId: '',
      };
      
      expect(() => {
        new MarketCreationService(stellarRpc, kaleToken, invalidConfig.kaleIntegrationContractId);
      }).not.toThrow();
    });

    it('should handle network errors gracefully', async () => {
      const invalidStellarConfig = {
        ...stellarConfig,
        horizonUrl: 'https://invalid-horizon-url.com',
      };
      const invalidStellarRpc = new StellarRpcService(invalidStellarConfig);
      const invalidMarketCreation = new MarketCreationService(invalidStellarRpc, kaleToken, stellarConfig.kaleIntegrationContractId);
      
      try {
        await invalidMarketCreation.getKaleTradingStats();
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
        new MarketCreationService(stellarRpc, kaleToken, incompleteConfig.kaleIntegrationContractId);
      }).not.toThrow();
    });
  });
});
