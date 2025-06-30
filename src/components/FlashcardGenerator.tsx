
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Upload, X } from 'lucide-react';

interface FlashcardGeneratorProps {
  onFlashcardsGenerated: (setId: string) => void;
}

export default function FlashcardGenerator({ onFlashcardsGenerated }: FlashcardGeneratorProps) {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/html',
        'text/plain'
      ];
      return validTypes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx') || file.name.endsWith('.html') || file.name.endsWith('.txt');
    });

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Some files were skipped",
        description: "Only PDF, DOC, DOCX, PPT, PPTX, HTML, and TXT files are supported",
        variant: "destructive"
      });
    }

    setFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Limit to 5 files
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !prompt.trim()) return;

    setLoading(true);
    
    try {
      // Convert files to base64 for sending to edge function
      const fileContents = await Promise.all(
        files.map(async (file) => {
          const reader = new FileReader();
          return new Promise<{ name: string; type: string; content: string }>((resolve) => {
            reader.onload = () => {
              const result = reader.result as string;
              resolve({
                name: file.name,
                type: file.type,
                content: result.split(',')[1] // Remove data:... prefix
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: {
          prompt: prompt.trim(),
          title: title.trim(),
          userId: user.id,
          files: fileContents
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
        setFiles([]);
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

          <div className="space-y-2">
            <Label htmlFor="files">Additional Context Files (Optional)</Label>
            <div className="space-y-2">
              <Input
                id="files"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.html,.txt"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                Upload PDFs, Word docs, PowerPoint slides, HTML pages, or text files to provide extra context (max 5 files)
              </p>
            </div>
            
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded Files:</p>
                <div className="space-y-1">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
