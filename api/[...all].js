// server.ts
import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { YoutubeTranscript } from "youtube-transcript";
if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = class DOMMatrix {
  };
}
if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = class ImageData {
  };
}
if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D = class Path2D {
  };
}
dotenv.config();
var DEFAULT_XKIRO_KEY = "sk-xt-8fd3f1a5a7eb83a731221b06da8d3fe796031252d6a50f55bd8432b610c1448b";
var DEFAULT_XKIRO_MODEL = "deepseek/deepseek-chat-v3.1";
var DEFAULT_XKIRO_BASE_URL = "https://api.xkiro.com/v1";
var app = express();
var PORT = 3e3;
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
function sanitizeAndParseJSON(rawStr) {
  if (!rawStr) return {};
  let clean = rawStr.trim();
  clean = clean.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(clean);
  } catch (e1) {
    try {
      const sanitized = clean.replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
        if (match === "\n") return "\\n";
        if (match === "\r") return "\\r";
        if (match === "	") return "\\t";
        return "";
      });
      return JSON.parse(sanitized);
    } catch {
      throw e1;
    }
  }
}
async function callUniversalAi(params) {
  const {
    provider = "xkiro",
    apiKey,
    model,
    baseUrl,
    systemPrompt,
    userPrompt
  } = params;
  const runGemini = async (overrideModel) => {
    const candidateKeys = [];
    if (apiKey && apiKey.trim() && apiKey.trim().length > 10) {
      candidateKeys.push(apiKey.trim());
    }
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() && !candidateKeys.includes(process.env.GEMINI_API_KEY.trim())) {
      candidateKeys.push(process.env.GEMINI_API_KEY.trim());
    }
    if (candidateKeys.length === 0) {
      throw new Error("Gemini API Key is required. Please provide a valid API key in settings.");
    }
    const candidateModels = overrideModel ? [overrideModel] : [model || "gemini-2.5-flash", "gemini-3.7-flash", "gemini-2.0-flash"];
    let lastError = null;
    for (const keyToUse2 of candidateKeys) {
      for (const m of candidateModels) {
        try {
          const ai = new GoogleGenAI({
            apiKey: keyToUse2,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build"
              }
            }
          });
          const response = await ai.models.generateContent({
            model: m,
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json"
            }
          });
          if (response && response.text) {
            return response.text;
          }
        } catch (err) {
          lastError = err;
          const errMsg = err?.message || "";
          if (errMsg.includes("API key not valid") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("Invalid or disabled") || errMsg.includes("400")) {
            break;
          }
        }
      }
    }
    throw new Error(`Semua model AI sedang sibuk atau API key tidak valid. Detail: ${lastError?.message || "Unavailable"}`);
  };
  if (provider === "gemini" || !provider && (apiKey || process.env.GEMINI_API_KEY)) {
    return await runGemini();
  }
  if (provider === "anthropic") {
    const keyToUse2 = apiKey;
    if (!keyToUse2) {
      if (process.env.GEMINI_API_KEY) return await runGemini();
      throw new Error("Anthropic API Key is required.");
    }
    const modelToUse2 = model || "claude-3-7-sonnet-20250219";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": keyToUse2,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: modelToUse2,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }]
        })
      });
      if (!res.ok) {
        const errBody = await res.text();
        console.warn(`Anthropic provider error: ${errBody}. Falling back to Gemini...`);
        if (process.env.GEMINI_API_KEY) return await runGemini();
        throw new Error(`Anthropic Error: ${errBody}`);
      }
      const data = await res.json();
      const contentBlock = data.content?.[0];
      return contentBlock?.text || "{}";
    } catch (anthropicErr) {
      if (process.env.GEMINI_API_KEY) {
        console.warn(`Anthropic failed (${anthropicErr.message}), falling back to Gemini`);
        return await runGemini();
      }
      throw anthropicErr;
    }
  }
  let targetUrl = baseUrl;
  let defaultModelName = "gpt-4o";
  if (provider === "deepseek") {
    targetUrl = targetUrl || "https://api.deepseek.com/v1";
    defaultModelName = "deepseek-chat";
  } else if (provider === "xkiro") {
    targetUrl = targetUrl || DEFAULT_XKIRO_BASE_URL;
    defaultModelName = DEFAULT_XKIRO_MODEL;
  } else if (provider === "groq") {
    targetUrl = targetUrl || "https://api.groq.com/openai/v1";
    defaultModelName = "llama-3.3-70b-versatile";
  } else if (provider === "openrouter") {
    targetUrl = targetUrl || "https://openrouter.ai/api/v1";
    defaultModelName = "anthropic/claude-3.5-sonnet";
  } else if (provider === "openai") {
    targetUrl = targetUrl || "https://api.openai.com/v1";
    defaultModelName = "gpt-4o";
  } else {
    targetUrl = targetUrl || "http://localhost:11434/v1";
    defaultModelName = model || "llama3";
  }
  const endpoint = targetUrl.replace(/\/+$/, "") + "/chat/completions";
  const modelToUse = model || defaultModelName;
  const keyToUse = apiKey && apiKey.trim().length > 5 ? apiKey.trim() : provider === "xkiro" ? process.env.XKIRO_API_KEY || DEFAULT_XKIRO_KEY : apiKey || "no-key";
  const doChatFetch = async (targetModel) => {
    return await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Authorization: `Bearer ${keyToUse}`
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });
  };
  try {
    let res = await doChatFetch(modelToUse);
    if (!res.ok && provider === "xkiro" && modelToUse !== DEFAULT_XKIRO_MODEL) {
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
    const jsonResult = await res.json();
    const rawText = jsonResult.choices?.[0]?.message?.content || "{}";
    return rawText;
  } catch (providerErr) {
    if (process.env.GEMINI_API_KEY) {
      console.warn(`Provider ${provider} failed (${providerErr.message}). Seamlessly running with Gemini fallback...`);
      return await runGemini();
    }
    throw providerErr;
  }
}
function extractYouTubeVideoId(input) {
  const cleanInput = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanInput)) {
    return cleanInput;
  }
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = cleanInput.match(regExp);
  return match ? match[1] : null;
}
function extractYouTubePlaylistId(input) {
  const cleanInput = input.trim();
  const match = cleanInput.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
async function fetchYouTubePlaylistInfo(playlistId) {
  const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
  const pageRes = await fetch(playlistUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });
  if (!pageRes.ok) {
    throw new Error(`Gagal membuka playlist YouTube (HTTP ${pageRes.status})`);
  }
  const html = await pageRes.text();
  let title = "YouTube Playlist";
  const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/i) || html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].replace(" - YouTube", "").trim();
  }
  const matches = Array.from(html.matchAll(/href="\/watch\?v=([a-zA-Z0-9_-]{11})/g));
  const seen = /* @__PURE__ */ new Set();
  const videoIds = [];
  for (const m of matches) {
    const vId = m[1];
    if (vId && !seen.has(vId)) {
      seen.add(vId);
      videoIds.push(vId);
    }
  }
  return { title, videoIds };
}
function decodeXmlEntities(str) {
  return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}
async function fetchYouTubeVideoInfo(videoId) {
  try {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (oembedRes.ok) {
      const oembedData = await oembedRes.json();
      return {
        title: oembedData.title || `YouTube Video (${videoId})`,
        channelName: oembedData.author_name || "YouTube Creator"
      };
    }
  } catch (err) {
  }
  return {
    title: `YouTube Video (${videoId})`,
    channelName: "YouTube Creator"
  };
}
async function fetchYouTubeTranscriptDirect(videoId) {
  const videoInfo = await fetchYouTubeVideoInfo(videoId);
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const pageRes = await fetch(watchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });
  if (!pageRes.ok) {
    throw new Error(`Gagal membuka halaman video YouTube (HTTP ${pageRes.status})`);
  }
  const html = await pageRes.text();
  let title = videoInfo.title;
  const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/i) || html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].replace(" - YouTube", "").trim();
  }
  let channelName = videoInfo.channelName;
  const channelMatch = html.match(/"ownerChannelName":"([^"]+)"/) || html.match(/"author":"([^"]+)"/);
  if (channelMatch && channelMatch[1]) {
    channelName = channelMatch[1];
  }
  const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
  if (!captionMatch || !captionMatch[1]) {
    throw new Error("Video ini tidak memiliki caption track langsung di HTML.");
  }
  let captionTracks = [];
  try {
    captionTracks = JSON.parse(captionMatch[1]);
  } catch {
    throw new Error("Gagal mem-parsing track subtitle.");
  }
  if (!captionTracks || captionTracks.length === 0) {
    throw new Error("Trek subtitle kosong.");
  }
  const selectedTrack = captionTracks.find((t) => t.languageCode === "id" || t.languageCode === "in" || t.vssId?.includes(".id")) || captionTracks.find((t) => t.languageCode === "en" || t.languageCode?.startsWith("en")) || captionTracks[0];
  const transcriptUrl = selectedTrack.baseUrl;
  if (!transcriptUrl) {
    throw new Error("URL transkrip tidak ditemukan pada caption track.");
  }
  const transcriptRes = await fetch(transcriptUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  });
  if (!transcriptRes.ok) {
    throw new Error(`Gagal mengunduh teks transkrip (${transcriptRes.status})`);
  }
  const transcriptXml = await transcriptRes.text();
  const textMatches = Array.from(transcriptXml.matchAll(/<text[^>]*>(.*?)<\/text>/gi));
  if (textMatches.length === 0) {
    throw new Error("Data transkrip XML tidak berisi elemen teks.");
  }
  const cleanedLines = [];
  for (const match of textMatches) {
    const rawText = match[1] || "";
    const decoded = decodeXmlEntities(rawText).trim();
    if (decoded && !decoded.startsWith("[") && !decoded.endsWith("]")) {
      cleanedLines.push(decoded);
    }
  }
  const fullText = cleanedLines.join(" ");
  return {
    title,
    text: fullText,
    channelName
  };
}
async function fetchYouTubeTranscriptViaService(videoId) {
  const videoInfo = await fetchYouTubeVideoInfo(videoId);
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "id"
    }).catch(async () => {
      return await YoutubeTranscript.fetchTranscript(videoId);
    });
    if (transcriptItems && transcriptItems.length > 0) {
      const fullText = transcriptItems.map((item) => decodeXmlEntities(item.text || "").trim()).filter((t) => t && !t.startsWith("[") && !t.endsWith("]")).join(" ");
      if (fullText.length > 30) {
        return {
          title: videoInfo.title,
          text: fullText,
          channelName: videoInfo.channelName
        };
      }
    }
  } catch (libErr) {
    console.warn(`youtube-transcript package attempt failed: ${libErr.message}`);
  }
  try {
    const directRes = await fetchYouTubeTranscriptDirect(videoId);
    if (directRes && directRes.text && directRes.text.length > 30) {
      return directRes;
    }
  } catch (directErr) {
    console.warn(`Direct YouTube transcript attempt: ${directErr.message}`);
  }
  try {
    const serviceRes = await fetch(`https://youtube-transcript.ai/api/transcript?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*"
      }
    });
    if (serviceRes.ok) {
      const data = await serviceRes.json();
      let text = "";
      if (typeof data.transcript === "string") {
        text = data.transcript;
      } else if (Array.isArray(data.transcript)) {
        text = data.transcript.map((item) => item.text || item).join(" ");
      } else if (typeof data.text === "string") {
        text = data.text;
      }
      if (text && text.trim().length > 20) {
        return {
          title: data.title || videoInfo.title,
          text: text.trim(),
          channelName: data.channelName || data.channel || videoInfo.channelName
        };
      }
    }
  } catch (err) {
    console.warn(`youtube-transcript.ai attempt: ${err.message}`);
  }
  try {
    const mirrorRes = await fetch(`https://subtitles-for-youtube.com/api/transcript?videoId=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    if (mirrorRes.ok) {
      const mirrorData = await mirrorRes.json();
      if (mirrorData && mirrorData.text && mirrorData.text.length > 30) {
        return {
          title: mirrorData.title || videoInfo.title,
          text: mirrorData.text.trim(),
          channelName: mirrorData.channel || videoInfo.channelName
        };
      }
    }
  } catch (mirrorErr) {
  }
  throw new Error("Video YouTube ini tidak menyediakan subtitle atau closed-caption (CC) publik yang dapat diekstrak.");
}
app.post("/api/ingest/youtube", async (req, res) => {
  try {
    const { url, apiKey, provider, model } = req.body;
    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "YouTube URL or Video ID is required" });
      return;
    }
    const cleanUrl = url.trim();
    const playlistId = extractYouTubePlaylistId(cleanUrl);
    if (playlistId && (cleanUrl.includes("playlist") || !extractYouTubeVideoId(cleanUrl))) {
      try {
        const playlistInfo = await fetchYouTubePlaylistInfo(playlistId);
        const topVideoIds = playlistInfo.videoIds.slice(0, 5);
        if (topVideoIds.length === 0) {
          throw new Error("Playlist kosong atau tidak berisi video publik yang dapat diakses.");
        }
        const videoLessons = [];
        for (let i = 0; i < topVideoIds.length; i++) {
          const vId = topVideoIds[i];
          try {
            const vInfo = await fetchYouTubeVideoInfo(vId);
            let lessonText = "";
            try {
              const vTranscript = await fetchYouTubeTranscriptViaService(vId);
              lessonText = vTranscript.text;
            } catch {
              lessonText = `Video ${i + 1}: "${vInfo.title}" oleh ${vInfo.channelName}. Membahas materi dan konsep penting dalam rangkaian playlist ini.`;
            }
            videoLessons.push(`### Bab 0${i + 1}: ${vInfo.title}

${lessonText.slice(0, 4e3)}`);
          } catch {
          }
        }
        const fullPlaylistText = `# KURIKULUM LENGKAP PLAYLIST: ${playlistInfo.title}

` + videoLessons.join("\n\n---\n\n");
        const words2 = fullPlaylistText.split(/\s+/).filter(Boolean);
        return res.json({
          success: true,
          isPlaylist: true,
          playlistId,
          title: playlistInfo.title,
          videoCount: playlistInfo.videoIds.length,
          text: fullPlaylistText,
          wordCount: words2.length,
          sourceUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
          thumbnailUrl: topVideoIds[0] ? `https://img.youtube.com/vi/${topVideoIds[0]}/hqdefault.jpg` : void 0
        });
      } catch (playlistErr) {
        console.warn(`Playlist extraction error: ${playlistErr.message}`);
        if (!extractYouTubeVideoId(cleanUrl)) {
          return res.status(400).json({ error: playlistErr.message || "Gagal mengekstrak isi playlist YouTube" });
        }
      }
    }
    const videoId = extractYouTubeVideoId(cleanUrl);
    if (!videoId) {
      res.status(400).json({ error: "Format link YouTube tidak valid. Silakan masukkan link video atau playlist yang valid." });
      return;
    }
    let transcriptResult;
    try {
      const extracted = await fetchYouTubeTranscriptViaService(videoId);
      transcriptResult = {
        ...extracted,
        isExtractedFromCaptions: true
      };
    } catch (fetchErr) {
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
      let aiText = "{}";
      try {
        aiText = await callUniversalAi({
          provider,
          apiKey,
          model,
          systemPrompt: "Anda adalah asisten kurasi konten profesional. Balas selalu dalam format JSON.",
          userPrompt: prompt,
          responseMimeType: "application/json"
        });
      } catch (aiErr) {
        aiText = JSON.stringify({
          title: videoInfo.title,
          channelName: videoInfo.channelName,
          text: `Materi video: "${videoInfo.title}" oleh ${videoInfo.channelName}.

Video ini belum menyediakan subtitle publik otomatis. Anda dapat langsung mengedit catatan atau menambahkan poin-poin materi video di kolom di bawah ini.`,
          keyTakeaways: [`Topik: ${videoInfo.title}`]
        });
      }
      let parsed = {};
      try {
        parsed = sanitizeAndParseJSON(aiText);
      } catch {
        parsed = {
          title: videoInfo.title,
          channelName: videoInfo.channelName,
          text: `Materi video: "${videoInfo.title}" oleh ${videoInfo.channelName}.

Silakan lengkapi atau sesuaikan naskah materi video ini.`,
          keyTakeaways: []
        };
      }
      transcriptResult = {
        title: videoInfo.title || parsed.title || `YouTube Video (${videoId})`,
        text: parsed.text || `Materi video: ${videoInfo.title}`,
        channelName: videoInfo.channelName || parsed.channelName || "YouTube Creator",
        isExtractedFromCaptions: false
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
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    });
  } catch (error) {
    console.error("Error ingesting YouTube:", error);
    res.status(500).json({ error: error.message || "Failed to extract YouTube transcript" });
  }
});
app.post("/api/ingest/web", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "Valid Website or Article URL is required" });
      return;
    }
    const cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      res.status(400).json({ error: "URL must start with http:// or https://" });
      return;
    }
    let title = "Web Article";
    let fullText = "";
    const docMatch = cleanUrl.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docMatch && docMatch[1]) {
      const docId = docMatch[1];
      try {
        const gRes = await fetch(`https://docs.google.com/document/d/${docId}/export?format=txt`, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        });
        if (gRes.ok) {
          const docText = await gRes.text();
          if (docText && docText.trim().length > 30) {
            fullText = docText.trim();
            title = `Dokumen Google Docs (${docId.slice(0, 8)})`;
          }
        }
      } catch (gErr) {
        console.warn("Google Doc export error:", gErr.message);
      }
    }
    const sheetMatch = cleanUrl.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (!fullText && sheetMatch && sheetMatch[1]) {
      const sheetId = sheetMatch[1];
      try {
        const sRes = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        });
        if (sRes.ok) {
          const sheetText = await sRes.text();
          if (sheetText && sheetText.trim().length > 20) {
            fullText = sheetText.trim();
            title = `Tabel Google Sheet (${sheetId.slice(0, 8)})`;
          }
        }
      } catch (sErr) {
        console.warn("Google Sheet export error:", sErr.message);
      }
    }
    if (!fullText) {
      try {
        const webRes = await fetch(cleanUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
          }
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
          const cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "").replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "").replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "").replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "").replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "").replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "");
          const textMatches = Array.from(cleaned.matchAll(/<(?:p|h1|h2|h3|h4|li|blockquote)[^>]*>(.*?)<\/(?:p|h1|h2|h3|h4|li|blockquote)>/gi));
          const extractedParagraphs = [];
          for (const match of textMatches) {
            const stripped = match[1].replace(/<[^>]+>/g, "").trim();
            const decoded = decodeXmlEntities(stripped);
            if (decoded.length > 20) {
              extractedParagraphs.push(decoded);
            }
          }
          fullText = extractedParagraphs.join("\n\n");
          if (!fullText || fullText.length < 100) {
            fullText = cleaned.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          }
        }
      } catch (scrapeErr) {
        console.warn(`Direct web scrape failed: ${scrapeErr.message}. Trying Jina Reader...`);
      }
    }
    if (!fullText || fullText.length < 100) {
      try {
        const jinaRes = await fetch(`https://r.jina.ai/${cleanUrl}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        });
        if (jinaRes.ok) {
          const jinaText = await jinaRes.text();
          if (jinaText && jinaText.length > 50) {
            const jinaTitleMatch = jinaText.match(/Title:\s*(.+)/i);
            if (jinaTitleMatch && jinaTitleMatch[1]) {
              title = jinaTitleMatch[1].trim();
            }
            fullText = jinaText.replace(/^Title:.*?\n/i, "").replace(/^URL Source:.*?\n/i, "").trim();
          }
        }
      } catch (jinaErr) {
        console.warn(`Jina reader failed: ${jinaErr.message}`);
      }
    }
    if (!fullText || fullText.length < 30) {
      throw new Error("Gagal mengekstrak isi teks dari URL ini. Silakan salin naskah langsung ke kolom input.");
    }
    const words = fullText.split(/\s+/).filter(Boolean);
    res.json({
      success: true,
      title,
      sourceUrl: cleanUrl,
      text: fullText.slice(0, 4e4),
      wordCount: words.length
    });
  } catch (error) {
    console.error("Error ingesting Web URL:", error);
    res.status(500).json({ error: error.message || "Failed to fetch and parse website content" });
  }
});
app.post("/api/ingest/pdf", async (req, res) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data || typeof base64Data !== "string") {
      res.status(400).json({ error: "Base64 file data is required" });
      return;
    }
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");
    const safeFileName = fileName || "document.pdf";
    if (safeFileName.toLowerCase().endsWith(".docx") || buffer[0] === 80 && buffer[1] === 75) {
      try {
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(buffer);
        const docFile = zip.file("word/document.xml");
        if (docFile) {
          const xml = await docFile.async("string");
          const rawText2 = xml.replace(/<w:p[^>]*>/g, "\n").replace(/<w:br[^>]*>/g, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n\s*\n/g, "\n\n").trim();
          const words2 = rawText2.split(/\s+/).filter(Boolean);
          return res.json({
            success: true,
            title: safeFileName.replace(/\.docx$/i, ""),
            fileName: safeFileName,
            text: rawText2,
            pageCount: Math.max(Math.ceil(words2.length / 300), 1),
            wordCount: words2.length
          });
        }
      } catch (docxErr) {
        console.warn("Word DOCX parse attempt failed, trying PDF parser:", docxErr.message);
      }
    }
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo().catch(() => null);
    await parser.destroy().catch(() => {
    });
    const rawText = (textResult.text || "").trim();
    const words = rawText.split(/\s+/).filter(Boolean);
    let docTitle = safeFileName.replace(/\.pdf$/i, "");
    if (infoResult && infoResult.info?.Title) {
      docTitle = infoResult.info.Title;
    }
    res.json({
      success: true,
      title: docTitle,
      fileName: safeFileName,
      text: rawText,
      pageCount: textResult.pages?.length || 1,
      wordCount: words.length
    });
  } catch (error) {
    console.error("Error parsing document:", error);
    res.status(500).json({ error: error.message || "Failed to parse PDF/DOCX document" });
  }
});
app.post("/api/ingest/image", async (req, res) => {
  try {
    const { base64Data, fileName, mimeType = "image/png" } = req.body;
    if (!base64Data || typeof base64Data !== "string") {
      res.status(400).json({ error: "Base64 image data is required" });
      return;
    }
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      res.status(400).json({ error: "Gemini API Key diperlukan di server untuk menganalisis gambar/foto." });
      return;
    }
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const prompt = `Analisis gambar ini dengan teliti. 
TUGAS UTAMA:
1. Ekstrak dan transkripsikan seluruh teks, diagram, infografis, dan catatan penting yang ada pada gambar ini.
2. Jelaskan konsep materi, langkah-langkah, dan poin edukatif secara komprehensif dalam Bahasa Indonesia.
3. Kembalikan strictly JSON format:
{
  "title": "Judul materi atau konsep yang ada di gambar",
  "text": "Transkripsi lengkap materi, penjabaran konsep, dan penjelasan mendalam...",
  "keyTakeaways": ["Poin 1", "Poin 2", "Poin 3"]
}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: cleanBase64
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });
    const rawText = response.text || "{}";
    const parsed = sanitizeAndParseJSON(rawText);
    const fullText = parsed.text || "Gambar berhasil dianalisis.";
    const words = fullText.split(/\s+/).filter(Boolean);
    res.json({
      success: true,
      title: parsed.title || fileName || "Materi dari Foto / Infografis",
      fileName: fileName || "image.png",
      text: fullText,
      keyTakeaways: parsed.keyTakeaways || [],
      wordCount: words.length,
      thumbnailUrl: `data:${mimeType};base64,${cleanBase64.slice(0, 5e3)}`
    });
  } catch (error) {
    console.error("Error analyzing image:", error);
    res.status(500).json({ error: error.message || "Failed to analyze image" });
  }
});
app.post("/api/research-topic", async (req, res) => {
  try {
    const { topic, focus = "Panduan Lengkap & Aplikatif", language = "Indonesian", provider = "xkiro", apiKey, model, baseUrl } = req.body;
    if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
      res.status(400).json({ error: "Topik riset diperlukan (minimal 3 karakter)" });
      return;
    }
    const systemPrompt = `Kamu adalah Chief Research Officer & Master Educator kelas dunia.
TUGAS UTAMA:
Lakukan riset mendalam dan susun naskah materi edukatif (Source Material) yang sangat kaya data, berbobot, terstruktur rapi, dan siap diolah menjadi bahan baku E-Book ataupun Carousel microblog bernilai tinggi.
Tulis dalam ${language}.

Format JSON wajib:
{
  "title": "Judul Komprehensif (4-8 kata)",
  "overview": "Ringkasan eksekutif masalah & solusi utama...",
  "text": "Naskah materi riset lengkap (minimal 600-1200 kata), terbagi dalam beberapa sub-bab dengan heading Markdown (###), poin-poin data, studi kasus nyata, langkah implementasi praktis, dan tips ahli...",
  "keyTakeaways": [
    "Poin kunci 1",
    "Poin kunci 2",
    "Poin kunci 3",
    "Poin kunci 4"
  ]
}`;
    const userPrompt = `TOPIK YANG HARUS DIRIKET:
"${topic.trim()}"
FOKUS PEMBAHASAN: ${focus}
BAHASA: ${language}

Lakukan riset komprehensif sekarang dan berikan materi sumber terlengkap dalam format JSON.`;
    const rawText = await callUniversalAi({
      provider,
      apiKey,
      model,
      baseUrl,
      systemPrompt,
      userPrompt,
      responseMimeType: "application/json"
    });
    const parsed = sanitizeAndParseJSON(rawText);
    const contentText = parsed.text || `${parsed.overview || ""}

${(parsed.keyTakeaways || []).join("\n")}`;
    const words = contentText.split(/\s+/).filter(Boolean);
    res.json({
      success: true,
      title: parsed.title || topic.trim(),
      overview: parsed.overview || "",
      text: contentText,
      keyTakeaways: parsed.keyTakeaways || [],
      wordCount: words.length
    });
  } catch (error) {
    console.error("Error in research-topic:", error);
    res.status(500).json({ error: error.message || "Failed to conduct AI research" });
  }
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/validate-key", async (req, res) => {
  try {
    const { provider = "gemini", apiKey, model, baseUrl } = req.body;
    if (provider === "gemini") {
      const keyToTest = apiKey || process.env.GEMINI_API_KEY;
      if (!keyToTest) {
        res.status(400).json({ valid: false, error: "Gemini API Key is required" });
        return;
      }
      const testAi = new GoogleGenAI({ apiKey: keyToTest });
      const response = await testAi.models.generateContent({
        model: model || "gemini-3.7-flash",
        contents: 'Respond with "OK"'
      });
      if (response.text) {
        res.json({ valid: true, message: "Google Gemini connection active & verified!" });
      } else {
        res.status(400).json({ valid: false, error: "No response from Gemini" });
      }
      return;
    }
    if (provider === "anthropic") {
      if (!apiKey) {
        res.status(400).json({ valid: false, error: "Anthropic API Key is required" });
        return;
      }
      const testRes2 = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: model || "claude-3-5-haiku-latest",
          max_tokens: 10,
          messages: [{ role: "user", content: "Say OK" }]
        })
      });
      if (testRes2.ok) {
        res.json({ valid: true, message: "Anthropic Claude connection verified!" });
      } else {
        const err = await testRes2.text();
        res.status(400).json({ valid: false, error: `Anthropic: ${err}` });
      }
      return;
    }
    let targetUrl = baseUrl;
    let defaultTestModel = "gpt-4o-mini";
    if (provider === "deepseek") {
      targetUrl = targetUrl || "https://api.deepseek.com/v1";
      defaultTestModel = "deepseek-chat";
    } else if (provider === "xkiro") {
      targetUrl = targetUrl || "https://api.xkiro.com/v1";
      defaultTestModel = "qwen/qwen3.8-max:free";
    } else if (provider === "groq") {
      targetUrl = targetUrl || "https://api.groq.com/openai/v1";
      defaultTestModel = "llama-3.1-8b-instant";
    } else if (provider === "openrouter") {
      targetUrl = targetUrl || "https://openrouter.ai/api/v1";
      defaultTestModel = "google/gemini-2.5-flash";
    } else if (provider === "openai") {
      targetUrl = targetUrl || "https://api.openai.com/v1";
      defaultTestModel = "gpt-4o-mini";
    } else {
      targetUrl = targetUrl || "http://localhost:11434/v1";
      defaultTestModel = model || "llama3";
    }
    const testEndpoint = targetUrl.replace(/\/+$/, "") + "/chat/completions";
    const testRes = await fetch(testEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey || ""}`
      },
      body: JSON.stringify({
        model: model || defaultTestModel,
        messages: [{ role: "user", content: "Say OK" }],
        max_tokens: 5
      })
    });
    if (testRes.ok) {
      res.json({ valid: true, message: `${provider.toUpperCase()} provider connected successfully!` });
    } else {
      const errText = await testRes.text();
      res.status(400).json({ valid: false, error: `${provider} Error: ${errText}` });
    }
  } catch (err) {
    res.status(400).json({ valid: false, error: err.message || "Connection test failed" });
  }
});
function getFallbackCarousel(topic, slideCount, language, sourceMaterial) {
  const isId = language.toLowerCase().includes("id") || language.toLowerCase().includes("indo");
  const count = Math.min(Math.max(slideCount || 5, 3), 10);
  let chunks = [];
  if (sourceMaterial && sourceMaterial.trim().length > 15) {
    chunks = sourceMaterial.split(/\n+/).map((l) => l.replace(/^[-*•\d.]+\s*/, "").trim()).filter((l) => l.length > 10);
  }
  const effectiveTitle = topic || (chunks[0] ? chunks[0].slice(0, 60) : "Panduan Ringkas Praktis");
  const fallbackSlides = [];
  if (isId) {
    fallbackSlides.push({
      id: "slide-1",
      slide_number: 1,
      type: "hook",
      badge: "\u{1F525} Materi Utama",
      stepBadge: "OVERVIEW \xB7 01",
      title: effectiveTitle,
      highlightWord: effectiveTitle.split(" ")[0] || "Panduan",
      body: chunks[1] || "Berikut adalah rangkuman poin inti dan pembelajaran penting yang disarikan langsung dari materi sumber.",
      footer_hint: "Geser ke kanan \u{1F449}",
      points: [
        chunks[2] ? chunks[2].slice(0, 60) : "Poin penting disarikan dari naskah",
        chunks[3] ? chunks[3].slice(0, 60) : "Langkah praktis siap terapkan"
      ],
      ctaButtonText: "Baca Panduan Lengkap \u2192"
    });
    for (let i = 2; i < count; i++) {
      const step = i - 1;
      const chunkIdx = 3 + (step - 1) * 2;
      const pointA = chunks[chunkIdx] || `Langkah penting ke-${step} dari materi`;
      const pointB = chunks[chunkIdx + 1] || "Implementasi terarah dan terukur";
      fallbackSlides.push({
        id: `slide-${i}`,
        slide_number: i,
        type: step % 2 === 0 ? "bullet" : "content",
        badge: `Poin 0${step}`,
        stepBadge: `STEP 0${step} \xB7 MATERI`,
        title: chunks[chunkIdx] ? chunks[chunkIdx].slice(0, 45) : `Pembahasan Poin ${step}`,
        highlightWord: `Poin ${step}`,
        body: chunks[chunkIdx] || `Rincian konsep dan langkah pembahasan penting ke-${step} dari materi sumber.`,
        points: [pointA.slice(0, 70), pointB.slice(0, 70)],
        footer_hint: "Lanjut ke poin berikutnya \u{1F680}"
      });
    }
    fallbackSlides.push({
      id: `slide-${count}`,
      slide_number: count,
      type: "cta",
      badge: "\u26A1 Kesimpulan & Aksi",
      stepBadge: "YOU ARE ALL SET",
      title: "Mulai Terapkan Insight Ini!",
      highlightWord: "Terapkan Insight",
      body: "Simpan ringkasan materi ini agar tidak hilang, dan bagikan ke kolega yang membutuhkan.",
      footer_hint: "Save & Share \u{1F4CC}",
      points: ["\u{1F4CC} Simpan untuk referensi nanti", "\u{1F4AC} Tulis pendapatmu di kolom komentar"],
      ctaButtonText: "Simpan Panduan Ini \u{1F516}"
    });
  } else {
    fallbackSlides.push({
      id: "slide-1",
      slide_number: 1,
      type: "hook",
      badge: "\u{1F525} Essential Blueprint",
      stepBadge: "OVERVIEW \xB7 01",
      title: effectiveTitle,
      highlightWord: "Core Guide",
      body: chunks[1] || "Here is the key synthesis distilled directly from your source material.",
      footer_hint: "Swipe to learn \u{1F449}",
      points: [
        chunks[2] ? chunks[2].slice(0, 60) : "Extracted core insight",
        chunks[3] ? chunks[3].slice(0, 60) : "Actionable implementation"
      ],
      ctaButtonText: "Read Full Guide \u2192"
    });
    for (let i = 2; i < count; i++) {
      const step = i - 1;
      const chunkIdx = 3 + (step - 1) * 2;
      fallbackSlides.push({
        id: `slide-${i}`,
        slide_number: i,
        type: step % 2 === 0 ? "bullet" : "content",
        badge: `Step 0${step}`,
        stepBadge: `STEP 0${step} \xB7 ACTION`,
        title: chunks[chunkIdx] ? chunks[chunkIdx].slice(0, 45) : `Core Concept ${step}`,
        highlightWord: `Step ${step}`,
        body: chunks[chunkIdx] || `Synthesized key takeaway and execution steps for module ${step}.`,
        points: [
          (chunks[chunkIdx] || "Execute structured action").slice(0, 70),
          (chunks[chunkIdx + 1] || "Measure consistent progress").slice(0, 70)
        ],
        footer_hint: "Next step ahead \u{1F680}"
      });
    }
    fallbackSlides.push({
      id: `slide-${count}`,
      slide_number: count,
      type: "cta",
      badge: "\u26A1 Take Action",
      stepBadge: "YOU ARE ALL SET",
      title: "Ready To Level Up Your Game?",
      highlightWord: "Level Up",
      body: "Bookmark this carousel for quick reference and share your key takeaway in the comments.",
      footer_hint: "Save & Bookmark \u{1F4CC}",
      points: ["\u{1F4CC} Save this for later", "\u{1F4AC} Drop your thoughts below"],
      ctaButtonText: "Save this guide \u{1F516}"
    });
  }
  return fallbackSlides;
}
app.post("/api/generate-carousel", async (req, res) => {
  try {
    const {
      topic,
      sourceMaterial,
      slideCount = 5,
      tone = "santai dan engaging",
      language = "Indonesian",
      authorName = "@creator",
      targetAudience = "Content creators, professionals, and students",
      provider = "xkiro",
      apiKey,
      model,
      baseUrl
    } = req.body;
    let finalTopic = (topic || "").trim();
    if (!finalTopic && sourceMaterial) {
      const firstLine = sourceMaterial.trim().split("\n")[0].replace(/[#*_-]/g, "").trim();
      finalTopic = firstLine.slice(0, 80) || "Ringkasan Materi";
    }
    if (!finalTopic && !sourceMaterial) {
      res.status(400).json({ error: "Materi sumber atau topik diperlukan." });
      return;
    }
    const count = Math.min(Math.max(parseInt(slideCount, 10) || 5, 3), 10);
    const customKey = req.headers["x-gemini-key"] || apiKey;
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
      "badge": "\u{1F525} Ringkasan Materi",
      "stepBadge": "OVERVIEW \xB7 01",
      "title": "Judul Slide",
      "highlightWord": "Kata Kunci",
      "body": "Penjelasan lengkap...",
      "points": ["Poin 1", "Poin 2"],
      "footer_hint": "Geser \u{1F449}"
    }
  ]
}`;
    let userPrompt = `JUMLAH SLIDE DIBUTUHKAN: Tepat ${count} slide.
NAMA KREATOR: "${authorName}".
BAHASA: ${language}.
GAYA BAHASA: ${tone}.
`;
    if (sourceMaterial && sourceMaterial.trim().length > 10) {
      userPrompt += `
MATERI SUMBER YANG HARUS DIOLAH:
===
${sourceMaterial.slice(0, 25e3)}
===
`;
    } else {
      userPrompt += `
TOPIK MATERI: "${finalTopic}"
`;
    }
    userPrompt += "\nEkstrak seluruh poin penting dari materi sumber di atas sekarang dalam format JSON.";
    try {
      const rawJson = await callUniversalAi({
        provider,
        apiKey: customKey,
        model,
        baseUrl,
        systemPrompt,
        userPrompt
      });
      const parsed = sanitizeAndParseJSON(rawJson);
      const outputTopic = parsed.topic || finalTopic;
      const formattedSlides = (parsed.slides || []).map((s, idx) => ({
        id: `slide-${Date.now()}-${idx}`,
        slide_number: idx + 1,
        type: s.type || (idx === 0 ? "hook" : idx === parsed.slides.length - 1 ? "cta" : "content"),
        badge: s.badge || (idx === 0 ? "\u{1F525} Hook" : idx === parsed.slides.length - 1 ? "\u{1F4CC} Takeaway" : `Langkah 0${idx}`),
        stepBadge: s.stepBadge || void 0,
        title: s.title || `Slide ${idx + 1}`,
        highlightWord: s.highlightWord || void 0,
        body: s.body || "",
        points: Array.isArray(s.points) ? s.points : [],
        codeSnippet: s.codeSnippet || void 0,
        terminalTitle: s.terminalTitle || void 0,
        tip: s.tip || void 0,
        tag: s.tag || void 0,
        ctaButtonText: s.ctaButtonText || void 0,
        statValue: s.statValue || void 0,
        statLabel: s.statLabel || void 0,
        footer_hint: s.footer_hint || (idx === parsed.slides.length - 1 ? "Save & Share \u{1F4CC}" : "Swipe \u{1F449}"),
        icon: s.icon || void 0
      }));
      res.json({
        topic: outputTopic,
        slides: formattedSlides.length > 0 ? formattedSlides : getFallbackCarousel(outputTopic, count, language, sourceMaterial),
        isFallback: false
      });
    } catch (aiErr) {
      console.warn("AI call failed, using high-quality material fallback:", aiErr.message);
      const fallback = getFallbackCarousel(finalTopic, count, language, sourceMaterial);
      res.json({
        topic: finalTopic,
        slides: fallback,
        isFallback: true,
        error: aiErr.message
      });
    }
  } catch (error) {
    console.error("Error in generate-carousel:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/generate-ebook", async (req, res) => {
  try {
    const {
      topic,
      sourceText,
      sourceType,
      sourceTitle,
      authorName = "Arijal Meutuwah",
      moduleCount = 5,
      language = "Indonesian",
      provider = "xkiro",
      apiKey,
      model,
      baseUrl
    } = req.body;
    let finalTopic = (topic || sourceTitle || "").trim();
    if (!finalTopic && sourceText) {
      const firstLine = sourceText.trim().split("\n")[0].replace(/[#*_-]/g, "").trim();
      finalTopic = firstLine.slice(0, 80) || "Master E-Book Panduan Praktis";
    }
    finalTopic = finalTopic || "Master E-Book Panduan Praktis";
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
    "edition": "Edisi 2026 \u2022 Master Guide",
    "author": "${authorName}",
    "modules": [
      {
        "id": "modul-1",
        "moduleNumber": 1,
        "badge": "Modul 1",
        "title": "Module Title",
        "description": "Short module summary",
        "introCard": {
          "icon": "\u{1F4D8}",
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
            "icon": "\u{1F4A1}",
            "title": "Pro Tip:",
            "body": "Actionable advice."
          }
        ]
      }
    ]
  }
}`;
    let userPrompt = `Topic / Goal: "${topic}"
Author: "${authorName}"
Modules needed: Exactly ${count} modules.
Language: ${language}
`;
    if (sourceText && typeof sourceText === "string" && sourceText.trim().length > 0) {
      userPrompt += `
================== SOURCE MATERIAL (${sourceType || "Ingested Content"}): "${sourceTitle || topic}" ==================
${sourceText.slice(0, 3e4)}
=======================================================
Synthesize all key lessons from this material into the E-Book modules.
`;
    }
    userPrompt += "\nReturn strictly JSON now.";
    try {
      const raw = await callUniversalAi({
        provider,
        apiKey,
        model,
        baseUrl,
        systemPrompt,
        userPrompt
      });
      const parsed = JSON.parse(raw);
      if (parsed.ebook) {
        res.json({ ebook: parsed.ebook });
      } else {
        res.status(500).json({ error: "Failed to format ebook JSON structure" });
      }
    } catch (err) {
      console.error("Error generating ebook:", err);
      res.status(500).json({ error: err.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/distill-ebook-to-carousel", async (req, res) => {
  try {
    const {
      ebook,
      slideCount = 6,
      tone = "santai, padat dan bernilai tinggi",
      language = "Indonesian",
      authorName = "@creator",
      provider = "gemini",
      apiKey,
      model,
      baseUrl
    } = req.body;
    if (!ebook || !ebook.modules || ebook.modules.length === 0) {
      res.status(400).json({ error: "E-Book data with modules is required" });
      return;
    }
    const count = Math.min(Math.max(parseInt(slideCount, 10) || 6, 4), 10);
    const systemPrompt = `You are a master social media distiller and microblog copywriter.
Your job is to read an entire comprehensive E-Book and distill its gold-standard insights into a high-retention ${count}-slide Carousel Deck.

Structure of the ${count} slides:
- Slide 1: "hook" slide with a viral headline, highlightWord, subtitle, and swipe hint.
- Slides 2 to ${count - 1}: One distilled key module / core lesson per slide. Include stepBadge (e.g. "MODUL 01 \xB7 FONDASI"), highlightWord, bullet points, and codeSnippet / prompt if applicable.
- Slide ${count}: "cta" slide with stepBadge "YOU ARE ALL SET", summary bullet points, and ctaButtonText "Save this guide \u{1F516}".

Return strictly JSON with schema:
{
  "slides": [
    {
      "slide_number": 1,
      "type": "hook",
      "badge": "\u{1F525} E-BOOK DISTILLED",
      "stepBadge": "OVERVIEW \xB7 01",
      "title": "Title here",
      "highlightWord": "Key Word",
      "body": "Hook copy",
      "points": ["point 1", "point 2"],
      "codeSnippet": "code or command",
      "terminalTitle": "bash",
      "tip": "tip",
      "ctaButtonText": "Full setup inside \u2192",
      "footer_hint": "Geser \u{1F449}"
    }
  ]
}`;
    const ebookSummary = `E-Book Title: ${ebook.title}
Subtitle: ${ebook.subtitle}
Author: ${ebook.author}
Modules:
${ebook.modules.map((m, idx) => `Module ${idx + 1}: ${m.title}
Summary: ${m.description}
Key Points: ${m.introCard?.checklist?.join(", ") || m.steps?.map((s) => s.title).join(", ")}`).join("\n\n")}`;
    const userPrompt = `Distill this E-Book into exactly ${count} slides:
${ebookSummary}
Creator Name: "${authorName}". Language: "${language}". Tone: "${tone}".`;
    try {
      const raw = await callUniversalAi({
        provider,
        apiKey,
        model,
        baseUrl,
        systemPrompt,
        userPrompt
      });
      const parsed = JSON.parse(raw);
      const formatted = (parsed.slides || []).map((s, idx) => ({
        id: `slide-distill-${Date.now()}-${idx}`,
        slide_number: idx + 1,
        type: s.type || (idx === 0 ? "hook" : idx === parsed.slides.length - 1 ? "cta" : "content"),
        badge: s.badge || (idx === 0 ? "\u{1F525} E-Book Distilled" : idx === parsed.slides.length - 1 ? "\u{1F4CC} Summary" : `Modul 0${idx}`),
        stepBadge: s.stepBadge || void 0,
        title: s.title || `Slide ${idx + 1}`,
        highlightWord: s.highlightWord || void 0,
        body: s.body || "",
        points: Array.isArray(s.points) ? s.points : [],
        codeSnippet: s.codeSnippet || void 0,
        terminalTitle: s.terminalTitle || void 0,
        tip: s.tip || void 0,
        ctaButtonText: s.ctaButtonText || void 0,
        footer_hint: s.footer_hint || (idx === parsed.slides.length - 1 ? "Save & Share \u{1F4CC}" : "Swipe \u{1F449}")
      }));
      res.json({ slides: formatted });
    } catch (err) {
      console.error("Error distilling ebook:", err);
      res.status(500).json({ error: err.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/structure-content", async (req, res) => {
  try {
    const {
      rawContent,
      slideCount = 5,
      tone = "santai dan engaging",
      language = "Indonesian",
      authorName = "@creator",
      provider = "gemini",
      apiKey,
      model,
      baseUrl
    } = req.body;
    if (!rawContent || typeof rawContent !== "string") {
      res.status(400).json({ error: "Raw content text is required" });
      return;
    }
    const count = Math.min(Math.max(parseInt(slideCount, 10) || 5, 3), 10);
    const systemPrompt = `You are a social media carousel ghostwriter and summarizer.
Your goal is to parse the user's raw written content or draft notes, extract the core arguments, and restructure them into exactly ${count} carousel slides.
Return strictly JSON with key "slides" array.`;
    const userPrompt = `Raw Content:
${rawContent}

Restructure into ${count} slides now.`;
    try {
      const raw = await callUniversalAi({
        provider,
        apiKey,
        model,
        baseUrl,
        systemPrompt,
        userPrompt
      });
      const parsed = JSON.parse(raw);
      const formatted = (parsed.slides || []).map((s, idx) => ({
        id: `slide-struct-${Date.now()}-${idx}`,
        slide_number: idx + 1,
        type: s.type || (idx === 0 ? "hook" : idx === parsed.slides.length - 1 ? "cta" : "content"),
        badge: s.badge || (idx === 0 ? "\u{1F525} Hook" : idx === parsed.slides.length - 1 ? "\u{1F4CC} Summary" : `Point 0${idx}`),
        title: s.title || `Slide ${idx + 1}`,
        body: s.body || "",
        points: Array.isArray(s.points) ? s.points : [],
        statValue: s.statValue || void 0,
        footer_hint: s.footer_hint || (idx === parsed.slides.length - 1 ? "Save & Share \u{1F4CC}" : "Swipe \u{1F449}")
      }));
      res.json({ slides: formatted, isFallback: false });
    } catch {
      const lines = rawContent.split("\n").filter((l) => l.trim().length > 0);
      const firstLine = lines[0] || "High Impact Guide";
      const fallback = getFallbackCarousel(firstLine.slice(0, 50), count, language);
      res.json({ slides: fallback, isFallback: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CarouselX & E-Book Studio Server running on http://0.0.0.0:${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer();
}
var server_default = app;
export {
  DEFAULT_XKIRO_BASE_URL,
  DEFAULT_XKIRO_KEY,
  DEFAULT_XKIRO_MODEL,
  server_default as default
};
