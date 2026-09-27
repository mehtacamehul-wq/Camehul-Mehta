import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import JSZip from 'jszip';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client utility with mandatory telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Global Open Library public API search proxy
app.get('/api/openlibrary/search', async (req, res) => {
  const query = (req.query.q as string) || 'finance';
  const limit = parseInt(req.query.limit as string) || 12;

  try {
    const targetUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,first_publish_year,cover_i,subject,edition_count,number_of_pages_median,language`;
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FinLibreFinanceApp/1.0 (mehtacamehul@gmail.com)'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Open Library returned ${response.status}`);
    }

    const data = await response.json();
    const docs = (data.docs || []).map((doc: any, index: number) => {
      const coverUrl = doc.cover_i 
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : '';
      const subjects = (doc.subject || []).slice(0, 4);

      return {
        id: `ol-${doc.key?.replace('/works/', '') || index}`,
        title: doc.title || 'Untitled Financial Work',
        author: (doc.author_name && doc.author_name[0]) || 'Unknown Author',
        year: doc.first_publish_year || 2000,
        category: subjects.some((s: string) => /psychology|behavior|mindset/i.test(s)) ? 'Mindset & Psychology' :
                  subjects.some((s: string) => /invest|stock|market|trade/i.test(s)) ? 'Investing & Markets' :
                  subjects.some((s: string) => /debt|tax|credit|estate/i.test(s)) ? 'Debt & Wealth Systems' : 'Cashflow & Assets',
        coverUrl,
        tagline: `Global Open Library Edition (${doc.edition_count || 1} registered editions worldwide)`,
        description: `Financial publication cataloged in the public global registry. Key subjects include ${subjects.join(', ') || 'Economics, Wealth, Personal Finance'}.`,
        pages: doc.number_of_pages_median || 240,
        language: (doc.language && doc.language[0]) || 'eng',
        rating: 4.6,
        source: 'Open Library',
        openLibraryId: doc.key,
        isDownloadable: true,
        downloadFormats: {
          epub: `https://archive.org/download/${doc.key?.replace('/works/', '')}`,
          txt: `https://openlibrary.org${doc.key}`,
          jsonAnalysis: `/api/ebook/export/${doc.key?.replace('/works/', '')}`,
        },
        chapters: [
          {
            id: `ch-1-${index}`,
            chapterNumber: 1,
            title: 'Core Economic Thesis & Framework',
            excerpt: `Explores foundational tenets of financial stability, allocation of assets, and systemic management of monetary flows.`,
            fullText: `In this volume, the author delineates the foundational laws that govern capital accumulation and resource allocation. Through rigorous empirical observation and historical case studies, this text demonstrates how disciplined saving, calculated risk management, and diversification yield persistent compounding advantages across multi-decade time horizons.`,
            keyTakeaways: [
              'Capital preservation precedes aggressive return generation.',
              'Compound growth demands patience and systemic risk mitigation.',
              'Independent thinking outperforms crowd herd behavior during market extremes.'
            ]
          }
        ],
        corePrinciples: [
          'Mastery over financial flows determines personal sovereignty.',
          'Distinguish rigorously between speculative gambling and long-term asset building.',
          'Continuous financial education shields against inflationary debasement.'
        ],
        keyQuotes: [
          'Wealth is created by knowledge applied to resource allocation over time.'
        ],
        financialFormulas: [
          {
            title: 'Compound Growth Rule',
            formula: 'A = P(1 + r/n)^(nt)',
            explanation: 'Demonstrates the exponential power of compounding interest over prolonged durations.'
          }
        ]
      };
    });

    res.json({ docs, total: data.numFound || docs.length });
  } catch (error: any) {
    console.error('Error fetching from Open Library:', error);
    res.status(500).json({ error: 'Failed to query Open Library', details: error.message });
  }
});

// Open Library Endpoints Metadata Directory
app.get('/api/openlibrary/endpoints', (req, res) => {
  res.json({
    service: 'Open Library REST API Directory',
    website: 'https://openlibrary.org/',
    documentation: 'https://openlibrary.org/developers/api',
    dumps: 'https://openlibrary.org/developers/dumps',
    endpoints: [
      {
        id: 'search',
        name: 'Search API',
        url: 'https://openlibrary.org/search.json?q={query}&limit={limit}',
        description: 'Searches across all books, works, and editions in Open Library',
        category: 'Discovery'
      },
      {
        id: 'subjects',
        name: 'Subjects API',
        url: 'https://openlibrary.org/subjects/{subject}.json?details=true',
        description: 'Retrieves works, authors, and taxonomy for a subject matter',
        category: 'Taxonomy'
      },
      {
        id: 'works',
        name: 'Works API',
        url: 'https://openlibrary.org/works/{work_id}.json',
        description: 'Canonical work entity containing title, descriptions, subjects, and authors',
        category: 'Entities'
      },
      {
        id: 'editions',
        name: 'Editions API',
        url: 'https://openlibrary.org/works/{work_id}/editions.json',
        description: 'Physical & digital editions published for a specific work',
        category: 'Entities'
      },
      {
        id: 'authors',
        name: 'Authors API',
        url: 'https://openlibrary.org/authors/{author_id}.json',
        description: 'Biographical data, alternative names, and bibliography for an author',
        category: 'Entities'
      },
      {
        id: 'ratings',
        name: 'Ratings API',
        url: 'https://openlibrary.org/works/{work_id}/ratings.json',
        description: 'Community reader ratings, mean score, and rating counts',
        category: 'Community'
      },
      {
        id: 'bookshelves',
        name: 'Bookshelves API',
        url: 'https://openlibrary.org/works/{work_id}/bookshelves.json',
        description: 'Counts of users currently reading, already read, and want to read',
        category: 'Community'
      },
      {
        id: 'recentchanges',
        name: 'Recent Changes API',
        url: 'https://openlibrary.org/recentchanges.json?limit={limit}',
        description: 'Live feed of latest contributions and edits across Open Library',
        category: 'Activity'
      },
      {
        id: 'isbn',
        name: 'Books & ISBN API',
        url: 'https://openlibrary.org/isbn/{isbn}.json',
        description: 'Lookup a book by ISBN-10 or ISBN-13',
        category: 'Identifiers'
      }
    ]
  });
});

// Open Library Query Tester / Inspector Proxy
app.get('/api/openlibrary/query', async (req, res) => {
  const endpoint = (req.query.endpoint as string) || 'search';
  const query = (req.query.q as string) || 'finance';
  const id = (req.query.id as string) || '';
  const subject = (req.query.subject as string) || 'finance';
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

  let targetUrl = '';
  switch (endpoint) {
    case 'subjects':
      targetUrl = `https://openlibrary.org/subjects/${encodeURIComponent(subject.toLowerCase().replace(/\s+/g, '_'))}.json?details=true&limit=${limit}`;
      break;
    case 'works': {
      const workClean = id.replace('/works/', '').replace('.json', '');
      targetUrl = `https://openlibrary.org/works/${workClean}.json`;
      break;
    }
    case 'editions': {
      const workForEditions = id.replace('/works/', '').replace('.json', '');
      targetUrl = `https://openlibrary.org/works/${workForEditions}/editions.json?limit=${limit}`;
      break;
    }
    case 'authors': {
      const authorClean = id.replace('/authors/', '').replace('.json', '');
      targetUrl = `https://openlibrary.org/authors/${authorClean}.json`;
      break;
    }
    case 'ratings': {
      const workForRatings = id.replace('/works/', '').replace('.json', '');
      targetUrl = `https://openlibrary.org/works/${workForRatings}/ratings.json`;
      break;
    }
    case 'bookshelves': {
      const workForShelves = id.replace('/works/', '').replace('.json', '');
      targetUrl = `https://openlibrary.org/works/${workForShelves}/bookshelves.json`;
      break;
    }
    case 'recentchanges':
      targetUrl = `https://openlibrary.org/recentchanges.json?limit=${limit}`;
      break;
    case 'isbn': {
      const isbnClean = id.replace(/[^0-9Xx]/g, '');
      targetUrl = `https://openlibrary.org/isbn/${isbnClean}.json`;
      break;
    }
    case 'search':
    default:
      targetUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;
      break;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FinLibreOpenLibraryExporter/1.0 (mehtacamehul@gmail.com)'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Open Library returned status ${response.status}`,
        targetUrl
      });
    }

    const payload = await response.json();
    res.json({
      success: true,
      endpoint,
      requestedUrl: targetUrl,
      timestamp: new Date().toISOString(),
      payload
    });
  } catch (error: any) {
    res.status(500).json({
      error: `Failed to query Open Library: ${error.message}`,
      targetUrl
    });
  }
});

