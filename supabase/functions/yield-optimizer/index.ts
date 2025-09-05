import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OptimizationStrategy {
  name: string;
  description: string;
  expectedAPY: number;
  riskLevel: 'low' | 'medium' | 'high';
  allocations: Array<{
    asset: string;
    percentage: number;
    strategy: string;
    estimatedAPY: number;
  }>;
}

// Mock yield optimization strategies
const optimizationStrategies: OptimizationStrategy[] = [
  {
    name: 'Conservative Balanced',
    description: 'Low-risk strategy focusing on stable yields with KALE staking and USDC lending',
    expectedAPY: 12.5,
    riskLevel: 'low',
    allocations: [
      { asset: 'KALE', percentage: 60, strategy: 'Staking', estimatedAPY: 15.8 },
      { asset: 'USDC', percentage: 30, strategy: 'Lending Pool', estimatedAPY: 8.2 },
      { asset: 'XLM', percentage: 10, strategy: 'LP Rewards', estimatedAPY: 11.4 }
    ]
  },
  {
    name: 'Aggressive Growth',
    description: 'High-yield strategy with increased KALE farming and DeFi protocols',
    expectedAPY: 28.7,
    riskLevel: 'high',
    allocations: [
      { asset: 'KALE', percentage: 80, strategy: 'Intensive Farming', estimatedAPY: 32.5 },
      { asset: 'USDC', percentage: 15, strategy: 'Yield Farming', estimatedAPY: 18.9 },
      { asset: 'XLM', percentage: 5, strategy: 'LP Rewards', estimatedAPY: 11.4 }
    ]
  },
  {
    name: 'Balanced Diversified',
    description: 'Medium-risk strategy with diversified allocations across multiple assets',
    expectedAPY: 19.3,
    riskLevel: 'medium',
    allocations: [
      { asset: 'KALE', percentage: 50, strategy: 'Staking + Work', estimatedAPY: 22.1 },
      { asset: 'USDC', percentage: 25, strategy: 'Yield Farming', estimatedAPY: 14.7 },
      { asset: 'XLM', percentage: 15, strategy: 'LP Rewards', estimatedAPY: 11.4 },
      { asset: 'BTC', percentage: 10, strategy: 'Lending', estimatedAPY: 6.8 }
    ]
  }
];

interface OptimizationRequest {
  currentBalance: number;
  riskTolerance: 'low' | 'medium' | 'high';
  targetAPY?: number;
  preferredAssets?: string[];
  investmentHorizon?: 'short' | 'medium' | 'long';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'optimize';

    if (action === 'strategies') {
      // Return available optimization strategies
      return new Response(
        JSON.stringify({
          strategies: optimizationStrategies,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (action === 'optimize') {
      const optimizationRequest: OptimizationRequest = await req.json();
      
      console.log('Processing yield optimization request:', optimizationRequest);

      // Select best strategy based on risk tolerance and preferences
      let selectedStrategy = optimizationStrategies.find(
        s => s.riskLevel === optimizationRequest.riskTolerance
      ) || optimizationStrategies[1]; // Default to balanced

      // If target APY is specified, try to find closest match
      if (optimizationRequest.targetAPY) {
        const closestStrategy = optimizationStrategies.reduce((prev, curr) => 
          Math.abs(curr.expectedAPY - optimizationRequest.targetAPY!) < 
          Math.abs(prev.expectedAPY - optimizationRequest.targetAPY!) ? curr : prev
        );
        selectedStrategy = closestStrategy;
      }

      // Calculate actual allocations in tokens
      const allocations = selectedStrategy.allocations.map(alloc => ({
        ...alloc,
        amount: (optimizationRequest.currentBalance * alloc.percentage) / 100,
        estimatedReturns: (optimizationRequest.currentBalance * alloc.percentage * alloc.estimatedAPY) / 100 / 100
      }));

      const totalEstimatedReturns = allocations.reduce((sum, alloc) => sum + alloc.estimatedReturns, 0);

      // Simulate optimization processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      return new Response(
        JSON.stringify({
          success: true,
          selectedStrategy: {
            ...selectedStrategy,
            allocations
          },
          optimization: {
            currentBalance: optimizationRequest.currentBalance,
            projectedAPY: selectedStrategy.expectedAPY,
            estimatedAnnualReturns: totalEstimatedReturns,
            optimizationScore: Math.min(100, 75 + Math.random() * 20), // 75-95%
            riskScore: selectedStrategy.riskLevel === 'low' ? 25 : 
                      selectedStrategy.riskLevel === 'medium' ? 50 : 75
          },
          recommendations: [
            'Monitor KALE farming rewards daily for optimal work cycles',
            'Rebalance portfolio monthly based on market conditions',
            'Consider increasing USDC allocation during high volatility periods'
          ],
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: `Unknown action: ${action}`,
        availableActions: ['optimize', 'strategies']
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Yield optimizer error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process yield optimization request',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})