import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { EbookCard } from './components/EbookCard';
import { EbookReaderModal } from './components/EbookReaderModal';
import { AISummaryModal } from './components/AISummaryModal';
import { VirtualCinemaStudio } from './components/VideoStudio/VirtualCinemaStudio';
import { ReelScriptGeneratorModal } from './components/VideoStudio/ReelScriptGeneratorModal';
import { BulkExportModal } from './components/BulkExportModal';
import { OpenLibraryExportModal } from './components/OpenLibraryExportModal';
import { EBook, ShortFilmProject } from './types/ebook';
import { FEATURED_EBOOKS } from './data/ebooksData';
import { searchGlobalFinanceEbooks } from './utils/ebookService';
import { SupportedLanguage, SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from './utils/translations';
import { Globe, BookOpen, Film, Sparkles, Download, Search, Filter, Loader2, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'library' | 'studio' | 'summaries'>('library');
  const [ebooks, setEbooks] = useState<EBook[]>(FEATURED_EBOOKS);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  
  // Modals & Export State
  const [activeReadingBook, setActiveReadingBook] = useState<EBook | null>(null);
  const [activeSummaryBook, setActiveSummaryBook] = useState<EBook | null>(null);
  const [activeReelBook, setActiveReelBook] = useState<EBook | null>(null);
  const [selectedStudioBook, setSelectedStudioBook] = useState<EBook | null>(null);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [bulkExportOpen, setBulkExportOpen] = useState(false);
  const [openLibraryExportOpen, setOpenLibraryExportOpen] = useState(false);
  const [readingListIds, setReadingListIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('finlibre_reading_list');
      return saved ? JSON.parse(saved) : ['rich-dad-poor-dad', 'zebra-learning-wealth'];
    } catch (e) {
      return ['rich-dad-poor-dad', 'zebra-learning-wealth'];
    }
  });

  const handleToggleBookmark = (bookId: string) => {
    setReadingListIds(prev => {
      const updated = prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId];
      try {
        localStorage.setItem('finlibre_reading_list', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const uiLabels = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;

  const categories = [
    'All',
    'Cashflow & Assets',
    'Zebra & Sustainable Startups',
    'Mindset & Psychology',
    'Investing & Markets',
    'Debt & Wealth Systems'
  ];

  // Perform search whenever search query, category, or language changes
  useEffect(() => {
    loadBooks();
  }, [searchQuery, selectedCategory, currentLanguage]);

  const loadBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const results = await searchGlobalFinanceEbooks({
        query: searchQuery,
        category: selectedCategory,
        language: currentLanguage === 'en' ? 'all' : currentLanguage,
        limit: 18
      });
      setEbooks(results);
    } catch (e) {
      console.error('Failed to load books:', e);
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBooks();
  };

  const handleLaunchFilmFromBook = (book: EBook) => {
    setSelectedStudioBook(book);
    setActiveReadingBook(null);
    setActiveSummaryBook(null);
    setActiveReelBook(book);
  };

  return (
    <div 
      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-amber-900 selection:text-white"
    >
      
      {/* Strict 3-Zone Navigation Header */}
      <Navigation
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenQuickSearch={() => setQuickSearchOpen(true)}
        onLaunchNewFilm={() => {
          setActiveReelBook(FEATURED_EBOOKS[0]);
        }}
        onOpenBulkExport={() => setBulkExportOpen(true)}
        onOpenOpenLibraryExport={() => setOpenLibraryExportOpen(true)}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        uiLabels={uiLabels}
      />

      {/* Main Views */}
      <main className="flex-1">
        
        {/* VIEW 1: GLOBAL EBOOKS LIBRARY */}
        {activeView === 'library' && (
          <div className="space-y-10 pb-16">
            
            {/* Curatorial Hero Section */}
            <HeroSection
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categories={categories}
              totalBooksCount={ebooks.length}
              onPlayFeaturedFilm={() => {
                setSelectedStudioBook(FEATURED_EBOOKS[0]);
                setActiveView('studio');
              }}
              onOpenBulkExport={() => setBulkExportOpen(true)}
              uiLabels={uiLabels}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              
              {/* Secondary Filter & Language Selector Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-500">
                    <BookOpen className="w-4 h-4 text-amber-800" />
                    <span>Catalog Registry ({ebooks.length} Volumes)</span>
                  </div>

                  {/* Open Library Endpoints Exporter Button */}
                  <button
                    onClick={() => setOpenLibraryExportOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors shadow-2xs"
                    title="Export data directly from Open Library REST API endpoints"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-800" />
                    <span>Open Library Export</span>
                  </button>

                  {/* Bulk Export Catalog Button in Toolbar */}
                  <button
                    onClick={() => setBulkExportOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors shadow-2xs"
                    title="Export All Catalog Data (JSON, CSV, ZIP, Markdown)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Catalog</span>
                  </button>
                </div>

                {/* Multi-Language Quick Pill Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">{uiLabels.languageVoice}:</span>
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs overflow-x-auto max-w-full">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setCurrentLanguage(lang.code)}
                        className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                          currentLanguage === lang.code ? 'bg-white text-stone-900 font-semibold shadow-xs' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {lang.nativeName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Books Grid */}
              {isLoadingBooks ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3 text-stone-500">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-800" />
                  <p className="text-sm font-serif">Querying global Open Library and curated archives...</p>
                </div>
              ) : ebooks.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
                  <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
                  <h3 className="text-lg font-serif font-bold text-stone-800">No finance ebooks matched your search</h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Try searching for broader keywords like "Cashflow", "Assets", "Trading", "Zebra", or reset your filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setCurrentLanguage('en');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    Reset Search Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ebooks.map((book) => (
                    <EbookCard
                      key={book.id}
                      book={book}
                      onRead={(b) => setActiveReadingBook(b)}
                      onViewAISummary={(b) => setActiveSummaryBook(b)}
                      onCreateFilm={(b) => setActiveReelBook(b)}
                      isBookmarked={readingListIds.includes(book.id)}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  ))}
                </div>
              )}

              {/* Curated Highlights Bento Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                
                {/* Highlight 1: Rich Dad Poor Dad */}
                <div className="p-6 bg-gradient-to-br from-amber-900/10 via-amber-900/5 to-transparent border border-amber-900/20 rounded-2xl space-y-3">
                  <div className="text-xs font-mono uppercase tracking-widest text-amber-900 font-bold">
                    Featured Masterpiece
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900">
                    Rich Dad Poor Dad by Robert Kiyosaki
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Learn the foundational difference between assets that deposit cashflow into your pocket versus liabilities that drain your labor. Includes chapter reader, downloadable EPUB, and a 4-act dynamic short film.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveReadingBook(FEATURED_EBOOKS[0])}
                      className="px-4 py-2 text-xs font-semibold text-stone-900 bg-white border border-stone-300 hover:border-stone-400 rounded-lg shadow-xs transition-colors"
                    >
                      {uiLabels.openReadingRoom}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudioBook(FEATURED_EBOOKS[0]);
                        setActiveView('studio');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 rounded-lg shadow-xs transition-colors"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>{uiLabels.watchShortFilms}</span>
                    </button>
                  </div>
                </div>

                {/* Highlight 2: Zebra Learning & Sustainable Startups */}
                <div className="p-6 bg-gradient-to-br from-emerald-900/10 via-emerald-900/5 to-transparent border border-emerald-900/20 rounded-2xl space-y-3">
                  <div className="text-xs font-mono uppercase tracking-widest text-emerald-900 font-bold">
                    Regenerative Economics
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900">
                    Zebra Companies & Sustainable Wealth
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Why black & white companies built for authentic profit and societal purpose outperform fragile venture unicorns burning speculative subsidies. Learn customer-funded unit economics.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveReadingBook(FEATURED_EBOOKS[1])}
                      className="px-4 py-2 text-xs font-semibold text-stone-900 bg-white border border-stone-300 hover:border-stone-400 rounded-lg shadow-xs transition-colors"
                    >
                      {uiLabels.openReadingRoom}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudioBook(FEATURED_EBOOKS[1]);
                        setActiveView('studio');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-950 rounded-lg shadow-xs transition-colors"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>{uiLabels.watchShortFilms}</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: VIRTUAL CINEMA & VIDEO STUDIO */}
        {activeView === 'studio' && (
          <VirtualCinemaStudio
            initialBook={selectedStudioBook}
            onBackToLibrary={() => setActiveView('library')}
            currentLanguage={currentLanguage}
          />
        )}

        {/* VIEW 3: AI SUMMARIES & FINANCIAL BREAKDOWNS */}
        {activeView === 'summaries' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-800">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Wealth Intel</span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-stone-900">
                {uiLabels.aiSummaries} & Law Breakdowns
              </h1>
              <p className="text-stone-600 text-sm max-w-2xl">
                Select any classic finance volume to access instant 60-second summaries, 5 core wealth laws, asset-liability balance sheets, and interactive mentoring.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED_EBOOKS.map((book) => (
                <div key={book.id} className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-amber-400 transition-colors shadow-xs">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                      <span className="text-amber-800 font-medium">{book.category}</span>
                      <span>·</span>
                      <span>{book.year}</span>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-stone-900">{book.title}</h3>
                    <p className="text-xs text-stone-600 mb-2 font-medium">by {book.author}</p>
                    <p className="text-xs text-stone-500 line-clamp-2">{book.tagline}</p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => setActiveSummaryBook(book)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-950"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{uiLabels.aiSummary}</span>
                    </button>
                    <button
                      onClick={() => setActiveReelBook(book)}
                      className="p-1.5 text-stone-500 hover:text-stone-900"
                      title={uiLabels.createShortFilm}
                    >
                      <Film className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Reading Room Modal */}
      {activeReadingBook && (
        <EbookReaderModal
          book={activeReadingBook}
          onClose={() => setActiveReadingBook(null)}
          onLaunchFilmForBook={handleLaunchFilmFromBook}
          initialLanguage={currentLanguage}
        />
      )}

      {/* AI Deep Summary & Mentor Modal */}
      {activeSummaryBook && (
        <AISummaryModal
          book={activeSummaryBook}
          onClose={() => setActiveSummaryBook(null)}
          onCreateFilm={(b) => {
            setActiveSummaryBook(null);
            setActiveReelBook(b);
          }}
        />
      )}

      {/* 60-Second Short Film Script & Reel Generator Modal */}
      {activeReelBook && (
        <ReelScriptGeneratorModal
          book={activeReelBook}
          onClose={() => setActiveReelBook(null)}
          onLoadIntoCinemaStudio={(proj) => {
            setActiveReelBook(null);
            setSelectedStudioBook(activeReelBook);
            setActiveView('studio');
          }}
          initialLanguage={currentLanguage}
        />
      )}

      {/* Bulk Data Export Modal */}
      <BulkExportModal
        isOpen={bulkExportOpen}
        onClose={() => setBulkExportOpen(false)}
        allBooks={ebooks}
        selectedCategory={selectedCategory}
        readingListIds={readingListIds}
      />

      {/* Quick Search Dialog */}
      {quickSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-900 uppercase">
                {uiLabels.searchCatalog}
              </span>
              <button
                onClick={() => setQuickSearchOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-xs"
              >
                Close (ESC)
              </button>
            </div>
            <form
              onSubmit={(e) => {
                handleSearchSubmit(e);
                setQuickSearchOpen(false);
              }}
              className="relative flex items-center"
            >
              <Search className="absolute left-3.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={uiLabels.searchPlaceholder}
                className="w-full pl-10 pr-24 py-3 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-900/30"
              />
              <button
                type="submit"
                className="absolute right-2 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800"
              >
                {uiLabels.searchBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Editorial Footer */}
      <footer className="border-t border-stone-200 bg-white py-12 text-xs text-stone-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-lg font-serif font-bold text-stone-900">FinLibre Cinema & Archive</span>
            <p className="text-stone-500">
              Universal financial literacy through global public ebooks, multi-language translation, high-fidelity speech synthesis, and AI short films.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-stone-600">
            <button onClick={() => setActiveView('library')} className="hover:text-stone-900 transition-colors">{uiLabels.globalLibrary}</button>
            <button onClick={() => setActiveView('studio')} className="hover:text-stone-900 transition-colors">{uiLabels.virtualCinema}</button>
            <button onClick={() => setActiveView('summaries')} className="hover:text-stone-900 transition-colors">{uiLabels.aiSummaries}</button>
            <a
              href="https://openlibrary.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-900 transition-colors"
            >
              Open Library API
            </a>
            <a
              href="https://www.gutenberg.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-900 transition-colors"
            >
              Project Gutenberg
            </a>
          </div>

          <div className="text-stone-400 font-mono text-[11px] text-center md:text-right">
            <span>Powered by Gemini 3.8 Flash & TTS</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>© 2026 FinLibre</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
