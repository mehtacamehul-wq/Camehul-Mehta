export interface EBookChapter {
  id: string;
  chapterNumber: number;
  title: string;
  excerpt: string;
  fullText: string;
  keyTakeaways: string[];
}

export interface EBook {
  id: string;
  title: string;
  author: string;
  year: number;
  category: 'Mindset & Psychology' | 'Cashflow & Assets' | 'Investing & Markets' | 'Zebra & Sustainable Startups' | 'Debt & Wealth Systems';
  coverUrl: string;
  tagline: string;
  description: string;
  pages: number;
  language: string;
  rating: number;
  source: 'Open Library' | 'Project Gutenberg' | 'Curated Global Archive';
  openLibraryId?: string;
  gutenbergId?: string;
  isDownloadable: boolean;
  downloadFormats: {
    epub?: string;
    pdf?: string;
    txt?: string;
    jsonAnalysis?: string;
  };
  chapters: EBookChapter[];
  corePrinciples: string[];
  keyQuotes: string[];
  financialFormulas: {
    title: string;
    formula: string;
    explanation: string;
  }[];
}

export type SceneBackground = 
  | 'library'
  | 'rat_race'
  | 'sunlit_assets'
  | 'zebra_growth'
  | 'gold_minimal'
  | 'dark_terminal'
  | 'emerald_vault';

export type SceneChartType = 
  | 'cashflow_quadrant'
  | 'rat_race_cycle'
  | 'compound_interest'
  | 'asset_vs_liability'
  | 'zebra_vs_unicorn'
  | 'velocity_of_money';

export type VideoStyle = 'cinematic' | 'infographic' | 'motion_reel' | 'studio_3d';

export type SceneTransition = 'crossfade' | 'slide_left' | 'zoom_in' | 'flash_cut';

export interface VideoScene {
  id: string;
  sceneNumber: number;
  title: string;
  voiceover: string;
  duration: number; // in seconds
  visualBackground: SceneBackground;
  chartType: SceneChartType;
  keynote: string;
  secondaryBullet?: string;
  transition: SceneTransition;
  visualPrompt?: string; // 4K Veo/Sora prompt
  graphicAssets?: string; // description of on-screen elements
}

export interface ShortFilmProject {
  id: string;
  bookId: string;
  bookTitle: string;
  author: string;
  title: string;
  description: string;
  scenes: VideoScene[];
  audioVoice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  ttsSpeed: number; // 0.8 - 1.3
  bgMusic: 'ambient_warmth' | 'cinematic_orchestral' | 'upbeat_lofi' | 'none';
  bgMusicVolume: number; // 0 - 1
  ttsVolume: number; // 0 - 1
  aspectRatio: '16:9' | '9:16';
  videoStyle?: VideoStyle;
  language?: string; // 'en' | 'hi' | 'es' | etc.
  generatedAudioUrls?: Record<string, string>; // sceneId -> audio data url
}

export interface AISummaryResult {
  executiveSummary: string;
  oneMinuteElevatorPitch: string;
  fiveCoreLaws: {
    rule: string;
    explanation: string;
    practicalAction: string;
  }[];
  assetVsLiabilityBreakdown: {
    concept: string;
    traditionalView: string;
    wealthBuilderView: string;
  }[];
  zebraFinancialModel: {
    summary: string;
    sustainableMetrics: string[];
  };
  actionChecklist: string[];
  notableQuotes: string[];
}
