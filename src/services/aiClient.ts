import { Slide, EbookData, EbookModule, ApiKeyConfig } from '../types';

// Helper: Sanitize & parse JSON from AI outputs
export function sanitizeAndParseJSON(rawStr: string): any {
  if (!rawStr) return {};
  let clean = rawStr.trim();
  clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(clean);
  } catch (e1) {
    try {
      const sanitized = clean.replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
        if (match === '\n') return '\\n';
        if (match === '\r') return '\\r';
        if (match === '\t') return '\\t';
        return '';
      });
      return JSON.parse(sanitized);
    } catch {
      throw e1;
    }
  }
}

export const DEFAULT_XKIRO_KEY = 'sk-xt-8fd3f1a5a22446db94e0b6d0b7573f35e32d90ca6287f5ab';
export const DEFAULT_XKIRO_MODEL = 'deepseek/deepseek-chat-v3.1';
export const DEFAULT_XKIRO_BASE_URL = 'https://api.xkiro.com/v1';

// Fallback carousel generator: intelligently extracts from source material if offline
export function getFallbackCarousel(topic: string, slideCount: number = 5, language: string = 'Indonesian', sourceMaterial?: string): Slide[] {
  const isId = language.toLowerCase().includes('id') || language.toLowerCase().includes('indo');
  const count = Math.min(Math.max(slideCount || 5, 3), 10);
  const fallbackSlides: Slide[] = [];

  // Parse and clean real material sentences if provided
  let cleanSentences: string[] = [];
  if (sourceMaterial && sourceMaterial.trim().length > 15) {
    cleanSentences = sourceMaterial
      .replace(/\r\n/g, '\n')
      .split(/(?<=[.!?\n])\s+/)
      .map((s) => s.replace(/^[-*•\d.)\s]+/, '').trim())
      .filter((s) => s.length >= 15 && !s.startsWith('http'));
  }

  const effectiveTitle = topic || (cleanSentences[0] ? cleanSentences[0].slice(0, 55) : 'Panduan Ringkas Praktis');

  // Pedagogical stage definitions to ensure 100% unique slide themes if material sentences are sparse
  const stagesId = [
    { badge: 'Tahap 01 · Fondasi', step: 'STEP 01 · FONDASI UTAMA', title: 'Fondasi Utama & Mindset Eksekusi', highlight: 'Fondasi Utama', defaultBody: 'Pahami akar masalah sebelum melangkah ke solusi teknis. Hilangkan hambatan awal terbesar agar progress berjalan konsisten.', p1: 'Audit titik friksi terbesar dalam alur kerja', p2: 'Prioritaskan 20% tindakan penentu 80% dampak hasil' },
    { badge: 'Tahap 02 · Alur Kerja', step: 'STEP 02 · ALUR SISTEM', title: 'Alur Eksekusi Taktis & Penerapan', highlight: 'Eksekusi Taktis', defaultBody: 'Terapkan metode teruji langkah demi langkah. Hindari multitasking berlebihan dan fokus pada satu hasil berkualitas.', p1: 'Bangun checklist operasional terstandarisasi', p2: 'Validasi setiap hasil dengan kriteria yang jelas' },
    { badge: 'Tahap 03 · Optimasi', step: 'STEP 03 · OPTIMASI PROSES', title: 'Optimasi & Pengurangan Bottleneck', highlight: 'Optimasi Proses', defaultBody: 'Identifikasi proses lambat dan sederhanakan alurnya. Manfaatkan automasi agar waktu berharga Anda tidak terbuang sia-sia.', p1: 'Otomasi tugas repetitif bernilai rendah', p2: 'Evaluasi metrik efisiensi secara berkala' },
    { badge: 'Tahap 04 · Scale Up', step: 'STEP 04 · SKALA BESAR', title: 'Kunci Skalabilitas & Konsistensi', highlight: 'Skalabilitas', defaultBody: 'Setelah sistem berjalan stabil, tingkatkan skala secara terkontrol tanpa mengorbankan kualitas dan akurasi.', p1: 'Dokumentasikan pola keberhasilan yang terbukti', p2: 'Duplikasi sistem untuk menangani beban lebih besar' },
    { badge: 'Tahap 05 · Evaluasi', step: 'STEP 05 · EVALUASI AKHIR', title: 'Evaluasi Kinerja & Peningkatan Mutu', highlight: 'Peningkatan Mutu', defaultBody: 'Pantau metrik keberhasilan secara obyektif dan lakukan penyesuaian cepat terhadap bagian yang belum optimal.', p1: 'Bandingkan hasil nyata dengan target awal', p2: 'Perbaiki celah kecil sebelum menjadi masalah besar' },
  ];

  const stagesEn = [
    { badge: 'Phase 01 · Foundation', step: 'STEP 01 · CORE PRINCIPLE', title: 'Core Foundations & Mindset Shift', highlight: 'Core Foundation', defaultBody: 'Understand the root friction points before jumping into execution. Remove the biggest blocker to maintain momentum.', p1: 'Audit high-friction areas in current workflows', p2: 'Focus on high-leverage 80/20 execution points' },
    { badge: 'Phase 02 · Execution', step: 'STEP 02 · TACTICAL ACTION', title: 'Tactical Execution & Workflow', highlight: 'Tactical Action', defaultBody: 'Apply proven step-by-step methodologies without distraction. Prioritize high-quality single-task progress.', p1: 'Establish clear operational checklists', p2: 'Validate each milestone with concrete criteria' },
    { badge: 'Phase 03 · Optimization', step: 'STEP 03 · SYSTEM OPTIMIZATION', title: 'Process Optimization & Flow', highlight: 'System Optimization', defaultBody: 'Eliminate repetitive bottlenecks and automate low-value chores to safeguard your creative energy.', p1: 'Automate repetitive and tedious tasks', p2: 'Track efficiency metrics regularly' },
    { badge: 'Phase 04 · Scale Up', step: 'STEP 04 · SCALABILITY', title: 'Scaling Impact & Consistency', highlight: 'Scalability', defaultBody: 'Once the base system runs smoothly, scale capacity predictably without sacrificing standard quality.', p1: 'Document proven repeatable playbooks', p2: 'Expand output capacity systematically' },
  ];

  const stages = isId ? stagesId : stagesEn;

  // Slide 1: Hook
  fallbackSlides.push({
    id: `slide-fb-1`,
    slide_number: 1,
    type: 'hook',
    badge: isId ? '🔥 Materi Pilihan' : '🔥 Essential Guide',
    stepBadge: 'OVERVIEW · 01',
    title: effectiveTitle,
    highlightWord: effectiveTitle.split(' ')[0] || (isId ? 'Panduan' : 'Mastery'),
    body: cleanSentences[0] || (isId
      ? 'Berikut adalah rangkuman esensial dan poin-poin pembelajaran kunci yang disarikan langsung dari materi sumber.'
      : 'Here is the high-value synthesis and core actionable takeaways extracted directly from your source material.'),
    footer_hint: isId ? 'Geser ke kanan 👉' : 'Swipe to learn 👉',
    points: [
      cleanSentences[1] ? cleanSentences[1].slice(0, 65) : (isId ? 'Poin inti disarikan dari naskah' : 'Key insight distilled from source'),
      cleanSentences[2] ? cleanSentences[2].slice(0, 65) : (isId ? 'Langkah praktis siap terapkan' : 'Actionable execution blueprint'),
    ],
    ctaButtonText: isId ? 'Pelajari Selengkapnya →' : 'Read Full Guide →',
  });

  // Middle Slides: 2 to count - 1
  for (let i = 2; i < count; i++) {
    const stepIdx = i - 2;
    const stage = stages[stepIdx % stages.length];
    const sentenceA = cleanSentences[i] || stage.defaultBody;
    const sentenceB = cleanSentences[i + count] || stage.p1;
    const sentenceC = cleanSentences[i + count * 2] || stage.p2;

    const slideTitle = cleanSentences[i] && cleanSentences[i].length < 45
      ? cleanSentences[i]
      : `${stage.title}`;

    fallbackSlides.push({
      id: `slide-fb-${i}`,
      slide_number: i,
      type: i % 2 === 0 ? 'bullet' : 'content',
      badge: stage.badge,
      stepBadge: stage.step,
      title: slideTitle,
      highlightWord: stage.highlight,
      body: sentenceA,
      points: [sentenceB.slice(0, 75), sentenceC.slice(0, 75)],
      tip: isId ? `💡 Tip: Terapkan prinsip ${stage.highlight.toLowerCase()} ini secara konsisten.` : `💡 Pro Tip: Apply this ${stage.highlight.toLowerCase()} consistently.`,
      footer_hint: isId ? 'Lanjut ke langkah berikutnya 🚀' : 'Next step ahead 🚀',
    });
  }

  // Final Slide: CTA & Conclusion
  fallbackSlides.push({
    id: `slide-fb-${count}`,
    slide_number: count,
    type: 'cta',
    badge: isId ? '⚡ Kesimpulan & Aksi' : '⚡ Summary & Action',
    stepBadge: 'YOU ARE ALL SET',
    title: isId ? 'Mulai Terapkan Sekarang Juga!' : 'Ready to Take Action?',
    highlightWord: isId ? 'Terapkan Sekarang' : 'Take Action',
    body: isId
      ? 'Kunci keberhasilan bukan hanya pada membaca materi, melainkan konsistensi eksekusi di lapangan. Simpan panduan ini untuk referensi berkala.'
      : 'Success comes from disciplined implementation, not just passive reading. Bookmark this guide to review whenever you execute.',
    footer_hint: isId ? 'Save & Share 📌' : 'Save & Share 📌',
    points: [
      isId ? '📌 Simpan postingan ini untuk contekan kerja' : '📌 Bookmark this guide for quick reference',
      isId ? '💬 Tulis takeaway terbesarmu di kolom komentar' : '💬 Share your main takeaway in the comments',
    ],
    ctaButtonText: isId ? 'Simpan Panduan Ini 🔖' : 'Save This Guide 🔖',
  });

  return fallbackSlides;
}

