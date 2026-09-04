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

// Fallback carousel generator if AI is offline or key missing
export function getFallbackCarousel(topic: string, slideCount: number = 5, language: string = 'Indonesian'): Slide[] {
  const isId = language.toLowerCase().includes('id') || language.toLowerCase().includes('indo');
  const count = Math.min(Math.max(slideCount || 5, 3), 10);
  const fallbackSlides: Slide[] = [];

  if (isId) {
    fallbackSlides.push({
      id: `slide-fb-1`,
      slide_number: 1,
      type: 'hook',
      badge: '🔥 Panduan Utama',
      stepBadge: 'OVERVIEW · 01',
      title: `${topic}: Strategi Ampuh Yang Jarang Dibahas`,
      highlightWord: 'Strategi Ampuh',
      body: 'Banyak orang menghabiskan waktu berjam-jam tanpa hasil optimal. Begini cara cerdas mengatasinya langkah demi langkah.',
      footer_hint: 'Geser ke kanan 👉',
      points: ['Efisiensi waktu 10x lebih cepat', 'Mudah diterapkan hari ini juga'],
      ctaButtonText: 'Baca Panduan Lengkap →',
    });

    for (let i = 2; i < count; i++) {
      const step = i - 1;
      fallbackSlides.push({
        id: `slide-fb-${i}`,
        slide_number: i,
        type: step % 2 === 0 ? 'bullet' : 'content',
        badge: `Langkah 0${step}`,
        stepBadge: `STEP 0${step} · EKSEKUSI`,
        title: `Pilar ${step}: Fokus Pada Eksekusi & Otomasi`,
        highlightWord: 'Eksekusi & Otomasi',
        body: `Kunci dari ${topic} ada pada konsistensi alur kerja. Singkirkan distraksi dan gunakan tools yang tepat.`,
        points: [
          'Gunakan framework yang terstruktur',
          'Otomatisasi proses yang berulang',
          'Ukur metrik perkembangan setiap minggu',
        ],
        codeSnippet: step === 1 ? `$ npx carouselx init\n$ npm run build\n✓ Setup completed in 120ms` : undefined,
        terminalTitle: step === 1 ? 'bash — setup' : undefined,
        tip: step === 2 ? '💡 Simpan prompt ini untuk pemakaian harian.' : undefined,
        footer_hint: 'Lanjut ke poin berikutnya 🚀',
      });
    }

    fallbackSlides.push({
      id: `slide-fb-${count}`,
      slide_number: count,
      type: 'cta',
      badge: '⚡ Kesimpulan & Aksi',
      stepBadge: 'YOU ARE ALL SET',
      title: 'Mulai Terapkan Sekarang Juga!',
      highlightWord: 'Terapkan Sekarang',
      body: 'Simpan postingan ini agar tidak lupa, dan bagikan ke teman kamu yang butuh insight ini.',
      footer_hint: 'Save & Share 📌',
      points: ['📌 Simpan untuk referensi nanti', '💬 Tulis pendapatmu di kolom komentar'],
      ctaButtonText: 'Simpan Panduan Ini 🔖',
    });
  } else {
    fallbackSlides.push({
      id: `slide-fb-1`,
      slide_number: 1,
      type: 'hook',
      badge: '🔥 Essential Blueprint',
      stepBadge: 'OVERVIEW · 01',
      title: `${topic}: The High-Impact Guide You Need`,
      highlightWord: 'High-Impact',
      body: 'Stop wasting hours doing things the hard way. Here is the exact framework to get 10x results effortlessly.',
      footer_hint: 'Swipe to learn 👉',
      points: ['Saves 15+ hours weekly', 'Actionable step-by-step framework'],
      ctaButtonText: 'Read Full Guide →',
    });

    for (let i = 2; i < count; i++) {
      const step = i - 1;
      fallbackSlides.push({
        id: `slide-fb-${i}`,
        slide_number: i,
        type: step % 2 === 0 ? 'bullet' : 'content',
        badge: `Step 0${step}`,
        stepBadge: `STEP 0${step} · WORKFLOW`,
        title: `Core Step ${step}: Streamline & Accelerate`,
        highlightWord: 'Accelerate',
        body: `Mastering ${topic} requires eliminating repetitive bottlenecks and setting up automated workflows.`,
        points: [
          'Audit your current friction points',
          'Implement the 80/20 rule to high-leverage tasks',
          'Track weekly milestones systematically',
        ],
        footer_hint: 'Next step ahead 🚀',
      });
    }

    fallbackSlides.push({
      id: `slide-fb-${count}`,
      slide_number: count,
      type: 'cta',
      badge: '⚡ Take Action',
      stepBadge: 'YOU ARE ALL SET',
      title: 'Ready To Level Up Your Game?',
      highlightWord: 'Level Up',
      body: 'Bookmark this carousel for quick reference and share your key takeaway in the comments.',
      footer_hint: 'Save & Bookmark 📌',
      points: ['📌 Save this for later', '💬 Drop your thoughts below'],
      ctaButtonText: 'Save this guide 🔖',
    });
  }

  return fallbackSlides;
}

