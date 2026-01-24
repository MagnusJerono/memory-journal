export type AppLanguage = 'en' | 'de' | 'es' | 'fr' | 'pt' | 'zh' | 'ja';

export const APP_LANGUAGES: { code: AppLanguage; label: string; nativeLabel: string; flag: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: '🇧🇷' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', flag: '🇨🇳' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵' },
];

type TranslationKeys = {
  nav: { home: string; prompts: string; chapters: string; search: string; print: string };
  settings: { title: string; description: string; language: string; languageDesc: string; account: string; privacy: string; privacyDesc: string; exportData: string; exportDataDesc: string; notifications: string; pushNotifications: string; pushNotificationsDesc: string; emailUpdates: string; emailUpdatesDesc: string; preferences: string; autoSave: string; autoSaveDesc: string; appearance: string; currentMode: string; night: string; day: string; automatic: string; automaticDesc: string; alwaysLight: string; alwaysLightDesc: string; alwaysNight: string; alwaysNightDesc: string; about: string; version: string; versionDesc: string; signOut: string; deleteAccount: string; view: string; export: string };
  home: { newMemory: string; recentMemories: string; starred: string; noMemories: string; startJourney: string };
  common: { save: string; cancel: string; delete: string; edit: string; back: string; search: string; loading: string };
};