// Fallback E-Book Generator with distinct, high-value modules
export function getFallbackEbook(topic: string, moduleCount: number = 5, language: string = 'Indonesian', authorName: string = 'Arijal Meutuwah'): EbookData {
  const count = Math.min(Math.max(moduleCount || 5, 3), 8);
  const modules: EbookModule[] = [];

  const moduleBlueprints = [
    {
      badge: 'Modul 01',
      title: `Mindset & Fondasi Kunci: ${topic}`,
      desc: `Pahami prinsip fundamental dan hilangkan kesalahan paling umum sebelum memulai.`,
      icon: '🎯',
      cardTitle: 'Prinsip Dasar & Pola Pikir',
      cardSub: 'Membangun Fondasi yang Tak Tergoyahkan',
      body: `Banyak pemula gagal karena terburu-buru eksekusi tanpa strategi jelas. Modul ini membimbing Anda memetakan prioritas utama.`,
      checklist: [
        'Audit 3 hambatan terbesar yang memperlambat progress',
        'Fokus pada 20% upaya kunci penentu 80% hasil nyata',
        'Menyiapkan standar kualitas kerja yang konsisten',
      ],
      steps: [
        { number: 1, title: 'Pemetaan Tujuan & Parameter Keberhasilan', text: 'Tentukan indikator kunci kinerja (KPI) agar hasil akhir dapat diukur dengan jelas dan obyektif.' },
        { number: 2, title: 'Eliminasi Friksi Awal', text: 'Singkirkan distraksi dan siapkan instrumen kerja yang siap pakai tanpa kerumitan teknis.' },
        { number: 3, title: 'Penyusunan Rencana Aksi Harian', text: 'Bagi target besar menjadi tindakan terukur yang bisa diselesaikan dalam 30 menit setiap hari.' },
      ],
      prompts: [
        { tag: 'Master Prompt: Audit Fondasi', content: `Bertindaklah sebagai konsultan strategis. Analisis topik "${topic}" dan berikan 3 risiko terbesar yang wajib dihindari serta solusi praktisnya.` },
      ],
      callout: { type: 'tip' as const, icon: '💡', title: 'Prinsip Emas', body: 'Fondasi yang matang memangkas 70% waktu revisi dan kegagalan di masa mendatang.' },
    },
    {
      badge: 'Modul 02',
      title: `Alur Riset Taktis & Validasi Data`,
      desc: `Metode menyaring materi berbobot dan mengonversinya menjadi wawasan bernilai tinggi.`,
      icon: '🔍',
      cardTitle: 'Sistem Riset Terarah',
      cardSub: 'Mengumpulkan Data & Bukti Nyata',
      body: `Konten dan produk berkualitas lahir dari riset yang mendalam. Pelajari cara menggali insight autentik yang dibutuhkan target audiens.`,
      checklist: [
        'Teknik menggali pain point dan kebutuhan mendesak pasar',
        'Menyusun kerangka materi terstruktur tanpa informasi sampah',
        'Memvalidasi akurasi setiap referensi sebelum dipublikasikan',
      ],
      steps: [
        { number: 1, title: 'Identifikasi Kebutuhan Nyata Audiens', text: 'Kumpulkan pertanyaan paling sering diajukan dan keluhan yang belum terselesaikan.' },
        { number: 2, title: 'Kurasi Referensi & Bukti Kasus', text: 'Kumpulkan studi kasus nyata dan data empiris untuk memperkuat kredibilitas.' },
        { number: 3, title: 'Sintesis Menjadi Formula Praktis', text: 'Ubah teori yang rumit menjadi langkah-langkah sederhana yang mudah diikuti siapa saja.' },
      ],
      prompts: [
        { tag: 'Master Prompt: Riset Masalah', content: `Ekstrak 5 pertanyaan mendasar dan 5 ketakutan terbesar yang sering dihadapi seseorang terkait "${topic}".` },
      ],
      callout: { type: 'info' as const, icon: '📌', title: 'Catatan Riset', body: 'Kredibilitas adalah mata uang utama. Gunakan data konkret untuk mendukung setiap klaim.' },
    },
    {
      badge: 'Modul 03',
      title: `Metodologi Eksekusi & Penerapan Lapangan`,
      desc: `Langkah demi langkah menerapkan konsep menjadi hasil konkret yang dapat dibuktikan.`,
      icon: '⚡',
      cardTitle: 'Eksekusi Bertahap Tanpa Henti',
      cardSub: 'Mengubah Rencana Menjadi Hasil Nyata',
      body: `Kekuatan utama sebuah panduan ada pada kemampuannya membimbing eksekusi langkah demi langkah dengan jelas.`,
      checklist: [
        'Prosedur operasional standar (SOP) yang siap dijalankan',
        'Pengendalian kualitas pada setiap tahapan kerja',
        'Mengatasi kebuntuan teknis dengan solusi teruji',
      ],
      steps: [
        { number: 1, title: 'Setup Lingkungan & Bahan Baku', text: 'Pastikan seluruh aset, template, dan materi pendukung telah tertata rapi di satu tempat.' },
        { number: 2, title: 'Eksekusi Modul Percontohan (MVP)', text: 'Kerjakan versi pertama dengan fokus pada fungsi inti sebelum menyempurnakan detail.' },
        { number: 3, title: 'Uji Coba & Koreksi Langsung', text: 'Lakukan peninjauan hasil kerja dan perbaiki kesalahan kecil sesegera mungkin.' },
      ],
      prompts: [
        { tag: 'Master Prompt: Checklist Eksekusi', content: `Buatkan checklist langkah taktis harian untuk mengimplementasikan "${topic}" secara bertahap selama 7 hari.` },
      ],
      callout: { type: 'tip' as const, icon: '🚀', title: 'Trik Produktivitas', body: 'Selesaikan satu tugas penting sebelum berpindah ke tugas berikutnya untuk menjaga momentum.' },
    },
    {
      badge: 'Modul 04',
      title: `Optimasi Alur Kerja & Otomasi Sistem`,
      desc: `Meningkatkan efisiensi kerja hingga 3x lipat dengan bantuan sistem dan automasi cerdas.`,
      icon: '⚙️',
      cardTitle: 'Efisiensi Tanpa Hambatan',
      cardSub: 'Bekerja Lebih Cerdas, Bukan Lebih Keras',
      body: `Pelajari cara mengotomatiskan tugas-tugas repetitif agar fokus Anda tetap pada aspek bernilai tinggi.`,
      checklist: [
        'Memetakan proses yang memakan waktu paling banyak',
        'Menerapkan automasi dan template untuk tugas berulang',
        'Mengurangi kesalahan manusia dengan sistem pengawasan',
      ],
      steps: [
        { number: 1, title: 'Pemisahan Tugas Kreatif vs Repetitif', text: 'Identifikasi pekerjaan mekanis yang bisa didelegasikan atau diotomasi sepenuhnya.' },
        { number: 2, title: 'Implementasi Template Standar', text: 'Buat template dokumen dan workflow yang dapat digunakan kembali kapan saja.' },
        { number: 3, title: 'Pemantauan Waktu & Output', text: 'Ukur penghematan waktu yang diperoleh dan alokasikan untuk pengembangan strategis.' },
      ],
      prompts: [
        { tag: 'Master Prompt: Automasi Kerja', content: `Identifikasi 3 area paling memakan waktu dalam "${topic}" dan berikan cara mengotomasikannya dengan bantuan AI.` },
      ],
      callout: { type: 'tip' as const, icon: '💡', title: 'Kunci Efisiensi', body: 'Sistem yang baik bekerja untuk Anda, membebaskan waktu untuk inovasi yang lebih besar.' },
    },
    {
      badge: 'Modul 05',
      title: `Monetisasi, Distribusi & Skalabilitas`,
      desc: `Strategi mengubah penguasaan materi menjadi aset digital bernilai komersial tinggi.`,
      icon: '💎',
      cardTitle: 'Pengemasan & Komersialisasi',
      cardSub: 'Menghasilkan Nilai Nyata dari Keterampilan Anda',
      body: `Buku panduan ini dirancang untuk siap monetisasi di platform seperti Lynk.id, Shopee, Gumroad, atau media sosial Anda.`,
      checklist: [
        'Strategi penetapan harga berbasis nilai (Value-Based Pricing)',
        'Saluran distribusi digital terpopuler dengan konversi tinggi',
        'Membangun basis audiens yang loyal dan siap membeli',
      ],
      steps: [
        { number: 1, title: 'Pengemasan Penawaran yang Menggiurkan', text: 'Kemas materi Anda menjadi produk digital premium dengan bonus dan garansi nilai.' },
        { number: 2, title: 'Distribusi Melalui Kanal Tepat Sasaran', text: 'Gunakan etalase digital seperti Lynk.id atau Shopee untuk memudahkan transaksi pembeli.' },
        { number: 3, title: 'Skalabilitas & Peluncuran Berulang', text: 'Bangun corong pemasaran (funnel) sederhana yang mengalirkan pembeli secara berkelanjutan.' },
      ],
      prompts: [
        { tag: 'Master Prompt: Formula Penawaran', content: `Buatkan naskah penawaran persuasif (sales copy) untuk menjual produk digital bertema "${topic}" di Lynk.id.` },
      ],
      callout: { type: 'tip' as const, icon: '💰', title: 'Mindset Monetisasi', body: 'Audiens tidak membeli sekadar informasi, mereka membeli kemudahan, kecepatan, dan kepastian hasil.' },
    },
  ];

  for (let i = 1; i <= count; i++) {
    const bp = moduleBlueprints[(i - 1) % moduleBlueprints.length];
    modules.push({
      id: `modul-fb-${i}`,
      moduleNumber: i,
      badge: `Modul 0${i}`,
      title: i === 1 ? bp.title : i === count ? `Monetisasi & Eksekusi Skala Besar` : bp.title,
      description: bp.desc,
      introCard: {
        icon: bp.icon,
        title: bp.cardTitle,
        subtitle: bp.cardSub,
        body: bp.body,
        checklist: bp.checklist,
      },
      steps: bp.steps,
      prompts: bp.prompts,
      callouts: [bp.callout],
    });
  }

  return {
    id: `ebook-${Date.now()}`,
    title: topic.toUpperCase(),
    tag: `PANDUAN EKSKLUSIF ${authorName.toUpperCase()}`,
    subtitle: `Panduan Komprehensif Langkah demi Langkah Menguasai ${topic}`,
    difficulty: 'Semua Tingkat',
    platform: 'Multi-Platform (Shopee / Lynk.id / Social)',
    monetization: 'Lynk.id / Shopee / Gumroad Ready',
    format: 'Responsive Web & Print PDF',
    edition: 'Edisi 2026',
    author: authorName,
    modules,
    variantId: 'variant-1-tech',
  };
}

