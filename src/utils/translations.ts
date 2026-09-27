export type SupportedLanguage = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  ttsLangCode: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', ttsLangCode: 'en-US', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', ttsLangCode: 'hi-IN', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', ttsLangCode: 'es-ES', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', ttsLangCode: 'fr-FR', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', ttsLangCode: 'de-DE', dir: 'ltr' },
  { code: 'zh', name: 'Mandarin', nativeName: '中文', ttsLangCode: 'zh-CN', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', ttsLangCode: 'ja-JP', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', ttsLangCode: 'ar-SA', dir: 'rtl' },
];

export interface UILabels {
  brandTitle: string;
  globalLibrary: string;
  virtualCinema: string;
  aiSummaries: string;
  searchCatalog: string;
  createShortFilm: string;
  watchShortFilms: string;
  heroHeadline: string;
  heroSubtitle: string;
  playRichDadFilm: string;
  searchPlaceholder: string;
  searchBtn: string;
  categories: Record<string, string>;
  allLanguages: string;
  openReadingRoom: string;
  downloadEbook: string;
  listenWithTTS: string;
  aiSummary: string;
  shortFilm: string;
  tableOfContents: string;
  directDownload: string;
  previousChapter: string;
  nextChapter: string;
  watchFilmAdaptation: string;
  exportVideo: string;
  recordingInProgress: string;
  videoStyle: string;
  languageVoice: string;
}

