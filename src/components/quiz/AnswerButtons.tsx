
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

interface AnswerButtonsProps {
  onAnswer: (correct: boolean) => void;
  isAnswered: boolean;
}

export default function AnswerButtons({ onAnswer, isAnswered }: AnswerButtonsProps) {
  if (isAnswered) {
    return (
      <div className="text-center text-sm text-gray-500">
        Answer recorded! Moving to next question...
      </div>
    );
  }

  return (
    <div className="flex gap-4 justify-center">
      <Button
        onClick={() => onAnswer(false)}
        variant="outline"
        size="lg"
        className="flex-1 max-w-48 bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300 text-red-700 hover:text-red-800 transition-all hover:scale-105"
      >
        <XCircle className="mr-2 h-5 w-5" />
        Didn't Know
      </Button>
      <Button
        onClick={() => onAnswer(true)}
        variant="outline"
        size="lg"
        className="flex-1 max-w-48 bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300 text-green-700 hover:text-green-800 transition-all hover:scale-105"
      >
        <CheckCircle className="mr-2 h-5 w-5" />
        Got It Right
      </Button>
    </div>
  );
}
