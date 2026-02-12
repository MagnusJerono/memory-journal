import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown } from '@phosphor-icons/react';

interface AccordionSettingsSectionProps {
  sectionKey: string;
  icon: ReactNode;
  title: string;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  children: ReactNode;
}

export function AccordionSettingsSection({
  sectionKey,
  icon,
  title,
  isExpanded,
  onToggle,
  children
}: AccordionSettingsSectionProps) {
  const handleClick = () => onToggle(sectionKey);
  
  return (
    <div className="rounded-xl border bg-card/50">
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            {title}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <CaretDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
