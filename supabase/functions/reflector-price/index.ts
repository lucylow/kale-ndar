import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PriceData {
  price: string;
  timestamp: number;
  confidence: number;
  source: string;
  decimals: number;
}

// Mock Reflector oracle price feeds
const mockPriceFeeds: Record<string, PriceData> = {
  'KALE:GBDVX4VELCDSQ54KQJYTNHXAHFLBCA77ZY2USQBM4CSHTTV7DME7KALE': {
    price: '12500000000000000', // 0.125 USD with 14 decimals
    timestamp: Date.now(),
    confidence: 95,
    source: 'stellar-dex',
    decimals: 14
  },
  'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN': {
    price: '100100000000000000', // 1.001 USD with 14 decimals
    timestamp: Date.now(),
    confidence: 99,
    source: 'stellar-dex',
    decimals: 14
  },
  'XLM': {
    price: '8900000000000000', // 0.089 USD with 14 decimals
    timestamp: Date.now(),
    confidence: 98,
    source: 'aggregated',
    decimals: 14
  },
  'BTC': {
    price: '4350000000000000000', // 43,500 USD with 14 decimals
    timestamp: Date.now(),
    confidence: 99,
    source: 'aggregated',
    decimals: 14
  }
};

// Helper function to format price from fixed decimal format
function formatPrice(priceStr: string, decimals: number = 14): string {
  if (!priceStr) return '0';
  const num = BigInt(priceStr);
  const divisor = BigInt(10 ** decimals);
  const whole = num / divisor;
  const fraction = num % divisor;
  const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return fractionStr ? `${whole}.${fractionStr}` : whole.toString();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const contractId = url.searchParams.get('contract');
    const asset = url.searchParams.get('asset');

    if (!contractId || !asset) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: contract and asset' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Fetching Reflector price for asset: ${asset} from contract: ${contractId}`);

    // Simulate fetching from Reflector oracle
    await new Promise(resolve => setTimeout(resolve, 200)); // Network delay

    const priceData = mockPriceFeeds[asset];
    
    if (!priceData) {
      return new Response(
        JSON.stringify({ 
          error: `Price feed not available for asset: ${asset}` 
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Add some realistic price variation (±0.5%)
    const variation = (Math.random() - 0.5) * 0.01; // ±0.5%
    const basePrice = BigInt(priceData.price);
    const variationAmount = basePrice * BigInt(Math.floor(variation * 1000)) / BigInt(100000);
    const adjustedPrice = (basePrice + variationAmount).toString();

    const responseData = {
      ...priceData,
      price: adjustedPrice,
      formattedPrice: formatPrice(adjustedPrice, priceData.decimals),
      timestamp: Date.now(), // Fresh timestamp
      contractId,
      asset
    };

    console.log(`Price for ${asset}: ${responseData.formattedPrice} USD`);

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Reflector price fetch error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch price from Reflector oracle',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})