import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  X,
  Palette,
  Eye,
  ArrowRight,
  Terminal,
  TrendingUp,
  ListTodo,
  Bell,
  Cpu,
  Bookmark,
  Layers,
  FileText
} from 'lucide-react';
import { DesignVariantId, DesignVariant } from '../types';
import { DESIGN_VARIANTS } from '../data/designVariants';

interface VariantSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVariantId: DesignVariantId;
  onSelectVariant: (variantId: DesignVariantId) => void;
  isDarkUi: boolean;
  contentTitle?: string;
  contentSubtitle?: string;
  authorName?: string;
}

export const VariantSelectorModal: React.FC<VariantSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedVariantId,
  onSelectVariant,
  isDarkUi,
  contentTitle,
  contentSubtitle,
  authorName = 'Arijal Meutuwah',
}) => {
  const [activeVariantId, setActiveVariantId] = useState<DesignVariantId>(
    selectedVariantId || 'variant-1-tech'
  );
  const [previewMode, setPreviewMode] = useState<'cover' | 'content'>('cover');

  if (!isOpen) return null;

  const currentVariant =
    DESIGN_VARIANTS.find((v) => v.id === activeVariantId) || DESIGN_VARIANTS[0];

  const handleApply = () => {
    onSelectVariant(activeVariantId);
    onClose();
  };

  const displayTitle = contentTitle?.trim() || currentVariant.sampleTitle;
  const displaySubtitle = contentSubtitle?.trim() || currentVariant.sampleSubtitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`w-full max-w-5xl rounded-2xl shadow-2xl border overflow-hidden my-auto flex flex-col max-h-[92vh] ${
          isDarkUi
            ? 'bg-[#0b1120] border-slate-700/80 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDarkUi ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-900 flex items-center justify-center shadow-lg shadow-amber-500/20 font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Pilih Varian Gaya Desain E-Book
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Live Preview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pilih 1 dari 5 varian tata letak & visual infografis yang paling cocok untuk materi Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkUi ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split into Variant Picker (Left) and Live Preview (Right) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Variant List */}
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Pilihan Varian ({DESIGN_VARIANTS.length} Gaya)</span>
              <span className="text-[11px] text-amber-500">Klik untuk melihat preview</span>
            </div>

            <div className="space-y-2.5">
              {DESIGN_VARIANTS.map((variant, idx) => {
                const isSelected = variant.id === activeVariantId;
                return (
                  <button
                    key={variant.id}
                    onClick={() => setActiveVariantId(variant.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col gap-2 ${
                      isSelected
                        ? isDarkUi
                          ? 'bg-slate-800/90 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                          : 'bg-amber-50/50 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                        : isDarkUi
                        ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: variant.palette.bg }}
                        >
                          {idx + 1}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {variant.name}
                        </h4>
                      </div>
                      {variant.isMainVariant ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Varian Utama ⭐
                        </span>
                      ) : (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${variant.palette.accent}15`,
                            color: variant.palette.accent,
                            border: `1px solid ${variant.palette.accent}30`,
                          }}
                        >
                          {variant.category.split(',')[0]}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {variant.tagline}
                    </p>

                    {/* Color Swatch & Motifs */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: variant.palette.bg }}
                          title="Warna Utama"
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: variant.palette.accent }}
                          title="Aksen"
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: variant.palette.surface }}
                          title="Surface"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {isSelected ? 'Sedang Ditampilkan' : 'Klik Pratinjau'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Live Visual Preview */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Live Interactive Preview</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewMode('cover')}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                    previewMode === 'cover'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Slide Cover
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('content')}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                    previewMode === 'content'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Slide Isi (Modul)
                </button>
              </div>
            </div>

            {/* Simulated Mobile Card 4:5 Aspect Ratio */}
            <div className="w-full flex-1 min-h-[420px] rounded-2xl shadow-xl overflow-hidden border border-slate-700/50 flex flex-col relative transition-all duration-300 select-none"
              style={{
                backgroundColor: currentVariant.palette.surface,
                color: currentVariant.palette.primaryText,
                borderColor: currentVariant.palette.border,
              }}
            >
              {/* Background Pattern Layer */}
              {activeVariantId === 'variant-1-tech' && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    backgroundImage: `radial-gradient(${currentVariant.palette.bg} 1px, transparent 1px)`,
                    backgroundSize: '16px 16px',
                  }}
                />
              )}

              {activeVariantId === 'variant-3-productivity' && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: `linear-gradient(${currentVariant.palette.accent} 1px, transparent 1px), linear-gradient(90deg, ${currentVariant.palette.accent} 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                  }}
                />
              )}

              {activeVariantId === 'variant-5-dark-ai' && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-25"
                  style={{
                    backgroundImage: `radial-gradient(circle at 80% 20%, ${currentVariant.palette.accent}15 0%, transparent 60%), linear-gradient(#1e293b 1px, transparent 1px)`,
                    backgroundSize: '100% 100%, 20px 20px',
                  }}
                />
              )}

              {/* CARD TOP BAR */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-b relative z-10"
                style={{ borderColor: `${currentVariant.palette.border}` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wider"
                    style={{
                      backgroundColor: currentVariant.palette.badgeBg,
                      color: currentVariant.palette.badgeText,
                    }}
                  >
                    01 • {currentVariant.category.split(',')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: currentVariant.palette.secondaryText }}
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>{currentVariant.name.split(' ')[1] || 'Edition'}</span>
                </div>
              </div>

              {/* CARD BODY CONTENT */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between relative z-10">
                {previewMode === 'cover' ? (
                  /* COVER PREVIEW */
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span
                        className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded inline-block"
                        style={{
                          backgroundColor: `${currentVariant.palette.accent}20`,
                          color: currentVariant.palette.accent,
                          border: `1px solid ${currentVariant.palette.accent}40`,
                        }}
                      >
                        PANDUAN EKSKLUSIF
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
                        {displayTitle}
                      </h3>
                      <p
                        className="text-xs sm:text-sm leading-relaxed"
                        style={{ color: currentVariant.palette.secondaryText }}
                      >
                        {displaySubtitle}
                      </p>
                    </div>

                    {/* Variant Specific Visual Mockups on Cover */}
                    {activeVariantId === 'variant-1-tech' && (
                      <div className="bg-slate-900 text-slate-200 rounded-xl p-3 border border-slate-800 shadow-md font-mono text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-slate-800 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          <span className="text-[9px] text-slate-400 pl-2">terminal — python3</span>
                        </div>
                        <div className="text-amber-400 font-bold"># Step 1: Import Library</div>
                        <div className="text-emerald-400">&gt; import pandas as pd</div>
                        <div className="text-slate-400">&gt; df = pd.read_csv(&apos;data.csv&apos;)</div>
                      </div>
                    )}

                    {activeVariantId === 'variant-2-wealth' && (
                      <div className="bg-white/90 border border-amber-500/30 rounded-xl p-3 shadow-md space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 uppercase">
                          <span>Verified Growth Strategy</span>
                          <span>ROI: +340%</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-slate-900">$10,000</span>
                          <span className="text-xs text-emerald-600 font-bold">➔ Pasif & Stabil</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Sistem alokasi aset teruji untuk stabilitas jangka panjang.
                        </p>
                      </div>
                    )}

                    {activeVariantId === 'variant-3-productivity' && (
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Sistem Kerja Harian
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Fokus Blok 90 Menit Tanpa Distraksi</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Selesaikan Tugas Terberat di Pagi Hari</span>
                        </div>
                      </div>
                    )}

                    {activeVariantId === 'variant-4-creator' && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-3 shadow-md space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-purple-700">
                          <Bell className="w-3.5 h-3.5 text-pink-500" />
                          <span>Notifikasi Viral Terbuka: +25.4K Views</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900">
                          &quot;Konten ini disimpan oleh 1.420 orang dalam 2 jam!&quot;
                        </p>
                      </div>
                    )}

                    {activeVariantId === 'variant-5-dark-ai' && (
                      <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-3 shadow-lg shadow-cyan-500/10 space-y-1 font-mono">
                        <div className="flex items-center justify-between text-[10px] text-cyan-400">
                          <span>AGENT CORE // STATUS: ONLINE</span>
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        </div>
                        <div className="text-xs text-slate-200 font-bold">
                          Autonomous Loop: Reason ➔ Call Tool ➔ Deliver
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* CONTENT PREVIEW */
                  <div className="space-y-3.5">
                    <div className="border-b pb-2" style={{ borderColor: currentVariant.palette.border }}>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: currentVariant.palette.accent }}
                      >
                        Modul 1 • Fondasi Utama
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        Poin Kunci & Langkah Implementasi
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {currentVariant.samplePoints.map((pt, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl border flex items-start gap-2.5 shadow-sm text-xs leading-relaxed"
                          style={{
                            backgroundColor:
                              activeVariantId === 'variant-5-dark-ai'
                                ? 'rgba(30, 41, 59, 0.6)'
                                : 'rgba(255, 255, 255, 0.8)',
                            borderColor: currentVariant.palette.border,
                          }}
                        >
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                            style={{ backgroundColor: currentVariant.palette.bg }}
                          >
                            {i + 1}
                          </span>
                          <span style={{ color: currentVariant.palette.primaryText }}>{pt}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Formula / Summary Bar */}
                    <div
                      className="p-2.5 rounded-xl text-xs font-bold flex items-center justify-between"
                      style={{
                        backgroundColor: `${currentVariant.palette.accent}25`,
                        color: currentVariant.palette.primaryText,
                        border: `1px solid ${currentVariant.palette.accent}50`,
                      }}
                    >
                      <span>💡 Formula: Input ➔ Proses ➔ Output</span>
                      <span className="text-[10px] font-mono">100% Praktis</span>
                    </div>
                  </div>
                )}

                {/* CARD FOOTER */}
                <div
                  className="pt-3 border-t flex items-center justify-between text-[11px] font-medium"
                  style={{
                    borderColor: currentVariant.palette.border,
                    color: currentVariant.palette.secondaryText,
                  }}
                >
                  <span>Disusun oleh: {authorName}</span>
                  <span className="font-bold" style={{ color: currentVariant.palette.accent }}>
                    CarouselX E-Book Studio
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between ${
            isDarkUi ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/70'
          }`}
        >
          <div className="text-xs text-slate-400">
            Varian Terpilih: <strong className="text-slate-200">{currentVariant.name}</strong>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isDarkUi ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              Batal
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <span>Terapkan Varian Ini</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