const translations: Record<AppLanguage, TranslationKeys> = {
  en: {
    nav: { home: 'Home', prompts: 'Prompts', chapters: 'Chapters', search: 'Search', print: 'Print' },
    settings: { title: 'Profile & Settings', description: 'Manage your Tightly experience', language: 'Language', languageDesc: 'App display language', account: 'Account', privacy: 'Privacy', privacyDesc: 'Manage your data', exportData: 'Export Data', exportDataDesc: 'Download your memories', notifications: 'Notifications', pushNotifications: 'Push Notifications', pushNotificationsDesc: 'Get notified about memories', emailUpdates: 'Email Updates', emailUpdatesDesc: 'Weekly memory digest', preferences: 'Preferences', autoSave: 'Auto-save', autoSaveDesc: 'Save entries automatically', appearance: 'Appearance', currentMode: 'Current mode', night: 'Night', day: 'Day', automatic: 'Automatic', automaticDesc: 'Switches at sunset & sunrise', alwaysLight: 'Always Light', alwaysLightDesc: 'Bright & airy daytime sky', alwaysNight: 'Always Night', alwaysNightDesc: 'Stars & aurora at all times', about: 'About', version: 'Version', versionDesc: 'Current app version', signOut: 'Sign Out', deleteAccount: 'Delete Account', view: 'View', export: 'Export' },
    home: { newMemory: 'New Memory', recentMemories: 'Recent Memories', starred: 'Starred', noMemories: 'No memories yet', startJourney: 'Start your journey' },
    common: { save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', back: 'Back', search: 'Search', loading: 'Loading...' }
  },
  de: {
    nav: { home: 'Start', prompts: 'Impulse', chapters: 'Kapitel', search: 'Suche', print: 'Drucken' },
    settings: { title: 'Profil & Einstellungen', description: 'Verwalte dein Tightly-Erlebnis', language: 'Sprache', languageDesc: 'App-Anzeigesprache', account: 'Konto', privacy: 'Datenschutz', privacyDesc: 'Verwalte deine Daten', exportData: 'Daten exportieren', exportDataDesc: 'Lade deine Erinnerungen herunter', notifications: 'Benachrichtigungen', pushNotifications: 'Push-Benachrichtigungen', pushNotificationsDesc: 'Werde über Erinnerungen benachrichtigt', emailUpdates: 'E-Mail-Updates', emailUpdatesDesc: 'Wöchentliche Zusammenfassung', preferences: 'Einstellungen', autoSave: 'Auto-Speichern', autoSaveDesc: 'Einträge automatisch speichern', appearance: 'Erscheinungsbild', currentMode: 'Aktueller Modus', night: 'Nacht', day: 'Tag', automatic: 'Automatisch', automaticDesc: 'Wechselt bei Sonnenuntergang & -aufgang', alwaysLight: 'Immer Hell', alwaysLightDesc: 'Heller Tageshimmel', alwaysNight: 'Immer Dunkel', alwaysNightDesc: 'Sterne & Aurora jederzeit', about: 'Über', version: 'Version', versionDesc: 'Aktuelle App-Version', signOut: 'Abmelden', deleteAccount: 'Konto löschen', view: 'Ansehen', export: 'Exportieren' },
    home: { newMemory: 'Neue Erinnerung', recentMemories: 'Letzte Erinnerungen', starred: 'Favoriten', noMemories: 'Noch keine Erinnerungen', startJourney: 'Starte deine Reise' },
    common: { save: 'Speichern', cancel: 'Abbrechen', delete: 'Löschen', edit: 'Bearbeiten', back: 'Zurück', search: 'Suchen', loading: 'Laden...' }
  },
  es: {
    nav: { home: 'Inicio', prompts: 'Sugerencias', chapters: 'Capítulos', search: 'Buscar', print: 'Imprimir' },
    settings: { title: 'Perfil y Ajustes', description: 'Gestiona tu experiencia Tightly', language: 'Idioma', languageDesc: 'Idioma de la aplicación', account: 'Cuenta', privacy: 'Privacidad', privacyDesc: 'Gestiona tus datos', exportData: 'Exportar Datos', exportDataDesc: 'Descarga tus recuerdos', notifications: 'Notificaciones', pushNotifications: 'Notificaciones Push', pushNotificationsDesc: 'Recibe alertas sobre recuerdos', emailUpdates: 'Actualizaciones por Email', emailUpdatesDesc: 'Resumen semanal', preferences: 'Preferencias', autoSave: 'Auto-guardar', autoSaveDesc: 'Guardar entradas automáticamente', appearance: 'Apariencia', currentMode: 'Modo actual', night: 'Noche', day: 'Día', automatic: 'Automático', automaticDesc: 'Cambia al atardecer y amanecer', alwaysLight: 'Siempre Claro', alwaysLightDesc: 'Cielo diurno brillante', alwaysNight: 'Siempre Oscuro', alwaysNightDesc: 'Estrellas y aurora siempre', about: 'Acerca de', version: 'Versión', versionDesc: 'Versión actual de la app', signOut: 'Cerrar Sesión', deleteAccount: 'Eliminar Cuenta', view: 'Ver', export: 'Exportar' },
    home: { newMemory: 'Nuevo Recuerdo', recentMemories: 'Recuerdos Recientes', starred: 'Favoritos', noMemories: 'Sin recuerdos aún', startJourney: 'Comienza tu viaje' },
    common: { save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', back: 'Volver', search: 'Buscar', loading: 'Cargando...' }
  },
  fr: {
    nav: { home: 'Accueil', prompts: 'Inspirations', chapters: 'Chapitres', search: 'Rechercher', print: 'Imprimer' },
    settings: { title: 'Profil & Paramètres', description: 'Gérez votre expérience Tightly', language: 'Langue', languageDesc: "Langue d'affichage", account: 'Compte', privacy: 'Confidentialité', privacyDesc: 'Gérez vos données', exportData: 'Exporter les Données', exportDataDesc: 'Téléchargez vos souvenirs', notifications: 'Notifications', pushNotifications: 'Notifications Push', pushNotificationsDesc: 'Recevez des alertes', emailUpdates: 'Mises à jour par Email', emailUpdatesDesc: 'Résumé hebdomadaire', preferences: 'Préférences', autoSave: 'Sauvegarde auto', autoSaveDesc: 'Sauvegarder automatiquement', appearance: 'Apparence', currentMode: 'Mode actuel', night: 'Nuit', day: 'Jour', automatic: 'Automatique', automaticDesc: 'Change au coucher/lever du soleil', alwaysLight: 'Toujours Clair', alwaysLightDesc: 'Ciel de jour lumineux', alwaysNight: 'Toujours Sombre', alwaysNightDesc: 'Étoiles et aurores toujours', about: 'À propos', version: 'Version', versionDesc: 'Version actuelle', signOut: 'Déconnexion', deleteAccount: 'Supprimer le Compte', view: 'Voir', export: 'Exporter' },
    home: { newMemory: 'Nouveau Souvenir', recentMemories: 'Souvenirs Récents', starred: 'Favoris', noMemories: 'Aucun souvenir encore', startJourney: 'Commencez votre voyage' },
    common: { save: 'Sauvegarder', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', back: 'Retour', search: 'Rechercher', loading: 'Chargement...' }
  },
  pt: {
    nav: { home: 'Início', prompts: 'Sugestões', chapters: 'Capítulos', search: 'Buscar', print: 'Imprimir' },
    settings: { title: 'Perfil e Configurações', description: 'Gerencie sua experiência Tightly', language: 'Idioma', languageDesc: 'Idioma do aplicativo', account: 'Conta', privacy: 'Privacidade', privacyDesc: 'Gerencie seus dados', exportData: 'Exportar Dados', exportDataDesc: 'Baixe suas memórias', notifications: 'Notificações', pushNotifications: 'Notificações Push', pushNotificationsDesc: 'Receba alertas sobre memórias', emailUpdates: 'Atualizações por Email', emailUpdatesDesc: 'Resumo semanal', preferences: 'Preferências', autoSave: 'Salvar automático', autoSaveDesc: 'Salvar entradas automaticamente', appearance: 'Aparência', currentMode: 'Modo atual', night: 'Noite', day: 'Dia', automatic: 'Automático', automaticDesc: 'Muda ao pôr/nascer do sol', alwaysLight: 'Sempre Claro', alwaysLightDesc: 'Céu diurno brilhante', alwaysNight: 'Sempre Escuro', alwaysNightDesc: 'Estrelas e aurora sempre', about: 'Sobre', version: 'Versão', versionDesc: 'Versão atual do app', signOut: 'Sair', deleteAccount: 'Excluir Conta', view: 'Ver', export: 'Exportar' },
    home: { newMemory: 'Nova Memória', recentMemories: 'Memórias Recentes', starred: 'Favoritos', noMemories: 'Nenhuma memória ainda', startJourney: 'Comece sua jornada' },
    common: { save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar', back: 'Voltar', search: 'Buscar', loading: 'Carregando...' }
  },
  zh: {
    nav: { home: '首页', prompts: '提示', chapters: '章节', search: '搜索', print: '打印' },
    settings: { title: '个人资料与设置', description: '管理您的Tightly体验', language: '语言', languageDesc: '应用显示语言', account: '账户', privacy: '隐私', privacyDesc: '管理您的数据', exportData: '导出数据', exportDataDesc: '下载您的回忆', notifications: '通知', pushNotifications: '推送通知', pushNotificationsDesc: '获取回忆提醒', emailUpdates: '邮件更新', emailUpdatesDesc: '每周回忆摘要', preferences: '偏好设置', autoSave: '自动保存', autoSaveDesc: '自动保存条目', appearance: '外观', currentMode: '当前模式', night: '夜间', day: '日间', automatic: '自动', automaticDesc: '日落日出自动切换', alwaysLight: '始终明亮', alwaysLightDesc: '明亮的日间天空', alwaysNight: '始终夜间', alwaysNightDesc: '永远星空极光', about: '关于', version: '版本', versionDesc: '当前应用版本', signOut: '退出登录', deleteAccount: '删除账户', view: '查看', export: '导出' },
    home: { newMemory: '新回忆', recentMemories: '最近回忆', starred: '收藏', noMemories: '暂无回忆', startJourney: '开始您的旅程' },
    common: { save: '保存', cancel: '取消', delete: '删除', edit: '编辑', back: '返回', search: '搜索', loading: '加载中...' }
  },
  ja: {
    nav: { home: 'ホーム', prompts: 'プロンプト', chapters: 'チャプター', search: '検索', print: '印刷' },
    settings: { title: 'プロフィールと設定', description: 'Tightly体験を管理', language: '言語', languageDesc: 'アプリの表示言語', account: 'アカウント', privacy: 'プライバシー', privacyDesc: 'データを管理', exportData: 'データをエクスポート', exportDataDesc: '思い出をダウンロード', notifications: '通知', pushNotifications: 'プッシュ通知', pushNotificationsDesc: '思い出の通知を受け取る', emailUpdates: 'メール更新', emailUpdatesDesc: '週間ダイジェスト', preferences: '設定', autoSave: '自動保存', autoSaveDesc: 'エントリを自動保存', appearance: '外観', currentMode: '現在のモード', night: '夜', day: '昼', automatic: '自動', automaticDesc: '日の出と日没で切り替え', alwaysLight: '常にライト', alwaysLightDesc: '明るい昼間の空', alwaysNight: '常にダーク', alwaysNightDesc: '常に星空とオーロラ', about: '情報', version: 'バージョン', versionDesc: '現在のアプリバージョン', signOut: 'サインアウト', deleteAccount: 'アカウント削除', view: '表示', export: 'エクスポート' },
    home: { newMemory: '新しい思い出', recentMemories: '最近の思い出', starred: 'お気に入り', noMemories: '思い出はまだありません', startJourney: '旅を始めましょう' },
    common: { save: '保存', cancel: 'キャンセル', delete: '削除', edit: '編集', back: '戻る', search: '検索', loading: '読み込み中...' }
  }
};

export function getTranslations(lang: AppLanguage): TranslationKeys {
  return translations[lang] || translations.en;
}

export function getLanguageLabel(code: AppLanguage): string {
  const lang = APP_LANGUAGES.find(l => l.code === code);
  return lang ? lang.nativeLabel : 'English';
}
