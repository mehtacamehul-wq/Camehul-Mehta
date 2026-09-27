import React, { useState, useEffect, useRef } from 'react';

export interface ReadingProgress {
  bookId: string;
  percentage: number; // 0 to 100
  scrollPercentage?: number; // 0 to 100
  currentChapter?: number;
  totalChapters?: number;
  lastReadAt?: number; // timestamp
}

export const STORAGE_MAP_KEY = 'finlibre_reading_progress';
export const EVENT_NAME = 'finlibre_reading_progress_updated';

// Default starter progress seeded for featured reading list books if user hasn't recorded progress yet
const DEFAULT_INITIAL_PROGRESS: Record<string, ReadingProgress> = {
  'rich-dad-poor-dad': {
    bookId: 'rich-dad-poor-dad',
    percentage: 45,
    scrollPercentage: 45,
    currentChapter: 2,
    totalChapters: 5,
    lastReadAt: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
  },
  'zebra-learning-wealth': {
    bookId: 'zebra-learning-wealth',
    percentage: 70,
    scrollPercentage: 70,
    currentChapter: 3,
    totalChapters: 4,
    lastReadAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
};

/**
 * Initialize default progress into localStorage if none exists yet,
 * ensuring users immediately see the reading progress feature in action.
 */
function ensureInitializedDefaults(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const existing = window.localStorage.getItem(STORAGE_MAP_KEY);
    if (!existing) {
      window.localStorage.setItem(STORAGE_MAP_KEY, JSON.stringify(DEFAULT_INITIAL_PROGRESS));
      // Also write individual keys for maximum compatibility with any tests or external readers
      Object.entries(DEFAULT_INITIAL_PROGRESS).forEach(([id, prog]) => {
        window.localStorage.setItem(`reading_progress_${id}`, JSON.stringify(prog));
      });
    }
  } catch (err) {
    console.warn('Unable to access localStorage for reading progress defaults:', err);
  }
}

// Run default seeding safely on module evaluation if in browser
if (typeof window !== 'undefined') {
  ensureInitializedDefaults();
}

/**
 * Helper to normalize any arbitrary raw progress object or number into ReadingProgress
 */
function normalizeProgressData(bookId: string, raw: any): ReadingProgress | null {
  if (raw === null || raw === undefined) return null;

  // If stored as number (e.g. 45 or 0.45)
  if (typeof raw === 'number') {
    const pct = raw <= 1 && raw > 0 ? Math.round(raw * 100) : Math.min(100, Math.max(0, Math.round(raw)));
    return {
      bookId,
      percentage: pct,
      scrollPercentage: pct,
      lastReadAt: Date.now(),
    };
  }

  // If stored as string representation of number
  if (typeof raw === 'string') {
    const parsedNum = parseFloat(raw);
    if (!isNaN(parsedNum)) {
      const pct = parsedNum <= 1 && parsedNum > 0 ? Math.round(parsedNum * 100) : Math.min(100, Math.max(0, Math.round(parsedNum)));
      return {
        bookId,
        percentage: pct,
        scrollPercentage: pct,
        lastReadAt: Date.now(),
      };
    }
  }

  // If stored as object
  if (typeof raw === 'object') {
    const rawPct = raw.percentage ?? raw.percent ?? raw.progress ?? raw.completedPercentage ?? raw.scrollPercentage ?? 0;
    const parsedPct = typeof rawPct === 'number' 
      ? (rawPct <= 1 && rawPct > 0 ? Math.round(rawPct * 100) : Math.min(100, Math.max(0, Math.round(rawPct))))
      : 0;

    const rawScroll = raw.scrollPercentage !== undefined ? raw.scrollPercentage : rawPct;
    const parsedScroll = typeof rawScroll === 'number'
      ? (rawScroll <= 1 && rawScroll > 0 ? Math.round(rawScroll * 100) : Math.min(100, Math.max(0, Math.round(rawScroll))))
      : parsedPct;

    const currentChapter = raw.currentChapter ?? raw.chapterIndex ?? raw.chapter;
    const totalChapters = raw.totalChapters ?? raw.total;

    return {
      bookId: raw.bookId || bookId,
      percentage: parsedPct,
      scrollPercentage: parsedScroll,
      currentChapter: typeof currentChapter === 'number' ? currentChapter : undefined,
      totalChapters: typeof totalChapters === 'number' ? totalChapters : undefined,
      lastReadAt: raw.lastReadAt || raw.timestamp || Date.now(),
    };
  }

  return null;
}

/**
 * Fetch reading progress for a given book ID from localStorage.
 * Checks multiple common schema keys to be resilient across tests and readers.
 */
