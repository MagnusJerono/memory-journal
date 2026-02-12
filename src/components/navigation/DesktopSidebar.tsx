import { NavigationTab } from '@/lib/types';
import { House, Sparkle, Books, MagnifyingGlass, Book, Gear } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/use-language.tsx';
import { useTheme } from '@/contexts/ThemeContext';
import { SettingsPanel } from '@/components/SettingsPanel';
import { Button } from '@/components/ui/button';

interface DesktopSidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export function DesktopSidebar({ currentTab, onTabChange }: DesktopSidebarProps) {
  const { t } = useLanguage();
  const { isDarkMode, themeMode, setThemeMode, isNightTime } = useTheme();
  
  const tabs: { id: NavigationTab; labelKey: keyof typeof t.nav; Icon: typeof House }[] = [
    { id: 'home', labelKey: 'home', Icon: House },
    { id: 'prompts', labelKey: 'prompts', Icon: Sparkle },
    { id: 'chapters', labelKey: 'chapters', Icon: Books },
    { id: 'search', labelKey: 'search', Icon: MagnifyingGlass },
    { id: 'print', labelKey: 'print', Icon: Book },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen w-64 z-40 flex flex-col ${
        isDarkMode 
          ? 'bg-card/95 border-r border-border/30' 
          : 'bg-white/90 border-r border-border/20'
      } backdrop-blur-xl`}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-border/20">
        <h1 className="font-serif text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Tightly
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Hold them tight</p>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {tabs.map(({ id, labelKey, Icon }) => {
          const isActive = currentTab === id;
          return (
            <motion.button
              key={id}
              onClick={() => onTabChange(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="desktopSidebarIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon 
                weight={isActive ? 'fill' : 'regular'} 
                className="w-5 h-5"
              />
              <span className="font-medium text-sm">
                {t.nav[labelKey]}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Settings at Bottom */}
      <div className="p-4 border-t border-border/20">
        <SettingsPanel
          themeMode={themeMode}
          onThemeModeChange={setThemeMode}
          isDarkMode={isDarkMode}
          isNightTime={isNightTime}
          triggerButton={
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-4 py-3 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Gear className="w-5 h-5" />
              <span className="font-medium text-sm">
                {t.nav.settings || 'Settings'}
              </span>
            </Button>
          }
        />
      </div>
    </aside>
  );
}