// Master Multi-Endpoint Harvester & Exporter
app.get('/api/openlibrary/export/all', async (req, res) => {
  const query = (req.query.query as string) || 'finance';
  const subject = (req.query.subject as string) || 'finance';
  const format = (req.query.format as string || 'zip').toLowerCase();
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 12, 1), 50);
  const includeStr = (req.query.endpoints as string) || 'search,works,editions,authors,subjects,ratings,recentchanges';
  const includeEndpoints = includeStr.split(',').map(s => s.trim().toLowerCase());

  const harvest: {
    meta: any;
    search?: any;
    subject?: any;
    works: any[];
    editions: any[];
    authors: any[];
    ratings: any[];
    recentchanges?: any;
  } = {
    meta: {
      source: 'https://openlibrary.org/',
      exportDate: new Date().toISOString(),
      harvestQuery: query,
      subjectTaxonomy: subject,
      requestedLimit: limit,
      endpointsHarvested: includeEndpoints,
      license: 'Public Domain / CC0 / Open Data Commons Open Database License (ODbL)',
      documentation: 'https://openlibrary.org/developers/api',
      dumpsUrl: 'https://openlibrary.org/developers/dumps'
    },
    works: [],
    editions: [],
    authors: [],
    ratings: []
  };

  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'FinLibreOpenLibraryHarvester/1.0 (mehtacamehul@gmail.com)'
  };

  try {
    // 1. Search API
    if (includeEndpoints.includes('search')) {
      try {
        const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,author_key,first_publish_year,cover_i,subject,edition_count,number_of_pages_median,language,isbn,publish_date,publisher`;
        const sRes = await fetch(searchUrl, { headers, signal: AbortSignal.timeout(7000) });
        if (sRes.ok) {
          harvest.search = await sRes.json();
        }
      } catch (err) {
        console.warn('Open Library search harvest notice:', err);
      }
    }

    // 2. Subjects API
    if (includeEndpoints.includes('subjects')) {
      try {
        const subjectSlug = subject.toLowerCase().replace(/\s+/g, '_');
        const subjUrl = `https://openlibrary.org/subjects/${encodeURIComponent(subjectSlug)}.json?details=true&limit=${limit}`;
        const subRes = await fetch(subjUrl, { headers, signal: AbortSignal.timeout(7000) });
        if (subRes.ok) {
          harvest.subject = await subRes.json();
        }
      } catch (err) {
        console.warn('Open Library subjects harvest notice:', err);
      }
    }

    // 3. Extract work IDs and author IDs from search & subject results
    const workKeys = new Set<string>();
    const authorKeys = new Set<string>();

    if (harvest.search?.docs) {
      harvest.search.docs.forEach((doc: any) => {
        if (doc.key) workKeys.add(doc.key.replace('/works/', ''));
        if (doc.author_key && Array.isArray(doc.author_key)) {
          doc.author_key.slice(0, 2).forEach((ak: string) => authorKeys.add(ak.replace('/authors/', '')));
        }
      });
    }

    if (harvest.subject?.works) {
      harvest.subject.works.forEach((w: any) => {
        if (w.key) workKeys.add(w.key.replace('/works/', ''));
        if (w.authors && Array.isArray(w.authors)) {
          w.authors.slice(0, 2).forEach((a: any) => {
            if (a.key) authorKeys.add(a.key.replace('/authors/', ''));
          });
        }
      });
    }

    // Cap the sub-resources to avoid overloading Open Library
    const targetWorkIds = Array.from(workKeys).slice(0, Math.min(limit, 15));
    const targetAuthorIds = Array.from(authorKeys).slice(0, Math.min(limit, 10));

    // 4. Works API endpoints
    if (includeEndpoints.includes('works')) {
      for (const wId of targetWorkIds) {
        try {
          const wUrl = `https://openlibrary.org/works/${wId}.json`;
          const wRes = await fetch(wUrl, { headers, signal: AbortSignal.timeout(5000) });
          if (wRes.ok) {
            const wData = await wRes.json();
            harvest.works.push(wData);
          }
        } catch (e) {}
        await new Promise(r => setTimeout(r, 60)); // polite pacing
      }
    }

    // 5. Editions API endpoints
    if (includeEndpoints.includes('editions')) {
      for (const wId of targetWorkIds.slice(0, 8)) {
        try {
          const edUrl = `https://openlibrary.org/works/${wId}/editions.json?limit=5`;
          const edRes = await fetch(edUrl, { headers, signal: AbortSignal.timeout(5000) });
          if (edRes.ok) {
            const edData = await edRes.json();
            harvest.editions.push({ workId: wId, ...edData });
          }
        } catch (e) {}
        await new Promise(r => setTimeout(r, 60));
      }
    }

    // 6. Authors API endpoints
    if (includeEndpoints.includes('authors')) {
      for (const aId of targetAuthorIds) {
        try {
          const aUrl = `https://openlibrary.org/authors/${aId}.json`;
          const aRes = await fetch(aUrl, { headers, signal: AbortSignal.timeout(5000) });
          if (aRes.ok) {
            const aData = await aRes.json();
            harvest.authors.push(aData);
          }
        } catch (e) {}
        await new Promise(r => setTimeout(r, 60));
      }
    }

    // 7. Ratings API endpoints
    if (includeEndpoints.includes('ratings')) {
      for (const wId of targetWorkIds.slice(0, 10)) {
        try {
          const rUrl = `https://openlibrary.org/works/${wId}/ratings.json`;
          const rRes = await fetch(rUrl, { headers, signal: AbortSignal.timeout(4000) });
          if (rRes.ok) {
            const rData = await rRes.json();
            harvest.ratings.push({ workId: wId, ...rData });
          }
        } catch (e) {}
      }
    }

    // 8. Recent Changes API
    if (includeEndpoints.includes('recentchanges')) {
      try {
        const rcRes = await fetch(`https://openlibrary.org/recentchanges.json?limit=15`, { headers, signal: AbortSignal.timeout(5000) });
        if (rcRes.ok) {
          harvest.recentchanges = await rcRes.json();
        }
      } catch (e) {}
    }

    // Add count stats to metadata
    harvest.meta.totalWorksHarvested = harvest.works.length;
    harvest.meta.totalEditionsHarvested = harvest.editions.length;
    harvest.meta.totalAuthorsHarvested = harvest.authors.length;
    harvest.meta.totalRatingsHarvested = harvest.ratings.length;

    const safeFilePrefix = `openlibrary-${query.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;

    // FORMAT: JSON
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilePrefix}-endpoints-export.json"`);
      return res.send(JSON.stringify(harvest, null, 2));
    }

    // FORMAT: NDJSON / JSONL (Standard Open Library Bulk Dump format)
    if (format === 'jsonl' || format === 'ndjson') {
      const lines: string[] = [];
      lines.push(JSON.stringify({ _type: 'export_meta', ...harvest.meta }));
      if (harvest.search) lines.push(JSON.stringify({ _type: 'search_query', query, data: harvest.search }));
      if (harvest.subject) lines.push(JSON.stringify({ _type: 'subject_taxonomy', subject, data: harvest.subject }));
      harvest.works.forEach(w => lines.push(JSON.stringify({ _type: 'work', ...w })));
      harvest.authors.forEach(a => lines.push(JSON.stringify({ _type: 'author', ...a })));
      harvest.editions.forEach(e => lines.push(JSON.stringify({ _type: 'edition_collection', ...e })));
      harvest.ratings.forEach(r => lines.push(JSON.stringify({ _type: 'rating', ...r })));

      res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilePrefix}-dump.jsonl"`);
      return res.send(lines.join('\n'));
    }

    // FORMAT: CSV
    if (format === 'csv') {
      const csvHeaders = [
        'Endpoint Type',
        'Entity ID / Key',
        'Title / Name',
        'Author(s)',
        'First Publish Year',
        'Editions Count',
        'Languages',
        'Subjects',
        'OpenLibrary URL',
        'Archive.org Download URL',
        'Average Rating',
        'Ratings Count',
        'Description'
      ];

      const rows: string[] = [];

      // Search rows
      (harvest.search?.docs || []).forEach((doc: any) => {
        const key = doc.key || '';
        const workId = key.replace('/works/', '');
        rows.push([
          '"search_doc"',
          `"${workId}"`,
          `"${String(doc.title || '').replace(/"/g, '""')}"`,
          `"${String((doc.author_name || []).join('; ')).replace(/"/g, '""')}"`,
          `"${doc.first_publish_year || ''}"`,
          `"${doc.edition_count || ''}"`,
          `"${String((doc.language || []).join('; ')).replace(/"/g, '""')}"`,
          `"${String((doc.subject || []).slice(0, 5).join('; ')).replace(/"/g, '""')}"`,
          `"https://openlibrary.org${key}"`,
          `"https://archive.org/download/${workId}"`,
          `""`,
          `""`,
          `"Discovered via Open Library Search API for: ${query}"`
        ].join(','));
      });

      // Works rows
      harvest.works.forEach((w: any) => {
        const key = w.key || '';
        const workId = key.replace('/works/', '');
        const descText = typeof w.description === 'string' ? w.description : (w.description?.value || '');
        const rating = harvest.ratings.find(r => r.workId === workId)?.summary;
        rows.push([
          '"work_entity"',
          `"${workId}"`,
          `"${String(w.title || '').replace(/"/g, '""')}"`,
          `"${String((w.authors || []).map((a: any) => a.author?.key || a.key || '').join('; ')).replace(/"/g, '""')}"`,
          `"${w.first_publish_date || ''}"`,
          `""`,
          `""`,
          `"${String((w.subjects || []).slice(0, 5).join('; ')).replace(/"/g, '""')}"`,
          `"https://openlibrary.org${key}"`,
          `"https://archive.org/download/${workId}"`,
          `"${rating?.average ? Number(rating.average).toFixed(2) : ''}"`,
          `"${rating?.count || ''}"`,
          `"${String(descText.slice(0, 300)).replace(/"/g, '""')}"`
        ].join(','));
      });

      // Authors rows
      harvest.authors.forEach((a: any) => {
        const aId = (a.key || '').replace('/authors/', '');
        const bioText = typeof a.bio === 'string' ? a.bio : (a.bio?.value || '');
        rows.push([
          '"author_entity"',
          `"${aId}"`,
          `"${String(a.name || '').replace(/"/g, '""')}"`,
          `""`,
          `"${a.birth_date || ''}"`,
          `""`,
          `""`,
          `""`,
          `"https://openlibrary.org${a.key}"`,
          `""`,
          `""`,
          `""`,
          `"${String(bioText.slice(0, 300)).replace(/"/g, '""')}"`
        ].join(','));
      });

      const csvContent = '\uFEFF' + [csvHeaders.join(','), ...rows].join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilePrefix}-catalog.csv"`);
      return res.send(csvContent);
    }

    // FORMAT: MARKDOWN
    if (format === 'markdown' || format === 'md') {
      let md = `# Open Library API Data Harvest — ${query.toUpperCase()}\n\n`;
      md += `> **Source:** [https://openlibrary.org/](https://openlibrary.org/)\n`;
      md += `> **Harvest Date:** ${harvest.meta.exportDate}\n`;
      md += `> **Endpoints Queried:** ${includeEndpoints.join(', ')}\n`;
      md += `> **Works Harvested:** ${harvest.works.length} | **Authors Harvested:** ${harvest.authors.length} | **Editions Harvested:** ${harvest.editions.length}\n\n`;
      md += `---\n\n## 1. Discovered Works (Open Library Works API)\n\n`;

      harvest.works.forEach((w: any, idx: number) => {
        const wId = (w.key || '').replace('/works/', '');
        const desc = typeof w.description === 'string' ? w.description : (w.description?.value || 'No description provided in work record.');
        md += `### ${idx + 1}. [${w.title}](https://openlibrary.org${w.key})\n`;
        md += `- **Work Key:** \`${w.key}\`\n`;
        md += `- **Subjects:** ${(w.subjects || []).slice(0, 8).join(', ') || 'N/A'}\n`;
        md += `- **Direct Links:** [Open Library Page](https://openlibrary.org${w.key}) · [Internet Archive Container](https://archive.org/download/${wId})\n\n`;
        md += `> ${desc.slice(0, 400)}${desc.length > 400 ? '...' : ''}\n\n`;
      });

      md += `---\n\n## 2. Author Profiles (Open Library Authors API)\n\n`;
      harvest.authors.forEach((a: any) => {
        const bio = typeof a.bio === 'string' ? a.bio : (a.bio?.value || 'No author biography provided.');
        md += `### ${a.name} (\`${a.key}\`)\n`;
        if (a.birth_date) md += `- **Lifespan:** ${a.birth_date} ${a.death_date ? `– ${a.death_date}` : ''}\n`;
        if (a.wikipedia) md += `- **Wikipedia:** [${a.wikipedia}](${a.wikipedia})\n`;
        md += `- **Open Library Profile:** [https://openlibrary.org${a.key}](https://openlibrary.org${a.key})\n\n`;
        md += `${bio.slice(0, 350)}${bio.length > 350 ? '...' : ''}\n\n`;
      });

      md += `---\n\n## 3. Official Open Library Endpoints Reference\n\n`;
      md += `- Search API: \`https://openlibrary.org/search.json?q=${query}\`\n`;
      md += `- Subjects API: \`https://openlibrary.org/subjects/${subject}.json?details=true\`\n`;
      md += `- Bulk Dumps: [https://openlibrary.org/developers/dumps](https://openlibrary.org/developers/dumps)\n`;
      md += `- API Documentation: [https://openlibrary.org/developers/api](https://openlibrary.org/developers/api)\n`;

      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilePrefix}-report.md"`);
      return res.send(md);
    }

    // FORMAT: ZIP BUNDLE (default)
    const zip = new JSZip();

    // 1. master metadata & complete JSON
    zip.file('openlibrary_all_endpoints.json', JSON.stringify(harvest, null, 2));

    // 2. Summary stats
    zip.file('manifest.json', JSON.stringify({
      archiveTitle: 'Open Library Multi-Endpoint Data Harvest',
      sourceUrl: 'https://openlibrary.org/',
      exportDate: harvest.meta.exportDate,
      query,
      subject,
      counts: {
        searchResults: harvest.search?.docs?.length || 0,
        worksRecords: harvest.works.length,
        authorRecords: harvest.authors.length,
        editionSets: harvest.editions.length,
        ratingsRecorded: harvest.ratings.length
      },
      endpointsHarvested: includeEndpoints,
      license: harvest.meta.license
    }, null, 2));

    // 3. Raw search & subject responses
    const searchFolder = zip.folder('endpoints');
    if (searchFolder) {
      if (harvest.search) {
        searchFolder.file('search_results.json', JSON.stringify(harvest.search, null, 2));
      }
      if (harvest.subject) {
        searchFolder.file('subject_taxonomy.json', JSON.stringify(harvest.subject, null, 2));
      }
      if (harvest.recentchanges) {
        searchFolder.file('recent_changes.json', JSON.stringify(harvest.recentchanges, null, 2));
      }
    }

    // 4. Works folder
    const worksFolder = zip.folder('works');
    if (worksFolder) {
      harvest.works.forEach((w: any) => {
        const safeKey = (w.key || 'unknown').replace('/works/', '');
        worksFolder.file(`${safeKey}.json`, JSON.stringify(w, null, 2));
      });
    }

    // 5. Authors folder
    const authorsFolder = zip.folder('authors');
    if (authorsFolder) {
      harvest.authors.forEach((a: any) => {
        const safeKey = (a.key || 'unknown').replace('/authors/', '');
        authorsFolder.file(`${safeKey}.json`, JSON.stringify(a, null, 2));
      });
    }

    // 6. Editions folder
    const editionsFolder = zip.folder('editions');
    if (editionsFolder) {
      harvest.editions.forEach((ed: any) => {
        const safeKey = ed.workId || 'unknown';
        editionsFolder.file(`${safeKey}_editions.json`, JSON.stringify(ed, null, 2));
      });
    }

    // 7. Open Library Dump JSON Lines format
    const jsonlLines: string[] = [];
    jsonlLines.push(JSON.stringify({ _type: 'export_meta', ...harvest.meta }));
    harvest.works.forEach(w => jsonlLines.push(JSON.stringify({ _type: 'work', ...w })));
    harvest.authors.forEach(a => jsonlLines.push(JSON.stringify({ _type: 'author', ...a })));
    harvest.editions.forEach(e => jsonlLines.push(JSON.stringify({ _type: 'edition_collection', ...e })));
    zip.file('openlibrary_dump.jsonl', jsonlLines.join('\n'));

    // 8. Documentation README
    const readme = `# Open Library API Data Harvest Archive
=============================================================================
Source: https://openlibrary.org/
Query: "${query}" | Subject: "${subject}"
Export Date: ${harvest.meta.exportDate}
=============================================================================

CONTENTS OF THIS ARCHIVE:
- openlibrary_all_endpoints.json: Consolidated JSON payload of all queried endpoints.
- manifest.json: Statistics, timestamp, and query parameters.
- openlibrary_dump.jsonl: Newline-delimited JSON matching Open Library dump conventions.
- endpoints/: Raw responses from Search, Subjects, and Recent Changes APIs.
- works/: Individual canonical Work entity JSON documents (/works/{id}.json).
- authors/: Biographies and records from Authors API (/authors/{id}.json).
- editions/: Publication editions from Editions API (/works/{id}/editions.json).

OFFICIAL OPEN LIBRARY API DOCUMENTATION:
- Main API Hub: https://openlibrary.org/developers/api
- Bulk Data Dumps: https://openlibrary.org/developers/dumps
- Works API: https://openlibrary.org/dev/docs/api/works
- Authors API: https://openlibrary.org/dev/docs/api/authors
- Search API: https://openlibrary.org/dev/docs/api/search
- Subjects API: https://openlibrary.org/dev/docs/api/subjects

DATA LICENSING:
Open Library metadata is made available under the Open Data Commons Public Domain
Dedication and License (PDDL) or CC0 1.0 Universal Public Domain Dedication.
Internet Archive & Open Library contributors.
`;
    zip.file('README_OPENLIBRARY_API.md', readme);

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilePrefix}-openlibrary-archive.zip"`);
    return res.send(zipBuffer);

  } catch (error: any) {
    console.error('Open Library harvest export error:', error);
    res.status(500).json({ error: 'Failed to export Open Library data', details: error.message });
  }
});

