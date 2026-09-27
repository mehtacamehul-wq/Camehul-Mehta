import { EBook } from '../types/ebook';
import { FEATURED_EBOOKS } from '../data/ebooksData';

/**
 * Service to search and fetch finance ebooks across global public APIs:
 * - Open Library API (public domain & global editions)
 * - Project Gutenberg / Gutendex
 * - Curated Classics (Rich Dad Poor Dad, ZebraLearn, Psychology of Money, etc.)
 */

export interface SearchEbookParams {
  query?: string;
  category?: string;
  language?: string; // 'all' | 'en' | 'hi' | 'es' | 'fr' | 'de'
  limit?: number;
}

export async function searchGlobalFinanceEbooks(params: SearchEbookParams): Promise<EBook[]> {
  const { query = '', category = 'All', language = 'all', limit = 16 } = params;

  // Filter curated dataset first
  let filteredCurated = FEATURED_EBOOKS.filter(book => {
    const matchQuery = !query || 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()) ||
      book.description.toLowerCase().includes(query.toLowerCase()) ||
      book.tagline.toLowerCase().includes(query.toLowerCase());

    const matchCategory = category === 'All' || book.category === category;
    
    const matchLang = language === 'all' || 
      (language === 'en' && book.language.toLowerCase().includes('en')) ||
      (language === 'hi' && (book.language.toLowerCase().includes('hi') || book.description.toLowerCase().includes('india') || book.tagline.toLowerCase().includes('global'))) ||
      (language === 'es' && book.language.toLowerCase().includes('es')) ||
      (language === 'fr' && book.language.toLowerCase().includes('fr'));

    return matchQuery && matchCategory && matchLang;
  });

  // Query server proxy for Open Library & Public Books
  try {
    const apiQuery = query || (category !== 'All' ? `${category} finance` : 'finance money investing');
    const res = await fetch(`/api/openlibrary/search?q=${encodeURIComponent(apiQuery)}&limit=${limit}`);
    
    if (res.ok) {
      const data = await res.json();
      const openLibBooks: EBook[] = data.docs || [];

      // Combine curated classics at the top, then Open Library results
      const combined = [...filteredCurated];
      openLibBooks.forEach(olBook => {
        if (!combined.some(c => c.title.toLowerCase() === olBook.title.toLowerCase())) {
          combined.push(olBook);
        }
      });

      return combined;
    }
  } catch (error) {
    console.warn('Network query failed, returning curated archive:', error);
  }

  return filteredCurated;
}

/**
 * Paginated bulk data fetcher that retrieves data in controlled chunks
 * from public APIs (Open Library & Gutendex) without crashing browser memory.
 */
export async function fetchCompleteCatalogPaginated(
  options: {
    category?: string;
    maxPages?: number;
    pageSize?: number;
    onProgress?: (progressPercent: number, status: string, count: number) => void;
  } = {}
): Promise<EBook[]> {
  const { category = 'All', maxPages = 3, pageSize = 15, onProgress } = options;

  onProgress?.(10, 'Loading curated core volumes...', FEATURED_EBOOKS.length);

  let accumulated: EBook[] = [...FEATURED_EBOOKS];
  if (category !== 'All') {
    accumulated = accumulated.filter(b => b.category === category);
  }

  const queries = category !== 'All' 
    ? [category, `${category} economics`]
    : ['finance', 'wealth economics', 'investing money'];

  let currentPage = 1;
  for (const q of queries) {
    if (currentPage > maxPages) break;

    onProgress?.(
      Math.min(85, 20 + (currentPage / maxPages) * 60),
      `Fetching archive batch for "${q}"...`,
      accumulated.length
    );

    try {
      // 1. Open Library query
      const olRes = await fetch(`/api/openlibrary/search?q=${encodeURIComponent(q)}&limit=${pageSize}`);
      if (olRes.ok) {
        const data = await olRes.json();
        const docs: EBook[] = data.docs || [];
        docs.forEach(d => {
          if (!accumulated.some(existing => existing.id === d.id || existing.title.toLowerCase() === d.title.toLowerCase())) {
            accumulated.push(d);
          }
        });
      }
    } catch (e) {
      console.warn(`Batch query for ${q} skipped:`, e);
    }

    // Small yield to keep UI thread responsive
    await new Promise(resolve => setTimeout(resolve, 80));
    currentPage++;
  }

  onProgress?.(100, `Completed: ${accumulated.length} books compiled`, accumulated.length);
  return accumulated;
}
