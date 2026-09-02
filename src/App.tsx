import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Plus,
  Download,
  Sparkles,
  Wand2,
  FileEdit,
  Key,
  HardDrive,
  Table,
  CheckCircle2,
  Ratio,
  FolderUp,
  BookOpen
} from 'lucide-react';
import { Slide, AspectRatio, ThemeId, FontId, AppUiMode, ActiveAppTab, ApiKeyConfig, EbookData } from './types';
import { THEMES, FONT_OPTIONS, DEFAULT_THEME_ID, DEFAULT_FONT_ID, getTheme, getFont } from './constants/themes';
import { SAMPLE_PRESETS } from './data/samplePresets';
import { createInitialEmptyEbook } from './utils/defaultEbook';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SlideCard } from './components/SlideCard';
import { SlideEditorModal } from './components/SlideEditorModal';
import { GoogleSyncModal, GoogleWorkspaceMode } from './components/GoogleSyncModal';
import { ExportModal } from './components/ExportModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ContentWritingModal } from './components/ContentWritingModal';
import { EbookReaderView } from './components/EbookReaderView';
import { MaterialIngestionModal } from './components/MaterialIngestionModal';
import { authenticateGoogle, getStoredGoogleToken } from './services/googleWorkspace';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveAppTab>('carousel');
  const [topic, setTopic] = useState('Cara Automasi Riset & Bikin 30 Konten dalam 10 Menit Pakai AI');
  const [slideCount, setSlideCount] = useState(5);
  const [authorName, setAuthorName] = useState<string>(() => {
    try {
      return localStorage.getItem('carouselx_author_name') || 'Arijal Meutuwah';
    } catch {
      return 'Arijal Meutuwah';
    }
  });
  const [authorHandle, setAuthorHandle] = useState<string>(() => {
    try {
      return localStorage.getItem('carouselx_author_handle') || '@abangjal';
    } catch {
      return '@abangjal';
    }
  });
  const [tone, setTone] = useState('santai dan engaging');
  const [language, setLanguage] = useState('Indonesian');
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('tech-guide-pro');
  const [currentFont, setCurrentFont] = useState<FontId>('jakarta');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('4:5');
  const [appUiMode, setAppUiMode] = useState<AppUiMode>('dark');
  const [slides, setSlides] = useState<Slide[]>(SAMPLE_PRESETS[0].slides);

  // E-Book State (Dynamic AI Initializer without hardcoded mock files)
  const [currentEbook, setCurrentEbook] = useState<EbookData>(() => createInitialEmptyEbook('Arijal Meutuwah'));

  // Multi-Provider API Key Config
  const [apiKeyConfig, setApiKeyConfig] = useState<ApiKeyConfig>({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.5-flash',
  });

  // Mobile View Switcher (Carousel Mode: 'sidebar' | 'preview')
  const [mobileView, setMobileView] = useState<'sidebar' | 'preview'>('preview');

  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'error' | 'success' | ''>('');
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Active slide index for pagination dots
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Modals state
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isContentWritingModalOpen, setIsContentWritingModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [googleModal, setGoogleModal] = useState<{
    isOpen: boolean;
    mode: GoogleWorkspaceMode;
  }>({
    isOpen: false,
    mode: 'slides_export',
  });

  const [polishingIndex, setPolishingIndex] = useState<number | null>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  // Load preferences from localStorage on init
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('carouselx_ai_config');
      if (savedConfig) {
        setApiKeyConfig(JSON.parse(savedConfig));
      } else {
        const legacyKey = localStorage.getItem('carouselx_gemini_key');
        if (legacyKey) {
          setApiKeyConfig({ provider: 'gemini', apiKey: legacyKey, model: 'gemini-2.5-flash' });
        }
      }

      const savedTheme = localStorage.getItem('carouselx_theme');
      if (savedTheme && THEMES[savedTheme as ThemeId]) setCurrentTheme(savedTheme as ThemeId);

      const savedFont = localStorage.getItem('carouselx_font');
      if (savedFont) setCurrentFont(savedFont as FontId);

      const savedUiMode = localStorage.getItem('carouselx_ui_mode');
      if (savedUiMode === 'light' || savedUiMode === 'dark') setAppUiMode(savedUiMode);

      const token = getStoredGoogleToken();
      if (token) setIsGoogleConnected(true);
    } catch {
      // ignore
    }
  }, []);

  // Save creator branding permanently
  useEffect(() => {
    try {
      localStorage.setItem('carouselx_author_name', authorName);
    } catch {
      // ignore
    }
  }, [authorName]);

  useEffect(() => {
    try {
      localStorage.setItem('carouselx_author_handle', authorHandle);
    } catch {
      // ignore
    }
  }, [authorHandle]);

  const handleSaveApiKeyConfig = (newConfig: ApiKeyConfig) => {
    setApiKeyConfig(newConfig);
    try {
      localStorage.setItem('carouselx_ai_config', JSON.stringify(newConfig));
      if (newConfig.apiKey) {
        localStorage.setItem('carouselx_gemini_key', newConfig.apiKey);
      }
    } catch {
      // ignore
    }
    setStatusType('success');
    setStatusMessage(`Konfigurasi Provider ${newConfig.provider.toUpperCase()} tersimpan!`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleThemeChange = (newTheme: ThemeId) => {
    setCurrentTheme(newTheme);
    try {
      localStorage.setItem('carouselx_theme', newTheme);
    } catch {
      // ignore
    }
  };

  const handleFontChange = (newFont: FontId) => {
    setCurrentFont(newFont);
    try {
      localStorage.setItem('carouselx_font', newFont);
    } catch {
      // ignore
    }
  };

  const handleToggleUiMode = () => {
    const nextMode: AppUiMode = appUiMode === 'dark' ? 'light' : 'dark';
    setAppUiMode(nextMode);
    try {
      localStorage.setItem('carouselx_ui_mode', nextMode);
    } catch {
      // ignore
    }
  };

  const handleConnectGoogle = async () => {
    try {
      setStatusType('info');
      setStatusMessage('Menghubungkan ke Google Workspace...');
      await authenticateGoogle();
      setIsGoogleConnected(true);
      setStatusType('success');
      setStatusMessage('Berhasil terhubung ke Google Drive & Sheets!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      console.error(err);
      setStatusType('error');
      setStatusMessage(err.message || 'Gagal otentikasi Google Workspace.');
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  // Generate Carousel with AI (using active provider)
  const handleGenerateCarousel = async () => {
    if (!topic.trim()) {
      setStatusType('error');
      setStatusMessage('Silakan masukkan topik carousel terlebih dahulu.');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    setIsGenerating(true);
    setStatusType('info');
    setStatusMessage(`Membuat ${slideCount} slide dengan ${apiKeyConfig.provider.toUpperCase()} AI...`);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKeyConfig.apiKey) {
        headers['x-gemini-key'] = apiKeyConfig.apiKey;
      }

      const res = await fetch('/api/generate-carousel', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          topic,
          slideCount,
          tone,
          language,
          authorName: authorHandle || authorName,
          provider: apiKeyConfig.provider,
          apiKey: apiKeyConfig.apiKey,
          model: apiKeyConfig.model,
          baseUrl: apiKeyConfig.baseUrl,
        }),
      });

      const data = await res.json();

      if (data.slides && data.slides.length > 0) {
        setSlides(data.slides);
        setActiveSlideIndex(0);
        setMobileView('preview');
        setStatusType('success');
        setStatusMessage(
          data.isFallback
            ? 'Format template siap digunakan.'
            : `✓ ${data.slides.length} slide berhasil dibuat dengan ${apiKeyConfig.provider.toUpperCase()}!`
        );
      } else {
        throw new Error(data.error || 'Gagal menghasilkan slide.');
      }
    } catch (err: any) {
      console.error(err);
      setStatusType('error');
      setStatusMessage(err.message || 'Terjadi kesalahan saat memanggil AI.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMessage(''), 3500);
    }
  };

  // Apply written / summarized content to carousel
  const handleApplyWrittenContent = (newSlides: Slide[], newTopic: string) => {
    setSlides(newSlides);
    if (newTopic) setTopic(newTopic);
    setSlideCount(newSlides.length);
    setActiveSlideIndex(0);
    setMobileView('preview');
    setStatusType('success');
    setStatusMessage(`Berhasil menyusun ${newSlides.length} slide dari draf tulisan!`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // AI Polish single slide inline
  const handleInlineAiPolish = async (index: number) => {
    const target = slides[index];
    if (!target) return;

    setPolishingIndex(index);
    try {
      const res = await fetch('/api/structure-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: `Slide Type: ${target.type}\nTitle: ${target.title}\nBody: ${target.body}\nPoints: ${(target.points || []).join(', ')}`,
          slideCount: 1,
          language,
          authorName: authorHandle || authorName,
          provider: apiKeyConfig.provider,
          apiKey: apiKeyConfig.apiKey,
          model: apiKeyConfig.model,
          baseUrl: apiKeyConfig.baseUrl,
        }),
      });

      const data = await res.json();
      if (data.slides && data.slides[0]) {
        const polished = data.slides[0];
        const updated = [...slides];
        updated[index] = {
          ...target,
          title: polished.title || target.title,
          body: polished.body || target.body,
          points: polished.points && polished.points.length > 0 ? polished.points : target.points,
        };
        setSlides(updated);
        setStatusType('success');
        setStatusMessage(`Slide ${index + 1} berhasil diperhalus oleh AI!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPolishingIndex(null);
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  // AI Polish inside Slide Editor Modal
  const handleModalAiPolish = async (slide: Slide): Promise<Slide> => {
    try {
      const res = await fetch('/api/structure-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: `Title: ${slide.title}\nBody: ${slide.body}\nPoints: ${(slide.points || []).join(', ')}`,
          slideCount: 1,
          language,
          authorName: authorHandle || authorName,
          provider: apiKeyConfig.provider,
          apiKey: apiKeyConfig.apiKey,
          model: apiKeyConfig.model,
          baseUrl: apiKeyConfig.baseUrl,
        }),
      });

      const data = await res.json();
      if (data.slides && data.slides[0]) {
        const p = data.slides[0];
        return {
          ...slide,
          title: p.title || slide.title,
          body: p.body || slide.body,
          points: p.points && p.points.length > 0 ? p.points : slide.points,
        };
      }
    } catch (err) {
      console.error(err);
    }
    return slide;
  };

  // Reorder slides
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Recalculate slide numbers
    const finalSlides = updated.map((s, idx) => ({ ...s, slide_number: idx + 1 }));
    setSlides(finalSlides);
  };

  // Duplicate slide
  const handleDuplicateSlide = (index: number) => {
    const slideToDup = slides[index];
    if (!slideToDup) return;
    const duplicated: Slide = {
      ...slideToDup,
      id: `slide-dup-${Date.now()}`,
      title: `${slideToDup.title} (Salinan)`,
    };
    const updated = [...slides.slice(0, index + 1), duplicated, ...slides.slice(index + 1)].map((s, idx) => ({
      ...s,
      slide_number: idx + 1,
    }));
    setSlides(updated);
    setSlideCount(updated.length);
    setStatusType('success');
    setStatusMessage(`Slide #${index + 1} berhasil diduplikasi!`);
    setTimeout(() => setStatusMessage(''), 2000);
  };

  // Delete slide
  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      setStatusType('error');
      setStatusMessage('Carousel harus memiliki minimal 1 slide.');
      setTimeout(() => setStatusMessage(''), 2500);
      return;
    }
    const updated = slides.filter((_, i) => i !== index).map((s, idx) => ({ ...s, slide_number: idx + 1 }));
    setSlides(updated);
    setSlideCount(updated.length);
  };

  // Add new slide
  const handleAddSlide = () => {
    const newSlideNumber = slides.length + 1;
    const newSlide: Slide = {
      id: `slide-custom-${Date.now()}`,
      slide_number: newSlideNumber,
      type: 'content',
      badge: `Langkah 0${newSlideNumber - 1}`,
      title: 'Judul Slide Baru',
      body: 'Tambahkan penjelasan berbobot di sini agar slide kamu informatif dan mudah dipahami pembaca.',
      points: ['Poin utama pertama', 'Poin pendukung kedua', 'Contoh praktis ketiga'],
      footer_hint: 'Geser 👉',
    };
    setSlides([...slides, newSlide]);
    setSlideCount(slides.length + 1);
    setActiveSlideIndex(slides.length);
  };

  // Render high-res PNG blobs for export
  const renderSlideBlobs = async (): Promise<{ filename: string; blob: Blob; dataUrl: string }[]> => {
    const results: { filename: string; blob: Blob; dataUrl: string }[] = [];

    for (let i = 0; i < slides.length; i++) {
      const node =
        document.getElementById(`carousel-slide-${i}`) ||
        document.getElementById(`slide-card-${i}`) ||
        document.querySelector(`[data-slide-index="${i}"]`);

      if (!node) {
        console.warn(`Elemen slide index ${i} tidak ditemukan di DOM.`);
        continue;
      }

      const dataUrl = await toPng(node as HTMLElement, {
        pixelRatio: 2.5,
        cacheBust: true,
        quality: 0.98,
        filter: (child: HTMLElement) => {
          if (child.classList && child.classList.contains('slide-action-overlay')) {
            return false;
          }
          return true;
        },
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const filename = `Slide_${String(i + 1).padStart(2, '0')}.png`;
      results.push({ filename, blob, dataUrl });
    }

    if (results.length === 0) {
      throw new Error('Tidak ada elemen slide yang berhasil dirender. Pastikan tampilan carousel terbuka.');
    }

    return results;
  };

  const activeTheme = getTheme(currentTheme);
  const activeFont = getFont(currentFont);
  const isDarkUi = appUiMode === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDarkUi ? 'bg-[#0a0a0d] text-gray-100' : 'bg-[#f4f5f8] text-gray-900'
    }`}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        currentFont={currentFont}
        onFontChange={handleFontChange}
        appUiMode={appUiMode}
        onToggleAppUiMode={handleToggleUiMode}
        isGoogleConnected={isGoogleConnected}
        onConnectGoogle={handleConnectGoogle}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenDriveExport={() => setGoogleModal({ isOpen: true, mode: 'drive_export' })}
        onOpenSheetsSync={() => setGoogleModal({ isOpen: true, mode: 'sheets_sync' })}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenContentWritingModal={() => setIsContentWritingModalOpen(true)}
        onOpenMaterialIngest={() => setIsMaterialModalOpen(true)}
        apiKeyConfig={apiKeyConfig}
        slideCount={slides.length}
      />

      {/* Status Bar Notification */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-18 right-6 z-50 px-4 py-2.5 rounded-xl shadow-xl border text-xs font-medium flex items-center gap-2 backdrop-blur-md ${
              statusType === 'success'
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                : statusType === 'error'
                ? 'bg-rose-950/80 border-rose-600 text-rose-200'
                : 'bg-blue-950/80 border-blue-600 text-blue-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              statusType === 'success' ? 'bg-emerald-400' : statusType === 'error' ? 'bg-rose-400' : 'bg-blue-400 animate-ping'
            }`} />
            <span>{statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace: Carousel Studio OR E-Book Studio */}
      {activeTab === 'ebook' ? (
        <EbookReaderView
          currentEbook={currentEbook}
          onUpdateEbook={setCurrentEbook}
          carouselSlides={slides}
          carouselTopic={topic}
          authorName={authorName}
          isDarkUi={isDarkUi}
          apiKeyConfig={apiKeyConfig}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          onOpenMaterialIngest={() => setIsMaterialModalOpen(true)}
          onDistillToCarousel={(distilledSlides, distilledTopic) => {
            setSlides(distilledSlides);
            setTopic(distilledTopic);
            setSlideCount(distilledSlides.length);
            setActiveTab('carousel');
            setMobileView('preview');
            setStatusType('success');
            setStatusMessage(`E-Book berhasil diringkas menjadi ${distilledSlides.length} slide Carousel!`);
            setTimeout(() => setStatusMessage(''), 3000);
          }}
        />
      ) : (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Mobile View Toggle Bar (Only visible on small screens < md) */}
          <div className={`md:hidden flex items-center justify-center p-2 border-b shrink-0 ${
            isDarkUi ? 'bg-[#111114] border-[#1f1f23]' : 'bg-gray-100 border-gray-200'
          }`}>
            <div className={`flex items-center p-1 rounded-xl w-full max-w-sm border ${
              isDarkUi ? 'bg-[#18181c] border-[#2d2d35]' : 'bg-white border-gray-300 shadow-sm'
            }`}>
              <button
                type="button"
                onClick={() => setMobileView('sidebar')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  mobileView === 'sidebar'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDarkUi ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Prompt & Opsi AI</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileView('preview')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  mobileView === 'preview'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDarkUi ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Preview ({slides.length})</span>
              </button>
            </div>
          </div>

          {/* Left Controls Sidebar (Visible when mobileView === 'sidebar' OR desktop >= md) */}
          <div className={`${mobileView === 'sidebar' ? 'flex' : 'hidden'} md:flex h-full md:w-84 lg:w-[320px] shrink-0`}>
            <Sidebar
              topic={topic}
              onTopicChange={setTopic}
              slideCount={slideCount}
              onSlideCountChange={setSlideCount}
              authorName={authorName}
              onAuthorNameChange={setAuthorName}
              authorHandle={authorHandle}
              onAuthorHandleChange={setAuthorHandle}
              tone={tone}
              onToneChange={setTone}
              language={language}
              onLanguageChange={setLanguage}
              currentTheme={currentTheme}
              onThemeChange={handleThemeChange}
              currentFont={currentFont}
              onFontChange={handleFontChange}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              isGenerating={isGenerating}
              onGenerate={handleGenerateCarousel}
              onOpenSlidesExport={() => setGoogleModal({ isOpen: true, mode: 'slides_export' })}
              onOpenSlidesImport={() => setGoogleModal({ isOpen: true, mode: 'slides_import' })}
              onOpenDriveExport={() => setGoogleModal({ isOpen: true, mode: 'drive_export' })}
              onOpenSheetsSync={() => setGoogleModal({ isOpen: true, mode: 'sheets_sync' })}
              onOpenSheetsImport={() => setGoogleModal({ isOpen: true, mode: 'sheets_import' })}
              onOpenContentWritingModal={() => setIsContentWritingModalOpen(true)}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
              onOpenMaterialIngest={() => setIsMaterialModalOpen(true)}
              apiKeyConfig={apiKeyConfig}
              isGoogleConnected={isGoogleConnected}
              onConnectGoogle={handleConnectGoogle}
              onSelectPreset={(preset) => {
                setTopic(preset.topic);
                setSlides(preset.slides);
                setSlideCount(preset.slides.length);
                // Keep permanent creator branding intact (Arijal Meutuwah / @abangjal)
                if (!authorName) setAuthorName(preset.authorName || 'Arijal Meutuwah');
                if (!authorHandle) setAuthorHandle(preset.authorHandle || '@abangjal');
                setCurrentTheme(preset.themeId);
                setCurrentFont(preset.fontId);
                setMobileView('preview');
                setStatusType('success');
                setStatusMessage(`Template "${preset.name}" berhasil dimuat!`);
                setTimeout(() => setStatusMessage(''), 2500);
              }}
            />
          </div>

          {/* Right Main Slide Canvas Area (Visible when mobileView === 'preview' OR desktop >= md) */}
          <main className={`${mobileView === 'preview' ? 'flex' : 'hidden'} md:flex flex-1 flex-col justify-between p-3 sm:p-6 overflow-hidden ${
            isDarkUi ? 'bg-[#0a0a0d]' : 'bg-[#f4f5f8]'
          }`}>
            {/* Header info */}
            <div className="flex items-center justify-between mb-3 sm:mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                  Slide Preview ({slides.length} Slide)
                </span>
                <span className="text-[11px] text-gray-500 hidden sm:inline">
                  • Geser horizontal untuk melihat semua slide
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch to E-Book Studio Quick Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab('ebook')}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Lihat Format E-Book</span>
                  <span className="sm:hidden">E-Book</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Slide</span>
                </button>
              </div>
            </div>

            {/* Horizontal Slide Scroll Container */}
            <div
              ref={previewScrollRef}
              className="flex-1 flex items-center gap-4 sm:gap-6 overflow-x-auto py-2 sm:py-4 px-1 sm:px-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
            >
              {slides.map((slide, index) => (
                <SlideCard
                  key={slide.id || index}
                  slide={slide}
                  index={index}
                  totalSlides={slides.length}
                  theme={activeTheme}
                  font={activeFont}
                  aspectRatio={aspectRatio}
                  authorName={authorName}
                  authorHandle={authorHandle}
                  onEdit={() => {
                    setEditingSlide(slide);
                    setEditingIndex(index);
                  }}
                  onDuplicate={(idx) => handleDuplicateSlide(idx)}
                  onDelete={(idx) => handleDeleteSlide(idx)}
                  onMoveLeft={(idx) => handleMoveSlide(idx, 'up')}
                  onMoveRight={(idx) => handleMoveSlide(idx, 'down')}
                  onQuickAiPolish={(s, idx) => handleInlineAiPolish(idx)}
                  isPolishing={polishingIndex === index}
                />
              ))}
            </div>

            {/* Pagination Navigation Dots */}
            {slides.length > 1 && (
              <div className="mt-2 sm:mt-3 flex justify-center items-center gap-1.5 shrink-0">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (previewScrollRef.current) {
                        const cardWidth = aspectRatio === '4:5' ? 334 : 374;
                        previewScrollRef.current.scrollTo({
                          left: i * cardWidth,
                          behavior: 'smooth',
                        });
                      }
                      setActiveSlideIndex(i);
                    }}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      activeSlideIndex === i
                        ? 'w-6 sm:w-8 bg-blue-500 shadow-sm shadow-blue-500/50'
                        : isDarkUi
                        ? 'w-1.5 sm:w-2 bg-gray-700 hover:bg-gray-500'
                        : 'w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    title={`Lompat ke slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      )}

      {/* Multi-Provider AI Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        config={apiKeyConfig}
        onSaveConfig={handleSaveApiKeyConfig}
        hasEnvKey={true}
      />

      {/* Content Writing Scratchpad Modal */}
      <ContentWritingModal
        isOpen={isContentWritingModalOpen}
        onClose={() => setIsContentWritingModalOpen(false)}
        onApplySlides={handleApplyWrittenContent}
        authorName={authorHandle || authorName}
        customApiKey={apiKeyConfig.apiKey}
      />

      {/* Slide Editor Modal */}
      <SlideEditorModal
        isOpen={Boolean(editingSlide)}
        slide={editingSlide}
        index={editingIndex}
        totalSlides={slides.length}
        onClose={() => setEditingSlide(null)}
        onSave={(updated) => {
          const updatedSlides = [...slides];
          updatedSlides[editingIndex] = updated;
          setSlides(updatedSlides);
        }}
        onAiPolish={handleModalAiPolish}
      />

      {/* Google Workspace Modal (Slides, Drive & Sheets) */}
      <GoogleSyncModal
        isOpen={googleModal.isOpen}
        initialMode={googleModal.mode}
        topic={topic}
        slides={slides}
        authorName={authorName}
        authorHandle={authorHandle}
        onClose={() => setGoogleModal({ ...googleModal, isOpen: false })}
        onSelectImportedTopic={(selectedTopic, count) => {
          setTopic(selectedTopic);
          if (count) setSlideCount(count);
          setStatusType('info');
          setStatusMessage(`Topik dipilih: "${selectedTopic}". Klik Generate untuk memulai.`);
        }}
        onImportSlides={(imported) => {
          if (imported.slides && imported.slides.length > 0) {
            setTopic(imported.topic);
            setSlides(imported.slides);
            setSlideCount(imported.slides.length);
            setStatusType('success');
            setStatusMessage(`Berhasil mengimpor ${imported.slides.length} slide dari Google Slides!`);
            setTimeout(() => setStatusMessage(''), 3000);
          }
        }}
        renderSlideBlobs={renderSlideBlobs}
      />

      {/* Main Export & Download Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        topic={topic}
        slides={slides}
        authorName={authorName}
        authorHandle={authorHandle}
        theme={activeTheme}
        font={activeFont}
        aspectRatio={aspectRatio}
        onClose={() => setIsExportModalOpen(false)}
        onOpenSlidesExport={() => setGoogleModal({ isOpen: true, mode: 'slides_export' })}
        onOpenDriveExport={() => setGoogleModal({ isOpen: true, mode: 'drive_export' })}
        onOpenSheetsSync={() => setGoogleModal({ isOpen: true, mode: 'sheets_sync' })}
        onSwitchToEbook={() => setActiveTab('ebook')}
        renderSlideBlobs={renderSlideBlobs}
      />

      {/* Multi-Source Material Ingestion & AI Generation Modal */}
      <MaterialIngestionModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onEbookGenerated={(newEbook) => {
          setCurrentEbook(newEbook);
          setActiveTab('ebook');
          setStatusType('success');
          setStatusMessage(`E-Book "${newEbook.title}" berhasil disusun oleh AI!`);
          setTimeout(() => setStatusMessage(''), 3500);
        }}
        onCarouselGenerated={(newSlides, newTopic) => {
          setSlides(newSlides);
          setTopic(newTopic);
          setSlideCount(newSlides.length);
          setActiveTab('carousel');
          setMobileView('preview');
          setStatusType('success');
          setStatusMessage(`Carousel "${newTopic}" berhasil diringkas dari materi!`);
          setTimeout(() => setStatusMessage(''), 3500);
        }}
        authorName={authorName}
        isDarkUi={isDarkUi}
        apiKeyConfig={apiKeyConfig}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />
    </div>
  );
}
