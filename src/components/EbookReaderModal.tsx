import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Download, BookOpen, ChevronLeft, ChevronRight, Settings, Bookmark, Globe, Loader2 } from 'lucide-react';
import { EBook, EBookChapter } from '../types/ebook';
import { speechNarrator } from '../utils/audioSpeech';
import { downloadEbookAsEPUB, downloadEbookAsPDF, downloadEbookAsText } from '../utils/fileDownloader';
import { SupportedLanguage, SUPPORTED_LANGUAGES, UILabels, UI_TRANSLATIONS } from '../utils/translations';
import {
  getReadingProgress,
  saveReadingProgress,
  useReadingScrollProgress,
  updateReadingProgressScroll,
  calculateScrollPercentage,
} from '../utils/readingProgress';

interface EbookReaderModalProps {
  book: EBook;
  onClose: () => void;
  onLaunchFilmForBook: (book: EBook) => void;
  initialLanguage?: SupportedLanguage;
}

export const EbookReaderModal: React.FC<EbookReaderModalProps> = ({
  book,
  onClose,
  onLaunchFilmForBook,
  initialLanguage = 'en',
}) => {
  const rawChapters = book.chapters && book.chapters.length > 0 
    ? book.chapters 
    : [
        {
          id: 'default-ch',
          chapterNumber: 1,
          title: 'Foundational Principles of Wealth',
          excerpt: book.description,
          fullText: `${book.description}\n\n${book.corePrinciples.map((p, i) => `Principle ${i + 1}: ${p}`).join('\n\n')}`,
          keyTakeaways: book.corePrinciples
        }
      ];

  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(() => {
    const existing = getReadingProgress(book.id);
    if (existing && typeof existing.currentChapter === 'number') {
      const idx = existing.currentChapter - 1;
      if (idx >= 0 && idx < rawChapters.length) {
        return idx;
      }
    }
    return 0;
  });

  const [theme, setTheme] = useState<'paper' | 'dark' | 'sepia'>('paper');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [isNarrating, setIsNarrating] = useState(false);
  const [speechProgress, setSpeechProgress] = useState(0);
  
  // Translation state
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedChapters, setTranslatedChapters] = useState<Record<string, { title: string; excerpt: string; fullText: string }>>({});

  // Reference to scrollable reader content
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  // Hook to track and persist scroll percentage directly to 'finlibre_reading_progress' in localStorage
  const { scrollPercentage, setScrollPercentage } = useReadingScrollProgress({
    bookId: book.id,
    containerRef: scrollContainerRef,
    currentChapter: activeChapterIndex + 1,
    totalChapters: rawChapters.length,
  });

  // Reset scroll container position when chapter changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeChapterIndex]);

  // Direct onScroll event handler for immediate container updates
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const pct = calculateScrollPercentage(target);
    setScrollPercentage(pct);
    updateReadingProgressScroll(book.id, pct, {
      currentChapter: activeChapterIndex + 1,
      totalChapters: rawChapters.length,
    });
  };

  const uiLabels = UI_TRANSLATIONS[selectedLanguage] || UI_TRANSLATIONS.en;
  const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];


  const rawChapter: EBookChapter = rawChapters[activeChapterIndex] || rawChapters[0];

  // Get current translated or raw chapter
  const currentChapter = {
    ...rawChapter,
    title: translatedChapters[rawChapter.id]?.title || rawChapter.title,
    excerpt: translatedChapters[rawChapter.id]?.excerpt || rawChapter.excerpt,
    fullText: translatedChapters[rawChapter.id]?.fullText || rawChapter.fullText,
  };

  // Auto-translate chapter if language is not English
  useEffect(() => {
    if (selectedLanguage === 'en') return;
    translateCurrentChapter(selectedLanguage);
  }, [selectedLanguage, activeChapterIndex]);

  const translateCurrentChapter = async (targetLang: SupportedLanguage) => {
    if (targetLang === 'en') return;
    const cacheKey = `${rawChapter.id}-${targetLang}`;
    if (translatedChapters[cacheKey]) return;

    setIsTranslating(true);
    speechNarrator.stop();
    setIsNarrating(false);

    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${rawChapter.title} ||| ${rawChapter.excerpt} ||| ${rawChapter.fullText}`,
          targetLang,
          context: `Financial book "${book.title}" Chapter ${rawChapter.chapterNumber}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        const parts = (data.translatedText || '').split('|||');
        setTranslatedChapters(prev => ({
          ...prev,
          [rawChapter.id]: {
            title: (parts[0] || rawChapter.title).trim(),
            excerpt: (parts[1] || rawChapter.excerpt).trim(),
            fullText: (parts[2] || parts[0] || rawChapter.fullText).trim()
          }
        }));
      }
    } catch (e) {
      console.error('Translation error:', e);
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleNarration = () => {
    if (isNarrating) {
      speechNarrator.stop();
      setIsNarrating(false);
      setSpeechProgress(0);
    } else {
      setIsNarrating(true);
      const textToRead = `${currentChapter.title}. ${currentChapter.excerpt}. ${currentChapter.fullText}`;
      speechNarrator.speakText(textToRead, {
        voiceName: 'Kore',
        lang: langConfig.ttsLangCode,
        onProgress: (p) => setSpeechProgress(p),
        onEnd: () => {
          setIsNarrating(false);
          setSpeechProgress(0);
        }
      });
    }
  };

  const handleClose = () => {
    speechNarrator.stop();
    setIsNarrating(false);
    onClose();
  };

  const themeClasses = {
    paper: 'bg-[#FAF8F5] text-stone-900 border-stone-200',
    dark: 'bg-[#141416] text-stone-200 border-stone-800',
    sepia: 'bg-[#F4EEDD] text-[#3D362A] border-[#E3D9C3]'
  };

  const proseThemeClasses = {
    paper: 'prose-stone text-stone-800',
    dark: 'prose-invert text-stone-300',
    sepia: 'text-[#3E382F]'
  };

  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-fadeIn">
      <div className={`w-full max-w-4xl h-[92vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${themeClasses[theme]} transition-colors duration-300`}>
        
        {/* Reader Top Utility Ribbon */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-inherit bg-inherit/90 backdrop-blur-xs">
          
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold line-clamp-1">
                {book.title}
              </h2>
              <div className="flex items-center gap-2 text-xs opacity-70 font-sans">
                <span>{book.author}</span>
                <span aria-hidden="true">·</span>
                <span>Chapter {currentChapter.chapterNumber} of {rawChapters.length}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-amber-700 dark:text-amber-400 font-semibold">{scrollPercentage}% read</span>
              </div>
            </div>
          </div>

          {/* Reader Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1 border border-inherit rounded-lg px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 opacity-60" />
              {isTranslating ? (
                <span className="flex items-center gap-1 text-amber-700 font-mono text-[11px]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Translating...
                </span>
              ) : (
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
                  className="bg-transparent font-medium focus:outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-white text-stone-900">
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Audio Narrator Button */}
            <button
              onClick={toggleNarration}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isNarrating 
                  ? 'bg-amber-600 text-white animate-pulse' 
                  : 'bg-stone-200/60 dark:bg-stone-800 hover:bg-amber-100 hover:text-amber-950'
              }`}
              title="High-quality text-to-speech audio reader"
            >
              {isNarrating ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isNarrating ? 'Pause Audio' : uiLabels.listenWithTTS}</span>
            </button>

            {/* Display Preferences */}
            <div className="flex items-center gap-1 border border-inherit rounded-lg p-1 text-xs">
              <button
                onClick={() => setTheme('paper')}
                className={`w-6 h-6 rounded flex items-center justify-center font-serif text-xs ${theme === 'paper' ? 'bg-amber-900 text-white' : 'opacity-70'}`}
                title="Paper Alabaster"
              >
                P
              </button>
              <button
                onClick={() => setTheme('sepia')}
                className={`w-6 h-6 rounded flex items-center justify-center font-serif text-xs ${theme === 'sepia' ? 'bg-[#9A3412] text-white' : 'opacity-70'}`}
                title="Warm Sepia"
              >
                S
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`w-6 h-6 rounded flex items-center justify-center font-serif text-xs ${theme === 'dark' ? 'bg-stone-700 text-white' : 'opacity-70'}`}
                title="Dark Mode"
              >
                D
              </button>
            </div>

            {/* Font Family */}
            <button
              onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
              className="px-2 py-1 text-xs border border-inherit rounded-lg opacity-80 hover:opacity-100"
              title="Toggle Serif/Sans"
            >
              {fontFamily === 'serif' ? 'Serif' : 'Sans'}
            </button>

            {/* Font Size */}
            <div className="hidden sm:flex items-center gap-1 border border-inherit rounded-lg px-2 py-1 text-xs">
              <button
                onClick={() => setFontSize(fontSize === 'xl' ? 'lg' : fontSize === 'lg' ? 'base' : 'sm')}
                className="hover:font-bold px-1"
              >
                A-
              </button>
              <span className="opacity-40">|</span>
              <button
                onClick={() => setFontSize(fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'xl')}
                className="hover:font-bold px-1"
              >
                A+
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

        </div>

        {/* Scroll Reading Progress Bar Track */}
        <div className="w-full bg-stone-200/50 dark:bg-stone-800/60 h-1">
          <div
            className="bg-amber-600 dark:bg-amber-500 h-1 transition-[width] duration-150 ease-out"
            style={{ width: `${scrollPercentage}%` }}
          />
        </div>

        {/* Audio Progress Bar */}
        {isNarrating && (
          <div className="w-full bg-amber-200 dark:bg-amber-950 h-1">
            <div
              className="bg-amber-600 h-1 transition-all duration-300"
              style={{ width: `${Math.round(speechProgress * 100)}%` }}
            />
          </div>
        )}

        {/* Reader Body Grid (Chapter Rail + Reading Column) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Chapter Drawer / Sidebar (Desktop) */}
          <aside className="hidden md:flex flex-col w-64 border-r border-inherit p-4 overflow-y-auto space-y-2 text-xs">
            <div className="font-mono uppercase tracking-wider text-[11px] opacity-60 mb-2">
              {uiLabels.tableOfContents}
            </div>
            {rawChapters.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => {
                  speechNarrator.stop();
                  setIsNarrating(false);
                  setActiveChapterIndex(idx);
                }}
                className={`text-left p-2.5 rounded-lg transition-colors ${
                  activeChapterIndex === idx
                    ? 'bg-amber-900/10 dark:bg-amber-100/10 text-amber-900 dark:text-amber-300 font-semibold'
                    : 'opacity-70 hover:opacity-100 hover:bg-stone-200/30 dark:hover:bg-stone-800/30'
                }`}
              >
                <div className="font-mono text-[10px] opacity-70">CHAPTER {ch.chapterNumber}</div>
                <div className="line-clamp-2 mt-0.5">
                  {translatedChapters[ch.id]?.title || ch.title}
                </div>
              </button>
            ))}

            <div className="pt-6 border-t border-inherit mt-auto space-y-2">
              <div className="font-mono uppercase tracking-wider text-[11px] opacity-60">
                {uiLabels.directDownload}
              </div>
              <button
                onClick={() => downloadEbookAsEPUB(book)}
                className="w-full py-1.5 px-3 text-left border border-inherit rounded hover:bg-stone-200/30 dark:hover:bg-stone-800/30 transition-colors"
              >
                Download EPUB File
              </button>
              <button
                onClick={() => downloadEbookAsPDF(book)}
                className="w-full py-1.5 px-3 text-left border border-inherit rounded hover:bg-stone-200/30 dark:hover:bg-stone-800/30 transition-colors"
              >
                Print / Save as PDF
              </button>
              <button
                onClick={() => downloadEbookAsText(book)}
                className="w-full py-1.5 px-3 text-left border border-inherit rounded hover:bg-stone-200/30 dark:hover:bg-stone-800/30 transition-colors"
              >
                Download Clean Text
              </button>
            </div>
          </aside>

          {/* Reading Column (Strict 65-75ch measure for optimal eye tracking) */}
          <main
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 flex justify-center"
          >
            <div className={`max-w-2xl w-full ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'} ${fontSizeClasses[fontSize]} ${proseThemeClasses[theme]}`}>
              
              {/* Chapter Header */}
              <div className="border-b border-inherit pb-6 mb-8">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  Chapter {currentChapter.chapterNumber}
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 mb-3">
                  {currentChapter.title}
                </h1>
                
                {/* Excerpt / Pull Quote */}
                <div className="italic opacity-80 border-l-2 border-amber-600 pl-4 my-4 font-serif text-lg">
                  "{currentChapter.excerpt}"
                </div>

                {/* Key Takeaways */}
                {rawChapter.keyTakeaways && rawChapter.keyTakeaways.length > 0 && (
                  <div className="bg-stone-500/10 p-4 rounded-xl my-4 text-xs font-sans space-y-1.5">
                    <span className="font-semibold uppercase tracking-wider text-[11px] opacity-80">
                      Core Chapter Takeaways:
                    </span>
                    <ul className="list-disc list-inside space-y-1 opacity-90">
                      {rawChapter.keyTakeaways.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Chapter Body with Drop Cap Opening */}
              <div className="space-y-6">
                {currentChapter.fullText.split('\n\n').map((paragraph, idx) => (
                  <p 
                    key={idx} 
                    className={idx === 0 ? "first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-amber-800 dark:first-letter:text-amber-400" : ""}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* End of Chapter Navigation */}
              <div className="border-t border-inherit pt-8 mt-12 flex items-center justify-between">
                <button
                  disabled={activeChapterIndex === 0}
                  onClick={() => {
                    speechNarrator.stop();
                    setIsNarrating(false);
                    setActiveChapterIndex(prev => Math.max(0, prev - 1));
                  }}
                  className="inline-flex items-center gap-1 px-4 py-2 border border-inherit rounded-lg text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none hover:bg-stone-200/30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{uiLabels.previousChapter}</span>
                </button>

                <button
                  onClick={() => onLaunchFilmForBook(book)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 rounded-lg shadow-sm transition-colors"
                >
                  {uiLabels.watchFilmAdaptation}
                </button>

                <button
                  disabled={activeChapterIndex >= rawChapters.length - 1}
                  onClick={() => {
                    speechNarrator.stop();
                    setIsNarrating(false);
                    setActiveChapterIndex(prev => Math.min(rawChapters.length - 1, prev + 1));
                  }}
                  className="inline-flex items-center gap-1 px-4 py-2 border border-inherit rounded-lg text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none hover:bg-stone-200/30 transition-colors"
                >
                  <span>{uiLabels.nextChapter}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </main>

        </div>

      </div>
    </div>
  );
};
