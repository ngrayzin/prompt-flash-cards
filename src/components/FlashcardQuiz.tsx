
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
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [setTitle, setSetTitle] = useState('');
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

  const updateSession = async (newCorrect?: number, newTotal?: number) => {
    if (!sessionId) return;

    try {
      await supabase
        .from('quiz_sessions')
        .update({
          current_card_index: currentIndex,
          correct_answers: newCorrect ?? correctAnswers,
          total_attempts: newTotal ?? totalAttempts,
          completed: currentIndex >= flashcards.length - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleAnswer = (correct: boolean) => {
    const newTotal = totalAttempts + 1;
    const newCorrect = correct ? correctAnswers + 1 : correctAnswers;
    
    setTotalAttempts(newTotal);
    setCorrectAnswers(newCorrect);
    
    updateSession(newCorrect, newTotal);
    
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // Quiz completed
        toast({
          title: "Quiz Complete!",
          description: `You got ${newCorrect} out of ${newTotal} questions correct!`
        });
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setCorrectAnswers(0);
    setTotalAttempts(0);
    createQuizSession();
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
  const isQuizComplete = currentIndex >= flashcards.length - 1 && totalAttempts > 0;

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

      {totalAttempts > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Score: {correctAnswers}/{totalAttempts} ({Math.round((correctAnswers/totalAttempts) * 100)}%)
          </p>
        </div>
      )}

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

      {showAnswer && !isQuizComplete && (
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

      {isQuizComplete && (
        <Card className="text-center py-6 bg-green-50 border-green-200">
          <CardContent>
            <h3 className="text-lg font-bold text-green-800 mb-2">Quiz Complete!</h3>
            <p className="text-green-700 mb-4">
              Final Score: {correctAnswers}/{totalAttempts} ({Math.round((correctAnswers/totalAttempts) * 100)}%)
            </p>
            <Button onClick={resetQuiz} className="mr-2">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sets
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
