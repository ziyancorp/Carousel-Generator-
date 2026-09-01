import React, { useState } from 'react';
import { 
  Layers, Search, Download, Trash2, Copy, Video, ImageIcon, 
  ExternalLink, Eye, Film, Check, Share2
} from 'lucide-react';
import { VideoAsset, ImageAsset } from '../types';

interface AssetLibraryProps {
  videos: VideoAsset[];
  images: ImageAsset[];
  onDeleteVideo: (id: string) => void;
  onDeleteImage: (id: string) => void;
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({
  videos,
  images,
  onDeleteVideo,
  onDeleteImage
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'video' | 'image'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedVideoModal, setSelectedVideoModal] = useState<VideoAsset | null>(null);

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.avatarName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredImages = images.filter(img => 
    (img.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-cyan-900/30 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/50 rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-xl md:text-2xl font-mono font-bold tracking-wider text-cyan-400 uppercase">Asset Vault</h1>
          </div>
          <p className="text-xs font-mono text-slate-400">
            INDEXED MEDIA REPOSITORY // GENERATED UGC CREATIVES & AI PROMPT ARCHIVES
          </p>
        </div>

        {/* SEARCH & TYPE TABS */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto font-mono">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH ASSETS..."
              className="w-full h-9 pl-9 pr-3 bg-[#05070a] border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div className="flex bg-[#05070a] border border-slate-800 p-1 rounded">
            {(['all', 'video', 'image'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all ${
                  activeFilter === tab
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ASSETS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 font-mono">
        
        {/* VIDEOS */}
        {(activeFilter === 'all' || activeFilter === 'video') && filteredVideos.map(vid => (
          <div key={vid.id} className="bg-[#0e1217] border border-cyan-900/30 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all group flex flex-col justify-between shadow-xl">
            <div>
              <div className="relative aspect-[9/16] bg-black overflow-hidden">
                <img
                  src={vid.posterUrl}
                  alt={vid.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
                
                <span className="absolute top-2.5 left-2.5 bg-cyan-500 text-black text-[9px] font-bold px-2 py-0.5 rounded flex items-center uppercase">
                  <Video className="w-3 h-3 mr-1" /> UGC VIDEO
                </span>

                <span className="absolute top-2.5 right-2.5 bg-black/80 border border-slate-700 text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded">
                  {vid.duration}
                </span>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                  <div className="text-xs font-bold text-white line-clamp-1">{vid.title}</div>
                  <div className="text-[9px] text-cyan-400">MODEL: {vid.avatarName} • {vid.createdAt}</div>
                </div>
              </div>

              <div className="p-3.5 space-y-2">
                <p className="text-xs text-slate-300 italic line-clamp-2">
                  "{vid.script.hook}"
                </p>
              </div>
            </div>

            <div className="p-3.5 pt-0 border-t border-slate-800 mt-2 flex items-center justify-between">
              <button
                onClick={() => setSelectedVideoModal(vid)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center"
              >
                <Eye className="w-3.5 h-3.5 mr-1" /> VIEW SCRIPT
              </button>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => copyText(vid.id, vid.script.caption + "\n\n" + vid.script.hashtags.join(' '))}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                  title="Copy Caption"
                >
                  {copiedId === vid.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => onDeleteVideo(vid.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10"
                  title="Delete Asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* IMAGES */}
        {(activeFilter === 'all' || activeFilter === 'image') && filteredImages.map(img => (
          <div key={img.id} className="bg-[#0e1217] border border-cyan-900/30 rounded-lg overflow-hidden hover:border-emerald-500/50 transition-all group flex flex-col justify-between shadow-xl">
            <div>
              <div className="relative aspect-square bg-black overflow-hidden">
                <img
                  src={img.url}
                  alt={img.title || 'Generated'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
                
                <span className="absolute top-2.5 left-2.5 bg-emerald-500 text-black text-[9px] font-bold px-2 py-0.5 rounded flex items-center uppercase">
                  <ImageIcon className="w-3 h-3 mr-1" /> {img.mode}
                </span>

                <span className="absolute top-2.5 right-2.5 bg-black/80 border border-slate-700 text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded">
                  {img.ratio}
                </span>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                  <div className="text-xs font-bold text-white line-clamp-1">{img.title || 'AI Image'}</div>
                  <div className="text-[9px] text-slate-400">{img.createdAt}</div>
                </div>
              </div>

              <div className="p-3.5 space-y-2">
                <p className="text-xs text-slate-300 line-clamp-2">
                  {img.prompt}
                </p>
              </div>
            </div>

            <div className="p-3.5 pt-0 border-t border-slate-800 mt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = img.url;
                  a.download = `UGCGen_${img.id}.jpg`;
                  a.click();
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> DOWNLOAD
              </button>

              <div className="flex items-center space-x-1.5">
                {img.caption && (
                  <button
                    onClick={() => copyText(img.id, img.caption + "\n\n" + (img.hashtags?.join(' ') || ''))}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                    title="Copy Caption"
                  >
                    {copiedId === img.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button
                  onClick={() => onDeleteImage(img.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10"
                  title="Delete Asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

      </div>

      {/* SCRIPT MODAL */}
      {selectedVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono">
          <div className="bg-[#0e1217] border border-cyan-500/50 rounded-lg max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-cyan-400 text-sm uppercase">{selectedVideoModal.title}</h3>
              <button onClick={() => setSelectedVideoModal(null)} className="text-slate-400 hover:text-white font-bold text-base">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded text-amber-200">
                <span className="font-bold block text-amber-400 mb-1">🔥 VIRAL HOOK</span>
                {selectedVideoModal.script.hook}
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 block uppercase text-[10px]">SCENE SEQUENCES:</span>
                {selectedVideoModal.script.body.map((b, i) => (
                  <div key={i} className="p-2 bg-[#05070a] border border-slate-800 rounded text-slate-300">
                    {i+1}. {b}
                  </div>
                ))}
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded text-emerald-200">
                <span className="font-bold block text-emerald-400 mb-1">🚀 CALL TO ACTION</span>
                {selectedVideoModal.script.cta}
              </div>

              <div className="p-3 bg-[#05070a] border border-slate-800 rounded text-slate-300">
                <span className="font-bold text-cyan-400 block mb-1">CAPTION</span>
                {selectedVideoModal.script.caption}
                <div className="mt-2 text-cyan-400 font-medium">
                  {selectedVideoModal.script.hashtags.join(' ')}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedVideoModal(null)}
              className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 rounded font-bold text-xs"
            >
              CLOSE TERMINAL
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
