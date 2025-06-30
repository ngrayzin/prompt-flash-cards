
import { Progress } from '@/components/ui/progress';

interface QuizProgressProps {
  progress: number;
  correctAnswers: number;
  answeredCount: number;
  totalCards: number;
}

export default function QuizProgress({ progress, correctAnswers, answeredCount, totalCards }: QuizProgressProps) {
  const scorePercentage = answeredCount > 0 ? Math.round((correctAnswers / answeredCount) * 100) : 0;

  return (
    <>
      <Progress value={progress} className="h-2" />
      
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">
          Score: {correctAnswers}/{answeredCount} answered ({scorePercentage}% correct)
        </p>
        <p className="text-sm text-gray-500">
          Progress: {answeredCount}/{totalCards} questions answered
        </p>
      </div>
    </>
  );
}