export const UI_TRANSLATIONS: Record<SupportedLanguage, UILabels> = {
  en: {
    brandTitle: 'FinLibre',
    globalLibrary: 'Global Library',
    virtualCinema: 'Virtual Cinema',
    aiSummaries: 'AI Summaries',
    searchCatalog: 'Search Catalog',
    createShortFilm: 'Create Short Film',
    watchShortFilms: 'Watch Short Films',
    heroHeadline: 'Global Financial Classics, Instant Ebooks & AI Short Films.',
    heroSubtitle: 'Explore timeless wealth literature—from Rich Dad Poor Dad to regenerative Zebra Learning economics. Download full EPUB/PDF texts and watch dynamic short film adaptations with high-fidelity voice narration.',
    playRichDadFilm: 'Play "Rich Dad Poor Dad" Short Film',
    searchPlaceholder: 'Search global finance ebooks, topics (e.g., "Rich Dad", "Zebra", "Assets", "Real Estate")...',
    searchBtn: 'Search',
    categories: {
      'All': 'All Volumes',
      'Cashflow & Assets': 'Cashflow & Assets',
      'Zebra & Sustainable Startups': 'Zebra & Sustainable Startups',
      'Mindset & Psychology': 'Mindset & Psychology',
      'Investing & Markets': 'Investing & Markets',
      'Debt & Wealth Systems': 'Debt & Wealth Systems'
    },
    allLanguages: 'All Languages',
    openReadingRoom: 'Open Reading Room',
    downloadEbook: 'Download Ebook',
    listenWithTTS: 'Listen with TTS',
    aiSummary: 'AI Summary',
    shortFilm: 'Short Film',
    tableOfContents: 'Table of Contents',
    directDownload: 'Direct Download',
    previousChapter: 'Previous Chapter',
    nextChapter: 'Next Chapter',
    watchFilmAdaptation: 'Watch Short Film Adaptation',
    exportVideo: 'Record & Export Video (.webm)',
    recordingInProgress: 'Rendering & Recording Video...',
    videoStyle: 'Video Style',
    languageVoice: 'Language & Voice'
  },
  hi: {
    brandTitle: 'FinLibre',
    globalLibrary: 'वैश्विक पुस्तकालय',
    virtualCinema: 'वर्चुअल सिनेमा',
    aiSummaries: 'एआई सारांश',
    searchCatalog: 'कैटलॉग खोजें',
    createShortFilm: 'शॉर्ट फिल्म बनाएं',
    watchShortFilms: 'शॉर्ट फिल्में देखें',
    heroHeadline: 'वैश्विक वित्तीय क्लासिक्स, त्वरित ई-बुक्स और एआई शॉर्ट फिल्में।',
    heroSubtitle: 'कालातीत वित्तीय साहित्य का अन्वेषण करें—रिच डैड पुअर डैड से लेकर ज़ेब्रा सस्टेनेबल वेल्थ तक। पूर्ण EPUB/PDF पुस्तकें डाउनलोड करें और उच्च-गुणवत्ता वाली आवाज़ के साथ डायनामिक वीडियो रूपांतरण देखें।',
    playRichDadFilm: '"रिच डैड पुअर डैड" शॉर्ट फिल्म देखें',
    searchPlaceholder: 'वित्तीय ई-बुक्स, विषय खोजें (उदा. "रिच डैड", "ज़ेब्रा", "एसेट्स", "निवेश")...',
    searchBtn: 'खोजें',
    categories: {
      'All': 'सभी पुस्तकें',
      'Cashflow & Assets': 'कैशफ्लो और संपत्तियां',
      'Zebra & Sustainable Startups': 'ज़ेब्रा और सतत स्टार्टअप्स',
      'Mindset & Psychology': 'मानसिकता और मनोविज्ञान',
      'Investing & Markets': 'निवेश और बाजार',
      'Debt & Wealth Systems': 'ऋण और धन प्रणाली'
    },
    allLanguages: 'सभी भाषाएं',
    openReadingRoom: 'रीडिंग रूम खोलें',
    downloadEbook: 'ई-बुक डाउनलोड करें',
    listenWithTTS: 'टीटीएस से सुनें',
    aiSummary: 'एआई सारांश',
    shortFilm: 'शॉर्ट फिल्म',
    tableOfContents: 'विषय-सूची',
    directDownload: 'प्रत्यक्ष डाउनलोड',
    previousChapter: 'पिछला अध्याय',
    nextChapter: 'अगला अध्याय',
    watchFilmAdaptation: 'शॉर्ट फिल्म रूपांतरण देखें',
    exportVideo: 'वीडियो रिकॉर्ड और निर्यात करें (.webm)',
    recordingInProgress: 'वीडियो रेंडर और रिकॉर्ड किया जा रहा है...',
    videoStyle: 'वीडियो शैली',
    languageVoice: 'भाषा और आवाज़'
  },
  es: {
    brandTitle: 'FinLibre',
    globalLibrary: 'Biblioteca Global',
    virtualCinema: 'Cine Virtual',
    aiSummaries: 'Resúmenes IA',
    searchCatalog: 'Buscar Catálogo',
    createShortFilm: 'Crear Cortometraje',
    watchShortFilms: 'Ver Cortometrajes',
    heroHeadline: 'Clásicos Financieros Mundiales, Ebooks y Cortometrajes IA.',
    heroSubtitle: 'Explore la literatura de riqueza atemporal: desde Padre Rico Padre Pobre hasta la economía regenerativa de Zebra Learning. Descargue textos completos en EPUB/PDF y disfrute de adaptaciones en video con narración de voz de alta fidelidad.',
    playRichDadFilm: 'Reproducir Corto "Padre Rico Padre Pobre"',
    searchPlaceholder: 'Buscar ebooks de finanzas, temas (ej. "Padre Rico", "Zebra", "Activos")...',
    searchBtn: 'Buscar',
    categories: {
      'All': 'Todos los Volúmenes',
      'Cashflow & Assets': 'Flujo de Caja y Activos',
      'Zebra & Sustainable Startups': 'Startups Zebra y Sostenibilidad',
      'Mindset & Psychology': 'Mentalidad y Psicología',
      'Investing & Markets': 'Inversión y Mercados',
      'Debt & Wealth Systems': 'Sistemas de Deuda y Riqueza'
    },
    allLanguages: 'Todos los Idiomas',
    openReadingRoom: 'Abrir Sala de Lectura',
    downloadEbook: 'Descargar Ebook',
    listenWithTTS: 'Escuchar con TTS',
    aiSummary: 'Resumen IA',
    shortFilm: 'Cortometraje',
    tableOfContents: 'Índice de Contenidos',
    directDownload: 'Descarga Directa',
    previousChapter: 'Capítulo Anterior',
    nextChapter: 'Capítulo Siguiente',
    watchFilmAdaptation: 'Ver Adaptación en Video',
    exportVideo: 'Grabar y Exportar Video (.webm)',
    recordingInProgress: 'Renderizando y Grabando Video...',
    videoStyle: 'Estilo de Video',
    languageVoice: 'Idioma y Voz'
  },
  fr: {
    brandTitle: 'FinLibre',
    globalLibrary: 'Bibliothèque Globale',
    virtualCinema: 'Cinéma Virtuel',
    aiSummaries: 'Résumés IA',
    searchCatalog: 'Rechercher',
    createShortFilm: 'Créer un Court-Métrage',
    watchShortFilms: 'Voir les Courts-Métrages',
    heroHeadline: 'Classiques Financiers Mondiaux, Ebooks et Courts-Métrages IA.',
    heroSubtitle: 'Découvrez la littérature intemporelle de la prospérité—de Père Riche Père Pauvre à l\'économie régénérative Zebra. Téléchargez des textes intégraux en EPUB/PDF et visualisez des vidéos avec narration vocale haute fidélité.',
    playRichDadFilm: 'Lancer le Court-Métrage "Père Riche"',
    searchPlaceholder: 'Rechercher des ebooks de finance (ex. "Père Riche", "Zebra", "Actifs")...',
    searchBtn: 'Chercher',
    categories: {
      'All': 'Tous les Livres',
      'Cashflow & Assets': 'Flux de Trésorerie & Actifs',
      'Zebra & Sustainable Startups': 'Startups Zèbres & Durabilité',
      'Mindset & Psychology': 'Psychologie & Mentalité',
      'Investing & Markets': 'Investissement & Marchés',
      'Debt & Wealth Systems': 'Dette & Systèmes de Richesse'
    },
    allLanguages: 'Toutes les Langues',
    openReadingRoom: 'Ouvrir la Lecture',
    downloadEbook: 'Télécharger Ebook',
    listenWithTTS: 'Écouter avec TTS',
    aiSummary: 'Résumé IA',
    shortFilm: 'Court-Métrage',
    tableOfContents: 'Table des Matières',
    directDownload: 'Téléchargement Direct',
    previousChapter: 'Chapitre Précédent',
    nextChapter: 'Chapitre Suivant',
    watchFilmAdaptation: 'Voir l\'Adaptation Vidéo',
    exportVideo: 'Enregistrer la Vidéo (.webm)',
    recordingInProgress: 'Rendu et Enregistrement en cours...',
    videoStyle: 'Style Vidéo',
    languageVoice: 'Langue & Voix'
  },
  de: {
    brandTitle: 'FinLibre',
    globalLibrary: 'Globale Bibliothek',
    virtualCinema: 'Virtuelles Kino',
    aiSummaries: 'KI-Zusammenfassungen',
    searchCatalog: 'Katalog durchsuchen',
    createShortFilm: 'Kurzfilm erstellen',
    watchShortFilms: 'Kurzfilme ansehen',
    heroHeadline: 'Globale Finanzklassiker, Sofort-Ebooks und KI-Kurzfilme.',
    heroSubtitle: 'Entdecken Sie zeitlose Wohlstandsliteratur—von Rich Dad Poor Dad bis zu nachhaltigen Zebra-Unternehmen. Laden Sie vollständige EPUB/PDF-Bücher herunter und sehen Sie dynamische Videoverfilmungen mit erstklassiger Sprachausgabe.',
    playRichDadFilm: 'Kurzfilm "Rich Dad Poor Dad" abspielen',
    searchPlaceholder: 'Finanz-Ebooks durchsuchen (z. B. "Rich Dad", "Zebra", "Vermögen")...',
    searchBtn: 'Suchen',
    categories: {
      'All': 'Alle Bände',
      'Cashflow & Assets': 'Cashflow & Vermögenswerte',
      'Zebra & Sustainable Startups': 'Zebra-Startups & Nachhaltigkeit',
      'Mindset & Psychology': 'Mindset & Finanzpsychologie',
      'Investing & Markets': 'Investieren & Märkte',
      'Debt & Wealth Systems': 'Schulden & Vermögenssysteme'
    },
    allLanguages: 'Alle Sprachen',
    openReadingRoom: 'Leseraum öffnen',
    downloadEbook: 'Ebook herunterladen',
    listenWithTTS: 'Mit TTS anhören',
    aiSummary: 'KI-Zusammenfassung',
    shortFilm: 'Kurzfilm',
    tableOfContents: 'Inhaltsverzeichnis',
    directDownload: 'Direktdownload',
    previousChapter: 'Vorheriges Kapitel',
    nextChapter: 'Nächstes Kapitel',
    watchFilmAdaptation: 'Verfilmung ansehen',
    exportVideo: 'Video aufnehmen & exportieren (.webm)',
    recordingInProgress: 'Video wird gerendert...',
    videoStyle: 'Videostil',
    languageVoice: 'Sprache & Stimme'
  },
  zh: {
    brandTitle: 'FinLibre',
    globalLibrary: '全球图书馆',
    virtualCinema: '虚拟影院',
    aiSummaries: 'AI总结',
    searchCatalog: '搜索书目',
    createShortFilm: '制作微电影',
    watchShortFilms: '观看短片',
    heroHeadline: '全球经典财经巨著、即时电子书与AI短片。',
    heroSubtitle: '探索永恒的财富哲学——从《富爸爸穷爸爸》到斑马企业（Zebra Learning）可持续经济。下载完整EPUB/PDF书籍，观看高品质语音旁白的动态短片。',
    playRichDadFilm: '播放《富爸爸穷爸爸》微电影',
    searchPlaceholder: '搜索全球财经电子书、主题（如“富爸爸”、“斑马”、“资产”、“投资”）...',
    searchBtn: '搜索',
    categories: {
      'All': '所有书籍',
      'Cashflow & Assets': '现金流与资产',
      'Zebra & Sustainable Startups': '斑马企业与可持续商业',
      'Mindset & Psychology': '财富心智与心理学',
      'Investing & Markets': '投资与金融市场',
      'Debt & Wealth Systems': '债务与财富体系'
    },
    allLanguages: '全部语言',
    openReadingRoom: '打开阅读室',
    downloadEbook: '下载电子书',
    listenWithTTS: 'TTS语音朗读',
    aiSummary: 'AI总结',
    shortFilm: '微电影',
    tableOfContents: '目录',
    directDownload: '直接下载',
    previousChapter: '上一章',
    nextChapter: '下一章',
    watchFilmAdaptation: '观看微电影改编',
    exportVideo: '录制并导出视频 (.webm)',
    recordingInProgress: '正在渲染并录制视频...',
    videoStyle: '视频视觉风格',
    languageVoice: '语言与配音'
  },
  ja: {
    brandTitle: 'FinLibre',
    globalLibrary: 'グローバル図書館',
    virtualCinema: 'バーチャル映画館',
    aiSummaries: 'AI要約',
    searchCatalog: 'カタログ検索',
    createShortFilm: 'ショートフィルム制作',
    watchShortFilms: '短編映画を観る',
    heroHeadline: '世界の金融名著、即時電子書籍、AIショートフィルム。',
    heroSubtitle: '『金持ち父さん 貧乏父さん』から持続可能なゼブラ学習経済まで。完全なEPUB/PDFをダウンロードし、高音質な音声ナレーション付きの短編映画をお楽しみください。',
    playRichDadFilm: '『金持ち父さん』短編映画を再生',
    searchPlaceholder: '金融書籍、キーワードを検索（例:「金持ち父さん」「ゼブラ」「資産」）...',
    searchBtn: '検索',
    categories: {
      'All': 'すべての書籍',
      'Cashflow & Assets': 'キャッシュフローと資産',
      'Zebra & Sustainable Startups': 'ゼブラ企業と持続可能ビジネス',
      'Mindset & Psychology': 'マインドセットとお金の心理学',
      'Investing & Markets': '投資と株式市場',
      'Debt & Wealth Systems': '負債と富のシステム'
    },
    allLanguages: 'すべての言語',
    openReadingRoom: '読書室を開く',
    downloadEbook: '電子書籍をダウンロード',
    listenWithTTS: 'TTSで聴く',
    aiSummary: 'AI要約',
    shortFilm: '短編映画',
    tableOfContents: '目次',
    directDownload: '直接ダウンロード',
    previousChapter: '前の章',
    nextChapter: '次の章',
    watchFilmAdaptation: '映画化作品を視聴',
    exportVideo: '動画を録画・出力 (.webm)',
    recordingInProgress: '動画をレンダリング・録画中...',
    videoStyle: '動画スタイル',
    languageVoice: '言語と音声'
  },
  ar: {
    brandTitle: 'FinLibre',
    globalLibrary: 'المكتبة العالمية',
    virtualCinema: 'السينما الافتراضية',
    aiSummaries: 'ملخصات الذكاء الاصطناعي',
    searchCatalog: 'بحث في الكتب',
    createShortFilm: 'إنشاء فيلم قصير',
    watchShortFilms: 'مشاهدة الأفلام القصيرة',
    heroHeadline: 'كلاسيكيات المال العالمية، كتب إلكترونية وأفلام قصيرة بالذكاء الاصطناعي.',
    heroSubtitle: 'استكشف أدبيات الثروة الخالدة—من الأب الغني والأب الفقير إلى اقتصاد حمار الوحش المستدام. حمّل ملفات EPUB/PDF وشاهد أفلاماً قصيرة مع تعليق صوتي فائق الجودة.',
    playRichDadFilm: 'تشغيل فيلم "الأب الغني والأب الفقير"',
    searchPlaceholder: 'ابحث في كتب المال، المواضيع (مثل: الأب الغني، أصول، استثمار)...',
    searchBtn: 'بحث',
    categories: {
      'All': 'جميع المجلدات',
      'Cashflow & Assets': 'التدفق النقدي والأصول',
      'Zebra & Sustainable Startups': 'شركات الزيبرا والاستدامة',
      'Mindset & Psychology': 'العقلية وعلم نفس المال',
      'Investing & Markets': 'الاستثمار والأسواق',
      'Debt & Wealth Systems': 'الديون وأنظمة الثروة'
    },
    allLanguages: 'كل اللغات',
    openReadingRoom: 'فتح قاعة القراءة',
    downloadEbook: 'تحميل الكتاب',
    listenWithTTS: 'استماع صوتي (TTS)',
    aiSummary: 'ملخص الذكاء الاصطناعي',
    shortFilm: 'فيلم قصير',
    tableOfContents: 'جدول المحتويات',
    directDownload: 'تحميل مباشر',
    previousChapter: 'الفصل السابق',
    nextChapter: 'الفصل التالي',
    watchFilmAdaptation: 'مشاهدة الاقتباس المرئي',
    exportVideo: 'تسجيل وتصدير الفيديو (.webm)',
    recordingInProgress: 'جارٍ تجهيز وتسجيل الفيديو...',
    videoStyle: 'نمط الفيديو',
    languageVoice: 'اللغة والصوت'
  }
};
