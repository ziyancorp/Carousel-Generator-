import React, { useState, useEffect } from 'react';
import { 
  Video, CreditCard, Plus, Layers, Menu, X, Zap, 
  ImageIcon, Sparkles, CheckCircle2, ShieldAlert, Activity, Terminal, Radio
} from 'lucide-react';
import { VideoStudio } from './components/VideoStudio';
import { ImageStudio } from './components/ImageStudio';
import { AssetLibrary } from './components/AssetLibrary';
import { BillingView } from './components/BillingView';
import { UserProfile, VideoAsset, ImageAsset } from './types';
import { INITIAL_VIDEOS, INITIAL_IMAGES } from './data';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<'create-video' | 'create-image' | 'library' | 'billing'>('create-image');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [systemTime, setSystemTime] = useState('04:12:89 UTC');

  const [user, setUser] = useState<UserProfile>({
    name: 'Cmdr. Creator',
    email: 'creator@example.com',
    credits: 15,
    tier: 'pro'
  });

  const [videos, setVideos] = useState<VideoAsset[]>(INITIAL_VIDEOS);
  const [images, setImages] = useState<ImageAsset[]>(INITIAL_IMAGES);

  // System clock & keyframes
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`;
      setSystemTime(timeStr);
    }, 1000);

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes shimmer { 100% { transform: translateX(100%); } }
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: rgba(5,7,10,0.8); }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.25); border-radius: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6,182,212,0.5); }
    `;
    document.head.appendChild(style);

    return () => {
      clearInterval(timer);
      document.head.removeChild(style);
    };
  }, []);

  const handleDeductCredit = () => {
    setUser(prev => ({
      ...prev,
      credits: Math.max(0, prev.credits - 1)
    }));
  };

  const handleAddCredits = (amount: number) => {
    setUser(prev => ({
      ...prev,
      credits: prev.credits + amount
    }));
  };

  const handleUpgradePlan = (tier: 'free' | 'pro' | 'brand') => {
    setUser(prev => ({
      ...prev,
      tier,
      credits: tier === 'brand' ? 200 : tier === 'pro' ? 50 : 5
    }));
  };

  const handleSaveVideo = (video: VideoAsset) => {
    setVideos(prev => [video, ...prev]);
  };

  const handleSaveImage = (image: ImageAsset) => {
    setImages(prev => [image, ...prev]);
  };

  const handleDeleteVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleDeleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const navItems = [
    { id: 'create-image', icon: ImageIcon, label: 'Image & Carousel', badge: 'FREE' },
    { id: 'create-video', icon: Video, label: 'UGC Video Studio', cost: '1 Credit' },
    { id: 'library', icon: Layers, label: 'Asset Library', count: videos.length + images.length },
    { id: 'billing', icon: CreditCard, label: 'Credits & Billing' }
  ];

  return (
    <div className="flex h-screen bg-[#020408] text-slate-300 font-sans selection:bg-cyan-500/30 overflow-hidden w-full select-none">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-[#05070a] border-r border-cyan-900/30 flex-col relative z-20 shrink-0 shadow-2xl">
        
        {/* SIDEBAR LOGO HEADER */}
        <div className="h-16 flex items-center px-5 bg-[#0a0f18] border-b border-cyan-900/40 shrink-0">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentRoute('create-image')}>
             <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/50 rounded flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
               <div className="w-3.5 h-3.5 bg-cyan-400 rotate-45" />
             </div>
             <div>
               <span className="font-mono text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase block leading-none mb-1">
                 UGCGEN AI
               </span>
               <span className="text-[9px] text-slate-500 font-mono tracking-wider block">
                 STRATOS-IX // COMMAND
               </span>
             </div>
          </div>
        </div>

        {/* SYSTEM STATUS MINI VITALS */}
        <div className="px-5 py-4 border-b border-cyan-900/20 bg-[#070b12]">
          <div className="text-[9px] font-mono font-bold text-slate-500 tracking-widest uppercase flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              SYSTEM VITALS
            </span>
            <span className="text-emerald-400">ONLINE</span>
          </div>
          <div className="space-y-1.5 font-mono text-[10px]">
            <div className="flex justify-between text-slate-400">
              <span>RENDER ENGINE</span>
              <span className="text-cyan-400">OPTIMAL</span>
            </div>
            <div className="h-1 bg-slate-800/80 rounded-full overflow-hidden">
              <div className="h-full w-[92%] bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            </div>
          </div>
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[9px] font-mono font-bold text-slate-500 mb-2 px-3 tracking-widest uppercase flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-cyan-500" />
            OPERATIONAL STUDIOS
          </div>
          {navItems.slice(0, 2).map(item => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentRoute(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded border text-xs transition-all font-mono ${
                  isActive
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-[#0e1217]/50 border-slate-800/60 text-slate-400 hover:bg-[#0e1217] hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="tracking-tight">{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
                    {item.badge}
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-500 font-mono">{item.cost}</span>
                )}
              </button>
            );
          })}

          <div className="text-[9px] font-mono font-bold text-slate-500 mb-2 mt-5 px-3 tracking-widest uppercase flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-amber-500" />
            DATA MANAGEMENT
          </div>
          {navItems.slice(2).map(item => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentRoute(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded border text-xs transition-all font-mono ${
                  isActive
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-[#0e1217]/50 border-slate-800/60 text-slate-400 hover:bg-[#0e1217] hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="tracking-tight">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* CREDITS FOOTER / PAYLOAD STATUS */}
        <div className="p-3.5 border-t border-cyan-900/30 bg-[#070b12] shrink-0">
          <div
            onClick={() => setCurrentRoute('billing')}
            className="cursor-pointer p-3 rounded bg-[#0e1217] border border-cyan-900/40 hover:border-cyan-500/50 transition-all shadow-inner"
          >
            <div className="text-[9px] font-mono text-slate-500 mb-1 flex items-center justify-between uppercase">
              <span>VIDEO PAYLOAD</span>
              <span className="text-amber-400 font-bold">{user.tier} TIER</span>
            </div>
            <div className="text-xl font-mono font-bold text-cyan-400 flex items-center justify-between">
              <span className="flex items-center">
                <Zap className="w-4 h-4 text-amber-400 mr-1.5 fill-amber-400" />
                {user.credits} <span className="text-xs text-slate-500 ml-1">REMAINING</span>
              </span>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="w-3/4 max-w-[280px] h-full bg-[#05070a] border-r border-cyan-900/40 flex flex-col relative z-10 p-4">
            <div className="flex items-center justify-between border-b border-cyan-900/30 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-cyan-500/10 border border-cyan-500/50 rounded flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-cyan-400 rotate-45" />
                </div>
                <span className="font-mono text-xs font-bold text-cyan-400 tracking-widest uppercase">UGCGEN AI</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1.5 flex-1 font-mono">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentRoute(item.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded border text-xs ${
                    currentRoute === item.id
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                      : 'border-slate-800 text-slate-400 hover:bg-[#0e1217]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">{item.badge}</span>}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0 bg-[#020408]">
        {/* RADIAL SPACE GLOW & GRID DOT MATRIX */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0c1421_0%,_#020408_100%)] -z-10" />
        <div className="absolute inset-0 bg-grid-dots opacity-10 pointer-events-none -z-10" />
        
        {/* COMMAND TOP BAR */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-[#0a0f18] border-b border-cyan-900/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] shrink-0 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded border border-slate-800 bg-[#0e1217]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#06b6d4]" />
                {currentRoute.replace('-', ' ')}
              </h2>
              <p className="text-[9px] text-slate-500 font-mono hidden sm:block">
                SYSTEM MODULE // REALTIME SYNTHESIS & PROCESSING
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-[10px] font-mono">
            {/* TELEMETRY READOUTS */}
            <div className="hidden lg:flex items-center space-x-6 border-r border-slate-800 pr-6">
              <div className="flex flex-col items-end">
                <span className="text-slate-500 uppercase">TELEMETRY</span>
                <span className="text-slate-300">042.89 // -112.04</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-slate-500 uppercase">SYS CLOCK</span>
                <span className="text-cyan-400">{systemTime}</span>
              </div>
            </div>

            {/* USER CREDITS BADGE */}
            <button
              onClick={() => setCurrentRoute('billing')}
              className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/40 rounded text-xs text-cyan-300 font-mono font-bold flex items-center hover:bg-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 mr-1.5 fill-amber-400" />
              <span>{user.credits} CREDITS</span>
            </button>

            <div className="w-7 h-7 rounded bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs shadow-inner">
              C1
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto pb-12">
            {currentRoute === 'create-image' && (
              <ImageStudio onSaveImage={handleSaveImage} />
            )}

            {currentRoute === 'create-video' && (
              <VideoStudio
                userCredits={user.credits}
                onDeductCredit={handleDeductCredit}
                onSaveVideo={handleSaveVideo}
              />
            )}

            {currentRoute === 'library' && (
              <AssetLibrary
                videos={videos}
                images={images}
                onDeleteVideo={handleDeleteVideo}
                onDeleteImage={handleDeleteImage}
              />
            )}

            {currentRoute === 'billing' && (
              <BillingView
                user={user}
                onAddCredits={handleAddCredits}
                onUpgradePlan={handleUpgradePlan}
              />
            )}
          </div>
        </main>
      </div>

    </div>
  );
}

