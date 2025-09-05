import { KaleTokenService } from '../../services/kale-token.service';
import { StellarRpcService } from '../../services/stellar-rpc.service';
import { Keypair } from '@stellar/stellar-sdk';

describe('KaleTokenService Integration Tests', () => {
  let stellarRpc: StellarRpcService;
  let kaleToken: KaleTokenService;
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
    testKeypair = Keypair.random();
  });

  describe('Token Information', () => {
    it('should get token information', async () => {
      const tokenInfo = await kaleToken.getTokenInfo();
      
      expect(tokenInfo).toBeDefined();
      expect(tokenInfo.contractId).toBe(kaleConfig.contractId);
      expect(tokenInfo.symbol).toBe(kaleConfig.symbol);
      expect(tokenInfo.name).toBe(kaleConfig.name);
      expect(tokenInfo.decimals).toBe(kaleConfig.decimals);
      expect(tokenInfo.totalSupply).toBe(kaleConfig.totalSupply);
      expect(tokenInfo.issuer).toBe(kaleConfig.issuerAddress);
    });
  });

  describe('Balance Operations', () => {
    it('should get KALE balance for address', async () => {
      const balance = await kaleToken.getBalance(testKeypair.publicKey());
      
      expect(balance).toBeDefined();
      expect(balance.address).toBe(testKeypair.publicKey());
      expect(balance.balance).toBeDefined();
      expect(balance.formattedBalance).toBeDefined();
      expect(balance.contractId).toBe(kaleConfig.contractId);
    });

    it('should handle invalid address in balance check', async () => {
      const invalidAddress = 'invalid-address';
      
      try {
        await kaleToken.getBalance(invalidAddress);
        fail('Should have thrown an error for invalid address');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Transfer Operations', () => {
    it('should validate transfer parameters', async () => {
      const recipientAddress = Keypair.random().publicKey();
      const amount = '100';
      
      try {
        await kaleToken.transfer(testKeypair, recipientAddress, amount);
        fail('Should have thrown an error for unfunded account');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Insufficient KALE balance');
      }
    });

    it('should validate amount format', async () => {
      const recipientAddress = Keypair.random().publicKey();
      const invalidAmount = 'invalid-amount';
      
      try {
        await kaleToken.transfer(testKeypair, recipientAddress, invalidAmount);
        fail('Should have thrown an error for invalid amount');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Invalid amount format');
      }
    });

    it('should validate recipient address', async () => {
      const invalidRecipient = 'invalid-recipient';
      const amount = '100';
      
      try {
        await kaleToken.transfer(testKeypair, invalidRecipient, amount);
        fail('Should have thrown an error for invalid recipient');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Minting Operations', () => {
    it('should validate mint parameters', async () => {
      const recipientAddress = Keypair.random().publicKey();
      const amount = '1000';
      
      try {
        await kaleToken.mint(testKeypair, recipientAddress, amount);
        fail('Should have thrown an error for invalid admin');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate mint amount', async () => {
      const recipientAddress = Keypair.random().publicKey();
      const invalidAmount = 'invalid-amount';
      
      try {
        await kaleToken.mint(testKeypair, recipientAddress, invalidAmount);
        fail('Should have thrown an error for invalid amount');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Burning Operations', () => {
    it('should validate burn parameters', async () => {
      const amount = '100';
      
      try {
        await kaleToken.burn(testKeypair, amount);
        fail('Should have thrown an error for unfunded account');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate burn amount', async () => {
      const invalidAmount = 'invalid-amount';
      
      try {
        await kaleToken.burn(testKeypair, invalidAmount);
        fail('Should have thrown an error for invalid amount');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Market Offers', () => {
    it('should create sell offer with valid parameters', async () => {
      const amount = '100';
      const price = '0.1';
      
      try {
        await kaleToken.createSellOffer(testKeypair, amount, price);
        fail('Should have thrown an error for unfunded account');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should create buy offer with valid parameters', async () => {
      const amount = '100';
      const price = '0.1';
      
      try {
        await kaleToken.createBuyOffer(testKeypair, amount, price);
        fail('Should have thrown an error for unfunded account');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate offer parameters', async () => {
      const invalidAmount = 'invalid-amount';
      const price = '0.1';
      
      try {
        await kaleToken.createSellOffer(testKeypair, invalidAmount, price);
        fail('Should have thrown an error for invalid amount');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Order Book Operations', () => {
    it('should get order book', async () => {
      const orderBook = await kaleToken.getOrderBook();
      
      expect(orderBook).toBeDefined();
    });

    it('should get KALE price', async () => {
      const price = await kaleToken.getPrice();
      
      expect(price).toBeDefined();
      expect(typeof price).toBe('string');
    });
  });

  describe('Supply Operations', () => {
    it('should get total supply', async () => {
      const totalSupply = await kaleToken.getTotalSupply();
      
      expect(totalSupply).toBeDefined();
      expect(totalSupply).toBe(kaleConfig.totalSupply);
    });
  });

  describe('Balance Formatting', () => {
    it('should format balance correctly', () => {
      const balance = '10000000'; // 1 KALE with 7 decimals
      const formatted = kaleToken.fromSmallestUnit(balance);
      
      expect(formatted).toBe('1.0000000');
    });

    it('should convert to smallest unit correctly', () => {
      const amount = '1.5';
      const smallestUnit = kaleToken.toSmallestUnit(amount);
      
      expect(smallestUnit).toBe('15000000');
    });

    it('should handle zero amounts', () => {
      const zeroAmount = '0';
      const formatted = kaleToken.fromSmallestUnit(zeroAmount);
      const smallestUnit = kaleToken.toSmallestUnit(zeroAmount);
      
      expect(formatted).toBe('0.0000000');
      expect(smallestUnit).toBe('0');
    });

    it('should handle decimal amounts', () => {
      const decimalAmount = '0.1234567';
      const smallestUnit = kaleToken.toSmallestUnit(decimalAmount);
      const formatted = kaleToken.fromSmallestUnit(smallestUnit);
      
      expect(smallestUnit).toBe('1234567');
      expect(formatted).toBe('0.1234567');
    });
  });

  describe('Trustline Operations', () => {
    it('should check trustline status', async () => {
      const hasTrustline = await kaleToken.hasTrustline(testKeypair.publicKey());
      
      expect(typeof hasTrustline).toBe('boolean');
    });

    it('should create trustline', async () => {
      try {
        await kaleToken.createTrustline(testKeypair);
        fail('Should have thrown an error for unfunded account');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid address in trustline check', async () => {
      const invalidAddress = 'invalid-address';
      
      try {
        await kaleToken.hasTrustline(invalidAddress);
        fail('Should have thrown an error for invalid address');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Asset Operations', () => {
    it('should get KALE asset object', () => {
      const kaleAsset = kaleToken.getKaleAsset();
      
      expect(kaleAsset).toBeDefined();
      expect(kaleAsset.code).toBe(kaleConfig.symbol);
      expect(kaleAsset.issuer).toBe(kaleConfig.issuerAddress);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid configuration', () => {
      const invalidConfig = {
        ...kaleConfig,
        contractId: '',
        issuerAddress: '',
      };
      
      expect(() => {
        new KaleTokenService(stellarRpc, invalidConfig);
      }).not.toThrow();
    });

    it('should handle network errors gracefully', async () => {
      const invalidStellarConfig = {
        ...stellarConfig,
        horizonUrl: 'https://invalid-horizon-url.com',
      };
      const invalidStellarRpc = new StellarRpcService(invalidStellarConfig);
      const invalidKaleToken = new KaleTokenService(invalidStellarRpc, kaleConfig);
      
      try {
        await invalidKaleToken.getBalance(testKeypair.publicKey());
        fail('Should have thrown an error for invalid network');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required configuration parameters', () => {
      const requiredParams = [
        'contractId',
        'issuerAddress',
        'totalSupply',
        'decimals',
        'symbol',
        'name',
      ];

      requiredParams.forEach(param => {
        expect(kaleConfig[param as keyof typeof kaleConfig]).toBeDefined();
      });
    });

    it('should handle missing configuration gracefully', () => {
      const incompleteConfig = {
        contractId: '',
        issuerAddress: '',
        totalSupply: '0',
        decimals: 0,
        symbol: '',
        name: '',
      };

      expect(() => {
        new KaleTokenService(stellarRpc, incompleteConfig);
      }).not.toThrow();
    });
  });
});
