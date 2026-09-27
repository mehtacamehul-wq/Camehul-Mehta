import { EBook, ShortFilmProject, AISummaryResult } from '../types/ebook';
import JSZip from 'jszip';

/**
 * Client-Side Ebook and Media Downloader Engine
 */

export function downloadEbookAsText(book: EBook) {
  const content = `=======================================================
${book.title.toUpperCase()}
by ${book.author} (${book.year})
Category: ${book.category} | Rating: ${book.rating}/5.0
Archived via FinLibre Global Finance Library
=======================================================

${book.tagline}

DESCRIPTION:
${book.description}

CORE PRINCIPLES:
${book.corePrinciples.map((p, i) => `${i + 1}. ${p}`).join('\n')}

KEY QUOTES:
${book.keyQuotes.map(q => `"${q}"`).join('\n\n')}

FINANCIAL FORMULAS:
${book.financialFormulas.map(f => `${f.title}\nFormula: ${f.formula}\nExplanation: ${f.explanation}\n`).join('\n')}

-------------------------------------------------------
TABLE OF CONTENTS & CHAPTER TRANSCRIPTS
-------------------------------------------------------

${book.chapters.map(ch => `
CHAPTER ${ch.chapterNumber}: ${ch.title}
Key Takeaways:
${ch.keyTakeaways.map(t => `- ${t}`).join('\n')}

${ch.fullText}
`).join('\n=======================================================\n')}
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  triggerBrowserDownload(blob, `${slugify(book.title)}-finlibre-edition.txt`);
}

export function downloadEbookAsMarkdown(book: EBook) {
  const content = `# ${book.title}
> *${book.tagline}*
>
> **Author:** ${book.author} | **Year:** ${book.year} | **Category:** ${book.category}

---

## Overview
${book.description}

## Core Financial Laws
${book.corePrinciples.map(p => `- **${p}**`).join('\n')}

## Classical Formulas
${book.financialFormulas.map(f => `### ${f.title}
\`\`\`
${f.formula}
\`\`\`
*${f.explanation}*
`).join('\n')}

---

## Chapters
${book.chapters.map(ch => `### Chapter ${ch.chapterNumber}: ${ch.title}

> **Takeaways:**
${ch.keyTakeaways.map(t => `> - ${t}`).join('\n')}

${ch.fullText}
`).join('\n\n---\n\n')}
`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  triggerBrowserDownload(blob, `${slugify(book.title)}.md`);
}

export function downloadEbookAsEPUB(book: EBook) {
  // Generates clean HTML container that can be opened in Calibre, Apple Books, Kindle, etc.
  const htmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <title>${escapeXml(book.title)}</title>
  <style>
    body { font-family: Georgia, serif; line-height: 1.7; padding: 2em; max-width: 720px; margin: 0 auto; color: #1c1917; }
    h1 { font-size: 2.2em; border-bottom: 2px solid #78350f; padding-bottom: 0.3em; margin-bottom: 0.2em; }
    h2 { font-size: 1.5em; color: #78350f; margin-top: 1.8em; }
    .meta { font-family: sans-serif; font-size: 0.85em; color: #78716c; margin-bottom: 2em; }
    .quote { font-style: italic; border-left: 3px solid #b45309; padding-left: 1em; margin: 1.5em 0; color: #44403c; }
    .takeaway { background: #fafaf9; border: 1px solid #e7e5e4; padding: 1em; border-radius: 6px; margin: 1em 0; }
  </style>
</head>
<body>
  <h1>${escapeXml(book.title)}</h1>
  <div class="meta">
    Author: ${escapeXml(book.author)} · Year: ${book.year} · Category: ${escapeXml(book.category)} · FinLibre Public Edition
  </div>
  <p class="quote">"${escapeXml(book.tagline)}"</p>
  <p>${escapeXml(book.description)}</p>

  <h2>Foundational Principles</h2>
  <ul>
    ${book.corePrinciples.map(p => `<li>${escapeXml(p)}</li>`).join('')}
  </ul>

  ${book.chapters.map(ch => `
    <h2>Chapter ${ch.chapterNumber}: ${escapeXml(ch.title)}</h2>
    <div class="takeaway">
      <strong>Core Takeaways:</strong>
      <ul>
        ${ch.keyTakeaways.map(t => `<li>${escapeXml(t)}</li>`).join('')}
      </ul>
    </div>
    <div>
      ${ch.fullText.split('\n\n').map(para => `<p>${escapeXml(para)}</p>`).join('')}
    </div>
  `).join('')}
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'application/epub+zip' });
  triggerBrowserDownload(blob, `${slugify(book.title)}-complete.epub`);
}

export function downloadEbookAsPDF(book: EBook) {
  // Creates an elegant printable document window for instant PDF save via browser print
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    downloadEbookAsText(book);
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${escapeXml(book.title)} - FinLibre Edition</title>
  <style>
    @media print {
      @page { margin: 20mm; }
      body { font-size: 11pt; }
      .page-break { page-break-after: always; }
    }
    body { font-family: 'Cormorant Garamond', Georgia, serif; line-height: 1.6; color: #18181b; padding: 40px; max-width: 800px; margin: 0 auto; background: #fff; }
    h1 { font-size: 32pt; margin-bottom: 4px; font-weight: 600; color: #1c1917; }
    .subtitle { font-size: 14pt; color: #78350f; margin-bottom: 24px; font-style: italic; }
    .metadata { font-family: system-ui, sans-serif; font-size: 9pt; color: #71717a; border-bottom: 1px solid #e4e4e7; padding-bottom: 12px; margin-bottom: 24px; }
    h2 { font-size: 18pt; margin-top: 32px; border-bottom: 1px solid #d4d4d8; padding-bottom: 6px; }
    .takeaways { background: #f4f4f5; padding: 16px; border-radius: 4px; font-family: system-ui, sans-serif; font-size: 10pt; margin: 16px 0; }
    p { margin-bottom: 16px; text-align: justify; text-justify: inter-word; }
  </style>
</head>
<body>
  <h1>${escapeXml(book.title)}</h1>
  <div class="subtitle">${escapeXml(book.tagline)}</div>
  <div class="metadata">Author: ${escapeXml(book.author)} | Year: ${book.year} | Category: ${escapeXml(book.category)} | Published by FinLibre Global</div>
  
  <p>${escapeXml(book.description)}</p>

  <h2>Core Tenets</h2>
  <ul>
    ${book.corePrinciples.map(p => `<li>${escapeXml(p)}</li>`).join('')}
  </ul>

  <div class="page-break"></div>

  ${book.chapters.map(ch => `
    <h2>Chapter ${ch.chapterNumber}: ${escapeXml(ch.title)}</h2>
    <div class="takeaways">
      <strong>Key Insights:</strong>
      <ul>
        ${ch.keyTakeaways.map(t => `<li>${escapeXml(t)}</li>`).join('')}
      </ul>
    </div>
    ${ch.fullText.split('\n\n').map(p => `<p>${escapeXml(p)}</p>`).join('')}
    <div class="page-break"></div>
  `).join('')}

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`);
  printWindow.document.close();
}

