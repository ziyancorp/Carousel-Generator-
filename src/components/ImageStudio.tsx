import React, { useState } from 'react';
import { 
  ImageIcon, Sparkles, Wand2, Crop, LayoutTemplate, User, Layers, 
  AlignLeft, AlertCircle, Download, Copy, Share2, Instagram, 
  Check, Loader2, Sparkle, RefreshCcw, Eye, Bookmark
} from 'lucide-react';
import { ImageAsset } from '../types';

interface ImageStudioProps {
  onSaveImage: (image: ImageAsset) => void;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({ onSaveImage }) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'influencer' | 'carousel' | 'product' | 'lifestyle'>('influencer');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '9:16' | '16:9'>('4:5');
  const [useCopywriter, setUseCopywriter] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [generatedItems, setGeneratedItems] = useState<ImageAsset[]>([
    {
      id: 'demo_1',
      title: 'Jakarta Cafe OOTD Aesthetic',
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800&h=1000',
      prompt: 'A sleek Indonesian woman in a white linen shirt and chic gold jewelry enjoying an iced matcha latte at a minimal cafe, golden hour lighting.',
      ratio: '4:5',
      mode: 'influencer',
      createdAt: 'Just now',
      caption: "Slow mornings & crisp linen shirts ☕✨\n\nSave this post for your weekend outfit inspo! What's your go-to weekend coffee order? Drop it below! 👇",
      hashtags: ['#OOTDinspo', '#MinimalistStyle', '#CafeAesthetic', '#CleanGirlLook', '#GoldenHour']
    }
  ]);

  const TEMPLATES = {
    influencer: [
      "Medium shot of a trendy Indonesian female fashion creator in an oversized blazer at an outdoor cafe, natural warm sunlight, 35mm film style.",
      "Urban streetwear mirror selfie of a male influencer with clean aesthetic sneakers and denim jacket in a neon fitting room."
    ],
    carousel: [
      "Minimalist infographic slide with pastel gradient background, showcasing skincare serum textures on a glass plate, clean studio lighting.",
      "Vogue-style magazine cover layout featuring a glowing skin model with bold modern typography at the top."
    ],
    product: [
      "Commercial product photography of an elegant perfume bottle floating over water splashes, dark moody navy background, rim light.",
      "Hypebeast sneakers placed on a black marble pedestal with Tokyo neon city lights background, soft bokeh."
    ],
    lifestyle: [
      "Flatlay overhead shot of an aesthetic coffee desk with a leather journal, wireless earbuds, and fresh flowers on a beige linen table."
    ]
  };

