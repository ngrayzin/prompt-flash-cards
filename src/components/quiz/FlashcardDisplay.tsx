
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: string;
}

interface FlashcardDisplayProps {
  currentCard: Flashcard;
  showAnswer: boolean;
  onToggleAnswer: () => void;
}

export default function FlashcardDisplay({ currentCard, showAnswer, onToggleAnswer }: FlashcardDisplayProps) {
  return (
    <Card className="min-h-[300px] transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-8 flex flex-col items-center justify-center h-full">
        <div className="text-center space-y-6 w-full">
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Question</h3>
            <p className="text-gray-700 text-lg leading-relaxed">{currentCard.question}</p>
          </div>
          
          {showAnswer && (
            <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-400 animate-fade-in">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Answer</h3>
              <p className="text-gray-700 text-lg leading-relaxed">{currentCard.answer}</p>
            </div>
          )}
          
          <Button
            onClick={onToggleAnswer}
            variant="outline"
            size="lg"
            className="mt-6 transition-all hover:scale-105"
          >
            {showAnswer ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Answer
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show Answer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
