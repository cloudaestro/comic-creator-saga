import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { script, numPanels, style } = await req.json()
    
    // Process script with GPT-4
    const scriptAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a comic script analyzer. Your task is to break down the script into exactly ${numPanels} scenes with characters and dialogues.
            You must respond with a valid JSON object in the following format exactly:
            {
              "scenes": [
                {
                  "description": "Brief scene description",
                  "characters": ["Character1", "Character2"],
                  "dialogues": ["Character1: Hello", "Character2: Hi"]
                }
              ]
            }
            Do not include any explanations or additional text, only the JSON object.`
          },
          { role: 'user', content: script }
        ],
        temperature: 0.7,
      }),
    })

    if (!scriptAnalysisResponse.ok) {
      throw new Error(`OpenAI API error: ${scriptAnalysisResponse.statusText}`);
    }

    const scriptAnalysisData = await scriptAnalysisResponse.json()
    const gptResponse = scriptAnalysisData.choices[0].message.content;
    
    // Validate JSON response
    let scenes;
    try {
      scenes = JSON.parse(gptResponse);
      if (!scenes.scenes || !Array.isArray(scenes.scenes)) {
        throw new Error('Invalid response format from GPT');
      }
    } catch (error) {
      console.error('GPT response parsing error:', gptResponse);
      throw new Error('Failed to parse GPT response as JSON');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate and save images for each scene
    const panelsPromises = scenes.scenes.map(async (scene: any, index: number) => {
      // Generate image with DALL-E
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `Create a ${style}-style comic panel for the following scene: ${scene.description}. Include characters: ${scene.characters.join(', ')}. Style: ${style} comic art, clear and detailed, maintaining consistent character designs and art style throughout the series.`,
          n: 1,
          size: "1024x1024",
        }),
      })

      if (!imageResponse.ok) {
        throw new Error(`DALL-E API error: ${imageResponse.statusText}`);
      }

      const imageData = await imageResponse.json()
      const imageUrl = imageData.data[0].url;

      // Download the image
      const imageDownloadResponse = await fetch(imageUrl);
      if (!imageDownloadResponse.ok) {
        throw new Error('Failed to download image');
      }

      // Convert the image to a blob
      const imageBlob = await imageDownloadResponse.blob();

      // Generate a unique filename
      const filename = `${crypto.randomUUID()}.png`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('comic_panels')
        .upload(filename, imageBlob, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('comic_panels')
        .getPublicUrl(filename);

      return {
        ...scene,
        image_url: publicUrl,
        sequence_number: index + 1
      }
    })

    const panels = await Promise.all(panelsPromises)

    return new Response(
      JSON.stringify({ panels }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing comic script:', error)
    return new Response(
      JSON.stringify({ error: `Error processing comic script: ${error.message}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})