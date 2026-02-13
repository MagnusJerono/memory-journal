import { useState } from 'react';
import { AppView, Prompt, PromptCategory, DEFAULT_PROMPTS, PROMPT_CATEGORIES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sparkle, ArrowRight, NotePencil } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { SettingsPanel } from '@/components/SettingsPanel';
import { LogoHomeButton } from '@/components/LogoHomeButton';
import { NavigationMenu } from '@/components/navigation/NavigationMenu';
import { useLanguage } from '@/hooks/use-language.tsx';
import { useTheme } from '@/contexts/ThemeContext';

interface PromptsScreenProps {
  onNavigate: (view: AppView) => void;
}

export function PromptsScreen({ onNavigate }: PromptsScreenProps) {
  const { themeMode, setThemeMode, isDarkMode, isNightTime } = useTheme();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);
  
  const todaysPrompt = DEFAULT_PROMPTS[Math.floor(Date.now() / 86400000) % DEFAULT_PROMPTS.length];
  
  const filteredPrompts = selectedCategory
    ? DEFAULT_PROMPTS.filter(p => p.category === selectedCategory)
    : DEFAULT_PROMPTS;

  const handleSelectPrompt = (prompt: Prompt) => {
    onNavigate({ type: 'prompts-new', promptId: prompt.id });
  };

  const handleCustomMemory = () => {
    onNavigate({ type: 'prompts-new' });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoHomeButton 
              isDarkMode={isDarkMode} 
              onClick={() => onNavigate({ type: 'home' })} 
              size="sm"
            />
            <span className="text-border/50">|</span>
            <h1 className="font-serif text-lg sm:text-xl font-semibold text-foreground">{t.home.newMemory}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <NavigationMenu 
                onNavigate={onNavigate} 
                currentTab="prompts" 
                isDarkMode={isDarkMode} 
              />
            </div>
            <SettingsPanel
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
              isDarkMode={isDarkMode}
              isNightTime={isNightTime}
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-sm font-medium text-muted-foreground mb-3">{t.prompts.description}</p>
          
          <motion.button
            onClick={handleCustomMemory}
            className="w-full p-5 rounded-2xl bg-gradient-to-br from-accent/15 via-primary/5 to-accent/10 border border-accent/25 hover:border-accent/40 transition-all text-left group"
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-accent/20">
                <NotePencil weight="duotone" className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                  {t.home.customMemory}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t.home.customMemoryDesc}
                </p>
              </div>
              <ArrowRight weight="bold" className="w-5 h-5 text-muted-foreground/50 group-hover:text-accent transition-all mt-1" />
            </div>
          </motion.button>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <p className="text-sm font-medium text-muted-foreground mb-3">{t.prompts.daily}</p>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 border border-primary/20">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 rounded-xl bg-primary/20">
                <Sparkle weight="fill" className="w-6 h-6 text-primary" />
              </div>
              <blockquote className="font-serif text-xl text-foreground leading-relaxed flex-1">
                "{todaysPrompt.text}"
              </blockquote>
            </div>
            <Button 
              onClick={() => handleSelectPrompt(todaysPrompt)}
              className="w-full shadow-lg shadow-primary/20"
              size="lg"
            >
              {t.prompts.useThis}
              <ArrowRight className="ml-2" weight="bold" />
            </Button>
          </div>
        </motion.section>

        <section>
          <p className="text-sm font-medium text-muted-foreground mb-3">{t.prompts.categories}</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary'
              }`}
            >
              {t.prompts.allPrompts}
            </button>
            {PROMPT_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="space-y-3">
            {filteredPrompts.map((prompt, index) => (
              <motion.button
                key={prompt.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleSelectPrompt(prompt)}
                className="w-full p-4 rounded-xl bg-card/70 backdrop-blur-sm border border-border/30 hover:border-primary/30 hover:bg-card/90 transition-all text-left group"
              >
                <p className="text-foreground group-hover:text-primary transition-colors">
                  "{prompt.text}"
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {PROMPT_CATEGORIES.find(c => c.value === prompt.category)?.emoji}
                    {PROMPT_CATEGORIES.find(c => c.value === prompt.category)?.label}
                  </span>
                  <ArrowRight weight="bold" className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
