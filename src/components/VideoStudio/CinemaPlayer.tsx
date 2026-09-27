import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2, Music, Sparkles, Globe, Palette, Loader2 } from 'lucide-react';
import { ShortFilmProject, VideoScene, VideoStyle } from '../../types/ebook';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../../utils/translations';
import { MotionGraphicsCanvas } from './MotionGraphicsCanvas';
import { speechNarrator, ambientMusic } from '../../utils/audioSpeech';

interface CinemaPlayerProps {
  project: ShortFilmProject;
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onUpdateProject: (updated: ShortFilmProject) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const CinemaPlayer: React.FC<CinemaPlayerProps> = ({
  project,
  activeSceneIndex,
  onSelectScene,
  onUpdateProject,
  canvasRef,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0); // 0 to 1
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const currentScene: VideoScene = project.scenes[activeSceneIndex] || project.scenes[0];

  const currentLanguage = (project.language as SupportedLanguage) || 'en';
  const currentVideoStyle = project.videoStyle || 'cinematic';
  const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // Start / Stop scene playback
  useEffect(() => {
    if (isPlaying) {
      startScenePlayback(activeSceneIndex);
    } else {
      stopPlayback();
    }

    return () => {
      stopPlayback();
    };
  }, [isPlaying, activeSceneIndex]);

  const startScenePlayback = (sceneIdx: number) => {
    stopPlayback();
    setSceneProgress(0);

    const scene = project.scenes[sceneIdx];
    if (!scene) return;

    // Start background music
    ambientMusic.playTrack(project.bgMusic);
    ambientMusic.setVolume(project.bgMusicVolume * 0.4); // duck for voiceover

    setIsSpeaking(true);

    // Speak voiceover with localized language code
    speechNarrator.speakText(scene.voiceover, {
      voiceName: project.audioVoice,
      lang: langConfig.ttsLangCode,
      rate: project.ttsSpeed,
      volume: project.ttsVolume,
      onProgress: (progress) => {
        setSceneProgress(progress);
      },
      onEnd: () => {
        setIsSpeaking(false);
        if (sceneIdx < project.scenes.length - 1) {
          setTimeout(() => {
            onSelectScene(sceneIdx + 1);
          }, 800);
        } else {
          setIsPlaying(false);
          ambientMusic.stop();
        }
      }
    });

    // Fallback timer if TTS is silent or ended early
    const durationMs = scene.duration * 1000;
    const startTime = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calcProgress = Math.min(1, elapsed / durationMs);
      setSceneProgress((prev) => Math.max(prev, calcProgress));

      if (calcProgress >= 1 && !speechNarrator.getIsSpeaking()) {
        if (sceneIdx < project.scenes.length - 1) {
          onSelectScene(sceneIdx + 1);
        } else {
          setIsPlaying(false);
          ambientMusic.stop();
        }
      }
    }, 100);
  };

  const stopPlayback = () => {
    speechNarrator.stop();
    ambientMusic.stop();
    setIsSpeaking(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    onSelectScene(0);
    setSceneProgress(0);
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Translate all scenes in project to target language
  const handleTranslateProject = async (targetLang: SupportedLanguage) => {
    if (targetLang === currentLanguage) return;
    setIsTranslating(true);
    stopPlayback();

    try {
      const translatedScenes = await Promise.all(
        project.scenes.map(async (scene) => {
          const res = await fetch('/api/ai/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `${scene.keynote} ||| ${scene.voiceover} ||| ${scene.secondaryBullet || ''}`,
              targetLang,
              context: 'Short film voiceover script'
            })
          });

          if (res.ok) {
            const data = await res.json();
            const parts = (data.translatedText || '').split('|||');
            return {
              ...scene,
              keynote: (parts[0] || scene.keynote).trim(),
              voiceover: (parts[1] || parts[0] || scene.voiceover).trim(),
              secondaryBullet: (parts[2] || scene.secondaryBullet || '').trim()
            };
          }
          return scene;
        })
      );

      onUpdateProject({
        ...project,
        language: targetLang,
        scenes: translatedScenes
      });
    } catch (e) {
      console.error('Failed to translate short film:', e);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top Theater Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-6 py-3 bg-stone-900/90 border-b border-stone-800/80 text-white gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <div>
            <h3 className="text-sm font-serif font-semibold text-white">
              {project.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-stone-400 font-sans">
              <span>{project.bookTitle}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400">Scene {activeSceneIndex + 1} of {project.scenes.length}</span>
              <span aria-hidden="true">·</span>
              <span className="uppercase font-mono text-[10px] text-stone-400">{currentVideoStyle}</span>
            </div>
          </div>
        </div>

        {/* Video Style & Audio Engine Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Video Style Selector */}
          <div className="flex items-center gap-1.5 bg-stone-800 px-2.5 py-1 rounded-lg">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={currentVideoStyle}
              onChange={(e) => {
                onUpdateProject({ ...project, videoStyle: e.target.value as VideoStyle });
              }}
              className="bg-transparent text-stone-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="cinematic" className="bg-stone-900 text-white">Cinematic 35mm</option>
              <option value="infographic" className="bg-stone-900 text-white">2D Infographic</option>
              <option value="motion_reel" className="bg-stone-900 text-white">Motion Reel (Neon)</option>
              <option value="studio_3d" className="bg-stone-900 text-white">3D Studio (Isometric)</option>
            </select>
          </div>

          {/* Language Selector for Subtitles & TTS */}
          <div className="flex items-center gap-1.5 bg-stone-800 px-2.5 py-1 rounded-lg">
            <Globe className="w-3.5 h-3.5 text-stone-400" />
            {isTranslating ? (
              <span className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin" />
                Translating...
              </span>
            ) : (
              <select
                value={currentLanguage}
                onChange={(e) => handleTranslateProject(e.target.value as SupportedLanguage)}
                className="bg-transparent text-amber-300 font-medium focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-stone-900 text-white">
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Voice Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-stone-800 px-2.5 py-1 rounded-lg">
            <span className="text-stone-400 font-mono text-[11px]">VOICE:</span>
            <select
              value={project.audioVoice}
              onChange={(e) => {
                onUpdateProject({ ...project, audioVoice: e.target.value as any });
              }}
              className="bg-transparent text-stone-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="Kore" className="bg-stone-900 text-white">Kore (Balanced)</option>
              <option value="Puck" className="bg-stone-900 text-white">Puck (Energetic)</option>
              <option value="Charon" className="bg-stone-900 text-white">Charon (Gravitas)</option>
              <option value="Fenrir" className="bg-stone-900 text-white">Fenrir (Authoritative)</option>
              <option value="Zephyr" className="bg-stone-900 text-white">Zephyr (Bright)</option>
            </select>
          </div>

          {/* Soundtrack Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-stone-800 px-2.5 py-1 rounded-lg">
            <Music className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={project.bgMusic}
              onChange={(e) => {
                const track = e.target.value as any;
                onUpdateProject({ ...project, bgMusic: track });
                if (isPlaying) ambientMusic.playTrack(track);
              }}
              className="bg-transparent text-stone-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="cinematic_orchestral" className="bg-stone-900 text-white">Orchestral</option>
              <option value="ambient_warmth" className="bg-stone-900 text-white">Warm Pad</option>
              <option value="upbeat_lofi" className="bg-stone-900 text-white">Lofi Chords</option>
              <option value="none" className="bg-stone-900 text-white">No Music</option>
            </select>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Viewport Screen */}
      <div className="relative aspect-[16/9] w-full bg-black flex items-center justify-center overflow-hidden">
        <MotionGraphicsCanvas
          scene={currentScene}
          playbackProgress={sceneProgress}
          isSpeaking={isSpeaking}
          aspectRatio={project.aspectRatio}
          videoStyle={currentVideoStyle}
          language={currentLanguage}
          canvasRef={canvasRef}
        />

        {/* Big Center Play Overlay on Pause */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-amber-600/90 hover:bg-amber-500 text-white flex items-center justify-center shadow-2xl backdrop-blur-xs transition-all transform hover:scale-105 active:scale-95"
          >
            <Play className="w-8 h-8 ml-1" />
          </button>
        )}
      </div>

      {/* Control Bar & Scene Timeline */}
      <div className="p-4 bg-stone-900 border-t border-stone-800 space-y-3">
        
        {/* Scene Tabs Scrubber */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {project.scenes.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => {
                onSelectScene(idx);
                if (isPlaying) {
                  startScenePlayback(idx);
                }
              }}
              className={`flex-1 min-w-[130px] p-2 text-left rounded-lg transition-colors border ${
                activeSceneIndex === idx
                  ? 'bg-stone-800 border-amber-600/80 text-white'
                  : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:bg-stone-800/60'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span>SCENE 0{scene.sceneNumber}</span>
                <span>{scene.duration}s</span>
              </div>
              <div className="text-xs font-semibold line-clamp-1 text-white">
                {scene.title}
              </div>
            </button>
          ))}
        </div>

        {/* Primary Playback Controls */}
        <div className="flex items-center justify-between pt-1">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectScene(Math.max(0, activeSceneIndex - 1))}
              disabled={activeSceneIndex === 0}
              className="p-2 text-stone-400 hover:text-white disabled:opacity-30 rounded-lg transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg flex items-center gap-2 text-xs transition-colors shadow-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              <span>{isPlaying ? 'Pause Film' : 'Play Short Film'}</span>
            </button>

            <button
              onClick={() => onSelectScene(Math.min(project.scenes.length - 1, activeSceneIndex + 1))}
              disabled={activeSceneIndex >= project.scenes.length - 1}
              className="p-2 text-stone-400 hover:text-white disabled:opacity-30 rounded-lg transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={handleReplay}
              className="p-2 text-stone-400 hover:text-white rounded-lg transition-colors"
              title="Restart Film"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-400">
            <span className="font-mono tabular-nums">
              Scene {activeSceneIndex + 1} / {project.scenes.length}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {Math.round(sceneProgress * currentScene.duration)}s / {currentScene.duration}s
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
