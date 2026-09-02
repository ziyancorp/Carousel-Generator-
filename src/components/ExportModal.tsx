import React, { useState } from 'react';
import {
  X,
  Download,
  FileArchive,
  FileCode,
  HardDrive,
  Table,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Sparkles,
  BookOpen,
  Printer,
  Presentation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { Slide, ThemeConfig, FontOption, AspectRatio, EbookData, EbookModule } from '../types';
import { generateStandaloneCarouselHtml } from '../utils/htmlExporter';
import { generateStandaloneEbookHtml } from '../utils/ebookHtmlExporter';
import { DEFAULT_THEME, DEFAULT_FONT } from '../constants/themes';

interface ExportModalProps {
  isOpen: boolean;
  topic: string;
  slides: Slide[];
  authorName: string;
  authorHandle: string;
  theme?: ThemeConfig;
  font?: FontOption;
  aspectRatio: AspectRatio;
  onClose: () => void;
  onOpenSlidesExport: () => void;
  onOpenDriveExport: () => void;
  onOpenSheetsSync: () => void;
  onSwitchToEbook?: () => void;
  renderSlideBlobs: () => Promise<{ filename: string; blob: Blob; dataUrl: string }[]>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  topic,
  slides,
  authorName,
  authorHandle,
  theme: userTheme,
  font: userFont,
  aspectRatio,
  onClose,
  onOpenSlidesExport,
  onOpenDriveExport,
  onOpenSheetsSync,
  onSwitchToEbook,
  renderSlideBlobs,
}) => {
  const theme = userTheme || DEFAULT_THEME;
  const font = userFont || DEFAULT_FONT;
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMsg, setProcessMsg] = useState('');
  const [copiedCaption, setCopiedCaption] = useState(false);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  // Generate ready-to-post caption
  const generateCaption = () => {
    const hook = slides[0]?.title || topic;
    const bullets = slides
      .slice(1, -1)
      .map((s, idx) => `👉 Slide ${idx + 2}: ${s.title}`)
      .join('\n');
    const cta = slides[slides.length - 1]?.title || 'Semoga bermanfaat!';

    return `🔥 ${hook}

Berikut ringkasan strategi penting ${topic}:

${bullets}

${cta}

📌 Simpan postingan ini untuk referensi nanti!
💬 Apa poin yang paling berkesan untukmu? Tulis di kolom komentar ya.

Dibuat dengan CarouselX AI oleh ${authorHandle || authorName}
#microblog #carousel #instagram #linkedin #edukasi #produktivitas #desain #growth`;
  };

  const handleCopyCaption = () => {
    const text = generateCaption();
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  // Download Standalone Interactive HTML File
  const handleDownloadHtml = () => {
    setIsProcessing(true);
    setProcessMsg('Membuat file interaktif HTML Carousel...');
    try {
      const htmlContent = generateStandaloneCarouselHtml({
        topic,
        authorName,
        authorHandle,
        slides,
        theme,
        font,
        aspectRatio,
      });

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const sanitized = (topic || 'carousel').slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_');
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = `CarouselX_${sanitized}.html`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      triggerConfetti();
    } catch (err) {
      console.error(err);
      alert('Gagal membuat file HTML.');
    } finally {
      setIsProcessing(false);
      setProcessMsg('');
    }
  };

  // Download E-Book HTML directly
  const handleDownloadEbookHtml = () => {
    setIsProcessing(true);
    setProcessMsg('Mengubah slide menjadi E-Book HTML interaktif...');
    try {
      const ebookModules: EbookModule[] = slides.map((s, idx) => ({
        id: `modul-${idx + 1}`,
        moduleNumber: idx + 1,
        badge: s.badge || `Modul ${idx + 1}`,
        title: s.title,
        description: s.stepBadge || `Langkah penting dalam ${topic}`,
        introCard: {
          icon: s.type === 'hook' ? '🔥' : s.type === 'cta' ? '📌' : '💡',
          title: s.title,
          subtitle: s.highlightWord ? `Fokus: ${s.highlightWord}` : undefined,
          body: s.body || 'Panduan praktis langkah demi langkah.',
          checklist: s.points && s.points.length > 0 ? s.points : undefined,
        },
        steps: s.points?.map((pt, pIdx) => ({
          number: pIdx + 1,
          title: `Poin 0${pIdx + 1}`,
          text: pt,
        })),
        prompts: s.codeSnippet
          ? [
              {
                tag: s.terminalTitle || `Master Command Step ${idx + 1}`,
                content: s.codeSnippet,
              },
            ]
          : undefined,
      }));

      const ebookData: EbookData = {
        id: `ebook-${Date.now()}`,
        title: topic.toUpperCase() || 'PANDUAN LENGKAP & PRAKTIS',
        tag: `PANDUAN RESMI ${authorName.toUpperCase()}`,
        subtitle: `Panduan digital lengkap ${topic} untuk kreasi konten dan bisnis online.`,
        difficulty: 'Pemula s/d Menengah',
        platform: 'Digital Platform',
        monetization: 'Lynk.id / Shopee',
        format: 'Responsive & Print PDF',
        edition: 'Edisi 2026 • Siap Jual',
        author: authorName,
        modules: ebookModules,
      };

      const html = generateStandaloneEbookHtml(ebookData);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const sanitized = (topic || 'ebook').slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_');
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = `Ebook_${sanitized}.html`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      triggerConfetti();
    } catch (err) {
      console.error(err);
      alert('Gagal mendownload E-Book HTML.');
    } finally {
      setIsProcessing(false);
      setProcessMsg('');
    }
  };

  // Download All PNGs
  const handleDownloadAllPngs = async () => {
    setIsProcessing(true);
    setProcessMsg('Merender semua slide ke gambar HD (3x Scale) PNG...');
    try {
      const items = await renderSlideBlobs();
      for (let i = 0; i < items.length; i++) {
        const { filename, dataUrl } = items[i];
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await new Promise((r) => setTimeout(r, 250));
      }
      triggerConfetti();
    } catch (err) {
      console.error(err);
      alert('Gagal mendownload gambar slide.');
    } finally {
      setIsProcessing(false);
      setProcessMsg('');
    }
  };

  // Download ZIP bundle (PNGs + Standalone HTML + Caption)
  const handleDownloadZip = async () => {
    setIsProcessing(true);
    setProcessMsg('Mengemas paket lengkap HD Slide, HTML Interaktif, dan Caption ke ZIP...');
    try {
      const items = await renderSlideBlobs();
      const zip = new JSZip();

      // 1. Add PNG images
      items.forEach((item) => {
        zip.file(item.filename, item.blob);
      });

      // 2. Add standalone interactive HTML carousel
      const htmlContent = generateStandaloneCarouselHtml({
        topic,
        authorName,
        authorHandle,
        slides,
        theme,
        font,
        aspectRatio,
      });
      zip.file('carousel-presentation.html', htmlContent);

      // 3. Add caption text
      zip.file('caption-social-media.txt', generateCaption());

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const sanitized = (topic || 'carousel').slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_');
      const zipUrl = URL.createObjectURL(zipBlob);

      const link = document.createElement('a');
      link.download = `CarouselX_${sanitized}.zip`;
      link.href = zipUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);

      triggerConfetti();
    } catch (err) {
      console.error(err);
      alert('Gagal mengemas file ZIP.');
    } finally {
      setIsProcessing(false);
      setProcessMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#111114] border border-[#2d2d35] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Google Accent Top Bar */}
        <div className="google-gradient-bar h-1 w-full shrink-0"></div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1f1f23] flex items-center justify-between bg-[#0a0a0c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Export Carousel & E-Book</h3>
              <p className="text-[11px] text-gray-400">Unduh gambar HD, HTML interaktif, E-Book PDF, atau ke Google Drive</p>
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

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status banner */}
          {isProcessing && (
            <div className="p-3 bg-blue-950/60 border border-blue-800 rounded-xl text-blue-300 text-xs flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
              <span>{processMsg}</span>
            </div>
          )}

          {/* Export Action Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Direct Export to Google Slides Deck */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                onClose();
                onOpenSlidesExport();
              }}
              className="p-3.5 rounded-xl bg-[#1a1a1f] border border-amber-500/30 hover:border-amber-400 hover:bg-[#25252c] text-left transition group flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                <Presentation className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white group-hover:text-amber-300 flex items-center gap-1">
                  <span>Ekspor ke Google Slides</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono font-bold">DECK</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Buat presentasi deck Google Slides resmi terformat otomatis
                </div>
              </div>
            </button>

            {/* Download Standalone HTML Carousel */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadHtml}
              className="p-3.5 rounded-xl bg-[#1a1a1f] border border-[#2d2d35] hover:border-amber-500/50 hover:bg-[#25252c] text-left transition group flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white group-hover:text-amber-300 flex items-center gap-1">
                  <span>Download HTML Carousel</span>
                  <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono">.html</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Presentasi slide interaktif dengan swipe & keyboard control
                </div>
              </div>
            </button>

            {/* Export as E-Book HTML / PDF */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadEbookHtml}
              className="p-3.5 rounded-xl bg-[#1a1a1f] border border-[#2d2d35] hover:border-indigo-500/50 hover:bg-[#25252c] text-left transition group flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white group-hover:text-indigo-300 flex items-center gap-1">
                  <span>Export Jadi E-Book HTML</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-mono">Lynk.id / PDF</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Format layout modul e-book digital dengan print CSS & copy prompt
                </div>
              </div>
            </button>

            {/* Download ZIP Package */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadZip}
              className="p-3.5 rounded-xl bg-[#1a1a1f] border border-[#2d2d35] hover:border-blue-500/50 hover:bg-[#25252c] text-left transition group flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                <FileArchive className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white group-hover:text-blue-300 flex items-center gap-1">
                  <span>Download ZIP Bundle</span>
                  <span className="text-[9px] px-1 py-0.2 bg-blue-500/20 text-blue-300 rounded font-mono">.zip</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Semua {slides.length} HD Slide PNG + file HTML + Caption
                </div>
              </div>
            </button>

            {/* Download Individual PNGs */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleDownloadAllPngs}
              className="p-3.5 rounded-xl bg-[#1a1a1f] border border-[#2d2d35] hover:border-indigo-500/50 hover:bg-[#25252c] text-left transition group flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white group-hover:text-indigo-300 flex items-center gap-1">
                  <span>Download Semua PNG (3x)</span>
                  <span className="text-[9px] px-1 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-mono">.png</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Unduh gambar individual resolusi tinggi siap upload
                </div>
              </div>
            </button>

            {/* Save to Google Drive */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                onClose();
                onOpenDriveExport();
              }}
              className="p-3.5 rounded-xl bg-[#1a1a1f] border border-[#2d2d35] hover:border-blue-400/50 hover:bg-[#25252c] text-left transition group flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white group-hover:text-blue-300 flex items-center gap-1">
                  <span>Simpan ke Google Drive</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-mono">Drive API</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Buat folder otomatis di Google Drive dan simpan slide
                </div>
              </div>
            </button>

            {/* Open Full E-Book Studio Tab */}
            {onSwitchToEbook && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToEbook();
                }}
                className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-indigo-500/40 hover:border-indigo-400 text-left transition group flex flex-col justify-between"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center mb-2.5 group-hover:scale-110 transition">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-indigo-200 flex items-center gap-1">
                    <span>Buka E-Book Studio Editor</span>
                    <span className="text-[9px] px-1 py-0.2 bg-indigo-500/30 text-indigo-300 rounded">Tab</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Lihat & sunting modul e-book dengan layout interaktif penuh
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Social Caption Box */}
          <div className="bg-[#1a1a1f] p-3.5 rounded-xl border border-[#2d2d35] space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Caption Siap Posting (Instagram & LinkedIn)
              </div>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-medium flex items-center gap-1.5 transition"
              >
                {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCaption ? 'Tersalin!' : 'Salin Caption'}</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed font-mono whitespace-pre-line bg-black/40 p-2.5 rounded-lg border border-white/5">
              {generateCaption()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0a0a0c] border-t border-[#1f1f23] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
