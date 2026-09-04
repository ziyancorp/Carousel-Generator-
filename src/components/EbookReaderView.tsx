import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  Printer,
  Copy,
  Check,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Edit3,
  ChevronRight,
  Sun,
  Moon,
  Zap,
  Tag,
  ShieldCheck,
  RefreshCw,
  Loader2,
  FileDown,
  Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EbookData, EbookModule, Slide, ApiKeyConfig, DesignVariantId } from '../types';
import { generateStandaloneEbookHtml } from '../utils/ebookHtmlExporter';
import { VariantSelectorModal } from './VariantSelectorModal';
import { MarketingPromptsModal } from './MarketingPromptsModal';
import { DESIGN_VARIANTS } from '../data/designVariants';
import { distillEbookToCarouselAI } from '../services/aiClient';

interface EbookReaderViewProps {
  currentEbook: EbookData;
  onUpdateEbook: (ebook: EbookData) => void;
  carouselSlides: Slide[];
  carouselTopic: string;
  authorName: string;
  isDarkUi: boolean;
  apiKeyConfig?: ApiKeyConfig;
  onOpenApiKeyModal: () => void;
  onOpenMaterialIngest?: () => void;
  onDistillToCarousel?: (slides: Slide[], topic: string) => void;
}

export const EbookReaderView: React.FC<EbookReaderViewProps> = ({
  currentEbook,
  onUpdateEbook,
  carouselSlides,
  carouselTopic,
  authorName,
  isDarkUi,
  apiKeyConfig,
  onOpenApiKeyModal,
  onOpenMaterialIngest,
  onDistillToCarousel,
}) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(
    currentEbook.modules[0]?.id || 'modul-1'
  );
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isDistillingCarousel, setIsDistillingCarousel] = useState(false);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [ebookTheme, setEbookTheme] = useState<'light' | 'dark'>(isDarkUi ? 'dark' : 'light');
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isMarketingModalOpen, setIsMarketingModalOpen] = useState(false);

  const activeVariant =
    DESIGN_VARIANTS.find((v) => v.id === (currentEbook.variantId || 'variant-1-tech')) ||
    DESIGN_VARIANTS[0];

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptIndex(id);
    setTimeout(() => setCopiedPromptIndex(null), 2000);
  };

  // Convert current carousel slides into an E-Book
  const handleConvertCarouselToEbook = () => {
    if (!carouselSlides || carouselSlides.length === 0) return;

    const newModules: EbookModule[] = carouselSlides.map((slide, idx) => ({
      id: `modul-${idx + 1}`,
      moduleNumber: idx + 1,
      badge: slide.badge || `Modul ${idx + 1}`,
      title: slide.title,
      description: slide.stepBadge || `Langkah penting dalam ${carouselTopic}`,
      introCard: {
        icon: slide.type === 'hook' ? '🔥' : slide.type === 'cta' ? '📌' : '💡',
        title: slide.title,
        subtitle: slide.highlightWord ? `Fokus: ${slide.highlightWord}` : undefined,
        badge: slide.tag || undefined,
        body: slide.body || 'Panduan praktis langkah demi langkah.',
        checklist: slide.points && slide.points.length > 0 ? slide.points : undefined,
      },
      steps: slide.points?.map((pt, pIdx) => ({
        number: pIdx + 1,
        title: `Poin 0${pIdx + 1}`,
        text: pt,
      })),
      prompts: slide.codeSnippet
        ? [
            {
              tag: slide.terminalTitle || `Master Command / Code Step ${idx + 1}`,
              content: slide.codeSnippet,
            },
          ]
        : undefined,
      callouts: slide.tip
        ? [
            {
              type: 'info',
              icon: '💡',
              title: 'Pro Tip:',
              body: slide.tip,
            },
          ]
        : undefined,
    }));

    const convertedEbook: EbookData = {
      id: `ebook-${Date.now()}`,
      title: carouselTopic.toUpperCase() || 'PANDUAN LENGKAP & PRAKTIS',
      tag: `PANDUAN RESMI ${(authorName || 'Arijal Meutuwah').toUpperCase()}`,
      subtitle: `Buku panduan digital terstruktur ${carouselTopic} untuk microblog, creator, dan bisnis online.`,
      difficulty: 'Pemula s/d Menengah',
      platform: 'Digital Ecosystem & Tools',
      monetization: 'Lynk.id / Shopee / Gumroad',
      format: 'Responsive & Print PDF',
      edition: 'Edisi 2026 • Siap Jual',
      author: authorName || 'Arijal Meutuwah',
      modules: newModules,
    };

    onUpdateEbook(convertedEbook);
    setActiveModuleId(convertedEbook.modules[0]?.id || 'modul-1');
    triggerConfetti();
  };

  // Distill this E-Book into a Carousel Slide Deck
  const handleDistillToCarouselDeck = async () => {
    if (!onDistillToCarousel) return;
    setIsDistillingCarousel(true);

    try {
      const result = await distillEbookToCarouselAI({
        ebook: currentEbook,
        slideCount: Math.min(Math.max(currentEbook.modules.length + 2, 5), 8),
        authorName: authorName || '@abangjal',
        apiKeyConfig,
      });

      if (result && result.slides && result.slides.length > 0) {
        onDistillToCarousel(result.slides, currentEbook.title);
        triggerConfetti();
      } else {
        alert('Gagal meringkas E-Book menjadi carousel.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Terjadi kesalahan saat meringkas E-Book.');
    } finally {
      setIsDistillingCarousel(false);
    }
  };

  // Download Standalone HTML
  const handleDownloadHtml = () => {
    try {
      const html = generateStandaloneEbookHtml(currentEbook);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const filename = `Ebook_${currentEbook.title.slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerConfetti();
    } catch (err) {
      console.error(err);
      alert('Gagal mendownload file HTML E-Book.');
    }
  };

  // Print / Save as PDF
  const handlePrintPdf = () => {
    const html = generateStandaloneEbookHtml(currentEbook);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 600);
    } else {
      window.print();
    }
  };

  // Copy Full Markdown Text
  const handleCopyMarkdown = () => {
    let md = `# ${currentEbook.title}\n**${currentEbook.tag}**\n\n${currentEbook.subtitle}\n\n`;
    md += `- Tingkat Kesulitan: ${currentEbook.difficulty}\n- Platform: ${currentEbook.platform}\n- Potensi Cuan: ${currentEbook.monetization}\n- Format: ${currentEbook.format}\n\n---\n\n`;

    currentEbook.modules.forEach((m, idx) => {
      md += `## ${m.badge || `Modul ${idx + 1}`}: ${m.title}\n*${m.description}*\n\n`;
      if (m.introCard) {
        md += `### ${m.introCard.title}\n${m.introCard.body}\n\n`;
        if (m.introCard.checklist) {
          m.introCard.checklist.forEach((c) => (md += `- [x] ${c}\n`));
          md += '\n';
        }
      }
      if (m.steps) {
        m.steps.forEach((st) => {
          md += `#### ${st.number}. ${st.title}\n${st.text}\n\n`;
        });
      }
      if (m.prompts) {
        m.prompts.forEach((pr) => {
          md += `\`\`\`prompt\n// ${pr.tag}\n${pr.content}\n\`\`\`\n\n`;
        });
      }
      if (m.callouts) {
        m.callouts.forEach((c) => {
          md += `> **${c.title}**\n> ${c.body}\n\n`;
        });
      }
      md += '---\n\n';
    });

    navigator.clipboard.writeText(md);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const activeModule = currentEbook.modules.find((m) => m.id === activeModuleId) || currentEbook.modules[0];

  return (
    <div className={`w-full min-h-screen flex flex-col ${isDarkUi ? 'bg-[#090d16] text-gray-100' : 'bg-[#f8fafc] text-gray-900'}`}>
      {/* Top Action Toolbar */}
      <header className={`sticky top-0 z-30 border-b px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md ${
        isDarkUi ? 'bg-[#0e1320]/90 border-[#1f293d]' : 'bg-white/90 border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight">{currentEbook.title}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
                E-Book Ready
              </span>
            </div>
            <p className="text-xs text-gray-400">Format interaktif & PDF siap jual (Lynk.id / Shopee / Gumroad)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Ingest Materi & AI Generator */}
          {onOpenMaterialIngest && (
            <button
              type="button"
              onClick={onOpenMaterialIngest}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ingest Materi Baru / AI</span>
            </button>
          )}

          {/* Variant Selector Button with Live Preview */}
          <button
            type="button"
            onClick={() => setIsVariantModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-400 border border-amber-500/40 shadow-sm transition flex items-center gap-1.5 shrink-0"
            title="Pilih dan ubah varian gaya desain E-Book (5 Varian Tersedia)"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Gaya Desain: {activeVariant.name.split(' ')[1] || 'Tech'}</span>
          </button>

          {/* 4 Prompt Banner Marketing Button */}
          <button
            type="button"
            onClick={() => setIsMarketingModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 border border-purple-500/40 shadow-sm transition flex items-center gap-1.5 shrink-0"
            title="Dapatkan 4 Prompt Gambar AI untuk Banner & Sampul Buku (Midjourney / Flux / Ideogram)"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>4 Prompt Banner</span>
          </button>

          {/* Distill E-Book to Carousel Slides */}
          {onDistillToCarousel && currentEbook.modules.length > 0 && (
            <button
              type="button"
              disabled={isDistillingCarousel}
              onClick={handleDistillToCarouselDeck}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              title="Ringkas buku panduan ini menjadi slide carousel microblog"
            >
              {isDistillingCarousel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
              <span>{isDistillingCarousel ? 'Meringkas Slide...' : 'Distill ke Carousel'}</span>
            </button>
          )}

          {/* Convert from Active Carousel */}
          {carouselSlides.length > 0 && (
            <button
              type="button"
              onClick={handleConvertCarouselToEbook}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 transition flex items-center gap-1.5 shrink-0"
              title="Ubah slide carousel aktif menjadi modul e-book"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Konversi dari Carousel</span>
              <span className="sm:hidden">Konversi</span>
            </button>
          )}

          {/* Export Standalone HTML */}
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Download HTML</span>
            <span className="sm:hidden">HTML</span>
          </button>

          {/* Print to PDF */}
          <button
            type="button"
            onClick={handlePrintPdf}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 shrink-0 ${
              isDarkUi ? 'bg-[#182030] hover:bg-[#202b40] text-gray-200 border-[#2d3a52]' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>PDF</span>
          </button>

          {/* Copy Markdown */}
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className={`p-2 rounded-xl border text-xs transition shrink-0 ${
              isDarkUi ? 'bg-[#182030] hover:bg-[#202b40] text-gray-200 border-[#2d3a52]' : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
            }`}
            title="Salin seluruh isi Markdown E-Book"
          >
            {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setEbookTheme(ebookTheme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-xl border transition shrink-0 ${
              isDarkUi ? 'bg-[#182030] border-[#2d3a52] text-yellow-400' : 'bg-gray-100 border-gray-300 text-gray-700'
            }`}
            title="Ganti tema baca"
          >
            {ebookTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Reader Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* Left Sidebar: Module Navigation & Metadata */}
        <aside className="w-full md:w-80 shrink-0 space-y-4">
          {/* E-Book Hero Card */}
          <div className={`p-5 rounded-2xl border shadow-sm ${
            ebookTheme === 'dark' ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-white border-gray-200'
          }`}>
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-500 font-bold block">
                {currentEbook.tag}
              </span>
              <h2 className="text-lg font-black tracking-tight leading-snug">{currentEbook.title}</h2>
              <p className="text-xs text-gray-400 leading-relaxed">{currentEbook.subtitle}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700/30 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-500 block">Penulis:</span>
                <span className="font-semibold text-gray-200">{currentEbook.author}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Level:</span>
                <span className="font-semibold text-gray-200">{currentEbook.difficulty}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Potensi Cuan:</span>
                <span className="font-semibold text-emerald-400">{currentEbook.monetization}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Edisi:</span>
                <span className="font-semibold text-gray-200">{currentEbook.edition}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingMeta(!isEditingMeta)}
              className="mt-4 w-full py-1.5 rounded-xl border border-gray-700/50 hover:bg-gray-800/40 text-[11px] font-medium text-gray-300 transition flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingMeta ? 'Tutup Edit Info' : 'Edit Judul & Info'}</span>
            </button>
          </div>

          {/* Edit Meta Form */}
          {isEditingMeta && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              ebookTheme === 'dark' ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">Edit Info E-Book</h3>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Judul Utama</label>
                <input
                  type="text"
                  value={currentEbook.title}
                  onChange={(e) => onUpdateEbook({ ...currentEbook, title: e.target.value })}
                  className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Subtitle</label>
                <textarea
                  rows={2}
                  value={currentEbook.subtitle}
                  onChange={(e) => onUpdateEbook({ ...currentEbook, subtitle: e.target.value })}
                  className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Penulis</label>
                <input
                  type="text"
                  value={currentEbook.author}
                  onChange={(e) => onUpdateEbook({ ...currentEbook, author: e.target.value })}
                  className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Module List Navigation */}
          <div className={`p-4 rounded-2xl border shadow-sm space-y-2 ${
            ebookTheme === 'dark' ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Daftar Modul ({currentEbook.modules.length})
              </span>
            </div>

            <div className="space-y-1.5">
              {currentEbook.modules.map((module, idx) => {
                const isActive = module.id === activeModuleId;
                return (
                  <button
                    key={module.id || idx}
                    type="button"
                    onClick={() => setActiveModuleId(module.id)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                        : ebookTheme === 'dark'
                        ? 'hover:bg-slate-800/60 text-slate-300'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-700/40 text-slate-400'
                      }`}>
                        0{idx + 1}
                      </span>
                      <span className="text-xs truncate">{module.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition ${isActive ? 'translate-x-0.5' : 'text-slate-500'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center/Right: Active Module Reader Content */}
        <main className="flex-1 space-y-6">
          {activeModule ? (
            <div className={`p-6 sm:p-8 rounded-2xl border shadow-lg space-y-6 transition ${
              ebookTheme === 'dark' ? 'bg-[#0f172a] border-[#1e293b] text-slate-100' : 'bg-white border-gray-200 text-slate-900'
            }`}>
              {/* Module Header */}
              <div className="border-b border-gray-700/30 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                    {activeModule.badge || `Modul ${activeModule.moduleNumber || 1}`}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">{activeModule.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{activeModule.description}</p>
              </div>

              {/* Intro Card */}
              {activeModule.introCard && (
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  ebookTheme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{activeModule.introCard.icon || '📘'}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-blue-400">{activeModule.introCard.title}</h3>
                      {activeModule.introCard.subtitle && (
                        <p className="text-xs text-gray-400 mt-0.5">{activeModule.introCard.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-300">
                    {activeModule.introCard.body}
                  </p>

                  {activeModule.introCard.checklist && (
                    <div className="mt-3 pt-3 border-t border-gray-800 space-y-2">
                      {activeModule.introCard.checklist.map((item, cIdx) => (
                        <div key={cIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Steps */}
              {activeModule.steps && activeModule.steps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Langkah Eksekusi Praktis
                  </h4>
                  <div className="space-y-3">
                    {activeModule.steps.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                          ebookTheme === 'dark' ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          {step.number || sIdx + 1}
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-sm text-slate-200">{step.title}</h5>
                          <p className="text-xs text-slate-400 leading-relaxed">{step.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Master Prompts / Code Snippets */}
              {activeModule.prompts && activeModule.prompts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Master Prompt & Command Siap Pakai</span>
                  </h4>
                  <div className="space-y-3">
                    {activeModule.prompts.map((p, pIdx) => {
                      const promptKey = `prompt-${activeModule.id}-${pIdx}`;
                      const isCopied = copiedPromptIndex === promptKey;
                      return (
                        <div key={pIdx} className="rounded-xl border border-purple-500/30 bg-black/40 overflow-hidden">
                          <div className="px-4 py-2 bg-purple-950/40 border-b border-purple-500/20 flex items-center justify-between">
                            <span className="text-[11px] font-mono font-semibold text-purple-300">{p.tag}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyPrompt(p.content, promptKey)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? 'Tersalin' : 'Salin Prompt'}</span>
                            </button>
                          </div>
                          <div className="p-4 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
                            {p.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Callouts / Pro Tips */}
              {activeModule.callouts && activeModule.callouts.length > 0 && (
                <div className="space-y-3">
                  {activeModule.callouts.map((call, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3"
                    >
                      <div className="text-xl">{call.icon || '💡'}</div>
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-xs text-amber-300">{call.title}</h5>
                        <p className="text-xs text-amber-200/90 leading-relaxed">{call.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center border rounded-2xl border-dashed border-slate-700 space-y-4">
              <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">Belum ada modul yang dipilih</h3>
              <p className="text-xs text-slate-400">Gunakan Ingest Materi untuk menyusun E-Book otomatis dari AI.</p>
              {onOpenMaterialIngest && (
                <button
                  type="button"
                  onClick={onOpenMaterialIngest}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                >
                  Mulai Ingest Materi
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* 5-Variant Selector & Live Preview Modal */}
      <VariantSelectorModal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        selectedVariantId={currentEbook.variantId || 'variant-1-tech'}
        onSelectVariant={(variantId) => {
          onUpdateEbook({ ...currentEbook, variantId });
          triggerConfetti();
        }}
        isDarkUi={isDarkUi}
        contentTitle={currentEbook.title}
        contentSubtitle={currentEbook.subtitle}
        authorName={currentEbook.author}
      />
      {/* 4 Prompt Banner Marketing Modal */}
      <MarketingPromptsModal
        isOpen={isMarketingModalOpen}
        onClose={() => setIsMarketingModalOpen(false)}
        topic={currentEbook.title}
        variantId={currentEbook.variantId}
        authorName={currentEbook.author || authorName}
        authorHandle="@abangjal"
        isDarkUi={isDarkUi}
      />
    </div>
  );
};
