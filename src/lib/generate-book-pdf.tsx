import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { Book, Entry, Chapter, BookTheme, BOOK_THEMES } from './types';
import { getEntryTitle, formatDate } from './entries';

// Note: Using built-in PDF fonts (Times-Roman, Helvetica) to avoid external font loading issues

// Theme-specific styles
const getThemeStyles = (theme: BookTheme) => {
  const themeConfig = BOOK_THEMES.find(t => t.value === theme);
  if (!themeConfig) {
    // Default fallback uses Times-Roman to match classic theme
    return {
      coverBg: '#f9fafb',
      accentColor: '#374151',
      textColor: '#1f2937',
      fontFamily: 'Times-Roman'
    };
  }

  const styles: Record<BookTheme, any> = {
    classic: {
      coverBg: '#fdfcfb',
      accentColor: '#4a5568',
      textColor: '#2d3748',
      fontFamily: 'Times-Roman',
      titleSize: 32,
      subtitleSize: 16,
      coverPadding: 80
    },
    modern: {
      coverBg: '#ffffff',
      accentColor: '#6366f1',
      textColor: '#111827',
      fontFamily: 'Helvetica',
      titleSize: 36,
      subtitleSize: 14,
      coverPadding: 60
    },
    vintage: {
      coverBg: '#faf8f3',
      accentColor: '#b45309',
      textColor: '#44403c',
      fontFamily: 'Times-Roman',
      titleSize: 30,
      subtitleSize: 15,
      coverPadding: 70
    },
    minimal: {
      coverBg: '#fefefe',
      accentColor: '#6b7280',
      textColor: '#1f2937',
      fontFamily: 'Helvetica',
      titleSize: 28,
      subtitleSize: 14,
      coverPadding: 100
    },
    romantic: {
      coverBg: '#fef5f8',
      accentColor: '#ec4899',
      textColor: '#831843',
      fontFamily: 'Times-Roman',
      titleSize: 34,
      subtitleSize: 16,
      coverPadding: 70
    }
  };

  return styles[theme];
};

interface BookPDFProps {
  book: Book;
  entries: Entry[];
  chapters: Chapter[];
}

// Cover Page Component
const CoverPage: React.FC<{ book: Book; theme: BookTheme }> = ({ book, theme }) => {
  const themeStyle = getThemeStyles(theme);
  
  const styles = StyleSheet.create({
    page: {
      backgroundColor: themeStyle.coverBg,
      padding: themeStyle.coverPadding,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontFamily: themeStyle.fontFamily,
      fontSize: themeStyle.titleSize,
      fontWeight: 600,
      color: themeStyle.textColor,
      textAlign: 'center',
      marginBottom: 20,
    },
    subtitle: {
      fontFamily: themeStyle.fontFamily,
      fontSize: themeStyle.subtitleSize,
      color: themeStyle.textColor,
      opacity: 0.7,
      textAlign: 'center',
      marginBottom: 40,
    },
    divider: {
      width: 100,
      height: 3,
      backgroundColor: themeStyle.accentColor,
      marginTop: 30,
      marginBottom: 30,
    },
    entryCount: {
      fontFamily: themeStyle.fontFamily,
      fontSize: 12,
      color: themeStyle.textColor,
      opacity: 0.6,
      textAlign: 'center',
    }
  });

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.divider} />
      <Text style={styles.title}>{book.title}</Text>
      {book.subtitle && <Text style={styles.subtitle}>{book.subtitle}</Text>}
      <View style={styles.divider} />
      <Text style={styles.entryCount}>{book.entry_ids.length} Memories</Text>
    </Page>
  );
};

// Chapter Divider Page Component
const ChapterDividerPage: React.FC<{ chapter: Chapter; theme: BookTheme }> = ({ chapter, theme }) => {
  const themeStyle = getThemeStyles(theme);
  
  const styles = StyleSheet.create({
    page: {
      backgroundColor: themeStyle.coverBg,
      padding: 60,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    divider: {
      width: 80,
      height: 2,
      backgroundColor: themeStyle.accentColor,
      marginBottom: 30,
    },
    chapterName: {
      fontFamily: themeStyle.fontFamily,
      fontSize: 28,
      fontWeight: 600,
      color: themeStyle.textColor,
      textAlign: 'center',
      marginBottom: 15,
    },
    chapterDescription: {
      fontFamily: themeStyle.fontFamily,
      fontSize: 14,
      color: themeStyle.textColor,
      opacity: 0.6,
      textAlign: 'center',
      maxWidth: 300,
    }
  });

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.divider} />
      <Text style={styles.chapterName}>{chapter.name}</Text>
      {chapter.description && (
        <Text style={styles.chapterDescription}>{chapter.description}</Text>
      )}
    </Page>
  );
};

