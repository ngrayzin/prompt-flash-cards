import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Calendar, Trash2, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FlashcardSet {
  id: string;
  title: string;
  prompt: string;
  created_at: string;
  flashcard_count?: number;
  high_score?: number;
}

interface FlashcardSetsProps {
  refreshTrigger?: string;
  onStartQuiz: (setId: string) => void;
}

export default function FlashcardSets({ refreshTrigger, onStartQuiz }: FlashcardSetsProps) {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select(`
          id,
          title,
          prompt,
          created_at,
          flashcards(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch high scores for each set
      const setsWithHighScores = await Promise.all(
        data.map(async (set) => {
          const { data: highScoreData } = await supabase
            .from('quiz_sessions')
            .select('correct_answers')
            .eq('user_id', user.id)
            .eq('set_id', set.id)
            .eq('completed', true)
            .order('correct_answers', { ascending: false })
            .limit(1);

          const flashcardCount = set.flashcards?.[0]?.count || 0;
          const highScore = highScoreData && highScoreData.length > 0 ? highScoreData[0].correct_answers : 0;

          return {
            ...set,
            flashcard_count: flashcardCount,
            high_score: highScore
          };
        })
      );

      setSets(setsWithHighScores);
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      toast({
        title: "Error",
        description: "Failed to load flashcard sets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSet = async (setId: string) => {
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', setId);

      if (error) throw error;

      setSets(sets.filter(set => set.id !== setId));
      toast({
        title: "Deleted",
        description: "Flashcard set deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting set:', error);
      toast({
        title: "Error",
        description: "Failed to delete flashcard set",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSets();
  }, [user, refreshTrigger]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-gray-500 mb-4">No flashcard sets yet</p>
          <p className="text-sm text-gray-400">Generate your first set to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sets.map((set) => (
        <Card key={set.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{set.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              {new Date(set.created_at).toLocaleDateString()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 line-clamp-2">{set.prompt}</p>
            
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                {set.flashcard_count} cards
              </Badge>
              
              {set.high_score !== undefined && set.high_score > 0 && (
                <div className="flex items-center gap-1 text-amber-600">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {set.high_score}/{set.flashcard_count}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onStartQuiz(set.id)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                <Play className="h-4 w-4 mr-2" />
                Study
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteSet(set.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
