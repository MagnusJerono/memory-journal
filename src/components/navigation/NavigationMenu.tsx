import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { 
  List, 
  Books, 
  Printer, 
  House,
  MagnifyingGlass,
  Sparkle,
  CaretRight
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { AppView, NavigationTab } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language.tsx';

interface NavigationMenuProps {
  onNavigate: (view: AppView) => void;
  currentTab: NavigationTab;
  isDarkMode: boolean;
}

export function NavigationMenu({ onNavigate, currentTab, isDarkMode }: NavigationMenuProps) {
  const { t } = useLanguage();
  
  const menuItems = [
    { 
      id: 'home' as NavigationTab, 
      labelKey: 'home' as const, 
      icon: House, 
      view: { type: 'home' } as AppView,
      descriptionKey: 'home' as const
    },
    { 
      id: 'prompts' as NavigationTab, 
      labelKey: 'prompts' as const, 
      icon: Sparkle, 
      view: { type: 'prompts' } as AppView,
      descriptionKey: 'prompts' as const
    },
    { 
      id: 'library' as NavigationTab, 
      labelKey: 'library' as const, 
      icon: Books, 
      view: { type: 'library' } as AppView,
      descriptionKey: 'library' as const
    },
    {
      id: 'home' as NavigationTab,
      labelKey: 'search' as const,
      icon: MagnifyingGlass,
      view: { type: 'search' } as AppView,
      descriptionKey: 'search' as const,
    },
    { 
      id: 'print' as NavigationTab, 
      labelKey: 'print' as const, 
      icon: Printer, 
      view: { type: 'print' } as AppView,
      descriptionKey: 'print' as const
    },
  ];

  const getDescription = (key: string) => {
    switch (key) {
      case 'home': return t.home.recentMemories;
      case 'prompts': return t.prompts.description;
      case 'library': return t.chapters.description;
      case 'search': return t.search.title;
      case 'print': return t.print.description;
      default: return '';
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        >
          <List weight="bold" className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="bg-card/95 backdrop-blur-xl border-border/50 w-[280px] sm:w-[320px]"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="font-serif text-2xl">Menu</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group ${
                  isActive 
                    ? 'bg-primary/15 border border-primary/30' 
                    : 'hover:bg-muted/40 border border-transparent'
                }`}
              >
                <div className={`p-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-primary/20' : 'bg-muted/50 group-hover:bg-muted/70'
                }`}>
                  <Icon 
                    weight={isActive ? 'fill' : 'duotone'} 
                    className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {t.nav[item.labelKey]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {getDescription(item.descriptionKey)}
                  </p>
                </div>
                <CaretRight 
                  weight="bold" 
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground/50 group-hover:text-muted-foreground'
                  }`} 
                />
              </motion.button>
            );
          })}
        </div>

        <Separator className="my-6 bg-border/50" />

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p 
            className="text-lg"
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontWeight: 700,
              color: isDarkMode ? '#e0d4f7' : '#5b4ba8',
            }}
          >
            tightly
          </p>
          <p 
            className="tracking-wide italic text-[10px]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: isDarkMode ? '#c8b8e8' : '#5f4f98',
            }}
          >
            Hold them tight
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
