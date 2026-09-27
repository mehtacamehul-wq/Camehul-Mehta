import React, { useState, useRef, useEffect } from 'react';
import { Film, Sparkles, ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import { ShortFilmProject, EBook } from '../../types/ebook';
import { PREBUILT_SHORT_FILM_PROJECTS, FEATURED_EBOOKS } from '../../data/ebooksData';
import { SupportedLanguage } from '../../utils/translations';
import { CinemaPlayer } from './CinemaPlayer';
import { SceneTimelineEditor } from './SceneTimelineEditor';
import { VideoExporter } from './VideoExporter';

interface VirtualCinemaStudioProps {
  initialBook?: EBook | null;
  onBackToLibrary: () => void;
  currentLanguage?: SupportedLanguage;
}

export const VirtualCinemaStudio: React.FC<VirtualCinemaStudioProps> = ({
  initialBook,
  onBackToLibrary,
  currentLanguage = 'en',
}) => {
  const [projects, setProjects] = useState<ShortFilmProject[]>(PREBUILT_SHORT_FILM_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(
    initialBook?.id === 'zebra-learning-wealth'
      ? 'film-zebra-learning'
      : 'film-rich-poor-dad'
  );
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Sync project language with app language if set
  useEffect(() => {
    if (activeProject && !activeProject.language && currentLanguage) {
      handleUpdateProject({ ...activeProject, language: currentLanguage });
    }
  }, [currentLanguage]);

  const handleUpdateProject = (updated: ShortFilmProject) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleGenerateAIScript = async (promptQuery: string) => {
    setIsGeneratingScript(true);
    try {
      const response = await fetch('/api/ai/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: promptQuery,
          author: activeProject.author || 'Financial Strategist',
          category: 'Cashflow & Assets'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newProject: ShortFilmProject = {
          id: `film-${Date.now()}`,
          bookId: 'custom-topic',
          bookTitle: promptQuery,
          author: 'AI Generated with Gemini',
          title: data.title || `Short Film: ${promptQuery}`,
          description: data.description || 'Dynamic short film script crafted with Gemini.',
          audioVoice: 'Kore',
          ttsSpeed: 1.0,
          bgMusic: 'cinematic_orchestral',
          bgMusicVolume: 0.25,
          ttsVolume: 0.95,
          aspectRatio: '16:9',
          videoStyle: 'cinematic',
          language: currentLanguage,
          scenes: data.scenes && data.scenes.length > 0 ? data.scenes : activeProject.scenes
        };

        setProjects(prev => [newProject, ...prev]);
        setActiveProjectId(newProject.id);
        setActiveSceneIndex(0);
      }
    } catch (e) {
      console.error('Failed to generate script:', e);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLibrary}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 rounded-lg transition-colors"
            title="Back to Global Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-800">
              <Film className="w-3.5 h-3.5" />
              <span>Virtual Cinema & Motion Video Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              AI Financial Short Film Theater
            </h1>
          </div>
        </div>

        {/* Project Selector Segmented Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-stone-100 rounded-xl">
          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => {
                setActiveProjectId(proj.id);
                setActiveSceneIndex(0);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeProjectId === proj.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {proj.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Cinema Player + Editor + Exporter */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Cinema Video Screen Player */}
        <CinemaPlayer
          project={activeProject}
          activeSceneIndex={activeSceneIndex}
          onSelectScene={setActiveSceneIndex}
          onUpdateProject={handleUpdateProject}
          canvasRef={canvasRef}
        />

        {/* Dynamic Video Editing Suite */}
        <SceneTimelineEditor
          project={activeProject}
          activeSceneIndex={activeSceneIndex}
          onSelectScene={setActiveSceneIndex}
          onUpdateProject={handleUpdateProject}
          onGenerateAIScript={handleGenerateAIScript}
          isGeneratingScript={isGeneratingScript}
        />

        {/* Video & Screenplay Exporter */}
        <VideoExporter
          project={activeProject}
          canvasRef={canvasRef}
          onStartRecordingPlayback={() => {
            setActiveSceneIndex(0);
          }}
        />

      </div>

    </div>
  );
};