// Entry Page Component
const EntryPage: React.FC<{ entry: Entry; theme: BookTheme; pageNumber: number }> = ({ entry, theme, pageNumber }) => {
  const themeStyle = getThemeStyles(theme);
  const title = getEntryTitle(entry);
  const story = entry.story_ai || entry.transcript || '';
  
  const styles = StyleSheet.create({
    page: {
      backgroundColor: '#ffffff',
      padding: 60,
      paddingBottom: 80,
      display: 'flex',
      flexDirection: 'column',
    },
    date: {
      fontFamily: themeStyle.fontFamily,
      fontSize: 10,
      color: themeStyle.accentColor,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    title: {
      fontFamily: themeStyle.fontFamily,
      fontSize: 18,
      fontWeight: 600,
      color: themeStyle.textColor,
      marginBottom: 20,
    },
    divider: {
      width: 40,
      height: 1,
      backgroundColor: themeStyle.accentColor,
      marginBottom: 20,
      opacity: 0.4,
    },
    story: {
      fontFamily: themeStyle.fontFamily,
      fontSize: 11,
      color: themeStyle.textColor,
      lineHeight: 1.8,
      textAlign: 'justify',
    },
    paragraph: {
      marginBottom: 12,
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      left: 60,
      right: 60,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
    },
    pageNumber: {
      fontFamily: themeStyle.fontFamily,
      fontSize: 9,
      color: themeStyle.textColor,
      opacity: 0.5,
    },
    tags: {
      fontFamily: themeStyle.fontFamily,
      fontSize: 8,
      color: themeStyle.accentColor,
      opacity: 0.6,
    }
  });

  // Get locations for footer (deduplicate efficiently)
  const locations = [...new Set([
    ...(entry.manual_locations || []),
    ...(entry.tags_ai?.places || [])
  ])].slice(0, 2);

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.date}>{formatDate(entry.date)}</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.divider} />
      <View>
        {story.split('\n\n').map((paragraph, idx) => (
          <Text key={idx} style={[styles.story, styles.paragraph]}>
            {paragraph.trim()}
          </Text>
        ))}
      </View>
      <View style={styles.footer}>
        <Text style={styles.tags}>
          {locations.length > 0 ? locations.join(' • ') : ''}
        </Text>
        <Text style={styles.pageNumber}>{pageNumber}</Text>
      </View>
    </Page>
  );
};

// Main Book PDF Document Component
const BookPDFDocument: React.FC<BookPDFProps> = ({ book, entries, chapters }) => {
  const bookEntries = entries
    .filter(e => book.entry_ids.includes(e.id))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group entries by chapter
  const entriesByChapter = new Map<string | null, Entry[]>();
  bookEntries.forEach(entry => {
    const chapterId = entry.chapter_id;
    if (!entriesByChapter.has(chapterId)) {
      entriesByChapter.set(chapterId, []);
    }
    entriesByChapter.get(chapterId)!.push(entry);
  });

  let pageNumber = 0; // Cover is unnumbered, content pages start at 1

  return (
    <Document>
      {/* Cover Page */}
      <CoverPage book={book} theme={book.theme} />
      
      {/* Entries organized by chapter */}
      {Array.from(entriesByChapter.entries()).map(([chapterId, chapterEntries], chapterIdx) => {
        const chapter = chapterId ? chapters.find(c => c.id === chapterId) : null;
        
        return (
          <React.Fragment key={chapterId || 'no-chapter'}>
            {/* Chapter divider if chapter exists */}
            {chapter && <ChapterDividerPage chapter={chapter} theme={book.theme} />}
            
            {/* Entry pages */}
            {chapterEntries.map((entry, entryIdx) => {
              pageNumber++;
              return <EntryPage key={entry.id} entry={entry} theme={book.theme} pageNumber={pageNumber} />;
            })}
          </React.Fragment>
        );
      })}
    </Document>
  );
};

// Main export function to generate and download PDF
export async function generateBookPDF(
  book: Book,
  entries: Entry[],
  chapters: Chapter[]
): Promise<void> {
  try {
    const blob = await pdf(
      <BookPDFDocument book={book} entries={entries} chapters={chapters} />
    ).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Sanitize filename: replace non-alphanumeric with hyphen, collapse multiple hyphens, trim hyphens
    const sanitizedTitle = book.title
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    link.download = `${sanitizedTitle || 'untitled-book'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