export function downloadAISummaryJSON(book: EBook, summary: AISummaryResult) {
  const payload = {
    bookId: book.id,
    bookTitle: book.title,
    author: book.author,
    generatedAt: new Date().toISOString(),
    aiEngine: 'Gemini 3.8 Flash Finance Specialization',
    summary
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  triggerBrowserDownload(blob, `${slugify(book.title)}-ai-summary.json`);
}

export function downloadScreenplayScript(film: ShortFilmProject) {
  let content = `====================================================================
SHORT FILM SCREENPLAY: ${film.title.toUpperCase()}
Source Material: "${film.bookTitle}" by ${film.author}
Audio Voice: ${film.audioVoice} | Soundtrack: ${film.bgMusic}
Generated via FinLibre Virtual Video Cinema Studio
====================================================================

SYNOPSIS:
${film.description}

TOTAL SCENES: ${film.scenes.length}
ESTIMATED RUNTIME: ${film.scenes.reduce((acc, s) => acc + s.duration, 0)} seconds

--------------------------------------------------------------------
SCENE-BY-SCENE PRODUCTION SCRIPT
--------------------------------------------------------------------
`;

  film.scenes.forEach((scene) => {
    content += `
SCENE ${scene.sceneNumber}: [${scene.title.toUpperCase()}]
Duration: ${scene.duration} seconds | Transition: ${scene.transition}
Visual Atmosphere: ${scene.visualBackground} | Motion Chart: ${scene.chartType}
Keynote Overlay: "${scene.keynote}"
${scene.secondaryBullet ? `Subtitle Subtext: "${scene.secondaryBullet}"\n` : ''}
[VOICEOVER NARRATION]
"${scene.voiceover}"

--------------------------------------------------------------------`;
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  triggerBrowserDownload(blob, `${slugify(film.title)}-screenplay.txt`);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Bulk Data Export Engine
 */

export function downloadBulkCatalogJSON(books: EBook[], scopeName: string = 'catalog') {
  const payload = {
    archive: 'FinLibre Global Finance Ebooks Archive',
    exportDate: new Date().toISOString(),
    scope: scopeName,
    totalBooks: books.length,
    books: books.map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      publisher: b.source || 'FinLibre Global Archive',
      publication_year: b.year,
      language: b.language,
      categories: [b.category],
      isbn: b.openLibraryId ? `OL-${b.openLibraryId.replace('/works/', '')}` : `FL-${b.id}`,
      cover_url: b.coverUrl,
      description: b.description,
      download_links: b.downloadFormats,
      ai_summary: {
        executiveSummary: b.description,
        coreTakeaways: b.corePrinciples || [],
        tagline: b.tagline
      },
      chapter_breakdown: b.chapters.map(ch => ({
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        excerpt: ch.excerpt,
        keyTakeaways: ch.keyTakeaways
      })),
      tts_audio_metadata: {
        supportedVoices: ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'],
        recommendedVoice: 'Puck',
        estimatedNarrationMinutes: Math.round((b.pages || 250) * 0.2)
      }
    }))
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  triggerBrowserDownload(blob, `finlibre-${slugify(scopeName)}-catalog.json`);
}

export function downloadBulkCatalogCSV(books: EBook[], scopeName: string = 'catalog') {
  const headers = [
    'ID',
    'Title',
    'Author',
    'Category',
    'Publication Year',
    'Pages',
    'Language',
    'Rating',
    'Source',
    'EPUB Download URL',
    'PDF Download URL',
    'Text Download URL',
    'Tagline',
    'Core Principles'
  ];

  const escapeCSVVal = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = books.map(b => [
    escapeCSVVal(b.id),
    escapeCSVVal(b.title),
    escapeCSVVal(b.author),
    escapeCSVVal(b.category),
    escapeCSVVal(b.year),
    escapeCSVVal(b.pages),
    escapeCSVVal(b.language),
    escapeCSVVal(b.rating),
    escapeCSVVal(b.source),
    escapeCSVVal(b.downloadFormats?.epub || ''),
    escapeCSVVal(b.downloadFormats?.pdf || ''),
    escapeCSVVal(b.downloadFormats?.txt || ''),
    escapeCSVVal(b.tagline),
    escapeCSVVal((b.corePrinciples || []).join('; '))
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  triggerBrowserDownload(blob, `finlibre-${slugify(scopeName)}-catalog.csv`);
}

export function downloadBulkCatalogMarkdown(books: EBook[], scopeName: string = 'catalog') {
  let content = `# FinLibre Global Financial Library — ${scopeName.toUpperCase()}
> Master Ebook Index, Key Financial Tenets, and Chapter Notes
> Exported on ${new Date().toLocaleDateString()} · Total Volumes: ${books.length}

---

`;

  books.forEach((b, idx) => {
    content += `## ${idx + 1}. ${b.title}
*by **${b.author}** (${b.year})*

- **Category:** ${b.category}
- **Pages:** ${b.pages} | **Rating:** ${b.rating}/5.0 | **Source:** ${b.source}
- **Tagline:** _"${b.tagline}"_

### Overview
${b.description}

### Core Wealth Principles
${(b.corePrinciples || []).map(p => `- **${p}**`).join('\n')}

### Chapter Breakdown
${b.chapters.map(ch => `#### Chapter ${ch.chapterNumber}: ${ch.title}
*${ch.excerpt}*
${ch.keyTakeaways.map(t => `- ${t}`).join('\n')}
`).join('\n')}

---

`;
  });

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  triggerBrowserDownload(blob, `finlibre-${slugify(scopeName)}-master-index.md`);
}

export async function downloadBulkZipArchive(
  books: EBook[],
  scopeName: string = 'catalog',
  onProgress?: (percent: number, status: string) => void
) {
  const zip = new JSZip();

  onProgress?.(10, 'Compiling catalog metadata...');

  // 1. catalog.json
  const catalogPayload = {
    archive: 'FinLibre Global Finance Ebooks Archive',
    exportDate: new Date().toISOString(),
    scope: scopeName,
    totalBooks: books.length,
    books
  };
  zip.file('catalog.json', JSON.stringify(catalogPayload, null, 2));

  // 2. catalog.csv
  const headers = ['ID', 'Title', 'Author', 'Category', 'Year', 'Pages', 'Rating', 'Tagline'];
  const escapeCSVVal = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;
  const rows = books.map(b => [
    escapeCSVVal(b.id),
    escapeCSVVal(b.title),
    escapeCSVVal(b.author),
    escapeCSVVal(b.category),
    escapeCSVVal(b.year),
    escapeCSVVal(b.pages),
    escapeCSVVal(b.rating),
    escapeCSVVal(b.tagline)
  ].join(','));
  zip.file('catalog.csv', '\uFEFF' + [headers.join(','), ...rows].join('\r\n'));

  onProgress?.(30, 'Generating master index markdown...');

  // 3. README_CATALOG.md
  let readme = `# FinLibre Master Ebook Archive (${scopeName})\n\n`;
  readme += `Generated on ${new Date().toLocaleDateString()} for offline reading.\n\n`;
  books.forEach((b, idx) => {
    readme += `### ${idx + 1}. ${b.title} by ${b.author} (${b.year})\n`;
    readme += `${b.tagline}\n\n`;
    readme += `**Core Insights:**\n${(b.corePrinciples || []).map(p => `* ${p}`).join('\n')}\n\n---\n\n`;
  });
  zip.file('README_CATALOG.md', readme);

  // 4. Books folder with individual EPUBs & TXT
  const booksFolder = zip.folder('books');
  if (booksFolder) {
    books.forEach((b, index) => {
      const stepPct = 30 + Math.round(((index + 1) / books.length) * 40);
      onProgress?.(stepPct, `Packaging "${b.title}"...`);

      const safeId = slugify(b.id || b.title);
      
      // Text file
      const txtContent = `${b.title.toUpperCase()}\nby ${b.author} (${b.year})\n\n${b.description}\n\nCORE TENETS:\n${(b.corePrinciples || []).join('\n')}\n\n` +
        b.chapters.map(ch => `[Chapter ${ch.chapterNumber}: ${ch.title}]\n${ch.excerpt}\n\n${ch.fullText}\n`).join('\n---\n\n');
      booksFolder.file(`${safeId}.txt`, txtContent);

      // EPUB HTML Container
      const epubHtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <title>${escapeXml(b.title)}</title>
  <style>
    body { font-family: Georgia, serif; line-height: 1.6; padding: 2em; max-width: 700px; margin: auto; color: #1c1917; }
    h1 { font-size: 2em; color: #78350f; border-bottom: 2px solid #78350f; padding-bottom: 0.2em; }
    h2 { font-size: 1.4em; color: #78350f; margin-top: 1.5em; }
    .quote { font-style: italic; border-left: 3px solid #b45309; padding-left: 1em; color: #44403c; margin: 1em 0; }
  </style>
</head>
<body>
  <h1>${escapeXml(b.title)}</h1>
  <p><strong>Author:</strong> ${escapeXml(b.author)} | <strong>Year:</strong> ${b.year} | <strong>Category:</strong> ${escapeXml(b.category)}</p>
  <p class="quote">"${escapeXml(b.tagline)}"</p>
  <p>${escapeXml(b.description)}</p>
  <h2>Core Principles</h2>
  <ul>${(b.corePrinciples || []).map(p => `<li>${escapeXml(p)}</li>`).join('')}</ul>
  <h2>Chapters</h2>
  ${b.chapters.map(ch => `
    <h2>Chapter ${ch.chapterNumber}: ${escapeXml(ch.title)}</h2>
    <p><em>${escapeXml(ch.excerpt)}</em></p>
    <div>${ch.fullText.split('\n\n').map(p => `<p>${escapeXml(p)}</p>`).join('')}</div>
  `).join('')}
</body>
</html>`;
      booksFolder.file(`${safeId}.epub`, epubHtml);
    });
  }

  onProgress?.(80, 'Compressing archive with deflate...');
  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      onProgress?.(80 + Math.round(metadata.percent * 0.19), `Compressing: ${Math.round(metadata.percent)}%`);
    }
  );

  onProgress?.(100, 'Download starting...');
  triggerBrowserDownload(blob, `finlibre-${slugify(scopeName)}-bundle.zip`);
}

export function triggerServerCatalogExport(format: 'json' | 'csv' | 'zip' | 'markdown', scope: string = 'all', category?: string) {
  let url = `/api/export/catalog?format=${format}&scope=${encodeURIComponent(scope)}`;
  if (category && category !== 'All') {
    url += `&category=${encodeURIComponent(category)}`;
  }
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
