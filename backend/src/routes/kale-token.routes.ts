import express from 'express';
import Joi from 'joi';
import { StellarRpcService } from '../services/stellar-rpc.service';
import { KaleTokenService } from '../services/kale-token.service';
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

// Validation schemas
const transferSchema = Joi.object({
  recipient: Joi.string().required(),
  amount: Joi.string().required(),
  memo: Joi.string().optional(),
});

const mintSchema = Joi.object({
  recipient: Joi.string().required(),
  amount: Joi.string().required(),
});

const burnSchema = Joi.object({
  amount: Joi.string().required(),
});

const createOfferSchema = Joi.object({
  amount: Joi.string().required(),
  price: Joi.string().required(),
  offerId: Joi.string().optional(),
});

// Get KALE token information
router.get('/info', async (req, res) => {
  try {
    const tokenInfo = await kaleToken.getTokenInfo();
    res.json({
      success: true,
      data: tokenInfo,
    });
  } catch (error) {
    logger.error('Failed to get KALE token info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get KALE token information',
    });
  }
});

// Get KALE balance for an address
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!StellarRpcService.isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Stellar address',
      });
    }

    const balance = await kaleToken.getBalance(address);
    res.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    logger.error('Failed to get KALE balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get KALE balance',
    });
  }
});

// Transfer KALE tokens
router.post('/transfer', async (req, res) => {
  try {
    const { error, value } = transferSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { recipient, amount, memo } = value;
    const senderSecret = req.body.senderSecret;

    if (!senderSecret) {
      return res.status(400).json({
        success: false,
        error: 'Sender secret key is required',
      });
    }

    const senderKeypair = StellarRpcService.createKeypairFromSecret(senderSecret);
    
    const result = await kaleToken.transfer(senderKeypair, recipient, amount, memo);
    
    res.json({
      success: true,
      data: {
        transactionHash: result.hash,
        ledger: result.ledger,
        amount,
        recipient,
        sender: senderKeypair.publicKey(),
      },
    });
  } catch (error) {
    logger.error('Failed to transfer KALE:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to transfer KALE tokens',
    });
  }
});

// Mint KALE tokens (admin only)
router.post('/mint', async (req, res) => {
  try {
    const { error, value } = mintSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { recipient, amount } = value;
    const adminSecret = req.body.adminSecret;

    if (!adminSecret) {
      return res.status(400).json({
        success: false,
        error: 'Admin secret key is required',
      });
    }

    const adminKeypair = StellarRpcService.createKeypairFromSecret(adminSecret);
    
    const result = await kaleToken.mint(adminKeypair, recipient, amount);
    
    res.json({
      success: true,
      data: {
        transactionHash: result.hash,
        ledger: result.ledger,
        amount,
        recipient,
        admin: adminKeypair.publicKey(),
      },
    });
  } catch (error) {
    logger.error('Failed to mint KALE:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to mint KALE tokens',
    });
  }
});

// Burn KALE tokens
router.post('/burn', async (req, res) => {
  try {
    const { error, value } = burnSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { amount } = value;
    const ownerSecret = req.body.ownerSecret;

    if (!ownerSecret) {
      return res.status(400).json({
        success: false,
        error: 'Owner secret key is required',
      });
    }

    const ownerKeypair = StellarRpcService.createKeypairFromSecret(ownerSecret);
    
    const result = await kaleToken.burn(ownerKeypair, amount);
    
    res.json({
      success: true,
      data: {
        transactionHash: result.hash,
        ledger: result.ledger,
        amount,
        owner: ownerKeypair.publicKey(),
      },
    });
  } catch (error) {
    logger.error('Failed to burn KALE:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to burn KALE tokens',
    });
  }
});