// Client-side Direct AI Caller
export async function callClientDirectAi(params: {
  apiKeyConfig?: ApiKeyConfig;
  systemPrompt: string;
  userPrompt: string;
  responseMimeType?: string;
}): Promise<string> {
  const { apiKeyConfig, systemPrompt, userPrompt } = params;
  const provider = apiKeyConfig?.provider || 'gemini';
  const apiKey = apiKeyConfig?.apiKey?.trim() || '';

  if (!apiKey) {
    throw new Error('API Key tidak ditemukan. Silakan masukkan API Key di menu status AI.');
  }

  // 1. Google Gemini Direct REST API
  if (provider === 'gemini') {
    const candidateModels = [
      apiKeyConfig?.model || 'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ];

    let lastErr = null;
    for (const m of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Gemini API Error (${res.status}): ${errBody}`);
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error('Gagal memanggil Gemini API');
  }

  // 2. xKiro / OpenAI / Groq / OpenRouter / DeepSeek
  let endpoint = apiKeyConfig?.baseUrl || DEFAULT_XKIRO_BASE_URL;
  let defaultModel = DEFAULT_XKIRO_MODEL;

  if (provider === 'xkiro') {
    endpoint = apiKeyConfig?.baseUrl || DEFAULT_XKIRO_BASE_URL;
    defaultModel = apiKeyConfig?.model || DEFAULT_XKIRO_MODEL;
  } else if (provider === 'groq') {
    endpoint = apiKeyConfig?.baseUrl || 'https://api.groq.com/openai/v1';
    defaultModel = 'llama-3.3-70b-versatile';
  } else if (provider === 'openrouter') {
    endpoint = apiKeyConfig?.baseUrl || 'https://openrouter.ai/api/v1';
    defaultModel = 'anthropic/claude-3.5-sonnet';
  } else if (provider === 'deepseek') {
    endpoint = apiKeyConfig?.baseUrl || 'https://api.deepseek.com/v1';
    defaultModel = 'deepseek-chat';
  } else if (provider === 'openai') {
    endpoint = apiKeyConfig?.baseUrl || 'https://api.openai.com/v1';
    defaultModel = 'gpt-4o';
  }

  const effectiveKey = apiKey && apiKey.trim().length > 5 
    ? apiKey.trim() 
    : (provider === 'xkiro' ? DEFAULT_XKIRO_KEY : (apiKey || ''));

  const cleanUrl = endpoint.replace(/\/+$/, '') + '/chat/completions';
  const requestedModel = apiKeyConfig?.model || defaultModel;

  const executeCall = async (modelName: string) => {
    return await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${effectiveKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });
  };

  let res = await executeCall(requestedModel);

  // If xkiro returned 403 (e.g. model requires paying account) and requestedModel is not deepseek-chat-v3.1, fallback to deepseek-chat-v3.1
  if (!res.ok && provider === 'xkiro' && requestedModel !== DEFAULT_XKIRO_MODEL) {
    console.warn(`xKiro model "${requestedModel}" returned ${res.status}. Seamlessly falling back to verified ${DEFAULT_XKIRO_MODEL}...`);
    res = await executeCall(DEFAULT_XKIRO_MODEL);
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${provider.toUpperCase()} Error: ${errText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Empty response from ${provider}`);
  return content;
}

// Universal AI Generator for Carousels (Material-First)
export async function generateCarouselAI(params: {
  topic?: string;
  sourceMaterial?: string;
  slideCount?: number;
  tone?: string;
  language?: string;
  authorName?: string;
  targetAudience?: string;
  apiKeyConfig?: ApiKeyConfig;
}): Promise<{ topic: string; slides: Slide[]; isFallback: boolean; error?: string }> {
  const {
    topic,
    sourceMaterial,
    slideCount = 5,
    tone = 'santai dan engaging',
    language = 'Indonesian',
    authorName = 'Arijal Meutuwah',
    targetAudience = 'Content creators, professionals, and students',
    apiKeyConfig,
  } = params;

  let effectiveTopic = (topic || '').trim();
  if (!effectiveTopic && sourceMaterial) {
    const firstLine = sourceMaterial.trim().split('\n')[0].replace(/[#*_-]/g, '').trim();
    effectiveTopic = firstLine.slice(0, 80) || 'Ringkasan Materi';
  }
  effectiveTopic = effectiveTopic || 'Panduan Ringkas Praktis';

  const count = Math.min(Math.max(slideCount || 5, 3), 10);

  // 1. Try local or remote /api/generate-carousel FIRST
  try {
    const apiRes = await fetch('/api/generate-carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: effectiveTopic,
        sourceMaterial,
        slideCount: count,
        tone,
        language,
        authorName,
        targetAudience,
        provider: apiKeyConfig?.provider || 'xkiro',
        apiKey: apiKeyConfig?.apiKey || DEFAULT_XKIRO_KEY,
        model: apiKeyConfig?.model || DEFAULT_XKIRO_MODEL,
        baseUrl: apiKeyConfig?.baseUrl || DEFAULT_XKIRO_BASE_URL,
      }),
    });

    const contentType = apiRes.headers.get('content-type') || '';
    if (apiRes.ok && contentType.includes('application/json')) {
      const data = await apiRes.json();
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        return { 
          topic: data.topic || effectiveTopic,
          slides: data.slides, 
          isFallback: Boolean(data.isFallback) 
        };
      }
    }
  } catch {
    // API endpoint not reachable, proceed to client direct
  }

  const systemPrompt = `Kamu adalah copywriter dan desainer konten carousel kelas dunia untuk Instagram, LinkedIn, dan Twitter.
TUGAS UTAMA:
Kamu diberikan MATERI SUMBER (bisa berupa teks artikel, transkrip, catatan, atau tutorial).
Kamu WAJIB menyerap dan mengekstrak inti pengetahuan asli dari MATERI SUMBER tersebut menjadi tepat ${count} slide carousel bernilai tinggi.

ATURAN KETAT:
1. "topic": Ekstrak atau buatkan judul yang sangat memikat dan ringkas (4-8 kata) yang merangkum inti materi.
2. Slide 1 (Hook): Judul hook yang kuat, highlightWord, subheadline pengantar (15-25 kata) yang menjabarkan intisari masalah/solusi nyata dari materi, dan 2 poin ringkasan utama.
3. Slide 2 s/d ${count - 1} (Isi Daging): Setiap slide WAJIB membahas 1 pilar, langkah, atau poin NYATA dari MATERI SUMBER. Kalimat penjelasan harus lengkap, tuntas, dan berbobot (jangan potong kalimat).
4. Slide ${count} (CTA): Rangkuman penutup materi dan ajakan simpan/bagikan (Save & Share).
5. DILARANG menggunakan template acak atau contoh generik palsu (seperti teks "npx carouselx" atau "Pilar 1: Fokus Eksekusi" tanpa konteks). Seluruh isi slide HARUS bersumber dari materi yang diberikan.
6. Kembalikan strictly valid JSON object dengan schema:
{
  "topic": "Judul materi",
  "slides": [
    {
      "slide_number": 1,
      "type": "hook",
      "badge": "🔥 Ringkasan Materi",
      "stepBadge": "OVERVIEW · 01",
      "title": "Judul Slide",
      "highlightWord": "Kata Kunci",
      "body": "Penjelasan lengkap...",
      "points": ["Poin 1", "Poin 2"],
      "footer_hint": "Geser 👉"
    }
  ]
}`;

  let userPrompt = `JUMLAH SLIDE DIBUTUHKAN: Tepat ${count} slide.\nNAMA KREATOR: "${authorName}".\nBAHASA: ${language}.\nGAYA BAHASA: ${tone}.\n`;
  if (sourceMaterial && sourceMaterial.trim().length > 10) {
    userPrompt += `\nMATERI SUMBER YANG HARUS DIOLAH:\n===\n${sourceMaterial.slice(0, 25000)}\n===\n`;
  } else {
    userPrompt += `\nTOPIK MATERI: "${effectiveTopic}"\n`;
  }
  userPrompt += '\nEkstrak seluruh poin penting dari materi sumber di atas sekarang dalam format JSON.';

  const configToUse: ApiKeyConfig = (apiKeyConfig?.apiKey && apiKeyConfig.apiKey.trim().length > 5)
    ? apiKeyConfig
    : {
        provider: 'xkiro',
        apiKey: DEFAULT_XKIRO_KEY,
        model: DEFAULT_XKIRO_MODEL,
        baseUrl: DEFAULT_XKIRO_BASE_URL,
      };

  try {
    const raw = await callClientDirectAi({
      apiKeyConfig: configToUse,
      systemPrompt,
      userPrompt,
    });
    const parsed = sanitizeAndParseJSON(raw);
    if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
      const outputTopic = parsed.topic || effectiveTopic;
      const formattedSlides: Slide[] = parsed.slides.map((s: any, idx: number) => ({
        id: `slide-client-${Date.now()}-${idx}`,
        slide_number: idx + 1,
        type: s.type || (idx === 0 ? 'hook' : idx === parsed.slides.length - 1 ? 'cta' : 'content'),
        badge: s.badge || (idx === 0 ? '🔥 Hook' : idx === parsed.slides.length - 1 ? '📌 Takeaway' : `Langkah 0${idx}`),
        stepBadge: s.stepBadge || undefined,
        title: s.title || `Slide ${idx + 1}`,
        highlightWord: s.highlightWord || undefined,
        body: s.body || '',
        points: Array.isArray(s.points) ? s.points : [],
        codeSnippet: s.codeSnippet || undefined,
        terminalTitle: s.terminalTitle || undefined,
        tip: s.tip || undefined,
        tag: s.tag || undefined,
        ctaButtonText: s.ctaButtonText || undefined,
        statValue: s.statValue || undefined,
        statLabel: s.statLabel || undefined,
        footer_hint: s.footer_hint || (idx === parsed.slides.length - 1 ? 'Save & Share 📌' : 'Swipe 👉'),
        icon: s.icon || undefined,
      }));
      return { topic: outputTopic, slides: formattedSlides, isFallback: false };
    }
  } catch (err: any) {
    console.warn('Direct Client AI failed, using smart material fallback:', err.message);
    return {
      topic: effectiveTopic,
      slides: getFallbackCarousel(effectiveTopic, count, language, sourceMaterial),
      isFallback: true,
      error: err.message,
    };
  }

  // 3. Smart Material Fallback
  return {
    topic: effectiveTopic,
    slides: getFallbackCarousel(effectiveTopic, count, language, sourceMaterial),
    isFallback: true,
    error: 'Menggunakan ekstraksi materi terstruktur.',
  };
}