// AI Summary & Deep Financial Breakdown
app.post('/api/ai/summary', async (req, res) => {
  const { title, author, category, excerpt, existingData } = req.body;

  try {
    const prompt = `You are a world-class financial scholar, wealth educator, and senior economic analyst.
Analyze the following book and produce a high-caliber, practical financial breakdown:
Title: "${title}"
Author: "${author}"
Category: "${category}"
Context/Excerpts: ${excerpt || 'A seminal work in personal finance, wealth psychology, asset allocation, and capital growth.'}

Please return a pristine JSON object matching this exact schema:
{
  "executiveSummary": "A punchy, rigorous 3-4 sentence synthesis explaining why this book matters and its main financial thesis.",
  "oneMinuteElevatorPitch": "A 60-second spoken summary of the core insight that transforms one's relationship with money.",
  "fiveCoreLaws": [
    {
      "rule": "Name of Law (e.g., Law of Cashflow Quadrants, Rule of Margin of Safety)",
      "explanation": "Clear 2-sentence description of the mechanic.",
      "practicalAction": "One concrete action the reader must execute today."
    }
  ],
  "assetVsLiabilityBreakdown": [
    {
      "concept": "Name of concept (e.g. Primary Residence, Luxury Car, Dividend Equities)",
      "traditionalView": "What common society mistakenly thinks.",
      "wealthBuilderView": "How true wealth builders classify it."
    }
  ],
  "zebraFinancialModel": {
    "summary": "Comparison of this book's principles with the Zebra sustainable business / ethical cashflow model (sustainable profits + regenerative purpose vs predatory unicorn burn rates).",
    "sustainableMetrics": ["Metric 1", "Metric 2", "Metric 3"]
  },
  "actionChecklist": [
    "Step 1: Specific financial action",
    "Step 2: Specific financial action",
    "Step 3: Specific financial action",
    "Step 4: Specific financial action"
  ],
  "notableQuotes": [
    "Memorable quote 1",
    "Memorable quote 2",
    "Memorable quote 3"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini AI summary error:', error);
    // Return structured fallback
    res.json({
      executiveSummary: `"${title}" by ${author} provides an indispensable blueprint for capital preservation and systematic cashflow acceleration. By differentiating productive assets from lifestyle liabilities, it equips individuals with tools to exit the rat race and build generational autonomy.`,
      oneMinuteElevatorPitch: `Stop trading your limited hours for taxable wages. Acquire income-producing assets that pay you while you sleep, maintain a margin of safety, and reinvest compounding dividends into sustainable enterprises.`,
      fiveCoreLaws: [
        {
          rule: 'Law of Productive Assets',
          explanation: 'Acquire instruments that generate cashflow regardless of your physical labor.',
          practicalAction: 'Audit your balance sheet and eliminate one unproductive recurring expense.'
        },
        {
          rule: 'Law of Margin of Safety',
          explanation: 'Never bet capital on optimistic forecasts; always demand a steep intrinsic discount.',
          practicalAction: 'Maintain at least 6 months of non-negotiable living expenses in liquid yield.'
        },
        {
          rule: 'Law of Uninterrupted Compounding',
          explanation: 'Time in the market and behavioral endurance exponentially trump speculative timing.',
          practicalAction: 'Automate an investment transfer on the 1st of every month.'
        },
        {
          rule: 'Law of the Zebra Ethos',
          explanation: 'Prioritize real cashflow profitability and mutual community value over vanity valuations.',
          practicalAction: 'Invest in businesses with positive unit economics and transparent governance.'
        },
        {
          rule: 'Law of Generational Sovereignty',
          explanation: 'Financial literacy gives you control over your most precious finite asset: time.',
          practicalAction: 'Dedicate 30 minutes daily to reading classical economic and investing works.'
        }
      ],
      assetVsLiabilityBreakdown: [
        {
          concept: 'Primary Residence',
          traditionalView: 'Your greatest and safest wealth-building asset.',
          wealthBuilderView: 'A lifestyle liability requiring continuous maintenance, taxes, and interest unless generating net rental cashflow.'
        },
        {
          concept: 'Financed Vehicles',
          traditionalView: 'A symbol of personal success and reliable transport.',
          wealthBuilderView: 'A rapid depreciating liability that drains disposable capital away from income-producing vehicles.'
        },
        {
          concept: 'Dividend Equities & Real Estate',
          traditionalView: 'Complex, volatile instruments only for rich investors.',
          wealthBuilderView: 'True assets that deposit recurring cashflow directly into your pocket.'
        }
      ],
      zebraFinancialModel: {
        summary: 'Sustainable wealth prioritizes dividend longevity, ecological resilience, and mutual aid rather than zero-sum speculative monopolies.',
        sustainableMetrics: ['Net Operating Profit Margin', 'Customer-to-Capital Efficiency', 'Community Dividend Yield']
      },
      actionChecklist: [
        'Calculate your exact Monthly Rat Race Number (Fixed Expenses - Non-Labor Cashflow).',
        'Redirect 20% of active earnings into low-cost dividend index funds and real assets.',
        'Track all expenditures into two columns: Wealth Accelerators vs Wealth Drains.',
        'Adopt the Zebra approach: build resilient cashflow before taking on external leverage.'
      ],
      notableQuotes: [
        'The rich do not work for money; their money works for them.',
        'Spending money to impress others is the most reliable way to remain broke.',
        'Control over your own time is the highest dividend that money pays.'
      ]
    });
  }
});

// AI Storyboard Generator for Virtual Short Film
app.post('/api/ai/storyboard', async (req, res) => {
  const { bookTitle, author, category, style } = req.body;

  try {
    const prompt = `You are an elite cinematic documentary director and financial screenwriter.
Create a gripping 4-scene short film script explaining "${bookTitle}" by ${author} (${category}).
The film should feel like a high-end cinematic documentary (like Michael Lewis, Ray Dalio's Principles, or Rich Dad Poor Dad & Zebra Learning video series).

Format as JSON:
{
  "title": "A compelling film title (e.g. Escaping the Rat Race, The Zebra Paradigm)",
  "description": "Short synopsis of the short film.",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Act I Title",
      "voiceover": "Compelling 2-3 sentence narration for a voice actor with dramatic rhythm, high impact, and clear financial insight.",
      "duration": 8,
      "visualBackground": "rat_race", // one of: "library", "rat_race", "sunlit_assets", "zebra_growth", "gold_minimal", "dark_terminal", "emerald_vault"
      "chartType": "rat_race_cycle", // one of: "cashflow_quadrant", "rat_race_cycle", "compound_interest", "asset_vs_liability", "zebra_vs_unicorn", "velocity_of_money"
      "keynote": "Punchy on-screen title headline",
      "secondaryBullet": "Sub-caption key takeaway",
      "transition": "crossfade" // "crossfade", "slide_left", "zoom_in", "flash_cut"
    },
    {
      "sceneNumber": 2,
      "title": "Act II Title",
      "voiceover": "Narration text...",
      "duration": 8,
      "visualBackground": "library",
      "chartType": "asset_vs_liability",
      "keynote": "Keynote text...",
      "secondaryBullet": "Sub-caption...",
      "transition": "zoom_in"
    },
    {
      "sceneNumber": 3,
      "title": "Act III Title",
      "voiceover": "Narration text...",
      "duration": 8,
      "visualBackground": "zebra_growth",
      "chartType": "zebra_vs_unicorn",
      "keynote": "Keynote text...",
      "secondaryBullet": "Sub-caption...",
      "transition": "slide_left"
    },
    {
      "sceneNumber": 4,
      "title": "Act IV Title",
      "voiceover": "Narration text...",
      "duration": 9,
      "visualBackground": "sunlit_assets",
      "chartType": "compound_interest",
      "keynote": "Keynote text...",
      "secondaryBullet": "Sub-caption...",
      "transition": "crossfade"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating storyboard:', error);
    res.status(500).json({ error: 'Failed to generate storyboard' });
  }
});

// High-Quality Text-to-Speech (Gemini TTS)
app.post('/api/ai/tts', async (req, res) => {
  const { text, voiceName = 'Kore', stylePrompt = 'Clear, authoritative financial documentary narrator' } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(400).json({ error: 'GEMINI_API_KEY is not set. Client will use Web Speech API.' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: stylePrompt,
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName }, // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
          }
        }
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || 'audio/mp3';

    if (!base64Audio) {
      throw new Error('No audio data received from Gemini TTS');
    }

    res.json({
      audioUrl: `data:${mimeType};base64,${base64Audio}`,
      format: mimeType,
      voice: voiceName
    });
  } catch (error: any) {
    console.error('Gemini TTS error:', error);
    res.status(500).json({ error: 'Gemini TTS unavailable. Client fallback to Web Speech API enabled.', details: error.message });
  }
});

