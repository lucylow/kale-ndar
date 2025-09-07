const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');

// Mock database for custom feeds
let customFeeds = [];

/**
 * Create a new custom price feed
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      assetCode,
      baseCurrency,
      dataSource,
      updateFrequency,
      confidenceThreshold,
      costPerUpdate,
      maxSubscribers,
      isPublic,
      creator,
      userSecret
    } = req.body;

    // Validate required fields
    if (!name || !assetCode || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, assetCode, description'
      });
    }

    // Validate confidence threshold
    if (confidenceThreshold < 50 || confidenceThreshold > 100) {
      return res.status(400).json({
        success: false,
        message: 'Confidence threshold must be between 50 and 100'
      });
    }

    // Validate cost per update
    if (costPerUpdate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Cost per update must be greater than 0'
      });
    }

    // Create custom feed
    const customFeed = {
      id: `feed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      assetCode: assetCode.toUpperCase(),
      baseCurrency: baseCurrency || 'USD',
      dataSource: dataSource || 'external_api',
      updateFrequency: updateFrequency || 'hourly',
      confidenceThreshold: confidenceThreshold || 80,
      costPerUpdate: costPerUpdate || 1.0,
      maxSubscribers: maxSubscribers || 1000,
      isPublic: isPublic !== false,
      creator,
      createdAt: new Date().toISOString(),
      status: 'pending', // Pending approval
      totalSubscribers: 0,
      totalRevenue: 0,
      lastUpdate: null,
      currentPrice: null,
      priceHistory: [],
      // Additional metadata
      metadata: {
        apiEndpoint: null, // Will be set after approval
        webhookUrl: null,
        dataValidation: {
          minPrice: 0,
          maxPrice: null,
          priceChangeThreshold: 0.1, // 10% max change per update
        },
        subscription: {
          activeSubscriptions: 0,
          pendingSubscriptions: 0,
        }
      }
    };

    // Store the custom feed
    customFeeds.push(customFeed);

    logger.info('Custom feed created:', {
      feedId: customFeed.id,
      name: customFeed.name,
      assetCode: customFeed.assetCode,
      creator: customFeed.creator,
      status: customFeed.status
    });

    res.json({
      success: true,
      data: customFeed,
      message: 'Custom feed created successfully and is pending approval'
    });

  } catch (error) {
    logger.error('Failed to create custom feed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Get all custom feeds
 */