// Universal AI Converter for Raw Content / Draft into Structured Carousel
export async function structureContentAI(params: {
  rawContent: string;
  slideCount?: number;
  tone?: string;
  language?: string;
  authorName?: string;
  apiKeyConfig?: ApiKeyConfig;
}): Promise<{ slides: Slide[]; isFallback: boolean; error?: string }> {
  const {
    rawContent,
    slideCount = 5,
    tone = 'santai dan engaging',
    language = 'Indonesian',
    authorName = 'Arijal Meutuwah',
    apiKeyConfig,
  } = params;

  const count = Math.min(Math.max(slideCount || 5, 3), 10);

  // 1. Try /api/structure-content FIRST (if available & JSON)
  try {
    const apiRes = await fetch('/api/structure-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawContent,
        slideCount: count,
        tone,
        language,
        authorName,
        provider: apiKeyConfig?.provider,
        apiKey: apiKeyConfig?.apiKey,
        model: apiKeyConfig?.model,
        baseUrl: apiKeyConfig?.baseUrl,
      }),
    });

    const contentType = apiRes.headers.get('content-type') || '';
    if (apiRes.ok && contentType.includes('application/json')) {
      const data = await apiRes.json();
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        return { slides: data.slides, isFallback: Boolean(data.isFallback) };
      }
    }
  } catch {
    // API not reachable or returned HTML, fall back to direct AI
  }

  // 2. Direct AI call or Fallback
  return generateCarouselAI({
    topic: rawContent.slice(0, 60),
    sourceMaterial: rawContent,
    slideCount: count,
    tone,
    language,
    authorName,
    apiKeyConfig,
  });
}

