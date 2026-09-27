/**
 * Open Library API Integration & Multi-Endpoint Export Service
 * Connects directly to https://openlibrary.org/ REST API endpoints.
 */

export interface OpenLibraryEndpointMeta {
  id: string;
  name: string;
  category: string;
  path: string;
  sampleUrl: string;
  description: string;
  returns: string;
  status: 'active' | 'beta';
}

export const OPEN_LIBRARY_ENDPOINTS: OpenLibraryEndpointMeta[] = [
  {
    id: 'search',
    name: 'Search API',
    category: 'Discovery',
    path: '/search.json?q={query}&limit={limit}',
    sampleUrl: 'https://openlibrary.org/search.json?q=finance&limit=10',
    description: 'Searches across all catalog titles, authors, subjects, and text with faceted pagination.',
    returns: 'Array of book documents with work keys, edition counts, subjects, and authors.',
    status: 'active'
  },
  {
    id: 'subjects',
    name: 'Subjects API',
    category: 'Taxonomy',
    path: '/subjects/{subject}.json?details=true&limit={limit}',
    sampleUrl: 'https://openlibrary.org/subjects/finance.json?details=true&limit=10',
    description: 'Retrieves all works categorized under a specific subject taxonomy (e.g. finance, economics, investing).',
    returns: 'Subject metadata, work list, and related sub-topics.',
    status: 'active'
  },
  {
    id: 'works',
    name: 'Works API',
    category: 'Core Entity',
    path: '/works/{work_id}.json',
    sampleUrl: 'https://openlibrary.org/works/OL45804W.json',
    description: 'Retrieves canonical work record containing title, description, author references, and subjects.',
    returns: 'Canonical Work schema with descriptions and metadata.',
    status: 'active'
  },
  {
    id: 'editions',
    name: 'Editions API',
    category: 'Core Entity',
    path: '/works/{work_id}/editions.json?limit={limit}',
    sampleUrl: 'https://openlibrary.org/works/OL45804W/editions.json?limit=10',
    description: 'Lists all physical and digital book editions published for a work, including ISBNs and publishers.',
    returns: 'List of edition records with physical formats, publishers, and ISBN-10/13.',
    status: 'active'
  },
  {
    id: 'authors',
    name: 'Authors API',
    category: 'Creator',
    path: '/authors/{author_id}.json',
    sampleUrl: 'https://openlibrary.org/authors/OL21594A.json',
    description: 'Retrieves author biographic entity, birth/death dates, bio text, and alternate names.',
    returns: 'Author biography, Wikipedia links, and photos.',
    status: 'active'
  },
  {
    id: 'ratings',
    name: 'Ratings API',
    category: 'Community',
    path: '/works/{work_id}/ratings.json',
    sampleUrl: 'https://openlibrary.org/works/OL45804W/ratings.json',
    description: 'Community rating metrics, 1-to-5 star breakdowns, and reading score averages.',
    returns: 'Summary rating score, count, and star histogram.',
    status: 'active'
  },
  {
    id: 'recentchanges',
    name: 'Recent Changes API',
    category: 'Activity Stream',
    path: '/recentchanges.json?limit={limit}',
    sampleUrl: 'https://openlibrary.org/recentchanges.json?limit=10',
    description: 'Real-time changelog of community and automated edits across Open Library catalog.',
    returns: 'Event stream of modified works, authors, and editions.',
    status: 'active'
  },
  {
    id: 'isbn',
    name: 'Books & ISBN API',
    category: 'Identifiers',
    path: '/isbn/{isbn}.json',
    sampleUrl: 'https://openlibrary.org/isbn/9780143115762.json',
    description: 'Lookup books directly by ISBN-10, ISBN-13, LCCN, or OCLC identifier.',
    returns: 'Specific edition object matching the ISBN.',
    status: 'active'
  }
];

export interface OpenLibraryHarvestProgress {
  stage: string;
  percent: number;
  itemCount: number;
  currentEndpoint?: string;
  logs: string[];
}

/**
 * Test a specific Open Library endpoint through the FinLibre proxy
 */
export async function testOpenLibraryEndpoint(
  endpointId: string,
  params: { query?: string; id?: string; subject?: string; limit?: number } = {}
): Promise<{ status: number; durationMs: number; url: string; data: any }> {
  const queryParams = new URLSearchParams();
  queryParams.set('endpoint', endpointId);
  if (params.query) queryParams.set('q', params.query);
  if (params.id) queryParams.set('id', params.id);
  if (params.subject) queryParams.set('subject', params.subject);
  if (params.limit) queryParams.set('limit', String(params.limit));

  const startTime = performance.now();
  const res = await fetch(`/api/openlibrary/query?${queryParams.toString()}`);
  const durationMs = Math.round(performance.now() - startTime);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorBody.error || `HTTP ${res.status}: Failed to query endpoint`);
  }

  const result = await res.json();
  return {
    status: res.status,
    durationMs,
    url: result.requestedUrl || `https://openlibrary.org`,
    data: result.payload
  };
}

/**
 * Trigger download from backend Open Library multi-endpoint export
 */
export function triggerServerOpenLibraryExport(options: {
  query?: string;
  subject?: string;
  limit?: number;
  format?: 'json' | 'csv' | 'zip' | 'jsonl' | 'markdown';
  endpoints?: string[];
}) {
  const {
    query = 'finance',
    subject = 'finance',
    limit = 25,
    format = 'zip',
    endpoints = ['search', 'works', 'editions', 'authors', 'subjects', 'ratings']
  } = options;

  const params = new URLSearchParams();
  params.set('query', query);
  params.set('subject', subject);
  params.set('limit', String(limit));
  params.set('format', format);
  params.set('endpoints', endpoints.join(','));

  const url = `/api/openlibrary/export/all?${params.toString()}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = `openlibrary-${query}-${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
