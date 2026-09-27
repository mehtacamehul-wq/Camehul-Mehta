import React from 'react';
import { Search, Sparkles, Film, BookMarked, Globe, ArrowRight, Download } from 'lucide-react';
import { heroLibImg } from '../data/ebooksData';
import { UILabels } from '../utils/translations';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
  totalBooksCount: number;
  onPlayFeaturedFilm: () => void;
  onOpenBulkExport?: () => void;
  uiLabels: UILabels;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedCategory,
  onSelectCategory,
  categories,
  totalBooksCount,
  onPlayFeaturedFilm,
  onOpenBulkExport,
  uiLabels,
}) => {
  return (
    <section className="relative pt-8 pb-12 border-b border-stone-200 overflow-hidden bg-gradient-to-b from-[#F7F4EE] to-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Curatorial Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
          
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-800">
              <span>Public Economic Archive</span>
              <span aria-hidden="true">·</span>
              <span>Open Library API Connected</span>
              <span aria-hidden="true">·</span>
              <span>Multi-Language Translation Active</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-stone-900 leading-[1.15] text-balance">
              {uiLabels.heroHeadline}
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
              {uiLabels.heroSubtitle}
            </p>

            {/* Quick Action Ribbon */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onPlayFeaturedFilm}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-900 hover:bg-amber-950 rounded-lg shadow-sm transition-all transform active:scale-95 whitespace-nowrap"
              >
                <Film className="w-4 h-4 text-amber-300" />
                <span>{uiLabels.playRichDadFilm}</span>
              </button>

              {onOpenBulkExport && (
                <button
                  onClick={onOpenBulkExport}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-amber-900" />
                  <span>Export All Catalog Data</span>
                </button>
              )}

              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Globe className="w-3.5 h-3.5 text-stone-400" />
                <span>Global Public Archive</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{totalBooksCount} titles</span>
              </div>
            </div>
          </div>

          {/* Dominant Hero Visual Anchor */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-300/80 aspect-[16/10] bg-stone-900 group">
              <img
                src={heroLibImg}
                alt="Contemporary financial archive library study with architectural lighting"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center justify-between text-xs text-stone-300 font-mono mb-1">
                  <span>VIRTUAL CINEMA PREVIEW</span>
                  <span>1080P HD · MULTI-LANG TTS</span>
                </div>
                <h3 className="text-base font-serif font-semibold text-white">
                  The Great Divergence: Escaping The Rat Race
                </h3>
                <p className="text-xs text-stone-300 line-clamp-1">
                  Act I to IV short film with kinetic financial balance charts & speech narration.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Global Search & Dynamic Filter Segmented Controls */}
        <div className="space-y-4 pt-2">
          <form onSubmit={onSearchSubmit} className="relative max-w-3xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={uiLabels.searchPlaceholder}
                className="w-full pl-12 pr-28 py-3.5 text-sm sm:text-base text-stone-900 bg-white border border-stone-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900 transition-all placeholder:text-stone-400"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap"
              >
                {uiLabels.searchBtn}
              </button>
            </div>
          </form>

          {/* Interactive Filter Tabs (Valid buttons per Constitution) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
                }`}
              >
                {uiLabels.categories[cat] || cat}
              </button>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
