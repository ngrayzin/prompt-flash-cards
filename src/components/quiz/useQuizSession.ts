import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useQuizSession(setId: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [isUpdatingHighScore, setIsUpdatingHighScore] =
    useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchHighScore();
  }, [setId, user]);

  const fetchHighScore = async () => {
    if (!user) return;
    if (isUpdatingHighScore) return; // Prevent concurrent updates

    setIsUpdatingHighScore(true);
    try {
      const { data, error } = await supabase
        .from("quiz_sessions")
        .select("correct_answers, created_at")
        .eq("user_id", user.id)
        .eq("set_id", setId)
        .eq("completed", true)
        .order("correct_answers", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setHighScore(data[0].correct_answers);
      } else {
        setHighScore(0);
      }
    } catch (error) {
      // Silent error handling - high score remains at current value
    } finally {
      setIsUpdatingHighScore(false);
    }
  };

  const createQuizSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("quiz_sessions")
        .insert({
          user_id: user.id,
          set_id: setId,
          current_card_index: 0,
          correct_answers: 0,
          total_attempts: 0,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (error) {
      // Silent error handling - session creation failed
    }
  };

  const updateSession = async (
    currentIndex: number,
    correctAnswers: number,
    answeredCards: boolean[],
    quizCompleted: boolean
  ) => {
    if (!sessionId) return;

    try {
      const totalAttempts = answeredCards.filter(Boolean).length;

      const { error } = await supabase
        .from("quiz_sessions")
        .update({
          current_card_index: currentIndex,
          correct_answers: correctAnswers,
          total_attempts: totalAttempts,
          completed: quizCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) {
        throw error;
      }

      // If quiz is completed, immediately check and update high score
      if (quizCompleted) {
        // Wait a moment for the database to process the update
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update local high score immediately if this is better
        if (correctAnswers > highScore) {
          setHighScore(correctAnswers);
        }

        // Also fetch from database to ensure consistency
        await fetchHighScore();
      }
    } catch (error) {
      throw error;
    }
  };

  const getHighScorePercentage = (totalCards: number) => {
    return totalCards > 0 ? Math.round((highScore / totalCards) * 100) : 0;
  };

  const getCurrentScorePercentage = (
    correctAnswers: number,
    totalCards: number
  ) => {
    return totalCards > 0 ? Math.round((correctAnswers / totalCards) * 100) : 0;
  };

  const verifySessionSaved = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  };

  const refreshHighScore = async () => {
    await fetchHighScore();
  };

  return {
    sessionId,
    highScore,
    isUpdatingHighScore,
    createQuizSession,
    updateSession,
    fetchHighScore,
    refreshHighScore,
    getHighScorePercentage,
    getCurrentScorePercentage,
    verifySessionSaved,
  };
}
