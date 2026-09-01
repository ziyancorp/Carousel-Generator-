import React, { useState } from 'react';
import {
  FileEdit,
  X,
  Sparkles,
  RefreshCw,
  Copy,
  BookOpen,
  Check,
  Flame,
  Lightbulb,
  ListOrdered,
  Layers
} from 'lucide-react';
import { Slide } from '../types';

interface ContentWritingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySlides: (slides: Slide[], detectedTopic: string) => void;
  authorName: string;
  customApiKey?: string;
}

const TEMPLATES = [
  {
    title: '5 Tips Produktivitas Kerja Cerdas',
    badge: 'Tips & Hacks',
    content: `Judul: 5 Kebiasaan Orang Super Produktif yang Menghemat 20 Jam Seminggu

1. Time Boxing 90 Menit: Bekerja fokus tanpa notifikasi selama 90 menit pertama.
2. Aturan 2 Menit: Jika tugas bisa selesai di bawah 2 menit, kerjakan langsung saat itu juga.
3. Batching Email & Chat: Buka komunikasi hanya di jam 11:00 dan 16:00.
4. Single-Tasking: Otak manusia kehilangan 40% efisiensi saat multitasking.
5. Review Sore Hari: Tulis 3 prioritas utama untuk hari esok sebelum menutup laptop.

Kesimpulan: Mulai terapkan 1 kebiasaan hari ini dan rasakan bedanya!`,
  },
  {
    title: 'Framework Copywriting Hook 3 Detik',
    badge: 'Marketing',
    content: `Judul: Formula Copywriting Hook 3 Detik yang Bikin Audiens Berhenti Scrolling

Langkah 1 - Callout Spesifik: Sebutkan langsung siapa target pembaca kamu (contoh: "Untuk UI/UX Designer...").
Langkah 2 - Agitasi Masalah Tersembunyi: Ungkap kesalahan umum yang sering tidak mereka sadari.
Langkah 3 - Janji Nilai yang Jelas: Berikan solusi konkret yang bisa langsung diterapkan dalam hitungan menit.
Langkah 4 - Bukti & Hasil Nyata: Tampilkan data atau studi kasus singkat sebagai penguat.
Langkah 5 - Call To Action: Ajak mereka bookmark atau diskusi di komentar.`,
  },
  {
    title: 'Roadmap Belajar Coding / Tech dari Nol',
    badge: 'Edukasi',
    content: `Judul: Alur Belajar Web Development Modern di Tahun Ini

Tahap 1 - Fondasi Web: Pahami HTML5 semantic, CSS modern (Flexbox/Grid), dan dasar JavaScript ES6.
Tahap 2 - Modern Framework: Pilih React atau Next.js untuk membangun antarmuka interaktif dan cepat.
Tahap 3 - API & Backend: Pelajari cara membuat REST API dan menghubungkan database cloud.
Tahap 4 - Portfolio Project: Bangun 3 proyek nyata yang memecahkan masalah sehari-hari.
Tahap 5 - Deployment & Publikasi: Pasang proyek ke hosting publik dan bagikan di LinkedIn/GitHub.`,
  },
];

export const ContentWritingModal: React.FC<ContentWritingModalProps> = ({
  isOpen,
  onClose,
  onApplySlides,
  authorName,
  customApiKey,
}) => {
  const [content, setContent] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [tone, setTone] = useState('santai dan engaging');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleInsertTemplate = (tplContent: string) => {
    setContent(tplContent);
    setErrorMsg('');
  };

  const handleTransform = async () => {
    if (!content.trim()) {
      setErrorMsg('Harap tulis atau tempel konten teks terlebih dahulu.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customApiKey) {
        headers['x-gemini-key'] = customApiKey;
      }

      const res = await fetch('/api/structure-content', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          rawContent: content,
          slideCount,
          tone,
          authorName,
          language: 'Indonesian',
          apiKey: customApiKey,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengubah konten menjadi carousel');
      }

      const data = await res.json();
      const firstLine = content.split('\n')[0].replace(/^(Judul|Title|Topik):\s*/i, '').trim();
      const detectedTopic = firstLine || 'Insight Konten Spesial';

      if (data.slides && data.slides.length > 0) {
        onApplySlides(data.slides, detectedTopic);
        onClose();
      } else {
        throw new Error('Tidak ada slide yang berhasil dibuat.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses konten.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#111114] border border-[#2d2d35] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header with Google accent bar */}
        <div className="google-gradient-bar h-1 w-full shrink-0"></div>
        <div className="px-6 py-4 border-b border-[#1f1f23] flex items-center justify-between bg-[#0a0a0c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Box Tulis & Susun Konten</h3>
              <p className="text-[11px] text-gray-400">Tulis naskah, draft artikel, atau catatan bebas untuk diubah jadi slide</p>
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Template Quick Insert */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Template Siap Pakai:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleInsertTemplate(tpl.content)}
                  className="p-2.5 rounded-xl bg-[#1a1a1f] hover:bg-[#25252c] border border-[#2d2d35] hover:border-blue-500/40 text-left transition group flex flex-col justify-between"
                >
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 w-fit mb-1">
                    {tpl.badge}
                  </span>
                  <span className="text-xs font-semibold text-gray-200 group-hover:text-blue-300 line-clamp-2">
                    {tpl.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Writing Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <label className="font-semibold uppercase tracking-wider">
                Isi Draft / Naskah Konten
              </label>
              <div className="text-[11px] font-mono text-gray-500">
                {wordCount} kata • {charCount} karakter
              </div>
            </div>

            <textarea
              rows={8}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Tulis atau tempel naskah artikel, catatan rapat, poin-poin ide, atau materi edukasi di sini...
AI akan otomatis memformatnya menjadi slide Hook, Pembahasan Inti (Bullet Points), dan CTA."
              className="w-full bg-[#1a1a1f] border border-[#2d2d35] rounded-xl p-3.5 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 transition leading-relaxed resize-none font-sans"
            />
          </div>

          {/* Controls: Slide Count & Tone */}
          <div className="grid grid-cols-2 gap-3 bg-[#1a1a1f] p-3 rounded-xl border border-[#2d2d35]">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">Target Slide:</span>
                <span className="text-blue-400 font-bold font-mono">{slideCount} Slide</span>
              </div>
              <input
                type="range"
                min={3}
                max={10}
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-[#2d2d35] rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium block">Gaya Bahasa:</span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-[#111114] border border-[#2d2d35] rounded-lg px-2.5 py-1 text-xs text-gray-300 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="santai dan engaging">Santai & Engaging</option>
                <option value="profesional dan berwawasan">Profesional & Berwawasan</option>
                <option value="storytelling inspiratif">Storytelling Inspiratif</option>
                <option value="langkah demi langkah tutorial">Step-by-Step Tutorial</option>
                <option value="kontroversial dan provokatif">Controversial & Bold</option>
              </select>
            </div>
          </div>

          {/* Error display */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#1f1f23] flex items-center justify-between bg-[#0a0a0c]">
          <button
            type="button"
            onClick={() => setContent('')}
            className="text-xs text-gray-400 hover:text-white transition"
          >
            Bersihkan Teks
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white transition"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleTransform}
              disabled={isProcessing || !content.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyusun Slide...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✨ Transform ke Carousel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
