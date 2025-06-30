
-- Create table for storing user prompts and generated flashcards
CREATE TABLE public.flashcard_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for individual flashcards
CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID REFERENCES public.flashcard_sets ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking quiz sessions and progress
CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  set_id UUID REFERENCES public.flashcard_sets ON DELETE CASCADE NOT NULL,
  current_card_index INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for flashcard_sets
CREATE POLICY "Users can view their own flashcard sets" 
  ON public.flashcard_sets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flashcard sets" 
  ON public.flashcard_sets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard sets" 
  ON public.flashcard_sets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcard sets" 
  ON public.flashcard_sets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for flashcards (accessed through flashcard_sets)
CREATE POLICY "Users can view flashcards from their sets" 
  ON public.flashcards 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE flashcard_sets.id = flashcards.set_id 
      AND flashcard_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create flashcards for their sets" 
  ON public.flashcards 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE flashcard_sets.id = flashcards.set_id 
      AND flashcard_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update flashcards from their sets" 
  ON public.flashcards 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE flashcard_sets.id = flashcards.set_id 
      AND flashcard_sets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete flashcards from their sets" 
  ON public.flashcards 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_sets 
      WHERE flashcard_sets.id = flashcards.set_id 
      AND flashcard_sets.user_id = auth.uid()
    )
  );

-- Create policies for quiz_sessions
CREATE POLICY "Users can view their own quiz sessions" 
  ON public.quiz_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz sessions" 
  ON public.quiz_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz sessions" 
  ON public.quiz_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quiz sessions" 
  ON public.quiz_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);
