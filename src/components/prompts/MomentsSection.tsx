import { motion } from 'framer-motion';
import { Images, ArrowsClockwise, CircleNotch } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useMoments, type MomentSuggestion } from '@/hooks/use-moments';
import { MomentCard } from './MomentCard';

interface MomentsSectionProps {
  /** Called when the user picks a moment to write about. */
  onSelectMoment: (suggestion: MomentSuggestion) => void;
}

export function MomentsSection({ onSelectMoment }: MomentsSectionProps) {
  const { enabled, permission, loading, error, suggestions, request, dismiss, refresh } =
    useMoments();

  // The permission prompt itself enables the feature on first success — so we
  // always show *some* affordance until the user has chosen.
  const showPermissionGate = !enabled || permission === 'denied' || permission === 'prompt';

  if (showPermissionGate) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dashed border-border/40 bg-card/40 p-4 sm:p-5"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/15 p-2 sm:p-3">
            <Images weight="duotone" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground">
              From your photos
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Let Memory Journal scan your recent photos and turn them into gentle prompts.
              Photos stay on your device — only timestamps and approximate places are used.
            </p>
            {error && (
              <p className="mt-2 text-xs text-destructive">{error}</p>
            )}
            <Button
              size="sm"
              className="mt-3"
              onClick={() => void request()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircleNotch className="mr-2 h-4 w-4 animate-spin" /> Scanning…
                </>
              ) : (
                'Enable photo suggestions'
              )}
            </Button>
          </div>
        </div>
      </motion.section>
    );
  }

  if (suggestions.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">From your photos</p>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-foreground disabled:opacity-50"
          aria-label="Refresh moments"
        >
          {loading ? (
            <CircleNotch className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowsClockwise weight="bold" className="h-3.5 w-3.5" />
          )}
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, idx) => (
          <MomentCard
            key={suggestion.cluster.id}
            suggestion={suggestion}
            onSelect={onSelectMoment}
            onDismiss={dismiss}
            index={idx}
          />
        ))}
      </div>
    </section>
  );
}
