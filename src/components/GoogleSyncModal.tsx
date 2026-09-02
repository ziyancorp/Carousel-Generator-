import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Table,
  FolderCheck,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Layers,
  Presentation,
  UploadCloud,
  FileText,
  User,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  authenticateGoogle,
  uploadCarouselToDrive,
  syncCarouselToGoogleSheets,
  readTopicsFromGoogleSheet,
  exportToGoogleSlides,
  readSlidesFromGooglePresentation,
  getStoredGoogleToken,
  getCurrentUser,
  logoutGoogle
} from '../services/googleWorkspace';
import { Slide } from '../types';

export type GoogleWorkspaceMode =
  | 'slides_export'
  | 'slides_import'
  | 'drive_export'
  | 'sheets_sync'
  | 'sheets_import';

interface GoogleSyncModalProps {
  isOpen: boolean;
  initialMode?: GoogleWorkspaceMode;
  topic: string;
  slides: Slide[];
  authorName: string;
  authorHandle: string;
  onClose: () => void;
  onSelectImportedTopic?: (topic: string, count?: number) => void;
  onImportSlides?: (imported: { topic: string; slides: Slide[] }) => void;
  renderSlideBlobs: () => Promise<{ filename: string; blob: Blob }[]>;
}

export const GoogleSyncModal: React.FC<GoogleSyncModalProps> = ({
  isOpen,
  initialMode = 'slides_export',
  topic,
  slides,
  authorName,
  authorHandle,
  onClose,
  onSelectImportedTopic,
  onImportSlides,
  renderSlideBlobs,
}) => {
  const [activeTab, setActiveTab] = useState<'slides' | 'drive' | 'sheets'>('slides');
  const [slidesSubTab, setSlidesSubTab] = useState<'export' | 'import'>('export');
  const [sheetsSubTab, setSheetsSubTab] = useState<'sync' | 'import'>('sync');

  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultType, setResultType] = useState<'slides' | 'drive' | 'sheets' | null>(null);

  // Inputs
  const [slidesInput, setSlidesInput] = useState('');
  const [sheetInput, setSheetInput] = useState('');
  const [importedTopics, setImportedTopics] = useState<{ title: string; count?: number }[]>([]);

  useEffect(() => {
    if (initialMode.startsWith('slides')) {
      setActiveTab('slides');
      setSlidesSubTab(initialMode === 'slides_import' ? 'import' : 'export');
    } else if (initialMode.startsWith('sheets')) {
      setActiveTab('sheets');
      setSheetsSubTab(initialMode === 'sheets_import' ? 'import' : 'sync');
    } else if (initialMode === 'drive_export') {
      setActiveTab('drive');
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  // Handle Google Slides Export
  const handleSlidesExport = async () => {
    setLoading(true);
    setError(null);
    setResultUrl(null);
    setProgressPercent(15);
    setProgressMsg('Mengautentikasi akun Google Workspace...');

    try {
      const token = await authenticateGoogle();
      setProgressPercent(40);
      setProgressMsg('Membuat presentasi baru di Google Slides...');

      const result = await exportToGoogleSlides(
        token,
        topic || 'CarouselX Deck',
        slides,
        authorName || 'Arijal Meutuwah',
        authorHandle || '@abangjal',
        (current, total, msg) => {
          setProgressPercent(40 + Math.round((current / (total || 1)) * 55));
          setProgressMsg(msg);
        }
      );

      setProgressPercent(100);
      setProgressMsg('Presentasi Google Slides berhasil dibuat!');
      setResultUrl(result.presentationUrl);
      setResultType('slides');
    } catch (err: any) {
      console.error('Google Slides export error:', err);
      setError(err.message || 'Gagal mengekspor slide ke Google Slides');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Slides Import
  const handleSlidesImport = async () => {
    if (!slidesInput.trim()) return;
    setLoading(true);
    setError(null);
    setProgressMsg('Membaca presentasi Google Slides...');
    setProgressPercent(30);

    try {
      const token = await authenticateGoogle();
      setProgressPercent(70);
      const imported = await readSlidesFromGooglePresentation(token, slidesInput.trim());
      setProgressPercent(100);
      if (onImportSlides) {
        onImportSlides(imported);
      }
      onClose();
    } catch (err: any) {
      console.error('Google Slides import error:', err);
      setError(err.message || 'Gagal mengimpor dari Google Slides');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Drive Folder Export
  const handleDriveExport = async () => {
    setLoading(true);
    setError(null);
    setResultUrl(null);
    setProgressPercent(10);
    setProgressMsg('Mengautentikasi Google Workspace...');

    try {
      const token = await authenticateGoogle();
      setProgressPercent(20);
      setProgressMsg('Merender slide gambar Ultra-HD PNG...');

      const blobs = await renderSlideBlobs();
      if (!blobs || blobs.length === 0) {
        throw new Error('Tidak ada gambar slide yang berhasil dirender. Pastikan slide tampil di editor.');
      }
      setProgressPercent(45);
      setProgressMsg(`Menyiapkan ${blobs.length} file gambar untuk Google Drive...`);

      const result = await uploadCarouselToDrive(
        token,
        topic || 'CarouselX',
        blobs,
        (current, total, msg) => {
          setProgressPercent(45 + Math.round((current / total) * 50));
          setProgressMsg(msg);
        }
      );

      setProgressPercent(100);
      setProgressMsg(`${blobs.length} gambar slide Ultra-HD berhasil diunggah ke Google Drive!`);
      setResultUrl(result.folderUrl);
      setResultType('drive');
    } catch (err: any) {
      console.error('Google Drive error:', err);
      setError(err.message || 'Gagal mengekspor slide ke Google Drive');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sheets Sync
  const handleSheetsSync = async () => {
    setLoading(true);
    setError(null);
    setResultUrl(null);
    setProgressPercent(20);
    setProgressMsg('Menghubungkan ke Google Sheets API...');

    try {
      const token = await authenticateGoogle();
      setProgressPercent(60);
      setProgressMsg('Menyusun kalender konten spreadsheet...');

      const result = await syncCarouselToGoogleSheets(
        token,
        topic || 'Carousel Plan',
        slides,
        authorName
      );

      setProgressPercent(100);
      setProgressMsg('Outline carousel tersinkronisasi ke Google Sheets!');
      setResultUrl(result.spreadsheetUrl);
      setResultType('sheets');
    } catch (err: any) {
      console.error('Google Sheets sync error:', err);
      setError(err.message || 'Gagal sinkronisasi ke Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sheets Import
  const handleImportTopics = async () => {
    if (!sheetInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const token = await authenticateGoogle();
      const topics = await readTopicsFromGoogleSheet(token, sheetInput.trim());
      if (topics.length === 0) {
        setError('Tidak ada topik yang ditemukan di kolom A sheet yang dimasukkan.');
      } else {
        setImportedTopics(topics);
      }
    } catch (err: any) {
      console.error('Google Sheets read error:', err);
      setError(err.message || 'Gagal membaca topik dari Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#111114] border border-[#2d2d35] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Google Gradient Bar */}
        <div className="google-gradient-bar h-1 w-full shrink-0"></div>

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1f1f23] flex items-center justify-between bg-[#0a0a0c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 via-blue-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Presentation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>Google Workspace Hub</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  Slides & Drive
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Ekspor & impor presentasi Google Slides, Drive Folder, dan Sheets
              </p>
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

        {/* Top Product Tabs: Google Slides | Google Drive | Google Sheets */}
        <div className="px-6 pt-3 pb-0 bg-[#0d0d10] border-b border-[#1f1f23] flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('slides');
              setError(null);
              setResultUrl(null);
            }}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition border-t border-x ${
              activeTab === 'slides'
                ? 'bg-[#111114] text-amber-400 border-[#2d2d35] border-b-[#111114] -mb-[1px] shadow-sm'
                : 'text-gray-400 hover:text-gray-200 border-transparent'
            }`}
          >
            <Presentation className="w-4 h-4 text-amber-400" />
            <span>Google Slides</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">DECK</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('drive');
              setError(null);
              setResultUrl(null);
            }}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition border-t border-x ${
              activeTab === 'drive'
                ? 'bg-[#111114] text-blue-400 border-[#2d2d35] border-b-[#111114] -mb-[1px] shadow-sm'
                : 'text-gray-400 hover:text-gray-200 border-transparent'
            }`}
          >
            <HardDrive className="w-4 h-4 text-blue-400" />
            <span>Google Drive</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">HD PNG</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('sheets');
              setError(null);
              setResultUrl(null);
            }}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 transition border-t border-x ${
              activeTab === 'sheets'
                ? 'bg-[#111114] text-emerald-400 border-[#2d2d35] border-b-[#111114] -mb-[1px] shadow-sm'
                : 'text-gray-400 hover:text-gray-200 border-transparent'
            }`}
          >
            <Table className="w-4 h-4 text-emerald-400" />
            <span>Google Sheets</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">CALENDAR</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* ============================================================ */}
          {/* TAB 1: GOOGLE SLIDES (PRESENTATION DECK)                     */}
          {/* ============================================================ */}
          {activeTab === 'slides' && (
            <div className="space-y-4">
              {/* Sub tabs: Export Deck vs Import Deck */}
              <div className="flex items-center gap-2 p-1 bg-[#18181c] border border-[#2d2d35] rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setSlidesSubTab('export');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    slidesSubTab === 'export'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Ekspor ke Google Slides Deck</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSlidesSubTab('import');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    slidesSubTab === 'import'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Presentation className="w-3.5 h-3.5" />
                  <span>Impor Presentasi Slides</span>
                </button>
              </div>

              {slidesSubTab === 'export' && (
                <div className="space-y-4">
                  <div className="bg-[#1a1a1f] p-4 rounded-xl border border-[#2d2d35] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        Ringkasan Presentasi Deck
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono border border-amber-500/20">
                        {slides.length} Slide Deck
                      </span>
                    </div>
                    <div className="text-xs text-gray-200">
                      <span className="font-semibold text-gray-400">Judul Deck:</span> {topic || 'Untitled Carousel'}
                    </div>
                    <div className="text-xs text-gray-200">
                      <span className="font-semibold text-gray-400">Kreator & Footer:</span> {authorName} ({authorHandle})
                    </div>
                    <div className="text-[11px] text-gray-400 leading-relaxed pt-1 border-t border-[#2d2d35]">
                      Membangun deck Google Slides resmi lengkap dengan format teks bergaya, warna tema modern, badge tahapan, poin bullet, dan footer branding kreator.
                    </div>
                  </div>

                  {loading && (
                    <div className="space-y-2 p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl">
                      <div className="flex justify-between text-xs text-amber-300 font-medium">
                        <span>{progressMsg}</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#1a1a1f] rounded-full overflow-hidden border border-[#2d2d35]">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {resultUrl && resultType === 'slides' && (
                    <div className="p-4 bg-amber-950/50 border border-amber-700/80 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>Presentasi Google Slides Berhasil Dibuat!</span>
                      </div>
                      <a
                        href={resultUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Deck di Google Slides</span>
                      </a>
                    </div>
                  )}

                  {!resultUrl && !loading && (
                    <button
                      type="button"
                      onClick={handleSlidesExport}
                      className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
                    >
                      <Presentation className="w-4 h-4" />
                      <span>Buat & Simpan ke Google Slides</span>
                    </button>
                  )}
                </div>
              )}

              {slidesSubTab === 'import' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      URL atau ID Presentasi Google Slides
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={slidesInput}
                        onChange={(e) => setSlidesInput(e.target.value)}
                        placeholder="https://docs.google.com/presentation/d/..."
                        className="flex-1 bg-[#1a1a1f] border border-[#2d2d35] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        disabled={loading || !slidesInput.trim()}
                        onClick={handleSlidesImport}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                      >
                        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Presentation className="w-3.5 h-3.5" />}
                        <span>Impor Deck</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5">
                      Tempel tautan presentasi Google Slides yang ingin Anda edit dan desain ulang di CarouselX Studio.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: GOOGLE DRIVE (HD PNG SLIDES FOLDER)                   */}
          {/* ============================================================ */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              <div className="bg-[#1a1a1f] p-4 rounded-xl border border-[#2d2d35] space-y-2">
                <div className="text-xs text-gray-300">
                  <span className="font-semibold text-white">Nama Folder:</span> Carousel - {topic}
                </div>
                <div className="text-xs text-gray-300">
                  <span className="font-semibold text-white">Output Target:</span> {slides.length} Slide Gambar PNG Resolusi Tinggi (3x Scale)
                </div>
                <div className="text-[11px] text-gray-400 leading-relaxed">
                  Membuat folder khusus di Google Drive dan mengunggah seluruh gambar slide dengan penomoran urut (Slide-01.png, Slide-02.png, dst).
                </div>
              </div>

              {loading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-blue-300 font-medium">
                    <span>{progressMsg}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1a1a1f] rounded-full overflow-hidden border border-[#2d2d35]">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {resultUrl && resultType === 'drive' && (
                <div className="p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Slide berhasil diunggah ke Google Drive!</span>
                  </div>
                  <a
                    href={resultUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Folder di Google Drive</span>
                  </a>
                </div>
              )}

              {!resultUrl && !loading && (
                <button
                  type="button"
                  onClick={handleDriveExport}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition"
                >
                  <FolderCheck className="w-4 h-4" />
                  <span>Mulai Ekspor ke Google Drive</span>
                </button>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: GOOGLE SHEETS (CALENDAR & TOPIC IMPORT)              */}
          {/* ============================================================ */}
          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-1 bg-[#18181c] border border-[#2d2d35] rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setSheetsSubTab('sync');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    sheetsSubTab === 'sync'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Sinkronisasi Kalender Konten</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSheetsSubTab('import');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    sheetsSubTab === 'import'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Impor Topik dari Sheet</span>
                </button>
              </div>

              {sheetsSubTab === 'sync' && (
                <div className="space-y-4">
                  <div className="bg-[#1a1a1f] p-4 rounded-xl border border-[#2d2d35] space-y-2">
                    <div className="text-xs text-gray-300">
                      <span className="font-semibold text-white">Topik:</span> {topic}
                    </div>
                    <div className="text-xs text-gray-300">
                      <span className="font-semibold text-white">Outline Slide:</span> {slides.length} Slide Copy & Hook
                    </div>
                    <div className="text-[11px] text-gray-400 leading-relaxed">
                      Menghasilkan spreadsheet kalender konten dengan kolom terstruktur (Slide #, Headline, Body, Takeaways, Kreator, Timestamp).
                    </div>
                  </div>

                  {loading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-emerald-300 font-medium">
                        <span>{progressMsg}</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#1a1a1f] rounded-full overflow-hidden border border-[#2d2d35]">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {resultUrl && resultType === 'sheets' && (
                    <div className="p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Dokumen Google Sheets Berhasil Dibuat!</span>
                      </div>
                      <a
                        href={resultUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Dokumen Google Sheets</span>
                      </a>
                    </div>
                  )}

                  {!resultUrl && !loading && (
                    <button
                      type="button"
                      onClick={handleSheetsSync}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                    >
                      <Table className="w-4 h-4" />
                      <span>Buat Spreadsheet Google Sheets</span>
                    </button>
                  )}
                </div>
              )}

              {sheetsSubTab === 'import' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      URL atau ID Google Sheets
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={sheetInput}
                        onChange={(e) => setSheetInput(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="flex-1 bg-[#1a1a1f] border border-[#2d2d35] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        disabled={loading || !sheetInput.trim()}
                        onClick={handleImportTopics}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                      >
                        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                        <span>Baca Sheet</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Tip: Masukkan URL sheet yang berisi daftar ide konten di Kolom A.
                    </p>
                  </div>

                  {importedTopics.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-emerald-300">
                        Ditemukan {importedTopics.length} Topik dari Spreadsheet:
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 p-1">
                        {importedTopics.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              onSelectImportedTopic?.(item.title, item.count);
                              onClose();
                            }}
                            className="w-full text-left p-2.5 rounded-lg bg-[#1a1a1f] hover:bg-emerald-950/40 border border-[#2d2d35] hover:border-emerald-500/50 text-xs text-gray-200 flex items-center justify-between group transition"
                          >
                            <span className="truncate flex-1 font-medium">{item.title}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400 shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#0a0a0c] border-t border-[#1f1f23] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terhubung Resmi Google Workspace API</span>
          </div>
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

