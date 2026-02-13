import { Book, Entry, Chapter, BookTheme, BOOK_THEMES } from './types';
import { getEntryTitle, formatDate } from './entries';

const getThemeStyles = (theme: BookTheme) => {
  const styles: Record<BookTheme, {
    coverBg: string;
    accentColor: string;
    textColor: string;
    fontFamily: string;
    titleSize: number;
    subtitleSize: number;
  }> = {
    classic: {
      coverBg: '#fdfcfb',
      accentColor: '#4a5568',
      textColor: '#2d3748',
      fontFamily: 'Georgia, serif',
      titleSize: 32,
      subtitleSize: 16,
    },
    modern: {
      coverBg: '#ffffff',
      accentColor: '#6366f1',
      textColor: '#111827',
      fontFamily: 'Helvetica, Arial, sans-serif',
      titleSize: 36,
      subtitleSize: 14,
    },
    vintage: {
      coverBg: '#faf8f3',
      accentColor: '#b45309',
      textColor: '#44403c',
      fontFamily: 'Georgia, serif',
      titleSize: 30,
      subtitleSize: 15,
    },
    minimal: {
      coverBg: '#fefefe',
      accentColor: '#6b7280',
      textColor: '#1f2937',
      fontFamily: 'Helvetica, Arial, sans-serif',
      titleSize: 28,
      subtitleSize: 14,
    },
    romantic: {
      coverBg: '#fef5f8',
      accentColor: '#ec4899',
      textColor: '#831843',
      fontFamily: 'Georgia, serif',
      titleSize: 34,
      subtitleSize: 16,
    }
  };

  return styles[theme] || styles.classic;
};

const MAX_FOOTER_LOCATIONS = 2;

function generateCoverHTML(book: Book, theme: BookTheme): string {
  const style = getThemeStyles(theme);
  
  return `
    <div class="page cover-page" style="background: ${style.coverBg}; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; padding: 80px;">
      <div style="width: 100px; height: 3px; background: ${style.accentColor}; margin-bottom: 30px;"></div>
      <h1 style="font-family: ${style.fontFamily}; font-size: ${style.titleSize}px; font-weight: bold; color: ${style.textColor}; text-align: center; margin: 0 0 20px 0;">${book.title}</h1>
      ${book.subtitle ? `<p style="font-family: ${style.fontFamily}; font-size: ${style.subtitleSize}px; color: ${style.textColor}; opacity: 0.7; text-align: center; margin: 0 0 40px 0;">${book.subtitle}</p>` : ''}
      <div style="width: 100px; height: 3px; background: ${style.accentColor}; margin: 30px 0;"></div>
      <p style="font-family: ${style.fontFamily}; font-size: 12px; color: ${style.textColor}; opacity: 0.6; text-align: center;">${book.entry_ids.length} Memories</p>
    </div>
  `;
}

function generateChapterDividerHTML(chapter: Chapter, theme: BookTheme): string {
  const style = getThemeStyles(theme);
  
  return `
    <div class="page chapter-divider" style="background: ${style.coverBg}; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; padding: 60px;">
      <div style="width: 80px; height: 2px; background: ${style.accentColor}; margin-bottom: 30px;"></div>
      <h2 style="font-family: ${style.fontFamily}; font-size: 28px; font-weight: bold; color: ${style.textColor}; text-align: center; margin: 0 0 15px 0;">${chapter.name}</h2>
      ${chapter.description ? `<p style="font-family: ${style.fontFamily}; font-size: 14px; color: ${style.textColor}; opacity: 0.6; text-align: center; max-width: 300px;">${chapter.description}</p>` : ''}
    </div>
  `;
}

function generateEntryHTML(entry: Entry, theme: BookTheme, pageNumber: number): string {
  const style = getThemeStyles(theme);
  const title = getEntryTitle(entry);
  const story = entry.story_ai || entry.transcript || '';
  
  const locations = [...new Set([
    ...(entry.manual_locations || []),
    ...(entry.tags_ai?.places || [])
  ])].slice(0, MAX_FOOTER_LOCATIONS);

  const paragraphs = story.split('\n\n').map(p => p.trim()).filter(Boolean);

  return `
    <div class="page entry-page" style="background: #ffffff; padding: 60px; padding-bottom: 80px; display: flex; flex-direction: column; height: 100%; position: relative; box-sizing: border-box;">
      <p style="font-family: ${style.fontFamily}; font-size: 10px; color: ${style.accentColor}; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">${formatDate(entry.date)}</p>
      <h3 style="font-family: ${style.fontFamily}; font-size: 18px; font-weight: bold; color: ${style.textColor}; margin: 0 0 20px 0;">${title}</h3>
      <div style="width: 40px; height: 1px; background: ${style.accentColor}; opacity: 0.4; margin-bottom: 20px;"></div>
      <div style="flex: 1;">
        ${paragraphs.map(p => `<p style="font-family: ${style.fontFamily}; font-size: 11px; color: ${style.textColor}; line-height: 1.8; text-align: justify; margin: 0 0 12px 0;">${p}</p>`).join('')}
      </div>
      <div style="position: absolute; bottom: 40px; left: 60px; right: 60px; display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #e5e7eb;">
        <span style="font-family: ${style.fontFamily}; font-size: 8px; color: ${style.accentColor}; opacity: 0.6;">${locations.length > 0 ? locations.join(' • ') : ''}</span>
        <span style="font-family: ${style.fontFamily}; font-size: 9px; color: ${style.textColor}; opacity: 0.5;">${pageNumber}</span>
      </div>
    </div>
  `;
}

export async function generateBookPDF(
  book: Book,
  entries: Entry[],
  chapters: Chapter[]
): Promise<void> {
  const bookEntries = entries
    .filter(e => book.entry_ids.includes(e.id))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const entriesByChapter = new Map<string | null, Entry[]>();
  bookEntries.forEach(entry => {
    const chapterId = entry.chapter_id;
    if (!entriesByChapter.has(chapterId)) {
      entriesByChapter.set(chapterId, []);
    }
    entriesByChapter.get(chapterId)!.push(entry);
  });

  let pageNumber = 0;
  let pagesHTML = '';

  pagesHTML += generateCoverHTML(book, book.theme);

  Array.from(entriesByChapter.entries()).forEach(([chapterId, chapterEntries]) => {
    const chapter = chapterId ? chapters.find(c => c.id === chapterId) : null;
    
    if (chapter) {
      pagesHTML += generateChapterDividerHTML(chapter, book.theme);
    }
    
    chapterEntries.forEach(entry => {
      pageNumber++;
      pagesHTML += generateEntryHTML(entry, book.theme, pageNumber);
    });
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups for this site.');
  }

  const sanitizedTitle = book.title
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'untitled-book';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${book.title}</title>
      <style>
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .page {
            page-break-after: always;
            width: 210mm;
            height: 297mm;
            box-sizing: border-box;
          }
          .page:last-child {
            page-break-after: auto;
          }
        }
        
        @media screen {
          body {
            background: #f0f0f0;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            box-sizing: border-box;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(79, 70, 229, 0.3);
          }
          .print-button:hover {
            background: #4338ca;
          }
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      </style>
    </head>
    <body>
      <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
      ${pagesHTML}
      <script>
        document.title = '${sanitizedTitle}';
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}
