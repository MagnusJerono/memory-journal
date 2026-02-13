import { useState } from 'react';
import { Book, Entry, Chapter, AppView, BOOK_THEMES, BookTheme, CHAPTER_ICONS, ChapterIcon } from '@/lib/types';
import { getEntryTitle, formatShortDate } from '@/lib/entries';
import { generateBookPDF } from '@/lib/generate-book-pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Book as BookIcon, 
  Plus, 
  CaretLeft, 
  CaretRight, 
  Camera, 
  Star,
  Check,
  Download,
  ArrowsDownUp,
  Printer,
  FilePdf,
  Trash
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { v4 as uuid } from 'uuid';
import { toast } from 'sonner';
import { SettingsPanel } from '@/components/SettingsPanel';
import { LogoHomeButton } from '@/components/LogoHomeButton';
import { NavigationMenu } from '@/components/navigation/NavigationMenu';
import { useLanguage } from '@/hooks/use-language.tsx';
import { useTheme } from '@/contexts/ThemeContext';

interface PrintScreenProps {
  books: Book[];
  entries: Entry[];
  chapters: Chapter[];
  onNavigate: (view: AppView) => void;
  onSaveBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  builderMode?: {
    bookId?: string;
    step: 1 | 2 | 3 | 4;
  };
}

