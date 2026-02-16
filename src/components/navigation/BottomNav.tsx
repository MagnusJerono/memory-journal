import { NavigationTab } from '@/lib/types';
import { House, Sparkle, Books, Clock, MagnifyingGlass, Book } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/use-language.tsx';

interface BottomNavProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isDarkMode: boolean;
}

export function BottomNav({ currentTab, onTabChange, isDarkMode }: BottomNavProps) {
  const { t } = useLanguage();
  
  const tabs: { id: NavigationTab; labelKey: keyof typeof t.nav; Icon: typeof House }[] = [
    { id: 'home', labelKey: 'home', Icon: House },
    { id: 'prompts', labelKey: 'prompts', Icon: Sparkle },
    { id: 'chapters', labelKey: 'chapters', Icon: Books },
    { id: 'timeline', labelKey: 'timeline', Icon: Clock },
    { id: 'search', labelKey: 'search', Icon: MagnifyingGlass },
    { id: 'print', labelKey: 'print', Icon: Book },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 ${
      isDarkMode 
        ? 'bg-card/95 border-t border-border/30' 
        : 'bg-white/90 border-t border-border/20'
    } backdrop-blur-xl safe-area-bottom`}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ id, labelKey, Icon }) => {
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
                {t.nav[labelKey]}
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
