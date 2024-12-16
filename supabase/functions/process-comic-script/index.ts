import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const { script } = await req.json()
    
    // Process script with GPT-4
    const scriptAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a comic script analyzer. Extract scenes, characters, and dialogues from the script. Format the response as JSON with the following structure: { scenes: [{ description, characters: [], dialogues: [] }] }'
          },
          { role: 'user', content: script }
        ],
      }),
    })

    const scriptAnalysis = await scriptAnalysisResponse.json()
    const scenes = JSON.parse(scriptAnalysis.choices[0].message.content)

    // Generate images for each scene with DALL-E
    const panelsPromises = scenes.scenes.map(async (scene: any, index: number) => {
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `Create a comic panel for the following scene: ${scene.description}. Include characters: ${scene.characters.join(', ')}. Style: comic book art, clear and detailed.`,
          n: 1,
          size: "1024x1024",
        }),
      })

      const imageData = await imageResponse.json()
      return {
        ...scene,
        image_url: imageData.data[0].url,
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
      JSON.stringify({ error: `Error generating comic: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})