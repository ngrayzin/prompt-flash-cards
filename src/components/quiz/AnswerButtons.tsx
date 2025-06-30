
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

interface AnswerButtonsProps {
  onAnswer: (correct: boolean) => void;
  isAnswered: boolean;
}

export default function AnswerButtons({ onAnswer, isAnswered }: AnswerButtonsProps) {
  if (isAnswered) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Already answered this card
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 justify-center">
      <Button
        variant="outline"
        onClick={() => onAnswer(false)}
        className="text-red-600 hover:text-red-700"
      >
        <XCircle className="mr-2 h-4 w-4" />
        Incorrect
      </Button>
      <Button
        onClick={() => onAnswer(true)}
        className="text-green-600 hover:text-green-700"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Correct
      </Button>
    </div>
  );
}
