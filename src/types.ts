export type SlideType = 'hook' | 'content' | 'bullet' | 'comparison' | 'stat' | 'quote' | 'cta';

export type AspectRatio = '4:5' | '1:1';

export type ActiveAppTab = 'carousel' | 'ebook';

export type AiProvider = 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'groq' | 'openrouter' | 'custom';

export interface ApiKeyConfig {
  provider: AiProvider;
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export type ThemeId =
  | 'google-gemini-dark'
  | 'tech-guide-pro'
  | 'blueprint-system'
  | 'google-material-light'
  | 'cyber-neon'
  | 'midnight-slate'
  | 'editorial-warm'
  | 'minimal-paper-light'
  | 'emerald-growth'
  | 'sunset-radiant'
  | 'obsidian-luxe'
  | 'electric-purple';

export type FontId =
  | 'jakarta'
  | 'outfit'
  | 'syne'
  | 'space'
  | 'playfair'
  | 'poppins'
  | 'inter'
  | 'mono';

export type AppUiMode = 'dark' | 'light';

export interface Slide {
  id: string;
  slide_number: number;
  type: SlideType;
  title: string;
  body: string;
  badge?: string;
  footer_hint?: string;
  points?: string[];
  statValue?: string;
  statLabel?: string;
  icon?: string;
  // Enhanced properties for Tech Guide / Tutorial & Blueprint cards
  codeSnippet?: string;
  terminalTitle?: string;
  terminalType?: 'terminal' | 'input' | 'browser';
  tip?: string;
  highlightWord?: string;
  tag?: string;
  stepNumber?: number | string;
  stepBadge?: string;
  actionIcon?: string;
  ctaButtonText?: string;
}

export interface CarouselData {
  topic: string;
  slideCount: number;
  authorName: string;
  authorHandle: string;
  tone: string;
  language: string;
  fontId?: FontId;
  slides: Slide[];
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bgClass: string;
  cardBg: string;
  primaryGlow: string;
  badgeBg: string;
  badgeText: string;
  titleColor: string;
  bodyColor: string;
  accentColor: string;
  borderClass: string;
  fontFamily: string;
  footerColor: string;
  isDark: boolean;
  googleAccentBorder?: boolean;
  isDottedCanvas?: boolean;
  hasCornerBlobs?: boolean;
}

export interface FontOption {
  id: FontId;
  name: string;
  category: string;
  className: string;
  sampleText: string;
}

export interface TopicSuggestion {
  title: string;
  category: string;
  targetSlides: number;
}

// ==========================================
// E-BOOK DATA STRUCTURES (Lynk.id / PDF Ready)
// ==========================================

export interface EbookStep {
  number: number | string;
  title: string;
  text: string;
  badge?: string;
}

export interface EbookTable {
  title?: string;
  headers: string[];
  rows: {
    cols: string[];
    badgeCols?: { index: number; text: string; colorClass?: string }[];
  }[];
}

export interface EbookPromptItem {
  tag: string;
  category?: string;
  content: string;
}

export interface EbookCallout {
  type: 'info' | 'warning' | 'tip' | 'success';
  icon?: string;
  title: string;
  body: string;
}

export interface EbookModule {
  id: string;
  moduleNumber: number | string;
  badge?: string; // e.g. "Modul 1"
  title: string; // e.g. "Mindset & Fondasi Faceless Creator"
  description: string; // e.g. "Mengapa era tampil di depan kamera sudah tergantikan oleh Avatar AI."
  introCard?: {
    icon?: string; // e.g. "🎭"
    title: string;
    subtitle?: string;
    badge?: string;
    body: string;
    checklist?: string[]; // e.g. ["Estetika Visual: ...", "Relevansi Konten: ..."]
  };
  steps?: EbookStep[];
  table?: EbookTable;
  prompts?: EbookPromptItem[];
  callouts?: EbookCallout[];
}

export interface EbookData {
  id: string;
  title: string; // e.g. "RAHASIA NGONTEN TANPA WAJAH"
  tag: string; // e.g. "PANDUAN RESMI ZIYANCORP"
  subtitle: string;
  difficulty: string; // e.g. "Pemula (No-Code)"
  platform: string; // e.g. "Google Labs + Omni"
  monetization: string; // e.g. "Shopee / Lynk.id"
  format: string; // e.g. "Responsive & Print PDF"
  edition: string; // e.g. "Edisi 2026 • Lynk.id Ready"
  author: string; // e.g. "ZiyanCorp"
  modules: EbookModule[];
}
