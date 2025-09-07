const express = require('express');
const router = express.Router();
const path = require('path');

// Serve pitch deck assets
router.get('/assets/:filename', (req, res) => {
  const filename = req.params.filename;
  const assetPath = path.join(__dirname, '../assets/pitchdeck', filename);
  
  // Security check to prevent directory traversal
  if (!filename.match(/^[a-zA-Z0-9._-]+$/)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  res.sendFile(assetPath, (err) => {
    if (err) {
      console.error('Error serving asset:', err);
      res.status(404).json({ error: 'Asset not found' });
    }
  });
});

// Get architecture diagram data
router.get('/architecture', (req, res) => {
  try {
    const architectureData = {
      title: "Technical Architecture: KALE-ndar Prediction Market Platform",
      subtitle: "Multi-Layered Blockchain Integration Platform",
      layers: [
        {
          name: "CLIENT LAYER",
          components: [
            {
              name: "Next.js Frontend (TypeScript)",
              features: ["Real-time UI Components", "Market Browser", "Prediction Interface", "Portfolio Management"]
            },
            {
              name: "Mobile SDK (React Native)",
              features: ["Cross-platform Native", "Wallet Integration", "Push Notifications", "Biometric Auth"]
            }
          ]
        },
        {
          name: "API GATEWAY LAYER",
          components: [
            {
              name: "Node.js Microservices Architecture",
              features: ["API Gateway", "Request Routing", "Load Balancing", "Caching Layer (Redis)"]
            },
            {
              name: "Authentication Service",
              features: ["JWT Token Validation", "Rate Limiting", "API Key Management"]
            }
          ]
        },
        {
          name: "BUSINESS LOGIC LAYER",
          components: [
            {
              name: "Market Service",
              features: ["Market Creation", "Resolution"]
            },
            {
              name: "Betting Service",
              features: ["Place Bets", "Calculations"]
            },
            {
              name: "Oracle Service",
              features: ["Price Feeds", "Event Data"]
            },
            {
              name: "Wallet Service",
              features: ["Tx Management", "Balance Tracking"]
            },
            {
              name: "Analytics Engine",
              features: ["Market Trends", "User Analytics"]
            }
          ]
        },
        {
          name: "BLOCKCHAIN LAYER",
          components: [
            {
              name: "Stellar Smart Contracts (Rust)",
              features: ["PredictionMarket Contract", "Market Operations", "Bet Management", "MarketFactory Contract", "Market Creation", "Fee Collection"]
            },
            {
              name: "External Oracle Integration",
              features: ["Reflector Oracle", "Price Data", "Real-world Events", "KALE Token Contract", "Stellar Asset", "SAC Implementation"]
            }
          ]
        },
        {
          name: "DATA LAYER",
          components: [
            {
              name: "TimescaleDB",
              features: ["Market Data", "Time-series", "Analytics"]
            },
            {
              name: "Redis Cluster",
              features: ["Caching", "Session Store", "Rate Limiting"]
            },
            {
              name: "IPFS Cluster",
              features: ["UI Assets", "Metadata", "Static Files"]
            },
            {
              name: "MongoDB Atlas",
              features: ["User Data", "Market Config", "Application"]
            }
          ]
        }
      ],
      specifications: {
        frontend: "Next.js 14 with TypeScript, React Query for state management, Web3.js for blockchain interactions",
        backend: "Node.js microservices with gRPC for inter-service communication, Redis for caching",
        blockchain: "Stellar Soroban smart contracts in Rust, optimized for gas efficiency",
        data: "Multi-model approach with TimescaleDB for time-series data, MongoDB for document storage",
        realtime: "WebSocket connections for market data and event notifications",
        security: "JWT authentication, rate limiting, and comprehensive input validation",
        monitoring: "Prometheus/Grafana for metrics, distributed tracing with Jaeger"
      },
      dataFlow: "Client → API Gateway → Microservices → Smart Contracts → Oracles → Storage",
      scalability: "Horizontal pod autoscaling, database read replicas, CDN for static assets, blockchain RPC load balancing"
    };
    
    res.json(architectureData);
  } catch (error) {
    console.error('Error getting architecture data:', error);
    res.status(500).json({ error: 'Failed to get architecture data' });
  }
});

// Get slideshow configuration
router.get('/slideshow', (req, res) => {
  try {
    const slideshowConfig = {
      images: [
        {
          id: 'architecture-overview',
          title: 'System Architecture Overview',
          description: 'Multi-layered blockchain integration platform',
          url: '/api/pitchdeck/assets/architecture-overview.svg',
          alt: 'KALE-ndar Technical Architecture Diagram'
        },
        {
          id: 'data-flow',
          title: 'Data Flow Architecture',
          description: 'End-to-end data processing pipeline',
          url: '/api/pitchdeck/assets/data-flow.svg',
          alt: 'Data Flow Diagram'
        },
        {
          id: 'scalability',
          title: 'Scalability Features',
          description: 'Horizontal scaling and performance optimization',
          url: '/api/pitchdeck/assets/scalability.svg',
          alt: 'Scalability Architecture'
        }
      ],
      settings: {
        width: 1200,
        height: 675,
        interval: 8000,
        autoPlay: true,
        showControls: true,
        transition: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDuration: 800
      }
    };
    
    res.json(slideshowConfig);
  } catch (error) {
    console.error('Error getting slideshow config:', error);
    res.status(500).json({ error: 'Failed to get slideshow configuration' });
  }
});

module.exports = router;

