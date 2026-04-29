import { BookOpen, Camera, LockKeyhole, Mail, Mic, Printer, ShieldCheck, Sparkles } from 'lucide-react';

import { BrandHeader, BrandHeaderCompact, CloudHeader } from '../BrandHeader';
import { Button } from '../ui/button';

interface LandingScreenProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

const featureCards = [
  {
    icon: Mic,
    title: 'Capture in your own voice',
    description: 'Record a quick note, type a thought, or add details later when the memory settles.',
  },
  {
    icon: Sparkles,
    title: 'Shape memories into stories',
    description: 'Turn raw moments into polished entries with gentle AI refinement and tone controls.',
  },
  {
    icon: Camera,
    title: 'Keep the scene with the story',
    description: 'Attach photos and location context so every entry carries the feeling of the day.',
  },
];

const navLinks = [
  { href: '#print', label: 'Print' },
  { href: '#privacy', label: 'Privacy' },
  { href: '#security', label: 'Security' },
  { href: '#contact', label: 'Contact' },
];

const journeySteps = [
  'Write, record, or start from a gentle prompt.',
  'Let AI polish the memory without losing your voice.',
  'Collect everything into chapters and keepsake books.',
];

const trustSections = [
  {
    id: 'privacy',
    icon: LockKeyhole,
    label: 'Privacy',
    title: 'Your memories stay yours.',
    description:
      'Entries, photos, chapters, and books are stored behind account sign in. The product is designed around private journaling first, not public posting.',
  },
  {
    id: 'security',
    icon: ShieldCheck,
    label: 'Security',
    title: 'Built on authenticated storage.',
    description:
      'Tightly uses Supabase Auth and row-level security so each user can only access their own journal data.',
  },
  {
    id: 'contact',
    icon: Mail,
    label: 'Contact',
    title: 'Questions before you start?',
    description:
      'Reach the pilot team at holdthemtightly@gmail.com for feedback, early access questions, or help with your account.',
  },
];