router.get('/', async (req, res) => {
  try {
    const { status, creator, assetCode } = req.query;
    
    let filteredFeeds = customFeeds;

    // Apply filters
    if (status) {
      filteredFeeds = filteredFeeds.filter(feed => feed.status === status);
    }
    
    if (creator) {
      filteredFeeds = filteredFeeds.filter(feed => feed.creator === creator);
    }
    
    if (assetCode) {
      filteredFeeds = filteredFeeds.filter(feed => 
        feed.assetCode.toLowerCase().includes(assetCode.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filteredFeeds,
      count: filteredFeeds.length
    });

  } catch (error) {
    logger.error('Failed to get custom feeds:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Get a specific custom feed
 */
router.get('/:feedId', async (req, res) => {
  try {
    const { feedId } = req.params;
    
    const feed = customFeeds.find(f => f.id === feedId);
    
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: 'Custom feed not found'
      });
    }

    res.json({
      success: true,
      data: feed
    });

  } catch (error) {
    logger.error('Failed to get custom feed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Subscribe to a custom feed
 */
router.post('/:feedId/subscribe', async (req, res) => {
  try {
    const { feedId } = req.params;
    const { subscriber, amount, frequency } = req.body;

    const feed = customFeeds.find(f => f.id === feedId);
    
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: 'Custom feed not found'
      });
    }

    if (feed.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Feed is not active for subscriptions'
      });
    }

    if (feed.totalSubscribers >= feed.maxSubscribers) {
      return res.status(400).json({
        success: false,
        message: 'Feed has reached maximum subscribers'
      });
    }

    // Create subscription
    const subscription = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      feedId,
      subscriber,
      amount: parseFloat(amount),
      frequency: frequency || 'hourly',
      createdAt: new Date().toISOString(),
      status: 'active',
      lastPayment: new Date().toISOString(),
      nextPayment: new Date(Date.now() + getFrequencyMs(frequency)).toISOString()
    };

    // Update feed stats
    feed.totalSubscribers += 1;
    feed.metadata.subscription.activeSubscriptions += 1;

    logger.info('Custom feed subscription created:', {
      subscriptionId: subscription.id,
      feedId,
      subscriber,
      amount: subscription.amount,
      frequency: subscription.frequency
    });

    res.json({
      success: true,
      data: subscription,
      message: 'Successfully subscribed to custom feed'
    });

  } catch (error) {
    logger.error('Failed to subscribe to custom feed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Update custom feed price (for feed creators)
 */
router.post('/:feedId/update-price', async (req, res) => {
  try {
    const { feedId } = req.params;
    const { price, confidence, timestamp, creatorSecret } = req.body;

    const feed = customFeeds.find(f => f.id === feedId);
    
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: 'Custom feed not found'
      });
    }

    if (feed.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Feed is not active'
      });
    }

    // Validate price update
    const currentPrice = feed.currentPrice;
    if (currentPrice) {
      const priceChange = Math.abs(price - currentPrice) / currentPrice;
      if (priceChange > feed.metadata.dataValidation.priceChangeThreshold) {
        return res.status(400).json({
          success: false,
          message: `Price change too large: ${(priceChange * 100).toFixed(2)}%`
        });
      }
    }

    // Update price
    const priceUpdate = {
      price: parseFloat(price),
      confidence: parseFloat(confidence) || feed.confidenceThreshold,
      timestamp: timestamp || new Date().toISOString(),
      change: currentPrice ? ((price - currentPrice) / currentPrice * 100).toFixed(2) : 0
    };

    feed.currentPrice = priceUpdate.price;
    feed.lastUpdate = priceUpdate.timestamp;
    feed.priceHistory.push(priceUpdate);

    // Keep only last 100 price updates
    if (feed.priceHistory.length > 100) {
      feed.priceHistory = feed.priceHistory.slice(-100);
    }

    logger.info('Custom feed price updated:', {
      feedId,
      price: priceUpdate.price,
      confidence: priceUpdate.confidence,
      change: priceUpdate.change
    });

    res.json({
      success: true,
      data: priceUpdate,
      message: 'Price updated successfully'
    });

  } catch (error) {
    logger.error('Failed to update custom feed price:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Approve custom feed (admin function)
 */
router.post('/:feedId/approve', async (req, res) => {
  try {
    const { feedId } = req.params;
    const { adminSecret } = req.body;

    // In production, this would verify admin permissions
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const feed = customFeeds.find(f => f.id === feedId);
    
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: 'Custom feed not found'
      });
    }

    if (feed.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Feed is not pending approval'
      });
    }

    // Approve the feed
    feed.status = 'active';
    feed.approvedAt = new Date().toISOString();
    feed.metadata.apiEndpoint = `/api/custom-feeds/${feedId}/price`;

    logger.info('Custom feed approved:', {
      feedId,
      name: feed.name,
      assetCode: feed.assetCode
    });

    res.json({
      success: true,
      data: feed,
      message: 'Custom feed approved successfully'
    });

  } catch (error) {
    logger.error('Failed to approve custom feed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Get custom feed price
 */
router.get('/:feedId/price', async (req, res) => {
  try {
    const { feedId } = req.params;
    
    const feed = customFeeds.find(f => f.id === feedId);
    
    if (!feed) {
      return res.status(404).json({
        success: false,
        message: 'Custom feed not found'
      });
    }

    if (feed.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Feed is not active'
      });
    }

    if (!feed.currentPrice) {
      return res.status(404).json({
        success: false,
        message: 'No price data available'
      });
    }

    res.json({
      success: true,
      data: {
        feedId: feed.id,
        assetCode: feed.assetCode,
        baseCurrency: feed.baseCurrency,
        price: feed.currentPrice,
        confidence: feed.confidenceThreshold,
        lastUpdate: feed.lastUpdate,
        change: feed.priceHistory.length > 1 
          ? feed.priceHistory[feed.priceHistory.length - 1].change 
          : 0
      }
    });

  } catch (error) {
    logger.error('Failed to get custom feed price:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Helper function to get frequency in milliseconds
function getFrequencyMs(frequency) {
  switch (frequency) {
    case 'realtime': return 5000; // 5 seconds
    case 'minute': return 60000; // 1 minute
    case 'hourly': return 3600000; // 1 hour
    case 'daily': return 86400000; // 1 day
    default: return 3600000; // Default to hourly
  }
}

module.exports = router;
