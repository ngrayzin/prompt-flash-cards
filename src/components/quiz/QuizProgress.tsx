
import { Progress } from "@/components/ui/progress";
import { Award, Star, Trophy } from "lucide-react";

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
  const highScorePercentage = 
    totalCards > 0 ? Math.round((highScore / totalCards) * 100) : 0;
  const isNewRecord = correctAnswers > highScore;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Progress</span>
          <span>{answeredCount}/{totalCards} completed</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Current Score</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {correctAnswers}/{totalCards}
          </p>
          <p className="text-sm text-blue-700">
            {scorePercentage}% correct
          </p>
          {answeredCount > 0 && answeredCount < totalCards && (
            <p className="text-xs text-blue-600 mt-1">
              ({answeredPercentage}% of answered)
            </p>
          )}
        </div>

        <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">High Score</span>
          </div>
          <p className="text-2xl font-bold text-amber-900">
            {highScore}/{totalCards}
          </p>
          <p className="text-sm text-amber-700">
            {highScorePercentage}% best
          </p>
        </div>
      </div>

      {isNewRecord && answeredCount > 0 && (
        <div className="flex items-center justify-center gap-2 text-green-600 animate-pulse bg-green-50 p-3 rounded-lg border border-green-200">
          <Star className="h-5 w-5" />
          <span className="font-medium">New Personal Best in Progress!</span>
          <Star className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
