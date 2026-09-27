import React, { useState, useEffect } from 'react';
import { X, Sparkles, Film, Copy, Check, Download, Play, Loader2, Music, Video, ArrowRight, Globe, Palette } from 'lucide-react';
import { EBook, ShortFilmProject, VideoScene, VideoStyle } from '../../types/ebook';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../../utils/translations';

interface ReelScriptGeneratorModalProps {
  book: EBook;
  onClose: () => void;
  onLoadIntoCinemaStudio: (project: ShortFilmProject) => void;
  initialLanguage?: SupportedLanguage;
}

export interface GeneratedReelPayload {
  title: string;
  threeBulletInsights: string[];
  scenes: Array<{
    sceneNumber: number;
    title: string;
    voiceover: string;
    keynote: string;
    secondaryBullet?: string;
    visualPrompt: string;
    graphicAssets?: string;
    soundStyle?: string;
    chartType: string;
    duration: number;
  }>;
  audioCues: {
    bgmStyle: string;
    voiceTone: string;
    soundEffects: string[];
  };
  visualAssetPromptsForAI: string[];
}

export const ReelScriptGeneratorModal: React.FC<ReelScriptGeneratorModalProps> = ({
  book,
  onClose,
  onLoadIntoCinemaStudio,
  initialLanguage = 'en',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'json' | 'prompts'>('script');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [selectedVideoStyle, setSelectedVideoStyle] = useState<VideoStyle>('cinematic');
  const [reelData, setReelData] = useState<GeneratedReelPayload | null>(null);

  useEffect(() => {
    generateLocalizedReelScript(selectedLanguage, selectedVideoStyle);
  }, [book.id, selectedLanguage, selectedVideoStyle]);

  const generateLocalizedReelScript = async (lang: SupportedLanguage, style: VideoStyle) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/localized-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: book.title,
          author: book.author,
          targetLang: lang,
          videoStyle: style
        })
      });

      if (response.ok) {
        const data = await response.json();
        const visualPrompts = data.scenes?.map((s: any) => s.visualPrompt) || [];
        
        setReelData({
          title: data.title || `${book.title} (60s Reel)`,
          threeBulletInsights: data.threeBulletInsights || book.corePrinciples.slice(0, 3),
          scenes: data.scenes || [],
          audioCues: data.audioCues || {
            bgmStyle: 'Cinematic tension resolving into motivational clarity',
            voiceTone: 'Authoritative documentary voice',
            soundEffects: ['Clock tick', 'Sub boom', 'Cashflow swoosh']
          },
          visualAssetPromptsForAI: visualPrompts
        });
      }
    } catch (e) {
      console.error('Error generating localized reel:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJSON = () => {
    if (!reelData) return;
    navigator.clipboard.writeText(JSON.stringify(reelData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchInStudio = () => {
    if (!reelData) return;

    const bgByScene = ['rat_race', 'library', 'dark_terminal', 'sunlit_assets'];
    const scenes: VideoScene[] = reelData.scenes.map((s, idx) => ({
      id: `reel-scene-${Date.now()}-${idx}`,
      sceneNumber: s.sceneNumber || idx + 1,
      title: s.title || `Act ${idx + 1}`,
      voiceover: s.voiceover,
      duration: s.duration || 8,
      visualBackground: (bgByScene[idx % bgByScene.length] as any),
      chartType: (s.chartType as any) || 'cashflow_quadrant',
      keynote: s.keynote || `Act ${idx + 1}`,
      secondaryBullet: s.secondaryBullet || '',
      transition: idx === 1 ? 'zoom_in' : idx === 2 ? 'slide_left' : 'crossfade',
      visualPrompt: s.visualPrompt,
      graphicAssets: s.graphicAssets
    }));

    const project: ShortFilmProject = {
      id: `reel-project-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      author: book.author,
      title: reelData.title,
      description: `60-Second Short Film Script based on ${book.title}`,
      scenes,
      audioVoice: 'Kore',
      ttsSpeed: 1.0,
      bgMusic: 'cinematic_orchestral',
      bgMusicVolume: 0.25,
      ttsVolume: 0.95,
      aspectRatio: '16:9',
      videoStyle: selectedVideoStyle,
      language: selectedLanguage
    };

    onLoadIntoCinemaStudio(project);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-4xl h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF8F5] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-900/10 flex items-center justify-center text-amber-900">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest">
                <span>AI Video Content Producer Engine</span>
                <span aria-hidden="true">·</span>
                <span>Localized 60s Reel Script</span>
              </div>
              <h2 className="text-lg font-serif font-bold text-stone-900 line-clamp-1">
                {book.title} — Virtual Video Reel
              </h2>
            </div>
          </div>

          {/* Quick Style & Language Controls in Header */}
          <div className="flex items-center gap-2">
            
            {/* Style Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs">
              <Palette className="w-3.5 h-3.5 text-amber-700" />
              <select
                value={selectedVideoStyle}
                onChange={(e) => setSelectedVideoStyle(e.target.value as VideoStyle)}
                className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer"
              >
                <option value="cinematic">Cinematic 35mm</option>
                <option value="infographic">2D Infographic</option>
                <option value="motion_reel">Motion Reel (Neon)</option>
                <option value="studio_3d">3D Studio (Isometric)</option>
              </select>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent font-medium text-amber-900 focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-stone-50 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('script')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'script' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Localized 60s Reel Script
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'prompts' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Veo & Sora Prompts (4K)
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'json' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Production JSON Schema
            </button>
          </div>

          <button
            onClick={handleCopyJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Schema'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin text-amber-800" />
              <p className="text-sm font-serif">Scripting localized 60-second video reel with Gemini 3.8 Flash...</p>
            </div>
          ) : reelData ? (
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* TAB 1: 60s Reel Screenplay */}
              {activeTab === 'script' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* 3-Bullet Key Insights */}
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
                      Core 3-Bullet Insight ({selectedLanguage.toUpperCase()})
                    </span>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-stone-800 list-disc list-inside">
                      {reelData.threeBulletInsights.map((bullet, i) => (
                        <li key={i} className="leading-relaxed">{bullet}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 4-Act Scenes */}
                  <div className="space-y-4">
                    <h3 className="text-base font-serif font-bold text-stone-900">
                      4-Act Screenplay Breakdown (Style: {selectedVideoStyle})
                    </h3>

                    {reelData.scenes.map((scene, idx) => (
                      <div key={idx} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-amber-900">ACT 0{scene.sceneNumber}: {scene.title}</span>
                          <span className="text-stone-400">{scene.duration}s</span>
                        </div>
                        <div className="text-xs text-stone-600 font-mono">
                          [ON-SCREEN KEYNOTE]: {scene.keynote}
                        </div>
                        {scene.visualPrompt && (
                          <div className="text-xs text-stone-500 italic">
                            [VISUAL PROMPT]: {scene.visualPrompt}
                          </div>
                        )}
                        <div className="text-sm font-serif text-stone-900 bg-white p-3 rounded-lg border border-stone-200">
                          "{scene.voiceover}"
                        </div>
                        {scene.soundStyle && (
                          <div className="text-[11px] text-stone-400 font-mono">
                            Audio Cue: {scene.soundStyle}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 2: AI Video Prompts (Veo / Sora) */}
              {activeTab === 'prompts' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1">
                    <h3 className="text-lg font-serif font-bold text-stone-900">
                      Visual Asset Generation Prompts (Veo / Sora Ready)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Ultra-detailed 4K prompts for generative video pipelines matching the {selectedVideoStyle} aesthetic.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {reelData.visualAssetPromptsForAI.map((prompt, idx) => (
                      <div key={idx} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-amber-900">
                            SCENE {idx + 1} VEO PROMPT
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(prompt);
                              alert('Copied prompt to clipboard!');
                            }}
                            className="text-xs text-stone-500 hover:text-stone-900"
                          >
                            Copy
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-800 font-mono bg-white p-3 rounded border border-stone-200 leading-relaxed">
                          {prompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Structured JSON Payload */}
              {activeTab === 'json' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-stone-500 uppercase">
                      Raw Production Payload (Localized Schema)
                    </span>
                    <button
                      onClick={handleCopyJSON}
                      className="text-xs font-semibold text-amber-900 hover:underline"
                    >
                      {copied ? 'Copied' : 'Copy All'}
                    </button>
                  </div>
                  <pre className="p-4 bg-stone-900 text-amber-200 text-xs font-mono rounded-xl overflow-x-auto max-h-[420px] leading-relaxed">
                    {JSON.stringify(reelData, null, 2)}
                  </pre>
                </div>
              )}

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-mono">
            Directly compatible with Web Speech API & Gemini TTS
          </span>

          <button
            onClick={handleLaunchInStudio}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 rounded-lg shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Load & Play in Cinema Studio</span>
          </button>
        </div>

      </div>
    </div>
  );
};
