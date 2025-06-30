
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CardNavigationProps {
  flashcardCount: number;
  currentIndex: number;
  answeredCards: boolean[];
  onGoToCard: (index: number) => void;
}

export default function CardNavigation({ flashcardCount, currentIndex, answeredCards, onGoToCard }: CardNavigationProps) {
  const answeredCount = answeredCards.filter(Boolean).length;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold">Progress</h4>
          <p className="text-sm text-gray-500">{answeredCount}/{flashcardCount} completed</p>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: flashcardCount }).map((_, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onGoToCard(index)}
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
  );
}
