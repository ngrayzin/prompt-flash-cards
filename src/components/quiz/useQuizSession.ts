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
      console.log("Fetching high score for user:", user.id, "set:", setId);

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
        console.error("Error in fetchHighScore query:", error);
        throw error;
      }

      console.log("High score query result:", data);

      if (data && data.length > 0) {
        console.log("Setting high score to:", data[0].correct_answers);
        setHighScore(data[0].correct_answers);
      } else {
        console.log("No completed sessions found, high score remains 0");
        setHighScore(0);
      }
    } catch (error) {
      console.error("Error fetching high score:", error);
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

      // If quiz is completed, immediately check and update high score
      if (quizCompleted) {
        console.log("Quiz completed, updating high score...");

        // Wait a moment for the database to process the update
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Double-check that the session was actually saved with completed=true
        const savedSession = await verifySessionSaved(sessionId);
        if (
          savedSession &&
          savedSession.completed &&
          savedSession.correct_answers === correctAnswers
        ) {
          console.log("Session successfully saved as completed");

          // Update local high score immediately if this is better
          if (correctAnswers > highScore) {
            console.log(
              "New high score detected, updating from",
              highScore,
              "to",
              correctAnswers
            );
            setHighScore(correctAnswers);
          }

          // Also fetch from database to ensure consistency
          await fetchHighScore();
        } else {
          console.warn(
            "Session may not have been saved correctly:",
            savedSession
          );

          // Still try to fetch high score in case there were other completed sessions
          await fetchHighScore();
        }
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

  const verifySessionSaved = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) {
        console.error("Error verifying session:", error);
        return null;
      }

      console.log("Session verification result:", data);
      return data;
    } catch (error) {
      console.error("Error verifying session:", error);
      return null;
    }
  };

  const refreshHighScore = async () => {
    console.log("Manually refreshing high score...");
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
