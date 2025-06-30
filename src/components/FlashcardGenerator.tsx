
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';

interface FlashcardGeneratorProps {
  onFlashcardsGenerated: (setId: string) => void;
}

export default function FlashcardGenerator({ onFlashcardsGenerated }: FlashcardGeneratorProps) {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !prompt.trim()) return;

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: {
          prompt: prompt.trim(),
          title: title.trim(),
          userId: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Flashcards Generated!",
          description: `Created a new set: ${title}`
        });
        
        onFlashcardsGenerated(data.flashcardSet.id);
        setTitle('');
        setPrompt('');
      } else {
        throw new Error(data.error || 'Failed to generate flashcards');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate flashcards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Generate New Flashcards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Spanish Vocabulary, Biology Chapter 5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prompt">Learning Topic</Label>
            <Textarea
              id="prompt"
              placeholder="Describe what you want to learn about. Be specific for better results. e.g., 'Basic Spanish greetings and common phrases', 'Photosynthesis process and key terms', 'JavaScript array methods'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Flashcards
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
