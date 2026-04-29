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

export function detectBrowserLanguage(): AppLanguage {
  const browserLangs = navigator.languages || [navigator.language];
  
  for (const browserLang of browserLangs) {
    const langCode = browserLang.toLowerCase().split('-')[0];
    const matched = APP_LANGUAGES.find(l => l.code === langCode);
    if (matched) {
      return matched.code;
    }
  }
  
  return 'en';
}

type TranslationKeys = {
  nav: { home: string; prompts: string; chapters: string; timeline: string; search: string; print: string; library: string };
  settings: { 
    title: string; description: string; language: string; languageDesc: string; autoDetect: string; autoDetectDesc: string;
    account: string; privacy: string; privacyDesc: string; exportData: string; exportDataDesc: string; 
    notifications: string; pushNotifications: string; pushNotificationsDesc: string; emailUpdates: string; emailUpdatesDesc: string; 
    preferences: string; autoSave: string; autoSaveDesc: string; 
    appearance: string; currentMode: string; night: string; day: string; system: string; systemDesc: string; automatic: string; automaticDesc: string; 
    alwaysLight: string; alwaysLightDesc: string; alwaysNight: string; alwaysNightDesc: string; 
    about: string; version: string; versionDesc: string; signOut: string; deleteAccount: string; view: string; export: string 
  };
  home: { 
    newMemory: string; recentMemories: string; starred: string; noMemories: string; startJourney: string; 
    customMemory: string; customMemoryDesc: string; usePrompt: string; usePromptDesc: string;
    chapters: string; viewAll: string; memories: string; continueWriting: string; draft: string; lastEdited: string;
    journalAwaits: string; journalAwaitsDesc: string; createChapters: string;
  };
  prompts: {
    title: string; description: string; categories: string; allPrompts: string; useThis: string;
    daily: string; refresh: string; reflection: string; gratitude: string; dreams: string; travel: string; relationships: string;
  };
  chapters: {
    title: string; description: string; newChapter: string; editChapter: string; deleteChapter: string;
    noChapters: string; noChaptersDesc: string; name: string; icon: string; color: string; 
    entries: string; pinned: string; archived: string;
  };
  timeline: {
    title: string; empty: string; emptyDesc: string; memories: string;
  };
  search: {
    title: string; placeholder: string; noResults: string; noResultsDesc: string; recentSearches: string;
  };
  print: {
    title: string; description: string; createBook: string; selectEntries: string; chooseTheme: string;
    preview: string; download: string; noBooks: string; noBooksDesc: string;
  };
  entry: {
    title: string; untitled: string; date: string; transcript: string; transcriptPlaceholder: string;
    photos: string; addPhotos: string; dropPhotos: string; generate: string; generating: string;
    highlights: string; story: string; tags: string; questions: string; uncertainClaims: string;
    lock: string; unlock: string; locked: string; delete: string; deleteConfirm: string;
    edit: string; save: string; cancel: string; back: string;
    tone: string; toneNeutral: string; toneNatural: string; toneCasual: string; tonePoetic: string;
    storyLanguage: string; customTone: string; customTonePlaceholder: string;
    speakToEdit: string; voiceInput: string; startRecording: string; stopRecording: string;
    makeStoryBetter: string; regenerate: string; addToHighlights: string;
    assignChapter: string; noChapter: string;
  };
  common: { save: string; cancel: string; delete: string; edit: string; back: string; search: string; loading: string; confirm: string; close: string };
  time: { justNow: string; minutesAgo: string; hoursAgo: string; daysAgo: string };
};

