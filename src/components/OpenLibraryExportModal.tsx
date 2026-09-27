import React, { useState } from 'react';
import { 
  X, Download, Globe, Database, Layers, Check, ExternalLink, 
  Loader2, CheckCircle2, Code2, Copy, FileText, Archive, 
  Terminal, Sparkles, AlertCircle, RefreshCw, BookOpen, User, Star
} from 'lucide-react';
import { 
  OPEN_LIBRARY_ENDPOINTS, 
  OpenLibraryEndpointMeta, 
  testOpenLibraryEndpoint, 
  triggerServerOpenLibraryExport 
} from '../utils/openLibraryService';

interface OpenLibraryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultQuery?: string;
  defaultSubject?: string;
}

export const OpenLibraryExportModal: React.FC<OpenLibraryExportModalProps> = ({
  isOpen,
  onClose,
  defaultQuery = 'finance',
  defaultSubject = 'finance'
}) => {
  if (!isOpen) return null;

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'exporter' | 'inspector' | 'dumps'>('exporter');

  // Exporter Config
  const [searchQuery, setSearchQuery] = useState(defaultQuery);
  const [subjectSlug, setSubjectSlug] = useState(defaultSubject);
  const [recordLimit, setRecordLimit] = useState<number>(25);
  const [selectedFormat, setSelectedFormat] = useState<'zip' | 'json' | 'csv' | 'jsonl' | 'markdown'>('zip');
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([
    'search', 'works', 'editions', 'authors', 'subjects', 'ratings'
  ]);

  // Export execution state
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Inspector State
  const [inspectorEndpoint, setInspectorEndpoint] = useState<string>('search');
  const [inspectorParam, setInspectorParam] = useState<string>('finance');
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [inspectorResult, setInspectorResult] = useState<{
    status: number;
    durationMs: number;
    url: string;
    data: any;
  } | null>(null);
  const [inspectorError, setInspectorError] = useState<string | null>(null);
  const [copiedInspectorJson, setCopiedInspectorJson] = useState(false);

  // Preset domains
  const PRESET_TOPICS = [
    { label: 'Finance & Capital', query: 'finance', subject: 'finance' },
    { label: 'Economics & Markets', query: 'economics', subject: 'economics' },
    { label: 'Investing & Stocks', query: 'investing', subject: 'investments' },
    { label: 'Personal Wealth', query: 'personal finance', subject: 'money' },
    { label: 'Behavioral Psychology', query: 'wealth psychology', subject: 'psychology' },
    { label: 'Banking & Currency', query: 'banking currency', subject: 'banks_and_banking' }
  ];

  const handleToggleEndpoint = (id: string) => {
    setSelectedEndpoints(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSelectAllEndpoints = () => {
    setSelectedEndpoints(OPEN_LIBRARY_ENDPOINTS.map(e => e.id));
  };

  const handleSelectCoreEndpoints = () => {
    setSelectedEndpoints(['search', 'works', 'editions', 'authors']);
  };

  // Run Export
  const handleExecuteExport = async () => {
    setIsExporting(true);
    setExportComplete(false);
    setExportProgress(10);
    setProgressStatus('Connecting to https://openlibrary.org REST APIs...');

    try {
      // Animated step-by-step progress simulation while stream triggers
      await new Promise(r => setTimeout(r, 400));
      setExportProgress(30);
      setProgressStatus(`Harvesting ${selectedEndpoints.length} Open Library endpoints for "${searchQuery}"...`);

      await new Promise(r => setTimeout(r, 500));
      setExportProgress(65);
      setProgressStatus('Collating Canonical Works, Author Biographies & Editions...');

      await new Promise(r => setTimeout(r, 400));
      setExportProgress(90);
      setProgressStatus(`Generating ${selectedFormat.toUpperCase()} package...`);

      // Trigger download from backend harvester
      triggerServerOpenLibraryExport({
        query: searchQuery,
        subject: subjectSlug,
        limit: recordLimit,
        format: selectedFormat,
        endpoints: selectedEndpoints
      });

      await new Promise(r => setTimeout(r, 600));
      setExportProgress(100);
      setProgressStatus(`Export generated & delivered to downloads!`);
      setExportComplete(true);
    } catch (err: any) {
      console.error('Export error:', err);
      setProgressStatus(`Export failed: ${err.message || 'Network error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyExportUrl = () => {
    const params = new URLSearchParams({
      query: searchQuery,
      subject: subjectSlug,
      limit: String(recordLimit),
      format: selectedFormat,
      endpoints: selectedEndpoints.join(',')
    });
    const fullUrl = `${window.location.origin}/api/openlibrary/export/all?${params.toString()}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Test Inspector Endpoint
  const handleRunInspector = async () => {
    setInspectorLoading(true);
    setInspectorError(null);
    try {
      let params: any = {};
      if (inspectorEndpoint === 'search') params.query = inspectorParam;
      else if (inspectorEndpoint === 'subjects') params.subject = inspectorParam;
      else if (inspectorEndpoint === 'works' || inspectorEndpoint === 'editions' || inspectorEndpoint === 'ratings' || inspectorEndpoint === 'bookshelves' || inspectorEndpoint === 'authors' || inspectorEndpoint === 'isbn') {
        params.id = inspectorParam;
      }
      params.limit = 5;

      const res = await testOpenLibraryEndpoint(inspectorEndpoint, params);
      setInspectorResult(res);
    } catch (err: any) {
      setInspectorError(err.message || 'Failed to query endpoint');
    } finally {
      setInspectorLoading(false);
    }
  };

  const handleCopyInspectorJson = () => {
    if (!inspectorResult) return;
    navigator.clipboard.writeText(JSON.stringify(inspectorResult.data, null, 2));
    setCopiedInspectorJson(true);
    setTimeout(() => setCopiedInspectorJson(false), 2000);
  };

  const handleDownloadInspectorJson = () => {
    if (!inspectorResult) return;
    const blob = new Blob([JSON.stringify(inspectorResult.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openlibrary-${inspectorEndpoint}-sample.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-stone-200 bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-900 text-white flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                  Open Library API Data Exporter
                </h2>
                <a 
                  href="https://openlibrary.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-900 bg-amber-100/80 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300/60 transition-colors"
                >
                  openlibrary.org <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-xs text-stone-500">
                Harvest, inspect & export full records across all Open Library public REST endpoints
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('exporter')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'exporter'
                ? 'border-amber-900 text-amber-950 font-bold bg-white -mb-px'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Archive className="w-4 h-4 text-amber-900" />
            <span>Multi-Endpoint Bulk Exporter</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('inspector');
              if (!inspectorResult) handleRunInspector();
            }}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'inspector'
                ? 'border-amber-900 text-amber-950 font-bold bg-white -mb-px'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-900" />
            <span>Live Endpoint Inspector</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dumps')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'dumps'
                ? 'border-amber-900 text-amber-950 font-bold bg-white -mb-px'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Database className="w-4 h-4 text-amber-900" />
            <span>Official Data Dumps & Documentation</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">

          {/* ================= TAB 1: BULK EXPORTER ================= */}
          {activeTab === 'exporter' && (
            <div className="space-y-6">

              {/* Step 1: Select Endpoints */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider font-bold text-stone-600 flex items-center gap-1.5">
                    <span>1. Select Open Library API Endpoints to Harvest</span>
                    <span className="text-[11px] font-normal text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {selectedEndpoints.length} selected
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={handleSelectAllEndpoints}
                      className="text-xs text-amber-900 hover:underline font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-stone-300">|</span>
                    <button 
                      type="button" 
                      onClick={handleSelectCoreEndpoints}
                      className="text-xs text-stone-500 hover:text-stone-800"
                    >
                      Core Only
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {OPEN_LIBRARY_ENDPOINTS.map(ep => {
                    const isSelected = selectedEndpoints.includes(ep.id);
                    return (
                      <div
                        key={ep.id}
                        onClick={() => handleToggleEndpoint(ep.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-900 bg-amber-50/50 ring-1 ring-amber-900/20 shadow-2xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-stone-900">{ep.name}</span>
                          <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                            isSelected ? 'bg-amber-900 text-white' : 'border border-stone-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-amber-800 truncate mb-1">
                          {ep.path}
                        </p>
                        <p className="text-[11px] text-stone-500 line-clamp-2">
                          {ep.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Query & Subject Presets */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider font-bold text-stone-600 block">
                  2. Query & Domain Focus
                </label>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TOPICS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchQuery(p.query);
                        setSubjectSlug(p.subject);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        searchQuery === p.query
                          ? 'bg-amber-900 text-white shadow-2xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] font-medium text-stone-600 block mb-1">Search Keywords</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="e.g. finance, economics, buffett"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900 bg-white"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-stone-600 block mb-1">Subject Slug</span>
                    <input
                      type="text"
                      value={subjectSlug}
                      onChange={e => setSubjectSlug(e.target.value)}
                      placeholder="e.g. finance, investments, money"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900 bg-white"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-stone-600 block mb-1">Depth / Record Limit</span>
                    <select
                      value={recordLimit}
                      onChange={e => setRecordLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900 bg-white cursor-pointer"
                    >
                      <option value={10}>10 Canonical Works</option>
                      <option value={25}>25 Canonical Works (Recommended)</option>
                      <option value={50}>50 Canonical Works (Deep Export)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Choose Format */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider font-bold text-stone-600 block">
                  3. Export Format
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {/* Format 1: ZIP */}
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('zip')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedFormat === 'zip'
                        ? 'border-amber-900 bg-amber-50/60 ring-2 ring-amber-900/10'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Archive className="w-4 h-4 text-amber-900" />
                      {selectedFormat === 'zip' && <Check className="w-3.5 h-3.5 text-amber-900" />}
                    </div>
                    <span className="font-semibold text-xs text-stone-900 block">Bulk ZIP Archive</span>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      All endpoints in structured folders (works, authors, editions)
                    </p>
                  </button>

                  {/* Format 2: JSON */}
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('json')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedFormat === 'json'
                        ? 'border-amber-900 bg-amber-50/60 ring-2 ring-amber-900/10'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Database className="w-4 h-4 text-amber-900" />
                      {selectedFormat === 'json' && <Check className="w-3.5 h-3.5 text-amber-900" />}
                    </div>
                    <span className="font-semibold text-xs text-stone-900 block">Master JSON</span>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      Deeply structured JSON schema containing all endpoint responses
                    </p>
                  </button>

                  {/* Format 3: CSV */}
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('csv')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedFormat === 'csv'
                        ? 'border-amber-900 bg-amber-50/60 ring-2 ring-amber-900/10'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <FileText className="w-4 h-4 text-amber-900" />
                      {selectedFormat === 'csv' && <Check className="w-3.5 h-3.5 text-amber-900" />}
                    </div>
                    <span className="font-semibold text-xs text-stone-900 block">Tabular CSV</span>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      Spreadsheet for Excel with ISBNs, authors, ratings & URLs
                    </p>
                  </button>

                  {/* Format 4: JSON Lines */}
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('jsonl')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedFormat === 'jsonl'
                        ? 'border-amber-900 bg-amber-50/60 ring-2 ring-amber-900/10'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Terminal className="w-4 h-4 text-amber-900" />
                      {selectedFormat === 'jsonl' && <Check className="w-3.5 h-3.5 text-amber-900" />}
                    </div>
                    <span className="font-semibold text-xs text-stone-900 block">JSON Lines (.jsonl)</span>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      Standard Open Library dump format for bulk pipelines & DBs
                    </p>
                  </button>

                  {/* Format 5: Markdown */}
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('markdown')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedFormat === 'markdown'
                        ? 'border-amber-900 bg-amber-50/60 ring-2 ring-amber-900/10'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Sparkles className="w-4 h-4 text-amber-900" />
                      {selectedFormat === 'markdown' && <Check className="w-3.5 h-3.5 text-amber-900" />}
                    </div>
                    <span className="font-semibold text-xs text-stone-900 block">Markdown Doc</span>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      Formatted bibliography & syllabus with links to archive.org
                    </p>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
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
                    <span className="font-mono font-bold text-amber-900">{exportProgress}%</span>
                  </div>

                  <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-900 transition-all duration-300 rounded-full"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Developer Direct URL */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-xs font-mono">
                <div className="truncate text-stone-600">
                  <span className="text-amber-900 font-bold">API: </span>
                  <span>/api/openlibrary/export/all?query={encodeURIComponent(searchQuery)}&format={selectedFormat}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyExportUrl}
                  className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded text-stone-700 shrink-0 flex items-center gap-1 text-[11px] font-sans font-medium"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy Endpoint'}</span>
                </button>
              </div>

            </div>
          )}

          {/* ================= TAB 2: LIVE ENDPOINT INSPECTOR ================= */}
          {activeTab === 'inspector' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-stone-600 flex items-start gap-2.5">
                <Code2 className="w-4 h-4 text-amber-900 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900">Interactive Open Library REST Inspector: </span>
                  Send live requests directly to Open Library endpoints to inspect the schema, data structure, and HTTP response latency before exporting.
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="sm:w-1/3">
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">Target Endpoint</label>
                  <select
                    value={inspectorEndpoint}
                    onChange={e => {
                      const newEp = e.target.value;
                      setInspectorEndpoint(newEp);
                      if (newEp === 'search') setInspectorParam('finance');
                      else if (newEp === 'subjects') setInspectorParam('finance');
                      else if (newEp === 'works' || newEp === 'editions' || newEp === 'ratings') setInspectorParam('OL45804W');
                      else if (newEp === 'authors') setInspectorParam('OL21594A');
                      else if (newEp === 'isbn') setInspectorParam('9780143115762');
                      else if (newEp === 'recentchanges') setInspectorParam('');
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-amber-900 cursor-pointer"
                  >
                    <option value="search">Search API (/search.json)</option>
                    <option value="subjects">Subjects API (/subjects/&#123;name&#125;.json)</option>
                    <option value="works">Works API (/works/&#123;id&#125;.json)</option>
                    <option value="editions">Editions API (/works/&#123;id&#125;/editions.json)</option>
                    <option value="authors">Authors API (/authors/&#123;id&#125;.json)</option>
                    <option value="ratings">Ratings API (/works/&#123;id&#125;/ratings.json)</option>
                    <option value="isbn">Books & ISBN API (/isbn/&#123;isbn&#125;.json)</option>
                    <option value="recentchanges">Recent Changes API (/recentchanges.json)</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Parameter ({inspectorEndpoint === 'search' ? 'Query Keyword' : inspectorEndpoint === 'subjects' ? 'Subject Tag' : inspectorEndpoint === 'authors' ? 'Author ID (e.g. OL21594A)' : inspectorEndpoint === 'isbn' ? 'ISBN (10 or 13)' : 'Work ID (e.g. OL45804W)'})
                  </label>
                  <input
                    type="text"
                    value={inspectorParam}
                    onChange={e => setInspectorParam(e.target.value)}
                    placeholder="Enter query, work ID, or subject..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-amber-900 font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={inspectorLoading}
                    onClick={handleRunInspector}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    {inspectorLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Querying...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Test Endpoint</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Endpoint result viewer */}
              {inspectorError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{inspectorError}</span>
                </div>
              )}

              {inspectorResult && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-stone-100 p-2.5 rounded-lg border border-stone-200">
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        HTTP {inspectorResult.status}
                      </span>
                      <span className="text-stone-500 text-[11px]">{inspectorResult.durationMs}ms</span>
                      <a
                        href={inspectorResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-900 hover:underline truncate inline-flex items-center gap-1"
                      >
                        {inspectorResult.url} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyInspectorJson}
                        className="px-2 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded text-[11px] font-sans font-medium text-stone-700 flex items-center gap-1"
                      >
                        {copiedInspectorJson ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedInspectorJson ? 'Copied' : 'Copy JSON'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadInspectorJson}
                        className="px-2 py-1 bg-amber-900 hover:bg-amber-950 text-white rounded text-[11px] font-sans font-medium flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download JSON</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[360px] border border-stone-800 shadow-inner">
                    <pre>{JSON.stringify(inspectorResult.data, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: OFFICIAL DUMPS & DOCS ================= */}
          {activeTab === 'dumps' && (
            <div className="space-y-5">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-900" />
                  <span>About Open Library API & Internet Archive Data Dumps</span>
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Open Library (an initiative of the Internet Archive) provides both real-time REST API endpoints and complete, monthly raw database dumps. All metadata is public domain and released under the CC0 / Open Data Commons Public Domain Dedication and License (PDDL).
                </p>
              </div>

              {/* Dumps Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">Works Dump (ol_dump_works.txt.gz)</span>
                    <span className="text-[10px] font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">~25M+ Records</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Tab-delimited JSON Lines file of all canonical book works, concepts, and descriptions.
                  </p>
                  <a
                    href="https://openlibrary.org/developers/dumps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-amber-900 hover:underline font-medium pt-1"
                  >
                    View Official Dumps Archive <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">Editions Dump (ol_dump_editions.txt.gz)</span>
                    <span className="text-[10px] font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">~40M+ Records</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Tab-delimited records of every physical and digital edition, ISBNs, publishers, and page counts.
                  </p>
                  <a
                    href="https://openlibrary.org/developers/dumps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-amber-900 hover:underline font-medium pt-1"
                  >
                    View Official Dumps Archive <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">Authors Dump (ol_dump_authors.txt.gz)</span>
                    <span className="text-[10px] font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">~10M+ Records</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Complete biographical author entities, birth dates, aliases, and Wikipedia references.
                  </p>
                  <a
                    href="https://openlibrary.org/developers/dumps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-amber-900 hover:underline font-medium pt-1"
                  >
                    View Official Dumps Archive <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">Ratings Dump (ol_dump_ratings.txt.gz)</span>
                    <span className="text-[10px] font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">Community Metrics</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Anonymized rating logs, scores, and reader reviews across works.
                  </p>
                  <a
                    href="https://openlibrary.org/developers/dumps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-amber-900 hover:underline font-medium pt-1"
                  >
                    View Official Dumps Archive <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Developer quick reference */}
              <div className="p-4 bg-stone-900 text-stone-200 rounded-xl space-y-2 font-mono text-xs">
                <span className="text-amber-400 font-bold">Quick cURL Harvest Example:</span>
                <pre className="text-stone-300 overflow-x-auto p-2 bg-stone-950 rounded border border-stone-800">
{`# 1. Harvest Open Library Works & Authors via FinLibre API:
curl -o openlibrary_harvest.zip \\
  "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/openlibrary/export/all?query=finance&format=zip&limit=25"

# 2. Or query Open Library direct search API:
curl "https://openlibrary.org/search.json?q=finance&limit=10"`}
                </pre>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isExporting || selectedEndpoints.length === 0}
              onClick={handleExecuteExport}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs transition-all transform active:scale-95"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Harvesting Endpoints...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Open Library Data ({selectedFormat.toUpperCase()})</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