export function LandingScreen({ onSignIn, onSignUp }: LandingScreenProps) {
  return (
    <main className="relative z-10 min-h-screen overflow-hidden px-4 py-4 text-foreground sm:px-6">
      <header className="sticky top-0 z-20 mx-auto w-full max-w-5xl">
        <CloudHeader isDarkMode={false}>
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={onSignUp} aria-label="Start tightly" className="flex items-center">
              <img
                src="/brand/logo.png"
                alt="Tightly"
                className="h-12 w-auto object-contain"
              />
            </button>
            <nav className="hidden items-center gap-1 text-sm text-[#5f4f98] lg:flex">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="rounded-full px-3 py-2 hover:bg-white/50">
                  {link.label}
                </a>
              ))}
            </nav>
            <nav className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onSignIn} className="rounded-full text-[#5f4f98]">
                Sign in
              </Button>
              <Button type="button" onClick={onSignUp} className="rounded-full bg-[#5b4ba8] px-5 text-white shadow-lg shadow-violet-300/40 hover:bg-[#4f409a]">
                Start free
              </Button>
            </nav>
          </div>
        </CloudHeader>
      </header>

      <section className="mx-auto grid w-full max-w-5xl items-center gap-8 pb-12 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:pt-16">
        <div className="text-center lg:text-left">
          <div className="mx-auto max-w-xl lg:mx-0">
            <BrandHeader isDarkMode={false} align="center" />
          </div>

          <h1 className="mt-8 max-w-2xl font-serif text-4xl font-semibold leading-tight tracking-tight text-[#2f285c] sm:text-5xl">
            A soft place for memories before they fade.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f4f98]/80 sm:text-lg">
            Tightly helps you capture everyday moments, shape them into stories, and keep them
            organized in a calm journal that feels personal from the first entry.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button type="button" size="lg" onClick={onSignUp} className="h-12 rounded-full bg-[#5b4ba8] px-8 text-white shadow-xl shadow-violet-300/50 hover:bg-[#4f409a]">
              Create your journal
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={onSignIn}
              className="h-12 rounded-full border-violet-200/70 bg-white/55 px-8 text-[#5f4f98] shadow-sm backdrop-blur-md hover:bg-white/80"
            >
              I already have one
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-violet-200/60 via-purple-100/70 to-pink-100/80 blur-3xl" />
          <div className="relative space-y-3 rounded-[2.25rem] border border-white/70 bg-white/55 p-4 shadow-2xl shadow-violet-200/60 backdrop-blur-xl">
            <div className="rounded-[1.75rem] border border-violet-100 bg-gradient-to-br from-white/95 via-violet-50/90 to-pink-50/90 p-5 shadow-inner">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[#5f4f98]/50">Your memory flow</p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold text-[#2f285c]">
                    From small notes to a printed book.
                  </h2>
                </div>
                <img
                  src="/brand/logo.png"
                  alt=""
                  className="hidden size-14 rounded-2xl border border-white/80 bg-white/80 object-cover shadow-md sm:block"
                />
              </div>
              <p className="mt-3 text-sm leading-7 text-[#5f4f98]/75">
                Capture the thing you almost forgot, add a photo or voice note, then let Tightly
                help you turn it into a story you can revisit on screen or in print.
              </p>
            </div>

            {['Record the moment', 'Add the context', 'Save or print it'].map((label, index) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white/70 p-4 text-[#5f4f98] shadow-sm">
                <span className="flex size-9 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-[#5b4ba8]">
                  0{index + 1}
                </span>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="print" className="mx-auto grid w-full max-w-5xl gap-6 pb-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-violet-100/80 bg-white/55 p-6 shadow-lg shadow-violet-100/60 backdrop-blur-md lg:p-8">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-[#5b4ba8]">
            <Printer className="size-6" />
          </div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#5f4f98]/50">Print</p>
          <h2 className="mt-3 font-serif text-4xl font-semibold text-[#2f285c]">
            Turn your chapters into something you can hold.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#5f4f98]/75">
            Save entries into chapters, choose the stories that matter, and prepare a printable book
            for your own shelf, a gift, or a chapter of life you want to close beautifully.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/60 p-4 shadow-2xl shadow-violet-100/70 backdrop-blur-xl">
          <div className="rounded-[1.5rem] border border-violet-100 bg-gradient-to-br from-white/95 via-violet-50/90 to-pink-50/90 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-pink-100 text-pink-500">
                <BookOpen className="size-5" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-semibold text-[#2f285c]">Chapter collection</h3>
                <p className="text-sm text-[#5f4f98]/60">Stories, photos, and chapters ready to export</p>
              </div>
            </div>
            {['Family: everyday moments', 'Travel: Italy by train', 'My time in Portugal: first apartment'].map((chapter) => (
              <div key={chapter} className="mb-3 rounded-2xl border border-violet-100 bg-white/70 p-4 text-sm text-[#5f4f98] last:mb-0">
                {chapter}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 pb-8 md:grid-cols-3">
        {featureCards.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="rounded-[1.75rem] border border-violet-100/80 bg-white/55 p-6 shadow-lg shadow-violet-100/60 backdrop-blur-md"
          >
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-[#5b4ba8]">
              <Icon className="size-6" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-[#2f285c]">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#5f4f98]/75">{description}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-6 pb-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-violet-100/80 bg-white/55 p-6 shadow-lg shadow-violet-100/60 backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.28em] text-[#5f4f98]/50">Example memory</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-[#2f285c]">
            Real life, not over-written.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#5f4f98]/75">
            Tightly should keep the small details without making them sound bigger than they were.
            The aim is warm, honest, and printable.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/60 p-4 shadow-2xl shadow-violet-100/70 backdrop-blur-xl">
          <div className="rounded-[1.5rem] border border-violet-100 bg-gradient-to-br from-white/95 via-violet-50/90 to-pink-50/90 p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#5f4f98]/50">Late summer</p>
                <h3 className="mt-1 font-serif text-3xl font-semibold text-[#2f285c]">
                  My time in Portugal
                </h3>
              </div>
              <span className="rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-xs font-medium text-[#5b4ba8]">
                Portugal
              </span>
            </div>

            <div className="space-y-3 text-sm leading-7 text-[#4f477a]">
              <p>
                I carried two bags up four flights of stairs and ate dinner on the floor because the
                table had not arrived yet. The room was too warm, and I could hear scooters outside
                until after midnight.
              </p>
              <p>
                It was not a big moment, but it felt like the first evening where the move became
                real.
              </p>
            </div>

            <div className="mt-5 rounded-[1.25rem] bg-[#5b4ba8] p-5 text-white shadow-xl shadow-violet-300/40">
              <p className="text-xs uppercase tracking-[0.28em] text-white/55">Gentle polish</p>
              <p className="mt-3 font-serif text-lg leading-7 text-white/90">
                "Dinner on the floor, scooters outside, two bags still unpacked. It was the first
                night the new city felt real."
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mb-12 grid w-full max-w-5xl gap-6 rounded-[2rem] border border-violet-100/80 bg-white/55 p-6 shadow-lg shadow-violet-100/60 backdrop-blur-md lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
        <div>
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-500">
            <LockKeyhole className="size-6" />
          </div>
          <h2 className="font-serif text-3xl font-semibold text-[#2f285c]">Private, gentle, yours.</h2>
          <p className="mt-4 text-sm leading-6 text-[#5f4f98]/75">
            The pilot keeps the promise simple: your memories stay behind sign in and are organized
            around how you want to remember them.
          </p>
        </div>

        <ol className="grid gap-3 sm:grid-cols-3">
          {journeySteps.map((step, index) => (
            <li key={step} className="rounded-2xl border border-violet-100 bg-white/70 p-5">
              <span className="text-sm font-semibold text-[#5b4ba8]">0{index + 1}</span>
              <p className="mt-3 text-sm leading-6 text-[#5f4f98]/75">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 pb-8 md:grid-cols-3">
        {trustSections.map(({ id, icon: Icon, label, title, description }) => (
          <article
            id={id}
            key={id}
            className="scroll-mt-32 rounded-[1.75rem] border border-violet-100/80 bg-white/55 p-6 shadow-lg shadow-violet-100/60 backdrop-blur-md"
          >
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-[#5b4ba8]">
              <Icon className="size-6" />
            </div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#5f4f98]/50">{label}</p>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-[#2f285c]">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#5f4f98]/75">{description}</p>
          </article>
        ))}
      </section>

      <footer className="mx-auto mb-6 w-full max-w-5xl rounded-[2rem] border border-white/70 bg-white/50 p-6 text-[#5f4f98] shadow-lg shadow-violet-100/60 backdrop-blur-md">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/brand/logo.png"
                alt=""
                className="size-11 rounded-2xl border border-white/70 bg-white/70 object-cover shadow-md"
              />
              <BrandHeaderCompact isDarkMode={false} />
            </div>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#5f4f98]/70">
              A private memory journal for writing now, organizing by chapter, and printing later.
            </p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2 md:text-right">
            <a href="#print" className="hover:text-[#2f285c]">Print</a>
            <a href="#privacy" className="hover:text-[#2f285c]">Privacy</a>
            <a href="#security" className="hover:text-[#2f285c]">Security</a>
            <a href="mailto:holdthemtightly@gmail.com" className="hover:text-[#2f285c]">holdthemtightly@gmail.com</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
