
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface QuizHeaderProps {
  onBack: () => void;
  onReset: () => void;
  setTitle: string;
  currentIndex: number;
  totalCards: number;
}

export default function QuizHeader({ onBack, onReset, setTitle, currentIndex, totalCards }: QuizHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="text-center">
        <h2 className="text-xl font-bold">{setTitle}</h2>
        <p className="text-sm text-gray-500">
          {currentIndex + 1} of {totalCards}
        </p>
      </div>
      
      <Button variant="outline" onClick={onReset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}
