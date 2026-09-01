import { Slide, ThemeConfig, FontOption, AspectRatio } from '../types';

export function generateStandaloneCarouselHtml(params: {
  topic: string;
  authorName: string;
  authorHandle: string;
  slides: Slide[];
  theme: ThemeConfig;
  font: FontOption;
  aspectRatio: AspectRatio;
}): string {
  const { topic, authorName, authorHandle, slides, theme, font, aspectRatio } = params;
  const isPortrait = aspectRatio === '4:5';
  const widthPx = 540;
  const heightPx = isPortrait ? 675 : 540;

  const slidesJson = JSON.stringify(slides);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(topic)} - CarouselX AI</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Poppins:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: ${theme.isDark ? '#090a0f' : '#f8f9fa'};
      --card-bg: ${theme.cardBg};
      --title-color: ${theme.titleColor};
      --body-color: ${theme.bodyColor};
      --accent-color: ${theme.accentColor};
      --badge-bg: ${theme.badgeBg};
      --badge-text: ${theme.badgeText};
      --border-color: ${theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'};
      --footer-color: ${theme.footerColor};
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--bg-color);
      color: var(--title-color);
      font-family: '${font.name}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .google-bar {
      height: 4px;
      width: 100%;
      background: linear-gradient(90deg, #4285f4, #ea4335, #fbbc05, #34a853);
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
    }

    .carousel-wrapper {
      position: relative;
      width: 100%;
      max-width: ${widthPx}px;
      margin: 0 auto;
    }

    .slide-viewport {
      width: 100%;
      height: ${heightPx}px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border-color);
      position: relative;
      background: var(--card-bg);
    }

    .slides-track {
      display: flex;
      height: 100%;
      transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .slide-item {
      flex: 0 0 100%;
      height: 100%;
      padding: 32px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      background: var(--card-bg);
      background-size: cover;
    }

    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 2;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .author-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--accent-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }

    .author-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--title-color);
    }

    .author-handle {
      font-size: 11px;
      color: var(--footer-color);
    }

    .slide-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background: var(--badge-bg);
      color: var(--badge-text);
      border: 1px solid var(--border-color);
    }

    .slide-content {
      margin: auto 0;
      z-index: 2;
    }

    .slide-title {
      font-size: 24px;
      font-weight: 800;
      line-height: 1.3;
      margin-bottom: 16px;
      color: var(--title-color);
    }

    .slide-body {
      font-size: 15px;
      line-height: 1.6;
      color: var(--body-color);
      margin-bottom: 16px;
    }

    .points-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .point-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 10px;
      background: ${theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
      border: 1px solid var(--border-color);
      font-size: 14px;
      color: var(--title-color);
    }

    .point-icon {
      color: var(--accent-color);
      font-weight: bold;
    }

    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid var(--border-color);
      font-size: 12px;
      color: var(--footer-color);
      z-index: 2;
    }

    .nav-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      width: 100%;
    }

    .btn-nav {
      background: ${theme.isDark ? '#1e293b' : '#ffffff'};
      border: 1px solid var(--border-color);
      color: var(--title-color);
      padding: 10px 18px;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .btn-nav:hover {
      background: var(--accent-color);
      color: #ffffff;
    }

    .dots-container {
      display: flex;
      gap: 6px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--border-color);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .dot.active {
      width: 24px;
      border-radius: 4px;
      background: var(--accent-color);
    }

    .toolbar {
      display: flex;
      gap: 10px;
      margin-top: 18px;
    }

    .tool-btn {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--body-color);
    }
    .tool-btn:hover {
      color: var(--title-color);
      border-color: var(--accent-color);
    }
  </style>
