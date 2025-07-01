import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold">Progress</h4>
          <p className="text-sm text-gray-500">
            {answeredCount}/{flashcardCount} completed
          </p>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-3 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-gray-600">Correct</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-gray-600">Wrong</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-100 border border-gray-300 rounded"></div>
            <span className="text-gray-600">Pending</span>
          </div>
        </div>

        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: flashcardCount }).map((_, index) => {
            const isAnswered = answeredCards[index];
            const isCorrect = correctnessArray[index];

            let buttonClass = "h-6 w-6 text-xs ";

            if (index === currentIndex) {
              buttonClass += "ring-2 ring-blue-500 ";
            }

            if (!isAnswered) {
              buttonClass += "bg-gray-100 hover:bg-gray-200";
            } else if (isCorrect === true) {
              buttonClass +=
                "bg-green-100 border-green-300 hover:bg-green-200 text-green-800";
            } else if (isCorrect === false) {
              buttonClass +=
                "bg-red-100 border-red-300 hover:bg-red-200 text-red-800";
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
                    ? "Not answered"
                    : isCorrect
                    ? "Correct answer"
                    : "Incorrect answer"
                }
              >
                {index + 1}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
