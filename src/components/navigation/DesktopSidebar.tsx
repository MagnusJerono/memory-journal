import { NavigationTab, AppView } from '@/lib/types';
import { 
  House, 
  Sparkle, 
  Books, 
  Clock,
  MagnifyingGlass, 
  Printer,
  Gear
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/use-language.tsx';
import { Button } from '@/components/ui/button';

interface DesktopSidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onSettingsClick: () => void;
  isDarkMode: boolean;
}

export function DesktopSidebar({ currentTab, onTabChange, onSettingsClick, isDarkMode }: DesktopSidebarProps) {
  const { t } = useLanguage();
  
  const tabs: { id: NavigationTab; labelKey: keyof typeof t.nav; Icon: typeof House }[] = [
    { id: 'home', labelKey: 'home', Icon: House },
    { id: 'prompts', labelKey: 'prompts', Icon: Sparkle },
    { id: 'chapters', labelKey: 'chapters', Icon: Books },
    { id: 'timeline', labelKey: 'timeline', Icon: Clock },
    { id: 'search', labelKey: 'search', Icon: MagnifyingGlass },
    { id: 'print', labelKey: 'print', Icon: Printer },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen w-64 z-40 flex flex-col ${
        isDarkMode 
          ? 'bg-card/70 border-r border-border/30' 
          : 'bg-white/80 border-r border-border/20'
      } backdrop-blur-xl`}
    >
      {/* Logo Section */}
      <div className="p-6 pb-4">
        <h1 
          className="text-2xl mb-0.5"
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontWeight: 700,
            color: isDarkMode ? '#e0d4f7' : '#5b4ba8',
          }}
        >
          tightly
        </h1>
        <p 
          className="text-xs tracking-wider italic"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: isDarkMode ? '#c8b8e8' : '#5f4f98',
          }}
        >
          Hold them tight
        </p>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {tabs.map(({ id, labelKey, Icon }) => {
          const isActive = currentTab === id;
          return (
            <motion.button
              key={id}
              onClick={() => onTabChange(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                isActive 
                  ? 'bg-primary/15 border border-primary/30 shadow-sm' 
                  : 'hover:bg-muted/40 border border-transparent'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon 
                weight={isActive ? 'fill' : 'duotone'} 
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                {t.nav[labelKey]}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Settings Button */}
      <div className="p-4 border-t border-border/30">
        <Button
          variant="ghost"
          onClick={onSettingsClick}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
        >
          <Gear weight="duotone" className="w-5 h-5" />
          <span>{t.settings.title}</span>
        </Button>
      </div>
    </aside>
  );
}
