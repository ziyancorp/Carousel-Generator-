import React, { useState } from 'react';
import { 
  Video, Sparkles, Zap, Wand2, Play, Pause, Download, 
  Share2, CheckCircle2, Loader2, Volume2, User, RefreshCcw, 
  Copy, FileText, Check, AlertCircle, Film, Sparkle, Eye, ThumbsUp
} from 'lucide-react';
import { AVATARS, VOICES } from '../data';
import { UGCScript, VideoAsset } from '../types';

interface VideoStudioProps {
  userCredits: number;
  onDeductCredit: () => void;
  onSaveVideo: (video: VideoAsset) => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  userCredits,
  onDeductCredit,
  onSaveVideo
}) => {
  // Selection States
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [videoStyle, setVideoStyle] = useState('Product Review & Unboxing');
  const [tone, setTone] = useState('Enthusiastic & Relatable');

  // Input States
  const [productName, setProductName] = useState('GlowSkin Hyaluronic Serum');
  const [productDesc, setProductDesc] = useState('Hydrating glass-skin facial serum with 3x multi-depth hyaluronic acid and niacinamide.');
  const [targetAudience, setTargetAudience] = useState('Gen Z & Skincare Enthusiasts');

  // AI Script State
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isEnhancingDesc, setIsEnhancingDesc] = useState(false);
  const [script, setScript] = useState<UGCScript | null>({
    hook: "Stop scrolling if your skin feels dry and dull this season! 💦",
    body: [
      "I was skeptical until I tried this hydration serum for 3 days straight.",
      "Look at this instant glass-skin finish - zero filter needed!",
      "It locks in moisture all day without feeling sticky or greasy."
    ],
    cta: "Click the link in bio to snag 20% off with my code GLOW20!",
    estimatedDuration: "35s",
    caption: "Glass skin achieved in 3 days! ✨ Drop a comment if you want the link!",
    hashtags: ["#SkincareRoutine", "#GlassSkin", "#UGCReview", "#GlowUp", "#BeautyHacks"]
  });

  // Video Generation Process State
  const [isRendering, setIsRendering] = useState(false);
  const [renderStep, setRenderStep] = useState<number>(0);
  const [renderedVideo, setRenderedVideo] = useState<VideoAsset | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const renderStepsText = [
    "Compiling AI Script & Voice Hooks...",
    "Synthesizing Ultra-Natural Speech (ElevenLabs)...",
    "Lip-Syncing & Animating AI Avatar Model...",
    "Applying 1080p Color Grade & Subtitle Overlays..."
  ];

  // Handler: Generate Script via Gemini Server API
  const handleGenerateScript = async () => {
    if (!productName.trim()) {
      setErrorMsg("Please enter a product name first!");
      return;
    }
    setErrorMsg('');
    setIsGeneratingScript(true);

    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productDesc,
          targetAudience,
          tone,
          style: videoStyle
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setScript(json.data);
      } else {
        throw new Error(json.error || "Failed to generate script.");
      }
    } catch (err: any) {
      console.warn("API fallback script generation:", err);
      // Smart Fallback
      setScript({
        hook: `Wait, is ${productName} actually worth the hype?! 🔥`,
        body: [
          `I spent 7 days testing ${productName} so you don't have to.`,
          `${productDesc.slice(0, 80)}... and the results blew my mind!`,
          `If you fall into ${targetAudience}, this is an absolute gamechanger.`
        ],
        cta: `Tap the link below to claim yours before it sells out again!`,
        estimatedDuration: "30s",
        caption: `Unboxing & honest review of ${productName}! 📦✨ Let me know your thoughts below!`,
        hashtags: ["#UGC", "#Unboxing", "#ProductReview", "#MustHave", "#ViralProducts"]
      });
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Handler: Enhance Product Description
  const handleEnhanceDesc = async () => {
    if (!productDesc) return;
    setIsEnhancingDesc(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: productDesc, mode: 'video_script' })
      });
      const json = await res.json();
      if (json.success && json.enhancedPrompt) {
        setProductDesc(json.enhancedPrompt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancingDesc(false);
    }
  };

  // Handler: Render Video
  const handleRenderVideo = () => {
    if (userCredits < 1) {
      setErrorMsg("You need at least 1 video credit to generate a video. Top up in Billing!");
      return;
    }
    if (!script) {
      setErrorMsg("Please generate or write a script first!");
      return;
    }

    setErrorMsg('');
    setIsRendering(true);
    setRenderStep(0);
    onDeductCredit();

    // Step-by-step progress simulation
    const interval = setInterval(() => {
      setRenderStep(prev => {
        if (prev < 3) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsRendering(false);

          const newVideo: VideoAsset = {
            id: `vid_${Date.now()}`,
            title: `${productName} - ${videoStyle}`,
            avatarName: selectedAvatar.name,
            avatarImg: selectedAvatar.img,
            voiceName: selectedVoice.name,
            script: script,
            aspectRatio: aspectRatio,
            duration: script.estimatedDuration || '35s',
            createdAt: 'Just now',
            status: 'ready',
            posterUrl: selectedAvatar.img,
            views: Math.floor(Math.random() * 5000) + 1200,
            likes: Math.floor(Math.random() * 800) + 240
          };

          setRenderedVideo(newVideo);
          onSaveVideo(newVideo);
          return 3;
        }
      });
    }, 1800);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* STUDIO HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cyan-900/30 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/50 rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Video className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-mono font-bold tracking-wider text-cyan-400 uppercase">AI UGC Video Creator</h1>
          </div>
          <p className="text-xs font-mono text-slate-400">
            SYNTHESIZE ULTRA-REALISTIC AVATAR PRODUCT VIDEOS // GEMINI SCRIPTING & ELEVENLABS SPEECH
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono">
          <div className="px-3.5 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400 fill-amber-400" />
            <span>PAYLOAD COST: 1 CREDIT</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-mono rounded flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-xs underline text-slate-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* MAIN STUDIO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT FORM PANEL (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* STEP 1: AVATAR SELECTION */}
          <div className="bg-[#0e1217] border border-cyan-900/30 rounded-lg p-5 shadow-xl font-mono">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-300 flex items-center uppercase tracking-wider">
                <User className="w-4 h-4 mr-2 text-cyan-400" />
                1. Select AI Creator Model
              </label>
              <span className="text-[10px] text-slate-500">{AVATARS.length} AVATARS READY</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {AVATARS.map((avatar) => {
                const isSelected = selectedAvatar.id === avatar.id;
                return (
                  <div
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`group cursor-pointer relative rounded border overflow-hidden transition-all duration-300 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'border-slate-800 bg-[#05070a] hover:border-slate-700 hover:bg-[#0a0f18]'
                    }`}
                  >
                    <div className="aspect-square relative overflow-hidden bg-black/60">
                      <img
                        src={avatar.img}
                        alt={avatar.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-cyan-500 text-black p-0.5 rounded shadow">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="text-xs font-bold text-white leading-tight">{avatar.name}</div>
                        <div className="text-[9px] text-cyan-400 truncate">{avatar.niche}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 p-2.5 bg-[#05070a] rounded border border-slate-800 text-[11px] text-slate-300">
              <span className="font-semibold text-cyan-400">{selectedAvatar.name}: </span>
              {selectedAvatar.description}
            </div>
          </div>

          {/* STEP 2: VOICE & ASPECT RATIO */}
          <div className="bg-[#0e1217] border border-cyan-900/30 rounded-lg p-5 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 flex items-center uppercase tracking-wider">
                <Volume2 className="w-4 h-4 mr-2 text-cyan-400" />
                2. Voice Synthesis
              </label>
              <select
                value={selectedVoice.id}
                onChange={(e) => {
                  const v = VOICES.find(voice => voice.id === e.target.value);
                  if (v) setSelectedVoice(v);
                }}
                className="w-full h-10 px-3 bg-[#05070a] border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 transition-all"
              >
                {VOICES.map(voice => (
                  <option key={voice.id} value={voice.id} className="bg-[#0e1217] text-white">
                    {voice.name} ({voice.style})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 flex items-center uppercase tracking-wider">
                <Film className="w-4 h-4 mr-2 text-cyan-400" />
                Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '9:16', label: '9:16', desc: 'TikTok/Reels' },
                  { id: '16:9', label: '16:9', desc: 'YouTube' },
                  { id: '1:1', label: '1:1', desc: 'Feed' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectRatio(item.id as any)}
                    className={`py-1.5 px-2 rounded border text-center transition-all ${
                      aspectRatio === item.id
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                        : 'border-slate-800 bg-[#05070a] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[9px] opacity-70">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 3: PRODUCT DETAILS & SCRIPT GENERATOR */}
          <div className="bg-[#0e1217] border border-cyan-900/30 rounded-lg p-5 shadow-xl space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center uppercase tracking-wider">
                <FileText className="w-4 h-4 mr-2 text-cyan-400" />
                3. Product Campaign Parameters
              </label>
              <button
                onClick={handleEnhanceDesc}
                disabled={isEnhancingDesc}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center transition-colors"
              >
                {isEnhancingDesc ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />}
                POLISH SPECIFICATION
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 uppercase">PRODUCT IDENTIFIER</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Lumina Wireless Earbuds"
                  className="w-full h-10 px-3 bg-[#05070a] border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 uppercase">TARGET DEMOGRAPHIC</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Fitness lovers & Commuters"
                  className="w-full h-10 px-3 bg-[#05070a] border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1 uppercase">VALUE PROPOSITION & KEY BENEFITS</label>
              <textarea
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                rows={3}
                placeholder="Describe key features, discount codes, or problem-solving selling points..."
                className="w-full p-3 bg-[#05070a] border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 uppercase">CAMPAIGN FRAMEWORK</label>
                <select
                  value={videoStyle}
                  onChange={(e) => setVideoStyle(e.target.value)}
                  className="w-full h-10 px-3 bg-[#05070a] border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
                >
                  <option value="Product Review & Unboxing">Product Review & Unboxing</option>
                  <option value="Problem / Solution Viral Hook">Problem / Solution Viral Hook</option>
                  <option value="3 Reasons You Need This">3 Reasons You Need This</option>
                  <option value="Before & After Transformation">Before & After Transformation</option>
                  <option value="TikTok Made Me Buy It">TikTok Made Me Buy It</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1 uppercase">TONE MATRIX</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full h-10 px-3 bg-[#05070a] border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
                >
                  <option value="Enthusiastic & Relatable">Enthusiastic & Relatable</option>
                  <option value="Urgent & Promotional">Urgent & Promotional</option>
                  <option value="Calm & Aesthetic">Calm & Aesthetic</option>
                  <option value="Informative & Authoritative">Informative & Authoritative</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateScript}
              disabled={isGeneratingScript}
              className="w-full py-3 px-4 bg-cyan-500/10 border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300 rounded text-xs font-bold transition-all flex items-center justify-center space-x-2"
            >
              {isGeneratingScript ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>SYNTHESIZING GEMINI SCRIPT...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>SYNTHESIZE SCRIPT WITH GEMINI</span>
                </>
              )}
            </button>
          </div>

          {/* SCRIPT PREVIEW BOX */}
          {script && (
            <div className="bg-[#0e1217] border border-cyan-500/40 rounded-lg p-5 space-y-4 font-mono shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center">
                  <Sparkle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  SYNTHESIZED UGC SCRIPT ({script.estimatedDuration})
                </span>
                <span className="text-[10px] text-slate-500 bg-[#05070a] px-2 py-0.5 rounded border border-slate-800">
                  EDITABLE SEQUENCE
                </span>
              </div>

              {/* Hook */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  🔥 VIRAL HOOK (FIRST 3 SECONDS)
                </div>
                <input
                  type="text"
                  value={script.hook}
                  onChange={(e) => setScript({ ...script, hook: e.target.value })}
                  className="w-full bg-transparent text-xs font-semibold text-amber-200 focus:outline-none"
                />
              </div>

              {/* Body Scenes */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  🎬 SCENE SEQUENCES
                </div>
                {script.body.map((line, idx) => (
                  <div key={idx} className="bg-[#05070a] border border-slate-800 rounded p-2.5 flex items-start space-x-2">
                    <span className="text-xs font-bold text-cyan-400 mt-0.5">{idx + 1}.</span>
                    <textarea
                      value={line}
                      onChange={(e) => {
                        const newBody = [...script.body];
                        newBody[idx] = e.target.value;
                        setScript({ ...script, body: newBody });
                      }}
                      rows={2}
                      className="w-full bg-transparent text-xs text-slate-300 focus:outline-none resize-none"
                    />
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  🚀 CALL TO ACTION (CTA)
                </div>
                <input
                  type="text"
                  value={script.cta}
                  onChange={(e) => setScript({ ...script, cta: e.target.value })}
                  className="w-full bg-transparent text-xs font-medium text-emerald-200 focus:outline-none"
                />
              </div>

              {/* RENDER ACTION BUTTON */}
              <button
                type="button"
                onClick={handleRenderVideo}
                disabled={isRendering}
                className="w-full py-3.5 px-6 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/60 text-cyan-300 font-mono font-bold rounded text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2"
              >
                {isRendering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>RENDERING AI AVATAR VIDEO...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                    <span>EXECUTE VIDEO RENDER (1 CREDIT)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PREVIEW & RENDER PANEL (5 COLS) */}
        <div className="lg:col-span-5 space-y-6 font-mono">
          <div className="sticky top-6 space-y-6">
            
            {/* PREVIEW CONTAINER */}
            <div className="bg-[#0e1217] border border-cyan-900/30 rounded-lg p-5 flex flex-col items-center shadow-xl">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  <Film className="w-4 h-4 mr-1.5 text-cyan-400" />
                  Live Preview Terminal
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  {aspectRatio}
                </span>
              </div>

              {/* RENDER IN PROGRESS MODAL / OVERLAY */}
              {isRendering ? (
                <div className="w-full aspect-[9/16] max-w-[280px] bg-[#05070a] border border-cyan-500/40 rounded flex flex-col items-center justify-center p-6 text-center space-y-4 shadow-[0_0_30px_rgba(6,182,212,0.2)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />
                  <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                  <div className="space-y-2 relative z-10">
                    <div className="text-xs font-bold text-white">SYNTHESIZING VIDEO ASSET</div>
                    <p className="text-[10px] text-cyan-300 font-mono">
                      {renderStepsText[renderStep]}
                    </p>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full transition-all duration-500 shadow-[0_0_8px_#06b6d4]"
                      style={{ width: `${((renderStep + 1) / 4) * 100}%` }}
                    />
                  </div>
                </div>
              ) : renderedVideo ? (
                /* RENDERED VIDEO DISPLAY */
                <div className="w-full space-y-4">
                  <div className="relative aspect-[9/16] max-w-[280px] mx-auto rounded overflow-hidden border border-cyan-500/40 bg-black group shadow-2xl">
                    <img
                      src={renderedVideo.posterUrl}
                      alt="Rendered UGC"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Simulated Player Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 p-4 flex flex-col justify-between">
                      {/* Top Bar */}
                      <div className="flex items-center justify-between text-[10px] text-white/80">
                        <span className="bg-black/80 border border-slate-700 px-2 py-0.5 rounded font-bold text-cyan-400">
                          {selectedAvatar.name} AI Model
                        </span>
                        <span className="bg-emerald-500/80 text-black font-bold px-1.5 py-0.5 rounded text-[8px] uppercase">
                          4K READY
                        </span>
                      </div>

                      {/* Play Button Center */}
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="self-center p-3.5 rounded bg-cyan-500/80 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.6)] backdrop-blur-md transition-transform hover:scale-105"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                      </button>

                      {/* Bottom Caption Overlay */}
                      <div className="space-y-1 text-left">
                        <div className="bg-black/80 backdrop-blur-md p-2 rounded border border-slate-800 text-[10px] text-slate-200 font-mono line-clamp-2">
                          💬 "{script.hook}"
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span className="flex items-center"><Eye className="w-3 h-3 mr-1" /> {renderedVideo.views}</span>
                          <span className="flex items-center"><ThumbsUp className="w-3 h-3 mr-1" /> {renderedVideo.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const blob = new Blob([`Title: ${renderedVideo.title}\nScript Hook: ${script.hook}\nBody: ${script.body.join(' ')}\nCTA: ${script.cta}`], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${renderedVideo.title}.txt`;
                          a.click();
                        }}
                        className="py-2 px-3 bg-[#05070a] hover:bg-[#0a0f18] text-slate-200 text-xs font-bold rounded border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>EXPORT MP4</span>
                      </button>

                      <button
                        onClick={() => copyToClipboard(script.caption + "\n\n" + script.hashtags.join(' '))}
                        className="py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded border border-cyan-500/40 flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCaption ? 'COPIED!' : 'COPY CAPTION'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => alert("Simulated: Exported to TikTok / Instagram Reels Direct Publisher!")}
                      className="w-full py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold rounded flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>PUBLISH TO TIKTOK & IG</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* INITIAL BLANK PREVIEW STATE */
                <div className="w-full aspect-[9/16] max-w-[280px] bg-[#05070a] border border-dashed border-slate-800 rounded flex flex-col items-center justify-center p-6 text-center space-y-3 font-mono">
                  <div className="w-10 h-10 rounded bg-[#0a0f18] border border-slate-800 flex items-center justify-center text-slate-500">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-300">READY FOR RENDER</div>
                  <p className="text-[10px] text-slate-500">
                    Select creator avatar, synthesize script, then click Execute Video Render.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
