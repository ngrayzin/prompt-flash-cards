
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useQuizSession(setId: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [isUpdatingHighScore, setIsUpdatingHighScore] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchHighScore();
  }, [setId, user]);

  const fetchHighScore = async () => {
    if (!user) return;

    try {
      console.log("Fetching high score for set:", setId);

      const { data, error } = await supabase
        .from("flashcard_sets")
        .select("highscore")
        .eq("id", setId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching high score:", error);
        throw error;
      }

      console.log("High score data:", data);
      const currentHighScore = data?.highscore || 0;
      setHighScore(currentHighScore);
      console.log("Set high score to:", currentHighScore);
    } catch (error) {
      console.error("Error fetching high score:", error);
      setHighScore(0);
    }
  };

  const updateHighScore = async (newScore: number) => {
    if (!user || newScore <= highScore) return;

    setIsUpdatingHighScore(true);
    try {
      console.log("Updating high score from", highScore, "to", newScore);

      const { error } = await supabase
        .from("flashcard_sets")
        .update({ 
          highscore: newScore,
          updated_at: new Date().toISOString()
        })
        .eq("id", setId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating high score:", error);
        throw error;
      }

      setHighScore(newScore);
      console.log("High score updated successfully to:", newScore);
    } catch (error) {
      console.error("Error updating high score:", error);
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
      console.error("Error creating quiz session:", error);
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
        console.error("Error updating session:", error);
        throw error;
      }

      console.log("Session updated successfully:", {
        sessionId,
        correctAnswers,
        completed: quizCompleted,
      });

      // If quiz is completed, check if we need to update high score
      if (quizCompleted) {
        await updateHighScore(correctAnswers);
      }
    } catch (error) {
      console.error("Error updating session:", error);
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

  return {
    sessionId,
    highScore,
    isUpdatingHighScore,
    createQuizSession,
    updateSession,
    fetchHighScore,
    updateHighScore,
    getHighScorePercentage,
    getCurrentScorePercentage,
  };
}
