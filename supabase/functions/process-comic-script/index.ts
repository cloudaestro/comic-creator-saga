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
    
    console.log('Processing script:', { script, numPanels, style });
    
    // Process script with GPT-4
    const scriptAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a comic script analyzer. Break down the script into exactly ${numPanels} scenes with characters and dialogues.
            You must respond with a valid JSON object in this exact format, with no additional text or explanation:
            {
              "scenes": [
                {
                  "description": "string describing the scene",
                  "characters": ["array of character names"],
                  "dialogues": ["array of dialogue lines"]
                }
              ]
            }
            The response must be pure JSON, no markdown, no text before or after. Ensure all strings are properly escaped.`
          },
          { role: 'user', content: script }
        ],
        temperature: 0.7,
      }),
    })

    if (!scriptAnalysisResponse.ok) {
      console.error('OpenAI API error:', await scriptAnalysisResponse.text());
      throw new Error(`OpenAI API error: ${scriptAnalysisResponse.statusText}`);
    }

    const scriptAnalysisData = await scriptAnalysisResponse.json()
    console.log('GPT Response:', scriptAnalysisData);
    
    const gptResponse = scriptAnalysisData.choices[0].message.content;
    console.log('GPT Content:', gptResponse);
    
    // Validate JSON response
    let scenes;
    try {
      scenes = JSON.parse(gptResponse);
      if (!scenes.scenes || !Array.isArray(scenes.scenes)) {
        console.error('Invalid response format:', scenes);
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
      console.log(`Generating image for scene ${index + 1}:`, scene);
      
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
        console.error('DALL-E API error:', await imageResponse.text());
        throw new Error(`DALL-E API error: ${imageResponse.statusText}`);
      }

      const imageData = await imageResponse.json()
      const imageUrl = imageData.data[0].url;
      console.log(`Generated image URL for scene ${index + 1}:`, imageUrl);

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
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      console.log(`Successfully uploaded image ${filename} to storage`);

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
    console.log('Successfully processed all panels:', panels);

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