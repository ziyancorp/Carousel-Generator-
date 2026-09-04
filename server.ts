import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { PDFParse } from 'pdf-parse';

dotenv.config();

export const DEFAULT_XKIRO_KEY = 'sk-xt-8fd3f1a5a7eb83a731221b06da8d3fe796031252d6a50f55bd8432b610c1448b';
export const DEFAULT_XKIRO_MODEL = 'deepseek/deepseek-chat-v3.1';
export const DEFAULT_XKIRO_BASE_URL = 'https://api.xkiro.com/v1';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Helper: Sanitize & parse JSON from AI outputs
function sanitizeAndParseJSON(rawStr: string): any {
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
    provider = 'xkiro',
    apiKey,
    model,
    baseUrl,
    systemPrompt,
    userPrompt,
  } = params;

  // Helper for Google Gemini execution
  const runGemini = async (overrideModel?: string) => {
    // Collect candidate keys in priority order: user custom key (if provided) -> process.env.GEMINI_API_KEY
    const candidateKeys: string[] = [];
    if (apiKey && apiKey.trim() && apiKey.trim().length > 10) {
      candidateKeys.push(apiKey.trim());
    }
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() && !candidateKeys.includes(process.env.GEMINI_API_KEY.trim())) {
      candidateKeys.push(process.env.GEMINI_API_KEY.trim());
    }

    if (candidateKeys.length === 0) {
      throw new Error('Gemini API Key is required. Please provide a valid API key in settings.');
    }

    const candidateModels = overrideModel ? [overrideModel] : [model || 'gemini-2.5-flash', 'gemini-3.7-flash', 'gemini-2.0-flash'];
    let lastError: any = null;

    for (const keyToUse of candidateKeys) {
      for (const m of candidateModels) {
        try {
          const ai = new GoogleGenAI({
            apiKey: keyToUse,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });
          const response = await ai.models.generateContent({
            model: m,
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
            },
          });
          if (response && response.text) {
            return response.text;
          }
        } catch (err: any) {
          lastError = err;
          // If this key is specifically invalid/disabled, stop trying this key and switch to the next key
          const errMsg = err?.message || '';
          if (
            errMsg.includes('API key not valid') ||
            errMsg.includes('API_KEY_INVALID') ||
            errMsg.includes('Invalid or disabled') ||
            errMsg.includes('400')
          ) {
            break;
          }
        }
      }
    }

    throw new Error(`Semua model AI sedang sibuk atau API key tidak valid. Detail: ${lastError?.message || 'Unavailable'}`);
  };

  // 1. Google Gemini (Default)
  if (provider === 'gemini' || (!provider && (apiKey || process.env.GEMINI_API_KEY))) {
    return await runGemini();
  }

  // 2. Anthropic Claude
  if (provider === 'anthropic') {
    const keyToUse = apiKey;
    if (!keyToUse) {
      if (process.env.GEMINI_API_KEY) return await runGemini();
      throw new Error('Anthropic API Key is required.');
    }
    const modelToUse = model || 'claude-3-7-sonnet-20250219';
    try {
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
        console.warn(`Anthropic provider error: ${errBody}. Falling back to Gemini...`);
        if (process.env.GEMINI_API_KEY) return await runGemini();
        throw new Error(`Anthropic Error: ${errBody}`);
      }

      const data: any = await res.json();
      const contentBlock = data.content?.[0];
      return contentBlock?.text || '{}';
    } catch (anthropicErr: any) {
      if (process.env.GEMINI_API_KEY) {
        console.warn(`Anthropic failed (${anthropicErr.message}), falling back to Gemini`);
        return await runGemini();
      }
      throw anthropicErr;
    }
  }

  // 3. OpenAI / DeepSeek / Groq / OpenRouter / xKiro / Custom OpenAI-compatible
  let targetUrl = baseUrl;
  let defaultModelName = 'gpt-4o';

  if (provider === 'deepseek') {
    targetUrl = targetUrl || 'https://api.deepseek.com/v1';
    defaultModelName = 'deepseek-chat';
  } else if (provider === 'xkiro') {
    targetUrl = targetUrl || DEFAULT_XKIRO_BASE_URL;
    defaultModelName = DEFAULT_XKIRO_MODEL;
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
  const keyToUse = apiKey && apiKey.trim().length > 5 
    ? apiKey.trim() 
    : (provider === 'xkiro' ? (process.env.XKIRO_API_KEY || DEFAULT_XKIRO_KEY) : (apiKey || 'no-key'));

  const doChatFetch = async (targetModel: string) => {
    return await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Authorization: `Bearer ${keyToUse}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });
  };

  try {
    let res = await doChatFetch(modelToUse);

    // If xkiro returned 403 (e.g. model restricted to paying users) and target model is not deepseek-chat-v3.1, fallback to verified deepseek-chat-v3.1
    if (!res.ok && provider === 'xkiro' && modelToUse !== DEFAULT_XKIRO_MODEL) {
      console.warn(`xKiro model "${modelToUse}" failed with HTTP ${res.status}. Falling back to verified ${DEFAULT_XKIRO_MODEL}...`);
      res = await doChatFetch(DEFAULT_XKIRO_MODEL);
    }

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`AI Provider (${provider}) Error (${res.status}): ${errText}. Seamlessly falling back to Google Gemini...`);
      if (process.env.GEMINI_API_KEY) {
        return await runGemini();
      }
      throw new Error(`AI Provider (${provider}) Error: ${errText}`);
    }

    const jsonResult: any = await res.json();
    const rawText = jsonResult.choices?.[0]?.message?.content || '{}';
    return rawText;
  } catch (providerErr: any) {
    if (process.env.GEMINI_API_KEY) {
      console.warn(`Provider ${provider} failed (${providerErr.message}). Seamlessly running with Gemini fallback...`);
      return await runGemini();
    }
    throw providerErr;
  }
}

// ----------------------------------------------------
// MULTI-SOURCE INGESTION HELPERS
// ----------------------------------------------------

import { YoutubeTranscript } from 'youtube-transcript';

// ----------------------------------------------------
// YouTube Transcript & Subtitle Extraction Engine
// ----------------------------------------------------

function extractYouTubeVideoId(input: string): string | null {
  const cleanInput = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanInput)) {
    return cleanInput;
  }
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = cleanInput.match(regExp);
  return match ? match[1] : null;
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}

// Fetch authentic metadata (Title, Channel Name, Description) directly from YouTube oEmbed / watch page
async function fetchYouTubeVideoInfo(videoId: string): Promise<{ title: string; channelName: string; description?: string }> {
  try {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (oembedRes.ok) {
      const oembedData: any = await oembedRes.json();
      return {
        title: oembedData.title || `YouTube Video (${videoId})`,
        channelName: oembedData.author_name || 'YouTube Creator',
      };
    }
  } catch (err) {
    // continue to fallback
  }

  return {
    title: `YouTube Video (${videoId})`,
    channelName: 'YouTube Creator',
  };
}

async function fetchYouTubeTranscriptDirect(videoId: string): Promise<{ title: string; text: string; channelName?: string }> {
  const videoInfo = await fetchYouTubeVideoInfo(videoId);
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const pageRes = await fetch(watchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  });

  if (!pageRes.ok) {
    throw new Error(`Gagal membuka halaman video YouTube (HTTP ${pageRes.status})`);
  }

  const html = await pageRes.text();

  // Extract Title from HTML if better
  let title = videoInfo.title;
  const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/i) || html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].replace(' - YouTube', '').trim();
  }

  // Extract Channel Name
  let channelName = videoInfo.channelName;
  const channelMatch = html.match(/"ownerChannelName":"([^"]+)"/) || html.match(/"author":"([^"]+)"/);
  if (channelMatch && channelMatch[1]) {
    channelName = channelMatch[1];
  }

  // Find caption tracks inside ytInitialPlayerResponse or playerCaptionsTracklistRenderer
  const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
  if (!captionMatch || !captionMatch[1]) {
    throw new Error('Video ini tidak memiliki caption track langsung di HTML.');
  }

  let captionTracks: any[] = [];
  try {
    captionTracks = JSON.parse(captionMatch[1]);
  } catch {
    throw new Error('Gagal mem-parsing track subtitle.');
  }

  if (!captionTracks || captionTracks.length === 0) {
    throw new Error('Trek subtitle kosong.');
  }

  // Prefer Indonesian ('id', 'in'), then English ('en'), then first available
  const selectedTrack =
    captionTracks.find((t: any) => t.languageCode === 'id' || t.languageCode === 'in' || t.vssId?.includes('.id')) ||
    captionTracks.find((t: any) => t.languageCode === 'en' || t.languageCode?.startsWith('en')) ||
    captionTracks[0];

  const transcriptUrl = selectedTrack.baseUrl;
  if (!transcriptUrl) {
    throw new Error('URL transkrip tidak ditemukan pada caption track.');
  }

  // Fetch transcript XML / JSON
  const transcriptRes = await fetch(transcriptUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!transcriptRes.ok) {
    throw new Error(`Gagal mengunduh teks transkrip (${transcriptRes.status})`);
  }

  const transcriptXml = await transcriptRes.text();
  const textMatches = Array.from(transcriptXml.matchAll(/<text[^>]*>(.*?)<\/text>/gi));
  if (textMatches.length === 0) {
    throw new Error('Data transkrip XML tidak berisi elemen teks.');
  }

  const cleanedLines: string[] = [];
  for (const match of textMatches) {
    const rawText = match[1] || '';
    const decoded = decodeXmlEntities(rawText).trim();
    if (decoded && !decoded.startsWith('[') && !decoded.endsWith(']')) {
      cleanedLines.push(decoded);
    }
  }

  const fullText = cleanedLines.join(' ');
  return {
    title,
    text: fullText,
    channelName,
  };
}

async function fetchYouTubeTranscriptViaService(videoId: string): Promise<{ title: string; text: string; channelName?: string }> {
  const videoInfo = await fetchYouTubeVideoInfo(videoId);

  // Strategy 1: Dedicated youtube-transcript library
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'id',
    }).catch(async () => {
      return await YoutubeTranscript.fetchTranscript(videoId);
    });

    if (transcriptItems && transcriptItems.length > 0) {
      const fullText = transcriptItems
        .map((item) => decodeXmlEntities(item.text || '').trim())
        .filter((t) => t && !t.startsWith('[') && !t.endsWith(']'))
        .join(' ');

      if (fullText.length > 30) {
        return {
          title: videoInfo.title,
          text: fullText,
          channelName: videoInfo.channelName,
        };
      }
    }
  } catch (libErr: any) {
    console.warn(`youtube-transcript package attempt failed: ${libErr.message}`);
  }

  // Strategy 2: Direct YouTube internal transcript extraction
  try {
    const directRes = await fetchYouTubeTranscriptDirect(videoId);
    if (directRes && directRes.text && directRes.text.length > 30) {
      return directRes;
    }
  } catch (directErr: any) {
    console.warn(`Direct YouTube transcript attempt: ${directErr.message}`);
  }

  // Strategy 3: youtube-transcript.ai MCP / API endpoint
  try {
    const serviceRes = await fetch(`https://youtube-transcript.ai/api/transcript?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
      },
    });

    if (serviceRes.ok) {
      const data: any = await serviceRes.json();
      let text = '';
      if (typeof data.transcript === 'string') {
        text = data.transcript;
      } else if (Array.isArray(data.transcript)) {
        text = data.transcript.map((item: any) => item.text || item).join(' ');
      } else if (typeof data.text === 'string') {
        text = data.text;
      }

      if (text && text.trim().length > 20) {
        return {
          title: data.title || videoInfo.title,
          text: text.trim(),
          channelName: data.channelName || data.channel || videoInfo.channelName,
        };
      }
    }
  } catch (err: any) {
    console.warn(`youtube-transcript.ai attempt: ${err.message}`);
  }

  // Strategy 4: Public Subtitle Mirror
  try {
    const mirrorRes = await fetch(`https://subtitles-for-youtube.com/api/transcript?videoId=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    if (mirrorRes.ok) {
      const mirrorData: any = await mirrorRes.json();
      if (mirrorData && mirrorData.text && mirrorData.text.length > 30) {
        return {
          title: mirrorData.title || videoInfo.title,
          text: mirrorData.text.trim(),
          channelName: mirrorData.channel || videoInfo.channelName,
        };
      }
    }
  } catch (mirrorErr: any) {
    // Ignore and proceed
  }

  throw new Error('Video YouTube ini tidak menyediakan subtitle atau closed-caption (CC) publik yang dapat diekstrak.');
}

// Ingest YouTube Transcript endpoint
app.post('/api/ingest/youtube', async (req, res) => {
  try {
    const { url, apiKey, provider, model } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'YouTube URL or Video ID is required' });
      return;
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      res.status(400).json({ error: 'Format link YouTube tidak valid. Silakan masukkan link yang valid (contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/...)' });
      return;
    }

    let transcriptResult: { title: string; text: string; channelName?: string; isExtractedFromCaptions?: boolean };

    try {
      const extracted = await fetchYouTubeTranscriptViaService(videoId);
      transcriptResult = {
        ...extracted,
        isExtractedFromCaptions: true,
      };
    } catch (fetchErr: any) {
      // Video doesn't have closed captions; retrieve real metadata to prevent blind hallucination
      const videoInfo = await fetchYouTubeVideoInfo(videoId);
      const prompt = `Informasi Video YouTube yang dianalisis:
- Judul Video: "${videoInfo.title}"
- Nama Channel / Pembuat: "${videoInfo.channelName}"
- Video ID: "${videoId}"
- URL: "https://www.youtube.com/watch?v=${videoId}"

Tugas:
Susun ringkasan materi, kerangka pembahasan utama, dan panduan edukatif terstruktur berdasarkan topik dan judul video "${videoInfo.title}" oleh ${videoInfo.channelName} dalam Bahasa Indonesia.
Rangkum konsep kunci, langkah-langkah praktis, dan poin pembelajaran utama yang relevan dengan topik ini secara kredibel.

Kembalikan format JSON:
{
  "title": "${videoInfo.title}",
  "channelName": "${videoInfo.channelName}",
  "text": "Ringkasan konsep mendalam dan materi edukatif video...",
  "keyTakeaways": ["poin 1", "poin 2", "poin 3"]
}`;

      let aiText = '{}';
      try {
        aiText = await callUniversalAi({
          provider,
          apiKey,
          model,
          systemPrompt: 'Anda adalah asisten kurasi konten profesional. Balas selalu dalam format JSON.',
          userPrompt: prompt,
          responseMimeType: 'application/json',
        });
      } catch (aiErr: any) {
        // Ultimate resilient fallback if all AI fails
        aiText = JSON.stringify({
          title: videoInfo.title,
          channelName: videoInfo.channelName,
          text: `Materi video: "${videoInfo.title}" oleh ${videoInfo.channelName}.\n\nVideo ini belum menyediakan subtitle publik otomatis. Anda dapat langsung mengedit catatan atau menambahkan poin-poin materi video di kolom di bawah ini.`,
          keyTakeaways: [`Topik: ${videoInfo.title}`],
        });
      }

      let parsed: any = {};
      try {
        parsed = sanitizeAndParseJSON(aiText);
      } catch {
        parsed = {
          title: videoInfo.title,
          channelName: videoInfo.channelName,
          text: `Materi video: "${videoInfo.title}" oleh ${videoInfo.channelName}.\n\nSilakan lengkapi atau sesuaikan naskah materi video ini.`,
          keyTakeaways: [],
        };
      }

      transcriptResult = {
        title: videoInfo.title || parsed.title || `YouTube Video (${videoId})`,
        text: parsed.text || `Materi video: ${videoInfo.title}`,
        channelName: videoInfo.channelName || parsed.channelName || 'YouTube Creator',
        isExtractedFromCaptions: false,
      };
    }

    const words = transcriptResult.text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    res.json({
      success: true,
      videoId,
      title: transcriptResult.title,
      channelName: transcriptResult.channelName,
      text: transcriptResult.text,
      isExtractedFromCaptions: transcriptResult.isExtractedFromCaptions,
      wordCount,
      sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    });
  } catch (error: any) {
    console.error('Error ingesting YouTube:', error);
    res.status(500).json({ error: error.message || 'Failed to extract YouTube transcript' });
  }
});

// Ingest Web Article endpoint
app.post('/api/ingest/web', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'Valid Website or Article URL is required' });
      return;
    }

    const cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      res.status(400).json({ error: 'URL must start with http:// or https://' });
      return;
    }

    let title = 'Web Article';
    let fullText = '';

    try {
      const webRes = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (webRes.ok) {
        const html = await webRes.text();
        const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/i);
        const docTitle = html.match(/<title>(.*?)<\/title>/i);
        if (ogTitle && ogTitle[1]) {
          title = decodeXmlEntities(ogTitle[1]);
        } else if (docTitle && docTitle[1]) {
          title = decodeXmlEntities(docTitle[1]);
        }

        const cleaned = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
          .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
          .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');

        const textMatches = Array.from(cleaned.matchAll(/<(?:p|h1|h2|h3|h4|li|blockquote)[^>]*>(.*?)<\/(?:p|h1|h2|h3|h4|li|blockquote)>/gi));
        const extractedParagraphs: string[] = [];

        for (const match of textMatches) {
          const stripped = match[1].replace(/<[^>]+>/g, '').trim();
          const decoded = decodeXmlEntities(stripped);
          if (decoded.length > 20) {
            extractedParagraphs.push(decoded);
          }
        }

        fullText = extractedParagraphs.join('\n\n');
        if (!fullText || fullText.length < 100) {
          fullText = cleaned
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
      }
    } catch (scrapeErr: any) {
      console.warn(`Direct web scrape failed: ${scrapeErr.message}. Trying Jina Reader...`);
    }

    // High-reliability fallback: Jina Reader API
    if (!fullText || fullText.length < 100) {
      try {
        const jinaRes = await fetch(`https://r.jina.ai/${cleanUrl}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        if (jinaRes.ok) {
          const jinaText = await jinaRes.text();
          if (jinaText && jinaText.length > 50) {
            const jinaTitleMatch = jinaText.match(/Title:\s*(.+)/i);
            if (jinaTitleMatch && jinaTitleMatch[1]) {
              title = jinaTitleMatch[1].trim();
            }
            fullText = jinaText.replace(/^Title:.*?\n/i, '').replace(/^URL Source:.*?\n/i, '').trim();
          }
        }
      } catch (jinaErr: any) {
        console.warn(`Jina reader failed: ${jinaErr.message}`);
      }
    }

    if (!fullText || fullText.length < 30) {
      throw new Error('Gagal mengekstrak isi teks dari URL ini. Silakan salin naskah langsung ke kolom input.');
    }

    const words = fullText.split(/\s+/).filter(Boolean);

    res.json({
      success: true,
      title,
      sourceUrl: cleanUrl,
      text: fullText.slice(0, 40000),
      wordCount: words.length,
    });
  } catch (error: any) {
    console.error('Error ingesting Web URL:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch and parse website content' });
  }
});

