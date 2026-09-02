import { EbookData } from '../types';

export function createInitialEmptyEbook(authorName = 'Arijal Meutuwah'): EbookData {
  return {
    id: `ebook-${Date.now()}`,
    title: 'E-BOOK STUDIO',
    tag: `STUDIO RESMI ${authorName.toUpperCase()}`,
    subtitle: 'Mulai buat e-book interaktif & PDF siap jual dari materi YouTube, Web, PDF, atau Catatan Anda.',
    difficulty: 'Semua Level',
    platform: 'Multi-Platform',
    monetization: 'Lynk.id / Shopee / Gumroad',
    format: 'Responsive Web & Print PDF',
    edition: 'Edisi 2026',
    author: authorName,
    modules: [
      {
        id: 'modul-1',
        moduleNumber: 1,
        badge: 'Modul 1',
        title: 'Mulai Dengan Mengunggah Materi',
        description: 'AI akan menyusun materi dari link YouTube, website, file PDF, atau catatan Anda menjadi e-book terstruktur.',
        introCard: {
          icon: '✨',
          title: 'Siapkan Sumber Materi Anda',
          subtitle: 'Multi-Source Ingestion Pipeline',
          body: 'Gunakan fitur Ingest Materi di toolbar atas untuk memasukkan materi dari link video YouTube (otomatis mengambil transkrip), artikel web, dokumen PDF, atau teks langsung.',
          checklist: [
            'Otomatis menyusun bab & modul terstruktur',
            'Menghasilkan kartu intisari, checklist, dan panduan langkah',
            'Dapat langsung diringkas menjadi Carousel Slide Media Sosial'
          ]
        },
        steps: [
          {
            number: 1,
            title: 'Pilih Sumber Materi',
            text: 'Klik tombol "Ingest Materi / AI E-Book" di toolbar atas.'
          },
          {
            number: 2,
            title: 'Biarkan AI Mengolah & Menyusun',
            text: 'AI membaca materi secara komprehensif dan menghasilkan struktur modul yang mendalam.'
          },
          {
            number: 3,
            title: 'Ringkas Menjadi Carousel atau Ekspor PDF',
            text: 'Dapat langsung dikonversi menjadi slide microblog atau diekspor ke format PDF siap jual.'
          }
        ],
        callouts: [
          {
            type: 'info',
            icon: '💡',
            title: 'Alur Kerja Terpadu:',
            body: 'Materi Asli (PDF/YouTube/Web/Notes) ➔ Master E-Book ➔ Ringkasan Carousel'
          }
        ]
      }
    ]
  };
}