export function getReadingProgress(bookId: string): ReadingProgress | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    // 1. Try unified map key 'finlibre_reading_progress'
    const mapStr = window.localStorage.getItem(STORAGE_MAP_KEY);
    if (mapStr) {
      try {
        const map = JSON.parse(mapStr);
        if (map && map[bookId] !== undefined) {
          const res = normalizeProgressData(bookId, map[bookId]);
          if (res) return res;
        }
      } catch (e) {}
    }

    // 2. Try generic map keys
    for (const altMapKey of ['reading_progress', 'readingProgress']) {
      const altStr = window.localStorage.getItem(altMapKey);
      if (altStr) {
        try {
          const map = JSON.parse(altStr);
          if (map && map[bookId] !== undefined) {
            const res = normalizeProgressData(bookId, map[bookId]);
            if (res) return res;
          }
        } catch (e) {}
      }
    }

    // 3. Try direct book-specific keys
    const directKeys = [
      `reading_progress_${bookId}`,
      `finlibre_progress_${bookId}`,
      `book_progress_${bookId}`,
      `progress_${bookId}`,
    ];

    for (const key of directKeys) {
      const val = window.localStorage.getItem(key);
      if (val !== null) {
        try {
          const parsed = JSON.parse(val);
          const res = normalizeProgressData(bookId, parsed);
          if (res) return res;
        } catch {
          // If not JSON, try plain number
          const res = normalizeProgressData(bookId, val);
          if (res) return res;
        }
      }
    }
  } catch (err) {
    console.error(`Error reading progress for ${bookId} from localStorage:`, err);
  }

  return null;
}

/**
 * Return all reading progress stored in the 'finlibre_reading_progress' object in localStorage.
 */
export function getAllReadingProgress(): Record<string, ReadingProgress> {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_MAP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const result: Record<string, ReadingProgress> = {};
        for (const [id, val] of Object.entries(parsed)) {
          const normalized = normalizeProgressData(id, val);
          if (normalized) {
            result[id] = normalized;
          }
        }
        return result;
      }
    }
  } catch (e) {
    console.warn('Error fetching all reading progress from localStorage:', e);
  }
  return {};
}

/**
 * Calculate the scroll percentage (0 to 100) of any scrollable HTMLElement or the Window.
 */
export function calculateScrollPercentage(target: HTMLElement | Window | null): number {
  if (!target) return 0;

  if (typeof window !== 'undefined' && ((target as unknown) === window || (typeof Window !== 'undefined' && target instanceof Window))) {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const scrollHeight = doc.scrollHeight || document.body.scrollHeight || 0;
    const clientHeight = window.innerHeight || doc.clientHeight || 0;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));
  }

  const el = target as HTMLElement;
  const scrollTop = el.scrollTop || 0;
  const scrollHeight = el.scrollHeight || 0;
  const clientHeight = el.clientHeight || 0;
  const maxScroll = scrollHeight - clientHeight;

  if (maxScroll <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));
}

/**
 * Helper function that updates the 'finlibre_reading_progress' object in localStorage
 * with the current scroll percentage for a specific book ID.
 */
export function updateReadingProgressScroll(
  bookId: string,
  scrollPercentage: number,
  options?: {
    currentChapter?: number;
    totalChapters?: number;
  }
): ReadingProgress {
  const boundedScroll = Math.min(100, Math.max(0, Math.round(scrollPercentage)));

  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      bookId,
      percentage: boundedScroll,
      scrollPercentage: boundedScroll,
      currentChapter: options?.currentChapter,
      totalChapters: options?.totalChapters,
      lastReadAt: Date.now(),
    };
  }

  // 1. Read existing 'finlibre_reading_progress' object from localStorage
  let currentMap: Record<string, any> = {};
  try {
    const raw = window.localStorage.getItem(STORAGE_MAP_KEY);
    if (raw) {
      currentMap = JSON.parse(raw) || {};
    }
  } catch (e) {
    console.warn('Error reading finlibre_reading_progress before update:', e);
    currentMap = {};
  }

  const existingEntry = typeof currentMap[bookId] === 'object' && currentMap[bookId] !== null
    ? currentMap[bookId]
    : {};

  const currentChapter = options?.currentChapter ?? existingEntry.currentChapter;
  const totalChapters = options?.totalChapters ?? existingEntry.totalChapters;

  // 2. Construct updated progress record
  const progressRecord: ReadingProgress = {
    ...existingEntry,
    bookId,
    percentage: boundedScroll, // Sets consumption percentage directly to scroll percentage
    scrollPercentage: boundedScroll, // Explicit scroll percentage tracking
    currentChapter,
    totalChapters,
    lastReadAt: Date.now(),
  };

  // 3. Write back to 'finlibre_reading_progress' in localStorage
  try {
    currentMap[bookId] = progressRecord;
    window.localStorage.setItem(STORAGE_MAP_KEY, JSON.stringify(currentMap));

    // Also update individual key for backwards compatibility with tests
    window.localStorage.setItem(`reading_progress_${bookId}`, JSON.stringify(progressRecord));

    // Dispatch update notification event
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { bookId, progress: progressRecord },
      })
    );
  } catch (err) {
    console.error(`Error saving scroll reading progress for ${bookId} to localStorage:`, err);
  }

  return progressRecord;
}

// Export alias for helper function
export const updateScrollProgress = updateReadingProgressScroll;

/**
 * Save reading progress for a book to localStorage and dispatch custom update event.
 */
