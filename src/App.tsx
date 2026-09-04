import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Plus,
  Download,
  Sparkles,
  Wand2,
  Ratio,
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
import { ExportModal } from './components/ExportModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { EbookReaderView } from './components/EbookReaderView';
import { MaterialIngestionModal } from './components/MaterialIngestionModal';
import { generateCarouselAI, structureContentAI } from './services/aiClient';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveAppTab>('carousel');
  const [topic, setTopic] = useState('');
  const [sourceMaterial, setSourceMaterial] = useState('');
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

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [polishingIndex, setPolishingIndex] = useState<number | null>(null);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  // Mobile View Toggle: 'sidebar' (input controls) vs 'preview' (slide canvas)
  const [mobileView, setMobileView] = useState<'sidebar' | 'preview'>('preview');

  // Status Notification Toast
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  // Slide Card DOM refs for high-res PNG export
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load stored settings on initial mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('carouselx_theme') as ThemeId;
      if (savedTheme && THEMES[savedTheme]) setCurrentTheme(savedTheme);

      const savedFont = localStorage.getItem('carouselx_font') as FontId;
      if (savedFont && FONT_OPTIONS.some((f) => f.id === savedFont)) setCurrentFont(savedFont);

      const savedRatio = localStorage.getItem('carouselx_ratio') as AspectRatio;
      if (savedRatio === '1:1' || savedRatio === '4:5') setAspectRatio(savedRatio);

      const savedUiMode = localStorage.getItem('carouselx_ui_mode') as AppUiMode;
      if (savedUiMode === 'dark' || savedUiMode === 'light') setAppUiMode(savedUiMode);

      const savedApiKey = localStorage.getItem('carouselx_api_key');
      const savedProvider = localStorage.getItem('carouselx_ai_provider') as any;
      const savedModel = localStorage.getItem('carouselx_ai_model');
      const savedBaseUrl = localStorage.getItem('carouselx_ai_base_url');

      if (savedApiKey || savedProvider) {
        setApiKeyConfig({
          provider: savedProvider || 'gemini',
          apiKey: savedApiKey || '',
          model: savedModel || (savedProvider === 'anthropic' ? 'claude-3-5-haiku-latest' : 'gemini-2.5-flash'),
          baseUrl: savedBaseUrl || undefined,
        });
      }
    } catch (e) {
      console.warn('Failed reading from localStorage', e);
    }
  }, []);

  // Save branding updates to localStorage
  const handleAuthorNameChange = (val: string) => {
    setAuthorName(val);
    try {
      localStorage.setItem('carouselx_author_name', val);
    } catch {}
  };

  const handleAuthorHandleChange = (val: string) => {
    setAuthorHandle(val);
    try {
      localStorage.setItem('carouselx_author_handle', val);
    } catch {}
  };

  const handleThemeChange = (newTheme: ThemeId) => {
    setCurrentTheme(newTheme);
    try {
      localStorage.setItem('carouselx_theme', newTheme);
    } catch {}
  };

  const handleFontChange = (newFont: FontId) => {
    setCurrentFont(newFont);
    try {
      localStorage.setItem('carouselx_font', newFont);
    } catch {}
  };

  const handleToggleUiMode = () => {
    const nextMode: AppUiMode = appUiMode === 'dark' ? 'light' : 'dark';
    setAppUiMode(nextMode);
    try {
      localStorage.setItem('carouselx_ui_mode', nextMode);
    } catch {}
  };

  const handleSaveApiKeyConfig = (newConfig: ApiKeyConfig) => {
    setApiKeyConfig(newConfig);
    try {
      localStorage.setItem('carouselx_api_key', newConfig.apiKey || '');
      localStorage.setItem('carouselx_ai_provider', newConfig.provider);
      if (newConfig.model) localStorage.setItem('carouselx_ai_model', newConfig.model);
      if (newConfig.baseUrl) localStorage.setItem('carouselx_ai_base_url', newConfig.baseUrl);
    } catch {}
    setStatusType('success');
    setStatusMessage(`Konfigurasi ${newConfig.provider.toUpperCase()} berhasil disimpan!`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Generate Carousel with AI (Material-First, Client & Server resilient)
  const handleGenerateCarousel = async () => {
    if (!topic.trim() && !sourceMaterial.trim()) {
      setStatusType('error');
      setStatusMessage('Silakan masukkan materi naskah atau topik terlebih dahulu.');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    setIsGenerating(true);
    setStatusType('info');
    setStatusMessage(`Membedah materi & menyusun ${slideCount} slide dengan AI...`);

    try {
      const result = await generateCarouselAI({
        topic: topic.trim(),
        sourceMaterial: sourceMaterial.trim(),
        slideCount,
        tone,
        language,
        authorName: authorHandle || authorName,
        apiKeyConfig,
      });

      if (result.slides && result.slides.length > 0) {
        setSlides(result.slides);
        if (result.topic && (!topic.trim() || topic === 'Ringkasan Materi')) {
          setTopic(result.topic);
        }
        setActiveSlideIndex(0);
        setMobileView('preview');
        setStatusType('success');
        setStatusMessage(
          result.isFallback
            ? 'Carousel berhasil dirangkum dari materi Anda!'
            : `✓ ${result.slides.length} slide berhasil diolah dari materi sumber!`
        );
      } else {
        throw new Error(result.error || 'Gagal menghasilkan slide.');
      }
    } catch (err: any) {
      console.error(err);
      setStatusType('error');
      setStatusMessage(err.message || 'Terjadi kesalahan saat memproses materi.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMessage(''), 3500);
    }
  };

  // AI Polish single slide inline
  const handleInlineAiPolish = async (index: number) => {
    const target = slides[index];
    if (!target) return;

    setPolishingIndex(index);
    try {
      const rawContent = `Slide Type: ${target.type}\nTitle: ${target.title}\nBody: ${target.body}\nPoints: ${(target.points || []).join(', ')}`;
      const result = await structureContentAI({
        rawContent,
        slideCount: 1,
        language,
        authorName: authorHandle || authorName,
        apiKeyConfig,
      });

      if (result.slides && result.slides[0]) {
        const polished = result.slides[0];
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
      const rawContent = `Title: ${slide.title}\nBody: ${slide.body}\nPoints: ${(slide.points || []).join(', ')}`;
      const result = await structureContentAI({
        rawContent,
        slideCount: 1,
        language,
        authorName: authorHandle || authorName,
        apiKeyConfig,
      });

      if (result.slides && result.slides[0]) {
        const p = result.slides[0];
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

  // Add new blank slide
  const handleAddSlide = () => {
    const newIdx = slides.length + 1;
    const newSlide: Slide = {
      id: `slide-custom-${Date.now()}`,
      slide_number: newIdx,
      type: 'content',
      badge: `Langkah 0${newIdx - 1}`,
      stepBadge: `STEP 0${newIdx - 1} · AKSI`,
      title: 'Judul Poin Pembahasan Baru',
      highlightWord: 'Pembahasan Baru',
      body: 'Jelaskan inti pesan Anda secara ringkas dan lugas di sini agar pembaca langsung paham.',
      points: ['Poin penting pertama', 'Poin penting kedua', 'Langkah eksekusi'],
      footer_hint: 'Lanjut ke slide berikutnya 👉',
    };
    setSlides([...slides, newSlide]);
    setSlideCount(slides.length + 1);
    setActiveSlideIndex(slides.length);
  };

  // Delete slide
  const handleDeleteSlide = (idx: number) => {
    if (slides.length <= 1) {
      alert('Carousel harus memiliki minimal 1 slide.');
      return;
    }
    const filtered = slides.filter((_, i) => i !== idx).map((s, i) => ({
      ...s,
      slide_number: i + 1,
    }));
    setSlides(filtered);
    setSlideCount(filtered.length);
    setActiveSlideIndex(Math.max(0, idx - 1));
  };

  // Reorder slides
  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= slides.length) return;
    const updated = [...slides];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const renumbered = updated.map((s, i) => ({ ...s, slide_number: i + 1 }));
    setSlides(renumbered);
    setActiveSlideIndex(toIndex);
  };

  // Render individual slide DOM nodes to High-Res Blobs
  const renderSlideBlobs = async (): Promise<{ filename: string; blob: Blob; dataUrl: string }[]> => {
    const results: { filename: string; blob: Blob; dataUrl: string }[] = [];

    for (let i = 0; i < slides.length; i++) {
      const node = slideRefs.current[i];
      if (!node) continue;

      try {
        const dataUrl = await toPng(node, {
          pixelRatio: 3,
          cacheBust: true,
          quality: 0.98,
        });

        const response = await fetch(dataUrl);
        const blob = await response.blob();
        results.push({
          filename: `slide_${i + 1}.png`,
          blob,
          dataUrl,
        });
      } catch (err) {
        console.error(`Failed rendering slide ${i + 1}:`, err);
      }
    }

    return results;
  };

  const activeTheme = getTheme(currentTheme);
  const activeFont = getFont(currentFont);
  const isDarkUi = appUiMode === 'dark';

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden select-none font-sans ${
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
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
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
                className={`flex-1 py-2 min-h-[40px] text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  mobileView === 'sidebar'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDarkUi ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Wand2 className="w-4 h-4" />
                <span>Pengaturan Slide</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileView('preview')}
                className={`flex-1 py-2 min-h-[40px] text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  mobileView === 'preview'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDarkUi ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Preview ({slides.length})</span>
              </button>
            </div>
          </div>

          {/* Left Controls Sidebar (Visible when mobileView === 'sidebar' OR desktop >= md) */}
          <div className={`${mobileView === 'sidebar' ? 'flex' : 'hidden'} md:flex h-full md:w-80 lg:w-[310px] shrink-0`}>
            <Sidebar
              topic={topic}
              onTopicChange={setTopic}
              sourceMaterial={sourceMaterial}
              onSourceMaterialChange={setSourceMaterial}
              slideCount={slideCount}
              onSlideCountChange={setSlideCount}
              authorName={authorName}
              onAuthorNameChange={handleAuthorNameChange}
              authorHandle={authorHandle}
              onAuthorHandleChange={handleAuthorHandleChange}
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
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
              onOpenMaterialIngest={() => setIsMaterialModalOpen(true)}
              apiKeyConfig={apiKeyConfig}
              onSelectPreset={(preset) => {
                setTopic(preset.topic);
                setSlides(preset.slides);
                setSlideCount(preset.slides.length);
                if (!authorName) setAuthorName(preset.authorName || 'Arijal Meutuwah');
                if (!authorHandle) setAuthorHandle(preset.authorHandle || '@abangjal');
                setCurrentTheme(preset.themeId);
                setCurrentFont(preset.fontId);
              }}
            />
          </div>

          {/* Center / Right Slide Preview & Canvas */}
          <main className={`flex-1 flex flex-col h-full overflow-y-auto relative ${
            mobileView === 'preview' ? 'flex' : 'hidden md:flex'
          }`}>
            {/* Top Toolbar in Preview Mode */}
            <div className={`p-3 sm:p-4 border-b flex items-center justify-between z-10 shrink-0 ${
              isDarkUi ? 'bg-[#111114]/90 border-[#1f1f23]' : 'bg-white/90 border-gray-200'
            } backdrop-blur-md`}>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">
                  Slide:
                </span>
                {slides.map((s, idx) => (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`min-h-[36px] min-w-[36px] px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition ${
                      activeSlideIndex === idx
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : isDarkUi
                        ? 'bg-[#18181d] text-gray-400 border-[#2d2d35] hover:text-white'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:text-black'
                    }`}
                  >
                    0{idx + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleAddSlide}
                  title="Tambah Slide Baru"
                  className="min-h-[36px] min-w-[36px] p-1.5 rounded-lg border border-dashed border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400 flex items-center justify-center transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Slide</span>
                </button>
              </div>
            </div>

            {/* Slide Canvas Cards View */}
            <div className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-start gap-8 overflow-y-auto">
              <div className="w-full max-w-md mx-auto space-y-6">
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    ref={(el) => {
                      slideRefs.current[idx] = el;
                    }}
                    className={`transition-all duration-200 ${
                      activeSlideIndex === idx
                        ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0a0a0d] rounded-2xl scale-[1.01]'
                        : 'opacity-90 hover:opacity-100'
                    }`}
                    onClick={() => setActiveSlideIndex(idx)}
                  >
                    <SlideCard
                      slide={slide}
                      index={idx}
                      totalSlides={slides.length}
                      aspectRatio={aspectRatio}
                      theme={activeTheme}
                      font={activeFont}
                      authorName={authorName}
                      authorHandle={authorHandle}
                      isPolishing={polishingIndex === idx}
                      onEdit={() => {
                        setEditingSlide(slide);
                        setEditingIndex(idx);
                      }}
                      onDelete={() => handleDeleteSlide(idx)}
                      onMoveUp={() => handleMoveSlide(idx, idx - 1)}
                      onMoveDown={() => handleMoveSlide(idx, idx + 1)}
                      onAiPolish={() => handleInlineAiPolish(idx)}
                    />
                  </div>
                ))}
              </div>
            </div>
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
        onCarouselGenerated={(newSlides, newTopic, rawSourceText) => {
          setSlides(newSlides);
          setTopic(newTopic);
          if (rawSourceText) setSourceMaterial(rawSourceText);
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
