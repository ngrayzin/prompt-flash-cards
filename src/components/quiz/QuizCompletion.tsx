import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Award, Star } from "lucide-react";

interface QuizCompletionProps {
  setTitle: string;
  correctAnswers: number;
  totalCards: number;
  highScore: number;
  onReset: () => void;
  onBack: () => void;
  onGoToCard: (index: number) => void;
  answeredCards: boolean[];
  correctnessArray: (boolean | null)[];
}

export default function QuizCompletion({
  setTitle,
  correctAnswers,
  totalCards,
  highScore,
  onReset,
  onBack,
  onGoToCard,
  answeredCards,
  correctnessArray,
}: QuizCompletionProps) {
  const scorePercentage = Math.round((correctAnswers / totalCards) * 100);
  const isNewRecord = correctAnswers > highScore;
  const isPerfectScore = correctAnswers === totalCards;
  const currentHighScore = Math.max(correctAnswers, highScore);

  const getScoreEmoji = () => {
    if (isPerfectScore) return "🏆";
    if (scorePercentage >= 90) return "🎉";
    if (scorePercentage >= 80) return "⭐";
    if (scorePercentage >= 70) return "👍";
    if (scorePercentage >= 60) return "📚";
    return "💪";
  };

  const getScoreMessage = () => {
    if (isPerfectScore) return "Perfect Score! Outstanding!";
    if (scorePercentage >= 90) return "Excellent work! Almost perfect!";
    if (scorePercentage >= 80) return "Great job! Well done!";
    if (scorePercentage >= 70) return "Good work! Keep it up!";
    if (scorePercentage >= 60) return "Nice effort! Room for improvement.";
    return "Keep studying and try again!";
  };

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

      <Card
        className={`text-center py-8 ${
          isPerfectScore
            ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
            : isNewRecord
            ? "bg-gradient-to-br from-green-50 to-blue-50 border-green-200"
            : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
        }`}
      >
        <CardContent className="space-y-6">
          <div className="text-8xl mb-4 animate-bounce">{getScoreEmoji()}</div>

          {isNewRecord && (
            <div className="flex items-center justify-center gap-2 text-green-600 mb-4 animate-pulse">
              <Star className="h-5 w-5" />
              <span className="font-bold">NEW PERSONAL BEST!</span>
              <Star className="h-5 w-5" />
            </div>
          )}

          <div>
            <h3 className="text-4xl font-bold text-gray-800 mb-2">
              {correctAnswers}/{totalCards}
            </h3>
            <p className="text-2xl text-gray-700 mb-4">
              {scorePercentage}% Correct
            </p>
            <p className="text-lg text-gray-600 mb-4">{getScoreMessage()}</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-amber-600 mb-4">
            <Award className="h-5 w-5" />
            <span className="font-medium">
              {isNewRecord ? "New " : ""}High Score: {currentHighScore}/
              {totalCards} ({Math.round((currentHighScore / totalCards) * 100)}
              %)
            </span>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={onReset}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
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

          {/* Legend */}
          <div className="flex justify-center gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-gray-600">Correct</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-gray-600">Incorrect</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="text-gray-600">Unanswered</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: totalCards }).map((_, index) => {
              const isAnswered = answeredCards[index];
              const isCorrect = correctnessArray[index];

              let buttonClass =
                "h-10 w-10 text-xs transition-all hover:scale-105 ";

              if (!isAnswered) {
                buttonClass += "bg-gray-100 hover:bg-gray-200 border-gray-300";
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
    </div>
  );
}