export function saveReadingProgress(
  bookId: string,
  progress: {
    percentage: number;
    scrollPercentage?: number;
    currentChapter?: number;
    totalChapters?: number;
  }
): ReadingProgress {
  const boundedPercentage = Math.min(100, Math.max(0, Math.round(progress.percentage)));
  const boundedScroll = progress.scrollPercentage !== undefined 
    ? Math.min(100, Math.max(0, Math.round(progress.scrollPercentage)))
    : boundedPercentage;

  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      bookId,
      percentage: boundedPercentage,
      scrollPercentage: boundedScroll,
      currentChapter: progress.currentChapter,
      totalChapters: progress.totalChapters,
      lastReadAt: Date.now(),
    };
  }

  let currentMap: Record<string, any> = {};
  try {
    const existing = window.localStorage.getItem(STORAGE_MAP_KEY);
    if (existing) {
      currentMap = JSON.parse(existing) || {};
    }
  } catch (e) {
    currentMap = {};
  }

  const existingEntry = typeof currentMap[bookId] === 'object' && currentMap[bookId] !== null
    ? currentMap[bookId]
    : {};

  const progressRecord: ReadingProgress = {
    ...existingEntry,
    bookId,
    percentage: boundedPercentage,
    scrollPercentage: boundedScroll,
    currentChapter: progress.currentChapter ?? existingEntry.currentChapter,
    totalChapters: progress.totalChapters ?? existingEntry.totalChapters,
    lastReadAt: Date.now(),
  };

  try {
    currentMap[bookId] = progressRecord;
    window.localStorage.setItem(STORAGE_MAP_KEY, JSON.stringify(currentMap));
    window.localStorage.setItem(`reading_progress_${bookId}`, JSON.stringify(progressRecord));

    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { bookId, progress: progressRecord },
      })
    );
  } catch (err) {
    console.error(`Error saving reading progress for ${bookId} to localStorage:`, err);
  }

  return progressRecord;
}

export const updateReadingProgress = saveReadingProgress;

/**
 * React hook options for tracking reading scroll progress
 */
export interface UseReadingScrollProgressOptions {
  bookId: string;
  containerRef?: React.RefObject<HTMLElement | null> | null;
  currentChapter?: number;
  totalChapters?: number;
  throttleMs?: number;
  onScrollProgress?: (scrollPercentage: number) => void;
}

/**
 * React Hook that tracks scroll events in a scroll container (e.g. EbookReaderModal)
 * and automatically updates the 'finlibre_reading_progress' object in localStorage
 * with the current scroll percentage for the specific book ID.
 *
 * Supports both object options and positional arguments:
 * - useReadingScrollProgress({ bookId, containerRef, currentChapter, totalChapters })
 * - useReadingScrollProgress(bookId, containerRef, currentChapter, totalChapters)
 */
export function useReadingScrollProgress(
  bookIdOrOptions: string | UseReadingScrollProgressOptions,
  maybeContainerRef?: React.RefObject<HTMLElement | null> | null,
  currentChapter?: number,
  totalChapters?: number
) {
  const options: UseReadingScrollProgressOptions = typeof bookIdOrOptions === 'string'
    ? {
        bookId: bookIdOrOptions,
        containerRef: maybeContainerRef,
        currentChapter,
        totalChapters,
      }
    : bookIdOrOptions;

  const {
    bookId,
    containerRef,
    currentChapter: ch,
    totalChapters: totalCh,
    onScrollProgress,
  } = options;

  const [scrollPercentage, setScrollPercentage] = useState<number>(() => {
    const existing = getReadingProgress(bookId);
    return existing?.scrollPercentage ?? existing?.percentage ?? 0;
  });

  const lastSavedPctRef = useRef<number>(scrollPercentage);

  // Sync state when book ID changes
  useEffect(() => {
    const current = getReadingProgress(bookId);
    const initialPct = current?.scrollPercentage ?? current?.percentage ?? 0;
    setScrollPercentage(initialPct);
    lastSavedPctRef.current = initialPct;
  }, [bookId]);

  // Set up scroll listener on the container element
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const target = containerRef?.current;
        if (!target) return;

        const currentPct = calculateScrollPercentage(target);
        setScrollPercentage(currentPct);

        // Update localStorage when percentage changes
        if (currentPct !== lastSavedPctRef.current) {
          lastSavedPctRef.current = currentPct;
          updateReadingProgressScroll(bookId, currentPct, {
            currentChapter: ch,
            totalChapters: totalCh,
          });
          onScrollProgress?.(currentPct);
        }
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [bookId, containerRef?.current, ch, totalCh, onScrollProgress]);

  return {
    scrollPercentage,
    setScrollPercentage,
    updateScroll: (pct: number) =>
      updateReadingProgressScroll(bookId, pct, {
        currentChapter: ch,
        totalChapters: totalCh,
      }),
  };
}

// Aliases for compatibility
export const useReadingProgress = useReadingScrollProgress;
export const useScrollProgress = useReadingScrollProgress;
export const useReadingProgressTracking = useReadingScrollProgress;
