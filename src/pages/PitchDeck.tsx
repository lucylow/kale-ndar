import React, { useState, useEffect } from 'react';
import HorizontalSlideshow from '@/components/HorizontalSlideshow';
import { apiService } from '@/services/api';

const PitchDeck: React.FC = () => {
  const [architectureData, setArchitectureData] = useState<any>(null);
  const [slideshowConfig, setSlideshowConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch architecture data and slideshow config from backend
        const [archResponse, slideshowResponse] = await Promise.all([
          fetch('/api/pitchdeck/architecture'),
          fetch('/api/pitchdeck/slideshow')
        ]);
        
        if (!archResponse.ok || !slideshowResponse.ok) {
          throw new Error('Failed to fetch pitch deck data');
        }
        
        const archData = await archResponse.json();
        const slideshowData = await slideshowResponse.json();
        
        setArchitectureData(archData);
        setSlideshowConfig(slideshowData);
        
      } catch (err) {
        console.error('Error fetching pitch deck data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pitch deck data');
        
        // Fallback to local data
        const fallbackArchitecture = {
          title: "Technical Architecture: KALE-ndar Prediction Market Platform",
          subtitle: "Multi-Layered Blockchain Integration Platform",
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
        
        setArchitectureData(fallbackArchitecture);
        
        const fallbackSlideshow = {
          images: [
            {
              id: 'architecture-overview',
              title: 'System Architecture Overview',
              description: 'Multi-layered blockchain integration platform',
              url: '/api/pitchdeck/assets/architecture-overview.svg',
              alt: 'KALE-ndar Technical Architecture Diagram'
            }
          ],
          settings: {
            width: 1200,
            height: 675,
            interval: 8000,
            autoPlay: true,
            showControls: true
          }
        };
        
        setSlideshowConfig(fallbackSlideshow);
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pitch deck...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Pitch Deck</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const slides = slideshowConfig?.images?.map((img: any) => img.url) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {architectureData?.title || 'KALE-ndar Technical Architecture'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {architectureData?.subtitle || 'Multi-layered blockchain integration platform showcasing our prediction market infrastructure'}
          </p>
        </div>

        <div className="flex justify-center">
          <HorizontalSlideshow
            images={slides}
            width={slideshowConfig?.settings?.width || 1200}
            height={slideshowConfig?.settings?.height || 675}
            interval={slideshowConfig?.settings?.interval || 8000}
            autoPlay={slideshowConfig?.settings?.autoPlay !== false}
            showControls={slideshowConfig?.settings?.showControls !== false}
            className="shadow-2xl"
          />
        </div>

        {/* Technical Specifications */}
        {architectureData?.specifications && (
          <div className="mt-12 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Technical Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Frontend</h3>
                  <p className="text-sm text-blue-700">{architectureData.specifications.frontend}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Backend</h3>
                  <p className="text-sm text-green-700">{architectureData.specifications.backend}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Blockchain</h3>
                  <p className="text-sm text-purple-700">{architectureData.specifications.blockchain}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">Data</h3>
                  <p className="text-sm text-orange-700">{architectureData.specifications.data}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">Real-time Updates</h3>
                  <p className="text-sm text-red-700">{architectureData.specifications.realtime}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-indigo-900 mb-2">Security</h3>
                  <p className="text-sm text-indigo-700">{architectureData.specifications.security}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Flow Information */}
        {architectureData?.dataFlow && (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Data Flow</h3>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <span className="bg-blue-100 px-3 py-1 rounded-full">Client</span>
                <span>→</span>
                <span className="bg-green-100 px-3 py-1 rounded-full">API Gateway</span>
                <span>→</span>
                <span className="bg-purple-100 px-3 py-1 rounded-full">Microservices</span>
                <span>→</span>
                <span className="bg-orange-100 px-3 py-1 rounded-full">Smart Contracts</span>
                <span>→</span>
                <span className="bg-red-100 px-3 py-1 rounded-full">Oracles</span>
                <span>→</span>
                <span className="bg-indigo-100 px-3 py-1 rounded-full">Storage</span>
              </div>
            </div>
          </div>
        )}

        {/* Scalability Features */}
        {architectureData?.scalability && (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Scalability Features</h3>
              <p className="text-gray-600">{architectureData.scalability}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PitchDeck;