export function PrintScreen({
  books,
  entries,
  chapters,
  onNavigate,
  onSaveBook,
  onDeleteBook,
  builderMode
}: PrintScreenProps) {
  const { themeMode, setThemeMode, isDarkMode, isNightTime } = useTheme();
  const { t } = useLanguage();
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const nonDraftEntries = entries.filter(e => !e.is_draft);
  const completedBooks = books.filter(b => !b.is_draft);
  const draftBooks = books.filter(b => b.is_draft);

  if (builderMode) {
    return (
      <BookBuilder
        books={books}
        entries={nonDraftEntries}
        chapters={chapters}
        onNavigate={onNavigate}
        onSaveBook={onSaveBook}
        bookId={builderMode.bookId}
        initialStep={builderMode.step}
        isDarkMode={isDarkMode}
      />
    );
  }

  const handleCreateBook = () => {
    onNavigate({ type: 'print-builder', step: 1 });
  };

  const handlePrintBook = (bookId: string) => {
    setSelectedBookId(bookId);
    setPrintDialogOpen(true);
  };

  const handleDownloadPdf = async () => {
    if (!selectedBook) return;
    
    try {
      toast.loading('Generating PDF...');
      await generateBookPDF(selectedBook, entries, chapters);
      toast.dismiss();
      toast.success('PDF downloaded!', { description: 'Your book is ready for printing.' });
      setPrintDialogOpen(false);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF', { description: 'Please try again.' });
      console.error('PDF generation error:', error);
    }
  };

  const handleDeleteBook = (bookId: string) => {
    onDeleteBook(bookId);
    toast.success('Book deleted');
  };

  const selectedBook = selectedBookId ? books.find(b => b.id === selectedBookId) : null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoHomeButton 
              isDarkMode={isDarkMode} 
              onClick={() => onNavigate({ type: 'home' })} 
              size="sm"
            />
            <span className="text-border/50">|</span>
            <h1 className="font-serif text-lg sm:text-xl font-semibold text-foreground">{t.print.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {completedBooks.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setPrintDialogOpen(true)}>
                <Printer weight="duotone" className="mr-1.5 w-4 h-4" />
                Print a Book
              </Button>
            )}
            <div className="hidden sm:block">
              <NavigationMenu 
                onNavigate={onNavigate} 
                currentTab="print" 
                isDarkMode={isDarkMode} 
              />
            </div>
            <SettingsPanel
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
              isDarkMode={isDarkMode}
              isNightTime={isNightTime}
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border border-primary/20"
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="p-3 rounded-xl bg-primary/20">
              <BookIcon weight="duotone" className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-1">
                {t.print.createBook}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t.print.description}
              </p>
            </div>
          </div>
          <Button onClick={handleCreateBook} className="w-full shadow-md" size="lg">
            <Plus className="mr-2" weight="bold" />
            {t.print.createBook}
          </Button>
        </motion.div>

        {completedBooks.length > 0 && (
          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Ready to Print</h2>
            <div className="space-y-3">
              {completedBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-card/70 backdrop-blur-sm border border-border/30 hover:border-border/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-20 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"
                      style={{ 
                        backgroundColor: BOOK_THEMES.find(t => t.value === book.theme)?.preview.bg,
                        border: `2px solid ${BOOK_THEMES.find(t => t.value === book.theme)?.preview.accent}`
                      }}
                    >
                      <BookIcon weight="duotone" className="w-6 h-6" style={{ color: BOOK_THEMES.find(t => t.value === book.theme)?.preview.accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{book.title}</h3>
                      {book.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{book.subtitle}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {book.entry_ids.length} memories · {BOOK_THEMES.find(t => t.value === book.theme)?.label}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handlePrintBook(book.id)}
                      >
                        <Printer weight="bold" className="mr-1.5 w-4 h-4" />
                        Print
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {draftBooks.length > 0 && (
          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Drafts</h2>
            <div className="space-y-3">
              {draftBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/20"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-20 rounded-lg flex items-center justify-center opacity-60 flex-shrink-0"
                      style={{ 
                        backgroundColor: BOOK_THEMES.find(t => t.value === book.theme)?.preview.bg,
                        border: `2px dashed ${BOOK_THEMES.find(t => t.value === book.theme)?.preview.accent}`
                      }}
                    >
                      <BookIcon weight="duotone" className="w-6 h-6" style={{ color: BOOK_THEMES.find(t => t.value === book.theme)?.preview.accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{book.title || 'Untitled Book'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {book.entry_ids.length} memories selected · Draft
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteBook(book.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash weight="regular" className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onNavigate({ type: 'print-builder', bookId: book.id, step: 1 })}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {nonDraftEntries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted/30 flex items-center justify-center">
              <BookIcon weight="duotone" className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">
              Write some memories first, then come back to create a book.
            </p>
          </motion.div>
        )}
      </main>

      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Print a Book</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {completedBooks.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">Choose a book to print:</p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {completedBooks.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => setSelectedBookId(book.id)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                        selectedBookId === book.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border/30 hover:border-border/50'
                      }`}
                    >
                      <div 
                        className="w-10 h-14 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: BOOK_THEMES.find(t => t.value === book.theme)?.preview.bg,
                          border: `1.5px solid ${BOOK_THEMES.find(t => t.value === book.theme)?.preview.accent}`
                        }}
                      >
                        <BookIcon weight="duotone" className="w-4 h-4" style={{ color: BOOK_THEMES.find(t => t.value === book.theme)?.preview.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate text-sm">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.entry_ids.length} memories</p>
                      </div>
                      {selectedBookId === book.id && (
                        <Check weight="bold" className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
                {selectedBook && (
                  <div className="pt-4 border-t border-border/30 space-y-3">
                    <Button 
                      onClick={handleDownloadPdf}
                      className="w-full"
                      size="lg"
                    >
                      <FilePdf weight="duotone" className="mr-2 w-5 h-5" />
                      Download PDF
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      size="lg"
                      disabled
                    >
                      <Printer weight="duotone" className="mr-2 w-5 h-5" />
                      Order Printed Copy (Coming Soon)
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No books ready to print yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => { setPrintDialogOpen(false); handleCreateBook(); }}
                >
                  Create Your First Book
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface BookBuilderProps {
  books: Book[];
  entries: Entry[];
  chapters: Chapter[];
  onNavigate: (view: AppView) => void;
  onSaveBook: (book: Book) => void;
  bookId?: string;
  initialStep: 1 | 2 | 3 | 4;
  isDarkMode: boolean;
}

function BookBuilder({
  books,
  entries,
  chapters,
  onNavigate,
  onSaveBook,
  bookId,
  initialStep,
  isDarkMode
}: BookBuilderProps) {
  const existingBook = bookId ? books.find(b => b.id === bookId) : null;
  
  const [step, setStep] = useState(initialStep);
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>(existingBook?.entry_ids || []);
  const [title, setTitle] = useState(existingBook?.title || '');
  const [subtitle, setSubtitle] = useState(existingBook?.subtitle || '');
  const [theme, setTheme] = useState<BookTheme>(existingBook?.theme || 'classic');
  const [filterChapter, setFilterChapter] = useState<string | null>(null);
  const [filterStarred, setFilterStarred] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const filteredEntries = entries.filter(e => {
    if (filterChapter && e.chapter_id !== filterChapter) return false;
    if (filterStarred && !e.is_starred) return false;
    return true;
  });

  const toggleEntry = (entryId: string) => {
    setSelectedEntryIds(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const selectAll = () => {
    setSelectedEntryIds(filteredEntries.map(e => e.id));
  };

  const deselectAll = () => {
    setSelectedEntryIds([]);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3 | 4);
    } else {
      onNavigate({ type: 'print' });
    }
  };

  const handleSaveDraft = () => {
    const book: Book = {
      id: existingBook?.id || uuid(),
      title: title || 'Untitled Book',
      subtitle: subtitle || null,
      theme,
      entry_ids: selectedEntryIds,
      is_draft: true,
      pdf_url: null,
      created_at: existingBook?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    onSaveBook(book);
    toast.success('Draft saved');
  };

  const handleExport = async () => {
    const book: Book = {
      id: existingBook?.id || uuid(),
      title: title || 'Untitled Book',
      subtitle: subtitle || null,
      theme,
      entry_ids: selectedEntryIds,
      is_draft: false,
      pdf_url: null,
      created_at: existingBook?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    onSaveBook(book);
    
    // Generate and download PDF
    setIsGeneratingPdf(true);
    try {
      toast.loading('Generating your book...');
      await generateBookPDF(book, entries, chapters);
      toast.dismiss();
      toast.success('Book exported!', { description: 'Your PDF has been downloaded.' });
      onNavigate({ type: 'print' });
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF', { description: 'Book saved, but PDF generation failed. Try downloading from the Print screen.' });
      console.error('PDF generation error:', error);
      onNavigate({ type: 'print' });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getIconEmoji = (icon: ChapterIcon) => 
    CHAPTER_ICONS.find(i => i.value === icon)?.emoji || '📁';

  const stepTitles = ['Select Entries', 'Configure Book', 'Preview', 'Export'];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoHomeButton 
              isDarkMode={isDarkMode} 
              onClick={() => onNavigate({ type: 'home' })} 
              size="sm"
            />
            <span className="text-border/50">|</span>
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
              <CaretLeft weight="bold" className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-lg font-semibold text-foreground">
              {stepTitles[step - 1]}
            </h1>
          </div>
          {step < 4 ? (
            <Button 
              onClick={handleNext}
              disabled={step === 1 && selectedEntryIds.length === 0}
            >
              Next
              <CaretRight className="ml-1 w-4 h-4" weight="bold" />
            </Button>
          ) : (
            <Button onClick={handleExport} disabled={isGeneratingPdf}>
              <Download className="mr-1.5 w-4 h-4" />
              {isGeneratingPdf ? 'Generating...' : 'Export PDF'}
            </Button>
          )}
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filterChapter || 'all'} onValueChange={v => setFilterChapter(v === 'all' ? null : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All chapters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All chapters</SelectItem>
                  {chapters.map(ch => (
                    <SelectItem key={ch.id} value={ch.id}>
                      {getIconEmoji(ch.icon)} {ch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={() => setFilterStarred(!filterStarred)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  filterStarred
                    ? 'bg-amber-400/20 text-amber-600'
                    : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary'
                }`}
              >
                <Star weight={filterStarred ? 'fill' : 'regular'} className="w-4 h-4" />
                Starred
              </button>
              <div className="flex-1" />
              <button onClick={selectAll} className="text-sm text-primary hover:underline">
                Select all
              </button>
              <button onClick={deselectAll} className="text-sm text-muted-foreground hover:underline">
                Clear
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              {selectedEntryIds.length} entries selected
            </p>

            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No entries match your filters.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEntries.map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => toggleEntry(entry.id)}
                    className={`w-full p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${
                      selectedEntryIds.includes(entry.id)
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-card/60 border-border/30 hover:bg-card/80'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedEntryIds.includes(entry.id)
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground/30'
                    }`}>
                      {selectedEntryIds.includes(entry.id) && (
                        <Check weight="bold" className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    {entry.photos[0] ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={entry.photos[0].storage_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                        <Camera weight="duotone" className="w-4 h-4 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate text-sm">
                        {getEntryTitle(entry)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatShortDate(entry.date)}
                      </p>
                    </div>
                    {entry.is_starred && (
                      <Star weight="fill" className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Book Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Memory Book"
                className="text-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Subtitle (optional)</label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="A collection of moments"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BOOK_THEMES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      theme === t.value
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border/30 hover:border-border/60'
                    }`}
                  >
                    <div 
                      className="w-full h-16 rounded-lg mb-3 flex items-center justify-center"
                      style={{ 
                        backgroundColor: t.preview.bg,
                        border: `2px solid ${t.preview.accent}`
                      }}
                    >
                      <BookIcon weight="duotone" className="w-8 h-8" style={{ color: t.preview.accent }} />
                    </div>
                    <p className="font-medium text-foreground text-sm">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                Preview of your book · {selectedEntryIds.length} memories
              </p>
            </div>
            
            {/* Cover Preview */}
            <div className="flex justify-center">
              <div 
                className="w-48 h-64 rounded-xl shadow-2xl flex flex-col items-center justify-center p-6"
                style={{ 
                  backgroundColor: BOOK_THEMES.find(t => t.value === theme)?.preview.bg,
                  border: `3px solid ${BOOK_THEMES.find(t => t.value === theme)?.preview.accent}`
                }}
              >
                <h3 
                  className="font-serif text-lg font-semibold text-center mb-2"
                  style={{ color: BOOK_THEMES.find(t => t.value === theme)?.preview.text }}
                >
                  {title || 'Untitled Book'}
                </h3>
                {subtitle && (
                  <p 
                    className="text-xs text-center opacity-70"
                    style={{ color: BOOK_THEMES.find(t => t.value === theme)?.preview.text }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Sample Entry Preview */}
            {selectedEntryIds.length > 0 && (() => {
              const sampleEntry = entries.find(e => e.id === selectedEntryIds[0]);
              if (!sampleEntry) return null;
              
              const entryTitle = getEntryTitle(sampleEntry);
              const story = sampleEntry.story_ai || sampleEntry.transcript || '';
              const preview = story.split('\n\n')[0].substring(0, 200) + (story.length > 200 ? '...' : '');
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-md mx-auto p-6 rounded-xl bg-card/50 border border-border/20"
                >
                  <div className="text-xs text-muted-foreground mb-2">Sample Entry Page</div>
                  <div className="text-xs font-medium text-primary mb-1.5">
                    {formatShortDate(sampleEntry.date)}
                  </div>
                  <h4 className="font-serif font-semibold text-foreground mb-3 text-sm">{entryTitle}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{preview}</p>
                </motion.div>
              );
            })()}

            {/* Book Details Summary */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-md mx-auto p-4 rounded-xl bg-muted/20 border border-border/20"
            >
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theme:</span>
                  <span className="font-medium text-foreground">
                    {BOOK_THEMES.find(t => t.value === theme)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Memories:</span>
                  <span className="font-medium text-foreground">{selectedEntryIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Pages:</span>
                  <span className="font-medium text-foreground">
                    {/* Cover (1) + entries (1-2 pages each) + chapter dividers */}
                    {selectedEntryIds.length + 1}-{selectedEntryIds.length * 2 + 1}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-card/80 border border-border/30"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Download weight="duotone" className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Download PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Free · Ready instantly
                  </p>
                </div>
              </div>
              <Button onClick={handleExport} className="w-full" size="lg" disabled={isGeneratingPdf}>
                <Download className="mr-2" weight="bold" />
                {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-muted/30 border border-border/20"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  <BookIcon weight="duotone" className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Order Printed Book</h3>
                  <p className="text-sm text-muted-foreground">
                    From $29.99 · Ships in 5-7 days
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" size="lg" disabled>
                Coming Soon
              </Button>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