// Universal AI Generator for E-Books
export async function generateEbookAI(params: {
  topic: string;
  sourceText?: string;
  sourceType?: string;
  sourceTitle?: string;
  authorName?: string;
  moduleCount?: number;
  language?: string;
  apiKeyConfig?: ApiKeyConfig;
}): Promise<{ ebook: EbookData; isFallback: boolean; error?: string }> {
  const {
    topic,
    sourceText,
    sourceType,
    sourceTitle,
    authorName = 'Arijal Meutuwah',
    moduleCount = 5,
    language = 'Indonesian',
    apiKeyConfig,
  } = params;

  const count = Math.min(Math.max(moduleCount || 5, 3), 8);

  // 1. Try /api/generate-ebook FIRST
  try {
    const apiRes = await fetch('/api/generate-ebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        sourceText,
        sourceType,
        sourceTitle,
        authorName,
        moduleCount: count,
        language,
        provider: apiKeyConfig?.provider,
        apiKey: apiKeyConfig?.apiKey,
        model: apiKeyConfig?.model,
        baseUrl: apiKeyConfig?.baseUrl,
      }),
    });

    const contentType = apiRes.headers.get('content-type') || '';
    if (apiRes.ok && contentType.includes('application/json')) {
      const data = await apiRes.json();
      if (data.ebook && Array.isArray(data.ebook.modules)) {
        return { ebook: data.ebook, isFallback: false };
      }
    }
  } catch {
    // Graceful fallback to client AI
  }

  // 2. Direct Client AI
  const systemPrompt = `You are a bestselling digital product author, educator, and master curriculum architect.
Your job is to generate a comprehensive, highly actionable ${count}-module digital E-Book ready for sale on Lynk.id or Shopee.
Every module must provide clear value, actionable steps, and pro tips.

Return strictly JSON matching:
{
  "ebook": {
    "title": "Main Title",
    "tag": "PANDUAN LENGKAP",
    "subtitle": "Subtitle explaining benefit",
    "difficulty": "Semua Tingkat",
    "platform": "Multi-Platform",
    "monetization": "Lynk.id / Shopee / Digital",
    "format": "Interactive HTML & Print PDF",
    "edition": "Edisi 2026",
    "author": "${authorName}",
    "modules": [
      {
        "id": "modul-1",
        "moduleNumber": 1,
        "badge": "Modul 1",
        "title": "Module Title",
        "description": "Module overview",
        "introCard": {
          "icon": "🎯",
          "title": "Intro Title",
          "subtitle": "Intro Subtitle",
          "body": "Intro body copy",
          "checklist": ["point 1", "point 2", "point 3"]
        },
        "steps": [
          {"number": 1, "title": "Step 1", "text": "Details"},
          {"number": 2, "title": "Step 2", "text": "Details"}
        ],
        "callouts": [
          {"type": "info", "icon": "💡", "title": "Pro Tip", "body": "Tip text"}
        ]
      }
    ]
  }
}`;

  let userPrompt = `Topic / Goal: "${topic}"\nAuthor: "${authorName}"\nModules needed: Exactly ${count} modules.\nLanguage: ${language}\n`;
  if (sourceText && sourceText.trim().length > 0) {
    userPrompt += `\nSource Material (${sourceType || 'Content'}): "${sourceTitle || topic}":\n${sourceText.slice(0, 25000)}\n`;
  }
  userPrompt += '\nReturn strictly JSON now.';

  const configToUse: ApiKeyConfig = (apiKeyConfig?.apiKey && apiKeyConfig.apiKey.trim().length > 5)
    ? apiKeyConfig
    : {
        provider: 'xkiro',
        apiKey: DEFAULT_XKIRO_KEY,
        model: DEFAULT_XKIRO_MODEL,
        baseUrl: DEFAULT_XKIRO_BASE_URL,
      };

  try {
    const raw = await callClientDirectAi({ apiKeyConfig: configToUse, systemPrompt, userPrompt });
    const parsed = sanitizeAndParseJSON(raw);
    if (parsed.ebook && Array.isArray(parsed.ebook.modules)) {
      return { ebook: parsed.ebook, isFallback: false };
    }
  } catch (err: any) {
    console.warn('Direct AI for E-book failed, using fallback:', err.message);
    return { ebook: getFallbackEbook(topic, count, language, authorName), isFallback: true, error: err.message };
  }

  return {
    ebook: getFallbackEbook(topic, count, language, authorName),
    isFallback: true,
    error: 'Menggunakan template materi terstruktur.',
  };
}

