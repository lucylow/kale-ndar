import express from 'express';
import Joi from 'joi';
import { StellarRpcService } from '../services/stellar-rpc.service';
import { KaleTokenService } from '../services/kale-token.service';
import { MarketCreationService } from '../services/market-creation.service';
import { logger } from '../utils/logger';
import { Keypair } from '@stellar/stellar-sdk';

const router = express.Router();

// Initialize services
const stellarConfig = {
  horizonUrl: process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org',
  networkPassphrase: process.env.NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
  sorobanRpcUrl: process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  kaleTokenContractId: process.env.KALE_TOKEN_CONTRACT_ID || '',
  kaleIntegrationContractId: process.env.KALE_INTEGRATION_CONTRACT_ID || '',
  feeCollectorAddress: process.env.FEE_COLLECTOR_ADDRESS || '',
};

const kaleConfig = {
  contractId: process.env.KALE_TOKEN_CONTRACT_ID || '',
  issuerAddress: process.env.KALE_ISSUER_ADDRESS || '',
  totalSupply: process.env.KALE_TOTAL_SUPPLY || '1000000000',
  decimals: parseInt(process.env.KALE_DECIMALS || '7'),
  symbol: 'KALE',
  name: 'KALE Token',
};

const stellarRpc = new StellarRpcService(stellarConfig);
const kaleToken = new KaleTokenService(stellarRpc, kaleConfig);
const marketCreation = new MarketCreationService(stellarRpc, kaleToken, stellarConfig.kaleIntegrationContractId);

// Validation schemas
const createMarketSchema = Joi.object({
  description: Joi.string().required().min(10).max(500),
  assetSymbol: Joi.string().required().max(50),
  targetPrice: Joi.string().required(),
  condition: Joi.string().valid('above', 'below').required(),
  resolveTime: Joi.number().integer().positive().required(),
  marketFee: Joi.string().required(),
});

const createOfferSchema = Joi.object({
  sellingAsset: Joi.object({
    code: Joi.string().required(),
    issuer: Joi.string().required(),
  }).required(),
  buyingAsset: Joi.object({
    code: Joi.string().required(),
    issuer: Joi.string().required(),
  }).required(),
  amount: Joi.string().required(),
  price: Joi.string().required(),
  offerId: Joi.string().optional(),
});

const cancelOfferSchema = Joi.object({
  sellingAsset: Joi.object({
    code: Joi.string().required(),
    issuer: Joi.string().required(),
  }).required(),
  buyingAsset: Joi.object({
    code: Joi.string().required(),
    issuer: Joi.string().required(),
  }).required(),
  offerId: Joi.string().required(),
});

// Create a new prediction market
router.post('/create', async (req, res) => {
  try {
    const { error, value } = createMarketSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const creatorSecret = req.body.creatorSecret;
    if (!creatorSecret) {
      return res.status(400).json({
        success: false,
        error: 'Creator secret key is required',
      });
    }

    const creatorKeypair = StellarRpcService.createKeypairFromSecret(creatorSecret);

    const marketRequest = {
      creator: creatorKeypair.publicKey(),
      description: value.description,
      assetSymbol: value.assetSymbol,
      targetPrice: value.targetPrice,
      condition: value.condition,
      resolveTime: value.resolveTime,
      marketFee: value.marketFee,
    };

    const marketInfo = await marketCreation.createMarket(creatorKeypair, marketRequest);

    res.status(201).json({
      success: true,
      data: marketInfo,
      message: 'Market created successfully',
    });
  } catch (error) {
    logger.error('Failed to create market:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create market',
    });
  }
});

// Get market information
router.get('/:marketId', async (req, res) => {
  try {
    const { marketId } = req.params;

    const marketInfo = await marketCreation.getMarketInfo(marketId);

    res.json({
      success: true,
      data: marketInfo,
    });
  } catch (error) {
    logger.error('Failed to get market info:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get market information',
    });
  }
});

// Get user's markets
router.get('/user/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!StellarRpcService.isValidAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Stellar address',
      });
    }

    const marketIds = await marketCreation.getUserMarkets(userAddress);

    res.json({
      success: true,
      data: {
        userAddress,
        marketIds,
        count: marketIds.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get user markets:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user markets',
    });
  }
});

// Create market offer
router.post('/offers/create', async (req, res) => {
  try {
    const { error, value } = createOfferSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const sellerSecret = req.body.sellerSecret;
    if (!sellerSecret) {
      return res.status(400).json({
        success: false,
        error: 'Seller secret key is required',
      });
    }

    const sellerKeypair = StellarRpcService.createKeypairFromSecret(sellerSecret);

    const { Asset } = await import('@stellar/stellar-sdk');
    const sellingAsset = new Asset(value.sellingAsset.code, value.sellingAsset.issuer);
    const buyingAsset = new Asset(value.buyingAsset.code, value.buyingAsset.issuer);

    const result = await marketCreation.createMarketOffer(
      sellerKeypair,
      sellingAsset,
      buyingAsset,
      value.amount,
      value.price,
      value.offerId
    );

    res.json({
      success: true,
      data: {
        transactionHash: result.hash,
        ledger: result.ledger,
        amount: value.amount,
        price: value.price,
        offerId: value.offerId || '0',
        seller: sellerKeypair.publicKey(),
      },
    });
  } catch (error) {
    logger.error('Failed to create market offer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create market offer',
    });
  }
});

