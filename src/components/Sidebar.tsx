import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  RefreshCw,
  Lightbulb,
  Cpu,
  User,
  ShieldCheck,
  RotateCcw,
  Layers
} from 'lucide-react';
import { AspectRatio, ThemeId, FontId, ApiKeyConfig, CarouselPreset } from '../types';
import { SAMPLE_PRESETS } from '../data/samplePresets';

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
  onOpenApiKeyModal: () => void;
  apiKeyConfig?: ApiKeyConfig;
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
  isGenerating,
  onGenerate,
  onOpenApiKeyModal,
  apiKeyConfig,
  onSelectPreset,
  onOpenMaterialIngest,
}) => {
  const [showInspirations, setShowInspirations] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const activeProvider = apiKeyConfig?.provider || 'gemini';

  return (
    <aside className="w-full md:w-80 lg:w-[310px] border-r border-[#1f1f23] bg-[#111114] text-gray-200 flex flex-col h-full overflow-y-auto shrink-0 z-20 transition-colors duration-200">
      <div className="p-4 sm:p-5 flex-1 space-y-4">
        {/* Main Action: Unified Material & Content Ingestion Banner */}
        {onOpenMaterialIngest && (
          <div className="p-3.5 rounded-2xl border bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 border-indigo-500/40 shadow-lg shadow-indigo-950/40 flex items-center justify-between transition hover:border-indigo-400 group">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-tight">Ingest Materi AI</p>
                <p className="text-[10px] text-indigo-300">Teks, YouTube, Web URL, PDF</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenMaterialIngest}
              className="px-3 py-1.5 min-h-[36px] text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl transition shadow-md shadow-indigo-600/30 flex items-center gap-1"
            >
              <span>Buka</span>
              <span className="text-[10px]">✨</span>
            </button>
          </div>
        )}

        {/* AI Provider Status Card */}
        <div className="p-3 rounded-xl bg-[#18181d] border border-[#2d2d35] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                {activeProvider} AI
              </p>
              <p className="text-[10px] text-gray-400">
                {apiKeyConfig?.apiKey ? 'Custom API Key' : 'Default Key Ready'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold px-2 py-1 rounded-lg hover:bg-blue-950/30 transition"
          >
            Pengaturan
          </button>
        </div>

        {/* Presets Gallery Accordion */}
        {onSelectPreset && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Template Presets
              </label>
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="text-[10px] uppercase font-bold tracking-wider text-blue-400 hover:text-blue-300 transition"
              >
                {showPresets ? 'Tutup' : 'Pilih Template'}
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
            <span className="font-bold text-blue-400 font-mono bg-blue-500/10 px-2.5 py-0.5 rounded-md">
              {slideCount} Slide
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={10}
            value={slideCount}
            onChange={(e) => onSlideCountChange(parseInt(e.target.value, 10))}
            className="w-full accent-blue-600 bg-[#2d2d35] h-2 rounded-lg cursor-pointer"
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

        {/* Author / Creator Branding */}
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
      </div>

      {/* Bottom Sticky Generate Button */}
      <div className="p-4 border-t border-[#1f1f23] bg-[#0d0d10] shrink-0">
        <button
          type="button"
          id="generate-carousel-btn"
          disabled={isGenerating}
          onClick={onGenerate}
          className="w-full min-h-[48px] py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
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
