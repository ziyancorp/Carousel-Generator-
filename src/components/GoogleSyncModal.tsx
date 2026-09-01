import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import {
  authenticateGoogle,
  uploadCarouselToDrive,
  syncCarouselToGoogleSheets,
  readTopicsFromGoogleSheet,
  getStoredGoogleToken
} from '../services/googleWorkspace';
import { Slide } from '../types';

interface GoogleSyncModalProps {
  isOpen: boolean;
  mode: 'drive_export' | 'sheets_sync' | 'sheets_import';
  topic: string;
  slides: Slide[];
  authorName: string;
  onClose: () => void;
  onSelectImportedTopic?: (topic: string, count?: number) => void;
  renderSlideBlobs: () => Promise<{ filename: string; blob: Blob }[]>;
}

export const GoogleSyncModal: React.FC<GoogleSyncModalProps> = ({
  isOpen,
  mode,
  topic,
  slides,
  authorName,
  onClose,
  onSelectImportedTopic,
  renderSlideBlobs,
}) => {
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Sheets import state
  const [sheetInput, setSheetInput] = useState('');
  const [importedTopics, setImportedTopics] = useState<{ title: string; count?: number }[]>([]);

  if (!isOpen) return null;

  const handleDriveExport = async () => {
    setLoading(true);
    setError(null);
    setResultUrl(null);
    setProgressPercent(10);
    setProgressMsg('Authorizing Google Workspace...');

    try {
      const token = await authenticateGoogle();
      setProgressPercent(25);
      setProgressMsg('Rendering ultra-HD (3x scale) slides...');

      const blobs = await renderSlideBlobs();
      setProgressPercent(50);
      setProgressMsg('Creating dedicated folder in Google Drive...');

      const result = await uploadCarouselToDrive(
        token,
        topic || 'Untitled Carousel',
        blobs,
        (current, total, msg) => {
          setProgressPercent(50 + Math.round((current / total) * 45));
          setProgressMsg(msg);
        }
      );

      setProgressPercent(100);
      setProgressMsg('All slide images uploaded to Google Drive successfully!');
      setResultUrl(result.folderUrl);
    } catch (err: any) {
      console.error('Google Drive error:', err);
      setError(err.message || 'Failed to export slides to Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleSheetsSync = async () => {
    setLoading(true);
    setError(null);
    setResultUrl(null);
    setProgressPercent(20);
    setProgressMsg('Connecting to Google Sheets API...');

    try {
      const token = await authenticateGoogle();
      setProgressPercent(60);
      setProgressMsg('Creating content calendar spreadsheet...');

      const result = await syncCarouselToGoogleSheets(
        token,
        topic || 'Untitled Plan',
        slides,
        authorName
      );

      setProgressPercent(100);
      setProgressMsg('Carousel outline synchronized to Google Sheets!');
      setResultUrl(result.spreadsheetUrl);
    } catch (err: any) {
      console.error('Google Sheets sync error:', err);
      setError(err.message || 'Failed to sync with Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  const handleImportTopics = async () => {
    if (!sheetInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const token = await authenticateGoogle();
      const topics = await readTopicsFromGoogleSheet(token, sheetInput.trim());
      if (topics.length === 0) {
        setError('No topics found in column A of the specified Sheet.');
      } else {
        setImportedTopics(topics);
      }
    } catch (err: any) {
      console.error('Google Sheets read error:', err);
      setError(err.message || 'Failed to read topics from Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111114] border border-[#1f1f23] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1f1f23] flex items-center justify-between bg-[#0a0a0c]">
          <div className="flex items-center gap-2.5">
            {mode === 'drive_export' ? (
              <HardDrive className="w-5 h-5 text-blue-400" />
            ) : (
              <Table className="w-5 h-5 text-emerald-400" />
            )}
            <h3 className="font-bold text-base text-white">
              {mode === 'drive_export' && 'Export Carousel to Google Drive'}
              {mode === 'sheets_sync' && 'Sync Outline to Google Sheets'}
              {mode === 'sheets_import' && 'Import Topics from Google Sheets'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1a1f] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {mode === 'drive_export' && (
            <div className="space-y-4">
              <div className="bg-[#1a1a1f] p-3.5 rounded-xl border border-[#2d2d35] space-y-2">
                <div className="text-xs text-gray-300">
                  <span className="font-semibold text-white">Folder Name:</span> Carousel - {topic}
                </div>
                <div className="text-xs text-gray-300">
                  <span className="font-semibold text-white">Target Output:</span> {slides.length} High Resolution HD PNG Slides
                </div>
                <div className="text-[11px] text-gray-400 leading-relaxed">
                  Creates a dedicated Google Drive folder and uploads all {slides.length} slides with clear sequence filenames (Slide-01.png, Slide-02.png, etc).
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

              {resultUrl && (
                <div className="p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Slides uploaded to Google Drive successfully!</span>
                  </div>
                  <a
                    href={resultUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Folder in Google Drive</span>
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
                  <span>Start Export to Google Drive</span>
                </button>
              )}
            </div>
          )}

          {mode === 'sheets_sync' && (
            <div className="space-y-4">
              <div className="bg-[#1a1a1f] p-3.5 rounded-xl border border-[#2d2d35] space-y-2">
                <div className="text-xs text-gray-300">
                  <span className="font-semibold text-white">Topic:</span> {topic}
                </div>
                <div className="text-xs text-gray-300">
                  <span className="font-semibold text-white">Slide Outline:</span> {slides.length} Slide Copy & Hook
                </div>
                <div className="text-[11px] text-gray-400 leading-relaxed">
                  Builds a structured content calendar spreadsheet with formatted columns (Slide #, Headline, Body, Key Takeaways, Creator, Timestamp).
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

              {resultUrl && (
                <div className="p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Content Plan Spreadsheet Created!</span>
                  </div>
                  <a
                    href={resultUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Google Sheets Document</span>
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
                  <span>Generate Google Sheets Spreadsheet</span>
                </button>
              )}
            </div>
          )}

          {mode === 'sheets_import' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Google Sheets URL or Spreadsheet ID
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
                    <span>Read Sheet</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Tip: Provide a sheet URL containing content topics in Column A.
                </p>
              </div>

              {importedTopics.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-emerald-300">
                    Found {importedTopics.length} Topics from Spreadsheet:
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

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#0a0a0c] border-t border-[#1f1f23] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