  // Enhance prompt with Gemini
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode })
      });
      const json = await res.json();
      if (json.success && json.enhancedPrompt) {
        setPrompt(json.enhancedPrompt);
      }
    } catch (err: any) {
      console.warn("Enhance prompt fallback:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Generate Image
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg("Please enter a description prompt or choose a template!");
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');

    try {
      // 1. Generate AI Image
      const imgRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          mode
        })
      });

      const imgJson = await imgRes.json();
      let imageUrl = imgJson.imageUrl;

      if (!imgJson.success || !imageUrl) {
        // Fallback preview image
        imageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 15))}/800/${aspectRatio === '1:1' ? '800' : aspectRatio === '4:5' ? '1000' : aspectRatio === '9:16' ? '1422' : '450'}`;
      }

      // 2. Generate Copywriting if enabled
      let captionText = "";
      let hashtagsArr: string[] = [];
      let postTitle = prompt.slice(0, 30) + "...";

      if (useCopywriter) {
        try {
          const copyRes = await fetch('/api/generate-copy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, mode })
          });
          const copyJson = await copyRes.json();
          if (copyJson.success && copyJson.data) {
            captionText = copyJson.data.caption || "";
            hashtagsArr = copyJson.data.hashtags || [];
            postTitle = copyJson.data.title || postTitle;
          }
        } catch (e) {
          console.warn("Copywriter fallback", e);
          captionText = `Elevate your daily vibe ✨\n\nCheck out this fresh aesthetic setup! Drop a comment if you love this look! 👇\n\nLink in bio for more details. 💖`;
          hashtagsArr = ['#UGCGenAI', '#ContentCreator', '#AestheticVibes', '#DailyInspo'];
        }
      }

      const newItem: ImageAsset = {
        id: `img_${Date.now()}`,
        title: postTitle,
        url: imageUrl,
        prompt: prompt,
        caption: captionText,
        hashtags: hashtagsArr,
        ratio: aspectRatio,
        mode: mode,
        createdAt: 'Just now'
      };

      setGeneratedItems(prev => [newItem, ...prev]);
      onSaveImage(newItem);

    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to process image generation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item: ImageAsset) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = `UGCGen_${item.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cyan-900/30 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/50 rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <ImageIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-mono font-bold tracking-wider text-cyan-400 uppercase">Image & Carousel Studio</h1>
          </div>
          <p className="text-xs font-mono text-slate-400">
            PHOTOREALISTIC AI INFLUENCER SYNTHESIS // COMMERCIAL PRODUCT SHOTS & INSTAGRAM CAROUSELS
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold flex items-center shadow-[0_0_12px_rgba(16,185,129,0.25)]">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          <span>UNLIMITED // FREE ACCESS</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-mono rounded flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-xs text-slate-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* STUDIO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT CONTROLS (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* TIPE KONTEN */}
          <div className="bg-[#0e1217] border border-cyan-900/30 rounded-lg p-5 shadow-xl">
            <label className="block text-xs font-mono font-bold text-slate-300 mb-3 flex items-center tracking-wider uppercase">
              <LayoutTemplate className="w-4 h-4 mr-2 text-cyan-400" />
              1. Content Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
              {[
                { id: 'influencer', label: 'AI Influencer', icon: User, desc: 'Human Models' },
                { id: 'carousel', label: 'Carousel Slide', icon: Layers, desc: 'Infographics' },
                { id: 'product', label: 'Product Studio', icon: ImageIcon, desc: 'Commercial' },
                { id: 'lifestyle', label: 'UGC Lifestyle', icon: Sparkles, desc: 'Flatlays & Aesthetic' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setMode(item.id as any)}
                  className={`cursor-pointer p-3 rounded border transition-all text-center sm:text-left ${
                    mode === item.id
                      ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-[#05070a] border-slate-800 text-slate-400 hover:bg-[#0a0f18] hover:text-slate-200'
                  }`}
                >
                  <item.icon className={`w-4 h-4 mx-auto sm:mx-0 mb-1.5 ${mode === item.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div className="font-bold text-xs tracking-tight">{item.label}</div>
                  <div className="text-[9px] opacity-70 hidden sm:block">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ASPECT RATIO */}
          <div className="bg-[#0e1217] border border-cyan-900/30 rounded-lg p-5 shadow-xl">
            <label className="block text-xs font-mono font-bold text-slate-300 mb-3 flex items-center tracking-wider uppercase">
              <Crop className="w-4 h-4 mr-2 text-cyan-400" />
              2. Aspect Ratio
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
              {[
                { id: '1:1', label: '1:1 Square', desc: 'Instagram Feed' },
                { id: '4:5', label: '4:5 Portrait', desc: 'IG Portrait' },
                { id: '9:16', label: '9:16 Vertical', desc: 'TikTok / Story' },
                { id: '16:9', label: '16:9 Wide', desc: 'YouTube / Banner' }
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => setAspectRatio(item.id as any)}
                  className={`cursor-pointer p-3 rounded border transition-all text-center ${
                    aspectRatio === item.id
                      ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-[#05070a] border-slate-800 text-slate-400 hover:bg-[#0a0f18]'
                  }`}
                >
                  <div className="font-bold text-xs">{item.label}</div>
                  <div className="text-[9px] opacity-70">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PROMPT & AI COPYWRITER */}
          <div className="bg-[#0e1217] border border-cyan-900/30 rounded-lg p-5 shadow-xl space-y-4">
            
            {/* Prompt Templates */}
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-500 mb-2 block uppercase tracking-wider">PRESET SYNTHESIS PROMPTS:</label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES[mode].map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(tpl)}
                    className="text-left font-mono text-[11px] bg-[#05070a] hover:bg-cyan-500/15 hover:text-cyan-300 border border-slate-800 px-3 py-1.5 rounded text-slate-300 transition-colors line-clamp-1 max-w-[280px]"
                  >
                    ⚡ {tpl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center uppercase tracking-wider">
                <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
                3. Image Prompt Specification
              </label>
              <button
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center transition-colors"
              >
                {isEnhancing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-1" />}
                POLISH PROMPT
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Detail subject features, lighting vector, environment texture, camera aperture, and visual mood..."
              className="w-full p-3.5 bg-[#05070a] border border-slate-800 rounded font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 transition-all resize-none"
            />

            {/* AI Copywriter Switch */}
            <div className="p-3.5 bg-[#05070a] border border-slate-800 rounded flex items-center justify-between font-mono">
              <div>
                <div className="text-xs font-bold text-slate-200 flex items-center">
                  <AlignLeft className="w-4 h-4 mr-2 text-emerald-400" />
                  Auto-Synthesize Social Media Caption & Hashtags
                </div>
                <div className="text-[10px] text-slate-500">
                  Gemini AI auto-generates hooks, narrative copy, CTAs, and targeted tags.
                </div>
              </div>
              <input
                type="checkbox"
                checked={useCopywriter}
                onChange={(e) => setUseCopywriter(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 px-6 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/60 text-cyan-300 font-mono font-bold rounded text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>SYNTHESIZING IMAGE & CAPTION...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-cyan-400" />
                  <span>EXECUTE GENERATION (FREE)</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* RIGHT FEED (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span className="flex items-center">
              <Layers className="w-4 h-4 mr-2 text-cyan-400" />
              Generated Workspace
            </span>
            <span className="text-cyan-400">[{generatedItems.length}]</span>
          </h2>

          <div className="space-y-5 max-h-[850px] overflow-y-auto pr-1 custom-scrollbar">
            {generatedItems.map((item) => (
              <div key={item.id} className="bg-[#0e1217] border border-cyan-900/30 rounded p-4 space-y-3.5 shadow-xl">
                
                {/* Image Display */}
                <div className="relative rounded overflow-hidden bg-black border border-slate-800 group">
                  <img
                    src={item.url}
                    alt={item.title || 'Generated'}
                    referrerPolicy="no-referrer"
                    className="w-full object-cover max-h-[480px]"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-[#0a0f18]/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold text-cyan-400 border border-cyan-500/30">
                    {item.ratio}
                  </div>
                </div>

                {/* Caption Box */}
                {item.caption && (
                  <div className="bg-[#05070a] border border-slate-800 rounded p-3 space-y-2 font-mono">
                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      <span>✨ SYNTHESIZED CAPTION</span>
                      <button
                        onClick={() => handleCopyText(item.id, item.caption + "\n\n" + (item.hashtags?.join(' ') || ''))}
                        className="text-slate-400 hover:text-white flex items-center"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="ml-1">{copiedId === item.id ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      {item.caption}
                    </p>
                    {item.hashtags && item.hashtags.length > 0 && (
                      <div className="text-[10px] text-cyan-400">
                        {item.hashtags.join(' ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <button
                    onClick={() => handleDownload(item)}
                    className="py-2 px-3 bg-[#05070a] hover:bg-[#0a0f18] text-slate-200 text-xs font-bold rounded border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>DOWNLOAD HD</span>
                  </button>

                  <button
                    onClick={() => alert("Simulated: Exported to Instagram Feed!")}
                    className="py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded border border-cyan-500/40 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5 text-cyan-400" />
                    <span>EXPORT TO IG</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
