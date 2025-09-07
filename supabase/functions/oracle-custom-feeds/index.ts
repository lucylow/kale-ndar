import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method } = req;

    if (method === 'POST') {
      // Create a new custom feed
      const body = await req.json();
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
        creator
      } = body;

      // Validate required fields
      if (!name || !assetCode || !description || !creator) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required fields: name, assetCode, description, creator' 
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Create the custom feed record
      const feedData = {
        name,
        description,
        asset_code: assetCode,
        base_currency: baseCurrency || 'USD',
        data_source: dataSource || 'external_api',
        update_frequency: updateFrequency || 'hourly',
        confidence_threshold: confidenceThreshold || 80,
        cost_per_update: costPerUpdate || 1.0,
        max_subscribers: maxSubscribers || 1000,
        is_public: isPublic !== false,
        creator_address: creator,
        status: 'pending',
        total_subscribers: 0,
        total_revenue: 0,
        created_at: new Date().toISOString()
      };

      const { data: feed, error: feedError } = await supabase
        .from('custom_feeds')
        .insert([feedData])
        .select()
        .single();

      if (feedError) {
        console.error('Error creating custom feed:', feedError);
        return new Response(
          JSON.stringify({ error: 'Failed to create custom feed' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('Custom feed created successfully:', feed);

      return new Response(
        JSON.stringify({ 
          success: true, 
          feed,
          message: 'Custom feed created successfully and is pending approval'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } else if (method === 'GET') {
      // Get custom feeds
      const url = new URL(req.url);
      const creator = url.searchParams.get('creator');
      const status = url.searchParams.get('status');
      const isPublic = url.searchParams.get('public');

      let query = supabase.from('custom_feeds').select('*');

      // Apply filters
      if (creator) {
        query = query.eq('creator_address', creator);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (isPublic) {
        query = query.eq('is_public', isPublic === 'true');
      }

      const { data: feeds, error: feedsError } = await query
        .order('created_at', { ascending: false });

      if (feedsError) {
        console.error('Error fetching custom feeds:', feedsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch custom feeds' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ feeds }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})