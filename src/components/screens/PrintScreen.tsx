import { useState } from 'react';
import { Book, Entry, Chapter, AppView, BOOK_THEMES, BookTheme, CHAPTER_ICONS, ChapterIcon } from '@/lib/types';
import { getEntryTitle, formatShortDate } from '@/lib/entries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Book as BookIcon, 
  Plus, 
  CaretLeft, 
  CaretRight, 
  Camera, 
  Star,
  Check,
  Download,
  ArrowsDownUp
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { v4 as uuid } from 'uuid';
import { toast } from 'sonner';

interface PrintScreenProps {
  books: Book[];
  entries: Entry[];
  chapters: Chapter[];
  onNavigate: (view: AppView) => void;
  onSaveBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  isDarkMode: boolean;
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
  isDarkMode,
  builderMode
}: PrintScreenProps) {
  const nonDraftEntries = entries.filter(e => !e.is_draft);

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

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="font-serif text-2xl font-semibold text-foreground">Print</h1>
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
                Create a Book
              </h2>
              <p className="text-sm text-muted-foreground">
                Turn your memories into a beautiful printed journal.
              </p>
            </div>
          </div>
          <Button onClick={handleCreateBook} className="w-full shadow-md" size="lg">
            <Plus className="mr-2" weight="bold" />
            Create Book
          </Button>
        </motion.div>

        {books.length > 0 && (
          <section>
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Your Books</h2>
            <div className="space-y-3">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-card/70 backdrop-blur-sm border border-border/30"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-18 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: BOOK_THEMES.find(t => t.value === book.theme)?.preview.bg,
                        border: `2px solid ${BOOK_THEMES.find(t => t.value === book.theme)?.preview.accent}`
                      }}
                    >
                      <BookIcon weight="duotone" className="w-6 h-6" style={{ color: BOOK_THEMES.find(t => t.value === book.theme)?.preview.accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {book.entry_ids.length} entries · {BOOK_THEMES.find(t => t.value === book.theme)?.label} theme
                      </p>
                    </div>
                    {book.is_draft ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onNavigate({ type: 'print-builder', bookId: book.id, step: 1 })}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        <Download className="mr-1.5 w-4 h-4" />
                        PDF
                      </Button>
                    )}
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
            className="text-center py-8"
          >
            <p className="text-sm text-muted-foreground">
              Write some memories first, then come back to create a book.
            </p>
          </motion.div>
        )}
      </main>
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

  const handleExport = () => {
    const book: Book = {
      id: existingBook?.id || uuid(),
      title: title || 'Untitled Book',
      subtitle: subtitle || null,
      theme,
      entry_ids: selectedEntryIds,
      is_draft: false,
      pdf_url: 'placeholder.pdf',
      created_at: existingBook?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    onSaveBook(book);
    toast.success('Book exported! (PDF generation coming soon)');
    onNavigate({ type: 'print' });
  };

  const getIconEmoji = (icon: ChapterIcon) => 
    CHAPTER_ICONS.find(i => i.value === icon)?.emoji || '📁';

  const stepTitles = ['Select Entries', 'Configure Book', 'Preview', 'Export'];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
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
            <Button onClick={handleExport}>
              <Download className="mr-1.5 w-4 h-4" />
              Export PDF
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

            <div className="text-center text-sm text-muted-foreground">
              {selectedEntryIds.length} entries · ~{selectedEntryIds.length * 4} pages
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Entry Order</p>
                <Button variant="ghost" size="sm" className="text-xs">
                  <ArrowsDownUp className="mr-1 w-3 h-3" />
                  Reorder
                </Button>
              </div>
              <div className="space-y-1.5">
                {selectedEntryIds.slice(0, 5).map((id, idx) => {
                  const entry = entries.find(e => e.id === id);
                  if (!entry) return null;
                  return (
                    <div key={id} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground w-5">{idx + 1}.</span>
                      <span className="truncate">{getEntryTitle(entry)}</span>
                    </div>
                  );
                })}
                {selectedEntryIds.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    +{selectedEntryIds.length - 5} more entries
                  </p>
                )}
              </div>
            </div>
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
              <Button onClick={handleExport} className="w-full" size="lg">
                <Download className="mr-2" weight="bold" />
                Download PDF
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
