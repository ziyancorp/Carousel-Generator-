import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  RefreshCw,
  User,
  Palette,
  FileSpreadsheet,
  Lightbulb,
  Check,
  AlertCircle,
  Plus,
  Type,
  FileEdit,
  Sun,
  Moon,
  Cpu,
  Layers,
  HardDrive,
  Table,
  RotateCcw,
  ShieldCheck,
  Presentation
} from 'lucide-react';
import { ThemeId, FontId, AspectRatio, ApiKeyConfig } from '../types';
import { THEMES, FONT_OPTIONS } from '../constants/themes';
import { SAMPLE_PRESETS, CarouselPreset } from '../data/samplePresets';

interface SidebarProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  slideCount: number;
  onSlideCountChange: (count: number) => void;
  authorName: string;
  onAuthorNameChange: (name: string) => void;
  authorHandle: string;
  onAuthorHandleChange: (handle: string) => void;
  tone: string;
  onToneChange: (tone: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  currentFont: FontId;
  onFontChange: (font: FontId) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onOpenSlidesExport?: () => void;
  onOpenSlidesImport?: () => void;
  onOpenDriveExport?: () => void;
  onOpenSheetsSync?: () => void;
  onOpenSheetsImport: () => void;
  onOpenContentWritingModal: () => void;
  onOpenApiKeyModal: () => void;
  apiKeyConfig?: ApiKeyConfig;
  isGoogleConnected?: boolean;
  onConnectGoogle?: () => void;
  onSelectPreset?: (preset: CarouselPreset) => void;
  onOpenMaterialIngest?: () => void;
}

const TONES = [
  { id: 'santai dan engaging', label: 'Santai & Engaging' },
  { id: 'langkah demi langkah tutorial', label: 'Step-by-Step Tutorial' },
  { id: 'profesional dan berwawasan', label: 'Profesional & Berwawasan' },
  { id: 'storytelling dan inspiratif', label: 'Storytelling Inspiratif' },
  { id: 'kontroversial dan provokatif', label: 'Controversial & Bold' },
];

const LANGUAGES = [
  { id: 'Indonesian', label: '🇮🇩 Bahasa Indonesia' },
  { id: 'English', label: '🇬🇧 English' },
  { id: 'Spanish', label: '🇪🇸 Spanish' },
  { id: 'French', label: '🇫🇷 French' },
  { id: 'German', label: '🇩🇪 German' },
];

const QUICK_INSPIRATIONS = [
  'Run Claude Code for Free with Kimi K2.6',
  'Rahasia Ngonten Tanpa Wajah: Dari 0 ke 100K Followers',
  '5 AI Tools yang Menghemat Waktu Kerja 20 Jam Seminggu',
  'Framework Copywriting Hook 3 Detik yang Bikin Viral',
  '7 Kesalahan Fatal Fresh Graduate Saat Bikin Portofolio Tech',
  'Roadmap Belajar Full-Stack Web Dev dari Nol Sampai Mahir',
];

