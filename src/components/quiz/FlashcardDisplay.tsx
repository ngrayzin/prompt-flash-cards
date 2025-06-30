
import { Card, CardContent } from '@/components/ui/card';

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
    <Card className="min-h-[300px] cursor-pointer" onClick={onToggleAnswer}>
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
  );
}
