import React from 'react';
import {
  Layers,
  Ratio,
  Download,
  Sun,
  Moon,
  Type,
  ChevronDown,
  BookOpen,
  Sparkles,
  Cpu
} from 'lucide-react';
import { AspectRatio, ThemeId, FontId, AppUiMode, ActiveAppTab, ApiKeyConfig } from '../types';
import { THEMES, FONT_OPTIONS } from '../constants/themes';

interface NavbarProps {
  activeTab: ActiveAppTab;
  onTabChange: (tab: ActiveAppTab) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  currentFont: FontId;
  onFontChange: (font: FontId) => void;
  appUiMode: AppUiMode;
  onToggleAppUiMode: () => void;
  onOpenExportModal: () => void;
  onOpenApiKeyModal: () => void;
  onOpenMaterialIngest?: () => void;
  apiKeyConfig?: ApiKeyConfig;
  slideCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  aspectRatio,
  onAspectRatioChange,
  currentTheme,
  onThemeChange,
  currentFont,
  onFontChange,
  appUiMode,
  onToggleAppUiMode,
  onOpenExportModal,
  onOpenApiKeyModal,
  onOpenMaterialIngest,
  apiKeyConfig,
  slideCount,
}) => {
  const isDark = appUiMode === 'dark';
  const hasCustomKey = Boolean(apiKeyConfig?.apiKey);
  const activeProvider = apiKeyConfig?.provider || 'gemini';

  return (
    <header className={`h-16 border-b px-3 sm:px-5 flex items-center justify-between z-30 shrink-0 relative transition-colors duration-200 ${
      isDark ? 'bg-[#111114] border-[#1f1f23] text-white' : 'bg-white border-gray-200 text-gray-900 shadow-sm'
    }`}>
      {/* Left: Brand & Studio Mode Tabs */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
          {activeTab === 'carousel' ? (
            <Layers className="w-5 h-5 text-white" />
          ) : (
            <BookOpen className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="hidden min-[480px]:block">
          <div className="flex items-center gap-2">
            <h1 className={`font-bold text-xs sm:text-sm md:text-base tracking-tight truncate max-w-[130px] sm:max-w-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <span className="hidden md:inline">CarouselX Studio</span>
              <span className="md:hidden">CarouselX</span>
            </h1>
          </div>
          <p className="text-[10px] text-gray-400 hidden lg:block">AI Microblog & E-Book Generator</p>
        </div>

        {/* Tab Switcher: Carousel Studio (Pipeline A) vs E-Book Studio (Pipeline B) */}
        <nav aria-label="Tampilan Mode" className={`flex items-center p-1 rounded-xl border ${
          isDark ? 'bg-[#18181c] border-[#2d2d35]' : 'bg-gray-100 border-gray-300'
        }`}>
          <button
            type="button"
            onClick={() => onTabChange('carousel')}
            title="Pipeline A: Carousel Cepat (Microblog) langsung dari materi"
            className={`min-h-[36px] px-2.5 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'carousel'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">⚡ Carousel Cepat</span>
            <span className="sm:hidden">⚡ Carousel</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'carousel' ? 'bg-blue-700 text-white' : 'bg-gray-700/30 text-gray-400'
            }`}>
              {slideCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('ebook')}
            title="Pipeline B: E-Book Studio & Promo Kit (5 Desain, Format Interaktif & Siap Jual)"
            className={`min-h-[36px] px-2.5 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'ebook'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">📚 E-Book Studio</span>
            <span className="sm:hidden">📚 E-Book</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
              activeTab === 'ebook' ? 'bg-indigo-900/60 text-indigo-200' : 'bg-amber-500/20 text-amber-400'
            }`}>
              PROMO KIT
            </span>
          </button>
        </nav>

        {/* Ingest Materi Quick Action */}
        {onOpenMaterialIngest && (
          <button
            type="button"
            onClick={onOpenMaterialIngest}
            className="min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Ingest Materi</span>
            <span className="sm:hidden">+ Ingest</span>
          </button>
        )}
      </div>

      {/* Center Controls (When in Carousel Mode): Ratio, Theme, Font */}
      {activeTab === 'carousel' && (
        <div className="hidden xl:flex items-center gap-2">
          {/* Aspect Ratio */}
          <div className={`flex items-center p-0.5 rounded-xl border ${
            isDark ? 'bg-[#18181c] border-[#2d2d35]' : 'bg-gray-100 border-gray-300'
          }`}>
            <button
              type="button"
              onClick={() => onAspectRatioChange('4:5')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1 ${
                aspectRatio === '4:5'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Ratio className="w-3 h-3" />
              4:5 Portrait
            </button>
            <button
              type="button"
              onClick={() => onAspectRatioChange('1:1')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1 ${
                aspectRatio === '1:1'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="w-2.5 h-2.5 border border-current rounded-sm"></span>
              1:1 Square
            </button>
          </div>

          {/* Font Picker */}
          <div className="relative flex items-center">
            <div className="absolute left-2.5 pointer-events-none text-gray-400">
              <Type className="w-3.5 h-3.5" />
            </div>
            <select
              value={currentFont}
              onChange={(e) => onFontChange(e.target.value as FontId)}
              className={`text-xs font-medium rounded-xl pl-8 pr-7 py-1.5 border outline-none cursor-pointer appearance-none transition ${
                isDark
                  ? 'bg-[#18181c] text-gray-200 border-[#2d2d35] focus:border-blue-500'
                  : 'bg-gray-100 text-gray-800 border-gray-300 focus:border-blue-500'
              }`}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id} className={isDark ? 'bg-[#111114] text-white' : 'bg-white text-gray-900'}>
                  Font: {f.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 pointer-events-none" />
          </div>

          {/* Theme Picker */}
          <div className="relative flex items-center">
            <select
              value={currentTheme}
              onChange={(e) => onThemeChange(e.target.value as ThemeId)}
              className={`text-xs font-medium rounded-xl pl-3 pr-7 py-1.5 border outline-none cursor-pointer appearance-none transition ${
                isDark
                  ? 'bg-[#18181c] text-gray-200 border-[#2d2d35] focus:border-blue-500'
                  : 'bg-gray-100 text-gray-800 border-gray-300 focus:border-blue-500'
              }`}
            >
              {Object.values(THEMES).map((th) => (
                <option key={th.id} value={th.id} className={isDark ? 'bg-[#111114] text-white' : 'bg-white text-gray-900'}>
                  Tema: {th.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Right Controls: Theme Toggle, AI Key, Export */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleAppUiMode}
          title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          className={`min-h-[40px] min-w-[40px] p-2 rounded-xl border text-xs font-medium transition flex items-center justify-center ${
            isDark
              ? 'bg-[#18181c] border-[#2d2d35] text-amber-300 hover:bg-[#25252c]'
              : 'bg-gray-100 border-gray-300 text-amber-600 hover:bg-gray-200'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* AI Key Button */}
        <button
          type="button"
          onClick={onOpenApiKeyModal}
          title={`AI Provider: ${activeProvider.toUpperCase()}${hasCustomKey ? ' (Custom Key)' : ' (Default)'}`}
          className={`min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
            hasCustomKey
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              : isDark
              ? 'bg-[#18181c] border-[#2d2d35] text-gray-400 hover:text-white'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:text-gray-900'
          }`}
        >
          <Cpu className={`w-3.5 h-3.5 ${hasCustomKey ? 'text-emerald-400' : 'text-blue-400'}`} />
          <span className="hidden sm:inline font-mono font-semibold uppercase text-[11px]">
            {activeProvider}
          </span>
          <span className="sm:hidden">Key</span>
        </button>

        {/* Export Trigger Button */}
        {activeTab === 'carousel' ? (
          <button
            type="button"
            onClick={onOpenExportModal}
            disabled={slideCount === 0}
            className="min-h-[40px] px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onTabChange('carousel')}
            className="min-h-[40px] px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold text-gray-300 bg-[#1f293d] hover:bg-[#283650] border border-[#2d3a52] transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Ke Carousel</span>
            <span className="sm:hidden">Carousel</span>
          </button>
        )}
      </div>
    </header>
  );
};
