import { motion } from 'framer-motion';
import { ArrowRight, X, ImageSquare } from '@phosphor-icons/react';
import type { MomentSuggestion } from '@/hooks/use-moments';

interface MomentCardProps {
  suggestion: MomentSuggestion;
  onSelect: (suggestion: MomentSuggestion) => void;
  onDismiss: (clusterId: string) => void;
  index: number;
}

export function MomentCard({ suggestion, onSelect, onDismiss, index }: MomentCardProps) {
  const { cluster, prompt, coverDataUrl } = suggestion;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative w-full overflow-hidden rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm hover:border-primary/30 hover:bg-card/90 transition-all"
    >
      <button
        type="button"
        onClick={() => onSelect(suggestion)}
        className="flex w-full items-stretch text-left"
      >
        <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden bg-muted/40">
          {coverDataUrl ? (
            <img
              src={coverDataUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
              <ImageSquare weight="duotone" className="h-8 w-8" />
            </div>
          )}
          <div className="absolute bottom-1 right-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
            {cluster.count}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-1.5 p-3 sm:p-4">
          <div>
            <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground">
              {prompt.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
              "{prompt.prompt}"
            </p>
          </div>
          <div className="flex items-center justify-end text-xs text-muted-foreground/60">
            <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </button>
      <button
        type="button"
        aria-label="Dismiss moment"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(cluster.id);
        }}
        className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-muted-foreground/60 hover:text-foreground"
      >
        <X weight="bold" className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
