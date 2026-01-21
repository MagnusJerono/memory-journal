import { ThemeMode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { GearSix, Sun, Moon, CircleHalf, User } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SettingsPanelProps {
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  isDarkMode: boolean;
  isNightTime: boolean;
}

export function SettingsPanel({ 
  themeMode, 
  onThemeModeChange, 
  isDarkMode,
  isNightTime 
}: SettingsPanelProps) {
  const [user, setUser] = useState<{ login: string; avatarUrl: string } | null>(null);

  useEffect(() => {
    window.spark.user().then((u) => {
      if (u) {
        setUser({ login: u.login, avatarUrl: u.avatarUrl });
      }
    }).catch(() => {});
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 relative"
        >
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.login}
              className="w-7 h-7 rounded-full ring-2 ring-border/50"
            />
          ) : (
            <GearSix weight="duotone" className="w-5 h-5" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card/95 backdrop-blur-xl border-border/50">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">Settings</SheetTitle>
          <SheetDescription>
            Customize your Tightly experience
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-8 space-y-8">
          {user && (
            <>
              <div className="flex items-center gap-4">
                <img 
                  src={user.avatarUrl} 
                  alt={user.login}
                  className="w-14 h-14 rounded-full ring-2 ring-primary/30"
                />
                <div>
                  <p className="font-semibold text-foreground">{user.login}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User weight="duotone" className="w-3.5 h-3.5" />
                    Profile
                  </p>
                </div>
              </div>
              <Separator className="bg-border/50" />
            </>
          )}

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Appearance
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Current mode</span>
                <span className="flex items-center gap-2 text-sm font-medium">
                  {isDarkMode ? (
                    <>
                      <Moon weight="fill" className="w-4 h-4 text-primary" />
                      Night
                    </>
                  ) : (
                    <>
                      <Sun weight="fill" className="w-4 h-4 text-amber-500" />
                      Day
                    </>
                  )}
                </span>
              </div>

              {themeMode === 'auto' && (
                <p className="text-xs text-muted-foreground px-1">
                  {isNightTime 
                    ? "It's after sunset – night mode is active" 
                    : "It's daytime – light mode is active"}
                </p>
              )}

              <RadioGroup 
                value={themeMode} 
                onValueChange={(v) => onThemeModeChange(v as ThemeMode)}
                className="space-y-2"
              >
                <motion.label 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    themeMode === 'auto' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  <RadioGroupItem value="auto" id="auto" className="sr-only" />
                  <div className={`p-2.5 rounded-lg ${themeMode === 'auto' ? 'bg-primary/20' : 'bg-muted/50'}`}>
                    <CircleHalf weight="duotone" className={`w-5 h-5 ${themeMode === 'auto' ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Automatic</p>
                    <p className="text-xs text-muted-foreground">Switches at sunset & sunrise</p>
                  </div>
                  {themeMode === 'auto' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  )}
                </motion.label>

                <motion.label 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    themeMode === 'light' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  <RadioGroupItem value="light" id="light" className="sr-only" />
                  <div className={`p-2.5 rounded-lg ${themeMode === 'light' ? 'bg-amber-500/20' : 'bg-muted/50'}`}>
                    <Sun weight="duotone" className={`w-5 h-5 ${themeMode === 'light' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Always Light</p>
                    <p className="text-xs text-muted-foreground">Bright & airy daytime sky</p>
                  </div>
                  {themeMode === 'light' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  )}
                </motion.label>

                <motion.label 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    themeMode === 'dark' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  <RadioGroupItem value="dark" id="dark" className="sr-only" />
                  <div className={`p-2.5 rounded-lg ${themeMode === 'dark' ? 'bg-primary/20' : 'bg-muted/50'}`}>
                    <Moon weight="duotone" className={`w-5 h-5 ${themeMode === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Always Night</p>
                    <p className="text-xs text-muted-foreground">Stars & aurora at all times</p>
                  </div>
                  {themeMode === 'dark' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  )}
                </motion.label>
              </RadioGroup>
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p className="font-medium">Tightly</p>
            <p>Hold on to your memories</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
