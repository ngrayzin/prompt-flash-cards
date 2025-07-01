import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QuizHeader from "./quiz/QuizHeader";
import QuizProgress from "./quiz/QuizProgress";
import FlashcardDisplay from "./quiz/FlashcardDisplay";
import AnswerButtons from "./quiz/AnswerButtons";
import CardNavigation from "./quiz/CardNavigation";
import QuizCompletion from "./quiz/QuizCompletion";
import { useQuizSession } from "./quiz/useQuizSession";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: string;
}

interface FlashcardQuizProps {
  setId: string;
  onBack: () => void;
}

export default function FlashcardQuiz({ setId, onBack }: FlashcardQuizProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answeredCards, setAnsweredCards] = useState<boolean[]>([]);
  const [correctnessArray, setCorrectnessArray] = useState<(boolean | null)[]>(
    []
  );
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [setTitle, setSetTitle] = useState("");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { toast } = useToast();
  const {
    sessionId,
    createQuizSession,
    updateSession,
    highScore,
    getHighScorePercentage,
    verifySessionSaved,
    refreshHighScore,
  } = useQuizSession(setId);

  useEffect(() => {
    fetchFlashcards();
    createQuizSession();
  }, [setId]);

  useEffect(() => {
    updateSession(currentIndex, correctAnswers, answeredCards, quizCompleted);
  }, [currentIndex, correctAnswers, answeredCards, quizCompleted]);

  useEffect(() => {
    if (quizCompleted && refreshHighScore) {
      // Refresh high score when quiz is completed to ensure UI shows latest value
      setTimeout(() => {
        refreshHighScore();
      }, 1000);
    }
  }, [quizCompleted, refreshHighScore]);

  const fetchFlashcards = async () => {
    try {
      const { data: setData, error: setError } = await supabase
        .from("flashcard_sets")
        .select("title")
        .eq("id", setId)
        .single();

      if (setError) throw setError;
      setSetTitle(setData.title);

      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("set_id", setId)
        .order("created_at");

      if (error) throw error;
      setFlashcards(data || []);
      setAnsweredCards(new Array(data?.length || 0).fill(false));
      setCorrectnessArray(new Array(data?.length || 0).fill(null));
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to load flashcards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (correct: boolean) => {
    if (answeredCards[currentIndex]) return;

    const newAnsweredCards = [...answeredCards];
    newAnsweredCards[currentIndex] = true;
    setAnsweredCards(newAnsweredCards);

    const newCorrectnessArray = [...correctnessArray];
    newCorrectnessArray[currentIndex] = correct;
    setCorrectnessArray(newCorrectnessArray);

    const newCorrectAnswers = correct ? correctAnswers + 1 : correctAnswers;
    if (correct) {
      setCorrectAnswers(newCorrectAnswers);
    }

    const allAnswered = newAnsweredCards.every((answered) => answered);

    setTimeout(async () => {
      if (allAnswered) {
        setQuizCompleted(true);
        const isNewRecord = newCorrectAnswers > highScore;

        try {
          // Update session with final results and wait for completion
          await updateSession(
            currentIndex,
            newCorrectAnswers,
            newAnsweredCards,
            true
          );

          // Verify the session was saved correctly
          if (verifySessionSaved) {
            const savedSession = await verifySessionSaved(sessionId || "");
            console.log("Session verification after completion:", savedSession);
          }

          toast({
            title: isNewRecord ? "🎉 New Personal Best!" : "Quiz Complete!",
            description: `Final Score: ${newCorrectAnswers}/${
              flashcards.length
            }${isNewRecord ? " - New Record!" : ""}`,
          });
        } catch (error) {
          console.error("Error completing quiz:", error);
          toast({
            title: "Quiz Complete!",
            description: `Final Score: ${newCorrectAnswers}/${flashcards.length}`,
          });
        }
      } else if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        const nextUnanswered = newAnsweredCards.findIndex(
          (answered) => !answered
        );
        if (nextUnanswered !== -1) {
          setCurrentIndex(nextUnanswered);
          setShowAnswer(false);
          toast({
            title: "Continue Quiz",
            description: "Answer all questions to complete the quiz!",
          });
        }
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setCorrectAnswers(0);
    setAnsweredCards(new Array(flashcards.length).fill(false));
    setCorrectnessArray(new Array(flashcards.length).fill(null));
    setQuizCompleted(false);
    createQuizSession();
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
    setShowAnswer(false);
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-gray-500 mb-4">No flashcards found</p>
          <Button onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sets
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress =
    (answeredCards.filter(Boolean).length / flashcards.length) * 100;
  const answeredCount = answeredCards.filter(Boolean).length;

  if (quizCompleted) {
    return (
      <QuizCompletion
        setTitle={setTitle}
        correctAnswers={correctAnswers}
        totalCards={flashcards.length}
        highScore={highScore}
        onReset={resetQuiz}
        onBack={onBack}
        onGoToCard={goToCard}
        answeredCards={answeredCards}
        correctnessArray={correctnessArray}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <QuizHeader
        onBack={onBack}
        onReset={resetQuiz}
        setTitle={setTitle}
        currentIndex={currentIndex}
        totalCards={flashcards.length}
      />

      <QuizProgress
        progress={progress}
        correctAnswers={correctAnswers}
        answeredCount={answeredCount}
        totalCards={flashcards.length}
        highScore={highScore}
      />

      <FlashcardDisplay
        currentCard={currentCard}
        showAnswer={showAnswer}
        onToggleAnswer={toggleAnswer}
      />

      {showAnswer && (
        <AnswerButtons
          onAnswer={handleAnswer}
          isAnswered={answeredCards[currentIndex]}
        />
      )}

      <CardNavigation
        flashcardCount={flashcards.length}
        currentIndex={currentIndex}
        answeredCards={answeredCards}
        correctnessArray={correctnessArray}
        onGoToCard={goToCard}
      />
    </div>
  );
}