// Conduct AI Deep Research on any topic / question (NotebookLM Deep Research)
export async function researchTopicAI(params: {
  topic: string;
  focus?: string;
  language?: string;
  apiKeyConfig?: ApiKeyConfig;
}): Promise<{ title: string; text: string; overview: string; keyTakeaways: string[]; wordCount: number; error?: string }> {
  const { topic, focus = 'Panduan Lengkap & Aplikatif', language = 'Indonesian', apiKeyConfig } = params;

  // 1. Try server endpoint first
  try {
    const res = await fetch('/api/research-topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        focus,
        language,
        provider: apiKeyConfig?.provider || 'xkiro',
        apiKey: apiKeyConfig?.apiKey || DEFAULT_XKIRO_KEY,
        model: apiKeyConfig?.model || DEFAULT_XKIRO_MODEL,
        baseUrl: apiKeyConfig?.baseUrl || DEFAULT_XKIRO_BASE_URL,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return {
          title: data.title || topic,
          text: data.text,
          overview: data.overview || '',
          keyTakeaways: data.keyTakeaways || [],
          wordCount: data.wordCount || data.text.split(/\s+/).filter(Boolean).length,
        };
      }
    }
  } catch {
    // proceed to direct client AI
  }

  // 2. Direct client AI
  const configToUse: ApiKeyConfig = (apiKeyConfig?.apiKey && apiKeyConfig.apiKey.trim().length > 5)
    ? apiKeyConfig
    : {
        provider: 'xkiro',
        apiKey: DEFAULT_XKIRO_KEY,
        model: DEFAULT_XKIRO_MODEL,
        baseUrl: DEFAULT_XKIRO_BASE_URL,
      };

  const systemPrompt = `Kamu adalah Chief Research Officer & Master Educator kelas dunia.
TUGAS UTAMA: Lakukan riset mendalam dan susun naskah materi sumber (Source Material) terstruktur, kaya data, studi kasus, dan langkah praktis (600-1200 kata) dalam ${language}.
Format JSON:
{
  "title": "Judul Komprehensif",
  "overview": "Ringkasan eksekutif...",
  "text": "Naskah materi riset lengkap terbagi dalam sub-bab dengan heading Markdown (###), poin data, dan langkah...",
  "keyTakeaways": ["Poin 1", "Poin 2", "Poin 3"]
}`;

  const userPrompt = `Riset topik: "${topic}"\nFokus: ${focus}\nBahasa: ${language}\nKembalikan strictly JSON.`;

  try {
    const raw = await callClientDirectAi({ apiKeyConfig: configToUse, systemPrompt, userPrompt });
    const parsed = sanitizeAndParseJSON(raw);
    const text = parsed.text || `${parsed.overview || ''}\n\n${(parsed.keyTakeaways || []).join('\n')}`;
    return {
      title: parsed.title || topic,
      overview: parsed.overview || '',
      text,
      keyTakeaways: parsed.keyTakeaways || [],
      wordCount: text.split(/\s+/).filter(Boolean).length,
    };
  } catch (err: any) {
    return {
      title: topic,
      overview: `Riset untuk topik: ${topic}`,
      text: `# Panduan Komprehensif: ${topic}\n\nTopik ini membahas pilar-pilar penting untuk eksekusi nyata, manajemen strategi, dan implementasi langkah demi langkah.\n\n### 1. Fondasi & Pemahaman Awal\nMemahami konteks dan masalah utama yang dihadapi audiens.\n\n### 2. Metode Eksekusi Bertahap\nLangkah taktis yang dapat diterapkan secara langsung.\n\n### 3. Evaluasi & Optimasi Berkelanjutan\nMengukur efektivitas dan memperbesar dampak hasil.`,
      keyTakeaways: [`Memahami konsep dasar ${topic}`, 'Menerapkan langkah eksekusi nyata', 'Mengoptimalkan hasil'],
      wordCount: 70,
      error: err.message,
    };
  }
}