// Fallback E-Book Generator
export function getFallbackEbook(topic: string, moduleCount: number = 4, language: string = 'Indonesian', authorName: string = 'Arijal Meutuwah'): EbookData {
  const count = Math.min(Math.max(moduleCount || 4, 3), 8);
  const modules: EbookModule[] = [];

  for (let i = 1; i <= count; i++) {
    modules.push({
      id: `modul-fb-${i}`,
      moduleNumber: i,
      badge: `Modul ${i}`,
      title: i === 1 ? `Fondasi & Strategi: ${topic}` : i === count ? `Monetisasi & Eksekusi Skala Besar` : `Pilar ${i}: Implementasi & Optimasi Alur Kerja`,
      description: `Panduan taktis modul ${i} untuk menguasai ${topic} dengan hasil terukur.`,
      introCard: {
        icon: i === 1 ? '🎯' : i === count ? '🚀' : '⚡',
        title: `Fokus Modul ${i}`,
        subtitle: `Prinsip Utama & Eksekusi Lapangan`,
        body: `Pelajari aspek kunci dalam ${topic} dan bagaimana mengeliminasi kesalahan umum para pemula.`,
        checklist: [
          `Menguasai alur kerja dasar secara mendalam`,
          `Menerapkan teknik otomatisasi hemat waktu`,
          `Membangun sistem yang konsisten dan berkelanjutan`,
        ],
      },
      steps: [
        {
          number: 1,
          title: 'Pemetaan Awal & Persiapan Sistem',
          text: 'Siapkan lingkungan kerja dan identifikasi parameter keberhasilan utama.',
        },
        {
          number: 2,
          title: 'Eksekusi Bertahap Tanpa Distraksi',
          text: 'Fokus pada satu tugas bernilai tinggi dan gunakan formula yang telah teruji.',
        },
        {
          number: 3,
          title: 'Evaluasi & Peningkatan Mutu',
          text: 'Ukur hasil setiap iterasi dan sempurnakan setiap detail yang kurang optimal.',
        },
      ],
      callouts: [
        {
          type: 'info',
          icon: '💡',
          title: 'Catatan Penting:',
          body: 'Konsistensi eksekusi mengalahkan kecepatan tanpa arah. Gunakan modul ini sebagai acuan berkala.',
        },
      ],
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

  // 2. OpenAI / Groq / OpenRouter / DeepSeek
  let endpoint = apiKeyConfig?.baseUrl || 'https://api.openai.com/v1';
  let defaultModel = 'gpt-4o-mini';

  if (provider === 'groq') {
    endpoint = apiKeyConfig?.baseUrl || 'https://api.groq.com/openai/v1';
    defaultModel = 'llama-3.1-8b-instant';
  } else if (provider === 'openrouter') {
    endpoint = apiKeyConfig?.baseUrl || 'https://openrouter.ai/api/v1';
    defaultModel = 'google/gemini-2.5-flash';
  } else if (provider === 'deepseek') {
    endpoint = apiKeyConfig?.baseUrl || 'https://api.deepseek.com/v1';
    defaultModel = 'deepseek-chat';
  }

  const cleanUrl = endpoint.replace(/\/+$/, '') + '/chat/completions';
  const res = await fetch(cleanUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: apiKeyConfig?.model || defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${provider.toUpperCase()} Error: ${errText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Empty response from ${provider}`);
  return content;
}

// Universal AI Generator for Carousels
export async function generateCarouselAI(params: {
  topic: string;
  sourceMaterial?: string;
  slideCount?: number;
  tone?: string;
  language?: string;
  authorName?: string;
  targetAudience?: string;
  apiKeyConfig?: ApiKeyConfig;
}): Promise<{ slides: Slide[]; isFallback: boolean; error?: string }> {
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

  const count = Math.min(Math.max(slideCount || 5, 3), 10);

  // 1. Try local or remote /api/generate-carousel FIRST (if available & returns JSON)
  try {
    const apiRes = await fetch('/api/generate-carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        sourceMaterial,
        slideCount: count,
        tone,
        language,
        authorName,
        targetAudience,
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
    // API endpoint not reachable or returned non-JSON, gracefully proceed to client-side
  }

  // 2. Direct Client-Side AI Generation
  const systemPrompt = `You are a world-class viral microblog carousel creator and copywriter for Instagram, LinkedIn, and Twitter.
You specialize in high-retention, high-value, visual slide carousels.

Rules:
- Slide 1 MUST be a high-conversion "Hook" slide with an irresistible, punchy title (4-8 words), a highlightWord, an engaging complete subheadline/body (15-25 words), and a clear prompt to swipe.
- Middle slides (${count - 2} slides) must deliver crisp, highly actionable, step-by-step value or bullet points. Include stepBadge (e.g. "STEP 01 · SETUP"), highlightWord, complete bullet points (2-3 concise, complete sentences), codeSnippet (if technical), and tip.
- The final slide (Slide ${count}) MUST be a high-converting "CTA" with stepBadge "YOU ARE ALL SET", a clear summary, ctaButtonText (e.g. "Simpan Panduan Ini 🔖" or "Full Guide Link di Bio →"), and footer_hint.
- ALL sentences, bullet points, and tips MUST be complete and coherent thoughts. Never truncate or leave sentences unfinished.
- Language requested: ${language}. Tone: ${tone}. Target audience: ${targetAudience}.
- Return strictly valid JSON object with the schema:
{
  "slides": [
    {
      "slide_number": 1,
      "type": "hook",
      "badge": "🔥 Rahasia Penting",
      "stepBadge": "OVERVIEW · 01",
      "title": "Title here",
      "highlightWord": "Word to highlight",
      "body": "Body text here",
      "points": ["point 1", "point 2"],
      "codeSnippet": "optional code or terminal command",
      "terminalTitle": "bash — setup",
      "tip": "optional actionable pro tip",
      "tag": "optional tag",
      "ctaButtonText": "Full setup inside →",
      "footer_hint": "Geser 👉"
    }
  ]
}`;

  let userPrompt = `Topic: "${topic}"\nTotal Slides needed: Exactly ${count} slides.\nCreator Name: "${authorName}".\n`;
  if (sourceMaterial) {
    userPrompt += `\nStudy and distill this Source Material deeply:\n${sourceMaterial.slice(0, 20000)}\n`;
  }
  userPrompt += '\nReturn strictly JSON now.';

  if (apiKeyConfig?.apiKey && apiKeyConfig.apiKey.trim().length > 5) {
    try {
      const raw = await callClientDirectAi({
        apiKeyConfig,
        systemPrompt,
        userPrompt,
      });
      const parsed = sanitizeAndParseJSON(raw);
      if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
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
        return { slides: formattedSlides, isFallback: false };
      }
    } catch (err: any) {
      console.warn('Direct Client AI failed, using fallback template:', err.message);
      return {
        slides: getFallbackCarousel(topic, count, language),
        isFallback: true,
        error: err.message,
      };
    }
  }

  // 3. Graceful Fallback if no API key is provided
  return {
    slides: getFallbackCarousel(topic, count, language),
    isFallback: true,
    error: 'API Key belum diisi. Menampilkan template standar.',
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

  if (apiKeyConfig?.apiKey && apiKeyConfig.apiKey.trim().length > 5) {
    try {
      const raw = await callClientDirectAi({ apiKeyConfig, systemPrompt, userPrompt });
      const parsed = sanitizeAndParseJSON(raw);
      if (parsed.ebook && Array.isArray(parsed.ebook.modules)) {
        return { ebook: parsed.ebook, isFallback: false };
      }
    } catch (err: any) {
      console.warn('Direct AI for E-book failed, using fallback:', err.message);
      return { ebook: getFallbackEbook(topic, count, language, authorName), isFallback: true, error: err.message };
    }
  }

  return {
    ebook: getFallbackEbook(topic, count, language, authorName),
    isFallback: true,
    error: 'API Key belum diisi. Menampilkan template standar.',
  };
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
