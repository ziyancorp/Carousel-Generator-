import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  RefreshCw,
  Cpu,
  User,
  ShieldCheck,
  RotateCcw,
  Layers,
  FileText,
  UploadCloud,
  Trash2
} from 'lucide-react';
import { AspectRatio, ThemeId, FontId, ApiKeyConfig, CarouselPreset } from '../types';
import { SAMPLE_PRESETS } from '../data/samplePresets';

interface SidebarProps {
  topic: string;
  onTopicChange: (topic: string) => void;
  sourceMaterial: string;
  onSourceMaterialChange: (material: string) => void;
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

export const Sidebar: React.FC<SidebarProps> = ({
  topic,
  onTopicChange,
  sourceMaterial,
  onSourceMaterialChange,
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
  const [showPresets, setShowPresets] = useState(false);
  const activeProvider = apiKeyConfig?.provider || 'xkiro';

  const materialWordCount = sourceMaterial.trim()
    ? sourceMaterial.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <aside className="w-full md:w-80 lg:w-[310px] border-r border-[#1f1f23] bg-[#111114] text-gray-200 flex flex-col h-full overflow-y-auto shrink-0 z-20 transition-colors duration-200">
      <div className="p-4 sm:p-5 flex-1 space-y-4">
        {/* Pipeline A Indicator Banner */}
        <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs">⚡</span>
            <div>
              <p className="text-[11px] font-black text-blue-300 uppercase tracking-wider">
                Pipeline A: Carousel Cepat
              </p>
              <p className="text-[10px] text-gray-400">
                Langsung dari materi tanpa buat E-Book
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-400 border border-blue-500/30 font-mono">
            FAST
          </span>
        </div>

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
                {apiKeyConfig?.model ? apiKeyConfig.model.split('/').pop() : 'DeepSeek v3.1 / Spark'}
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

        {/* PRIMARY INPUT: Source Material (NotebookLM style) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="source-material-input" className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Materi Sumber (Input Utama)
            </label>
            {materialWordCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {materialWordCount} kata
                </span>
                <button
                  type="button"
                  onClick={() => onSourceMaterialChange('')}
                  title="Hapus materi"
                  className="p-1 text-gray-400 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <textarea
            id="source-material-input"
            rows={5}
            value={sourceMaterial}
            onChange={(e) => onSourceMaterialChange(e.target.value)}
            placeholder="Tempel naskah, artikel, transkrip, atau catatan di sini...&#10;&#10;AI akan membedah poin-poin asli dari materi ini dan otomatis menyusunnya menjadi slide carousel."
            className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-xl p-3 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition resize-none leading-relaxed"
          />

          {/* Ingest External Sources Button */}
          {onOpenMaterialIngest && (
            <button
              type="button"
              onClick={onOpenMaterialIngest}
              className="w-full p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/30 hover:border-indigo-400/50 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition group"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition" />
              <span>+ Ingest Link Web, YouTube, atau PDF</span>
            </button>
          )}
        </div>

        {/* SECONDARY INPUT: Topic / Title (Optional, Auto-extracted by AI) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="topic-input" className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Judul / Topik (Opsional)
            </label>
            <span className="text-[9px] text-gray-400 bg-[#1c1c22] px-1.5 py-0.5 rounded border border-[#2d2d35]">
              Otomatis dari AI
            </span>
          </div>

          <input
            id="topic-input"
            type="text"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="Bisa dikosongkan (AI otomatis membuat judul)..."
            className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
          />
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
                {showPresets ? 'Tutup' : 'Lihat Preset'}
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
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5 bg-emerald-950/30 border border-emerald-500/20 px-1.5 py-0.5 rounded" title="Tersimpan di perangkat ini, dapat Anda ganti kapan saja">
              <ShieldCheck className="w-3 h-3" /> Tersimpan (Bisa Diedit)
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
              <span>Membedah & Menyusun Slide...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>⚡ Olah Materi Jadi Carousel AI ({slideCount} Slide)</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
