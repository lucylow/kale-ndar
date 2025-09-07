import express from 'express';
import { NFTReceiptService } from '../services/nft-receipt.service';
import { StellarRpcService } from '../services/stellar-rpc.service';
import { logger } from '../utils/logger';
import Joi from 'joi';

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

const stellarRpc = new StellarRpcService(stellarConfig);
const nftReceiptService = new NFTReceiptService(
  stellarRpc,
  process.env.NFT_CONTRACT_ID || '',
  stellarConfig.kaleIntegrationContractId
);

// Validation schemas
const mintReceiptSchema = Joi.object({
  betId: Joi.string().uuid().required(),
  marketId: Joi.string().uuid().required(),
  outcome: Joi.string().valid('for', 'against', 'above', 'below').required(),
  amount: Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
  odds: Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
  ownerSecret: Joi.string().required(),
});

const listReceiptSchema = Joi.object({
  receiptId: Joi.string().uuid().required(),
  askPrice: Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
  expiresAt: Joi.number().optional(),
  sellerSecret: Joi.string().required(),
});

const bidReceiptSchema = Joi.object({
  receiptId: Joi.string().uuid().required(),
  bidPrice: Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
  expiresAt: Joi.number().optional(),
  buyerSecret: Joi.string().required(),
});

const tradeReceiptSchema = Joi.object({
  receiptId: Joi.string().uuid().required(),
  price: Joi.string().pattern(/^\d+(\.\d+)?$/).required(),
  sellerSecret: Joi.string().required(),
  buyerSecret: Joi.string().required(),
});

/**
 * @route POST /api/nft-receipts/mint
 * @desc Mint NFT receipt for a bet
 */
router.post('/mint', async (req, res) => {
  try {
    const { error, value } = mintReceiptSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const ownerKeypair = require('@stellar/stellar-sdk').Keypair.fromSecret(value.ownerSecret);
    
    // Mock market info for metadata generation
    const marketInfo = {
      id: value.marketId,
      description: 'Sample prediction market',
      targetPrice: '50000',
    };

    const receipt = await nftReceiptService.mintBetReceipt(
      value.betId,
      value.marketId,
      ownerKeypair,
      value.outcome,
      value.amount,
      value.odds,
      marketInfo
    );

    res.json({
      success: true,
      data: receipt,
      message: 'NFT receipt minted successfully',
    });
  } catch (error) {
    logger.error('Failed to mint NFT receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mint NFT receipt',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/nft-receipts/:receiptId
 * @desc Get receipt details
 */
router.get('/:receiptId', async (req, res) => {
  try {
    const { receiptId } = req.params;

    if (!receiptId) {
      return res.status(400).json({
        success: false,
        error: 'Receipt ID is required',
      });
    }

    const receipt = await nftReceiptService.getReceipt(receiptId);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found',
      });
    }

    res.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    logger.error('Failed to get receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get receipt',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/nft-receipts/user/:userAddress
 * @desc Get user's receipts
 */
router.get('/user/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'User address is required',
      });
    }

    const receipts = await nftReceiptService.getUserReceipts(userAddress);

    res.json({
      success: true,
      data: receipts,
      count: receipts.length,
    });
  } catch (error) {
    logger.error('Failed to get user receipts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user receipts',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/nft-receipts/list
 * @desc List receipt for sale
 */
router.post('/list', async (req, res) => {
  try {
    const { error, value } = listReceiptSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const sellerKeypair = require('@stellar/stellar-sdk').Keypair.fromSecret(value.sellerSecret);
    
    const market = await nftReceiptService.listReceiptForSale(
      sellerKeypair,
      value.receiptId,
      value.askPrice,
      value.expiresAt
    );

    res.json({
      success: true,
      data: market,
      message: 'Receipt listed for sale successfully',
    });
  } catch (error) {
    logger.error('Failed to list receipt for sale:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list receipt for sale',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/nft-receipts/bid
 * @desc Place bid on receipt
 */
router.post('/bid', async (req, res) => {
  try {
    const { error, value } = bidReceiptSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const buyerKeypair = require('@stellar/stellar-sdk').Keypair.fromSecret(value.buyerSecret);
    
    const offer = await nftReceiptService.placeReceiptBid(
      buyerKeypair,
      value.receiptId,
      value.bidPrice,
      value.expiresAt
    );

    res.json({
      success: true,
      data: offer,
      message: 'Bid placed successfully',
    });
  } catch (error) {
    logger.error('Failed to place receipt bid:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to place receipt bid',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/nft-receipts/trade
 * @desc Execute receipt trade
 */
router.post('/trade', async (req, res) => {
  try {
    const { error, value } = tradeReceiptSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message,
      });
    }

    const sellerKeypair = require('@stellar/stellar-sdk').Keypair.fromSecret(value.sellerSecret);
    const buyerKeypair = require('@stellar/stellar-sdk').Keypair.fromSecret(value.buyerSecret);
    
    const trade = await nftReceiptService.executeReceiptTrade(
      sellerKeypair,
      buyerKeypair,
      value.receiptId,
      value.price
    );

    res.json({
      success: true,
      data: trade,
      message: 'Receipt trade executed successfully',
    });
  } catch (error) {
    logger.error('Failed to execute receipt trade:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute receipt trade',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/nft-receipts/:receiptId/market-data
 * @desc Get receipt market data
 */
router.get('/:receiptId/market-data', async (req, res) => {
  try {
    const { receiptId } = req.params;

    if (!receiptId) {
      return res.status(400).json({
        success: false,
        error: 'Receipt ID is required',
      });
    }

    const marketData = await nftReceiptService.getReceiptMarketData(receiptId);

    res.json({
      success: true,
      data: marketData,
    });
  } catch (error) {
    logger.error('Failed to get receipt market data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get receipt market data',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/nft-receipts/:receiptId/trading-history
 * @desc Get receipt trading history
 */
router.get('/:receiptId/trading-history', async (req, res) => {
  try {
    const { receiptId } = req.params;

    if (!receiptId) {
      return res.status(400).json({
        success: false,
        error: 'Receipt ID is required',
      });
    }

    const tradingHistory = await nftReceiptService.getReceiptTradingHistory(receiptId);

    res.json({
      success: true,
      data: tradingHistory,
      count: tradingHistory.length,
    });
  } catch (error) {
    logger.error('Failed to get receipt trading history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get receipt trading history',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/nft-receipts/metadata/:tokenId
 * @desc Get NFT metadata
 */
router.get('/metadata/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: 'Token ID is required',
      });
    }

    // This would typically fetch metadata from IPFS or contract
    const metadata = {
      name: `KALE-ndar Receipt #${tokenId.substring(0, 8)}`,
      description: 'Prediction market receipt NFT',
      image: `https://kale-ndar.com/api/receipt-image/${tokenId}`,
      attributes: [
        { trait_type: 'Market', value: 'BTC Price Prediction' },
        { trait_type: 'Outcome', value: 'Above' },
        { trait_type: 'Amount', value: '1000 KALE' },
        { trait_type: 'Odds', value: '2.5' },
        { trait_type: 'Rarity', value: 'Rare' },
      ],
      external_url: `https://kale-ndar.com/receipt/${tokenId}`,
    };

    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    logger.error('Failed to get NFT metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get NFT metadata',
      message: error.message,
    });
  }
});

export default router;

