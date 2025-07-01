
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface CardNavigationProps {
  flashcardCount: number;
  currentIndex: number;
  answeredCards: boolean[];
  correctnessArray: (boolean | null)[];
  onGoToCard: (index: number) => void;
}

export default function CardNavigation({
  flashcardCount,
  currentIndex,
  answeredCards,
  correctnessArray,
  onGoToCard,
}: CardNavigationProps) {
  const answeredCount = answeredCards.filter(Boolean).length;
  const correctCount = correctnessArray.filter(c => c === true).length;
  const incorrectCount = correctnessArray.filter(c => c === false).length;

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-lg">Card Navigation</h4>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {answeredCount}/{flashcardCount} completed
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">{correctCount} Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">{incorrectCount} Wrong</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{flashcardCount - answeredCount} Pending</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border-2 border-green-400 rounded-md shadow-sm"></div>
            <span className="text-gray-700 font-medium">Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border-2 border-red-400 rounded-md shadow-sm"></div>
            <span className="text-gray-700 font-medium">Wrong</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 border-2 border-gray-400 rounded-md shadow-sm"></div>
            <span className="text-gray-700 font-medium">Pending</span>
          </div>
        </div>

        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: flashcardCount }).map((_, index) => {
            const isAnswered = answeredCards[index];
            const isCorrect = correctnessArray[index];
            const isCurrent = index === currentIndex;

            let buttonClass = "h-8 w-8 text-xs font-semibold transition-all duration-200 ";

            if (isCurrent) {
              buttonClass += "ring-2 ring-blue-500 ring-offset-2 scale-110 ";
            }

            if (!isAnswered) {
              buttonClass += "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-600 hover:scale-105";
            } else if (isCorrect === true) {
              buttonClass += "bg-green-100 border-green-400 hover:bg-green-200 text-green-800 shadow-sm";
            } else if (isCorrect === false) {
              buttonClass += "bg-red-100 border-red-400 hover:bg-red-200 text-red-800 shadow-sm";
            }

            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onGoToCard(index)}
                className={buttonClass}
                title={
                  !isAnswered
                    ? `Card ${index + 1}: Not answered yet`
                    : isCorrect
                    ? `Card ${index + 1}: Correct answer ✓`
                    : `Card ${index + 1}: Incorrect answer ✗`
                }
              >
                {index + 1}
              </Button>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Click any card number to jump to that question
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