export const Sidebar: React.FC<SidebarProps> = ({
  topic,
  onTopicChange,
  slideCount,
  onSlideCountChange,
  authorName,
  onAuthorNameChange,
  authorHandle,
  onAuthorHandleChange,
  tone,
  onToneChange,
  language,
  onLanguageChange,
  currentTheme,
  onThemeChange,
  currentFont,
  onFontChange,
  aspectRatio,
  onAspectRatioChange,
  isGenerating,
  onGenerate,
  onOpenSlidesExport,
  onOpenSlidesImport,
  onOpenDriveExport,
  onOpenSheetsSync,
  onOpenSheetsImport,
  onOpenContentWritingModal,
  onOpenApiKeyModal,
  apiKeyConfig,
  isGoogleConnected,
  onConnectGoogle,
  onSelectPreset,
  onOpenMaterialIngest,
}) => {
  const [showInspirations, setShowInspirations] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const activeProvider = apiKeyConfig?.provider || 'gemini';

  return (
    <aside className="w-full md:w-84 lg:w-[320px] border-r border-[#1f1f23] bg-[#111114] text-gray-200 flex flex-col h-full overflow-y-auto shrink-0 z-20 transition-colors duration-200">
      <div className="p-4 sm:p-5 flex-1 space-y-5">
        {/* Ingest Materi Multi-Source Pipeline Banner */}
        {onOpenMaterialIngest && (
          <div className="p-3.5 rounded-xl border bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 border-indigo-500/40 shadow-lg shadow-indigo-950/40 flex items-center justify-between transition hover:border-indigo-400">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-tight">Ingest Materi (AI Hub)</p>
                <p className="text-[10px] text-indigo-300">YouTube, Web, PDF, Teks</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenMaterialIngest}
              className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-md shadow-indigo-600/30"
            >
              Mulai
            </button>
          </div>
        )}

        {/* AI Provider Status Card */}
        <div className="p-3 rounded-xl bg-[#18181d] border border-[#2d2d35] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                {activeProvider} AI
              </p>
              <p className="text-[10px] text-gray-400">
                {apiKeyConfig?.apiKey ? 'Custom API Key' : 'Default Studio Key'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline"
          >
            Ubah
          </button>
        </div>

        {/* Content Box Quick Action Banner */}
        <div className="p-3 rounded-xl border bg-blue-950/20 border-blue-500/25 flex items-center justify-between transition">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-500 flex items-center justify-center">
              <FileEdit className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Tulis Konten Sendiri</p>
              <p className="text-[10px] text-gray-400">Ketik/tempel naskah bebas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenContentWritingModal}
            className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
          >
            Buka Box
          </button>
        </div>

        {/* Presets Gallery Accordion */}
        {onSelectPreset && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Template Viral Presets
              </label>
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="text-[10px] uppercase font-bold tracking-wider text-blue-400 hover:text-blue-300 transition"
              >
                {showPresets ? 'Sembunyikan' : 'Pilih Template'}
              </button>
            </div>

            {showPresets && (
              <div className="grid grid-cols-1 gap-2 p-2.5 rounded-xl bg-[#18181d] border border-[#2d2d35]">
                {SAMPLE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectPreset(p);
                      setShowPresets(false);
                    }}
                    className="p-2 rounded-lg bg-[#202027] hover:bg-blue-600/20 hover:border-blue-500/40 border border-transparent text-left transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-300">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {p.slides.length} Slide • {p.authorHandle}
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                      Pakai
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Topic Input Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="topic-input" className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Topik Carousel
            </label>
            <button
              type="button"
              id="inspiration-btn"
              onClick={() => setShowInspirations(!showInspirations)}
              className="text-[10px] uppercase font-bold tracking-wider text-blue-500 hover:text-blue-400 flex items-center gap-1 transition"
            >
              <Lightbulb className="w-3 h-3" />
              {showInspirations ? 'Tutup' : 'Inspirasi AI'}
            </button>
          </div>

          <textarea
            id="topic-input"
            rows={3}
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="Contoh: 5 Kebiasaan Kreatif yang Menghemat 20 Jam Kerja Seminggu..."
            className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-xl p-3 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition resize-none leading-relaxed"
          />

          {showInspirations && (
            <div className="p-2.5 bg-[#18181d] border border-[#2d2d35] rounded-xl space-y-1.5 animate-fadeIn">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pilih Cepat:</p>
              {QUICK_INSPIRATIONS.map((insp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onTopicChange(insp);
                    setShowInspirations(false);
                  }}
                  className="w-full text-left p-1.5 text-xs rounded-lg hover:bg-blue-600/20 hover:text-blue-300 text-gray-300 transition line-clamp-1"
                >
                  • {insp}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Slide Count Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Jumlah Slide
            </span>
            <span className="font-bold text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded-md">
              {slideCount} Slide
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={10}
            value={slideCount}
            onChange={(e) => onSlideCountChange(parseInt(e.target.value, 10))}
            className="w-full accent-blue-600 bg-[#2d2d35] h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>3 (Ringkas)</span>
            <span>7 (Standar)</span>
            <span>10 (Mendalam)</span>
          </div>
        </div>

        {/* Tone & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Gaya Bahasa
            </label>
            <select
              value={tone}
              onChange={(e) => onToneChange(e.target.value)}
              className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
            >
              {TONES.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#111114]">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Bahasa
            </label>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-blue-500 transition"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id} className="bg-[#111114]">
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Author / Creator Branding (Permanent Default) */}
        <div className="space-y-2 pt-2 border-t border-[#1f1f23]">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Branding Kreator (Footer Slide)
            </label>
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5 bg-emerald-950/30 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3" /> Permanen
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={authorName}
              onChange={(e) => onAuthorNameChange(e.target.value)}
              placeholder="Arijal Meutuwah"
              className="bg-[#1a1a1f] border border-[#2d2d35] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
            />
            <input
              type="text"
              value={authorHandle}
              onChange={(e) => onAuthorHandleChange(e.target.value)}
              placeholder="@abangjal"
              className="bg-[#1a1a1f] border border-[#2d2d35] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 transition font-mono"
            />
          </div>
          {(authorName !== 'Arijal Meutuwah' || authorHandle !== '@abangjal') && (
            <button
              type="button"
              onClick={() => {
                onAuthorNameChange('Arijal Meutuwah');
                onAuthorHandleChange('@abangjal');
              }}
              className="text-[10px] text-gray-400 hover:text-blue-400 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Reset ke default (Arijal Meutuwah / @abangjal)
            </button>
          )}
        </div>

        {/* Google Workspace Hub Quick Actions */}
        <div className="pt-2 border-t border-[#1f1f23] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400">
            <span>Google Workspace Hub</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-mono">Slides + Sheets</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={onOpenSlidesExport}
              className="py-2 px-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Presentation className="w-3.5 h-3.5 text-amber-400" />
              <span>Slides Deck</span>
            </button>

            <button
              type="button"
              onClick={onOpenSheetsImport}
              className="py-2 px-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Generate Button */}
      <div className="p-4 border-t border-[#1f1f23] bg-[#0d0d10] shrink-0">
        <button
          type="button"
          id="generate-carousel-btn"
          disabled={isGenerating}
          onClick={onGenerate}
          className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Menyusun Slide dengan AI...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Generate Carousel AI ({slideCount} Slide)</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
