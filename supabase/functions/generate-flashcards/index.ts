
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text extraction function for different file types
function extractTextFromFile(file: { name: string; type: string; content: string }): string {
  try {
    // Decode base64 content
    const binaryString = atob(file.content);
    
    // For text files, try to decode as UTF-8
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(uint8Array);
    }
    
    // For HTML files
    if (file.type === 'text/html' || file.name.endsWith('.html')) {
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(uint8Array);
    }
    
    // For other file types, return basic info
    return `Content from file: ${file.name} (${file.type})`;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return `Unable to extract text from ${file.name}`;
  }
}

// Function to clean and parse JSON response from OpenAI
function parseFlashcardsFromResponse(responseText: string): any[] {
  try {
    // First, try to parse as direct JSON
    return JSON.parse(responseText);
  } catch (e) {
    // If that fails, try to extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (parseError) {
        console.error('Failed to parse JSON from markdown block:', jsonMatch[1]);
        throw new Error('Invalid JSON format in markdown block');
      }
    }
    
    // If no markdown blocks found, try to find JSON array pattern
    const arrayMatch = responseText.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse JSON array:', arrayMatch[0]);
        throw new Error('Invalid JSON array format');
      }
    }
    
    console.error('No valid JSON found in response:', responseText);
    throw new Error('No valid JSON format found in response');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, title, userId, files = [] } = await req.json();
    
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

    // Process uploaded files to extract context
    let additionalContext = '';
    if (files && files.length > 0) {
      const fileTexts = files.map(extractTextFromFile);
      additionalContext = '\n\nAdditional context from uploaded files:\n' + fileTexts.join('\n\n');
    }

    // Enhanced prompt with file context
    const enhancedPrompt = prompt + additionalContext;

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
            content: `You are a flashcard generator. Create 8-12 high-quality flashcards based on the user's prompt and any additional context provided. 
            Return ONLY a JSON array of objects with "question" and "answer" fields. 
            Make questions clear and concise. Answers should be comprehensive but not too long.
            Focus on key concepts, definitions, and important facts.
            If additional context from files is provided, incorporate relevant information from those files into the flashcards.
            Do not wrap your response in markdown code blocks - return pure JSON only.`
          },
          {
            role: 'user',
            content: `Create flashcards for: ${enhancedPrompt}`
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
    
    console.log('OpenAI response:', flashcardsText);
    
    // Parse the response using the improved parser
    let flashcards;
    try {
      flashcards = parseFlashcardsFromResponse(flashcardsText);
    } catch (e) {
      console.error('Failed to parse flashcards:', e.message);
      console.error('Raw response:', flashcardsText);
      throw new Error(`Invalid response format from OpenAI: ${e.message}`);
    }

    // Validate the parsed data
    if (!Array.isArray(flashcards)) {
      throw new Error('Response is not an array of flashcards');
    }

    // Validate each flashcard has required fields
    for (const card of flashcards) {
      if (!card.question || !card.answer) {
        throw new Error('Each flashcard must have question and answer fields');
      }
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
        prompt: enhancedPrompt
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
