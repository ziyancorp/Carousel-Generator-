import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper: Universal AI caller (Gemini, OpenAI, Claude, DeepSeek, Groq, OpenRouter, Custom)
interface UniversalAiParams {
  provider?: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  systemPrompt: string;
  userPrompt: string;
  responseMimeType?: string;
}

async function callUniversalAi(params: UniversalAiParams): Promise<string> {
  const {
    provider = 'gemini',
    apiKey,
    model,
    baseUrl,
    systemPrompt,
    userPrompt,
  } = params;

  // 1. Google Gemini (Default)
  if (provider === 'gemini' || (!provider && (apiKey || process.env.GEMINI_API_KEY))) {
    const keyToUse = apiKey || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      throw new Error('Gemini API Key is required.');
    }
    const ai = new GoogleGenAI({ apiKey: keyToUse });
    const modelToUse = model || 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });
    return response.text || '{}';
  }

  // 2. Anthropic Claude
  if (provider === 'anthropic') {
    const keyToUse = apiKey;
    if (!keyToUse) throw new Error('Anthropic API Key is required.');
    const modelToUse = model || 'claude-3-7-sonnet-20250219';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': keyToUse,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: modelToUse,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Anthropic Error: ${errBody}`);
    }

    const data: any = await res.json();
    const contentBlock = data.content?.[0];
    return contentBlock?.text || '{}';
  }

  // 3. OpenAI / DeepSeek / Groq / OpenRouter / Custom OpenAI-compatible
  let targetUrl = baseUrl;
  let defaultModelName = 'gpt-4o';

  if (provider === 'deepseek') {
    targetUrl = targetUrl || 'https://api.deepseek.com/v1';
    defaultModelName = 'deepseek-chat';
  } else if (provider === 'groq') {
    targetUrl = targetUrl || 'https://api.groq.com/openai/v1';
    defaultModelName = 'llama-3.3-70b-versatile';
  } else if (provider === 'openrouter') {
    targetUrl = targetUrl || 'https://openrouter.ai/api/v1';
    defaultModelName = 'anthropic/claude-3.5-sonnet';
  } else if (provider === 'openai') {
    targetUrl = targetUrl || 'https://api.openai.com/v1';
    defaultModelName = 'gpt-4o';
  } else {
    // Custom / Local
    targetUrl = targetUrl || 'http://localhost:11434/v1';
    defaultModelName = model || 'llama3';
  }

  const endpoint = targetUrl.replace(/\/+$/, '') + '/chat/completions';
  const modelToUse = model || defaultModelName;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey || 'no-key'}`,
    },
    body: JSON.stringify({
      model: modelToUse,
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
    throw new Error(`AI Provider (${provider}) Error: ${errText}`);
  }

  const jsonResult: any = await res.json();
  const rawText = jsonResult.choices?.[0]?.message?.content || '{}';
  return rawText;
}

// API: Health & Config check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// API: Validate custom API key across all providers
app.post('/api/validate-key', async (req, res) => {
  try {
    const { provider = 'gemini', apiKey, model, baseUrl } = req.body;

    if (provider === 'gemini') {
      const keyToTest = apiKey || process.env.GEMINI_API_KEY;
      if (!keyToTest) {
        res.status(400).json({ valid: false, error: 'Gemini API Key is required' });
        return;
      }
      const testAi = new GoogleGenAI({ apiKey: keyToTest });
      const response = await testAi.models.generateContent({
        model: model || 'gemini-2.5-flash',
        contents: 'Respond with "OK"',
      });
      if (response.text) {
        res.json({ valid: true, message: 'Google Gemini connection active & verified!' });
      } else {
        res.status(400).json({ valid: false, error: 'No response from Gemini' });
      }
      return;
    }

    if (provider === 'anthropic') {
      if (!apiKey) {
        res.status(400).json({ valid: false, error: 'Anthropic API Key is required' });
        return;
      }
      const testRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-haiku-latest',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Say OK' }],
        }),
      });

      if (testRes.ok) {
        res.json({ valid: true, message: 'Anthropic Claude connection verified!' });
      } else {
        const err = await testRes.text();
        res.status(400).json({ valid: false, error: `Anthropic: ${err}` });
      }
      return;
    }

    // Generic OpenAI-compatible (OpenAI, DeepSeek, Groq, OpenRouter, Custom)
    let targetUrl = baseUrl;
    let defaultTestModel = 'gpt-4o-mini';
    if (provider === 'deepseek') {
      targetUrl = targetUrl || 'https://api.deepseek.com/v1';
      defaultTestModel = 'deepseek-chat';
    } else if (provider === 'groq') {
      targetUrl = targetUrl || 'https://api.groq.com/openai/v1';
      defaultTestModel = 'llama-3.1-8b-instant';
    } else if (provider === 'openrouter') {
      targetUrl = targetUrl || 'https://openrouter.ai/api/v1';
      defaultTestModel = 'google/gemini-2.5-flash';
    } else if (provider === 'openai') {
      targetUrl = targetUrl || 'https://api.openai.com/v1';
      defaultTestModel = 'gpt-4o-mini';
    } else {
      targetUrl = targetUrl || 'http://localhost:11434/v1';
      defaultTestModel = model || 'llama3';
    }

    const testEndpoint = targetUrl.replace(/\/+$/, '') + '/chat/completions';
    const testRes = await fetch(testEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey || ''}`,
      },
      body: JSON.stringify({
        model: model || defaultTestModel,
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 5,
      }),
    });

    if (testRes.ok) {
      res.json({ valid: true, message: `${provider.toUpperCase()} provider connected successfully!` });
    } else {
      const errText = await testRes.text();
      res.status(400).json({ valid: false, error: `${provider} Error: ${errText}` });
    }
  } catch (err: any) {
    res.status(400).json({ valid: false, error: err.message || 'Connection test failed' });
  }
});

