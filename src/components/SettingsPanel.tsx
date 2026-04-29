import { ThemeMode } from '@/lib/types';
import { AppLanguage, APP_LANGUAGES, getLanguageLabel } from '@/lib/i18n';
import { useLanguage } from '@/hooks/use-language.tsx';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
import { 
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
  Envelope,
  Detective,
  Pen,
  Palette,
  Images
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AccordionSettingsSection } from './AccordionSettingsSection';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getCurrentUser, type AppUser } from '@/lib/auth-client';
import { useSettingsPreferences } from '@/hooks/use-settings-preferences';
import { useAIQuota } from '@/hooks/use-ai-quota';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { clearMomentsCache } from '@/lib/moments-prompt';
import * as db from '@/lib/db';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BrandMark } from '@/components/BrandMark';

interface SettingsPanelProps {
  themeMode?: ThemeMode;
  onThemeModeChange?: (mode: ThemeMode) => void;
  isDarkMode?: boolean;
  isNightTime?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: React.ReactNode;
}

export function SettingsPanel({ 
  themeMode, 
  onThemeModeChange, 
  isDarkMode,
  isNightTime,
  open,
  onOpenChange,
  triggerButton
}: SettingsPanelProps) {
  const theme = useTheme();
  const { user: authUser, signOut, getToken } = useAuth();
  const resolvedThemeMode = themeMode ?? theme.themeMode;
  const resolvedOnThemeModeChange = onThemeModeChange ?? theme.setThemeMode;
  const resolvedIsDarkMode = isDarkMode ?? theme.isDarkMode;
  const resolvedIsNightTime = isNightTime ?? theme.isNightTime;
  const showTrigger = triggerButton !== undefined || open === undefined;
  const [user, setUser] = useState<AppUser | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [momentsEnabled, setMomentsEnabled] = useLocalStorage<boolean>('moments:enabled:v1', false);
  const {
    preferences,
    personalVoiceSample,
    updatePreference,
    setPersonalVoiceSample,
  } = useSettingsPreferences();
  
  // State for managing expanded sections
  const [expandedSections, setExpandedSections] = useState({
    appearance: true,
    writingStyle: false,
    notifications: false,
    dataPrivacy: false,
    about: false
  });
  
  const { language, setLanguage, autoDetect, setAutoDetect, t } = useLanguage();
  const quota = useAIQuota();

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
    }).catch(() => {
      setUser(null);
    });
  }, []);

  const currentPreferences = preferences;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onOpenChange?.(false);
      toast.success('Signed out');
    } catch (err) {
      console.error('Sign out failed', err);
      toast.error('Could not sign out');
    }
  };

  const handleExport = async () => {
    if (!authUser?.id) {
      toast.error('Sign in to export your memories');
      return;
    }
    setIsExporting(true);
    try {
      const [entries, chapters, books] = await Promise.all([
        db.fetchEntries(authUser.id),
        db.fetchChapters(authUser.id),
        db.fetchBooks(authUser.id),
      ]);
      const payload = {
        exported_at: new Date().toISOString(),
        user_id: authUser.id,
        entries,
        chapters,
        books,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `tightly-export-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Export ready');
    } catch (err) {
      console.error('Export failed', err);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const token = getToken();
    if (!token) {
      toast.error('Sign in to delete your account');
      return;
    }
    setIsDeleting(true);
    try {
      const resp = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || `Delete failed (${resp.status})`);
      }
      toast.success('Account deleted');
      setDeleteOpen(false);
      await signOut();
      onOpenChange?.(false);
    } catch (err) {
      console.error('Account deletion failed', err);
      toast.error(err instanceof Error ? err.message : 'Account deletion failed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <SheetTrigger asChild>
          {triggerButton || (
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
          )}
        </SheetTrigger>
      )}
      <SheetContent className="bg-card/95 backdrop-blur-xl border-border/50 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">{t.settings.title}</SheetTitle>
          <SheetDescription>
            {t.settings.description}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {/* User Profile Card */}
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

          {/* Collapsible Sections */}

          <AccordionSettingsSection
            sectionKey="appearance"
            icon={<Palette weight="duotone" className="w-5 h-5 text-muted-foreground" />}
            title={t.settings.appearance}
            isExpanded={expandedSections.appearance}
            onToggle={toggleSection}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">{t.settings.currentMode}</span>
                <span className="flex items-center gap-2 text-sm font-medium">
                  {resolvedIsDarkMode ? (
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

            {resolvedThemeMode === 'auto' && (
              <p className="text-xs text-muted-foreground px-1">
                {resolvedIsNightTime 
                  ? "It's after sunset – night mode is active" 
                  : "It's daytime – light mode is active"}
              </p>
            )}

            <RadioGroup 
              value={resolvedThemeMode} 
              onValueChange={(v) => resolvedOnThemeModeChange(v as ThemeMode)}
              className="space-y-2"
            >
              <motion.label 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  resolvedThemeMode === 'auto' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border/50 hover:border-border'
                }`}
              >
                <RadioGroupItem value="auto" id="auto" className="sr-only" />
                <div className={`p-2.5 rounded-lg ${resolvedThemeMode === 'auto' ? 'bg-primary/20' : 'bg-muted/50'}`}>
                  <CircleHalf weight="duotone" className={`w-5 h-5 ${resolvedThemeMode === 'auto' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{t.settings.automatic}</p>
                  <p className="text-xs text-muted-foreground">{t.settings.automaticDesc}</p>
                </div>
                {resolvedThemeMode === 'auto' && (
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
                  resolvedThemeMode === 'light' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border/50 hover:border-border'
                }`}
              >
                <RadioGroupItem value="light" id="light" className="sr-only" />
                <div className={`p-2.5 rounded-lg ${resolvedThemeMode === 'light' ? 'bg-amber-500/20' : 'bg-muted/50'}`}>
                  <Sun weight="duotone" className={`w-5 h-5 ${resolvedThemeMode === 'light' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{t.settings.alwaysLight}</p>
                  <p className="text-xs text-muted-foreground">{t.settings.alwaysLightDesc}</p>
                </div>
                {resolvedThemeMode === 'light' && (
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
                  resolvedThemeMode === 'dark' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border/50 hover:border-border'
                }`}
              >
                <RadioGroupItem value="dark" id="dark" className="sr-only" />
                <div className={`p-2.5 rounded-lg ${resolvedThemeMode === 'dark' ? 'bg-primary/20' : 'bg-muted/50'}`}>
                  <Moon weight="duotone" className={`w-5 h-5 ${resolvedThemeMode === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{t.settings.alwaysNight}</p>
                  <p className="text-xs text-muted-foreground">{t.settings.alwaysNightDesc}</p>
                </div>
                {resolvedThemeMode === 'dark' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                )}
              </motion.label>
            </RadioGroup>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe weight="duotone" className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.settings.language}
                </h4>
              </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground">
                    <Detective weight="duotone" className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.settings.autoDetect}</p>
                    <p className="text-xs text-muted-foreground">{t.settings.autoDetectDesc}</p>
                  </div>
                </div>
                <Switch 
                  checked={autoDetect}
                  onCheckedChange={setAutoDetect}
                />
              </div>

              <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${autoDetect ? 'opacity-50' : 'hover:bg-muted/30'}`}>
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
                  value={language}
                  onValueChange={(v) => setLanguage(v as AppLanguage)}
                  disabled={autoDetect}
                >
                  <SelectTrigger className="w-[140px] h-9 text-sm">
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        <span>{APP_LANGUAGES.find(l => l.code === language)?.flag}</span>
                        <span>{getLanguageLabel(language)}</span>
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
            </div>
            </div>
            </div>
          </AccordionSettingsSection>

          <AccordionSettingsSection
            sectionKey="writingStyle"
            icon={<Pen weight="duotone" className="w-5 h-5 text-muted-foreground" />}
            title="My Writing Voice"
            isExpanded={expandedSections.writingStyle}
            onToggle={toggleSection}
          >
            <div className="space-y-3">
              <div>
                <Textarea
                  value={personalVoiceSample || ''}
                  onChange={(e) => setPersonalVoiceSample(e.target.value)}
                  placeholder="Paste a paragraph or two of how you naturally write — a journal entry, a message to a friend, anything that sounds like you..."
                  className="min-h-32 resize-y text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  We'll match this style when creating your stories
                </p>
              </div>
              {personalVoiceSample && personalVoiceSample.trim().length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPersonalVoiceSample('')}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <Trash weight="duotone" className="w-4 h-4 mr-2" />
                  Clear writing sample
                </Button>
              )}
            </div>
          </AccordionSettingsSection>

          <AccordionSettingsSection
            sectionKey="notifications"
            icon={<Bell weight="duotone" className="w-5 h-5 text-muted-foreground" />}
            title={t.settings.notifications}
            isExpanded={expandedSections.notifications}
            onToggle={toggleSection}
          >
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
              <SettingRow 
                icon={<Shield weight="duotone" className="w-4 h-4" />}
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
          </AccordionSettingsSection>

          <AccordionSettingsSection
            sectionKey="dataPrivacy"
            icon={<Shield weight="duotone" className="w-5 h-5 text-muted-foreground" />}
            title="Data & Privacy"
            isExpanded={expandedSections.dataPrivacy}
            onToggle={toggleSection}
          >
            <div className="space-y-2">
              <SettingRow 
                icon={<Shield weight="duotone" className="w-4 h-4" />}
                label={t.settings.privacy}
                description={t.settings.privacyDesc}
                action={
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setPrivacyOpen(true)}>
                    {t.settings.view}
                  </Button>
                }
              />
              <SettingRow
                icon={<Images weight="duotone" className="w-4 h-4" />}
                label="Photo suggestions"
                description="Scan your photo library on-device to suggest moments to write about. Photo metadata never leaves your device."
                action={
                  <Switch
                    checked={!!momentsEnabled}
                    onCheckedChange={(v) => {
                      setMomentsEnabled(v);
                      if (!v) {
                        clearMomentsCache();
                        toast.success('Photo suggestions disabled');
                      }
                    }}
                  />
                }
              />
              {quota.updatedAt > 0 && (
                <SettingRow
                  icon={<Info weight="duotone" className="w-4 h-4" />}
                  label="AI usage"
                  description={
                    quota.tier === 'premium'
                      ? 'Premium tier'
                      : 'Free tier — resets each day'
                  }
                  action={
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {quota.remainingDay ?? '—'} / day
                    </span>
                  }
                />
              )}
              <SettingRow 
                icon={<Download weight="duotone" className="w-4 h-4" />}
                label={t.settings.exportData}
                description={t.settings.exportDataDesc}
                action={
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleExport} disabled={isExporting || !authUser}>
                    {isExporting ? '…' : t.settings.export}
                  </Button>
                }
              />
              <div className="pt-2 space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={handleSignOut}
                  disabled={!authUser}
                >
                  <SignOut weight="duotone" className="w-4 h-4 mr-3" />
                  {t.settings.signOut}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteOpen(true)}
                  disabled={!authUser}
                >
                  <Trash weight="duotone" className="w-4 h-4 mr-3" />
                  {t.settings.deleteAccount}
                </Button>
              </div>
            </div>
          </AccordionSettingsSection>

          <AccordionSettingsSection
            sectionKey="about"
            icon={<Info weight="duotone" className="w-5 h-5 text-muted-foreground" />}
            title={t.settings.about}
            isExpanded={expandedSections.about}
            onToggle={toggleSection}
          >
            <div className="space-y-2">
              <SettingRow 
                icon={<Info weight="duotone" className="w-4 h-4" />}
                label={t.settings.version}
                description={t.settings.versionDesc}
                action={
                  <span className="text-sm text-muted-foreground">1.0.0</span>
                }
              />
              <SettingRow
                icon={<Envelope weight="duotone" className="w-4 h-4" />}
                label="Send feedback"
                description="Tell us what worked, broke, or could be better"
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setFeedbackOpen(true)}
                  >
                    Write
                  </Button>
                }
              />
              <SettingRow
                icon={<Shield weight="duotone" className="w-4 h-4" />}
                label="Privacy Policy"
                description="How we handle your data"
                action={
                  <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">Open</a>
                  </Button>
                }
              />
              <SettingRow
                icon={<Info weight="duotone" className="w-4 h-4" />}
                label="Terms of Service"
                description="The rules of using Memory Journal"
                action={
                  <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                    <a href="/terms" target="_blank" rel="noopener noreferrer">Open</a>
                  </Button>
                }
              />

              <div className="text-xs text-muted-foreground text-center space-y-1 pt-4">
                <BrandMark size="sm" className="mx-auto mb-2" />
                <p className="font-serif text-sm">Tightly</p>
                <p className="tracking-wide">Hold them tight</p>
              </div>
            </div>
          </AccordionSettingsSection>
        </div>
      </SheetContent>

      <AlertDialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your privacy</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Your memories, photos, and voice samples belong to you. They are stored encrypted in Supabase and only accessible with your account.</p>
                <p>We use AI to help shape your stories. Entry text may be sent to OpenAI for transcription and story drafting. We never sell your data or share it with advertisers.</p>
                <p>You can export everything at any time, or permanently delete your account from this screen.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setPrivacyOpen(false)}>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={(o) => !isDeleting && setDeleteOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your entries, chapters, books, photos, and account. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleteAccount(); }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting…' : 'Delete forever'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={feedbackOpen} onOpenChange={(o) => !isSendingFeedback && setFeedbackOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send feedback</AlertDialogTitle>
            <AlertDialogDescription>
              What's working, what's broken, what's missing? Your note goes straight to the maker.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Tell us anything…"
            className="min-h-[120px] resize-none"
            disabled={isSendingFeedback}
            maxLength={4000}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSendingFeedback}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                const body = feedbackText.trim();
                if (!body) return;
                setIsSendingFeedback(true);
                try {
                  const token = await getToken?.();
                  const res = await fetch('/api/feedback', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                      message: body,
                      context: {
                        path: typeof window !== 'undefined' ? window.location.pathname : '',
                        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                        language,
                      },
                    }),
                  });
                  if (!res.ok) throw new Error(`feedback failed (${res.status})`);
                  toast.success('Thanks — feedback sent');
                  setFeedbackText('');
                  setFeedbackOpen(false);
                } catch (err) {
                  console.error('Feedback submit failed', err);
                  // Fallback: open the user's mail client so nothing is lost.
                  if (typeof window !== 'undefined') {
                    const mail = `mailto:holdthemtightly@gmail.com?subject=${encodeURIComponent('Memory Journal feedback')}&body=${encodeURIComponent(body)}`;
                    window.location.href = mail;
                  }
                  toast.error('Could not send — opened your mail app instead');
                } finally {
                  setIsSendingFeedback(false);
                }
              }}
              disabled={isSendingFeedback || feedbackText.trim().length === 0}
            >
              {isSendingFeedback ? 'Sending…' : 'Send'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
