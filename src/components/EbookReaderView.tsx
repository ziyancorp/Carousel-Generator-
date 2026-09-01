import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Download,
  Printer,
  Copy,
  Check,
  Sparkles,
  Layers,
  FileText,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Compass,
  Zap,
  Tag,
  Share2,
  Terminal,
  ShieldCheck,
  RefreshCw,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EbookData, EbookModule, Slide, ApiKeyConfig } from '../types';
import { SAMPLE_EBOOKS } from '../data/sampleEbooks';
import { generateStandaloneEbookHtml } from '../utils/ebookHtmlExporter';

interface EbookReaderViewProps {
  currentEbook: EbookData;
  onUpdateEbook: (ebook: EbookData) => void;
  carouselSlides: Slide[];
  carouselTopic: string;
  authorName: string;
  isDarkUi: boolean;
  apiKeyConfig?: ApiKeyConfig;
  onOpenApiKeyModal: () => void;
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
}) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(
    currentEbook.modules[0]?.id || 'modul-1'
  );
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generateTopic, setGenerateTopic] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [ebookTheme, setEbookTheme] = useState<'light' | 'dark'>(isDarkUi ? 'dark' : 'light');

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

  // Generate full new E-Book with AI
  const handleGenerateAiEbook = async () => {
    const topicToUse = generateTopic.trim() || carouselTopic || 'Rahasia Konten AI';
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/generate-ebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse,
          authorName,
          provider: apiKeyConfig?.provider || 'gemini',
          apiKey: apiKeyConfig?.apiKey,
          model: apiKeyConfig?.model,
          baseUrl: apiKeyConfig?.baseUrl,
        }),
      });

      const data = await res.json();
      if (data && data.ebook) {
        onUpdateEbook(data.ebook);
        setActiveModuleId(data.ebook.modules[0]?.id || 'modul-1');
        setShowAiModal(false);
        triggerConfetti();
      } else {
        alert('Gagal menghasilkan E-Book dengan AI.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Terjadi kesalahan saat memanggil AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

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
          {/* Preset Selector */}
          <div className="hidden lg:flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-gray-700/30 text-xs shrink-0">
            <span className="text-[10px] text-gray-400 font-semibold px-2">Preset:</span>
            {SAMPLE_EBOOKS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onUpdateEbook(preset);
                  setActiveModuleId(preset.modules[0]?.id || 'modul-1');
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  currentEbook.id === preset.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {preset.title.length > 18 ? preset.title.slice(0, 16) + '...' : preset.title}
              </button>
            ))}
          </div>

          {/* Convert from Carousel */}
          {carouselSlides.length > 0 && (
            <button
              type="button"
              onClick={handleConvertCarouselToEbook}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5 shrink-0"
              title="Ubah slide carousel aktif menjadi modul e-book"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Konversi dari Carousel</span>
              <span className="sm:hidden">Konversi</span>
            </button>
          )}

          {/* AI Generator Trigger */}
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 transition flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Generate AI E-Book</span>
            <span className="sm:hidden">AI E-Book</span>
          </button>

          {/* Export Standalone HTML */}
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
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
              isDarkUi ? 'bg-[#182030] hover:bg-[#202b40] text-gray-300 border-[#2d3a52]' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
            }`}
            title="Salin isi E-Book ke Markdown"
          >
            {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Sticky Module Selector (< md) */}
      <div className={`md:hidden px-4 py-2.5 border-b flex items-center justify-between sticky top-[57px] z-20 shrink-0 ${
        isDarkUi ? 'bg-[#0c101a] border-[#1a2233]' : 'bg-gray-50 border-gray-200'
      }`}>
        <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Compass className="w-3.5 h-3.5" /> Modul:
        </span>
        <select
          value={activeModuleId}
          onChange={(e) => {
            setActiveModuleId(e.target.value);
            const el = document.getElementById(e.target.value);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className={`text-xs font-semibold rounded-lg px-2 py-1 outline-none max-w-[240px] truncate border ${
            isDarkUi ? 'bg-[#182030] text-gray-200 border-[#2d3a52]' : 'bg-white text-gray-800 border-gray-300 shadow-sm'
          }`}
        >
          {currentEbook.modules.map((m, idx) => (
            <option key={m.id} value={m.id}>
              {m.moduleNumber || idx + 1}. {m.title}
            </option>
          ))}
        </select>
      </div>

      {/* Main Reader Workspace */}
      <div className="flex-1 flex max-w-[1400px] w-full mx-auto">
        {/* Left Sticky Navigation Sidebar */}
        <aside className={`w-72 lg:w-80 shrink-0 border-r hidden md:flex flex-col sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto ${
          isDarkUi ? 'bg-[#0c101a] border-[#1a2233]' : 'bg-white border-gray-200'
        }`}>
          <div className="p-4 border-b border-gray-700/20">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-500 mb-1 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Daftar Modul
            </div>
            <h2 className="font-bold text-xs text-gray-400 line-clamp-1">{currentEbook.title}</h2>
          </div>

          <nav className="p-3 space-y-1 flex-1">
            {currentEbook.modules.map((m, idx) => {
              const isActive = activeModuleId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveModuleId(m.id);
                    const el = document.getElementById(m.id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-2.5 group ${
                    isActive
                      ? isDarkUi
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                      : isDarkUi
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-[#141b2b]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    isActive ? 'bg-blue-600 text-white' : isDarkUi ? 'bg-[#182030] text-gray-400' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {m.moduleNumber || idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate">{m.title}</div>
                    <div className="text-[10px] opacity-70 truncate">{m.badge || `Modul ${idx + 1}`}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-700/20 text-[11px] text-gray-500 flex items-center justify-between">
            <span>{currentEbook.edition}</span>
            <span className="font-mono">{currentEbook.modules.length} Modul</span>
          </div>
        </aside>

        {/* Right Scrollable Content Area */}
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-4xl mx-auto overflow-y-auto">
          {/* E-Book Hero Cover Banner */}
          <section className="rounded-3xl p-6 sm:p-10 text-white bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 shadow-xl shadow-blue-900/20 relative overflow-hidden mb-10">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-4 border border-white/30">
                {currentEbook.tag || 'PANDUAN RESMI CREATOR'}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
                {currentEbook.title}
              </h1>
              <p className="text-sm sm:text-base text-white/90 max-w-2xl leading-relaxed mb-6 font-medium">
                {currentEbook.subtitle}
              </p>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/20 text-xs">
                <div>
                  <span className="text-[10px] text-white/70 uppercase font-semibold block">Tingkat Kesulitan</span>
                  <span className="font-bold text-white text-xs sm:text-sm">{currentEbook.difficulty}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/70 uppercase font-semibold block">Platform Utama</span>
                  <span className="font-bold text-white text-xs sm:text-sm">{currentEbook.platform}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/70 uppercase font-semibold block">Potensi Cuan</span>
                  <span className="font-bold text-white text-xs sm:text-sm">{currentEbook.monetization}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/70 uppercase font-semibold block">Format File</span>
                  <span className="font-bold text-white text-xs sm:text-sm">{currentEbook.format}</span>
                </div>
              </div>
            </div>

            {/* Subtle decorative glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
          </section>

          {/* Module Sections */}
          <div className="space-y-12">
            {currentEbook.modules.map((module, mIdx) => (
              <section
                key={module.id}
                id={module.id}
                className="scroll-mt-20 space-y-4"
              >
                {/* Module Header */}
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-600/10 text-blue-500 border border-blue-500/20">
                    {module.badge || `Modul ${mIdx + 1}`}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {module.title}
                  </h2>
                  {module.description && (
                    <p className="text-xs sm:text-sm text-gray-400">
                      {module.description}
                    </p>
                  )}
                </div>

                {/* Intro / Problem Card */}
                {module.introCard && (
                  <div className={`p-6 rounded-2xl border transition shadow-sm ${
                    isDarkUi ? 'bg-[#111624] border-[#1e293d]' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center text-xl shrink-0">
                        {module.introCard.icon || '📘'}
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{module.introCard.title}</h3>
                        {module.introCard.subtitle && (
                          <p className="text-xs text-gray-400">{module.introCard.subtitle}</p>
                        )}
                        {module.introCard.badge && (
                          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-mono bg-blue-500/20 text-blue-400">
                            {module.introCard.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3">
                      {module.introCard.body}
                    </p>
                    {module.introCard.checklist && module.introCard.checklist.length > 0 && (
                      <ul className="space-y-2 mt-3 pt-3 border-t border-gray-700/20 text-xs sm:text-sm">
                        {module.introCard.checklist.map((item, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-2 text-gray-300">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              ✓
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Step Grid Cards (1, 2, 3) */}
                {module.steps && module.steps.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {module.steps.map((st, sIdx) => (
                      <div
                        key={sIdx}
                        className={`p-4 rounded-2xl border ${
                          isDarkUi ? 'bg-[#151c2e] border-[#22304a]' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {st.badge ? (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 mb-2">
                            {st.badge}
                          </span>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2 shadow-sm">
                            {st.number}
                          </div>
                        )}
                        <h4 className="font-bold text-xs sm:text-sm mb-1">{st.title}</h4>
                        <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed">{st.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Feature Comparison Table */}
                {module.table && (
                  <div className={`rounded-2xl border overflow-hidden ${
                    isDarkUi ? 'bg-[#111624] border-[#1e293d]' : 'bg-white border-gray-200'
                  }`}>
                    {module.table.title && (
                      <div className="px-4 py-2.5 border-b border-gray-700/20 font-bold text-xs text-gray-300">
                        {module.table.title}
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className={isDarkUi ? 'bg-[#182030] text-gray-200' : 'bg-gray-100 text-gray-700'}>
                            {module.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="px-4 py-3 font-bold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/20">
                          {module.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className={isDarkUi ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                              {row.cols.map((col, cIdx) => {
                                const badgeInfo = row.badgeCols?.find((b) => b.index === cIdx);
                                return (
                                  <td key={cIdx} className="px-4 py-3 text-gray-300">
                                    {badgeInfo ? (
                                      <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-blue-500/20 text-blue-400">
                                        {col}
                                      </span>
                                    ) : (
                                      col
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Master Prompt Containers with Copy Buttons */}
                {module.prompts && module.prompts.length > 0 && (
                  <div className="space-y-3">
                    {module.prompts.map((pr, pIdx) => {
                      const promptKey = `${module.id}-p-${pIdx}`;
                      const isCopied = copiedPromptIndex === promptKey;
                      return (
                        <div
                          key={pIdx}
                          className={`rounded-2xl border overflow-hidden ${
                            isDarkUi ? 'bg-[#111624] border-[#1e293d]' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
                            isDarkUi ? 'bg-[#161c2d] border-[#1e293d]' : 'bg-gray-100 border-gray-200'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                                {pr.tag}
                              </span>
                              {pr.category && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                                  {pr.category}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyPrompt(pr.content, promptKey)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition flex items-center gap-1"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{isCopied ? 'Tersalin!' : 'Salin Prompt'}</span>
                            </button>
                          </div>
                          <div className="p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {pr.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Callout Boxes (Info, Warning, Success) */}
                {module.callouts && module.callouts.length > 0 && (
                  <div className="space-y-3">
                    {module.callouts.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className={`p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm ${
                          c.type === 'warning'
                            ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                            : c.type === 'success'
                            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                            : 'bg-blue-950/40 border-blue-800 text-blue-200'
                        }`}
                      >
                        <div className="text-lg shrink-0 mt-0.5">
                          {c.icon || (c.type === 'warning' ? '⚠️' : c.type === 'success' ? '🎁' : '💡')}
                        </div>
                        <div>
                          <div className="font-bold mb-0.5">{c.title}</div>
                          <p className="leading-relaxed opacity-90">{c.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </main>
      </div>

      {/* AI Generate E-Book Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#111114] border border-[#2d2d35] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
            <div className="px-6 py-4 border-b border-[#1f1f23] flex items-center justify-between bg-[#0a0a0c]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Generate Full E-Book with AI</h3>
                  <p className="text-[11px] text-gray-400">Buat buku panduan digital multi-modul lengkap</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Topik atau Judul E-Book
                </label>
                <input
                  type="text"
                  value={generateTopic}
                  onChange={(e) => setGenerateTopic(e.target.value)}
                  placeholder="Contoh: Rahasia Monetisasi AI Faceless di Shopee & Lynk.id"
                  className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Provider Info Banner */}
              <div className="p-3 rounded-xl bg-[#1a1a1f] border border-[#2d2d35] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    Provider AI:{' '}
                    <strong className="text-white uppercase font-mono">
                      {apiKeyConfig?.provider || 'Gemini 2.5 Flash'}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAiModal(false);
                    onOpenApiKeyModal();
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold text-[11px]"
                >
                  Ganti Provider / Key →
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#1f1f23] flex items-center justify-between bg-[#0a0a0c]">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isGeneratingAi}
                onClick={handleGenerateAiEbook}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5 disabled:opacity-40"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyusun E-Book...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate E-Book</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
