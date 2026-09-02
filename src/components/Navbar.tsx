import React from 'react';
import {
  Layers,
  HardDrive,
  Table,
  CheckCircle2,
  Ratio,
  Download,
  FolderUp,
  Key,
  FileEdit,
  Sun,
  Moon,
  Type,
  ChevronDown,
  BookOpen,
  Sparkles,
  Cpu,
  Presentation
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
  isGoogleConnected: boolean;
  onConnectGoogle: () => void;
  onOpenExportModal: () => void;
  onOpenDriveExport: () => void;
  onOpenSheetsSync: () => void;
  onOpenApiKeyModal: () => void;
  onOpenContentWritingModal: () => void;
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
  isGoogleConnected,
  onConnectGoogle,
  onOpenExportModal,
  onOpenDriveExport,
  onOpenSheetsSync,
  onOpenApiKeyModal,
  onOpenContentWritingModal,
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
      {/* Google Animated Gradient Accent Line */}
      <div className="google-gradient-bar h-[3px] w-full absolute top-0 left-0"></div>

      {/* Left: Brand & Studio Mode Tabs */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
          {activeTab === 'carousel' ? (
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          ) : (
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          )}
        </div>
        <div className="hidden min-[480px]:block">
          <div className="flex items-center gap-2">
            <h1 className={`font-bold text-xs sm:text-sm md:text-base tracking-tight truncate max-w-[130px] sm:max-w-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <span className="hidden md:inline">CarouselX & E-Book Studio</span>
              <span className="md:hidden">CarouselX</span>
            </h1>
          </div>
          <p className="text-[10px] text-gray-500 hidden lg:block">AI Microblog Carousel & Interactive E-Book Publisher</p>
        </div>

        {/* Tab Switcher: Carousel Studio vs E-Book Studio */}
        <div className={`flex items-center p-0.5 rounded-xl border ${
          isDark ? 'bg-[#18181c] border-[#2d2d35]' : 'bg-gray-100 border-gray-300'
        }`}>
          <button
            type="button"
            onClick={() => onTabChange('carousel')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1 sm:gap-1.5 ${
              activeTab === 'carousel'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Carousel</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'carousel' ? 'bg-blue-700 text-white' : 'bg-gray-700/30 text-gray-400'
            }`}>
              {slideCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('ebook')}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1 sm:gap-1.5 ${
              activeTab === 'ebook'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">E-Book</span>
            <span className={`text-[9px] px-1 sm:px-1.5 py-0.2 rounded font-bold uppercase ${
              activeTab === 'ebook' ? 'bg-indigo-900/60 text-indigo-200' : 'bg-amber-500/20 text-amber-400'
            }`}>
              PDF
            </span>
          </button>
        </div>

        {/* Ingest Materi Button */}
        {onOpenMaterialIngest && (
          <button
            type="button"
            onClick={onOpenMaterialIngest}
            className="ml-1 hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600/20 to-blue-600/20 hover:from-indigo-600/30 hover:to-blue-600/30 text-indigo-400 border border-indigo-500/30 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ingest Materi AI</span>
          </button>
        )}

        {/* Tulis Konten Button (Carousel Only) */}
        {activeTab === 'carousel' && (
          <button
            type="button"
            onClick={onOpenContentWritingModal}
            className="ml-1 hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/25 transition"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Tulis Konten</span>
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

      {/* Right Controls: Theme Toggle, Custom Multi-Provider AI Key, Google Workspace, Export */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleAppUiMode}
          title={isDark ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
          className={`p-2 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
            isDark
              ? 'bg-[#18181c] border-[#2d2d35] text-amber-300 hover:bg-[#25252c]'
              : 'bg-gray-100 border-gray-300 text-amber-600 hover:bg-gray-200'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Multi-Provider AI Key Button */}
        <button
          type="button"
          onClick={onOpenApiKeyModal}
          title={`AI Provider Aktif: ${activeProvider.toUpperCase()}${hasCustomKey ? ' (Custom Key)' : ' (Default)'}`}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
            hasCustomKey
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              : isDark
              ? 'bg-[#18181c] border-[#2d2d35] text-gray-400 hover:text-white'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:text-gray-900'
          }`}
        >
          <Cpu className={`w-3.5 h-3.5 ${hasCustomKey ? 'text-emerald-400' : 'text-blue-400'}`} />
          <span className="hidden md:inline font-mono font-semibold uppercase text-[11px]">
            {activeProvider}
          </span>
          <span className="md:hidden">AI Key</span>
        </button>

        {/* Google Workspace Connection Pill */}
        <button
          type="button"
          onClick={onConnectGoogle}
          title={isGoogleConnected ? 'Google Workspace (Slides, Drive & Sheets) Terhubung' : 'Buka Google Workspace Hub (Slides, Drive & Sheets)'}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
            isGoogleConnected
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
              : isDark
              ? 'bg-[#18181c] border-[#2d2d35] text-gray-400 hover:text-white'
              : 'bg-gray-100 border-gray-300 text-gray-700 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center -space-x-1">
            <Presentation className="w-3.5 h-3.5 text-amber-400" />
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="hidden sm:inline">
            {isGoogleConnected ? 'Google Hub' : 'Google Slides'}
          </span>
          {isGoogleConnected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        {/* Carousel Export Trigger (in Carousel Mode) */}
        {activeTab === 'carousel' ? (
          <button
            type="button"
            onClick={onOpenExportModal}
            disabled={slideCount === 0}
            className="px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export ({slideCount})</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onTabChange('carousel')}
            className="px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold text-gray-300 bg-[#1f293d] hover:bg-[#283650] border border-[#2d3a52] transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Ke Carousel Studio</span>
          </button>
        )}
      </div>
    </header>
  );
};
