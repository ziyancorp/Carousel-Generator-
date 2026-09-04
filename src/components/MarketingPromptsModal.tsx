import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  Monitor,
  Layout,
  Layers,
  Palette,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DesignVariant } from '../types';
import { getDesignVariant } from '../data/designVariants';

interface MarketingPromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  variantId?: string;
  authorName: string;
  authorHandle: string;
  isDarkUi: boolean;
}

export const MarketingPromptsModal: React.FC<MarketingPromptsModalProps> = ({
  isOpen,
  onClose,
  topic,
  variantId,
  authorName,
  authorHandle,
  isDarkUi,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [customAuthor, setCustomAuthor] = useState(authorName || 'Arijal Meutuwah');
  const [customHandle, setCustomHandle] = useState(authorHandle || '@abangjal');

  if (!isOpen) return null;

  const variant: DesignVariant = getDesignVariant(variantId);
  const safeTopic = topic || 'Strategi & Panduan Komprehensif 2026';

  const prompts = [
    {
      id: 1,
      title: '1. 3D Floating Hardcover Book Mockup',
      subtitle: 'Sampul Buku 3D Mewah untuk Produk Digital di Lynk.id, Shopee, & Gumroad',
      icon: BookOpen,
      badge: 'Cover Etalase Toko',
      aspectRatio: '1:1 (Square)',
      toolRecommendation: 'Midjourney v6.1 / Flux.1 / Ideogram 2.0',
      promptText: `Professional 3D product mockup of a premium hardcover book floating at a 45-degree dynamic isometric angle. Front cover clearly displaying embossed bold metallic title "${safeTopic}", curated by "${customAuthor}", handle "${customHandle}". Color palette: rich ${variant.palette.bg} background with ${variant.palette.accent} metallic gold foil accents, modern dot-matrix graphic patterns, crisp micro-typography. Soft luxury studio lighting, realistic depth of field, subtle soft shadow beneath, ultra-detailed 8k resolution, photorealistic, Behance trending product design, shot on Hasselblad --ar 1:1 --v 6.1 --style raw`,
    },
    {
      id: 2,
      title: '2. Multi-Device Digital Workspace Suite',
      subtitle: 'Mockup iPad Pro + iPhone di Meja Estetik untuk Bukti Produk Digital',
      icon: Monitor,
      badge: 'Hero Mockup Gadget',
      aspectRatio: '16:9 (Landscape)',
      toolRecommendation: 'Midjourney v6.1 / Flux.1',
      promptText: `High-end minimalist productivity workspace mockup. An Apple iPad Pro and iPhone 16 Pro sitting side-by-side on an elegant natural oak wood desk. The iPad screen clearly displays an interactive visual e-book guide titled "${safeTopic}" with clean infographic cards, checklists, and code snippets in ${variant.palette.accent} and ${variant.palette.bg}. The iPhone screen displays an Instagram carousel microblog slide. Beside the devices is a white ceramic coffee cup, minimalist mechanical keyboard, and notebook. Soft warm morning sunlight streaming through a large window, cinematic bokeh, photorealistic, architectural digest aesthetic, 8k --ar 16:9 --v 6.1`,
    },
    {
      id: 3,
      title: '3. Viral Social Media Ad Feed Banner',
      subtitle: 'Poster Iklan Instagram / TikTok / LinkedIn untuk Memancing Klik & Pembelian',
      icon: Layout,
      badge: 'Feed Banner Medsos',
      aspectRatio: '4:5 (Portrait)',
      toolRecommendation: 'Ideogram 2.0 / Midjourney v6.1',
      promptText: `Modern viral Instagram ad poster for digital guide "${safeTopic}". Rasio 4:5. Bold typography in center with glowing badge "PANDUAN LENGKAP 2026", curated by ${customAuthor} (${customHandle}). Graphic style: ${variant.tagline}. High contrast ${variant.palette.bg} background with vibrant ${variant.palette.accent} neon accents, subtle dot matrix grid overlay, floating 3D graphic badges, sleek call-to-action button "DOWNLOAD E-BOOK SEKARANG" at bottom. Clean graphic design, Dribbble trending, vector-meets-3D, eye-catching marketing visual --ar 4:5 --v 6.1`,
    },
    {
      id: 4,
      title: '4. Sales Page Hero Storefront Banner',
      subtitle: 'Header Banner Lebar untuk Halaman Pembayaran Lynk.id / Web Jualan',
      icon: Layers,
      badge: 'Header Banner Web',
      aspectRatio: '16:9 (Header Web)',
      toolRecommendation: 'Flux.1 / Midjourney v6.1 / Gemini Imagen 3',
      promptText: `Commercial landing page hero banner for Lynk.id / Gumroad digital storefront. Wide 16:9 banner featuring a glossy 3D book cover on the left titled "${safeTopic}", author "${customAuthor}", with floating 3D feature badge pills on the right highlighting "Tutorial Step-by-Step", "Siap Pakai", "Bonus Template". Elegant modern aesthetic with dark ${variant.palette.bg} theme and energetic ${variant.palette.accent} accents, subtle abstract geometry, premium technology vibe, professional SaaS marketing banner --ar 16:9 --v 6.1`,
    },
  ];

  const handleCopyPrompt = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const fullText = prompts
      .map(
        (p) =>
          `=== ${p.title} (${p.aspectRatio}) ===\n[Rekomendasi Tool: ${p.toolRecommendation}]\n\n${p.promptText}\n`
      )
      .join('\n----------------------------------------\n\n');
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch {}
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden my-8 flex flex-col max-h-[90vh] ${
          isDarkUi ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDarkUi ? 'border-slate-800 bg-slate-900/80' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Generator 4 Prompt Banner & Sampul Marketing
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Siap Pakai AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Prompt lengkap untuk Midjourney, Flux, Ideogram & Imagen dengan styling {variant.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Metadata Customizer Bar */}
          <div
            className={`p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs ${
              isDarkUi ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span className="text-slate-400 block mb-1 font-medium">Topik Produk / E-Book:</span>
              <span className="font-bold text-slate-200 line-clamp-1">{safeTopic}</span>
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Nama Penulis di Sampul:</label>
              <input
                type="text"
                value={customAuthor}
                onChange={(e) => setCustomAuthor(e.target.value)}
                className="w-full px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Username / Handle di Sampul:</label>
              <input
                type="text"
                value={customHandle}
                onChange={(e) => setCustomHandle(e.target.value)}
                className="w-full px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>
                Warna Dasar Prompt: <strong className="text-white">{variant.name}</strong> ({variant.palette.bg} & {variant.palette.accent})
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyAll}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? 'Semua 4 Prompt Tersalin!' : 'Salin Semua 4 Prompt'}</span>
            </button>
          </div>

          {/* The 4 Prompt Cards */}
          <div className="space-y-4">
            {prompts.map((item, idx) => {
              const Icon = item.icon;
              const isCopied = copiedIndex === idx;

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition space-y-3 ${
                    isDarkUi
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-100">{item.title}</h3>
                        <p className="text-xs text-slate-400">{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {item.aspectRatio}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(item.promptText, idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Tersalin!' : 'Salin Prompt'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Recommendation Tag */}
                  <div className="flex items-center gap-2 text-[11px] text-amber-400/90">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Rekomendasi Engine AI: <strong>{item.toolRecommendation}</strong></span>
                  </div>

                  {/* Prompt Text Box */}
                  <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed select-all">
                    {item.promptText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3.5 border-t flex items-center justify-between text-xs ${
            isDarkUi ? 'border-slate-800 bg-slate-900/80 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'
          }`}
        >
          <span>💡 Paste prompt ke Discord Midjourney, Flux WebUI, atau Ideogram.ai untuk hasil gambar instant.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