// Helper: Fallback Carousel Generator
function getFallbackCarousel(topic: string, slideCount: number, language: string) {
  const isId = language.toLowerCase().includes('id') || language.toLowerCase().includes('indo');
  const count = Math.min(Math.max(slideCount || 5, 3), 10);

  const fallbackSlides = [];

  if (isId) {
    fallbackSlides.push({
      id: 'slide-1',
      slide_number: 1,
      type: 'hook',
      badge: '🔥 Rahasia Penting',
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
        id: `slide-${i}`,
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
      id: `slide-${count}`,
      slide_number: count,
      type: 'cta',
      badge: '⚡ Kesimpulan & Aksi',
      stepBadge: 'YOU ARE ALL SET',
      title: 'Mulai Terapkan Sekarang Juga!',
      highlightWord: 'Terapkan Sekarang',
      body: 'Simpan postingan ini agar tidak lupa, dan bagikan ke teman kamu yang butuh insight ini.',
      footer_hint: 'Save & Share 📌',
      points: ['📌 Simpan untuk referensi nanti', '💬 Tulis pendapatmu di kolom komentar'],
      ctaButtonText: 'Save this guide 🔖',
    });
  } else {
    fallbackSlides.push({
      id: 'slide-1',
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
        id: `slide-${i}`,
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
      id: `slide-${count}`,
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

// API: Generate structured carousel with Universal AI
app.post('/api/generate-carousel', async (req, res) => {
  try {
    const {
      topic,
      slideCount = 5,
      tone = 'santai dan engaging',
      language = 'Indonesian',
      authorName = '@creator',
      targetAudience = 'Content creators, professionals, and students',
      provider = 'gemini',
      apiKey,
      model,
      baseUrl,
    } = req.body;

    if (!topic || typeof topic !== 'string') {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    const count = Math.min(Math.max(parseInt(slideCount, 10) || 5, 3), 10);
    const customKey = (req.headers['x-gemini-key'] as string) || apiKey;

    const systemPrompt = `You are a world-class viral microblog carousel creator and copywriter for Instagram, LinkedIn, and Twitter.
You specialize in high-retention, high-value, visual slide carousels.

Rules:
- Slide 1 MUST be a high-conversion "Hook" slide with an irresistible, punchy title (max 7 words), a highlightWord, an engaging subheadline/body, and a clear prompt to swipe.
- Middle slides (${count - 2} slides) must deliver crisp, highly actionable, step-by-step value or bullet points. Include stepBadge (e.g. "STEP 01 · SETUP"), highlightWord, codeSnippet (if technical), and tip.
- The final slide (Slide ${count}) MUST be a high-converting "CTA" with stepBadge "YOU ARE ALL SET", ctaButtonText (e.g. "Full setup inside →" or "Save this guide 🔖"), and footer_hint.
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

    const userPrompt = `Topic: "${topic}"
Total Slides needed: Exactly ${count} slides.
Creator Name: "${authorName}".
Return JSON now.`;

    try {
      const rawJson = await callUniversalAi({
        provider,
        apiKey: customKey,
        model,
        baseUrl,
        systemPrompt,
        userPrompt,
      });

      const parsed = JSON.parse(rawJson);
      const formattedSlides = (parsed.slides || []).map((s: any, idx: number) => ({
        id: `slide-${Date.now()}-${idx}`,
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

      res.json({
        slides: formattedSlides.length > 0 ? formattedSlides : getFallbackCarousel(topic, count, language),
        isFallback: false,
      });
    } catch (aiErr: any) {
      console.warn('AI call failed, using high-quality fallback:', aiErr.message);
      const fallback = getFallbackCarousel(topic, count, language);
      res.json({
        slides: fallback,
        isFallback: true,
        error: aiErr.message,
      });
    }
  } catch (error: any) {
    console.error('Error in generate-carousel:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Generate complete multi-module E-Book with AI
app.post('/api/generate-ebook', async (req, res) => {
  try {
    const {
      topic = 'Rahasia Ngonten Tanpa Wajah',
      authorName = 'Creator Pro',
      moduleCount = 5,
      language = 'Indonesian',
      provider = 'gemini',
      apiKey,
      model,
      baseUrl,
    } = req.body;

    const systemPrompt = `You are a bestselling digital product author and ebook creator.
Your goal is to produce a structured, high-value, multi-module digital E-Book ready for publication on Lynk.id, Shopee, and Gumroad.

Return strictly valid JSON with this exact schema:
{
  "ebook": {
    "id": "ebook-ai-generated",
    "title": "UPPERCASE EBOOK TITLE",
    "tag": "PANDUAN RESMI ${authorName.toUpperCase()}",
    "subtitle": "Clear, compelling subtitle explaining what readers will master.",
    "difficulty": "Pemula (No-Code)",
    "platform": "AI Tools & Social Media",
    "monetization": "Lynk.id / Shopee / Digital Product",
    "format": "Responsive & Print PDF",
    "edition": "Edisi 2026 • Siap Jual",
    "author": "${authorName}",
    "modules": [
      {
        "id": "modul-1",
        "moduleNumber": 1,
        "badge": "Modul 1",
        "title": "Mindset & Fondasi",
        "description": "Short module summary",
        "introCard": {
          "icon": "🎭",
          "title": "Card Title",
          "subtitle": "Card Subtitle",
          "body": "Introductory problem & solution text",
          "checklist": [
            "Estetika Visual: Tajam dan sinematik",
            "Relevansi Konten: Jelas dan bermanfaat",
            "Konsistensi: Jadwal unggah teratur"
          ]
        },
        "steps": [
          { "number": 1, "title": "Langkah 1", "text": "Penjelasan praktis langkah 1" },
          { "number": 2, "title": "Langkah 2", "text": "Penjelasan praktis langkah 2" },
          { "number": 3, "title": "Langkah 3", "text": "Penjelasan praktis langkah 3" }
        ],
        "prompts": [
          {
            "tag": "Master Prompt: Kategori (Vibe)",
            "content": "Full detailed copyable prompt with lens, camera, lighting, skin texture, 8k resolution details..."
          }
        ],
        "callouts": [
          {
            "type": "info",
            "icon": "💡",
            "title": "Rahasia Alur Kerja Tercepat:",
            "body": "Tips praktis untuk menghemat waktu."
          }
        ]
      }
    ]
  }
}`;

    const userPrompt = `Create a comprehensive ${moduleCount}-module E-Book about: "${topic}".
Include realistic steps, copyable master prompts, checklists, and actionable insights.`;

    try {
      const raw = await callUniversalAi({
        provider,
        apiKey,
        model,
        baseUrl,
        systemPrompt,
        userPrompt,
      });

      const parsed = JSON.parse(raw);
      if (parsed.ebook) {
        res.json({ ebook: parsed.ebook });
      } else {
        res.status(500).json({ error: 'Failed to format ebook JSON' });
      }
    } catch (err: any) {
      console.error('Error generating ebook:', err);
      res.status(500).json({ error: err.message });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Convert raw content / draft into structured carousel
app.post('/api/structure-content', async (req, res) => {
  try {
    const {
      rawContent,
      slideCount = 5,
      tone = 'santai dan engaging',
      language = 'Indonesian',
      authorName = '@creator',
      provider = 'gemini',
      apiKey,
      model,
      baseUrl,
    } = req.body;

    if (!rawContent || typeof rawContent !== 'string') {
      res.status(400).json({ error: 'Raw content text is required' });
      return;
    }

    const count = Math.min(Math.max(parseInt(slideCount, 10) || 5, 3), 10);

    const systemPrompt = `You are a social media carousel ghostwriter and summarizer.
Your goal is to parse the user's raw written content or draft notes, extract the core arguments, and restructure them into exactly ${count} carousel slides.
Return strictly JSON with key "slides" array.`;

    const userPrompt = `Raw Content:\n${rawContent}\n\nRestructure into ${count} slides now.`;

    try {
      const raw = await callUniversalAi({
        provider,
        apiKey,
        model,
        baseUrl,
        systemPrompt,
        userPrompt,
      });

      const parsed = JSON.parse(raw);
      const formatted = (parsed.slides || []).map((s: any, idx: number) => ({
        id: `slide-struct-${Date.now()}-${idx}`,
        slide_number: idx + 1,
        type: s.type || (idx === 0 ? 'hook' : idx === parsed.slides.length - 1 ? 'cta' : 'content'),
        badge: s.badge || (idx === 0 ? '🔥 Hook' : idx === parsed.slides.length - 1 ? '📌 Summary' : `Point 0${idx}`),
        title: s.title || `Slide ${idx + 1}`,
        body: s.body || '',
        points: Array.isArray(s.points) ? s.points : [],
        statValue: s.statValue || undefined,
        footer_hint: s.footer_hint || (idx === parsed.slides.length - 1 ? 'Save & Share 📌' : 'Swipe 👉'),
      }));

      res.json({ slides: formatted, isFallback: false });
    } catch {
      const lines = rawContent.split('\n').filter((l: string) => l.trim().length > 0);
      const firstLine = lines[0] || 'High Impact Guide';
      const fallback = getFallbackCarousel(firstLine.slice(0, 50), count, language);
      res.json({ slides: fallback, isFallback: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite / static middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CarouselX & E-Book Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
