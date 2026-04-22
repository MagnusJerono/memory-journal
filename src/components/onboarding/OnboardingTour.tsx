import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle, Books, Printer, X, CaretRight, CaretLeft } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';

export const ONBOARDING_STORAGE_KEY = 'tightly-onboarding-completed';

interface OnboardingTourProps {
  onStartWriting: () => void;
}

interface Step {
  icon: typeof Sparkle;
  title: string;
  description: string;
  accent: string;
}

const STEPS: Step[] = [
  {
    icon: Sparkle,
    title: 'Capture a memory',
    description:
      'Write freely, follow a prompt, or add photos. Tightly turns your notes into polished stories you can revisit anytime.',
    accent: 'from-primary/25 via-primary/10 to-transparent',
  },
  {
    icon: Books,
    title: 'Group memories into chapters',
    description:
      'Cluster memories by theme — "travel", "kids", "first year" — so your journal stays organized as it grows.',
    accent: 'from-accent/25 via-accent/10 to-transparent',
  },
  {
    icon: Printer,
    title: 'Print a beautiful book',
    description:
      'When a chapter is ready, assemble it into a book and order a printed keepsake. Your memories, held tight.',
    accent: 'from-amber-500/25 via-amber-500/10 to-transparent',
  },
];

export function useOnboardingCompleted(): readonly [boolean, () => void] {
  const [completed, setCompleted] = useLocalStorage<boolean>(ONBOARDING_STORAGE_KEY, false);
  return [Boolean(completed), () => setCompleted(true)] as const;
}

export function OnboardingTour({ onStartWriting }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const [, markCompleted] = useOnboardingCompleted();
  const [visible, setVisible] = useState(true);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  const close = () => {
    markCompleted();
    setVisible(false);
  };

  const next = () => {
    if (isLast) {
      close();
      onStartWriting();
    } else {
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <motion.div
          key={`onboarding-card-${step}`}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative w-full max-w-md rounded-3xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl overflow-hidden`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${current.accent} pointer-events-none`} />

          <button
            type="button"
            onClick={close}
            aria-label="Skip onboarding"
            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative px-6 pt-8 pb-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-background/70 backdrop-blur-sm border border-border/40">
                <Icon weight="duotone" className="w-7 h-7 text-primary" />
              </div>
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className={`h-1.5 rounded-full transition-all ${
                      i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            <h2
              id="onboarding-title"
              className="font-serif text-2xl font-semibold text-foreground mb-2"
            >
              {current.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {current.description}
            </p>

            <div className="mt-7 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={close}
                className="text-muted-foreground"
              >
                Skip tour
              </Button>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <Button type="button" variant="outline" size="icon" onClick={back} aria-label="Previous step">
                    <CaretLeft weight="bold" className="w-4 h-4" />
                  </Button>
                )}
                <Button type="button" onClick={next} className="min-w-[7rem]">
                  {isLast ? (
                    <>
                      <Sparkle className="mr-2 w-4 h-4" weight="fill" />
                      Start writing
                    </>
                  ) : (
                    <>
                      Next
                      <CaretRight weight="bold" className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
