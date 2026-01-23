import { NavigationTab } from '@/lib/types';
import { House, Sparkle, Books, MagnifyingGlass, Book } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isDarkMode: boolean;
}

const tabs: { id: NavigationTab; label: string; Icon: typeof House }[] = [
  { id: 'home', label: 'Home', Icon: House },
  { id: 'prompts', label: 'Prompts', Icon: Sparkle },
  { id: 'chapters', label: 'Chapters', Icon: Books },
  { id: 'search', label: 'Search', Icon: MagnifyingGlass },
  { id: 'print', label: 'Print', Icon: Book },
];

export function BottomNav({ currentTab, onTabChange, isDarkMode }: BottomNavProps) {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 ${
      isDarkMode 
        ? 'bg-card/95 border-t border-border/30' 
        : 'bg-white/90 border-t border-border/20'
    } backdrop-blur-xl safe-area-bottom`}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = currentTab === id;
          return (
            <motion.button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-2 px-1 transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <Icon 
                weight={isActive ? 'fill' : 'regular'} 
                className={`w-6 h-6 mb-0.5 transition-all ${isActive ? 'scale-110' : ''}`}
              />
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-primary' : ''}`}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
