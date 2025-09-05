import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserWalletInfo {
  publicKey: string;
  balance: number;
  stakeInfo?: {
    totalStaked: number;
    activeStakes: number;
    pendingRewards: number;
    apy: number;
  };
}

// Mock user wallet data
const mockUserData: UserWalletInfo = {
  publicKey: 'GDKIJJIKXLOM2NRMPNQZUUYK24ZPVFC7426ODQVMCDQVRDJ4RJSXZ5CV',
  balance: 5247.89,
  stakeInfo: {
    totalStaked: 2500,
    activeStakes: 3,
    pendingRewards: 127.45,
    apy: 15.8
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.pathname.split('/').pop();

    console.log(`User wallet endpoint: ${endpoint}`);

    switch (endpoint) {
      case 'publicKey':
        // Return user's public key
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate auth check
        
        return new Response(
          JSON.stringify({
            publicKey: mockUserData.publicKey,
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );

      case 'balance':
        // Return user's KALE balance
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Add some realistic balance variation
        const balanceVariation = (Math.random() - 0.5) * 100; // ±50 KALE
        const currentBalance = mockUserData.balance + balanceVariation;
        
        return new Response(
          JSON.stringify({
            balance: Math.max(0, currentBalance),
            currency: 'KALE',
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );

      case 'staking':
        // Return user's staking information
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const updatedStakeInfo = {
          ...mockUserData.stakeInfo!,
          pendingRewards: mockUserData.stakeInfo!.pendingRewards + Math.random() * 5, // Growing rewards
          apy: 15.8 + (Math.random() - 0.5) * 2 // APY variation ±1%
        };
        
        return new Response(
          JSON.stringify({
            ...updatedStakeInfo,
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );

      case 'profile':
        // Return complete user profile
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return new Response(
          JSON.stringify({
            ...mockUserData,
            stakeInfo: {
              ...mockUserData.stakeInfo!,
              pendingRewards: mockUserData.stakeInfo!.pendingRewards + Math.random() * 5
            },
            lastUpdated: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );

      default:
        return new Response(
          JSON.stringify({ 
            error: `Unknown endpoint: ${endpoint}`,
            availableEndpoints: ['publicKey', 'balance', 'staking', 'profile']
          }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

  } catch (error) {
    console.error('User wallet service error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch user wallet information',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})