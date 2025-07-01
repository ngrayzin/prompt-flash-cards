import { Progress } from "@/components/ui/progress";
import { Award, Star } from "lucide-react";

interface QuizProgressProps {
  progress: number;
  correctAnswers: number;
  answeredCount: number;
  totalCards: number;
  highScore: number;
}

export default function QuizProgress({
  progress,
  correctAnswers,
  answeredCount,
  totalCards,
  highScore,
}: QuizProgressProps) {
  const scorePercentage =
    totalCards > 0 ? Math.round((correctAnswers / totalCards) * 100) : 0;
  const answeredPercentage =
    answeredCount > 0 ? Math.round((correctAnswers / answeredCount) * 100) : 0;
  const isNewRecord = correctAnswers > highScore;

  return (
    <div className="space-y-4">
      <Progress value={progress} className="h-3" />

      <div className="flex justify-between items-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">
            Score: {correctAnswers}/{totalCards}
          </p>
          <p className="text-sm text-gray-500">
            {scorePercentage}% of total deck completed correctly
          </p>
          {answeredCount > 0 && answeredCount < totalCards && (
            <p className="text-xs text-gray-400">
              ({answeredPercentage}% of answered questions correct)
            </p>
          )}
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-amber-600">
            <Award className="h-4 w-4" />
            <span className="text-sm font-medium">High Score</span>
          </div>
          <p className="text-lg font-bold text-amber-700">
            {highScore}/{totalCards}
          </p>
        </div>
      </div>

      {isNewRecord && answeredCount > 0 && (
        <div className="flex items-center justify-center gap-2 text-green-600 animate-pulse">
          <Star className="h-4 w-4" />
          <span className="text-sm font-medium">New Personal Best!</span>
          <Star className="h-4 w-4" />
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Progress: {answeredCount}/{totalCards} questions answered
        </p>
      </div>
    </div>
  );
}