// Create sell offer (KALE for XLM)
router.post('/offers/sell', async (req, res) => {
  try {
    const { error, value } = createOfferSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { amount, price, offerId } = value;
    const sellerSecret = req.body.sellerSecret;

    if (!sellerSecret) {
      return res.status(400).json({
        success: false,
        error: 'Seller secret key is required',
      });
    }

    const sellerKeypair = StellarRpcService.createKeypairFromSecret(sellerSecret);
    
    const result = await kaleToken.createSellOffer(sellerKeypair, amount, price, offerId);
    
    res.json({
      success: true,
      data: {
        transactionHash: result.hash,
        ledger: result.ledger,
        amount,
        price,
        offerId: offerId || '0',
        seller: sellerKeypair.publicKey(),
      },
    });
  } catch (error) {
    logger.error('Failed to create sell offer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create sell offer',
    });
  }
});

// Create buy offer (XLM for KALE)
router.post('/offers/buy', async (req, res) => {
  try {
    const { error, value } = createOfferSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { amount, price, offerId } = value;
    const buyerSecret = req.body.buyerSecret;

    if (!buyerSecret) {
      return res.status(400).json({
        success: false,
        error: 'Buyer secret key is required',
      });
    }

    const buyerKeypair = StellarRpcService.createKeypairFromSecret(buyerSecret);
    
    const result = await kaleToken.createBuyOffer(buyerKeypair, amount, price, offerId);
    
    res.json({
      success: true,
      data: {
        transactionHash: result.hash,
        ledger: result.ledger,
        amount,
        price,
        offerId: offerId || '0',
        buyer: buyerKeypair.publicKey(),
      },
    });
  } catch (error) {
    logger.error('Failed to create buy offer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create buy offer',
    });
  }
});

// Get KALE/XLM order book
router.get('/orderbook', async (req, res) => {
  try {
    const orderBook = await kaleToken.getOrderBook();
    res.json({
      success: true,
      data: orderBook,
    });
  } catch (error) {
    logger.error('Failed to get order book:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get order book',
    });
  }
});

// Get KALE price
router.get('/price', async (req, res) => {
  try {
    const price = await kaleToken.getPrice();
    res.json({
      success: true,
      data: {
        price,
        symbol: 'KALE/XLM',
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    logger.error('Failed to get KALE price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get KALE price',
    });
  }
});

// Get total supply
router.get('/supply', async (req, res) => {
  try {
    const totalSupply = await kaleToken.getTotalSupply();
    res.json({
      success: true,
      data: {
        totalSupply,
        symbol: 'KALE',
      },
    });
  } catch (error) {
    logger.error('Failed to get total supply:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get total supply',
    });
  }
});

// Check trustline
router.get('/trustline/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!StellarRpcService.isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Stellar address',
      });
    }

    const hasTrustline = await kaleToken.hasTrustline(address);
    res.json({
      success: true,
      data: {
        address,
        hasTrustline,
        symbol: 'KALE',
      },
    });
  } catch (error) {
    logger.error('Failed to check trustline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check trustline',
    });
  }
});

// Create trustline
router.post('/trustline', async (req, res) => {
  try {
    const accountSecret = req.body.accountSecret;

    if (!accountSecret) {
      return res.status(400).json({
        success: false,
        error: 'Account secret key is required',
      });
    }

    const accountKeypair = StellarRpcService.createKeypairFromSecret(accountSecret);
    
    const result = await kaleToken.createTrustline(accountKeypair);
    
    res.json({
      success: true,
      data: {
        transactionHash: result.hash,
        ledger: result.ledger,
        account: accountKeypair.publicKey(),
        symbol: 'KALE',
      },
    });
  } catch (error) {
    logger.error('Failed to create trustline:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create trustline',
    });
  }
});

// Format balance
router.post('/format-balance', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required',
      });
    }

    const formattedAmount = kaleToken.fromSmallestUnit(amount);
    const smallestUnit = kaleToken.toSmallestUnit(formattedAmount);

    res.json({
      success: true,
      data: {
        originalAmount: amount,
        formattedAmount,
        smallestUnit,
        decimals: kaleConfig.decimals,
      },
    });
  } catch (error) {
    logger.error('Failed to format balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to format balance',
    });
  }
});

export default router;
