import React, { useState, useEffect } from 'react';
import {
  X,
  Wand2,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Smile,
  ListOrdered,
  Tag
} from 'lucide-react';
import { Slide, SlideType } from '../types';
import { AVAILABLE_ICONS } from '../constants/themes';

interface SlideEditorModalProps {
  isOpen: boolean;
  slide: Slide | null;
  index: number;
  totalSlides: number;
  onClose: () => void;
  onSave: (updatedSlide: Slide) => void;
  onAiPolish: (slide: Slide, instruction: string) => Promise<Slide | null>;
}

const SLIDE_TYPES: { id: SlideType; label: string }[] = [
  { id: 'hook', label: '🔥 Hook / Opening' },
  { id: 'content', label: '📄 Standard / Strategy' },
  { id: 'bullet', label: '🔢 Bullet List / Steps' },
  { id: 'stat', label: '📊 Metric & Stat Highlight' },
  { id: 'cta', label: '⚡ Call to Action / Closing' },
];

export const SlideEditorModal: React.FC<SlideEditorModalProps> = ({
  isOpen,
  slide,
  index,
  totalSlides,
  onClose,
  onSave,
  onAiPolish,
}) => {
  const [draft, setDraft] = useState<Slide | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (slide) {
      setDraft({
        ...slide,
        points: slide.points ? [...slide.points] : [],
      });
    }
  }, [slide]);

  if (!isOpen || !draft) return null;

  const handlePointChange = (pIdx: number, val: string) => {
    const updated = [...(draft.points || [])];
    updated[pIdx] = val;
    setDraft({ ...draft, points: updated });
  };

  const handleAddPoint = () => {
    const updated = [...(draft.points || []), 'Poin insight penting berikutnya'];
    setDraft({ ...draft, points: updated });
  };

  const handleRemovePoint = (pIdx: number) => {
    const updated = (draft.points || []).filter((_, idx) => idx !== pIdx);
    setDraft({ ...draft, points: updated });
  };

  const runAiQuickPolish = async (instruction: string) => {
    if (!draft) return;
    setIsPolishing(true);
    try {
      const result = await onAiPolish(draft, instruction);
      if (result) {
        setDraft(result);
      }
    } finally {
      setIsPolishing(false);
    }
  };

  const selectedIconObj = AVAILABLE_ICONS.find((ic) => ic.id === draft.icon);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#111114] border border-[#2d2d35] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Google Accent Top Bar */}
        <div className="google-gradient-bar h-1 w-full shrink-0"></div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f1f23] flex items-center justify-between bg-[#0a0a0c]">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs font-mono">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className="font-bold text-sm text-white">Edit Slide {index + 1} dari {totalSlides}</h3>
              <p className="text-[11px] text-gray-400">Kustomisasi teks, ikon, badge, dan poin slide</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1a1f] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* AI Quick Polish Pills */}
          <div className="bg-[#1a1a1f] p-3.5 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Poles Cepat dengan AI:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                disabled={isPolishing}
                onClick={() => runAiQuickPolish('Buat judul lebih memikat, bikin penasaran, dan viral')}
                className="px-2.5 py-1 text-xs bg-[#111114] hover:bg-[#25252c] border border-blue-500/30 text-blue-300 rounded-lg transition disabled:opacity-40"
              >
                🔥 Judul Lebih Memikat
              </button>
              <button
                type="button"
                disabled={isPolishing}
                onClick={() => runAiQuickPolish('Persingkat teks agar padat, ringkas, dan to-the-point')}
                className="px-2.5 py-1 text-xs bg-[#111114] hover:bg-[#25252c] border border-gray-700 text-gray-300 rounded-lg transition disabled:opacity-40"
              >
                ✂️ Ringkas Teks
              </button>
              <button
                type="button"
                disabled={isPolishing}
                onClick={() => runAiQuickPolish('Ubah menjadi 3 poin aksi yang jelas')}
                className="px-2.5 py-1 text-xs bg-[#111114] hover:bg-[#25252c] border border-gray-700 text-gray-300 rounded-lg transition disabled:opacity-40"
              >
                🔢 3 Poin Aksi
              </button>
              <button
                type="button"
                disabled={isPolishing}
                onClick={() => runAiQuickPolish('Perkuat ajakan bertindak (CTA) untuk simpan dan share')}
                className="px-2.5 py-1 text-xs bg-[#111114] hover:bg-[#25252c] border border-emerald-500/30 text-emerald-300 rounded-lg transition disabled:opacity-40"
              >
                ⚡ Perkuat CTA
              </button>
            </div>
          </div>

          {/* Type & Icon & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tipe Slide</label>
              <select
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as SlideType })}
                className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-lg px-2.5 py-2 text-xs text-white outline-none focus:border-blue-500"
              >
                {SLIDE_TYPES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#111114]">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ikon Slide</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-lg px-2.5 py-2 text-xs text-white flex items-center justify-between hover:border-blue-500 transition"
                >
                  <span className="flex items-center gap-1.5">
                    <span>{selectedIconObj?.emoji || '✨'}</span>
                    <span className="truncate">{selectedIconObj?.label || 'Sparkles'}</span>
                  </span>
                  <Smile className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {showIconPicker && (
                  <div className="absolute top-full left-0 mt-1 w-56 p-2 bg-[#111114] border border-[#2d2d35] rounded-xl shadow-2xl z-30 grid grid-cols-4 gap-1.5">
                    {AVAILABLE_ICONS.map((ic) => (
                      <button
                        key={ic.id}
                        type="button"
                        onClick={() => {
                          setDraft({ ...draft, icon: ic.id });
                          setShowIconPicker(false);
                        }}
                        title={ic.label}
                        className={`p-2 rounded-lg text-base hover:bg-[#1a1a1f] flex items-center justify-center transition ${
                          draft.icon === ic.id ? 'bg-blue-600/30 border border-blue-500' : ''
                        }`}
                      >
                        {ic.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Badge Tag</label>
              <input
                type="text"
                value={draft.badge || ''}
                onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
                placeholder="e.g. STRATEGI 01"
                className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-lg px-2.5 py-2 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Headline & Highlight Word */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Judul / Headline</label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-lg px-3 py-2 text-sm text-white font-medium outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Highlight Word (Warna Aksen)</label>
              <input
                type="text"
                value={draft.highlightWord || ''}
                onChange={(e) => setDraft({ ...draft, highlightWord: e.target.value })}
                placeholder="e.g. FREE, Kimi, $0"
                className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-lg px-3 py-2 text-xs text-amber-300 font-medium outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Isi Paragraf / Deskripsi</label>
            <textarea
              rows={2}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-lg p-3 text-xs text-gray-200 outline-none focus:border-blue-500 resize-none leading-relaxed"
            />
          </div>

          {/* Terminal / Code Snippet & Tip Callout */}
          <div className="bg-[#141418] p-3.5 rounded-xl border border-[#2d2d35] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>💻 Terminal / Code Mockup (Opsional)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Header Terminal / Title</label>
                <input
                  type="text"
                  value={draft.terminalTitle || ''}
                  onChange={(e) => setDraft({ ...draft, terminalTitle: e.target.value })}
                  placeholder="e.g. bash — zsh atau platform.moonshot.ai"
                  className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-lg px-2.5 py-1.5 text-xs text-gray-200 outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">CTA Button Text (Cover / Final)</label>
                <input
                  type="text"
                  value={draft.ctaButtonText || ''}
                  onChange={(e) => setDraft({ ...draft, ctaButtonText: e.target.value })}
                  placeholder="e.g. Full setup inside →, Save this guide 🔖"
                  className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-lg px-2.5 py-1.5 text-xs text-gray-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Perintah Terminal / Kode</label>
              <textarea
                rows={3}
                value={draft.codeSnippet || ''}
                onChange={(e) => setDraft({ ...draft, codeSnippet: e.target.value })}
                placeholder="$ npm install -g @anthropic-ai/claude-code&#10;✓ claude-code installed globally"
                className="w-full bg-[#0a0a0c] border border-[#2d2d35] rounded-lg p-2.5 text-xs text-emerald-400 font-mono outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">💡 Callout Tip Box (Opsional)</label>
              <input
                type="text"
                value={draft.tip || ''}
                onChange={(e) => setDraft({ ...draft, tip: e.target.value })}
                placeholder="e.g. Windows CMD? Use setx instead of export."
                className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-lg px-2.5 py-1.5 text-xs text-amber-200 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Points / Bullets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-blue-400" />
                Daftar Poin ({draft.points?.length || 0})
              </label>
              <button
                type="button"
                onClick={handleAddPoint}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3 h-3" /> Tambah Poin
              </button>
            </div>

            <div className="space-y-2">
              {(draft.points || []).map((pt, pIdx) => (
                <div key={pIdx} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono w-4">{pIdx + 1}.</span>
                  <input
                    type="text"
                    value={pt}
                    onChange={(e) => handlePointChange(pIdx, e.target.value)}
                    className="flex-1 bg-[#1a1a1f] border border-[#2d2d35] rounded-lg px-3 py-1.5 text-xs text-gray-200 outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePoint(pIdx)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 rounded hover:bg-[#1a1a1f] transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Stat Value (if stat type) */}
          {draft.type === 'stat' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nilai Metrik / Angka</label>
              <input
                type="text"
                value={draft.statValue || ''}
                onChange={(e) => setDraft({ ...draft, statValue: e.target.value })}
                placeholder="Misal: 10x, 95%, 24 Jam"
                className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Footer hint */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Teks Footer (Swipe / Action)</label>
            <input
              type="text"
              value={draft.footer_hint || ''}
              onChange={(e) => setDraft({ ...draft, footer_hint: e.target.value })}
              placeholder="e.g. Geser 👉, Simpan & Bagikan 📌"
              className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[#1f1f23] flex items-center justify-end gap-2 bg-[#0a0a0c]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-[#1a1a1f] transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