const translations: Record<AppLanguage, TranslationKeys> = {
  en: {
    nav: { home: 'Home', prompts: 'Prompts', chapters: 'Chapters', timeline: 'Timeline', search: 'Search', print: 'Print', library: 'Library' },
    settings: { 
      title: 'Profile & Settings', description: 'Manage your Tightly experience', 
      language: 'Language', languageDesc: 'App display language', autoDetect: 'Auto-detect', autoDetectDesc: 'Use browser/device language',
      account: 'Account', privacy: 'Privacy', privacyDesc: 'Manage your data', 
      exportData: 'Export Data', exportDataDesc: 'Download your memories', 
      notifications: 'Notifications', pushNotifications: 'Push Notifications', pushNotificationsDesc: 'Get notified about memories', 
      emailUpdates: 'Email Updates', emailUpdatesDesc: 'Weekly memory digest', 
      preferences: 'Preferences', autoSave: 'Auto-save', autoSaveDesc: 'Save entries automatically', 
      appearance: 'Appearance', currentMode: 'Current mode', night: 'Night', day: 'Day', 
      system: 'System', systemDesc: 'Follow device appearance when selected',
      automatic: 'Automatic', automaticDesc: 'Switches at sunset & sunrise', 
      alwaysLight: 'Always Light', alwaysLightDesc: 'Bright & airy daytime sky', 
      alwaysNight: 'Always Night', alwaysNightDesc: 'Stars & aurora at all times', 
      about: 'About', version: 'Version', versionDesc: 'Current app version', 
      signOut: 'Sign Out', deleteAccount: 'Delete Account', view: 'View', export: 'Export' 
    },
    home: { 
      newMemory: 'New Memory', recentMemories: 'Recent Memories', starred: 'Starred', 
      noMemories: 'No memories yet', startJourney: 'Start your journey',
      customMemory: 'Custom Memory', customMemoryDesc: 'Write about anything',
      usePrompt: 'Use a Prompt', usePromptDesc: 'Get inspired to write',
      chapters: 'Chapters', viewAll: 'View all', memories: 'memories',
      continueWriting: 'Continue Writing', draft: 'Draft', lastEdited: 'Last edited',
      journalAwaits: 'Your journal awaits', journalAwaitsDesc: 'Start capturing moments with guided prompts or write your own custom memories.',
      createChapters: 'Create chapters to organize your memories'
    },
    prompts: {
      title: 'Prompts', description: 'Get inspired to write', categories: 'Categories', allPrompts: 'All Prompts',
      useThis: 'Use this prompt', daily: 'Daily', refresh: 'Refresh', reflection: 'Reflection', gratitude: 'Gratitude',
      dreams: 'Dreams', travel: 'Travel', relationships: 'Relationships'
    },
    chapters: {
      title: 'Chapters', description: 'Organize your memories', newChapter: 'New Chapter', editChapter: 'Edit Chapter',
      deleteChapter: 'Delete Chapter', noChapters: 'No chapters yet', noChaptersDesc: 'Create chapters to organize your memories by theme',
      name: 'Name', icon: 'Icon', color: 'Color', entries: 'entries', pinned: 'Pinned', archived: 'Archived'
    },
    timeline: {
      title: 'Timeline', empty: 'Your timeline is empty', emptyDesc: 'Start capturing moments to see them here', memories: 'memories'
    },
    search: {
      title: 'Search', placeholder: 'Search memories...', noResults: 'No results', noResultsDesc: 'Try different keywords',
      recentSearches: 'Recent searches'
    },
    print: {
      title: 'Print', description: 'Turn memories into books', createBook: 'Create Book', selectEntries: 'Select entries',
      chooseTheme: 'Choose theme', preview: 'Preview', download: 'Download', noBooks: 'No books yet',
      noBooksDesc: 'Create a beautiful printed book from your memories'
    },
    entry: {
      title: 'Title', untitled: 'Untitled Memory', date: 'Date', transcript: 'What happened?',
      transcriptPlaceholder: 'What happened? Where were you, with whom, and what made it memorable?',
      photos: 'Photos', addPhotos: 'Add photos', dropPhotos: 'Drop photos here',
      generate: 'Generate Story', generating: 'Generating...', highlights: 'Highlights', story: 'Story',
      tags: 'Tags', questions: 'Questions to make this better', uncertainClaims: 'Uncertain claims',
      lock: 'Lock', unlock: 'Unlock', locked: 'Locked', delete: 'Delete', deleteConfirm: 'Are you sure?',
      edit: 'Edit', save: 'Save', cancel: 'Cancel', back: 'Back',
      tone: 'Tone', toneNeutral: 'Neutral', toneNatural: 'Natural', toneCasual: 'Casual', tonePoetic: 'Poetic',
      storyLanguage: 'Story language', customTone: 'Custom tone', customTonePlaceholder: 'Describe your preferred writing style...',
      speakToEdit: 'Speak to edit', voiceInput: 'Voice input', startRecording: 'Start recording', stopRecording: 'Stop recording',
      makeStoryBetter: 'Make this story better', regenerate: 'Regenerate', addToHighlights: 'Add to highlights',
      assignChapter: 'Assign to chapter', noChapter: 'No chapter'
    },
    common: { save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', back: 'Back', search: 'Search', loading: 'Loading...', confirm: 'Confirm', close: 'Close' },
    time: { justNow: 'just now', minutesAgo: 'm ago', hoursAgo: 'h ago', daysAgo: 'd ago' }
  },
  de: {
    nav: { home: 'Start', prompts: 'Impulse', chapters: 'Kapitel', timeline: 'Zeitachse', search: 'Suche', print: 'Drucken', library: 'Bibliothek' },
    settings: { 
      title: 'Profil & Einstellungen', description: 'Verwalte dein Tightly-Erlebnis', 
      language: 'Sprache', languageDesc: 'App-Anzeigesprache', autoDetect: 'Automatisch erkennen', autoDetectDesc: 'Browser-/Gerätesprache verwenden',
      account: 'Konto', privacy: 'Datenschutz', privacyDesc: 'Verwalte deine Daten', 
      exportData: 'Daten exportieren', exportDataDesc: 'Lade deine Erinnerungen herunter', 
      notifications: 'Benachrichtigungen', pushNotifications: 'Push-Benachrichtigungen', pushNotificationsDesc: 'Werde über Erinnerungen benachrichtigt', 
      emailUpdates: 'E-Mail-Updates', emailUpdatesDesc: 'Wöchentliche Zusammenfassung', 
      preferences: 'Einstellungen', autoSave: 'Auto-Speichern', autoSaveDesc: 'Einträge automatisch speichern', 
      appearance: 'Erscheinungsbild', currentMode: 'Aktueller Modus', night: 'Nacht', day: 'Tag', 
      system: 'System', systemDesc: 'Folgt nur bei Auswahl dem Geräte-Design',
      automatic: 'Automatisch', automaticDesc: 'Wechselt bei Sonnenuntergang & -aufgang', 
      alwaysLight: 'Immer Hell', alwaysLightDesc: 'Heller Tageshimmel', 
      alwaysNight: 'Immer Dunkel', alwaysNightDesc: 'Sterne & Aurora jederzeit', 
      about: 'Über', version: 'Version', versionDesc: 'Aktuelle App-Version', 
      signOut: 'Abmelden', deleteAccount: 'Konto löschen', view: 'Ansehen', export: 'Exportieren' 
    },
    home: { 
      newMemory: 'Neue Erinnerung', recentMemories: 'Letzte Erinnerungen', starred: 'Favoriten', 
      noMemories: 'Noch keine Erinnerungen', startJourney: 'Starte deine Reise',
      customMemory: 'Eigene Erinnerung', customMemoryDesc: 'Schreibe über alles',
      usePrompt: 'Impuls nutzen', usePromptDesc: 'Lass dich inspirieren',
      chapters: 'Kapitel', viewAll: 'Alle anzeigen', memories: 'Erinnerungen',
      continueWriting: 'Weiterschreiben', draft: 'Entwurf', lastEdited: 'Zuletzt bearbeitet',
      journalAwaits: 'Dein Tagebuch wartet', journalAwaitsDesc: 'Halte Momente mit geführten Impulsen fest oder schreibe eigene Erinnerungen.',
      createChapters: 'Erstelle Kapitel um deine Erinnerungen zu organisieren'
    },
    prompts: {
      title: 'Impulse', description: 'Lass dich inspirieren', categories: 'Kategorien', allPrompts: 'Alle Impulse',
      useThis: 'Diesen Impuls nutzen', daily: 'Täglich', refresh: 'Neu laden', reflection: 'Reflexion', gratitude: 'Dankbarkeit',
      dreams: 'Träume', travel: 'Reisen', relationships: 'Beziehungen'
    },
    chapters: {
      title: 'Kapitel', description: 'Organisiere deine Erinnerungen', newChapter: 'Neues Kapitel', editChapter: 'Kapitel bearbeiten',
      deleteChapter: 'Kapitel löschen', noChapters: 'Noch keine Kapitel', noChaptersDesc: 'Erstelle Kapitel um deine Erinnerungen thematisch zu ordnen',
      name: 'Name', icon: 'Symbol', color: 'Farbe', entries: 'Einträge', pinned: 'Angepinnt', archived: 'Archiviert'
    },
    timeline: {
      title: 'Zeitachse', empty: 'Deine Zeitachse ist leer', emptyDesc: 'Beginne Momente festzuhalten, um sie hier zu sehen', memories: 'Erinnerungen'
    },
    search: {
      title: 'Suche', placeholder: 'Erinnerungen durchsuchen...', noResults: 'Keine Ergebnisse', noResultsDesc: 'Versuche andere Suchbegriffe',
      recentSearches: 'Letzte Suchen'
    },
    print: {
      title: 'Drucken', description: 'Verwandle Erinnerungen in Bücher', createBook: 'Buch erstellen', selectEntries: 'Einträge auswählen',
      chooseTheme: 'Design wählen', preview: 'Vorschau', download: 'Herunterladen', noBooks: 'Noch keine Bücher',
      noBooksDesc: 'Erstelle ein schönes gedrucktes Buch aus deinen Erinnerungen'
    },
    entry: {
      title: 'Titel', untitled: 'Unbenannte Erinnerung', date: 'Datum', transcript: 'Was ist passiert?',
      transcriptPlaceholder: 'Was ist passiert? Wo warst du, mit wem, und was hat es besonders gemacht?',
      photos: 'Fotos', addPhotos: 'Fotos hinzufügen', dropPhotos: 'Fotos hier ablegen',
      generate: 'Geschichte generieren', generating: 'Generiere...', highlights: 'Highlights', story: 'Geschichte',
      tags: 'Tags', questions: 'Fragen für eine bessere Geschichte', uncertainClaims: 'Unsichere Angaben',
      lock: 'Sperren', unlock: 'Entsperren', locked: 'Gesperrt', delete: 'Löschen', deleteConfirm: 'Bist du sicher?',
      edit: 'Bearbeiten', save: 'Speichern', cancel: 'Abbrechen', back: 'Zurück',
      tone: 'Tonfall', toneNeutral: 'Neutral', toneNatural: 'Natürlich', toneCasual: 'Locker', tonePoetic: 'Poetisch',
      storyLanguage: 'Sprache der Geschichte', customTone: 'Eigener Stil', customTonePlaceholder: 'Beschreibe deinen bevorzugten Schreibstil...',
      speakToEdit: 'Sprechen zum Bearbeiten', voiceInput: 'Spracheingabe', startRecording: 'Aufnahme starten', stopRecording: 'Aufnahme stoppen',
      makeStoryBetter: 'Geschichte verbessern', regenerate: 'Neu generieren', addToHighlights: 'Zu Highlights hinzufügen',
      assignChapter: 'Kapitel zuweisen', noChapter: 'Kein Kapitel'
    },
    common: { save: 'Speichern', cancel: 'Abbrechen', delete: 'Löschen', edit: 'Bearbeiten', back: 'Zurück', search: 'Suchen', loading: 'Laden...', confirm: 'Bestätigen', close: 'Schließen' },
    time: { justNow: 'gerade eben', minutesAgo: 'min', hoursAgo: 'h', daysAgo: 'T' }
  },
  es: {
    nav: { home: 'Inicio', prompts: 'Sugerencias', chapters: 'Capítulos', timeline: 'Cronología', search: 'Buscar', print: 'Imprimir', library: 'Biblioteca' },
    settings: { 
      title: 'Perfil y Ajustes', description: 'Gestiona tu experiencia Tightly', 
      language: 'Idioma', languageDesc: 'Idioma de la aplicación', autoDetect: 'Auto-detectar', autoDetectDesc: 'Usar idioma del navegador/dispositivo',
      account: 'Cuenta', privacy: 'Privacidad', privacyDesc: 'Gestiona tus datos', 
      exportData: 'Exportar Datos', exportDataDesc: 'Descarga tus recuerdos', 
      notifications: 'Notificaciones', pushNotifications: 'Notificaciones Push', pushNotificationsDesc: 'Recibe alertas sobre recuerdos', 
      emailUpdates: 'Actualizaciones por Email', emailUpdatesDesc: 'Resumen semanal', 
      preferences: 'Preferencias', autoSave: 'Auto-guardar', autoSaveDesc: 'Guardar entradas automáticamente', 
      appearance: 'Apariencia', currentMode: 'Modo actual', night: 'Noche', day: 'Día', 
      system: 'Sistema', systemDesc: 'Sigue la apariencia del dispositivo al seleccionarlo',
      automatic: 'Automático', automaticDesc: 'Cambia al atardecer y amanecer', 
      alwaysLight: 'Siempre Claro', alwaysLightDesc: 'Cielo diurno brillante', 
      alwaysNight: 'Siempre Oscuro', alwaysNightDesc: 'Estrellas y aurora siempre', 
      about: 'Acerca de', version: 'Versión', versionDesc: 'Versión actual de la app', 
      signOut: 'Cerrar Sesión', deleteAccount: 'Eliminar Cuenta', view: 'Ver', export: 'Exportar' 
    },
    home: { 
      newMemory: 'Nuevo Recuerdo', recentMemories: 'Recuerdos Recientes', starred: 'Favoritos', 
      noMemories: 'Sin recuerdos aún', startJourney: 'Comienza tu viaje',
      customMemory: 'Recuerdo Personalizado', customMemoryDesc: 'Escribe sobre cualquier cosa',
      usePrompt: 'Usar Sugerencia', usePromptDesc: 'Inspírate para escribir',
      chapters: 'Capítulos', viewAll: 'Ver todo', memories: 'recuerdos',
      continueWriting: 'Continuar Escribiendo', draft: 'Borrador', lastEdited: 'Última edición',
      journalAwaits: 'Tu diario espera', journalAwaitsDesc: 'Captura momentos con sugerencias guiadas o escribe tus propios recuerdos.',
      createChapters: 'Crea capítulos para organizar tus recuerdos'
    },
    prompts: {
      title: 'Sugerencias', description: 'Inspírate para escribir', categories: 'Categorías', allPrompts: 'Todas las Sugerencias',
      useThis: 'Usar esta sugerencia', daily: 'Diario', refresh: 'Actualizar', reflection: 'Reflexión', gratitude: 'Gratitud',
      dreams: 'Sueños', travel: 'Viajes', relationships: 'Relaciones'
    },
    chapters: {
      title: 'Capítulos', description: 'Organiza tus recuerdos', newChapter: 'Nuevo Capítulo', editChapter: 'Editar Capítulo',
      deleteChapter: 'Eliminar Capítulo', noChapters: 'Sin capítulos aún', noChaptersDesc: 'Crea capítulos para organizar tus recuerdos por tema',
      name: 'Nombre', icon: 'Icono', color: 'Color', entries: 'entradas', pinned: 'Fijado', archived: 'Archivado'
    },
    timeline: {
      title: 'Cronología', empty: 'Tu cronología está vacía', emptyDesc: 'Comienza a capturar momentos para verlos aquí', memories: 'recuerdos'
    },
    search: {
      title: 'Buscar', placeholder: 'Buscar recuerdos...', noResults: 'Sin resultados', noResultsDesc: 'Prueba con otras palabras',
      recentSearches: 'Búsquedas recientes'
    },
    print: {
      title: 'Imprimir', description: 'Convierte recuerdos en libros', createBook: 'Crear Libro', selectEntries: 'Seleccionar entradas',
      chooseTheme: 'Elegir tema', preview: 'Vista previa', download: 'Descargar', noBooks: 'Sin libros aún',
      noBooksDesc: 'Crea un hermoso libro impreso de tus recuerdos'
    },
    entry: {
      title: 'Título', untitled: 'Recuerdo Sin Título', date: 'Fecha', transcript: '¿Qué pasó?',
      transcriptPlaceholder: '¿Qué pasó? ¿Dónde estabas, con quién, y qué lo hizo memorable?',
      photos: 'Fotos', addPhotos: 'Añadir fotos', dropPhotos: 'Arrastra fotos aquí',
      generate: 'Generar Historia', generating: 'Generando...', highlights: 'Destacados', story: 'Historia',
      tags: 'Etiquetas', questions: 'Preguntas para mejorar', uncertainClaims: 'Afirmaciones inciertas',
      lock: 'Bloquear', unlock: 'Desbloquear', locked: 'Bloqueado', delete: 'Eliminar', deleteConfirm: '¿Estás seguro?',
      edit: 'Editar', save: 'Guardar', cancel: 'Cancelar', back: 'Volver',
      tone: 'Tono', toneNeutral: 'Neutral', toneNatural: 'Natural', toneCasual: 'Casual', tonePoetic: 'Poético',
      storyLanguage: 'Idioma de la historia', customTone: 'Tono personalizado', customTonePlaceholder: 'Describe tu estilo de escritura preferido...',
      speakToEdit: 'Habla para editar', voiceInput: 'Entrada de voz', startRecording: 'Iniciar grabación', stopRecording: 'Detener grabación',
      makeStoryBetter: 'Mejorar esta historia', regenerate: 'Regenerar', addToHighlights: 'Añadir a destacados',
      assignChapter: 'Asignar a capítulo', noChapter: 'Sin capítulo'
    },
    common: { save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', back: 'Volver', search: 'Buscar', loading: 'Cargando...', confirm: 'Confirmar', close: 'Cerrar' },
    time: { justNow: 'ahora mismo', minutesAgo: 'min', hoursAgo: 'h', daysAgo: 'd' }
  },
  fr: {
    nav: { home: 'Accueil', prompts: 'Inspirations', chapters: 'Chapitres', timeline: 'Chronologie', search: 'Rechercher', print: 'Imprimer', library: 'Bibliothèque' },
    settings: { 
      title: 'Profil & Paramètres', description: 'Gérez votre expérience Tightly', 
      language: 'Langue', languageDesc: "Langue d'affichage", autoDetect: 'Auto-détecter', autoDetectDesc: 'Utiliser la langue du navigateur/appareil',
      account: 'Compte', privacy: 'Confidentialité', privacyDesc: 'Gérez vos données', 
      exportData: 'Exporter les Données', exportDataDesc: 'Téléchargez vos souvenirs', 
      notifications: 'Notifications', pushNotifications: 'Notifications Push', pushNotificationsDesc: 'Recevez des alertes', 
      emailUpdates: 'Mises à jour par Email', emailUpdatesDesc: 'Résumé hebdomadaire', 
      preferences: 'Préférences', autoSave: 'Sauvegarde auto', autoSaveDesc: 'Sauvegarder automatiquement', 
      appearance: 'Apparence', currentMode: 'Mode actuel', night: 'Nuit', day: 'Jour', 
      system: 'Système', systemDesc: "Suit l'apparence de l'appareil si sélectionné",
      automatic: 'Automatique', automaticDesc: 'Change au coucher/lever du soleil', 
      alwaysLight: 'Toujours Clair', alwaysLightDesc: 'Ciel de jour lumineux', 
      alwaysNight: 'Toujours Sombre', alwaysNightDesc: 'Étoiles et aurores toujours', 
      about: 'À propos', version: 'Version', versionDesc: 'Version actuelle', 
      signOut: 'Déconnexion', deleteAccount: 'Supprimer le Compte', view: 'Voir', export: 'Exporter' 
    },
    home: { 
      newMemory: 'Nouveau Souvenir', recentMemories: 'Souvenirs Récents', starred: 'Favoris', 
      noMemories: 'Aucun souvenir encore', startJourney: 'Commencez votre voyage',
      customMemory: 'Souvenir Personnalisé', customMemoryDesc: 'Écrivez sur n\'importe quoi',
      usePrompt: 'Utiliser une Inspiration', usePromptDesc: 'Laissez-vous inspirer',
      chapters: 'Chapitres', viewAll: 'Voir tout', memories: 'souvenirs',
      continueWriting: 'Continuer à Écrire', draft: 'Brouillon', lastEdited: 'Dernière modification',
      journalAwaits: 'Votre journal vous attend', journalAwaitsDesc: 'Capturez des moments avec des inspirations guidées ou écrivez vos propres souvenirs.',
      createChapters: 'Créez des chapitres pour organiser vos souvenirs'
    },
    prompts: {
      title: 'Inspirations', description: 'Laissez-vous inspirer', categories: 'Catégories', allPrompts: 'Toutes les Inspirations',
      useThis: 'Utiliser cette inspiration', daily: 'Quotidien', refresh: 'Actualiser', reflection: 'Réflexion', gratitude: 'Gratitude',
      dreams: 'Rêves', travel: 'Voyages', relationships: 'Relations'
    },
    chapters: {
      title: 'Chapitres', description: 'Organisez vos souvenirs', newChapter: 'Nouveau Chapitre', editChapter: 'Modifier le Chapitre',
      deleteChapter: 'Supprimer le Chapitre', noChapters: 'Aucun chapitre encore', noChaptersDesc: 'Créez des chapitres pour organiser vos souvenirs par thème',
      name: 'Nom', icon: 'Icône', color: 'Couleur', entries: 'entrées', pinned: 'Épinglé', archived: 'Archivé'
    },
    timeline: {
      title: 'Chronologie', empty: 'Votre chronologie est vide', emptyDesc: 'Commencez à capturer des moments pour les voir ici', memories: 'souvenirs'
    },
    search: {
      title: 'Rechercher', placeholder: 'Rechercher des souvenirs...', noResults: 'Aucun résultat', noResultsDesc: 'Essayez d\'autres mots-clés',
      recentSearches: 'Recherches récentes'
    },
    print: {
      title: 'Imprimer', description: 'Transformez vos souvenirs en livres', createBook: 'Créer un Livre', selectEntries: 'Sélectionner les entrées',
      chooseTheme: 'Choisir le thème', preview: 'Aperçu', download: 'Télécharger', noBooks: 'Aucun livre encore',
      noBooksDesc: 'Créez un beau livre imprimé de vos souvenirs'
    },
    entry: {
      title: 'Titre', untitled: 'Souvenir Sans Titre', date: 'Date', transcript: 'Que s\'est-il passé?',
      transcriptPlaceholder: 'Que s\'est-il passé? Où étiez-vous, avec qui, et qu\'est-ce qui l\'a rendu mémorable?',
      photos: 'Photos', addPhotos: 'Ajouter des photos', dropPhotos: 'Déposez les photos ici',
      generate: 'Générer l\'Histoire', generating: 'Génération...', highlights: 'Points Forts', story: 'Histoire',
      tags: 'Tags', questions: 'Questions pour améliorer', uncertainClaims: 'Affirmations incertaines',
      lock: 'Verrouiller', unlock: 'Déverrouiller', locked: 'Verrouillé', delete: 'Supprimer', deleteConfirm: 'Êtes-vous sûr?',
      edit: 'Modifier', save: 'Sauvegarder', cancel: 'Annuler', back: 'Retour',
      tone: 'Ton', toneNeutral: 'Neutre', toneNatural: 'Naturel', toneCasual: 'Décontracté', tonePoetic: 'Poétique',
      storyLanguage: 'Langue de l\'histoire', customTone: 'Ton personnalisé', customTonePlaceholder: 'Décrivez votre style d\'écriture préféré...',
      speakToEdit: 'Parler pour modifier', voiceInput: 'Entrée vocale', startRecording: 'Commencer l\'enregistrement', stopRecording: 'Arrêter l\'enregistrement',
      makeStoryBetter: 'Améliorer cette histoire', regenerate: 'Régénérer', addToHighlights: 'Ajouter aux points forts',
      assignChapter: 'Assigner au chapitre', noChapter: 'Aucun chapitre'
    },
    common: { save: 'Sauvegarder', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', back: 'Retour', search: 'Rechercher', loading: 'Chargement...', confirm: 'Confirmer', close: 'Fermer' },
    time: { justNow: 'à l\'instant', minutesAgo: 'min', hoursAgo: 'h', daysAgo: 'j' }
  },
  pt: {
    nav: { home: 'Início', prompts: 'Sugestões', chapters: 'Capítulos', timeline: 'Linha do Tempo', search: 'Buscar', print: 'Imprimir', library: 'Biblioteca' },
    settings: { 
      title: 'Perfil e Configurações', description: 'Gerencie sua experiência Tightly', 
      language: 'Idioma', languageDesc: 'Idioma do aplicativo', autoDetect: 'Auto-detectar', autoDetectDesc: 'Usar idioma do navegador/dispositivo',
      account: 'Conta', privacy: 'Privacidade', privacyDesc: 'Gerencie seus dados', 
      exportData: 'Exportar Dados', exportDataDesc: 'Baixe suas memórias', 
      notifications: 'Notificações', pushNotifications: 'Notificações Push', pushNotificationsDesc: 'Receba alertas sobre memórias', 
      emailUpdates: 'Atualizações por Email', emailUpdatesDesc: 'Resumo semanal', 
      preferences: 'Preferências', autoSave: 'Salvar automático', autoSaveDesc: 'Salvar entradas automaticamente', 
      appearance: 'Aparência', currentMode: 'Modo atual', night: 'Noite', day: 'Dia', 
      system: 'Sistema', systemDesc: 'Segue a aparência do dispositivo quando selecionado',
      automatic: 'Automático', automaticDesc: 'Muda ao pôr/nascer do sol', 
      alwaysLight: 'Sempre Claro', alwaysLightDesc: 'Céu diurno brilhante', 
      alwaysNight: 'Sempre Escuro', alwaysNightDesc: 'Estrelas e aurora sempre', 
      about: 'Sobre', version: 'Versão', versionDesc: 'Versão atual do app', 
      signOut: 'Sair', deleteAccount: 'Excluir Conta', view: 'Ver', export: 'Exportar' 
    },
    home: { 
      newMemory: 'Nova Memória', recentMemories: 'Memórias Recentes', starred: 'Favoritos', 
      noMemories: 'Nenhuma memória ainda', startJourney: 'Comece sua jornada',
      customMemory: 'Memória Personalizada', customMemoryDesc: 'Escreva sobre qualquer coisa',
      usePrompt: 'Usar Sugestão', usePromptDesc: 'Inspire-se para escrever',
      chapters: 'Capítulos', viewAll: 'Ver tudo', memories: 'memórias',
      continueWriting: 'Continuar Escrevendo', draft: 'Rascunho', lastEdited: 'Última edição',
      journalAwaits: 'Seu diário espera', journalAwaitsDesc: 'Capture momentos com sugestões guiadas ou escreva suas próprias memórias.',
      createChapters: 'Crie capítulos para organizar suas memórias'
    },
    prompts: {
      title: 'Sugestões', description: 'Inspire-se para escrever', categories: 'Categorias', allPrompts: 'Todas as Sugestões',
      useThis: 'Usar esta sugestão', daily: 'Diário', refresh: 'Atualizar', reflection: 'Reflexão', gratitude: 'Gratidão',
      dreams: 'Sonhos', travel: 'Viagens', relationships: 'Relacionamentos'
    },
    chapters: {
      title: 'Capítulos', description: 'Organize suas memórias', newChapter: 'Novo Capítulo', editChapter: 'Editar Capítulo',
      deleteChapter: 'Excluir Capítulo', noChapters: 'Nenhum capítulo ainda', noChaptersDesc: 'Crie capítulos para organizar suas memórias por tema',
      name: 'Nome', icon: 'Ícone', color: 'Cor', entries: 'entradas', pinned: 'Fixado', archived: 'Arquivado'
    },
    timeline: {
      title: 'Linha do Tempo', empty: 'Sua linha do tempo está vazia', emptyDesc: 'Comece a capturar momentos para vê-los aqui', memories: 'memórias'
    },
    search: {
      title: 'Buscar', placeholder: 'Buscar memórias...', noResults: 'Sem resultados', noResultsDesc: 'Tente outras palavras',
      recentSearches: 'Buscas recentes'
    },
    print: {
      title: 'Imprimir', description: 'Transforme memórias em livros', createBook: 'Criar Livro', selectEntries: 'Selecionar entradas',
      chooseTheme: 'Escolher tema', preview: 'Prévia', download: 'Baixar', noBooks: 'Nenhum livro ainda',
      noBooksDesc: 'Crie um belo livro impresso de suas memórias'
    },
    entry: {
      title: 'Título', untitled: 'Memória Sem Título', date: 'Data', transcript: 'O que aconteceu?',
      transcriptPlaceholder: 'O que aconteceu? Onde você estava, com quem, e o que tornou memorável?',
      photos: 'Fotos', addPhotos: 'Adicionar fotos', dropPhotos: 'Arraste fotos aqui',
      generate: 'Gerar História', generating: 'Gerando...', highlights: 'Destaques', story: 'História',
      tags: 'Tags', questions: 'Perguntas para melhorar', uncertainClaims: 'Afirmações incertas',
      lock: 'Bloquear', unlock: 'Desbloquear', locked: 'Bloqueado', delete: 'Excluir', deleteConfirm: 'Tem certeza?',
      edit: 'Editar', save: 'Salvar', cancel: 'Cancelar', back: 'Voltar',
      tone: 'Tom', toneNeutral: 'Neutro', toneNatural: 'Natural', toneCasual: 'Casual', tonePoetic: 'Poético',
      storyLanguage: 'Idioma da história', customTone: 'Tom personalizado', customTonePlaceholder: 'Descreva seu estilo de escrita preferido...',
      speakToEdit: 'Falar para editar', voiceInput: 'Entrada de voz', startRecording: 'Iniciar gravação', stopRecording: 'Parar gravação',
      makeStoryBetter: 'Melhorar esta história', regenerate: 'Regenerar', addToHighlights: 'Adicionar aos destaques',
      assignChapter: 'Atribuir ao capítulo', noChapter: 'Sem capítulo'
    },
    common: { save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar', back: 'Voltar', search: 'Buscar', loading: 'Carregando...', confirm: 'Confirmar', close: 'Fechar' },
    time: { justNow: 'agora mesmo', minutesAgo: 'min', hoursAgo: 'h', daysAgo: 'd' }
  },
  zh: {
    nav: { home: '首页', prompts: '提示', chapters: '章节', timeline: '时间线', search: '搜索', print: '打印', library: '书库' },
    settings: { 
      title: '个人资料与设置', description: '管理您的Tightly体验', 
      language: '语言', languageDesc: '应用显示语言', autoDetect: '自动检测', autoDetectDesc: '使用浏览器/设备语言',
      account: '账户', privacy: '隐私', privacyDesc: '管理您的数据', 
      exportData: '导出数据', exportDataDesc: '下载您的回忆', 
      notifications: '通知', pushNotifications: '推送通知', pushNotificationsDesc: '获取回忆提醒', 
      emailUpdates: '邮件更新', emailUpdatesDesc: '每周回忆摘要', 
      preferences: '偏好设置', autoSave: '自动保存', autoSaveDesc: '自动保存条目', 
      appearance: '外观', currentMode: '当前模式', night: '夜间', day: '日间', 
      system: '系统', systemDesc: '仅在选择时跟随设备外观',
      automatic: '自动', automaticDesc: '日落日出自动切换', 
      alwaysLight: '始终明亮', alwaysLightDesc: '明亮的日间天空', 
      alwaysNight: '始终夜间', alwaysNightDesc: '永远星空极光', 
      about: '关于', version: '版本', versionDesc: '当前应用版本', 
      signOut: '退出登录', deleteAccount: '删除账户', view: '查看', export: '导出' 
    },
    home: { 
      newMemory: '新回忆', recentMemories: '最近回忆', starred: '收藏', 
      noMemories: '暂无回忆', startJourney: '开始您的旅程',
      customMemory: '自定义回忆', customMemoryDesc: '写任何内容',
      usePrompt: '使用提示', usePromptDesc: '获取写作灵感',
      chapters: '章节', viewAll: '查看全部', memories: '条回忆',
      continueWriting: '继续写作', draft: '草稿', lastEdited: '上次编辑',
      journalAwaits: '您的日记在等待', journalAwaitsDesc: '使用引导提示捕捉瞬间，或写下您自己的回忆。',
      createChapters: '创建章节来组织您的回忆'
    },
    prompts: {
      title: '提示', description: '获取写作灵感', categories: '分类', allPrompts: '所有提示',
      useThis: '使用此提示', daily: '日常', refresh: '刷新', reflection: '反思', gratitude: '感恩',
      dreams: '梦想', travel: '旅行', relationships: '关系'
    },
    chapters: {
      title: '章节', description: '组织您的回忆', newChapter: '新章节', editChapter: '编辑章节',
      deleteChapter: '删除章节', noChapters: '暂无章节', noChaptersDesc: '创建章节按主题组织您的回忆',
      name: '名称', icon: '图标', color: '颜色', entries: '条目', pinned: '已置顶', archived: '已归档'
    },
    timeline: {
      title: '时间线', empty: '您的时间线为空', emptyDesc: '开始捕捉时刻以在此查看', memories: '个回忆'
    },
    search: {
      title: '搜索', placeholder: '搜索回忆...', noResults: '无结果', noResultsDesc: '尝试其他关键词',
      recentSearches: '最近搜索'
    },
    print: {
      title: '打印', description: '将回忆变成书籍', createBook: '创建书籍', selectEntries: '选择条目',
      chooseTheme: '选择主题', preview: '预览', download: '下载', noBooks: '暂无书籍',
      noBooksDesc: '用您的回忆创建一本精美的印刷书'
    },
    entry: {
      title: '标题', untitled: '无标题回忆', date: '日期', transcript: '发生了什么？',
      transcriptPlaceholder: '发生了什么？你在哪里，和谁在一起，是什么让它难忘？',
      photos: '照片', addPhotos: '添加照片', dropPhotos: '将照片拖放到这里',
      generate: '生成故事', generating: '生成中...', highlights: '亮点', story: '故事',
      tags: '标签', questions: '改进问题', uncertainClaims: '不确定的陈述',
      lock: '锁定', unlock: '解锁', locked: '已锁定', delete: '删除', deleteConfirm: '确定吗？',
      edit: '编辑', save: '保存', cancel: '取消', back: '返回',
      tone: '语调', toneNeutral: '中性', toneNatural: '自然', toneCasual: '随意', tonePoetic: '诗意',
      storyLanguage: '故事语言', customTone: '自定义语调', customTonePlaceholder: '描述您喜欢的写作风格...',
      speakToEdit: '语音编辑', voiceInput: '语音输入', startRecording: '开始录音', stopRecording: '停止录音',
      makeStoryBetter: '改进这个故事', regenerate: '重新生成', addToHighlights: '添加到亮点',
      assignChapter: '分配到章节', noChapter: '无章节'
    },
    common: { save: '保存', cancel: '取消', delete: '删除', edit: '编辑', back: '返回', search: '搜索', loading: '加载中...', confirm: '确认', close: '关闭' },
    time: { justNow: '刚刚', minutesAgo: '分钟前', hoursAgo: '小时前', daysAgo: '天前' }
  },
  ja: {
    nav: { home: 'ホーム', prompts: 'プロンプト', chapters: 'チャプター', timeline: 'タイムライン', search: '検索', print: '印刷', library: 'ライブラリ' },
    settings: { 
      title: 'プロフィールと設定', description: 'Tightly体験を管理', 
      language: '言語', languageDesc: 'アプリの表示言語', autoDetect: '自動検出', autoDetectDesc: 'ブラウザ/デバイスの言語を使用',
      account: 'アカウント', privacy: 'プライバシー', privacyDesc: 'データを管理', 
      exportData: 'データをエクスポート', exportDataDesc: '思い出をダウンロード', 
      notifications: '通知', pushNotifications: 'プッシュ通知', pushNotificationsDesc: '思い出の通知を受け取る', 
      emailUpdates: 'メール更新', emailUpdatesDesc: '週間ダイジェスト', 
      preferences: '設定', autoSave: '自動保存', autoSaveDesc: 'エントリを自動保存', 
      appearance: '外観', currentMode: '現在のモード', night: '夜', day: '昼', 
      system: 'システム', systemDesc: '選択時のみデバイスの外観に従う',
      automatic: '自動', automaticDesc: '日の出と日没で切り替え', 
      alwaysLight: '常にライト', alwaysLightDesc: '明るい昼間の空', 
      alwaysNight: '常にダーク', alwaysNightDesc: '常に星空とオーロラ', 
      about: '情報', version: 'バージョン', versionDesc: '現在のアプリバージョン', 
      signOut: 'サインアウト', deleteAccount: 'アカウント削除', view: '表示', export: 'エクスポート' 
    },
    home: { 
      newMemory: '新しい思い出', recentMemories: '最近の思い出', starred: 'お気に入り', 
      noMemories: '思い出はまだありません', startJourney: '旅を始めましょう',
      customMemory: 'カスタム思い出', customMemoryDesc: '何でも書く',
      usePrompt: 'プロンプトを使う', usePromptDesc: 'インスピレーションを得る',
      chapters: 'チャプター', viewAll: 'すべて見る', memories: 'の思い出',
      continueWriting: '続きを書く', draft: '下書き', lastEdited: '最終編集',
      journalAwaits: 'あなたの日記が待っています', journalAwaitsDesc: 'ガイド付きプロンプトで瞬間を捉えるか、独自の思い出を書きましょう。',
      createChapters: 'チャプターを作成して思い出を整理しましょう'
    },
    prompts: {
      title: 'プロンプト', description: 'インスピレーションを得る', categories: 'カテゴリー', allPrompts: 'すべてのプロンプト',
      useThis: 'このプロンプトを使う', daily: '日常', refresh: '更新', reflection: '振り返り', gratitude: '感謝',
      dreams: '夢', travel: '旅行', relationships: '人間関係'
    },
    chapters: {
      title: 'チャプター', description: '思い出を整理', newChapter: '新しいチャプター', editChapter: 'チャプターを編集',
      deleteChapter: 'チャプターを削除', noChapters: 'チャプターはまだありません', noChaptersDesc: 'テーマ別に思い出を整理するチャプターを作成',
      name: '名前', icon: 'アイコン', color: '色', entries: 'エントリ', pinned: 'ピン留め', archived: 'アーカイブ済み'
    },
    timeline: {
      title: 'タイムライン', empty: 'タイムラインは空です', emptyDesc: 'ここで表示するために瞬間をキャプチャし始めます', memories: '件の思い出'
    },
    search: {
      title: '検索', placeholder: '思い出を検索...', noResults: '結果なし', noResultsDesc: '別のキーワードを試してください',
      recentSearches: '最近の検索'
    },
    print: {
      title: '印刷', description: '思い出を本に', createBook: '本を作成', selectEntries: 'エントリを選択',
      chooseTheme: 'テーマを選択', preview: 'プレビュー', download: 'ダウンロード', noBooks: 'まだ本はありません',
      noBooksDesc: '思い出から美しい印刷本を作成'
    },
    entry: {
      title: 'タイトル', untitled: '無題の思い出', date: '日付', transcript: '何があった？',
      transcriptPlaceholder: '何があった？どこにいた？誰といた？何が特別だった？',
      photos: '写真', addPhotos: '写真を追加', dropPhotos: 'ここに写真をドロップ',
      generate: 'ストーリーを生成', generating: '生成中...', highlights: 'ハイライト', story: 'ストーリー',
      tags: 'タグ', questions: '改善のための質問', uncertainClaims: '不確かな記述',
      lock: 'ロック', unlock: 'ロック解除', locked: 'ロック済み', delete: '削除', deleteConfirm: '本当に？',
      edit: '編集', save: '保存', cancel: 'キャンセル', back: '戻る',
      tone: 'トーン', toneNeutral: 'ニュートラル', toneNatural: 'ナチュラル', toneCasual: 'カジュアル', tonePoetic: '詩的',
      storyLanguage: 'ストーリーの言語', customTone: 'カスタムトーン', customTonePlaceholder: '好みの文体を説明してください...',
      speakToEdit: '話して編集', voiceInput: '音声入力', startRecording: '録音開始', stopRecording: '録音停止',
      makeStoryBetter: 'このストーリーを改善', regenerate: '再生成', addToHighlights: 'ハイライトに追加',
      assignChapter: 'チャプターに割り当て', noChapter: 'チャプターなし'
    },
    common: { save: '保存', cancel: 'キャンセル', delete: '削除', edit: '編集', back: '戻る', search: '検索', loading: '読み込み中...', confirm: '確認', close: '閉じる' },
    time: { justNow: 'たった今', minutesAgo: '分前', hoursAgo: '時間前', daysAgo: '日前' }
  }
};

export function getTranslations(lang: AppLanguage): TranslationKeys {
  return translations[lang] || translations.en;
}

export function getLanguageLabel(code: AppLanguage): string {
  const lang = APP_LANGUAGES.find(l => l.code === code);
  return lang ? lang.nativeLabel : 'English';
}
