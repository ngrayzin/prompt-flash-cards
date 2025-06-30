
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Auth from '@/components/Auth';
import FlashcardGenerator from '@/components/FlashcardGenerator';
import FlashcardSets from '@/components/FlashcardSets';
import FlashcardQuiz from '@/components/FlashcardQuiz';
import { Button } from '@/components/ui/button';
import { LogOut, Brain, Zap } from 'lucide-react';

type ViewState = 'home' | 'quiz';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<string>('');

  const handleSignOut = async () => {
    await signOut();
  };

  const handleFlashcardsGenerated = (setId: string) => {
    setRefreshTrigger(setId);
  };

  const handleStartQuiz = (setId: string) => {
    setActiveSetId(setId);
    setCurrentView('quiz');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setActiveSetId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Flashcard Quiz Generator</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                AI-Powered Learning Made Simple
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Transform any topic into interactive flashcards. Just describe what you want to learn, 
                and our AI will create personalized quiz questions to help you master the material.
              </p>
            </div>

            <FlashcardGenerator onFlashcardsGenerated={handleFlashcardsGenerated} />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <h3 className="text-xl font-semibold">Your Flashcard Sets</h3>
              </div>
              
              <FlashcardSets 
                refreshTrigger={refreshTrigger}
                onStartQuiz={handleStartQuiz}
              />
            </div>
          </div>
        )}

        {currentView === 'quiz' && activeSetId && (
          <FlashcardQuiz 
            setId={activeSetId}
            onBack={handleBackToHome}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
