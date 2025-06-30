
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [setTitle, setSetTitle] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchFlashcards();
    createQuizSession();
  }, [setId]);

  const fetchFlashcards = async () => {
    try {
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('title')
        .eq('id', setId)
        .single();

      if (setError) throw setError;
      setSetTitle(setData.title);

      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('created_at');

      if (error) throw error;
      setFlashcards(data || []);
      setAnsweredCards(new Array(data?.length || 0).fill(false));
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast({
        title: "Error",
        description: "Failed to load flashcards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  const updateSession = async () => {
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
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  useEffect(() => {
    if (sessionId) {
      updateSession();
    }
  }, [currentIndex, correctAnswers, answeredCards, quizCompleted]);

  const handleAnswer = (correct: boolean) => {
    if (answeredCards[currentIndex]) return; // Prevent double answering

    const newAnsweredCards = [...answeredCards];
    newAnsweredCards[currentIndex] = true;
    setAnsweredCards(newAnsweredCards);

    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
    }

    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // Quiz completed
        setQuizCompleted(true);
        toast({
          title: "Quiz Complete!",
          description: `Final Score: ${correct ? correctAnswers + 1 : correctAnswers}/${flashcards.length}`
        });
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setCorrectAnswers(0);
    setAnsweredCards(new Array(flashcards.length).fill(false));
    setQuizCompleted(false);
    createQuizSession();
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
    setShowAnswer(false);
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
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  const answeredCount = answeredCards.filter(Boolean).length;
  const scorePercentage = flashcards.length > 0 ? Math.round((correctAnswers / flashcards.length) * 100) : 0;

  if (quizCompleted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sets
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold">{setTitle}</h2>
            <p className="text-sm text-gray-500">Quiz Complete!</p>
          </div>
          
          <Button variant="outline" onClick={resetQuiz}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>

        <Card className="text-center py-8 bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <CardContent className="space-y-6">
            <div className="text-6xl mb-4">
              {scorePercentage >= 80 ? '🎉' : scorePercentage >= 60 ? '👍' : '📚'}
            </div>
            
            <div>
              <h3 className="text-3xl font-bold text-green-800 mb-2">
                {correctAnswers}/{flashcards.length}
              </h3>
              <p className="text-xl text-green-700 mb-4">
                {scorePercentage}% Correct
              </p>
              <p className="text-gray-600">
                {scorePercentage >= 80 ? 'Excellent work!' : 
                 scorePercentage >= 60 ? 'Good job! Keep practicing.' : 
                 'Keep studying and try again!'}
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={resetQuiz} size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" size="lg" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sets
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Navigation Summary */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-4">Review Summary</h4>
            <div className="grid grid-cols-5 gap-2">
              {flashcards.map((_, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => goToCard(index)}
                  className={`h-8 w-8 text-xs ${
                    answeredCards[index] 
                      ? correctAnswers > index ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                      : 'bg-gray-100'
                  }`}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="text-center">
          <h2 className="text-xl font-bold">{setTitle}</h2>
          <p className="text-sm text-gray-500">
            {currentIndex + 1} of {flashcards.length}
          </p>
        </div>
        
        <Button variant="outline" onClick={resetQuiz}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">
          Score: {correctAnswers}/{flashcards.length} ({scorePercentage}%)
        </p>
        <p className="text-sm text-gray-500">
          Answered: {answeredCount}/{flashcards.length}
        </p>
      </div>

      <Card className="min-h-[300px] cursor-pointer" onClick={() => setShowAnswer(!showAnswer)}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            {!showAnswer ? (
              <>
                <div className="text-sm font-medium text-blue-600 mb-2">QUESTION</div>
                <p className="text-xl font-medium">{currentCard.question}</p>
                <p className="text-sm text-gray-500 mt-4">Click to reveal answer</p>
              </>
            ) : (
              <>
                <div className="text-sm font-medium text-green-600 mb-2">ANSWER</div>
                <p className="text-xl font-medium">{currentCard.answer}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {showAnswer && !answeredCards[currentIndex] && (
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => handleAnswer(false)}
            className="text-red-600 hover:text-red-700"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Incorrect
          </Button>
          <Button
            onClick={() => handleAnswer(true)}
            className="text-green-600 hover:text-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Correct
          </Button>
        </div>
      )}

      {answeredCards[currentIndex] && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Already answered this card
          </p>
        </div>
      )}

      {/* Card Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Progress</h4>
            <p className="text-sm text-gray-500">{answeredCount}/{flashcards.length} completed</p>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {flashcards.map((_, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => goToCard(index)}
                className={`h-6 w-6 text-xs ${
                  index === currentIndex ? 'ring-2 ring-blue-500' :
                  answeredCards[index] ? 'bg-green-100 border-green-300' : 'bg-gray-100'
                }`}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