// Distill E-Book to Carousel Slide Deck
export async function distillEbookToCarouselAI(params: {
  ebook: EbookData;
  slideCount?: number;
  tone?: string;
  language?: string;
  authorName?: string;
  apiKeyConfig?: ApiKeyConfig;
}): Promise<{ slides: Slide[]; isFallback: boolean; error?: string }> {
  const {
    ebook,
    slideCount = 6,
    tone = 'santai, padat dan bernilai tinggi',
    language = 'Indonesian',
    authorName = 'Arijal Meutuwah',
    apiKeyConfig,
  } = params;

  const count = Math.min(Math.max(slideCount || 6, 4), 10);

  // 1. Try API first
  try {
    const apiRes = await fetch('/api/distill-ebook-to-carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ebook,
        slideCount: count,
        tone,
        language,
        authorName,
        provider: apiKeyConfig?.provider,
        apiKey: apiKeyConfig?.apiKey,
        model: apiKeyConfig?.model,
        baseUrl: apiKeyConfig?.baseUrl,
      }),
    });

    const contentType = apiRes.headers.get('content-type') || '';
    if (apiRes.ok && contentType.includes('application/json')) {
      const data = await apiRes.json();
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        return { slides: data.slides, isFallback: false };
      }
    }
  } catch {
    // Continue to fallback
  }

  // Fallback slides generated from modules directly
  const distilled: Slide[] = [];
  distilled.push({
    id: `distill-hook-${Date.now()}`,
    slide_number: 1,
    type: 'hook',
    badge: '🔥 Rangkuman Master E-Book',
    stepBadge: 'RINGKASAN EKSEKUTIF',
    title: ebook.title,
    highlightWord: 'Rangkuman Inti',
    body: ebook.subtitle || 'Kompilasi wawasan dan strategi praktis dari master panduan.',
    points: ['Intisari modul terbaik', 'Bisa langsung dipraktikkan'],
    footer_hint: 'Geser ke bab 1 👉',
    ctaButtonText: 'Baca Selengkapnya →',
  });

  const availableModules = ebook.modules || [];
  const middleCount = count - 2;

  for (let i = 0; i < middleCount; i++) {
    const m = availableModules[i % availableModules.length];
    distilled.push({
      id: `distill-mod-${i}-${Date.now()}`,
      slide_number: i + 2,
      type: 'content',
      badge: m?.badge || `Modul 0${i + 1}`,
      stepBadge: `BAB 0${i + 1} · INTISARI`,
      title: m?.title || `Strategi Modul 0${i + 1}`,
      body: m?.description || 'Langkah kunci dalam mengimplementasikan materi ini.',
      points: m?.introCard?.checklist?.slice(0, 3) || m?.steps?.map(s => s.title).slice(0, 3) || ['Pahami fondasi utama', 'Eksekusi konsisten'],
      tip: m?.callouts?.[0]?.body,
      footer_hint: 'Lanjut ke modul berikutnya 🚀',
    });
  }

  distilled.push({
    id: `distill-cta-${Date.now()}`,
    slide_number: count,
    type: 'cta',
    badge: '⚡ Siap Memulai?',
    stepBadge: 'YOU ARE ALL SET',
    title: 'Dapatkan E-Book Lengkapnya!',
    body: 'Miliki akses ke seluruh bab, template prompt, dan studi kasus praktis.',
    points: ['📌 Simpan postingan ini', '🔗 Link pembelian ada di bio profil'],
    ctaButtonText: 'Beli E-Book di Lynk.id 🔖',
    footer_hint: 'Save & Share 📌',
  });

  return { slides: distilled, isFallback: false };
}
