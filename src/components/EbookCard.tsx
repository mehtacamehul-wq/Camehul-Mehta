import React, { useState, useEffect } from 'react';
import { BookOpen, Film, Sparkles, Download, FileText, ChevronDown, Bookmark, CheckCircle2 } from 'lucide-react';
import { EBook } from '../types/ebook';
import { downloadEbookAsEPUB, downloadEbookAsPDF, downloadEbookAsText } from '../utils/fileDownloader';
import { getReadingProgress, ReadingProgress } from '../utils/readingProgress';

interface EbookCardProps {
  book: EBook;
  onRead: (book: EBook) => void;
  onViewAISummary: (book: EBook) => void;
  onCreateFilm: (book: EBook) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (bookId: string) => void;
}

export const EbookCard: React.FC<EbookCardProps> = ({
  book,
  onRead,
  onViewAISummary,
  onCreateFilm,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const [showDownloads, setShowDownloads] = useState(false);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(() => getReadingProgress(book.id));

  // Sync reading progress reactively from localStorage & reader updates
  useEffect(() => {
    setReadingProgress(getReadingProgress(book.id));

    const handleCustomUpdate = (e: Event) => {
      const evt = e as CustomEvent<{ bookId: string; progress: ReadingProgress }>;
      if (!evt.detail || evt.detail.bookId === book.id) {
        setReadingProgress(getReadingProgress(book.id));
      }
    };

    const handleStorageUpdate = (e: StorageEvent) => {
      if (!e.key || e.key.includes(book.id) || e.key.includes('reading_progress') || e.key.includes('finlibre')) {
        setReadingProgress(getReadingProgress(book.id));
      }
    };

    window.addEventListener('finlibre_reading_progress_updated', handleCustomUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('finlibre_reading_progress_updated', handleCustomUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [book.id]);

  const currentPercentage = readingProgress
    ? (readingProgress.scrollPercentage !== undefined ? readingProgress.scrollPercentage : readingProgress.percentage)
    : 0;
  const hasStartedReading = !!(readingProgress && currentPercentage > 0);
  const isFinished = currentPercentage >= 100;

  return (
    <article className="flex flex-col bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-stone-400/80 transition-all duration-300 group shadow-xs relative">
      
      {/* Top Cover / Visual Area */}
      <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden border-b border-stone-100">
        
        {/* Visual Progress Badge Overlay for Started Books */}
        {hasStartedReading && (
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-950/80 backdrop-blur-md text-white text-[11px] font-mono tracking-tight shadow-md border border-stone-800">
            {isFinished ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-emerald-200">Completed</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-medium text-stone-200">
                  {readingProgress.currentChapter && readingProgress.totalChapters
                    ? `Ch. ${readingProgress.currentChapter}/${readingProgress.totalChapters}`
                    : 'Reading'}
                </span>
                <span className="opacity-40">·</span>
                <span className="font-bold text-amber-300 tabular-nums">{currentPercentage}%</span>
              </>
            )}
          </div>
        )}

        {/* Bookmark quick toggle button */}
        {onToggleBookmark && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(book.id);
            }}
            title={isBookmarked ? "Remove from Reading List" : "Add to Reading List"}
            className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-lg backdrop-blur-md transition-all ${
              isBookmarked 
                ? 'bg-amber-900 text-white shadow-md' 
                : 'bg-stone-900/60 text-stone-200 hover:text-white hover:bg-stone-900/90'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-amber-200' : ''}`} />
          </button>
        )}

        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center p-6 bg-gradient-to-br from-stone-100 to-amber-50/50 text-stone-700 text-center">
            <BookOpen className="w-10 h-10 text-stone-400 mb-2 stroke-1" />
            <span className="font-serif font-semibold text-lg line-clamp-2">{book.title}</span>
            <span className="text-xs text-stone-500 mt-1">{book.author}</span>
          </div>
        )}

        {/* Visual Progress Bar on Cover Edge */}
        {hasStartedReading && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-stone-900/60 backdrop-blur-xs z-10 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isFinished
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300'
              }`}
              style={{ width: `${currentPercentage}%` }}
            />
          </div>
        )}

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 z-15">
          <button
            onClick={() => onRead(book)}
            className="w-full py-2 text-xs font-semibold text-white bg-stone-900/90 backdrop-blur-xs rounded-lg hover:bg-stone-900 transition-colors flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isFinished
                ? 'Re-read Ebook (100% Completed)'
                : hasStartedReading
                ? `Resume Reading (${currentPercentage}% Read)`
                : 'Open Reading Room'}
            </span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Clean Unboxed Metadata with Typographic Separators (Zero-Pill Discipline) */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5 font-sans">
            <span className="text-amber-800 font-medium">{book.category}</span>
            <span aria-hidden="true">·</span>
            <span>{book.year}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{book.pages} pages</span>
          </div>

          {/* Primary Title */}
          <h3 className="text-lg font-serif font-bold text-stone-900 line-clamp-1 group-hover:text-amber-900 transition-colors">
            {book.title}
          </h3>

          <p className="text-xs text-stone-600 font-sans mt-0.5 font-medium">
            by {book.author}
          </p>

          <p className="text-xs text-stone-500 line-clamp-2 mt-2 leading-relaxed">
            {book.description}
          </p>
        </div>

        {/* Visual Reading Progress Module (for books that the user has started reading) */}
        {hasStartedReading && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-sans">
              <div className="flex items-center gap-1.5 text-amber-950 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  {isFinished
                    ? 'Ebook Completed'
                    : readingProgress.currentChapter && readingProgress.totalChapters
                    ? `Chapter ${readingProgress.currentChapter} of ${readingProgress.totalChapters}`
                    : 'Reading in progress'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono font-bold text-amber-900 tabular-nums">
                  {currentPercentage}%
                </span>
                <span className="text-[11px] text-amber-800/80">consumed</span>
              </div>
            </div>

            {/* Continuous Progress Track */}
            <div className="w-full bg-amber-200/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400"
                style={{ width: `${currentPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewAISummary(book)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-lg transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>AI Summary</span>
            </button>

            <button
              onClick={() => onCreateFilm(book)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-900 bg-amber-100/70 hover:bg-amber-100 text-amber-950 rounded-lg transition-colors whitespace-nowrap font-medium"
            >
              <Film className="w-3.5 h-3.5 text-amber-800" />
              <span>Short Film</span>
            </button>
          </div>

          {/* Download Drawer / Options */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
              <span className="font-mono text-[11px] text-stone-400">Source: {book.source}</span>
              
              <button
                onClick={() => setShowDownloads(!showDownloads)}
                className="inline-flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-amber-900 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Ebook</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showDownloads ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showDownloads && (
              <div className="mt-2 p-2 bg-stone-50 border border-stone-200 rounded-lg space-y-1.5 animate-fadeIn">
                <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider px-1">
                  Available Formats
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <button
                    onClick={() => downloadEbookAsEPUB(book)}
                    className="py-1 px-2 text-center bg-white border border-stone-200 hover:border-stone-400 rounded text-stone-800 font-medium transition-colors"
                    title="Universal E-Reader format (Apple Books, Kindle, Calibre)"
                  >
                    EPUB
                  </button>
                  <button
                    onClick={() => downloadEbookAsPDF(book)}
                    className="py-1 px-2 text-center bg-white border border-stone-200 hover:border-stone-400 rounded text-stone-800 font-medium transition-colors"
                    title="High-resolution printable document"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => downloadEbookAsText(book)}
                    className="py-1 px-2 text-center bg-white border border-stone-200 hover:border-stone-400 rounded text-stone-800 font-medium transition-colors"
                    title="Clean text transcription"
                  >
                    TXT / MD
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </article>
  );
};
