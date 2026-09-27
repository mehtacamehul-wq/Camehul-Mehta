import {
  useReadingScrollProgress,
  useReadingProgress,
  useScrollProgress,
  useReadingProgressTracking,
  updateReadingProgressScroll,
  updateScrollProgress,
  calculateScrollPercentage,
  getReadingProgress,
  saveReadingProgress,
  ReadingProgress,
  UseReadingScrollProgressOptions,
  STORAGE_MAP_KEY,
  EVENT_NAME
} from '../utils/readingProgress';

export {
  useReadingScrollProgress,
  useReadingProgress,
  useScrollProgress,
  useReadingProgressTracking,
  updateReadingProgressScroll,
  updateScrollProgress,
  calculateScrollPercentage,
  getReadingProgress,
  saveReadingProgress,
  STORAGE_MAP_KEY,
  EVENT_NAME
};

export type { ReadingProgress, UseReadingScrollProgressOptions };

export default useReadingScrollProgress;
