import React, { useState, useRef } from 'react';
import {
  Youtube,
  Clipboard,
  Globe,
  FileUp,
  FileText,
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Palette,
  Eye,
  Search,
  Image as ImageIcon
} from 'lucide-react';
import { IngestedMaterial, IngestionSourceType, ApiKeyConfig, EbookData, Slide, DesignVariantId } from '../types';
import { VariantSelectorModal } from './VariantSelectorModal';
import { DESIGN_VARIANTS } from '../data/designVariants';
import { generateCarouselAI, generateEbookAI, researchTopicAI } from '../services/aiClient';

interface MaterialIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEbookGenerated: (ebook: EbookData) => void;
  onCarouselGenerated: (slides: Slide[], topic: string, sourceText?: string) => void;
  authorName: string;
  isDarkUi: boolean;
  apiKeyConfig?: ApiKeyConfig;
  onOpenApiKeyModal: () => void;
}

export const MaterialIngestionModal: React.FC<MaterialIngestionModalProps> = ({
  isOpen,
  onClose,
  onEbookGenerated,
  onCarouselGenerated,
  authorName,
  isDarkUi,
  apiKeyConfig,
  onOpenApiKeyModal,
}) => {
  const [activeSource, setActiveSource] = useState<IngestionSourceType>('youtube');
  
  // Inputs
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [customText, setCustomText] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [researchQuery, setResearchQuery] = useState('');
  const [researchFocus, setResearchFocus] = useState('Panduan Lengkap & Aplikatif');
  const [isResearching, setIsResearching] = useState(false);

  // Ingested Material State
  const [ingestedData, setIngestedData] = useState<IngestedMaterial | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);

  // Generation State
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [generationType, setGenerationType] = useState<'ebook' | 'carousel' | null>(null);
  const [moduleCount, setModuleCount] = useState(5);
  const [slideCount, setSlideCount] = useState(7);
  const [language, setLanguage] = useState('Indonesian');
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<DesignVariantId>('variant-1-tech');
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  const activeVariantConfig =
    DESIGN_VARIANTS.find((v) => v.id === selectedVariantId) || DESIGN_VARIANTS[0];

  if (!isOpen) return null;

  // 1. Fetch YouTube Transcript (with resilient oEmbed fallback)
  const handleFetchYoutube = async () => {
    if (!youtubeUrl.trim()) {
      setIngestError('Silakan masukkan link YouTube yang valid.');
      return;
    }
    setIsIngesting(true);
    setIngestError(null);

    const cleanYt = youtubeUrl.trim();
    let videoId = '';
    const match = cleanYt.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (match && match[1]) {
      videoId = match[1];
    }

    try {
      const res = await fetch('/api/ingest/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: cleanYt,
          apiKey: apiKeyConfig?.apiKey,
          provider: apiKeyConfig?.provider,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setIngestedData({
          id: `mat-${Date.now()}`,
          sourceType: 'youtube',
          title: data.title || 'YouTube Video',
          sourceUrl: data.sourceUrl || cleanYt,
          authorOrChannel: data.channelName,
          thumbnailUrl: data.thumbnailUrl,
          rawText: data.text,
          wordCount: data.wordCount || data.text.split(/\s+/).length,
          dateAdded: new Date().toLocaleTimeString(),
          isExtractedFromCaptions: data.isExtractedFromCaptions !== false,
        });
        return;
      }
    } catch {
      // Proceed to client oEmbed fallback
    }

    // Client-side fallback via public YouTube oEmbed
    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(cleanYt)}&format=json`);
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        const title = oembed.title || 'YouTube Video';
        const channel = oembed.author_name || 'YouTube Creator';
        const fallbackText = `Video YouTube: "${title}" oleh ${channel}.\n\nURL: ${cleanYt}\n\nCatatan: Video ini siap diolah oleh AI. Anda juga dapat menambahkan transkrip atau poin penting tambahan di bawah ini.`;
        setIngestedData({
          id: `mat-${Date.now()}`,
          sourceType: 'youtube',
          title,
          sourceUrl: cleanYt,
          authorOrChannel: channel,
          thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined,
          rawText: fallbackText,
          wordCount: fallbackText.split(/\s+/).length,
          dateAdded: new Date().toLocaleTimeString(),
          isExtractedFromCaptions: false,
        });
        return;
      }
    } catch {
      // Ignored
    }

    setIngestError('Tidak dapat mengambil transkrip otomatis untuk video ini. Silakan salin teks atau rangkuman ke tab "Tulis / Paste Naskah".');
    setIsIngesting(false);
  };

  // 2. Fetch Web Article Content (with Jina Reader client fallback)
  const handleFetchWeb = async () => {
    if (!webUrl.trim()) {
      setIngestError('Silakan masukkan link website atau artikel.');
      return;
    }
    setIsIngesting(true);
    setIngestError(null);
    const cleanUrl = webUrl.trim();

    // Strategy 1: Server endpoint
    try {
      const res = await fetch('/api/ingest/web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.text && data.text.length > 50) {
          setIngestedData({
            id: `mat-${Date.now()}`,
            sourceType: 'web',
            title: data.title || 'Artikel Web',
            sourceUrl: data.sourceUrl || cleanUrl,
            rawText: data.text,
            wordCount: data.wordCount || data.text.split(/\s+/).length,
            dateAdded: new Date().toLocaleTimeString(),
          });
          return;
        }
      }
    } catch {
      // Proceed to Jina Reader client fallback
    }

    // Strategy 2: Client-side Jina Reader fallback
    try {
      const jinaRes = await fetch(`https://r.jina.ai/${cleanUrl}`);
      if (jinaRes.ok) {
        const jinaText = await jinaRes.text();
        if (jinaText && jinaText.length > 50) {
          let articleTitle = 'Artikel Web';
          const titleMatch = jinaText.match(/Title:\s*(.+)/i);
          if (titleMatch && titleMatch[1]) articleTitle = titleMatch[1].trim();
          const cleanBody = jinaText.replace(/^Title:.*?\n/i, '').replace(/^URL Source:.*?\n/i, '').trim();

          setIngestedData({
            id: `mat-${Date.now()}`,
            sourceType: 'web',
            title: articleTitle,
            sourceUrl: cleanUrl,
            rawText: cleanBody,
            wordCount: cleanBody.split(/\s+/).filter(Boolean).length,
            dateAdded: new Date().toLocaleTimeString(),
          });
          return;
        }
      }
    } catch {
      // Ignored
    }

    setIngestError('Gagal membaca konten website. Silakan salin isi artikel langsung ke tab "Tulis / Paste Naskah".');
    setIsIngesting(false);
  };

  // 3. Upload & Parse PDF / Word (.docx)
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsIngesting(true);
    setIngestError(null);
    setSelectedFile(file);

    try {
      const isDocx = file.name.toLowerCase().endsWith('.docx') || file.type.includes('word');
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      if (isPdf || isDocx) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            const res = await fetch('/api/ingest/pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                base64Data,
                fileName: file.name,
              }),
            });

            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
              throw new Error('Layanan pembaca dokumen server tidak aktif. Silakan salin teks ke tab "Tulis / Paste Naskah".');
            }

            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.error || 'Gagal membaca file dokumen.');
            }

            setIngestedData({
              id: `mat-${Date.now()}`,
              sourceType: isDocx ? 'document' : 'pdf',
              title: data.title || file.name,
              fileName: file.name,
              pageCount: data.pageCount,
              rawText: data.text,
              wordCount: data.wordCount || data.text.split(/\s+/).length,
              dateAdded: new Date().toLocaleTimeString(),
            });
            setIsIngesting(false);
          } catch (pErr: any) {
            setIngestError(pErr.message || 'Gagal membaca file dokumen.');
            setIsIngesting(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      // Plain text, markdown fallback
      const reader = new FileReader();
      reader.onload = () => {
        const textContent = reader.result as string;
        setIngestedData({
          id: `mat-${Date.now()}`,
          sourceType: 'document',
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          rawText: textContent,
          wordCount: textContent.split(/\s+/).length,
          dateAdded: new Date().toLocaleTimeString(),
        });
        setIsIngesting(false);
      };
      reader.readAsText(file);
    } catch (err: any) {
      setIngestError(err.message || 'Gagal mengunggah file.');
      setIsIngesting(false);
    }
  };

  // 4. Upload & Parse Image / Screenshot / Infographics (OCR)
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setIsIngesting(true);
    setIngestError(null);
    setSelectedImageFile(file);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch('/api/ingest/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data,
              fileName: file.name,
              mimeType: file.type || 'image/png',
            }),
          });

          if (res.ok) {
            const data = await res.json();
            setIngestedData({
              id: `mat-img-${Date.now()}`,
              sourceType: 'image',
              title: data.title || file.name,
              fileName: file.name,
              rawText: data.text,
              wordCount: data.wordCount,
              thumbnailUrl: base64Data,
              dateAdded: new Date().toLocaleTimeString(),
            });
            setIsIngesting(false);
            return;
          }
        } catch {
          // fallback to client preview
        }

        // Fallback if image OCR server is unavailable
        setIngestedData({
          id: `mat-img-${Date.now()}`,
          sourceType: 'image',
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          rawText: `Catatan Gambar: "${file.name}".\n\nMateri visual berhasil dimuat. Anda dapat melengkapi naskah penjelasan atau poin penting di bawah ini sebelum membuat carousel/ebook.`,
          wordCount: 20,
          thumbnailUrl: base64Data,
          dateAdded: new Date().toLocaleTimeString(),
        });
        setIsIngesting(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIngestError(err.message || 'Gagal mengunggah gambar.');
      setIsIngesting(false);
    }
  };

  // 5. Conduct AI Deep Research (NotebookLM style)
  const handleResearchTopic = async () => {
    if (!researchQuery.trim()) {
      setIngestError('Silakan masukkan topik atau pertanyaan yang ingin diriset.');
      return;
    }

    setIsResearching(true);
    setIngestError(null);

    try {
      const result = await researchTopicAI({
        topic: researchQuery.trim(),
        focus: researchFocus,
        language,
        apiKeyConfig,
      });

      setIngestedData({
        id: `mat-res-${Date.now()}`,
        sourceType: 'research',
        title: result.title || researchQuery.trim(),
        rawText: result.text,
        wordCount: result.wordCount,
        dateAdded: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setIngestError(err.message || 'Terjadi kesalahan saat AI melakukan riset materi.');
    } finally {
      setIsResearching(false);
    }
  };

  const customTextWordCount = customText.trim() ? customText.trim().split(/\s+/).length : 0;
  const customTextCharCount = customText.length;

  // 6. Ingest Raw Notes / Text
  const handleIngestText = () => {
    if (!customText.trim()) {
      setIngestError('Silakan masukkan teks atau catatan materi.');
      return;
    }
    const words = customText.trim().split(/\s+/).length;
    setIngestedData({
      id: `mat-${Date.now()}`,
      sourceType: 'text',
      title: customTopic || 'Catatan & Materi Pengguna',
      rawText: customText.trim(),
      wordCount: words,
      dateAdded: new Date().toLocaleTimeString(),
    });
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCustomText((prev) => (prev ? prev + '\n\n' + text : text));
      }
    } catch {
      alert('Tidak dapat membaca clipboard secara otomatis. Silakan gunakan Ctrl+V atau Command+V untuk menempel teks.');
    }
  };

  // Clear ingested state
  const handleClear = () => {
    setIngestedData(null);
    setYoutubeUrl('');
    setWebUrl('');
    setSelectedFile(null);
    setSelectedImageFile(null);
    setResearchQuery('');
    setCustomText('');
    setCustomTopic('');
    setIngestError(null);
  };

  // Execute AI E-Book Generation from Ingested Material
  const handleGenerateEbook = async () => {
    if (!ingestedData && !customTopic.trim() && !customText.trim()) {
      setIngestError('Silakan masukkan materi atau topik terlebih dahulu.');
      return;
    }

    setIsProcessingAi(true);
    setGenerationType('ebook');
    setIngestError(null);

    try {
      const topicTitle = ingestedData?.title || customTopic || customText.slice(0, 60) || 'Panduan Komprehensif';
      const sourceText = ingestedData?.rawText || customText || '';

      const result = await generateEbookAI({
        topic: topicTitle,
        sourceText,
        sourceType: ingestedData?.sourceType || 'notes',
        sourceTitle: ingestedData?.title,
        authorName: authorName || 'Arijal Meutuwah',
        moduleCount,
        language,
        apiKeyConfig,
      });

      if (!result.ebook) {
        throw new Error(result.error || 'Gagal membuat E-Book dari AI.');
      }

      onEbookGenerated({ ...result.ebook, variantId: selectedVariantId });
      onClose();
    } catch (err: any) {
      setIngestError(err.message || 'Terjadi kesalahan saat menyusun E-Book.');
    } finally {
      setIsProcessingAi(false);
      setGenerationType(null);
    }
  };

  // Execute AI Carousel Generation from Ingested Material
  const handleGenerateCarousel = async () => {
    if (!ingestedData && !customTopic.trim() && !customText.trim()) {
      setIngestError('Silakan masukkan materi atau topik terlebih dahulu.');
      return;
    }

    setIsProcessingAi(true);
    setGenerationType('carousel');
    setIngestError(null);

    try {
      const topicTitle = ingestedData?.title || customTopic || customText.slice(0, 60) || 'High Impact Guide';
      const sourceText = ingestedData?.rawText || customText || '';

      const result = await generateCarouselAI({
        topic: topicTitle,
        sourceMaterial: sourceText,
        slideCount,
        language,
        authorName: authorName || '@abangjal',
        apiKeyConfig,
      });

      if (!result.slides || result.slides.length === 0) {
        throw new Error(result.error || 'Gagal menghasilkan slide carousel.');
      }

      const topicToUse = result.topic || topicTitle;
      onCarouselGenerated(result.slides, topicToUse, sourceText);
      onClose();
    } catch (err: any) {
      setIngestError(err.message || 'Terjadi kesalahan saat meringkas menjadi carousel.');
    } finally {
      setIsProcessingAi(false);
      setGenerationType(null);
    }
  };

  const handleCopyTranscript = () => {
    if (!ingestedData?.rawText) return;
    navigator.clipboard.writeText(ingestedData.rawText);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div
        className={`w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden my-8 flex flex-col max-h-[90vh] ${
          isDarkUi ? 'bg-[#0f172a] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkUi ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Hub Ingest Materi & Generator AI</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Pipeline Cerdas
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Olah materi dari YouTube, Web, PDF, atau Catatan ➔ Master E-Book ➔ Ringkasan Carousel
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-ingest-modal-header-btn"
            aria-label="Close modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Source Tabs: 6 Multi-Source Channels */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              1. Pilih Sumber Materi Anda (NotebookLM Studio)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <button
                type="button"
                onClick={() => { setActiveSource('youtube'); setIngestError(null); }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  activeSource === 'youtube'
                    ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-sm'
                    : isDarkUi ? 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span className="truncate">YouTube / Playlist</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSource('web'); setIngestError(null); }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  activeSource === 'web'
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-sm'
                    : isDarkUi ? 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span className="truncate">Web / Google Docs</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSource('pdf'); setIngestError(null); }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  activeSource === 'pdf'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-sm'
                    : isDarkUi ? 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileUp className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate">PDF / Word DOCX</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSource('image'); setIngestError(null); }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  activeSource === 'image'
                    ? 'bg-pink-500/10 border-pink-500/50 text-pink-400 shadow-sm'
                    : isDarkUi ? 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
                <span className="truncate">Foto / Infografis</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSource('text'); setIngestError(null); }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  activeSource === 'text'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-sm'
                    : isDarkUi ? 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span className="truncate">Tulis Naskah Bebas</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSource('research'); setIngestError(null); }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  activeSource === 'research'
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-sm'
                    : isDarkUi ? 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-purple-400" />
                <span className="truncate">🔍 Riset Topik AI</span>
              </button>
            </div>
          </div>

          {/* Active Input Panel */}
          <div className={`p-4 rounded-xl border ${isDarkUi ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            {/* 1. YouTube Panel */}
            {activeSource === 'youtube' && (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">
                  Masukkan Link Video atau Playlist YouTube (Otomatis mengekstrak transkrip & kurikulum):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... atau https://www.youtube.com/playlist?list=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchYoutube()}
                    className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      isDarkUi ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={isIngesting}
                    onClick={handleFetchYoutube}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    {isIngesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Youtube className="w-4 h-4" />}
                    <span>{isIngesting ? 'Mengekstrak...' : 'Tarik Materi'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 font-mono border border-red-500/20">Multi-Strategy Engine</span>
                  <span>Mendukung link video tunggal, YouTube Shorts, maupun satu Playlist tutorial lengkap.</span>
                </p>
              </div>
            )}

            {/* 2. Web & Google Docs Panel */}
            {activeSource === 'web' && (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">
                  Masukkan Link Website, Artikel Berita, Blog, atau Google Docs / Sheets:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://medium.com/... atau https://docs.google.com/document/d/..."
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchWeb()}
                    className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkUi ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={isIngesting}
                    onClick={handleFetchWeb}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    {isIngesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    <span>{isIngesting ? 'Mengambil...' : 'Ekstrak Konten'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Otomatis mengekstrak teks bersih tanpa iklan, termasuk Google Docs publik yang dibagikan dengan link.
                </p>
              </div>
            )}

            {/* 3. PDF & Word DOCX Panel */}
            {activeSource === 'pdf' && (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">
                  Unggah Dokumen PDF, Word (.docx), E-Book, atau Teks (.txt, .md):
                </label>
                <div className="border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer border-slate-700 hover:border-amber-500/60 bg-slate-800/30">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    id="file-ingest-input"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <label htmlFor="file-ingest-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <FileUp className="w-8 h-8 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {selectedFile ? selectedFile.name : 'Klik untuk Pilih File PDF / Word (.docx) atau Seret ke Sini'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Mendukung PDF dan Microsoft Word (.docx) hingga puluhan halaman
                    </span>
                  </label>
                </div>
                {isIngesting && (
                  <div className="flex items-center justify-center gap-2 text-xs text-amber-400 py-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengekstrak isi teks dokumen secara presisi...</span>
                  </div>
                )}
              </div>
            )}

            {/* 4. Image / Infographics Panel */}
            {activeSource === 'image' && (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">
                  Unggah Foto, Screenshot Artikel, Slide, atau Gambar Infografis:
                </label>
                <div className="border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer border-slate-700 hover:border-pink-500/60 bg-slate-800/30">
                  <input
                    type="file"
                    accept="image/*"
                    id="image-ingest-input"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <label htmlFor="image-ingest-input" className="cursor-pointer flex flex-col items-center gap-2">
                    <ImageIcon className="w-8 h-8 text-pink-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {selectedImageFile ? selectedImageFile.name : 'Pilih Foto / Screenshot Materi (PNG, JPG, WEBP)'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      AI Multimodal membaca teks, diagram alur, dan konsep dari gambar secara otomatis
                    </span>
                  </label>
                </div>
                {isIngesting && (
                  <div className="flex items-center justify-center gap-2 text-xs text-pink-400 py-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI sedang membaca dan mengekstrak materi dari gambar...</span>
                  </div>
                )}
              </div>
            )}

            {/* 5. Tulis Naskah Bebas Panel */}
            {activeSource === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Judul / Topik Materi (Opsional):
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 5 Strategi Bisnis & AI Paling Dicari 2026 (Bisa dikosongkan)"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2.5 ${
                      isDarkUi ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      Tulis atau Tempel Catatan / Naskah Panjang (Tanpa Batas Karakter):
                    </label>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {customTextWordCount} kata • {customTextCharCount} karakter • ~{Math.max(Math.ceil(customTextWordCount / 200), 1)} mnt baca
                      </span>
                      <button
                        type="button"
                        onClick={handlePasteFromClipboard}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1"
                        title="Tempel teks langsung dari clipboard"
                      >
                        <Clipboard className="w-3 h-3" />
                        <span>Tempel Clipboard</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={9}
                    placeholder="Tempel artikel berita lengkap (Detik, Kompas, Medium), transkrip rekaman podcast, kurikulum kursus, draf bab buku, atau catatan panjang Anda di sini...&#10;&#10;Kotak narasi ini sangat luas dan nyaman menampung puluhan ribu kata tanpa terpotong!"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className={`w-full min-h-[240px] max-h-[400px] px-3.5 py-3 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed ${
                      isDarkUi ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-slate-400">
                    💡 Tips: Masukkan teks mentah apa saja, AI kami yang akan merapikan struktur judul dan isinya.
                  </p>
                  <button
                    type="button"
                    onClick={handleIngestText}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>Gunakan Naskah Ini Sebagai Materi</span>
                  </button>
                </div>
              </div>
            )}

            {/* 6. AI Deep Research Panel (NotebookLM style) */}
            {activeSource === 'research' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Topik atau Masalah yang Ingin Diriset oleh AI:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Cara Membangun Produk Digital Laris di Lynk.id & Shopee untuk Pemula"
                    value={researchQuery}
                    onChange={(e) => setResearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleResearchTopic()}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDarkUi ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 shrink-0">Fokus Pembahasan:</span>
                    <select
                      value={researchFocus}
                      onChange={(e) => setResearchFocus(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    >
                      <option value="Panduan Lengkap & Aplikatif">Panduan Lengkap & Aplikatif</option>
                      <option value="Studi Kasus & Blueprint Bisnis">Studi Kasus & Blueprint Bisnis</option>
                      <option value="Tutorial Step-by-Step Teknis">Tutorial Step-by-Step Teknis</option>
                      <option value="Tips Viral & Formula Copywriting">Tips Viral & Formula Copywriting</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={isResearching || !researchQuery.trim()}
                    onClick={handleResearchTopic}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 shrink-0 disabled:opacity-50"
                  >
                    {isResearching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI Sedang Meriset Materi...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>🔍 Mulai Riset Materi AI</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  AI akan bertindak sebagai analis riset senior: mengumpulkan fakta, menyusun 4-6 bab pembahasan, studi kasus, dan checklist aksi yang langsung siap dijadikan bahan baku E-Book atau Carousel.
                </p>
              </div>
            )}
          </div>

          {/* Error Notice */}
          {ingestError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Perhatian: </span>
                {ingestError}
              </div>
            </div>
          )}

          {/* Ingested Result Live Preview */}
          {ingestedData && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDarkUi ? 'bg-slate-900/90 border-blue-500/30' : 'bg-blue-50/50 border-blue-200'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {ingestedData.thumbnailUrl ? (
                    <img
                      src={ingestedData.thumbnailUrl}
                      alt="Thumbnail"
                      className="w-16 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {ingestedData.sourceType === 'research' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          🔍 Riset AI Mendalam
                        </span>
                      ) : ingestedData.sourceType === 'image' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          🖼️ OCR Foto / Infografis
                        </span>
                      ) : ingestedData.sourceType === 'youtube' && (ingestedData as any).isPlaylist ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                          ⚡ Kurikulum Playlist YouTube
                        </span>
                      ) : ingestedData.sourceType === 'youtube' && ingestedData.isExtractedFromCaptions === false ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          ⚡ Sintesis Kerangka Video
                        </span>
                      ) : ingestedData.sourceType === 'youtube' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ✓ Subtitle Asli Video
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          ✓ Materi {ingestedData.sourceType.toUpperCase()}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{ingestedData.wordCount.toLocaleString()} Kata</span>
                      <span className="text-xs text-slate-400">• ~{Math.max(Math.ceil(ingestedData.wordCount / 200), 1)} Menit Baca</span>
                      {ingestedData.pageCount && (
                        <span className="text-xs text-slate-400">• {ingestedData.pageCount} Halaman</span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-100 mt-0.5 line-clamp-1">{ingestedData.title}</h3>
                    {ingestedData.authorOrChannel && (
                      <p className="text-xs text-slate-400">Oleh: {ingestedData.authorOrChannel}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-700 hover:bg-slate-800 text-slate-300 transition flex items-center gap-1 shrink-0"
                    title="Salin isi materi"
                  >
                    {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTranscript ? 'Tersalin' : 'Salin Teks'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2 py-1.5 rounded-lg text-xs font-medium border border-slate-700 hover:bg-rose-950/40 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition"
                    title="Hapus materi ini"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Editable Text Area for Custom Adjustments */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Pratinjau / Koreksi Naskah Sebelum Diolah AI:</span>
                  <span className="text-slate-500 text-[10px]">Anda bebas menambah atau mengedit poin di bawah</span>
                </div>
                <textarea
                  rows={5}
                  value={ingestedData.rawText}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setIngestedData({
                      ...ingestedData,
                      rawText: newText,
                      wordCount: newText.trim().split(/\s+/).filter(Boolean).length,
                    });
                  }}
                  className="w-full p-3 rounded-lg bg-black/40 border border-slate-700 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* AI Workflow Action Hub */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Pilih Tindakan AI Selanjutnya
              </label>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Bahasa Output:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="Indonesian">Bahasa Indonesia</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            {/* 5-Variant Selection Bar with Live Preview */}
            <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDarkUi ? 'bg-slate-900/80 border-amber-500/30' : 'bg-amber-50/70 border-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md shrink-0"
                  style={{ backgroundColor: activeVariantConfig.palette.bg }}
                >
                  <Palette className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Gaya Desain: {activeVariantConfig.name}
                    </span>
                    {activeVariantConfig.isMainVariant ? (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Varian Utama ⭐
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-slate-700/40 text-slate-300">
                        {activeVariantConfig.category.split(',')[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{activeVariantConfig.tagline}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVariantModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Live Preview (5 Gaya)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Fast Track Carousel (Direct for News, Threads & Daily Tips) */}
              <div className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-4 transition relative overflow-hidden ${
                isDarkUi ? 'bg-emerald-950/30 border-emerald-500/50 hover:border-emerald-400 shadow-lg shadow-emerald-900/10' : 'bg-emerald-50/70 border-emerald-300'
              }`}>
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ⚡ Mode Kilat (Fast Track)
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h4 className="font-extrabold text-sm text-emerald-300">Langsung Jadi Carousel Medsos</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Cocok untuk berita terupdate, artikel blog, dan tips harian!</strong> Tanpa perlu membuat E-Book dulu, AI langsung mengubah materi menjadi slide microblog viral lengkap dengan Hook pembuka, poin daging, dan CTA komentar.
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-emerald-500/20">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Jumlah Slide Carousel:</span>
                    <select
                      value={slideCount}
                      onChange={(e) => setSlideCount(parseInt(e.target.value, 10))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    >
                      <option value={5}>5 Slide Ringkas (Cepat Baca)</option>
                      <option value={7}>7 Slide Standar (Rekomendasi)</option>
                      <option value={8}>8 Slide Tutorial Pro</option>
                      <option value={10}>10 Slide Deep Dive</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessingAi || (!ingestedData && !customTopic)}
                    onClick={handleGenerateCarousel}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessingAi && generationType === 'carousel' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI Sedang Merancang Carousel...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>⚡ Generate Carousel Medsos Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Option 2: Digital Product Kit (Master E-Book) */}
              <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition relative overflow-hidden ${
                isDarkUi ? 'bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-400 shadow-md' : 'bg-indigo-50/50 border-indigo-200'
              }`}>
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    📘 Siap Jual (Lynk.id / Shopee)
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h4 className="font-extrabold text-sm text-indigo-200">Buat Master E-Book Lengkap</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Cocok untuk produk digital berbayar & kursus!</strong> AI menyusun materi menjadi bab/modul panduan interaktif lengkap dengan kartu pengantar, checklist aksi, instruksi langkah, dan pro-tips siap ekspor PDF/HTML.
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-indigo-500/20">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Jumlah Bab / Modul:</span>
                    <select
                      value={moduleCount}
                      onChange={(e) => setModuleCount(parseInt(e.target.value, 10))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                    >
                      <option value={3}>3 Modul Ringkas</option>
                      <option value={5}>5 Modul Komprehensif (Rekomendasi)</option>
                      <option value={7}>7 Modul Mendalam</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessingAi || (!ingestedData && !customTopic)}
                    onClick={handleGenerateEbook}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessingAi && generationType === 'ebook' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI Sedang Menyusun E-Book...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>📘 Generate Master E-Book Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between text-xs ${
          isDarkUi ? 'border-slate-800 bg-slate-900/60 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-500'
        }`}>
          <div className="flex items-center gap-2">
            <span>Powered by Gemini 3.7 Flash & Multi-Provider AI</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* 5-Variant Selector & Live Preview Modal */}
      <VariantSelectorModal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        selectedVariantId={selectedVariantId}
        onSelectVariant={(variantId) => {
          setSelectedVariantId(variantId);
        }}
        isDarkUi={isDarkUi}
        contentTitle={ingestedData?.title || customTopic || 'Panduan Komprehensif'}
        contentSubtitle="Format infografis praktis siap baca dan monetisasi."
        authorName={authorName}
      />
    </div>
  );
};
