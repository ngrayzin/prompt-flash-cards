
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useQuizSession(setId: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchHighScore();
  }, [setId, user]);

  const fetchHighScore = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('correct_answers')
        .eq('user_id', user.id)
        .eq('set_id', setId)
        .eq('completed', true)
        .order('correct_answers', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setHighScore(data[0].correct_answers);
      }
    } catch (error) {
      console.error('Error fetching high score:', error);
    }
  };

  const createQuizSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          set_id: setId,
          current_card_index: 0,
          correct_answers: 0,
          total_attempts: 0,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (error) {
      console.error('Error creating quiz session:', error);
    }
  };

  const updateSession = async (currentIndex: number, correctAnswers: number, answeredCards: boolean[], quizCompleted: boolean) => {
    if (!sessionId) return;

    try {
      await supabase
        .from('quiz_sessions')
        .update({
          current_card_index: currentIndex,
          correct_answers: correctAnswers,
          total_attempts: answeredCards.filter(Boolean).length,
          completed: quizCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      // Update local high score if this is a new record and quiz is completed
      if (quizCompleted && correctAnswers > highScore) {
        setHighScore(correctAnswers);
        // Fetch updated high score from database to ensure consistency
        await fetchHighScore();
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  return {
    sessionId,
    highScore,
    createQuizSession,
    updateSession,
    fetchHighScore
  };
}