</head>
<body>

  <div class="carousel-wrapper">
    <div class="slide-viewport">
      <div class="google-bar"></div>
      <div class="slides-track" id="slidesTrack">
        ${slides
          .map(
            (slide, idx) => `
          <div class="slide-item">
            <div class="slide-header">
              <div class="author-info">
                <div class="author-avatar">${escapeHtml(authorName.charAt(0).toUpperCase() || 'C')}</div>
                <div>
                  <div class="author-name">${escapeHtml(authorName)}</div>
                  <div class="author-handle">${escapeHtml(authorHandle)}</div>
                </div>
              </div>
              <div class="slide-badge">
                ${slide.icon ? `<span>${getEmojiForIcon(slide.icon)}</span>` : ''}
                <span>${escapeHtml(slide.badge || `Slide 0${idx + 1}`)}</span>
              </div>
            </div>

            <div class="slide-content">
              <h2 class="slide-title">${escapeHtml(slide.title)}</h2>
              ${slide.body ? `<p class="slide-body">${escapeHtml(slide.body)}</p>` : ''}
              ${
                slide.points && slide.points.length > 0
                  ? `
                <ul class="points-list">
                  ${slide.points
                    .map(
                      (p) => `
                    <li class="point-item">
                      <span class="point-icon">✓</span>
                      <span>${escapeHtml(p)}</span>
                    </li>
                  `
                    )
                    .join('')}
                </ul>
              `
                  : ''
              }
            </div>

            <div class="slide-footer">
              <span>${escapeHtml(slide.footer_hint || 'Swipe 👉')}</span>
              <span>Slide ${idx + 1} / ${slides.length}</span>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>

    <div class="nav-controls">
      <button class="btn-nav" id="prevBtn" onclick="prevSlide()">← Prev</button>
      <div class="dots-container" id="dotsContainer">
        ${slides.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>`).join('')}
      </div>
      <button class="btn-nav" id="nextBtn" onclick="nextSlide()">Next →</button>
    </div>

    <div class="toolbar">
      <button class="tool-btn" onclick="copyCurrentSlideText()">📋 Copy Slide Text</button>
      <button class="tool-btn" onclick="toggleDarkMode()">🌓 Toggle Theme</button>
      <button class="tool-btn" onclick="copyAllText()">📑 Copy All Slides</button>
    </div>
  </div>

  <script>
    const slidesData = ${slidesJson};
    let currentIndex = 0;
    const totalSlides = slidesData.length;
    const track = document.getElementById('slidesTrack');
    const dots = document.querySelectorAll('.dot');

    function updateSlide() {
      track.style.transform = \`translateX(-\${currentIndex * 100}%)\`;
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
      document.getElementById('prevBtn').style.opacity = currentIndex === 0 ? '0.5' : '1';
      document.getElementById('nextBtn').style.opacity = currentIndex === totalSlides - 1 ? '0.5' : '1';
    }

    function nextSlide() {
      if (currentIndex < totalSlides - 1) {
        currentIndex++;
        updateSlide();
      }
    }

    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        updateSlide();
      }
    }

    function goToSlide(idx) {
      currentIndex = idx;
      updateSlide();
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    });

    // Touch Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    const viewport = document.querySelector('.slide-viewport');

    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    viewport.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) nextSlide();
      if (touchEndX - touchStartX > 50) prevSlide();
    });

    function copyCurrentSlideText() {
      const s = slidesData[currentIndex];
      const text = \`[\${s.badge || 'Slide ' + (currentIndex + 1)}]\n\${s.title}\n\n\${s.body || ''}\n\${(s.points || []).map(p => '• ' + p).join('\n')}\`;
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied Slide ' + (currentIndex + 1) + ' text to clipboard!');
      });
    }

    function copyAllText() {
      const text = slidesData.map((s, i) => {
        return \`--- Slide \${i + 1} ---\n\${s.badge ? '[' + s.badge + ']\n' : ''}\${s.title}\n\${s.body || ''}\n\${(s.points || []).map(p => '• ' + p).join('\n')}\n\`;
      }).join('\n');
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied all carousel slides text to clipboard!');
      });
    }

    let isDark = ${theme.isDark};
    function toggleDarkMode() {
      isDark = !isDark;
      const root = document.documentElement;
      if (isDark) {
        root.style.setProperty('--bg-color', '#090a0f');
        root.style.setProperty('--card-bg', '#131314');
        root.style.setProperty('--title-color', '#ffffff');
        root.style.setProperty('--body-color', '#94a3b8');
        root.style.setProperty('--border-color', 'rgba(255,255,255,0.1)');
      } else {
        root.style.setProperty('--bg-color', '#f8f9fa');
        root.style.setProperty('--card-bg', '#ffffff');
        root.style.setProperty('--title-color', '#202124');
        root.style.setProperty('--body-color', '#5f6368');
        root.style.setProperty('--border-color', 'rgba(0,0,0,0.12)');
      }
    }

    updateSlide();
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getEmojiForIcon(icon: string): string {
  const map: Record<string, string> = {
    sparkles: '✨',
    zap: '⚡',
    flame: '🔥',
    rocket: '🚀',
    brain: '🧠',
    lightbulb: '💡',
    trophy: '🏆',
    target: '🎯',
    shield: '🛡️',
    chart: '📊',
    diamond: '💎',
    bookmark: '📌',
    star: '⭐',
    heart: '❤️',
    code: '💻',
    globe: '🌐',
  };
  return map[icon] || '✨';
}
