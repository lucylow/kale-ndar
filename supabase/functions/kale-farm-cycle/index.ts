import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FarmCycleResult {
  plantResult?: any;
  workResult?: any;
  harvestResult?: any;
  totalRewards: number;
  cycleTime: number;
}

// Mock KALE farming operations
async function mockPlantKale(amount: number) {
  console.log(`Planting KALE stake: ${amount} tokens`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  return {
    success: true,
    stakeId: `stake_${Date.now()}`,
    amount,
    transactionHash: `plant_${Date.now()}`,
    gasUsed: '12500'
  };
}

async function mockWorkKale(stakeId: string) {
  console.log(`Performing KALE work for stake: ${stakeId}`);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const difficulty = Math.floor(Math.random() * 1000000) + 500000;
  const reward = Math.random() * 5 + 2; // 2-7 KALE reward
  
  return {
    success: true,
    stakeId,
    difficulty,
    reward,
    nonce: Math.floor(Math.random() * 1000000),
    transactionHash: `work_${Date.now()}`
  };
}

async function mockHarvestKale(stakeId: string) {
  console.log(`Harvesting KALE rewards for stake: ${stakeId}`);
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const harvestedAmount = Math.random() * 50 + 25; // 25-75 KALE
  
  return {
    success: true,
    stakeId,
    harvestedAmount,
    transactionHash: `harvest_${Date.now()}`,
    newStakeAmount: Math.random() * 1000 + 500
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const result: FarmCycleResult = {
      totalRewards: 0,
      cycleTime: 0
    };

    console.log('Starting KALE farming cycle...');

    // Step 1: Plant (stake) KALE tokens
    const stakeAmount = 100; // Default stake amount
    result.plantResult = await mockPlantKale(stakeAmount);
    
    if (!result.plantResult.success) {
      throw new Error('Failed to plant KALE tokens');
    }

    // Step 2: Perform work (proof-of-teamwork)
    result.workResult = await mockWorkKale(result.plantResult.stakeId);
    
    if (result.workResult.success) {
      result.totalRewards += result.workResult.reward;
    }

    // Step 3: Harvest rewards
    result.harvestResult = await mockHarvestKale(result.plantResult.stakeId);
    
    if (result.harvestResult.success) {
      result.totalRewards += result.harvestResult.harvestedAmount;
    }

    result.cycleTime = Date.now() - startTime;

    console.log(`KALE farming cycle completed. Total rewards: ${result.totalRewards} KALE`);

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        message: 'KALE farming cycle completed successfully',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('KALE farming cycle error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to complete KALE farming cycle',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})