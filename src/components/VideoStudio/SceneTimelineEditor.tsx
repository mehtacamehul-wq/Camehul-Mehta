import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, Layers, Sliders, Volume2, MoveUp, MoveDown, Check, Loader2 } from 'lucide-react';
import { ShortFilmProject, VideoScene, SceneBackground, SceneChartType, SceneTransition } from '../../types/ebook';

interface SceneTimelineEditorProps {
  project: ShortFilmProject;
  activeSceneIndex: number;
  onSelectScene: (idx: number) => void;
  onUpdateProject: (updated: ShortFilmProject) => void;
  onGenerateAIScript: (topicPrompt: string) => Promise<void>;
  isGeneratingScript: boolean;
}

export const SceneTimelineEditor: React.FC<SceneTimelineEditorProps> = ({
  project,
  activeSceneIndex,
  onSelectScene,
  onUpdateProject,
  onGenerateAIScript,
  isGeneratingScript,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptBox, setShowPromptBox] = useState(false);
  const currentScene = project.scenes[activeSceneIndex] || project.scenes[0];

  const updateCurrentScene = (partial: Partial<VideoScene>) => {
    const updatedScenes = project.scenes.map((s, idx) => {
      if (idx === activeSceneIndex) {
        return { ...s, ...partial };
      }
      return s;
    });
    onUpdateProject({ ...project, scenes: updatedScenes });
  };

  const handleAddNewScene = () => {
    const newSceneNumber = project.scenes.length + 1;
    const newScene: VideoScene = {
      id: `custom-scene-${Date.now()}`,
      sceneNumber: newSceneNumber,
      title: `Act ${newSceneNumber}: New Financial Tenet`,
      voiceover: 'Acquiring true assets begins with consistent, small capital reallocations that compound over multi-year horizons.',
      duration: 8,
      visualBackground: 'library',
      chartType: 'asset_vs_liability',
      keynote: 'Consistent Capital Reallocation',
      secondaryBullet: 'Compounding accelerates through behavioral discipline',
      transition: 'crossfade'
    };

    const updated = {
      ...project,
      scenes: [...project.scenes, newScene]
    };
    onUpdateProject(updated);
    onSelectScene(project.scenes.length);
  };

  const handleDeleteScene = (idxToDelete: number) => {
    if (project.scenes.length <= 1) return;
    const updatedScenes = project.scenes
      .filter((_, idx) => idx !== idxToDelete)
      .map((s, i) => ({ ...s, sceneNumber: i + 1 }));

    onUpdateProject({ ...project, scenes: updatedScenes });
    onSelectScene(Math.max(0, activeSceneIndex - 1));
  };

  const handleTriggerAIScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    await onGenerateAIScript(customPrompt.trim());
    setShowPromptBox(false);
    setCustomPrompt('');
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-xs">
      
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-800">
            <Sliders className="w-3.5 h-3.5" />
            <span>Dynamic Scene & Screenplay Editor</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
            {project.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPromptBox(!showPromptBox)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-100/80 hover:bg-amber-100 rounded-lg transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-800" />
            <span>AI Script Generator</span>
          </button>

          <button
            onClick={handleAddNewScene}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Scene</span>
          </button>
        </div>
      </div>

      {/* AI Screenplay Generator Prompt Drawer */}
      {showPromptBox && (
        <form onSubmit={handleTriggerAIScript} className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-900 uppercase">
              Generate 4-Scene Short Film with Gemini
            </span>
            <button
              type="button"
              onClick={() => setShowPromptBox(false)}
              className="text-stone-400 hover:text-stone-700 text-xs"
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., 'How Benjamin Graham defines Margin of Safety vs speculation' or 'Zebra company economics vs Silicon Valley unicorn burn'..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/30 text-stone-900"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGeneratingScript || !customPrompt.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 rounded-lg disabled:opacity-40 transition-colors"
            >
              {isGeneratingScript ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Scripting with Gemini 3.8 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Script Screenplay</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Active Scene Detailed Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Scenes Overview List */}
        <div className="lg:col-span-4 space-y-2 border-r border-stone-100 pr-0 lg:pr-4">
          <span className="text-xs font-mono uppercase tracking-wider text-stone-400 block mb-2">
            Timeline Sequencer ({project.scenes.length} Acts)
          </span>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {project.scenes.map((scene, idx) => (
              <div
                key={scene.id}
                onClick={() => onSelectScene(idx)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  activeSceneIndex === idx
                    ? 'border-amber-700 bg-amber-50/50 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] font-bold text-amber-900">
                    ACT 0{scene.sceneNumber}
                  </span>
                  <span className="text-stone-400 font-mono">{scene.duration}s</span>
                </div>
                <div className="font-semibold text-stone-900 line-clamp-1 mb-1">
                  {scene.title}
                </div>
                <div className="text-stone-500 line-clamp-1 text-[11px]">
                  {scene.voiceover}
                </div>

                {project.scenes.length > 1 && (
                  <div className="pt-2 mt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">{scene.chartType.replace(/_/g, ' ')}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScene(idx);
                      }}
                      className="text-stone-400 hover:text-red-600 transition-colors p-0.5"
                      title="Delete Scene"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Scene Property Editor */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Scene Title */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-1">
                Scene Title
              </label>
              <input
                type="text"
                value={currentScene.title}
                onChange={(e) => updateCurrentScene({ title: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            {/* Keynote Headline */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-1">
                Keynote Headline Overlay
              </label>
              <input
                type="text"
                value={currentScene.keynote}
                onChange={(e) => updateCurrentScene({ keynote: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Voiceover Script */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-500">
                Voiceover Narration Script
              </label>
              <span className="text-[11px] text-stone-400 font-mono">
                {currentScene.voiceover.split(' ').length} words
              </span>
            </div>
            <textarea
              rows={3}
              value={currentScene.voiceover}
              onChange={(e) => updateCurrentScene({ voiceover: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 leading-relaxed font-sans"
              placeholder="Enter voiceover script for speech synthesis..."
            />
          </div>

          {/* Visual Theme & Motion Chart Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Visual Background Theme */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-1">
                Visual Atmosphere
              </label>
              <select
                value={currentScene.visualBackground}
                onChange={(e) => updateCurrentScene({ visualBackground: e.target.value as SceneBackground })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="rat_race">Rat Race Clockwork Maze</option>
                <option value="library">Contemporary Wealth Study</option>
                <option value="sunlit_assets">Sunlit Assets & Freedom</option>
                <option value="zebra_growth">Zebra Sustainable Trajectory</option>
                <option value="gold_minimal">Gold Minimalist Vault</option>
                <option value="dark_terminal">Dark Bloomberg Terminal</option>
                <option value="emerald_vault">Emerald Sovereign Vault</option>
              </select>
            </div>

            {/* Motion Chart Diagram */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-500 mb-1">
                Motion Chart
              </label>
              <select
                value={currentScene.chartType}
                onChange={(e) => updateCurrentScene({ chartType: e.target.value as SceneChartType })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="cashflow_quadrant">Cashflow Quadrant (E, S, B, I)</option>
                <option value="rat_race_cycle">Hamster Wheel vs Freedom</option>
                <option value="compound_interest">Compound Interest Curve</option>
                <option value="asset_vs_liability">Asset vs Liability Columns</option>
                <option value="zebra_vs_unicorn">Zebra Profit vs Unicorn Burn</option>
                <option value="velocity_of_money">Velocity of Capital</option>
              </select>
            </div>

            {/* Scene Duration */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono uppercase tracking-wider text-stone-500">
                  Duration
                </label>
                <span className="text-xs font-bold text-stone-900 font-mono">
                  {currentScene.duration}s
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                value={currentScene.duration}
                onChange={(e) => updateCurrentScene({ duration: parseInt(e.target.value) })}
                className="w-full accent-amber-900 cursor-pointer"
              />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
