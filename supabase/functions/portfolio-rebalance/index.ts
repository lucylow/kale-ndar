import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PortfolioPosition {
  assetCode: string;
  assetIssuer?: string;
  amount: number;
  targetWeight: number;
  price?: string;
  value?: number;
}

interface RebalanceAction {
  assetCode: string;
  assetIssuer?: string;
  currentAmount: number;
  price: number;
  adjustment: number;
  action: 'buy' | 'sell' | 'hold';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { portfolio } = await req.json() as { portfolio: PortfolioPosition[] };

    console.log('Starting portfolio rebalance for assets:', portfolio.map(p => p.assetCode));

    // Mock price fetching from Reflector oracle
    const prices = await Promise.all(portfolio.map(async (pos) => {
      const assetId = pos.assetIssuer ? `${pos.assetCode}:${pos.assetIssuer}` : pos.assetCode;
      
      // Mock price data - in production, fetch from Reflector oracle
      let mockPrice = 1.0;
      if (pos.assetCode === 'KALE') mockPrice = 0.125;
      if (pos.assetCode === 'USDC') mockPrice = 1.001;
      if (pos.assetCode === 'XLM') mockPrice = 0.089;
      
      return { assetId, price: mockPrice };
    }));

    // Build price map
    const priceMap: Record<string, number> = {};
    prices.forEach(p => { priceMap[p.assetId] = p.price; });

    let totalValue = 0;
    const assetValues = portfolio.map(pos => {
      const id = pos.assetIssuer ? `${pos.assetCode}:${pos.assetIssuer}` : pos.assetCode;
      const price = priceMap[id] || 0;
      const value = price * pos.amount;
      totalValue += value;
      return { ...pos, price, value };
    });

    // Calculate rebalancing actions
    const actions: RebalanceAction[] = assetValues.map(pos => {
      const targetValue = totalValue * pos.targetWeight;
      const diffValue = pos.value - targetValue;
      const adjustment = -diffValue / pos.price;
      
      let action: 'buy' | 'sell' | 'hold' = 'hold';
      if (Math.abs(adjustment) > 0.01) {
        action = adjustment > 0 ? 'buy' : 'sell';
      }

      return {
        assetCode: pos.assetCode,
        assetIssuer: pos.assetIssuer,
        currentAmount: pos.amount,
        price: pos.price,
        adjustment,
        action
      };
    });

    // Log rebalancing recommendations
    actions.forEach(action => {
      if (action.action === 'hold') {
        console.log(`Asset ${action.assetCode} within target range, no rebalance needed.`);
      } else if (action.action === 'buy') {
        console.log(`Recommend buying ${action.adjustment.toFixed(4)} of ${action.assetCode}`);
      } else {
        console.log(`Recommend selling ${(-action.adjustment).toFixed(4)} of ${action.assetCode}`);
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        actions,
        totalValue,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Portfolio rebalance error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to rebalance portfolio',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})