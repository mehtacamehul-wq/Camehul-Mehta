import React, { useState, useEffect } from 'react';
import { X, Sparkles, Volume2, VolumeX, Download, CheckCircle2, AlertCircle, Send, Loader2, ArrowRight } from 'lucide-react';
import { EBook, AISummaryResult } from '../types/ebook';
import { speechNarrator } from '../utils/audioSpeech';
import { downloadAISummaryJSON } from '../utils/fileDownloader';

interface AISummaryModalProps {
  book: EBook;
  onClose: () => void;
  onCreateFilm: (book: EBook) => void;
}

export const AISummaryModal: React.FC<AISummaryModalProps> = ({
  book,
  onClose,
  onCreateFilm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<AISummaryResult | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'laws' | 'matrix' | 'zebra' | 'mentor'>('summary');
  const [isNarrating, setIsNarrating] = useState(false);
  
  // Interactive Mentor Chat State
  const [userQuestion, setUserQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am your AI Financial Mentor grounded in "${book.title}" by ${book.author}. Ask me how to apply these wealth principles, calculate your cashflow, or transition to sustainable asset creation.`
    }
  ]);
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    fetchSummary();
    return () => {
      speechNarrator.stop();
    };
  }, [book.id]);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          category: book.category,
          excerpt: book.description,
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSummaryData(data);
      }
    } catch (e) {
      console.error('Failed to load AI summary:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNarration = () => {
    if (isNarrating) {
      speechNarrator.stop();
      setIsNarrating(false);
    } else {
      setIsNarrating(true);
      const text = `${book.title} executive summary. ${summaryData?.executiveSummary || book.description}. Core lesson: ${summaryData?.oneMinuteElevatorPitch || ''}`;
      speechNarrator.speakText(text, {
        voiceName: 'Kore',
        onEnd: () => setIsNarrating(false)
      });
    }
  };

  const handleAskMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim() || isAnswering) return;

    const q = userQuestion.trim();
    setUserQuestion('');
    setChatMessages(prev => [...prev, { sender: 'user', text: q }]);
    setIsAnswering(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          bookTitle: book.title,
          author: book.author,
          context: summaryData?.executiveSummary || book.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { sender: 'ai', text: data.answer }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'ai', text: 'I encountered an issue processing your query. Please check your connection and try again.' }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Connection timeout. Please retry.' }]);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-900/10 flex items-center justify-center text-amber-900">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest">
                <span>Integrated Gemini AI Engine</span>
                <span aria-hidden="true">·</span>
                <span>Deep Financial Breakdown</span>
              </div>
              <h2 className="text-lg font-serif font-bold text-stone-900 line-clamp-1">
                {book.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleNarration}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isNarrating ? 'bg-amber-600 text-white animate-pulse' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {isNarrating ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-800" />}
              <span>{isNarrating ? 'Stop Audio' : 'Listen with TTS'}</span>
            </button>

            {summaryData && (
              <button
                onClick={() => downloadAISummaryJSON(book, summaryData)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                title="Download JSON Report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </button>
            )}

            <button
              onClick={() => {
                speechNarrator.stop();
                onClose();
              }}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Bar (Segmented Controls) */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-stone-50 border-b border-stone-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'summary' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Executive Summary
          </button>
          <button
            onClick={() => setActiveTab('laws')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'laws' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            5 Core Wealth Laws
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'matrix' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Asset vs Liability Matrix
          </button>
          <button
            onClick={() => setActiveTab('zebra')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'zebra' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Zebra Sustainable Model
          </button>
          <button
            onClick={() => setActiveTab('mentor')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'mentor' ? 'bg-amber-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Ask AI Financial Mentor
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3 text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin text-amber-800" />
              <p className="text-sm font-serif">Synthesizing financial principles with Gemini 3.8 Flash...</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* TAB 1: EXECUTIVE SUMMARY */}
              {activeTab === 'summary' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Elevator Pitch Box */}
                  <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-amber-900 font-semibold">
                      60-Second Elevator Thesis
                    </span>
                    <p className="text-base sm:text-lg font-serif italic text-amber-950 leading-relaxed">
                      "{summaryData?.oneMinuteElevatorPitch || book.tagline}"
                    </p>
                  </div>

                  {/* Executive Synthesis */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-serif font-bold text-stone-900">
                      Curatorial Synthesis & Economic Impact
                    </h3>
                    <p className="text-stone-700 leading-relaxed text-sm sm:text-base">
                      {summaryData?.executiveSummary || book.description}
                    </p>
                  </div>

                  {/* Notable Quotes */}
                  {summaryData?.notableQuotes && summaryData.notableQuotes.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400">
                        Memorable Tenets
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        {summaryData.notableQuotes.map((q, i) => (
                          <div key={i} className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs sm:text-sm font-serif italic text-stone-800">
                            "{q}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Checklist */}
                  {summaryData?.actionChecklist && (
                    <div className="space-y-3 pt-4 border-t border-stone-200">
                      <h4 className="text-sm font-serif font-bold text-stone-900">
                        Practical Implementation Steps
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                        {summaryData.actionChecklist.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: 5 CORE WEALTH LAWS */}
              {activeTab === 'laws' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-bold text-stone-900">
                      The Five Invariable Laws of Capital Growth
                    </h3>
                    <p className="text-xs text-stone-500">
                      Derived directly from {book.title}’s financial architecture.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {summaryData?.fiveCoreLaws?.map((law, idx) => (
                      <div key={idx} className="p-4 bg-white border border-stone-200 rounded-xl space-y-2 hover:border-amber-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                            0{idx + 1}
                          </span>
                          <h4 className="font-serif font-bold text-base text-stone-900">
                            {law.rule}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                          {law.explanation}
                        </p>
                        <div className="pt-2 border-t border-stone-100 flex items-center gap-2 text-xs font-medium text-amber-900">
                          <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                          <span>Action: {law.practicalAction}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ASSET VS LIABILITY MATRIX */}
              {activeTab === 'matrix' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-bold text-stone-900">
                      Asset vs. Liability Clarification Matrix
                    </h3>
                    <p className="text-xs text-stone-500">
                      Contrast traditional popular myths with true wealth-building balance sheet accounting.
                    </p>
                  </div>

                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-stone-100 text-stone-700 font-mono text-[11px] uppercase tracking-wider border-b border-stone-200">
                        <tr>
                          <th className="p-3">Financial Item</th>
                          <th className="p-3">Traditional Assumption</th>
                          <th className="p-3 text-amber-900 font-bold">Wealth Builder's Reality</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {summaryData?.assetVsLiabilityBreakdown?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-stone-50 transition-colors">
                            <td className="p-3 font-semibold text-stone-900">{item.concept}</td>
                            <td className="p-3 text-stone-500">{item.traditionalView}</td>
                            <td className="p-3 text-stone-800 font-medium bg-amber-50/30">{item.wealthBuilderView}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 space-y-1">
                    <span className="font-semibold text-stone-900">The Golden Rule:</span>
                    <p>An asset deposits money into your account on a monthly basis. A liability extracts cash from your labor. If an item costs you money each month to keep, it belongs in the liability ledger until its net yield turns positive.</p>
                  </div>
                </div>
              )}

              {/* TAB 4: ZEBRA SUSTAINABLE MODEL */}
              {activeTab === 'zebra' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-bold text-stone-900">
                      The Zebra Paradigm: Black & White Sustainable Wealth
                    </h3>
                    <p className="text-xs text-stone-500">
                      Comparing the author's wealth insights with modern Zebra cooperative economics.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-100/70 border border-stone-200 rounded-xl space-y-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-rose-800 font-bold">
                        The Unicorn Monoculture
                      </span>
                      <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
                        <li>Endless VC cash burn & negative operating margins</li>
                        <li>Extractive monopoly & winner-take-all dynamics</li>
                        <li>High founder burnout & fragile debt structures</li>
                        <li>Paper stock valuation over real cash dividends</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-emerald-800 font-bold">
                        The Zebra Resilient Enterprise
                      </span>
                      <ul className="text-xs text-stone-700 space-y-1.5 list-disc list-inside">
                        <li>Durable profitability & positive unit economics from Day 1</li>
                        <li>Mutual aid & ecosystem dazzles (shared infrastructure)</li>
                        <li>50-year longevity over speculative 3-year flips</li>
                        <li>Real stakeholder dividend distributions</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                    <span className="text-xs font-serif font-bold text-amber-950">Synthesis with {book.title}:</span>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {summaryData?.zebraFinancialModel?.summary || "Zebra economics aligns seamlessly with Kiyosaki and Graham by insisting on cashflow positivity and anti-speculation as the ultimate foundation of enduring freedom."}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: ASK AI MENTOR */}
              {activeTab === 'mentor' && (
                <div className="space-y-4 animate-fadeIn flex flex-col h-[55vh]">
                  
                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-stone-900 text-white'
                              : 'bg-stone-100 text-stone-800 border border-stone-200'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isAnswering && (
                      <div className="flex justify-start">
                        <div className="p-3 bg-stone-100 rounded-xl flex items-center gap-2 text-xs text-stone-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                          <span>Consulting {book.title} insights...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleAskMentor} className="relative flex items-center pt-2 border-t border-stone-200">
                    <input
                      type="text"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder={`Ask anything about ${book.title} (e.g. "How do I calculate my asset cashflow?")...`}
                      className="w-full pl-4 pr-12 py-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-900/30 focus:border-amber-900"
                    />
                    <button
                      type="submit"
                      disabled={!userQuestion.trim() || isAnswering}
                      className="absolute right-2 p-2 text-white bg-amber-900 hover:bg-amber-950 disabled:opacity-40 rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-mono">
            Model: Gemini 3.8 Flash · High Fidelity TTS
          </span>

          <button
            onClick={() => {
              speechNarrator.stop();
              onClose();
              onCreateFilm(book);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-950 rounded-lg shadow-sm transition-all"
          >
            <span>Generate Virtual Short Film</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