// Ingest PDF / Document endpoint
app.post('/api/ingest/pdf', async (req, res) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data || typeof base64Data !== 'string') {
      res.status(400).json({ error: 'Base64 file data is required' });
      return;
    }

    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo().catch(() => null);
    await parser.destroy().catch(() => {});

    const rawText = (textResult.text || '').trim();
    const words = rawText.split(/\s+/).filter(Boolean);

    let docTitle = (fileName || 'Uploaded PDF Document').replace(/\.pdf$/i, '');
    if (infoResult && (infoResult as any).info?.Title) {
      docTitle = (infoResult as any).info.Title;
    }

    res.json({
      success: true,
      title: docTitle,
      fileName: fileName || 'document.pdf',
      text: rawText,
      pageCount: textResult.pages?.length || 1,
      wordCount: words.length,
    });
  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    res.status(500).json({ error: error.message || 'Failed to parse PDF document' });
  }
});

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
        model: model || 'gemini-3.7-flash',
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
    } else if (provider === 'xkiro') {
      targetUrl = targetUrl || 'https://api.xkiro.com/v1';
      defaultTestModel = 'qwen/qwen3.8-max:free';
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

// Helper: Fallback Carousel Generator (Extracts from real material if provided)
function getFallbackCarousel(topic: string, slideCount: number, language: string, sourceMaterial?: string) {
  const isId = language.toLowerCase().includes('id') || language.toLowerCase().includes('indo');
  const count = Math.min(Math.max(slideCount || 5, 3), 10);

  // Parse real material chunks if provided
  let chunks: string[] = [];
  if (sourceMaterial && sourceMaterial.trim().length > 15) {
    chunks = sourceMaterial
      .split(/\n+/)
      .map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter((l) => l.length > 10);
  }

  const effectiveTitle = topic || (chunks[0] ? chunks[0].slice(0, 60) : 'Panduan Ringkas Praktis');
  const fallbackSlides = [];

  if (isId) {
    fallbackSlides.push({
      id: 'slide-1',
      slide_number: 1,
      type: 'hook',
      badge: '🔥 Materi Utama',
      stepBadge: 'OVERVIEW · 01',
      title: effectiveTitle,
      highlightWord: effectiveTitle.split(' ')[0] || 'Panduan',
      body: chunks[1] || 'Berikut adalah rangkuman poin inti dan pembelajaran penting yang disarikan langsung dari materi sumber.',
      footer_hint: 'Geser ke kanan 👉',
      points: [
        chunks[2] ? chunks[2].slice(0, 60) : 'Poin penting disarikan dari naskah',
        chunks[3] ? chunks[3].slice(0, 60) : 'Langkah praktis siap terapkan',
      ],
      ctaButtonText: 'Baca Panduan Lengkap →',
    });

    for (let i = 2; i < count; i++) {
      const step = i - 1;
      const chunkIdx = 3 + (step - 1) * 2;
      const pointA = chunks[chunkIdx] || `Langkah penting ke-${step} dari materi`;
      const pointB = chunks[chunkIdx + 1] || 'Implementasi terarah dan terukur';
      fallbackSlides.push({
        id: `slide-${i}`,
        slide_number: i,
        type: step % 2 === 0 ? 'bullet' : 'content',
        badge: `Poin 0${step}`,
        stepBadge: `STEP 0${step} · MATERI`,
        title: chunks[chunkIdx] ? chunks[chunkIdx].slice(0, 45) : `Pembahasan Poin ${step}`,
        highlightWord: `Poin ${step}`,
        body: chunks[chunkIdx] || `Rincian konsep dan langkah pembahasan penting ke-${step} dari materi sumber.`,
        points: [pointA.slice(0, 70), pointB.slice(0, 70)],
        footer_hint: 'Lanjut ke poin berikutnya 🚀',
      });
    }

    fallbackSlides.push({
      id: `slide-${count}`,
      slide_number: count,
      type: 'cta',
      badge: '⚡ Kesimpulan & Aksi',
      stepBadge: 'YOU ARE ALL SET',
      title: 'Mulai Terapkan Insight Ini!',
      highlightWord: 'Terapkan Insight',
      body: 'Simpan ringkasan materi ini agar tidak hilang, dan bagikan ke kolega yang membutuhkan.',
      footer_hint: 'Save & Share 📌',
      points: ['📌 Simpan untuk referensi nanti', '💬 Tulis pendapatmu di kolom komentar'],
      ctaButtonText: 'Simpan Panduan Ini 🔖',
    });
  } else {
    fallbackSlides.push({
      id: 'slide-1',
      slide_number: 1,
      type: 'hook',
      badge: '🔥 Essential Blueprint',
      stepBadge: 'OVERVIEW · 01',
      title: effectiveTitle,
      highlightWord: 'Core Guide',
      body: chunks[1] || 'Here is the key synthesis distilled directly from your source material.',
      footer_hint: 'Swipe to learn 👉',
      points: [
        chunks[2] ? chunks[2].slice(0, 60) : 'Extracted core insight',
        chunks[3] ? chunks[3].slice(0, 60) : 'Actionable implementation',
      ],
      ctaButtonText: 'Read Full Guide →',
    });

    for (let i = 2; i < count; i++) {
      const step = i - 1;
      const chunkIdx = 3 + (step - 1) * 2;
      fallbackSlides.push({
        id: `slide-${i}`,
        slide_number: i,
        type: step % 2 === 0 ? 'bullet' : 'content',
        badge: `Step 0${step}`,
        stepBadge: `STEP 0${step} · ACTION`,
        title: chunks[chunkIdx] ? chunks[chunkIdx].slice(0, 45) : `Core Concept ${step}`,
        highlightWord: `Step ${step}`,
        body: chunks[chunkIdx] || `Synthesized key takeaway and execution steps for module ${step}.`,
        points: [
          (chunks[chunkIdx] || 'Execute structured action').slice(0, 70),
          (chunks[chunkIdx + 1] || 'Measure consistent progress').slice(0, 70),
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
      sourceMaterial,
      slideCount = 5,
      tone = 'santai dan engaging',
      language = 'Indonesian',
      authorName = '@creator',
      targetAudience = 'Content creators, professionals, and students',
      provider = 'xkiro',
      apiKey,
      model,
      baseUrl,
    } = req.body;

    let finalTopic = (topic || '').trim();
    if (!finalTopic && sourceMaterial) {
      const firstLine = sourceMaterial.trim().split('\n')[0].replace(/[#*_-]/g, '').trim();
      finalTopic = firstLine.slice(0, 80) || 'Ringkasan Materi';
    }

    if (!finalTopic && !sourceMaterial) {
      res.status(400).json({ error: 'Materi sumber atau topik diperlukan.' });
      return;
    }

    const count = Math.min(Math.max(parseInt(slideCount, 10) || 5, 3), 10);
    const customKey = (req.headers['x-gemini-key'] as string) || apiKey;

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
      userPrompt += `\nTOPIK MATERI: "${finalTopic}"\n`;
    }
    userPrompt += '\nEkstrak seluruh poin penting dari materi sumber di atas sekarang dalam format JSON.';

    try {
      const rawJson = await callUniversalAi({
        provider,
        apiKey: customKey,
        model,
        baseUrl,
        systemPrompt,
        userPrompt,
      });

      const parsed = sanitizeAndParseJSON(rawJson);
      const outputTopic = parsed.topic || finalTopic;
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
        topic: outputTopic,
        slides: formattedSlides.length > 0 ? formattedSlides : getFallbackCarousel(outputTopic, count, language, sourceMaterial),
        isFallback: false,
      });
    } catch (aiErr: any) {
      console.warn('AI call failed, using high-quality material fallback:', aiErr.message);
      const fallback = getFallbackCarousel(finalTopic, count, language, sourceMaterial);
      res.json({
        topic: finalTopic,
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

// API: Generate complete multi-module E-Book with AI from Ingested Material or Topic
app.post('/api/generate-ebook', async (req, res) => {
  try {
    const {
      topic,
      sourceText,
      sourceType,
      sourceTitle,
      authorName = 'Arijal Meutuwah',
      moduleCount = 5,
      language = 'Indonesian',
      provider = 'xkiro',
      apiKey,
      model,
      baseUrl,
    } = req.body;

    let finalTopic = (topic || sourceTitle || '').trim();
    if (!finalTopic && sourceText) {
      const firstLine = sourceText.trim().split('\n')[0].replace(/[#*_-]/g, '').trim();
      finalTopic = firstLine.slice(0, 80) || 'Master E-Book Panduan Praktis';
    }
    finalTopic = finalTopic || 'Master E-Book Panduan Praktis';

    const count = Math.min(Math.max(parseInt(moduleCount, 10) || 5, 3), 8);

    const systemPrompt = `You are a bestselling digital product author, educator, and master curriculum architect.
Your task is to ingest and synthesize the provided source material (which may come from a YouTube transcript, web article, uploaded PDF document, or user notes) and build a comprehensive, highly valuable, multi-module digital E-Book ready for reading and monetization (Lynk.id, Shopee, Gumroad).

Rules:
1. Deeply study the source material and structure the E-Book logically into exactly ${count} progressive modules (e.g. Modul 1: Fondasi/Mindset, Modul 2-4: Core Methods & Step-by-step Framework, Modul 5: Action Plan/Monetisasi).
2. Each module MUST include:
   - "title" & "description"
   - "introCard" with icon (emoji), title, subtitle, body, and checklist of 3-4 key takeaways.
   - "steps": 3 concrete actionable steps.
   - "prompts": 1-2 copyable prompt templates or master code snippets relevant to that module.
   - "callouts": 1 actionable pro tip or warning.
3. Tone: Educational, authoritative, empowering, highly practical.
4. Return strictly valid JSON with this exact schema:
{
  "ebook": {
    "id": "ebook-${Date.now()}",
    "title": "UPPERCASE TITLE",
    "tag": "PANDUAN RESMI ${authorName.toUpperCase()}",
    "subtitle": "Compelling subtitle explaining what readers will master.",
    "difficulty": "Pemula s/d Menengah",
    "platform": "Multi-Platform & AI Ecosystem",
    "monetization": "Lynk.id / Shopee / Digital Asset",
    "format": "Responsive & Print PDF",
    "edition": "Edisi 2026 • Master Guide",
    "author": "${authorName}",
    "modules": [
      {
        "id": "modul-1",
        "moduleNumber": 1,
        "badge": "Modul 1",
        "title": "Module Title",
        "description": "Short module summary",
        "introCard": {
          "icon": "📘",
          "title": "Card Title",
          "subtitle": "Card Subtitle",
          "body": "Introductory problem & solution text",
          "checklist": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
        },
        "steps": [
          { "number": 1, "title": "Langkah 1", "text": "Explanation" },
          { "number": 2, "title": "Langkah 2", "text": "Explanation" },
          { "number": 3, "title": "Langkah 3", "text": "Explanation" }
        ],
        "prompts": [
          {
            "tag": "Master Prompt: Kategori (Format)",
            "content": "Full detailed prompt or snippet..."
          }
        ],
        "callouts": [
          {
            "type": "info",
            "icon": "💡",
            "title": "Pro Tip:",
            "body": "Actionable advice."
          }
        ]
      }
    ]
  }
}`;

    let userPrompt = `Topic / Goal: "${topic}"\nAuthor: "${authorName}"\nModules needed: Exactly ${count} modules.\nLanguage: ${language}\n`;

    if (sourceText && typeof sourceText === 'string' && sourceText.trim().length > 0) {
      userPrompt += `\n================== SOURCE MATERIAL (${sourceType || 'Ingested Content'}): "${sourceTitle || topic}" ==================\n${sourceText.slice(0, 30000)}\n=======================================================\nSynthesize all key lessons from this material into the E-Book modules.\n`;
    }

    userPrompt += '\nReturn strictly JSON now.';

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
        res.status(500).json({ error: 'Failed to format ebook JSON structure' });
      }
    } catch (err: any) {
      console.error('Error generating ebook:', err);
      res.status(500).json({ error: err.message });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Distill an E-Book into a Carousel Slide Deck
app.post('/api/distill-ebook-to-carousel', async (req, res) => {
  try {
    const {
      ebook,
      slideCount = 6,
      tone = 'santai, padat dan bernilai tinggi',
      language = 'Indonesian',
      authorName = '@creator',
      provider = 'gemini',
      apiKey,
      model,
      baseUrl,
    } = req.body;

    if (!ebook || !ebook.modules || ebook.modules.length === 0) {
      res.status(400).json({ error: 'E-Book data with modules is required' });
      return;
    }

    const count = Math.min(Math.max(parseInt(slideCount, 10) || 6, 4), 10);

    const systemPrompt = `You are a master social media distiller and microblog copywriter.
Your job is to read an entire comprehensive E-Book and distill its gold-standard insights into a high-retention ${count}-slide Carousel Deck.

Structure of the ${count} slides:
- Slide 1: "hook" slide with a viral headline, highlightWord, subtitle, and swipe hint.
- Slides 2 to ${count - 1}: One distilled key module / core lesson per slide. Include stepBadge (e.g. "MODUL 01 · FONDASI"), highlightWord, bullet points, and codeSnippet / prompt if applicable.
- Slide ${count}: "cta" slide with stepBadge "YOU ARE ALL SET", summary bullet points, and ctaButtonText "Save this guide 🔖".

Return strictly JSON with schema:
{
  "slides": [
    {
      "slide_number": 1,
      "type": "hook",
      "badge": "🔥 E-BOOK DISTILLED",
      "stepBadge": "OVERVIEW · 01",
      "title": "Title here",
      "highlightWord": "Key Word",
      "body": "Hook copy",
      "points": ["point 1", "point 2"],
      "codeSnippet": "code or command",
      "terminalTitle": "bash",
      "tip": "tip",
      "ctaButtonText": "Full setup inside →",
      "footer_hint": "Geser 👉"
    }
  ]
}`;

    const ebookSummary = `E-Book Title: ${ebook.title}
Subtitle: ${ebook.subtitle}
Author: ${ebook.author}
Modules:
${ebook.modules.map((m: any, idx: number) => `Module ${idx + 1}: ${m.title}
Summary: ${m.description}
Key Points: ${m.introCard?.checklist?.join(', ') || m.steps?.map((s: any) => s.title).join(', ')}`).join('\n\n')}`;

    const userPrompt = `Distill this E-Book into exactly ${count} slides:\n${ebookSummary}\nCreator Name: "${authorName}". Language: "${language}". Tone: "${tone}".`;

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
        id: `slide-distill-${Date.now()}-${idx}`,
        slide_number: idx + 1,
        type: s.type || (idx === 0 ? 'hook' : idx === parsed.slides.length - 1 ? 'cta' : 'content'),
        badge: s.badge || (idx === 0 ? '🔥 E-Book Distilled' : idx === parsed.slides.length - 1 ? '📌 Summary' : `Modul 0${idx}`),
        stepBadge: s.stepBadge || undefined,
        title: s.title || `Slide ${idx + 1}`,
        highlightWord: s.highlightWord || undefined,
        body: s.body || '',
        points: Array.isArray(s.points) ? s.points : [],
        codeSnippet: s.codeSnippet || undefined,
        terminalTitle: s.terminalTitle || undefined,
        tip: s.tip || undefined,
        ctaButtonText: s.ctaButtonText || undefined,
        footer_hint: s.footer_hint || (idx === parsed.slides.length - 1 ? 'Save & Share 📌' : 'Swipe 👉'),
      }));

      res.json({ slides: formatted });
    } catch (err: any) {
      console.error('Error distilling ebook:', err);
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
    const { createServer: createViteServer } = await import('vite');
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

if (!process.env.VERCEL) {
  startServer();
}

export default app;
