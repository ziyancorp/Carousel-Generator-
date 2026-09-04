import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Trash2,
  Edit3,
  Wand2,
  Sparkles,
  Rocket,
  CheckCircle,
  Bookmark,
  Zap,
  Terminal,
  Download,
  Key,
  Sliders,
  Cpu,
  Shield,
  Box,
  Heart,
  MessageCircle,
  Share2,
  Lightbulb,
  Check
} from 'lucide-react';
import { Slide, AspectRatio, ThemeConfig, FontOption } from '../types';
import { AVAILABLE_ICONS, DEFAULT_THEME, DEFAULT_FONT } from '../constants/themes';

interface SlideCardProps {
  slide: Slide;
  index: number;
  totalSlides: number;
  aspectRatio: AspectRatio;
  theme?: ThemeConfig;
  font?: FontOption;
  authorName: string;
  authorHandle: string;
  onEdit: (slide: Slide) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onMoveLeft: (index: number) => void;
  onMoveRight: (index: number) => void;
  onQuickAiPolish: (slide: Slide, index: number) => void;
  isPolishing?: boolean;
}

// Render Title with highlighted phrase/word in accent color
function renderHighlightedTitle(title: string, highlightWord?: string, accentColor = '#ff4d36') {
  if (!highlightWord || !title.toLowerCase().includes(highlightWord.toLowerCase())) {
    return title;
  }
  const regex = new RegExp(`(${highlightWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = title.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} style={{ color: accentColor }} className="font-extrabold">
        {part}
      </span>
    ) : (
      part
    )
  );
}

// Render mock terminal / code snippet
function renderTerminalBlock(slide: Slide, theme: ThemeConfig) {
  if (!slide.codeSnippet) return null;

  const lines = slide.codeSnippet.split('\n');
  const isInputType = slide.terminalType === 'input' || slide.codeSnippet.includes('sk-');

  return (
    <div
      className="w-full rounded-xl overflow-hidden shadow-lg border text-left my-2 shrink-0"
      style={{
        backgroundColor: '#111827',
        borderColor: '#1f293d',
      }}
    >
      {/* Terminal Title Bar */}
      <div className="bg-[#0b101b] px-3 py-1.5 flex items-center justify-between border-b border-[#1f293d]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block"></span>
          <span className="text-[9px] font-mono text-gray-400 ml-2 font-medium tracking-tight truncate max-w-[180px]">
            {slide.terminalTitle || 'bash — zsh'}
          </span>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-2.5 text-[9.5px] font-mono leading-relaxed space-y-1 overflow-hidden">
        {isInputType ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between bg-[#1f293d] px-2.5 py-1 rounded-md border border-[#374151]">
              <span className="text-gray-300 font-mono text-[9px] break-all">
                {lines[0].replace('[Copy]', '').trim()}
              </span>
              <span className="bg-blue-600 text-white text-[8px] font-sans px-2 py-0.5 rounded font-semibold shrink-0 ml-1">
                Copy
              </span>
            </div>
            {lines.slice(1).map((line, lIdx) => (
              <div key={lIdx} className="text-[#4ade80] text-[9px] break-words">
                {line}
              </div>
            ))}
          </div>
        ) : (
          lines.map((line, lIdx) => {
            const isCommand = line.trim().startsWith('$');
            const isComment = line.trim().startsWith('#');
            const isSuccess = line.trim().startsWith('✓') || line.includes('ready') || line.includes('installed');
            const isArrow = line.trim().startsWith('►') || line.trim().startsWith('>');

            let textColor = 'text-gray-200';
            if (isComment) textColor = 'text-gray-500 italic';
            else if (isSuccess) textColor = 'text-emerald-400 font-semibold';
            else if (isArrow) textColor = 'text-cyan-400';

            return (
              <div key={lIdx} className={`${textColor} flex items-start gap-1 break-words`}>
                {isCommand && <span className="text-rose-400 font-bold shrink-0">$</span>}
                <span className="break-words">
                  {isCommand ? line.replace(/^\$\s*/, '') : line}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export const SlideCard: React.FC<SlideCardProps> = ({
  slide,
  index,
  totalSlides,
  aspectRatio,
  theme: userTheme,
  font: userFont,
  authorName,
  authorHandle,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveLeft,
  onMoveRight,
  onQuickAiPolish,
  isPolishing = false,
}) => {
  const theme = userTheme || DEFAULT_THEME;
  const font = userFont || DEFAULT_FONT;
  const isHook = index === 0 || slide.type === 'hook';
  const isCta = index === totalSlides - 1 || slide.type === 'cta';

  const cardWidth = aspectRatio === '4:5' ? 'w-[min(340px,calc(100vw-32px))]' : 'w-[min(360px,calc(100vw-32px))]';
  const cardHeight = aspectRatio === '4:5' ? 'h-[min(425px,calc((100vw-32px)*1.25))]' : 'h-[min(360px,calc(100vw-32px))]';

  const formattedNum = String(index + 1).padStart(2, '0');
  const formattedTotal = String(totalSlides).padStart(2, '0');

  const selectedIcon = AVAILABLE_ICONS.find((ic) => ic.id === slide.icon);
  const iconDisplay = selectedIcon ? selectedIcon.emoji : isHook ? '🔥' : isCta ? '📌' : '✨';

  // Dynamic typography scale depending on content density
  const titleLength = (slide.title || '').length;
  const hasManyElements = Boolean(
    (slide.points && slide.points.length > 0) && (slide.codeSnippet || slide.tip || slide.body)
  );

  const titleSizeClass =
    isHook
      ? titleLength > 45
        ? 'text-[17px]'
        : 'text-[20px]'
      : titleLength > 55
      ? 'text-[14.5px]'
      : titleLength > 35 || hasManyElements
      ? 'text-[16px]'
      : 'text-[18px]';

  // Action Icon Top-Right helper
  const renderActionIcon = () => {
    const act = slide.actionIcon;
    if (act === 'download') return <Download className="w-3.5 h-3.5 text-rose-500" />;
    if (act === 'key') return <Key className="w-3.5 h-3.5 text-blue-500" />;
    if (act === 'sliders') return <Sliders className="w-3.5 h-3.5 text-slate-700" />;
    if (act === 'cpu') return <Cpu className="w-3.5 h-3.5 text-rose-500" />;
    if (act === 'terminal') return <Terminal className="w-3.5 h-3.5 text-blue-600" />;
    if (act === 'shield') return <Shield className="w-3.5 h-3.5 text-slate-800" />;
    if (act === 'rocket') return <Rocket className="w-3.5 h-3.5 text-rose-500" />;
    return null;
  };

  const isTechGuideStyle = theme.id === 'tech-guide-pro' || theme.isDottedCanvas;

  return (
    <div className="flex flex-col items-center group relative shrink-0">
      {/* Top Action Toolbar */}
      <div className="w-full flex items-center justify-between px-2 mb-2 text-xs text-gray-400 opacity-85 group-hover:opacity-100 transition-opacity duration-200">
        <span className="font-mono text-[10px] text-gray-500 tracking-wider uppercase transition-colors duration-200">
          Slide {formattedNum} / {formattedTotal}
        </span>

        <div className="flex items-center gap-1 bg-[#111114] border border-[#2d2d35] rounded-lg p-0.5 shadow-md transition-all duration-200">
          <button
            type="button"
            title="Pindah Kiri"
            disabled={index === 0}
            onClick={() => onMoveLeft(index)}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#1a1a1f] rounded active:scale-90 transition-all duration-150 disabled:opacity-30 disabled:hover:bg-transparent disabled:active:scale-100"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>
          <button
            type="button"
            title="Pindah Kanan"
            disabled={index === totalSlides - 1}
            onClick={() => onMoveRight(index)}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#1a1a1f] rounded active:scale-90 transition-all duration-150 disabled:opacity-30 disabled:hover:bg-transparent disabled:active:scale-100"
          >
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            title="Poles Cepat AI"
            onClick={() => onQuickAiPolish(slide, index)}
            disabled={isPolishing}
            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50 rounded active:scale-90 transition-all duration-150"
          >
            <Wand2 className={`w-3 h-3 ${isPolishing ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            title="Edit Konten Slide"
            onClick={() => onEdit(slide)}
            className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 rounded active:scale-90 transition-all duration-150"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            type="button"
            title="Duplikat Slide"
            onClick={() => onDuplicate(index)}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#1a1a1f] rounded active:scale-90 transition-all duration-150"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            type="button"
            title="Hapus Slide"
            disabled={totalSlides <= 2}
            onClick={() => onDelete(index)}
            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded active:scale-90 transition-all duration-150 disabled:opacity-30 disabled:active:scale-100"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Rendered Slide Box (Target for Canvas Capture) */}
      <div
        id={`carousel-slide-${index}`}
        data-slide-index={index}
        style={{
          backgroundColor: isTechGuideStyle ? '#edf3fa' : theme.cardBg,
          color: theme.titleColor,
          backgroundImage: isTechGuideStyle
            ? 'radial-gradient(#cbd5e1 1.3px, transparent 1.3px)'
            : undefined,
          backgroundSize: isTechGuideStyle ? '18px 18px' : undefined,
        }}
        className={`carousel-card ${cardWidth} ${cardHeight} ${font.className} relative rounded-[28px] flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25)] border ${theme.borderClass} transition-all duration-300 ease-out hover:shadow-[0_24px_60px_rgba(0,0,0,0.3)] group-hover:scale-[1.01]`}
      >
        {/* ======================================================== */}
        {/* TECH GUIDE PRO / VIRAL TUTORIAL STYLE OVERLAYS & BLOBS  */}
        {/* ======================================================== */}
        {isTechGuideStyle && (
          <>
            {/* Top-Left: Brand Cube + Author Name */}
            <div className="absolute top-4 left-5 z-20 flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
              <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Box className="w-3 h-3" />
              </div>
              <span className="tracking-tight">{authorName || 'Arijal Meutuwah'}</span>
            </div>

            {/* Top-Right: Blue Quarter Circle + Slide Counter Pill + Red Tag Pill */}
            <div className="absolute -top-3 -right-3 w-28 h-28 bg-blue-600 rounded-bl-[60px] z-10 flex flex-col items-end pt-5 pr-5 pointer-events-none">
              <div className="bg-white text-slate-900 text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full shadow-sm">
                {formattedNum} / {formattedTotal}
              </div>
            </div>

            {/* Floating Tag pill on cover or highlighted slide */}
            {slide.tag && (
              <div className="absolute top-11 right-3 z-20 bg-rose-500 text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md shadow-md transform rotate-[-4deg] animate-pulse">
                {slide.tag}
              </div>
            )}

            {/* Bottom-Left: Yellow Organic Circle + Author Handle */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#facc15] rounded-full z-10 pointer-events-none flex items-center justify-center">
              <span className="text-[10px] text-amber-500 font-bold ml-6 -mt-3">✦</span>
            </div>
            <div className="absolute bottom-3 left-4 z-20 text-[10px] font-bold text-slate-900 tracking-tight flex items-center gap-1">
              <span>{authorHandle || '@abangjal'}</span>
            </div>

            {/* Bottom-Right: Red Organic Circle + Blue Arrow Button */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#ef4444] rounded-full z-10 pointer-events-none"></div>
            <div className="absolute bottom-3 right-4 z-20 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </>
        )}

        {/* Standard Dark / Google Glow Accents */}
        {!isTechGuideStyle && (
          <>
            {theme.googleAccentBorder && (
              <div className="google-gradient-bar h-1 w-full absolute top-0 left-0 z-20"></div>
            )}
            <div
              className="absolute -top-24 -left-24 w-72 h-72 rounded-full pointer-events-none blur-3xl opacity-30"
              style={{ backgroundColor: theme.accentColor }}
            />
            <div
              className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full pointer-events-none blur-3xl opacity-20"
              style={{ backgroundColor: theme.primaryGlow }}
            />
          </>
        )}

        {/* ======================================================== */}
        {/* CENTER CONTENT CARD CONTAINER                           */}
        {/* ======================================================== */}
        <div
          className={`z-10 flex-1 flex flex-col justify-between ${
            isTechGuideStyle
              ? 'mx-4 my-10 bg-white rounded-[22px] p-5 shadow-[0_12px_32px_rgba(30,58,138,0.06)] border border-slate-100 relative overflow-hidden'
              : 'p-7 relative'
          }`}
        >
          {/* Translucent Watermark Step Number in Tech Guide Background */}
          {isTechGuideStyle && (
            <div className="absolute -bottom-4 right-2 text-slate-100 font-black text-7xl select-none pointer-events-none font-mono tracking-tighter opacity-80">
              {slide.stepNumber || formattedNum}
            </div>
          )}

          {/* Top Card Header: Badge & Action Icon */}
          <div className="flex items-center justify-between shrink-0 mb-2">
            <div
              className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-sm"
              style={{
                backgroundColor: isTechGuideStyle ? '#ff4d36' : theme.badgeBg,
                color: isTechGuideStyle ? '#ffffff' : theme.badgeText,
              }}
            >
              <span>{slide.stepBadge || slide.badge || (isHook ? '🔥 GUIDE' : isCta ? 'TAKEAWAY' : `STEP ${formattedNum}`)}</span>
            </div>

            {/* Action Icon or Default Slide Counter */}
            {isTechGuideStyle ? (
              <div className="w-6 h-6 rounded-lg bg-slate-100/80 flex items-center justify-center">
                {renderActionIcon() || <span className="text-xs">{iconDisplay}</span>}
              </div>
            ) : (
              <div
                className="text-[10px] font-mono tracking-tighter opacity-60 font-semibold"
                style={{ color: theme.footerColor }}
              >
                {formattedNum}/{formattedTotal}
              </div>
            )}
          </div>

          {/* Main Card Body */}
          <div className="my-auto flex flex-col justify-center">
            {/* Title & Subtitle */}
            <h2
              className={`leading-[1.25] font-black tracking-tight break-words ${titleSizeClass}`}
              style={{ color: isTechGuideStyle ? '#0f172a' : theme.titleColor }}
            >
              {renderHighlightedTitle(slide.title, slide.highlightWord, theme.accentColor || '#ff4d36')}
            </h2>

            {slide.body && (
              <p
                className="text-[11.5px] leading-relaxed mt-1.5 break-words font-normal"
                style={{ color: isTechGuideStyle ? '#475569' : theme.bodyColor }}
              >
                {slide.body}
              </p>
            )}

            {/* Terminal / Code Snippet */}
            {slide.codeSnippet && renderTerminalBlock(slide, theme)}

            {/* Checklist / Points */}
            {slide.points && slide.points.length > 0 && (
              <div className="pt-2 space-y-1.5">
                {slide.points.slice(0, 4).map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-1.5 text-[10.5px]">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isTechGuideStyle
                          ? 'bg-slate-900 text-white'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span
                      className="leading-snug break-words flex-1 font-medium"
                      style={{ color: isTechGuideStyle ? '#1e293b' : theme.bodyColor }}
                    >
                      {pt}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tip / Callout Box */}
            {slide.tip && (
              <div className="mt-2.5 p-2 px-2.5 rounded-lg bg-blue-50/70 border-l-2 border-blue-600 flex items-start gap-1.5 text-[10px] text-slate-700">
                <span className="text-xs shrink-0 mt-0.5">💡</span>
                <span className="font-medium leading-snug break-words flex-1">{slide.tip}</span>
              </div>
            )}

            {/* CTA Button */}
            {(slide.ctaButtonText || isHook || isCta) && (
              <div className="mt-2.5">
                {slide.ctaButtonText ? (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-[10.5px] font-bold shadow-md shadow-blue-600/20">
                    <span>{slide.ctaButtonText}</span>
                  </div>
                ) : isCta ? (
                  <div className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-rose-500 text-white text-[11px] font-bold shadow-md shadow-rose-500/20">
                    <Bookmark className="w-3 h-3" />
                    <span>Save this guide</span>
                  </div>
                ) : null}
              </div>
            )}

            {/* Social Engagement bar on Closing Slide */}
            {isCta && isTechGuideStyle && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-around text-[10px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-slate-400" /> Like
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-slate-400" /> Comment
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="w-3 h-3 text-slate-400" /> Share
                </span>
                <span className="flex items-center gap-1">
                  <Bookmark className="w-3 h-3 text-slate-400" /> Save
                </span>
              </div>
            )}
          </div>

          {/* Standard Footer (for non-tech-guide or standard themes) */}
          {!isTechGuideStyle && (
            <div
              className="z-10 mt-auto pt-3 border-t flex justify-between items-center text-[10px] shrink-0"
              style={{
                borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              }}
            >
              <div className="flex items-center gap-1.5 font-medium truncate max-w-[170px]">
                <span style={{ color: theme.footerColor }} className="font-medium">
                  {authorHandle || (authorName ? `@${authorName.toLowerCase().replace(/\s+/g, '')}` : '@abangjal')}
                </span>
              </div>

              <div
                className="flex items-center gap-1 font-bold tracking-wider text-[10px]"
                style={{ color: theme.accentColor }}
              >
                <span>{slide.footer_hint || (isCta ? 'SIMPAN & SHARE' : 'GESER →')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
