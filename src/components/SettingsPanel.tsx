import { ThemeMode } from '@/lib/types';
import { AppLanguage, APP_LANGUAGES, getTranslations, getLanguageLabel } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  GearSix, 
  Sun, 
  Moon, 
  CircleHalf, 
  User, 
  Bell, 
  Globe, 
  Shield, 
  Download, 
  Trash, 
  SignOut,
  Info,
  Envelope
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';

interface SettingsPanelProps {
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  isDarkMode: boolean;
  isNightTime: boolean;
}

interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  autoSave: boolean;
  language: AppLanguage;
}

export function SettingsPanel({ 
  themeMode, 
  onThemeModeChange, 
  isDarkMode,
  isNightTime 
}: SettingsPanelProps) {
  const [user, setUser] = useState<{ login: string; avatarUrl: string; email?: string } | null>(null);
  const [preferences, setPreferences] = useKV<UserPreferences>('user-preferences', {
    notifications: true,
    emailUpdates: false,
    autoSave: true,
    language: 'en'
  });

  useEffect(() => {
    window.spark.user().then((u) => {
      if (u) {
        setUser({ login: u.login, avatarUrl: u.avatarUrl, email: u.email });
      }
    }).catch(() => {});
  }, []);

  const updatePreference = (key: keyof UserPreferences, value: boolean | string) => {
    setPreferences((current) => ({
      notifications: current?.notifications ?? true,
      emailUpdates: current?.emailUpdates ?? false,
      autoSave: current?.autoSave ?? true,
      language: current?.language ?? 'en',
      [key]: value
    }));
  };

  const currentPreferences = preferences ?? {
    notifications: true,
    emailUpdates: false,
    autoSave: true,
    language: 'en' as AppLanguage
  };

  const t = getTranslations(currentPreferences.language as AppLanguage);

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
            <User weight="duotone" className="w-5 h-5" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card/95 backdrop-blur-xl border-border/50 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">{t.settings.title}</SheetTitle>
          <SheetDescription>
            {t.settings.description}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border border-border/30">
            <div className="flex items-center gap-4">
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.login}
                  className="w-16 h-16 rounded-full ring-3 ring-primary/30 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center ring-3 ring-border/30">
                  <User weight="duotone" className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg text-foreground truncate">{user?.login || 'Guest User'}</p>
                {user?.email && (
                  <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                    <Envelope weight="duotone" className="w-3.5 h-3.5 flex-shrink-0" />
                    {user.email}
                  </p>
                )}
                <p className="text-xs text-primary mt-1">Premium Member</p>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <User weight="duotone" className="w-4 h-4" />
              {t.settings.account}
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground">
                    <Globe weight="duotone" className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.settings.language}</p>
                    <p className="text-xs text-muted-foreground">{t.settings.languageDesc}</p>
                  </div>
                </div>
                <Select
                  value={currentPreferences.language}
                  onValueChange={(v) => updatePreference('language', v as AppLanguage)}
                >
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        <span>{APP_LANGUAGES.find(l => l.code === currentPreferences.language)?.flag}</span>
                        <span>{getLanguageLabel(currentPreferences.language as AppLanguage)}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {APP_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.nativeLabel}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <SettingRow 
                icon={<Shield weight="duotone" className="w-4 h-4" />}
                label={t.settings.privacy}
                description={t.settings.privacyDesc}
                action={
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    {t.settings.view}
                  </Button>
                }
              />
              <SettingRow 
                icon={<Download weight="duotone" className="w-4 h-4" />}
                label={t.settings.exportData}
                description={t.settings.exportDataDesc}
                action={
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    {t.settings.export}
                  </Button>
                }
              />
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Bell weight="duotone" className="w-4 h-4" />
              {t.settings.notifications}
            </h3>
            
            <div className="space-y-2">
              <SettingRow 
                icon={<Bell weight="duotone" className="w-4 h-4" />}
                label={t.settings.pushNotifications}
                description={t.settings.pushNotificationsDesc}
                action={
                  <Switch 
                    checked={currentPreferences.notifications}
                    onCheckedChange={(v) => updatePreference('notifications', v)}
                  />
                }
              />
              <SettingRow 
                icon={<Envelope weight="duotone" className="w-4 h-4" />}
                label={t.settings.emailUpdates}
                description={t.settings.emailUpdatesDesc}
                action={
                  <Switch 
                    checked={currentPreferences.emailUpdates}
                    onCheckedChange={(v) => updatePreference('emailUpdates', v)}
                  />
                }
              />
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <GearSix weight="duotone" className="w-4 h-4" />
              {t.settings.preferences}
            </h3>
            
            <div className="space-y-2">
              <SettingRow 
                icon={<GearSix weight="duotone" className="w-4 h-4" />}
                label={t.settings.autoSave}
                description={t.settings.autoSaveDesc}
                action={
                  <Switch 
                    checked={currentPreferences.autoSave}
                    onCheckedChange={(v) => updatePreference('autoSave', v)}
                  />
                }
              />
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              {isDarkMode ? <Moon weight="duotone" className="w-4 h-4" /> : <Sun weight="duotone" className="w-4 h-4" />}
              {t.settings.appearance}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">{t.settings.currentMode}</span>
                <span className="flex items-center gap-2 text-sm font-medium">
                  {isDarkMode ? (
                    <>
                      <Moon weight="fill" className="w-4 h-4 text-primary" />
                      {t.settings.night}
                    </>
                  ) : (
                    <>
                      <Sun weight="fill" className="w-4 h-4 text-amber-500" />
                      {t.settings.day}
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
                    <p className="font-medium text-foreground">{t.settings.automatic}</p>
                    <p className="text-xs text-muted-foreground">{t.settings.automaticDesc}</p>
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
                    <p className="font-medium text-foreground">{t.settings.alwaysLight}</p>
                    <p className="text-xs text-muted-foreground">{t.settings.alwaysLightDesc}</p>
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
                    <p className="font-medium text-foreground">{t.settings.alwaysNight}</p>
                    <p className="text-xs text-muted-foreground">{t.settings.alwaysNightDesc}</p>
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

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Info weight="duotone" className="w-4 h-4" />
              {t.settings.about}
            </h3>
            
            <div className="space-y-2">
              <SettingRow 
                icon={<Info weight="duotone" className="w-4 h-4" />}
                label={t.settings.version}
                description={t.settings.versionDesc}
                action={
                  <span className="text-sm text-muted-foreground">1.0.0</span>
                }
              />
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <SignOut weight="duotone" className="w-4 h-4 mr-3" />
              {t.settings.signOut}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            >
              <Trash weight="duotone" className="w-4 h-4 mr-3" />
              {t.settings.deleteAccount}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1 pt-4">
            <p className="font-serif text-sm">Tightly</p>
            <p className="tracking-wide">Hold them tight</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SettingRow({ 
  icon, 
  label, 
  description, 
  action 
}: { 
  icon: React.ReactNode;
  label: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
