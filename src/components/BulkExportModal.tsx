import React, { useState } from 'react';
import { 
  X, Download, FileText, Database, Archive, Sparkles, CheckCircle2, 
  Loader2, Bookmark, Layers, HardDrive, Check, ExternalLink, Globe 
} from 'lucide-react';
import { EBook } from '../types/ebook';
import { 
  downloadBulkCatalogJSON, 
  downloadBulkCatalogCSV, 
  downloadBulkCatalogMarkdown, 
  downloadBulkZipArchive,
  triggerServerCatalogExport 
} from '../utils/fileDownloader';
import { fetchCompleteCatalogPaginated } from '../utils/ebookService';

export type ExportScope = 'all' | 'category' | 'reading_list';
export type ExportFormat = 'json' | 'csv' | 'zip' | 'markdown';

interface BulkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allBooks: EBook[];
  selectedCategory: string;
  readingListIds: string[];
  onOpenOpenLibraryExport?: () => void;
}

export const BulkExportModal: React.FC<BulkExportModalProps> = ({
  isOpen,
  onClose,
  allBooks,
  selectedCategory,
  readingListIds,
  onOpenOpenLibraryExport,
}) => {
  if (!isOpen) return null;

  const [selectedScope, setSelectedScope] = useState<ExportScope>('all');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('zip');
  const [exportSource, setExportSource] = useState<'client' | 'server'>('client');
  const [isExporting, setIsExporting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [exportComplete, setExportComplete] = useState(false);

  // Compute targeted books based on scope
  const getTargetBooks = (): EBook[] => {
    if (selectedScope === 'reading_list') {
      return allBooks.filter(b => readingListIds.includes(b.id));
    }
    if (selectedScope === 'category') {
      return selectedCategory === 'All' 
        ? allBooks 
        : allBooks.filter(b => b.category === selectedCategory);
    }
    return allBooks;
  };

  const targetBooks = getTargetBooks();
  const readingListCount = allBooks.filter(b => readingListIds.includes(b.id)).length;
  const categoryCount = selectedCategory === 'All' 
    ? allBooks.length 
    : allBooks.filter(b => b.category === selectedCategory).length;

  const handleExecuteExport = async () => {
    setIsExporting(true);
    setProgressPercent(5);
    setProgressStatus('Initializing export pipeline...');
    setExportComplete(false);

    try {
      if (exportSource === 'server') {
        // Direct stream from backend API endpoint
        setProgressPercent(50);
        setProgressStatus('Streaming payload from /api/export/catalog...');
        triggerServerCatalogExport(
          selectedFormat, 
          selectedScope, 
          selectedScope === 'category' ? selectedCategory : undefined
        );
        setTimeout(() => {
          setProgressPercent(100);
          setProgressStatus('Export delivered to browser downloads');
          setIsExporting(false);
          setExportComplete(true);
        }, 1200);
        return;
      }

      // Client-side processing with deep public API pagination if "all" scope
      let booksToExport = targetBooks;
      if (selectedScope === 'all' && booksToExport.length < 25) {
        setProgressStatus('Fetching extended global catalog pages...');
        booksToExport = await fetchCompleteCatalogPaginated({
          category: 'All',
          maxPages: 3,
          pageSize: 15,
          onProgress: (pct, msg) => {
            setProgressPercent(Math.min(50, Math.round(pct * 0.5)));
            setProgressStatus(msg);
          }
        });
      }

      const scopeLabel = selectedScope === 'reading_list' 
        ? 'reading-list' 
        : selectedScope === 'category' 
          ? `category-${selectedCategory.toLowerCase().replace(/\s+/g, '-')}` 
          : 'global-archive';

      if (selectedFormat === 'json') {
        setProgressPercent(80);
        setProgressStatus('Formatting structured JSON payload...');
        await new Promise(r => setTimeout(r, 200));
        downloadBulkCatalogJSON(booksToExport, scopeLabel);
      } else if (selectedFormat === 'csv') {
        setProgressPercent(80);
        setProgressStatus('Generating spreadsheet CSV rows...');
        await new Promise(r => setTimeout(r, 200));
        downloadBulkCatalogCSV(booksToExport, scopeLabel);
      } else if (selectedFormat === 'markdown') {
        setProgressPercent(80);
        setProgressStatus('Compiling master Markdown index...');
        await new Promise(r => setTimeout(r, 200));
        downloadBulkCatalogMarkdown(booksToExport, scopeLabel);
      } else if (selectedFormat === 'zip') {
        await downloadBulkZipArchive(booksToExport, scopeLabel, (pct, status) => {
          setProgressPercent(pct);
          setProgressStatus(status);
        });
      }

      setProgressPercent(100);
      setProgressStatus(`Successfully exported ${booksToExport.length} books`);
      setExportComplete(true);
    } catch (err: any) {
      console.error('Export error:', err);
      setProgressStatus(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/80 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-900/10 text-amber-900 flex items-center justify-center border border-amber-900/20">
              <Archive className="w-5 h-5 text-amber-900" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">
                Bulk Catalog Data Export
              </h2>
              <p className="text-xs text-stone-500">
                Download complete ebook schemas, spreadsheets, or offline ZIP packages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">

          {/* Open Library Dedicated Banner */}
          {onOpenOpenLibraryExport && (
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-900 text-white flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-stone-900">Need raw Open Library REST API data?</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      openlibrary.org
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Export raw API endpoints: Works, Authors, Editions, Subjects, Ratings & Dumps
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOpenLibraryExport();
                }}
                className="px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-2xs"
              >
                Launch API Exporter
              </button>
            </div>
          )}

          {/* Section 1: Export Scope Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider font-bold text-stone-600">
                1. Select Export Scope
              </label>
              <span className="text-xs text-stone-400">
                {targetBooks.length} books in scope
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option A: All Ebooks */}
              <button
                type="button"
                onClick={() => setSelectedScope('all')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedScope === 'all'
                    ? 'border-amber-900 bg-amber-50/60 ring-2 ring-amber-900/10'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-stone-900">All Ebooks</span>
                  <Database className={`w-4 h-4 ${selectedScope === 'all' ? 'text-amber-900' : 'text-stone-400'}`} />
                </div>
                <p className="text-xs text-stone-500">
                  Full library catalog + global public domain archives ({allBooks.length}+)
                </p>
              </button>

              {/* Option B: Current Category Filter */}
              <button
                type="button"
                onClick={() => setSelectedScope('category')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedScope === 'category'
                    ? 'border-amber-900 bg-amber-50/60 ring-2 ring-amber-900/10'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-stone-900">Current Filter</span>
                  <Layers className={`w-4 h-4 ${selectedScope === 'category' ? 'text-amber-900' : 'text-stone-400'}`} />
                </div>
                <p className="text-xs text-stone-500 line-clamp-1">
                  {selectedCategory} ({categoryCount} books)
                </p>
              </button>

              {/* Option C: User Reading List */}
              <button
                type="button"
                onClick={() => setSelectedScope('reading_list')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedScope === 'reading_list'
                    ? 'border-amber-900 bg-amber-50/60 ring-2 ring-amber-900/10'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-stone-900">Reading List</span>
                  <Bookmark className={`w-4 h-4 ${selectedScope === 'reading_list' ? 'text-amber-900' : 'text-stone-400'}`} />
                </div>
                <p className="text-xs text-stone-500">
                  Your bookmarked books ({readingListCount} saved)
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Export Format Options */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider font-bold text-stone-600 block">
              2. Choose Format
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Format 1: ZIP Archive */}
              <button
                type="button"
                onClick={() => setSelectedFormat('zip')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedFormat === 'zip'
                    ? 'border-amber-900 bg-amber-50/60 ring-2 ring-amber-900/10'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-amber-900" />
                    <span className="font-semibold text-stone-900">Bulk ZIP Archive (.zip)</span>
                  </div>
                  {selectedFormat === 'zip' && <Check className="w-4 h-4 text-amber-900" />}
                </div>
                <p className="text-xs text-stone-500">
                  Bundled offline package: EPUB containers, plain text chapters, catalog spreadsheet, and master index.
                </p>
              </button>

              {/* Format 2: JSON */}
              <button
                type="button"
                onClick={() => setSelectedFormat('json')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedFormat === 'json'
                    ? 'border-amber-900 bg-amber-50/60 ring-2 ring-amber-900/10'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-900" />
                    <span className="font-semibold text-stone-900">JSON Schema (.json)</span>
                  </div>
                  {selectedFormat === 'json' && <Check className="w-4 h-4 text-amber-900" />}
                </div>
                <p className="text-xs text-stone-500">
                  Full metadata records: ISBNs, download links, AI summaries, chapter syllabi, and TTS speech cues.
                </p>
              </button>

              {/* Format 3: CSV / Excel */}
              <button
                type="button"
                onClick={() => setSelectedFormat('csv')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedFormat === 'csv'
                    ? 'border-amber-900 bg-amber-50/60 ring-2 ring-amber-900/10'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-900" />
                    <span className="font-semibold text-stone-900">CSV / Excel Spreadsheet (.csv)</span>
                  </div>
                  {selectedFormat === 'csv' && <Check className="w-4 h-4 text-amber-900" />}
                </div>
                <p className="text-xs text-stone-500">
                  Tabular columns for authors, ratings, publication years, direct download URLs, and reading links.
                </p>
              </button>

              {/* Format 4: Markdown Index */}
              <button
                type="button"
                onClick={() => setSelectedFormat('markdown')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedFormat === 'markdown'
                    ? 'border-amber-900 bg-amber-50/60 ring-2 ring-amber-900/10'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-900" />
                    <span className="font-semibold text-stone-900">Master Reading Syllabus (.md)</span>
                  </div>
                  {selectedFormat === 'markdown' && <Check className="w-4 h-4 text-amber-900" />}
                </div>
                <p className="text-xs text-stone-500">
                  Clean Markdown documentation compiled with all book summaries, financial formulas, and laws.
                </p>
              </button>
            </div>
          </div>

          {/* Section 3: Engine Pipeline (Client vs Server) */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Export Source Mode:
              </span>
              <p className="text-xs text-stone-500 mt-0.5">
                {exportSource === 'client' 
                  ? 'Client-side compression (instant package of active catalog)'
                  : 'Backend API stream (/api/export/catalog with server normalization)'}
              </p>
            </div>

            <div className="flex items-center rounded-lg p-1 bg-stone-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setExportSource('client')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  exportSource === 'client' 
                    ? 'bg-white text-stone-900 shadow-xs' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Client Bundle
              </button>
              <button
                type="button"
                onClick={() => setExportSource('server')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  exportSource === 'server' 
                    ? 'bg-white text-stone-900 shadow-xs' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Server Stream (/api)
              </button>
            </div>
          </div>

          {/* Progress / Status feedback */}
          {(isExporting || exportComplete) && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-stone-700">
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 text-amber-900 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  <span className="font-medium">{progressStatus}</span>
                </div>
                <span className="font-mono font-bold text-amber-900">{progressPercent}%</span>
              </div>

              <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-900 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Direct API Endpoint info for developers */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-200 font-mono">
            <span>Direct API: /api/export/catalog?format={selectedFormat}</span>
            <a 
              href={`/api/export/catalog?format=${selectedFormat}&scope=${selectedScope}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-800 hover:underline"
            >
              Test Endpoint <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isExporting || targetBooks.length === 0}
            onClick={handleExecuteExport}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs transition-all transform active:scale-95"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting Catalog...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {selectedFormat.toUpperCase()} ({targetBooks.length} Books)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