// Cancel market offer
router.post('/offers/cancel', async (req, res) => {
  try {
    const { error, value } = cancelOfferSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const sellerSecret = req.body.sellerSecret;
    if (!sellerSecret) {
      return res.status(400).json({
        success: false,
        error: 'Seller secret key is required',
      });
    }

    const sellerKeypair = StellarRpcService.createKeypairFromSecret(sellerSecret);

    const { Asset } = await import('@stellar/stellar-sdk');
    const sellingAsset = new Asset(value.sellingAsset.code, value.sellingAsset.issuer);
    const buyingAsset = new Asset(value.buyingAsset.code, value.buyingAsset.issuer);

    const result = await marketCreation.cancelMarketOffer(
      sellerKeypair,
      sellingAsset,
      buyingAsset,
      value.offerId
    );

    res.json({
      success: true,
      data: {
        transactionHash: result.hash,
        ledger: result.ledger,
        offerId: value.offerId,
        seller: sellerKeypair.publicKey(),
      },
    });
  } catch (error) {
    logger.error('Failed to cancel market offer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel market offer',
    });
  }
});

// Create KALE/XLM trading offers
router.post('/offers/kale-xlm', async (req, res) => {
  try {
    const { kaleAmount, xlmAmount, price } = req.body;
    const traderSecret = req.body.traderSecret;

    if (!traderSecret) {
      return res.status(400).json({
        success: false,
        error: 'Trader secret key is required',
      });
    }

    if (!kaleAmount || !xlmAmount || !price) {
      return res.status(400).json({
        success: false,
        error: 'KALE amount, XLM amount, and price are required',
      });
    }

    const traderKeypair = StellarRpcService.createKeypairFromSecret(traderSecret);

    const result = await marketCreation.createKaleXlmOffers(
      traderKeypair,
      kaleAmount,
      xlmAmount,
      price
    );

    res.json({
      success: true,
      data: {
        sellOffer: {
          transactionHash: result.sellOffer.hash,
          ledger: result.sellOffer.ledger,
          amount: kaleAmount,
          price,
        },
        buyOffer: {
          transactionHash: result.buyOffer.hash,
          ledger: result.buyOffer.ledger,
          amount: xlmAmount,
          price,
        },
        trader: traderKeypair.publicKey(),
      },
    });
  } catch (error) {
    logger.error('Failed to create KALE/XLM offers:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create KALE/XLM offers',
    });
  }
});

// Get market offers for a trading pair
router.get('/offers/:sellingCode/:sellingIssuer/:buyingCode/:buyingIssuer', async (req, res) => {
  try {
    const { sellingCode, sellingIssuer, buyingCode, buyingIssuer } = req.params;

    const { Asset } = await import('@stellar/stellar-sdk');
    const sellingAsset = new Asset(sellingCode, sellingIssuer);
    const buyingAsset = new Asset(buyingCode, buyingIssuer);

    const offers = await marketCreation.getMarketOffers(sellingAsset, buyingAsset);

    res.json({
      success: true,
      data: {
        sellingAsset: { code: sellingCode, issuer: sellingIssuer },
        buyingAsset: { code: buyingCode, issuer: buyingIssuer },
        offers,
        count: offers.length,
      },
    });
  } catch (error) {
    logger.error('Failed to get market offers:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get market offers',
    });
  }
});

// Get KALE trading statistics
router.get('/stats/kale', async (req, res) => {
  try {
    const stats = await marketCreation.getKaleTradingStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get KALE trading stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get KALE trading statistics',
    });
  }
});

// Calculate market creation fee
router.post('/calculate-fee', async (req, res) => {
  try {
    const { baseAmount, feeRate } = req.body;

    if (!baseAmount) {
      return res.status(400).json({
        success: false,
        error: 'Base amount is required',
      });
    }

    const fee = marketCreation.calculateMarketFee(baseAmount, feeRate);

    res.json({
      success: true,
      data: {
        baseAmount,
        feeRate: feeRate || 0.01,
        calculatedFee: fee,
      },
    });
  } catch (error) {
    logger.error('Failed to calculate market fee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate market fee',
    });
  }
});

// Get market creation fee rate
router.get('/fee-rate', async (req, res) => {
  try {
    const feeRate = await marketCreation.getMarketCreationFeeRate();

    res.json({
      success: true,
      data: {
        feeRate,
        percentage: (feeRate * 100).toFixed(2) + '%',
      },
    });
  } catch (error) {
    logger.error('Failed to get market creation fee rate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market creation fee rate',
    });
  }
});

// Check if market can be created
router.get('/can-create/:address/:marketFee', async (req, res) => {
  try {
    const { address, marketFee } = req.params;

    if (!StellarRpcService.isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Stellar address',
      });
    }

    const canCreate = await marketCreation.canCreateMarket(address, marketFee);

    res.json({
      success: true,
      data: {
        address,
        marketFee,
        canCreate,
      },
    });
  } catch (error) {
    logger.error('Failed to check market creation eligibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check market creation eligibility',
    });
  }
});

// Get market creation requirements
router.get('/requirements', async (req, res) => {
  try {
    const requirements = await marketCreation.getMarketCreationRequirements();

    res.json({
      success: true,
      data: requirements,
    });
  } catch (error) {
    logger.error('Failed to get market creation requirements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market creation requirements',
    });
  }
});

export default router;
