
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface QuizCompletionProps {
  setTitle: string;
  correctAnswers: number;
  totalCards: number;
  onReset: () => void;
  onBack: () => void;
  onGoToCard: (index: number) => void;
  answeredCards: boolean[];
}

export default function QuizCompletion({ 
  setTitle, 
  correctAnswers, 
  totalCards, 
  onReset, 
  onBack, 
  onGoToCard,
  answeredCards 
}: QuizCompletionProps) {
  const scorePercentage = Math.round((correctAnswers / totalCards) * 100);

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
        
        <Button variant="outline" onClick={onReset}>
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
              {correctAnswers}/{totalCards}
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
            <Button onClick={onReset} size="lg">
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

      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-4">Review Summary</h4>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: totalCards }).map((_, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onGoToCard(index)}
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
