
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, title, userId } = await req.json();
    
    if (!prompt || !title || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate flashcards using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a flashcard generator. Create 8-12 high-quality flashcards based on the user's prompt. 
            Return ONLY a JSON array of objects with "question" and "answer" fields. 
            Make questions clear and concise. Answers should be comprehensive but not too long.
            Focus on key concepts, definitions, and important facts.`
          },
          {
            role: 'user',
            content: `Create flashcards for: ${prompt}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate flashcards');
    }

    const data = await response.json();
    const flashcardsText = data.choices[0].message.content;
    
    // Parse the JSON response
    let flashcards;
    try {
      flashcards = JSON.parse(flashcardsText);
    } catch (e) {
      console.error('Failed to parse flashcards JSON:', flashcardsText);
      throw new Error('Invalid response format from OpenAI');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create flashcard set
    const { data: flashcardSet, error: setError } = await supabase
      .from('flashcard_sets')
      .insert({
        user_id: userId,
        title: title,
        prompt: prompt
      })
      .select()
      .single();

    if (setError) {
      console.error('Error creating flashcard set:', setError);
      throw new Error('Failed to create flashcard set');
    }

    // Insert flashcards
    const flashcardInserts = flashcards.map((card: any) => ({
      set_id: flashcardSet.id,
      question: card.question,
      answer: card.answer,
      difficulty: 'medium'
    }));

    const { error: cardsError } = await supabase
      .from('flashcards')
      .insert(flashcardInserts);

    if (cardsError) {
      console.error('Error inserting flashcards:', cardsError);
      throw new Error('Failed to save flashcards');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        flashcardSet: flashcardSet,
        flashcards: flashcards 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-flashcards function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
