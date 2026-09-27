import React from 'react';
import { Film, BookOpen, Sparkles, Download, Search, Globe } from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, UILabels } from '../utils/translations';

interface NavigationProps {
  activeView: 'library' | 'studio' | 'summaries';
  onSelectView: (view: 'library' | 'studio' | 'summaries') => void;
  onOpenQuickSearch: () => void;
  onLaunchNewFilm: () => void;
  onOpenBulkExport: () => void;
  onOpenOpenLibraryExport: () => void;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  uiLabels: UILabels;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeView,
  onSelectView,
  onOpenQuickSearch,
  onLaunchNewFilm,
  onOpenBulkExport,
  onOpenOpenLibraryExport,
  currentLanguage,
  onSelectLanguage,
  uiLabels,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectView('library')}
          className="text-2xl font-serif font-bold tracking-tight text-stone-900 hover:text-amber-900 transition-colors whitespace-nowrap"
        >
          {uiLabels.brandTitle}
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => onSelectView('library')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeView === 'library'
                ? 'text-stone-900 font-semibold border-b-2 border-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            {uiLabels.globalLibrary}
          </button>
          <button
            onClick={() => onSelectView('studio')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeView === 'studio'
                ? 'text-stone-900 font-semibold border-b-2 border-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            {uiLabels.virtualCinema}
          </button>
          <button
            onClick={() => onSelectView('summaries')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeView === 'summaries'
                ? 'text-stone-900 font-semibold border-b-2 border-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            {uiLabels.aiSummaries}
          </button>
          <button
            onClick={onOpenOpenLibraryExport}
            className="hover:text-amber-950 text-amber-900 transition-colors whitespace-nowrap flex items-center gap-1.5 font-semibold bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200/80 shadow-2xs"
            title="Export all data from Open Library REST API endpoints"
          >
            <Globe className="w-3.5 h-3.5 text-amber-800" />
            <span>Open Library Export</span>
          </button>
          <button
            onClick={onOpenBulkExport}
            className="hover:text-stone-900 text-stone-600 transition-colors whitespace-nowrap flex items-center gap-1.5"
            title="Export FinLibre Catalog (JSON, CSV, ZIP)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Catalog</span>
          </button>
          <button
            onClick={onOpenQuickSearch}
            className="hover:text-stone-900 transition-colors whitespace-nowrap flex items-center gap-1.5 text-stone-500"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{uiLabels.searchCatalog}</span>
          </button>
        </nav>

        {/* Zone 3: Actions + Global Language Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Open Library Export for mobile */}
          <button
            onClick={onOpenOpenLibraryExport}
            title="Open Library API Exporter"
            className="md:hidden p-2 text-amber-900 hover:bg-amber-100/60 rounded-lg transition-colors"
          >
            <Globe className="w-4 h-4" />
          </button>

          {/* Quick Bulk Export Icon for mobile */}
          <button
            onClick={onOpenBulkExport}
            title="Export All Catalog Data"
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Global Language Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs transition-colors">
            <Globe className="w-3.5 h-3.5 text-stone-600 shrink-0" />
            <select
              value={currentLanguage}
              onChange={(e) => onSelectLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent font-medium text-stone-800 focus:outline-none cursor-pointer pr-1"
              title="Switch Application Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-white text-stone-900">
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onLaunchNewFilm}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{uiLabels.createShortFilm}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