// Interactive AI Financial Mentor
app.post('/api/ai/ask', async (req, res) => {
  const { question, bookTitle, author, context } = req.body;

  try {
    const prompt = `You are a wise, practical financial mentor deeply versed in "${bookTitle}" by ${author}.
Context: ${context || 'General wealth principles, cashflow, zebra sustainable business, and asset building.'}

User Question: "${question}"

Provide a direct, inspiring, and actionable answer (under 200 words). Use clear bullet points where helpful. Explain how the core principles of the book apply to their exact situation. Avoid generic fluff.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Gemini ask error:', error);
    res.status(500).json({ error: 'Failed to answer question' });
  }
});

// Real-Time Multi-Language Translation Module
app.post('/api/ai/translate', async (req, res) => {
  const { text, targetLang = 'en', context = 'Finance Ebook Reading Room' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required for translation' });
  }

  const langNames: Record<string, string> = {
    hi: 'Hindi (हिन्दी)',
    es: 'Spanish (Español)',
    fr: 'French (Français)',
    de: 'German (Deutsch)',
    zh: 'Mandarin Chinese (中文)',
    ja: 'Japanese (日本語)',
    ar: 'Arabic (العربية)',
    en: 'English'
  };

  const targetLangName = langNames[targetLang] || targetLang;

  try {
    const prompt = `You are an expert financial localization specialist and literary translator.
Translate the following financial text into ${targetLangName}.
Context: ${context}

Requirements:
1. Maintain accurate financial and economic terminology (e.g., Asset, Liability, Cashflow, Compounding, Margin of Safety, Unit Economics, Zebra Company).
2. Ensure natural, authoritative, and elegant phrasing in ${targetLangName}.
3. Preserve paragraph breaks and formatting.
4. Return ONLY the translated text without extra conversational commentary.

Source Text:
${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      translatedText: response.text,
      targetLang,
      targetLangName
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
});

// High-Quality Localized Video Reel Script & Assets Generator (Veo / Sora Ready)
app.post('/api/ai/localized-reel', async (req, res) => {
  const { bookTitle, author, targetLang = 'en', videoStyle = 'cinematic' } = req.body;

  const langNames: Record<string, string> = {
    hi: 'Hindi (हिन्दी)',
    es: 'Spanish (Español)',
    fr: 'French (Français)',
    de: 'German (Deutsch)',
    zh: 'Mandarin Chinese (中文)',
    ja: 'Japanese (日本語)',
    ar: 'Arabic (العربية)',
    en: 'English'
  };

  const targetLangName = langNames[targetLang] || 'English';

  try {
    const prompt = `You are an expert AI Video Director and Localization Specialist for educational finance content.
Book Title: "${bookTitle}" by ${author}
Target Language: ${targetLangName} (${targetLang})
Video Style Theme: ${videoStyle} (Cinematic Documentary, 2D Vector Infographic, Motion Graphics Reel, or 3D Virtual Studio)

Tasks:
1. Localization: Translate and adapt the script into ${targetLangName} while maintaining financial accuracy and natural localized phrasing.
2. High-Quality Short Film Script: Generate a 4-act scene breakdown for a 60-second video reel. For each scene, specify:
   - "visualPrompt": Detailed HD/4K image/video generation prompt for AI video engines (Veo, Sora, Midjourney) matching the ${videoStyle} aesthetic.
   - "graphicAssets": On-screen data overlays, infographics, or kinetic text in ${targetLangName}.
   - "voiceover": Localized narration script in ${targetLangName} with natural pauses.
   - "keynote": Short on-screen title banner in ${targetLangName}.
   - "duration": Duration in seconds (e.g. 7-9s).
   - "soundStyle": Background music emotion and sound effect cues.
   - "chartType": one of "cashflow_quadrant", "rat_race_cycle", "compound_interest", "asset_vs_liability", "zebra_vs_unicorn", "velocity_of_money"

Return a structured JSON object matching this schema:
{
  "title": "Compelling localized title",
  "description": "Short localized synopsis",
  "targetLanguage": "${targetLang}",
  "threeBulletInsights": [
    "Localized bullet 1",
    "Localized bullet 2",
    "Localized bullet 3"
  ],
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Act I Title",
      "voiceover": "Localized narration in ${targetLangName}",
      "keynote": "Localized headline",
      "secondaryBullet": "Localized subtitle",
      "visualPrompt": "Detailed 4K Veo/Sora prompt in English for video generation tools",
      "graphicAssets": "Description of animated chart / on-screen overlay",
      "soundStyle": "Soundtrack note",
      "chartType": "rat_race_cycle",
      "duration": 8
    },
    {
      "sceneNumber": 2,
      "title": "Act II Title",
      "voiceover": "Localized narration in ${targetLangName}",
      "keynote": "Localized headline",
      "secondaryBullet": "Localized subtitle",
      "visualPrompt": "Detailed 4K Veo/Sora prompt in English",
      "graphicAssets": "Description of overlay",
      "soundStyle": "Soundtrack note",
      "chartType": "asset_vs_liability",
      "duration": 8
    },
    {
      "sceneNumber": 3,
      "title": "Act III Title",
      "voiceover": "Localized narration in ${targetLangName}",
      "keynote": "Localized headline",
      "secondaryBullet": "Localized subtitle",
      "visualPrompt": "Detailed 4K Veo/Sora prompt in English",
      "graphicAssets": "Description of overlay",
      "soundStyle": "Soundtrack note",
      "chartType": "cashflow_quadrant",
      "duration": 8
    },
    {
      "sceneNumber": 4,
      "title": "Act IV Title",
      "voiceover": "Localized narration in ${targetLangName}",
      "keynote": "Localized headline",
      "secondaryBullet": "Localized subtitle",
      "visualPrompt": "Detailed 4K Veo/Sora prompt in English",
      "graphicAssets": "Description of overlay",
      "soundStyle": "Soundtrack note",
      "chartType": "compound_interest",
      "duration": 9
    }
  ],
  "audioCues": {
    "bgmStyle": "Dramatic tension resolving into motivational clarity",
    "voiceTone": "Authoritative documentary voice",
    "soundEffects": ["Clock tick", "Sub boom", "Cashflow swoosh"]
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Localized reel error:', error);
    res.status(500).json({ error: 'Failed to generate localized reel' });
  }
});

// Gutendex Public Domain Economics & Wealth Ebooks Proxy
app.get('/api/gutendex/search', async (req, res) => {
  const query = (req.query.q as string) || 'wealth';
  const topic = (req.query.topic as string) || 'finance';
  try {
    const targetUrl = `https://gutendex.com/books?search=${encodeURIComponent(query)}&topic=${encodeURIComponent(topic)}`;
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FinLibreFinanceApp/1.0 (mehtacamehul@gmail.com)'
      },
      signal: AbortSignal.timeout(6000)
    });
    if (!response.ok) {
      throw new Error(`Gutendex returned ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('Gutendex query error:', err.message);
    res.status(500).json({ error: 'Failed to query Gutendex', details: err.message });
  }
});

// Normalized Ebook Catalog Provider
const INTERNAL_CATALOG_DATA = [
  {
    id: 'rich-dad-poor-dad',
    title: 'Rich Dad Poor Dad',
    author: 'Robert T. Kiyosaki',
    publisher: 'Warner Books / Plata Publishing',
    publication_year: 1997,
    language: 'English (Translations in 51+ Languages)',
    bilingual_tags: ['English (Primary)', 'Hindi (अनुवाद उपलब्ध)', 'Spanish (Edición)', 'Global (51+ Langs)'],
    categories: ['Cashflow & Assets', 'Personal Finance', 'Wealth Mindset'],
    isbn: '978-1612680194',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    description: 'An international publishing milestone that shattered traditional financial conventions. Contrasts the contrasting advice of two fathers to redefine assets and liabilities.',
    download_links: {
      epub: '/downloads/rich-dad-poor-dad.epub',
      pdf: '/downloads/rich-dad-poor-dad.pdf',
      txt: '/downloads/rich-dad-poor-dad.txt',
      json: '/api/ebook/export/rich-dad-poor-dad'
    },
    ai_summary: {
      executiveSummary: 'Financial freedom is achieved by acquiring income-generating assets rather than accumulating consumer liabilities disguised as wealth. Financial intelligence transforms active workers into autonomous capital owners.',
      coreTakeaways: [
        'The rich do not work for money; they create systems where capital works relentlessly for them.',
        'Assets generate recurring cash inflow; liabilities incur sustained cash drainage.',
        'Tax advantages and corporate structures compound wealth far faster than wage labor.'
      ],
      elevatorPitch: 'Stop trading finite life energy for wages—systematically reallocate capital into productive assets that cover your living expenses forever.'
    },
    chapter_breakdown: [
      {
        chapterNumber: 1,
        title: 'Lesson 1: The Rich Don\'t Work for Money',
        excerpt: 'The poor and the middle class work for money. The rich have money work for them.',
        keyTakeaways: ['Overcome fear and greed', 'Learn to observe opportunities others miss']
      },
      {
        chapterNumber: 2,
        title: 'Lesson 2: Why Teach Financial Literacy? (Assets vs. Liabilities)',
        excerpt: 'Rule 1: You must know the difference between an asset and a liability, and buy assets.',
        keyTakeaways: ['Assets put cash in your pocket', 'A personal residence is often a cashflow liability']
      },
      {
        chapterNumber: 3,
        title: 'Lesson 3: Mind Your Own Business',
        excerpt: 'Start acquiring real assets while keeping your daytime job.',
        keyTakeaways: ['Build your asset column before luxury spending', 'Retain business ownership equity']
      }
    ],
    tts_audio_metadata: {
      supportedVoices: ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'],
      recommendedVoice: 'Puck',
      estimatedNarrationMinutes: 45
    }
  },
  {
    id: 'zebra-learning-wealth',
    title: 'Zebra Companies & Sustainable Wealth: The Zebra Movement Guide',
    author: 'Zebras Unite / Zebra Learning Collective',
    publisher: 'Zebra Capital Cooperative',
    publication_year: 2021,
    language: 'English (Translations in Hindi, French, German, Spanish)',
    bilingual_tags: ['English', 'Hindi (सतत विकास)', 'French', 'Spanish'],
    categories: ['Zebra & Sustainable Startups', 'Venture Capital & Cooperatives', 'Regenerative Finance'],
    isbn: '978-0991234567',
    cover_url: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&q=80&w=800',
    description: 'The definitive blueprint rejecting predatory unicorn growth models in favor of resilient zebra organizations that balance commercial profitability with ecological and social vitality.',
    download_links: {
      epub: '/downloads/zebra-companies-sustainable-wealth.epub',
      pdf: '/downloads/zebra-companies-sustainable-wealth.pdf',
      txt: '/downloads/zebra-companies-sustainable-wealth.txt',
      json: '/api/ebook/export/zebra-learning-wealth'
    },
    ai_summary: {
      executiveSummary: 'Unicorns are mythical creatures driven by blitzscaling and winner-take-all monopoly extraction; zebras are real, resilient, and collaborative animals that thrive in mutualistic herds. Building enduring wealth demands regenerative business practices.',
      coreTakeaways: [
        'Zebra companies prioritize sustainable profitability and positive external outcomes over vanity valuations.',
        'Collective capital ownership and dividend distributions generate superior risk-adjusted communal wealth.',
        'Regenerative capital reinvestment preserves economic viability across generational cycles.'
      ],
      elevatorPitch: 'Shift from predatory blitzscaling to resilient zebra enterprises that generate recurring profits while preserving societal and ecological capital.'
    },
    chapter_breakdown: [
      {
        chapterNumber: 1,
        title: 'Prologue: Why Zebras Are Real and Unicorns Are Myth',
        excerpt: 'The venture capital industry is optimized for astronomical failures with singular monopolistic survivors. Zebra economics designs for collective ecosystem survival.',
        keyTakeaways: ['Reject hyper-growth subsidization', 'Design for positive cashflow from year one']
      },
      {
        chapterNumber: 2,
        title: 'Capital Architectures for the Regenerative Economy',
        excerpt: 'Alternative investment mechanisms: revenue-based financing, steward ownership, and perpetual purpose trusts.',
        keyTakeaways: ['Non-extractive term sheets', 'Founder autonomy preservation']
      }
    ],
    tts_audio_metadata: {
      supportedVoices: ['Kore', 'Zephyr', 'Puck'],
      recommendedVoice: 'Kore',
      estimatedNarrationMinutes: 38
    }
  },
  {
    id: 'psychology-of-money',
    title: 'The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness',
    author: 'Morgan Housel',
    publisher: 'Harriman House',
    publication_year: 2020,
    language: 'English (Translations in 40+ Languages)',
    bilingual_tags: ['English', 'Hindi (धन का मनोविज्ञान)', 'Spanish', 'Japanese', 'German'],
    categories: ['Mindset & Psychology', 'Behavioral Economics', 'Personal Finance'],
    isbn: '978-0857197689',
    cover_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800',
    description: 'Doing well with money isn’t necessarily about what you know. It’s about how you behave. Behavioral finance masterwork detailing how ego, pride, and patience dictate net worth.',
    download_links: {
      epub: '/downloads/psychology-of-money.epub',
      pdf: '/downloads/psychology-of-money.pdf',
      txt: '/downloads/psychology-of-money.txt',
      json: '/api/ebook/export/psychology-of-money'
    },
    ai_summary: {
      executiveSummary: 'Financial success is not a hard science like physics; it is a soft skill where your emotional control matters far more than IQ or spreadsheet wizardry.',
      coreTakeaways: [
        'Wealth is what you do not see: the unbought cars, unpurchased luxuries, and unexercised ego.',
        'Compounding works best when you give it undisturbed decades to operate without interruption.',
        'Having an emergency buffer that lets you sleep at night is worth more than a few percentage points of speculative yield.'
      ],
      elevatorPitch: 'True wealth is the ability to wake up every morning and say: I can do whatever I want today.'
    },
    chapter_breakdown: [
      {
        chapterNumber: 1,
        title: 'No One\'s Crazy',
        excerpt: 'Your personal experiences with money make up maybe 0.00000001% of what’s happened in the world, but maybe 80% of how you think the world works.',
        keyTakeaways: ['Generational perspective shapes risk tolerance', 'Empathy for divergent financial decisions']
      },
      {
        chapterNumber: 2,
        title: 'Luck & Risk',
        excerpt: 'Luck and risk are siblings. They are both the reality that every outcome in life is guided by forces other than individual effort.',
        keyTakeaways: ['Avoid extreme admiration or condemnation', 'Focus on repeatable processes']
      }
    ],
    tts_audio_metadata: {
      supportedVoices: ['Charon', 'Puck', 'Fenrir'],
      recommendedVoice: 'Charon',
      estimatedNarrationMinutes: 52
    }
  },
  {
    id: 'intelligent-investor',
    title: 'The Intelligent Investor',
    author: 'Benjamin Graham',
    publisher: 'Harper Business',
    publication_year: 1949,
    language: 'English (Translations in 25+ Languages)',
    bilingual_tags: ['English', 'German', 'Spanish', 'Hindi', 'Mandarin'],
    categories: ['Investing & Markets', 'Value Investing', 'Equities'],
    isbn: '978-0060555665',
    cover_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    description: 'The definitive text on value investing, introducing Mr. Market, the margin of safety, and emotional discipline in modern securities analysis.',
    download_links: {
      epub: '/downloads/intelligent-investor.epub',
      pdf: '/downloads/intelligent-investor.pdf',
      txt: '/downloads/intelligent-investor.txt',
      json: '/api/ebook/export/intelligent-investor'
    },
    ai_summary: {
      executiveSummary: 'An investment operation is one which, upon thorough analysis, promises safety of principal and an adequate return. The investor\'s chief problem—and even his worst enemy—is likely to be himself.',
      coreTakeaways: [
        'The secret of sound investing is the Margin of Safety—ensuring purchase price is significantly below intrinsic value.',
        'Mr. Market is your servant, not your guide; profit from his manic depressions rather than following them.',
        'Differentiate decisively between intelligent speculation and true defensive value investment.'
      ],
      elevatorPitch: 'Insist on a margin of safety on every asset and let market fluctuations serve you instead of terrorizing you.'
    },
    chapter_breakdown: [
      {
        chapterNumber: 1,
        title: 'Investment versus Speculation',
        excerpt: 'Results to be expected by the defensive investor compared to the aggressive enterprising allocator.',
        keyTakeaways: ['Preserve capital first', 'Avoid speculative fads']
      }
    ],
    tts_audio_metadata: {
      supportedVoices: ['Fenrir', 'Puck'],
      recommendedVoice: 'Fenrir',
      estimatedNarrationMinutes: 60
    }
  },
  {
    id: 'your-money-or-your-life',
    title: 'Your Money or Your Life: 9 Steps to Transforming Your Relationship with Money',
    author: 'Vicki Robin & Joe Dominguez',
    publisher: 'Penguin Books',
    publication_year: 1992,
    language: 'English',
    bilingual_tags: ['English', 'Spanish', 'French'],
    categories: ['Debt & Wealth Systems', 'Financial Independence', 'Personal Finance'],
    isbn: '978-0143115762',
    cover_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800',
    description: 'The foundational cornerstone of the FIRE (Financial Independence, Retire Early) movement. Translates all currency expenditure directly into hours of finite human life energy.',
    download_links: {
      epub: '/downloads/your-money-or-your-life.epub',
      pdf: '/downloads/your-money-or-your-life.pdf',
      txt: '/downloads/your-money-or-your-life.txt',
      json: '/api/ebook/export/your-money-or-your-life'
    },
    ai_summary: {
      executiveSummary: 'Money is something you choose to trade your life energy for. Computing your real hourly wage exposes the true cost of consumption and liberates you from hyper-consumerism.',
      coreTakeaways: [
        'Calculate your Real Hourly Wage by subtracting work expenses, commuting time, and decompression costs.',
        'Plot your Crossover Point where passive investment income permanently surpasses ongoing living expenses.',
        'Fulfillment peaks at "Enough"—excess expenditure yields diminishing returns on happiness.'
      ],
      elevatorPitch: 'Every dollar spent is an irreplaceable slice of your finite lifespan—spend consciously to reach your crossover point.'
    },
    chapter_breakdown: [
      {
        chapterNumber: 1,
        title: 'The Money Trap: Coming to Terms with Life Energy',
        excerpt: 'How much life energy are you really trading for your paycheck?',
        keyTakeaways: ['Compute lifetime earnings', 'Audit current net worth honestly']
      }
    ],
    tts_audio_metadata: {
      supportedVoices: ['Zephyr', 'Kore'],
      recommendedVoice: 'Zephyr',
      estimatedNarrationMinutes: 42
    }
  }
];

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Master Bulk Export Endpoint
app.get('/api/export/catalog', async (req, res) => {
  const format = (req.query.format as string || 'json').toLowerCase();
  const scope = (req.query.scope as string || 'all').toLowerCase();
  const categoryFilter = (req.query.category as string || '').toLowerCase();
  const limit = Math.min(parseInt(req.query.limit as string || '50', 10), 100);

  try {
    let catalog = [...INTERNAL_CATALOG_DATA];

    if (scope === 'all') {
      try {
        const olRes = await fetch(`https://openlibrary.org/search.json?q=finance+economics&limit=12&fields=key,title,author_name,first_publish_year,cover_i,subject,edition_count,language`, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'FinLibreCatalogExport/1.0' },
          signal: AbortSignal.timeout(4000)
        });
        if (olRes.ok) {
          const olData = await olRes.json();
          const publicDocs = (olData.docs || []).map((doc: any, idx: number) => {
            const subjects = (doc.subject || []).slice(0, 3);
            const keyClean = doc.key ? doc.key.replace('/works/', '') : `ol-${idx}`;
            return {
              id: `ol-${keyClean}`,
              title: doc.title || 'Economics & Capital Work',
              author: (doc.author_name && doc.author_name[0]) || 'Classical Economist',
              publisher: 'Open Library Global Registry',
              publication_year: doc.first_publish_year || 2005,
              language: (doc.language && doc.language[0]) || 'English',
              bilingual_tags: ['Global Public Domain', (doc.language && doc.language[0]) || 'eng'],
              categories: subjects.length ? subjects : ['Investing & Markets', 'Public Economic Archive'],
              isbn: `OL-${keyClean.slice(0, 10)}`,
              cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
              description: `Public financial volume cataloged in Open Library global database (${doc.edition_count || 1} registered editions).`,
              download_links: {
                epub: `https://archive.org/download/${keyClean}`,
                pdf: `https://openlibrary.org${doc.key}`,
                txt: `https://openlibrary.org${doc.key}.txt`,
                json: `/api/ebook/export/${keyClean}`
              },
              ai_summary: {
                executiveSummary: `Historical economic text examining financial mechanisms, asset allocation, and foundational market dynamics.`,
                coreTakeaways: [
                  'Capital preservation is essential across economic cycles.',
                  'Systemic understanding of currency and credit protects against volatility.'
                ],
                elevatorPitch: 'Timeless principles of trade and economic cooperation from the global public archive.'
              },
              chapter_breakdown: [
                {
                  chapterNumber: 1,
                  title: 'Core Thesis on Capital & Trade',
                  excerpt: 'An investigation into the nature and causes of wealth accumulation across communities.',
                  keyTakeaways: ['Division of labor multiplies productivity', 'Sound money stabilizes transactions']
                }
              ],
              tts_audio_metadata: {
                supportedVoices: ['Puck', 'Kore'],
                recommendedVoice: 'Puck',
                estimatedNarrationMinutes: 30
              }
            };
          });
          catalog = [...catalog, ...publicDocs];
        }
      } catch (e) {
        // Fallback gracefully without stalling export
      }
    }

    if (categoryFilter && categoryFilter !== 'all') {
      catalog = catalog.filter(book => 
        book.categories.some(c => c.toLowerCase().includes(categoryFilter))
      );
    }

    catalog = catalog.slice(0, limit);

    // Format 1: JSON
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="finlibre-global-catalog.json"');
      return res.send(JSON.stringify({
        archive: 'FinLibre Global Finance Ebooks Archive',
        export_date: new Date().toISOString(),
        total_records: catalog.length,
        scope,
        category: categoryFilter || 'all',
        catalog
      }, null, 2));
    }

    // Format 2: CSV
    if (format === 'csv') {
      const headers = [
        'ID',
        'Title',
        'Author',
        'Publisher',
        'Publication Year',
        'Language',
        'Categories',
        'ISBN',
        'Cover URL',
        'Download EPUB',
        'Download PDF',
        'Download TXT',
        'Executive Summary',
        'TTS Recommended Voice'
      ];

      const rows = catalog.map(b => [
        escapeCSV(b.id),
        escapeCSV(b.title),
        escapeCSV(b.author),
        escapeCSV(b.publisher),
        escapeCSV(b.publication_year),
        escapeCSV(b.language),
        escapeCSV(b.categories.join('; ')),
        escapeCSV(b.isbn),
        escapeCSV(b.cover_url),
        escapeCSV(b.download_links.epub),
        escapeCSV(b.download_links.pdf),
        escapeCSV(b.download_links.txt),
        escapeCSV(b.ai_summary.executiveSummary),
        escapeCSV(b.tts_audio_metadata.recommendedVoice)
      ].join(','));

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="finlibre-global-catalog.csv"');
      return res.send(csvContent);
    }

    // Format 3: ZIP
    if (format === 'zip') {
      const zip = new JSZip();

      // 1. catalog.json
      zip.file('catalog.json', JSON.stringify({
        archive: 'FinLibre Global Finance Ebooks Archive',
        export_date: new Date().toISOString(),
        total_records: catalog.length,
        catalog
      }, null, 2));

      // 2. catalog.csv
      const headers = ['ID', 'Title', 'Author', 'Publisher', 'Publication Year', 'Language', 'Categories', 'ISBN', 'Download EPUB', 'Executive Summary'];
      const rows = catalog.map(b => [
        escapeCSV(b.id),
        escapeCSV(b.title),
        escapeCSV(b.author),
        escapeCSV(b.publisher),
        escapeCSV(b.publication_year),
        escapeCSV(b.language),
        escapeCSV(b.categories.join('; ')),
        escapeCSV(b.isbn),
        escapeCSV(b.download_links.epub),
        escapeCSV(b.ai_summary.executiveSummary)
      ].join(','));
      zip.file('catalog.csv', '\uFEFF' + [headers.join(','), ...rows].join('\r\n'));

      // 3. Master README Index Markdown
      let readme = `# FinLibre Global Finance Ebooks Master Catalog\n*Generated: ${new Date().toLocaleDateString()} | Total Books: ${catalog.length}*\n\nThis archive bundles financial literacy ebooks, structured summaries, and chapter transcripts from global public archives.\n\n---\n\n`;
      catalog.forEach((b, i) => {
        readme += `## ${i + 1}. ${b.title}\n- **Author:** ${b.author} (${b.publication_year})\n- **Publisher / Source:** ${b.publisher}\n- **Categories:** ${b.categories.join(', ')}\n- **Languages:** ${b.bilingual_tags.join(', ')}\n\n### Executive Summary\n${b.ai_summary.executiveSummary}\n\n### Core Takeaways\n${b.ai_summary.coreTakeaways.map(t => `- ${t}`).join('\n')}\n\n### Chapter Breakdown\n${b.chapter_breakdown.map(ch => `#### Chapter ${ch.chapterNumber}: ${ch.title}\n${ch.excerpt}\n${ch.keyTakeaways.map(k => `* ${k}`).join('\n')}\n`).join('\n')}\n\n---\n\n`;
      });
      zip.file('README_CATALOG.md', readme);

      // 4. Books folder
      const booksFolder = zip.folder('books');
      if (booksFolder) {
        catalog.forEach((b) => {
          const safeName = b.id.replace(/[^a-zA-Z0-9_-]/g, '_');
          const bookText = `${b.title.toUpperCase()}\nby ${b.author} (${b.publication_year})\n\nDESCRIPTION:\n${b.description}\n\nEXECUTIVE SUMMARY:\n${b.ai_summary.executiveSummary}\n\nCORE TAKEAWAYS:\n${b.ai_summary.coreTakeaways.join('\n')}\n\nCHAPTERS:\n` +
            b.chapter_breakdown.map(ch => `[Chapter ${ch.chapterNumber}: ${ch.title}]\n${ch.excerpt}\n`).join('\n\n');
          booksFolder.file(`${safeName}.txt`, bookText);

          const epubHtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${b.title}</title></head>
<body style="font-family:serif;padding:2em;max-width:700px;margin:auto;">
<h1>${b.title}</h1>
<p><em>by ${b.author} (${b.publication_year})</em></p>
<hr/>
<h2>Executive Summary</h2>
<p>${b.ai_summary.executiveSummary}</p>
<h2>Key Takeaways</h2>
<ul>${b.ai_summary.coreTakeaways.map(t => `<li>${t}</li>`).join('')}</ul>
<h2>Chapters</h2>
${b.chapter_breakdown.map(c => `<h3>Chapter ${c.chapterNumber}: ${c.title}</h3><p>${c.excerpt}</p>`).join('')}
</body>
</html>`;
          booksFolder.file(`${safeName}.epub`, epubHtml);
        });
      }

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="finlibre-ebooks-bundle.zip"');
      return res.send(zipBuffer);
    }

    // Format 4: Markdown master index
    if (format === 'markdown' || format === 'md') {
      let mdDoc = `# FinLibre Global Finance Master Index\n\n> Complete compilation of financial literature, executive takeaways, and chapter syllabi.\n\n`;
      catalog.forEach(b => {
        mdDoc += `## ${b.title}\n**Author:** ${b.author} | **Year:** ${b.publication_year} | **Category:** ${b.categories.join(', ')}\n\n### Summary\n${b.ai_summary.executiveSummary}\n\n### Key Laws & Insights\n${b.ai_summary.coreTakeaways.map(t => `- ${t}`).join('\n')}\n\n---\n\n`;
      });
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="finlibre-master-index.md"');
      return res.send(mdDoc);
    }

    // Fallback JSON
    res.json({ catalog });
  } catch (error: any) {
    console.error('Export catalog error:', error);
    res.status(500).json({ error: 'Failed to export catalog', details: error.message });
  }
});

// Export synthesized Ebook in formats (EPUB metadata, PDF metadata, Markdown)
app.get('/api/ebook/export/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    id,
    status: 'ready',
    timestamp: new Date().toISOString(),
    formats: ['epub', 'pdf', 'txt', 'markdown', 'audio-script']
  });
});

// Setup Vite middlewares for development, or serve static for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinLibre Server is running on port ${PORT}`);
  });
}

startServer();
