import { EbookData } from '../types';
import { getDesignVariant } from '../data/designVariants';

export function generateStandaloneEbookHtml(ebook: EbookData): string {
  const variant = getDesignVariant(ebook.variantId);
  const safeTitle = escapeHtml(ebook.title);
  const safeSubtitle = escapeHtml(ebook.subtitle);
  const safeTag = escapeHtml(ebook.tag || 'E-BOOK PANDUAN PRAKTIS');
  const safeVariantName = escapeHtml(variant.name);
  const safeAuthor = escapeHtml(ebook.author || 'Arijal Meutuwah');

  // Variant Specific Customization Variables
  let heroGradient = 'linear-gradient(135deg, #0B2545 0%, #133E68 60%, #1A4B7C 100%)';
  let heroPattern = 'radial-gradient(rgba(255, 210, 0, 0.22) 1.5px, transparent 1.5px)';
  let heroPatternSize = '22px 22px';
  let heroTagBg = 'rgba(255, 210, 0, 0.15)';
  let heroTagColor = '#FFD200';
  let heroTagBorder = 'rgba(255, 210, 0, 0.4)';
  let heroBadge = '⭐ ' + variant.accentBadge;
  let primaryColor = '#0B2545';
  let accentColor = '#FFD200';

  if (variant.id === 'variant-2-wealth') {
    heroGradient = 'linear-gradient(135deg, #0A3622 0%, #114D32 60%, #1B6E47 100%)';
    heroPattern = 'repeating-linear-gradient(45deg, rgba(229, 169, 60, 0.08) 0px, rgba(229, 169, 60, 0.08) 2px, transparent 2px, transparent 12px)';
    heroPatternSize = 'auto';
    heroTagBg = 'rgba(229, 169, 60, 0.18)';
    heroTagColor = '#E5A93C';
    heroTagBorder = 'rgba(229, 169, 60, 0.5)';
    heroBadge = '👑 ' + variant.accentBadge;
    primaryColor = '#0A3622';
    accentColor = '#E5A93C';
  } else if (variant.id === 'variant-3-productivity') {
    heroGradient = 'linear-gradient(135deg, #181B1E 0%, #252A2F 100%)';
    heroPattern = 'linear-gradient(to right, rgba(16, 185, 129, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.14) 1px, transparent 1px)';
    heroPatternSize = '24px 24px';
    heroTagBg = 'rgba(16, 185, 129, 0.15)';
    heroTagColor = '#10B981';
    heroTagBorder = 'rgba(16, 185, 129, 0.4)';
    heroBadge = '⚡ ' + variant.accentBadge;
    primaryColor = '#1A1D20';
    accentColor = '#10B981';
  } else if (variant.id === 'variant-4-creator') {
    heroGradient = 'linear-gradient(135deg, #2E1065 0%, #4C1D95 50%, #FF6B4A 100%)';
    heroPattern = 'radial-gradient(rgba(255, 107, 74, 0.18) 1.5px, transparent 1.5px)';
    heroPatternSize = '18px 18px';
    heroTagBg = 'rgba(255, 107, 74, 0.2)';
    heroTagColor = '#FFA07A';
    heroTagBorder = 'rgba(255, 107, 74, 0.5)';
    heroBadge = '🚀 ' + variant.accentBadge;
    primaryColor = '#1E1B4B';
    accentColor = '#FF6B4A';
  } else if (variant.id === 'variant-5-dark-ai') {
    heroGradient = 'linear-gradient(135deg, #070B12 0%, #0D1B2E 50%, #0369A1 100%)';
    heroPattern = 'linear-gradient(90deg, rgba(0, 240, 255, 0.08) 1px, transparent 1px), linear-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px)';
    heroPatternSize = '28px 28px';
    heroTagBg = 'rgba(0, 240, 255, 0.15)';
    heroTagColor = '#00F0FF';
    heroTagBorder = 'rgba(0, 240, 255, 0.4)';
    heroBadge = '🤖 ' + variant.accentBadge;
    primaryColor = '#070B12';
    accentColor = '#00F0FF';
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle} - ${safeTag}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-body: #f8fafc;
            --bg-card: #ffffff;
            --bg-card-subtle: #f1f5f9;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --text-subtle: #94a3b8;
            --primary: ${primaryColor};
            --primary-hover: #1e3a8a;
            --primary-light: #eff6ff;
            --primary-border: #bfdbfe;
            --accent: ${accentColor};
            --border-color: #e2e8f0;
            --border-hover: #cbd5e1;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08);
            --radius-sm: 8px;
            --radius-md: 14px;
            --radius-lg: 20px;
            --radius-xl: 28px;
            --font-sans: 'Plus Jakarta Sans', -apple-system, sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
        }
        [data-theme="dark"] {
            --bg-body: #090d16;
            --bg-card: #111827;
            --bg-card-subtle: #1e293b;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --text-subtle: #64748b;
            --primary: ${primaryColor};
            --primary-hover: #60a5fa;
            --primary-light: #1e3a8a33;
            --primary-border: #1e40af;
            --border-color: #1f293d;
            --border-hover: #334155;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.5);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-sans); background-color: var(--bg-body); color: var(--text-main); line-height: 1.65; transition: background-color 0.3s ease, color 0.3s ease; }
        .app-layout { display: flex; min-height: 100vh; }
        .sidebar { width: 320px; background: var(--bg-card); border-right: 1px solid var(--border-color); position: fixed; top: 0; bottom: 0; left: 0; display: flex; flex-direction: column; z-index: 50; transition: transform 0.3s ease; }
        .sidebar-header { padding: 24px 20px 16px 20px; border-bottom: 1px solid var(--border-color); }
        .logo-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background: var(--primary-light); border: 1px solid var(--primary-border); border-radius: 100px; color: var(--primary); font-weight: 700; font-size: 0.78rem; text-transform: uppercase; margin-bottom: 12px; }
        .sidebar-title { font-size: 1.05rem; font-weight: 800; color: var(--text-main); line-height: 1.35; }
        .sidebar-nav { flex: 1; overflow-y: auto; padding: 16px 12px; }
        .nav-group-title { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-subtle); padding: 12px 12px 6px 12px; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: var(--radius-sm); color: var(--text-muted); text-decoration: none; font-size: 0.88rem; font-weight: 600; transition: all 0.2s ease; margin-bottom: 4px; }
        .nav-item:hover { background: var(--bg-card-subtle); color: var(--text-main); transform: translateX(3px); }
        .nav-item.active { background: var(--primary-light); color: var(--primary); font-weight: 700; }
        .nav-number { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: var(--bg-card-subtle); font-size: 0.75rem; font-weight: 700; color: var(--text-muted); }
        .nav-item.active .nav-number { background: var(--primary); color: #fff; }
        .sidebar-footer { padding: 16px 20px; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; }
        .btn-icon { background: var(--bg-card-subtle); border: 1px solid var(--border-color); color: var(--text-main); width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .btn-icon:hover { background: var(--border-color); }
        .main-wrapper { flex: 1; margin-left: 320px; min-height: 100vh; display: flex; flex-direction: column; }
        .topbar-mobile { display: none; position: sticky; top: 0; background: var(--bg-card); border-bottom: 1px solid var(--border-color); padding: 12px 16px; align-items: center; justify-content: space-between; z-index: 40; }
        .content-container { max-width: 920px; margin: 0 auto; padding: 48px 32px 100px 32px; width: 100%; }
        
        .ebook-hero { 
            background: ${heroGradient}; 
            background-image: ${heroPattern};
            background-size: ${heroPatternSize};
            border-radius: var(--radius-xl); 
            padding: 48px 36px; 
            color: #ffffff; 
            margin-bottom: 48px; 
            position: relative; 
            overflow: hidden; 
            box-shadow: var(--shadow-lg); 
            border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .hero-badges-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .hero-tag { display: inline-block; background: ${heroTagBg}; color: ${heroTagColor}; border: 1px solid ${heroTagBorder}; backdrop-filter: blur(8px); padding: 6px 14px; border-radius: 100px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
        .hero-variant-badge { display: inline-block; background: rgba(0, 0, 0, 0.35); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px); padding: 6px 14px; border-radius: 100px; font-size: 0.78rem; font-weight: 700; }
        .hero-title { font-size: 2.25rem; font-weight: 800; line-height: 1.25; margin-bottom: 16px; letter-spacing: -0.02em; }
        .hero-subtitle { font-size: 1.05rem; color: rgba(255, 255, 255, 0.9); max-width: 650px; line-height: 1.6; margin-bottom: 28px; }
        .hero-meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.2); }
        .hero-meta-label { font-size: 0.72rem; text-transform: uppercase; color: rgba(255, 255, 255, 0.75); font-weight: 600; display: block; }
        .hero-meta-value { font-size: 0.95rem; font-weight: 700; color: #ffffff; }
        
        .chapter-section { margin-bottom: 64px; scroll-margin-top: 80px; }
        .chapter-header { margin-bottom: 24px; }
        .chapter-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: var(--primary-light); color: var(--primary); border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
        .chapter-title { font-size: 1.65rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em; line-height: 1.3; }
        .chapter-desc { font-size: 1rem; color: var(--text-muted); margin-top: 6px; }
        
        .card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 28px 24px; margin-bottom: 24px; box-shadow: var(--shadow-sm); transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .card:hover { border-color: var(--border-hover); box-shadow: var(--shadow-md); }
        .card-header-flex { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
        .card-title-group { display: flex; align-items: center; gap: 12px; }
        .card-icon-pill { width: 42px; height: 42px; border-radius: var(--radius-md); background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .card-title { font-size: 1.15rem; font-weight: 700; color: var(--text-main); }
        
        .step-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin: 20px 0; }
        .step-card { background: var(--bg-card-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; }
        .step-badge { width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 0.82rem; font-weight: 800; margin-bottom: 12px; }
        .step-card-title { font-size: 0.98rem; font-weight: 700; margin-bottom: 6px; color: var(--text-main); }
        .step-card-text { font-size: 0.85rem; color: var(--text-muted); line-height: 1.55; }
        
        /* Mac Terminal Snippet Window Style */
        .prompt-container { background: #0d1117; border: 1px solid #30363d; border-radius: var(--radius-md); overflow: hidden; margin: 18px 0; box-shadow: var(--shadow-md); }
        .prompt-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #161b22; border-bottom: 1px solid #30363d; }
        .terminal-dots { display: inline-flex; align-items: center; gap: 6px; }
        .dot-red { width: 10px; height: 10px; border-radius: 50%; background: #ff5f56; display: inline-block; }
        .dot-yellow { width: 10px; height: 10px; border-radius: 50%; background: #ffbd2e; display: inline-block; }
        .dot-green { width: 10px; height: 10px; border-radius: 50%; background: #27c93f; display: inline-block; }
        .prompt-tag { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: ${accentColor}; font-family: var(--font-mono); }
        .btn-copy { background: #21262d; border: 1px solid #363b42; border-radius: var(--radius-sm); padding: 5px 12px; font-size: 0.75rem; font-weight: 600; color: #c9d1d9; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
        .btn-copy:hover { background: #30363d; color: #ffffff; border-color: #8b949e; }
        .prompt-content { padding: 18px; font-family: var(--font-mono); font-size: 0.85rem; color: #e6edf3; white-space: pre-wrap; word-break: break-word; line-height: 1.6; }
        
        .callout { padding: 18px 20px; border-radius: var(--radius-md); margin: 18px 0; display: flex; gap: 14px; align-items: flex-start; }
        .callout-info { background: var(--primary-light); border: 1px solid var(--primary-border); color: var(--text-main); }
        .callout-warning { background: #fef3c722; border: 1px solid #fde68a; color: var(--text-main); }
        .callout-success { background: #d1fae522; border: 1px solid #a7f3d0; color: var(--text-main); }
        .callout-icon { font-size: 1.25rem; flex-shrink: 0; margin-top: 2px; }
        .callout-body { font-size: 0.9rem; line-height: 1.6; }
        .callout-title { font-weight: 700; margin-bottom: 4px; color: var(--text-main); }
        
        .table-responsive { overflow-x: auto; margin: 20px 0; border-radius: var(--radius-md); border: 1px solid var(--border-color); }
        table { width: 100%; border-collapse: collapse; font-size: 0.88rem; text-align: left; }
        th { background: var(--bg-card-subtle); padding: 12px 16px; font-weight: 700; color: var(--text-main); border-bottom: 1px solid var(--border-color); }
        td { padding: 12px 16px; border-bottom: 1px solid var(--border-color); color: var(--text-muted); }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; }
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-blue { background: #dbeafe; color: #1e40af; }
        .badge-purple { background: #ede9fe; color: #5b21b6; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        
        .check-list { list-style: none; margin: 16px 0; }
        .check-list li { position: relative; padding: 10px 14px 10px 38px; margin-bottom: 8px; font-size: 0.9rem; color: var(--text-main); background: var(--bg-card-subtle); border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease; border: 1px solid var(--border-color); user-select: none; }
        .check-list li:hover { border-color: var(--primary); }
        .check-list li::before { content: ''; position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; border-radius: 4px; border: 2px solid var(--text-subtle); transition: all 0.2s; }
        .check-list li.checked { background: rgba(16, 185, 129, 0.1); border-color: #10b981; text-decoration: line-through; color: #10b981; }
        .check-list li.checked::before { background: #10b981; border-color: #10b981; content: '✓'; color: #ffffff; font-size: 0.72rem; font-weight: 800; display: flex; align-items: center; justify-content: center; }

        .golden-takeaway { background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.15) 100%); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: var(--radius-md); padding: 20px 24px; margin: 24px 0; }
        .golden-title { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #d97706; display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .golden-body { font-size: 0.92rem; font-weight: 500; color: var(--text-main); font-style: italic; line-height: 1.6; }
        
        .print-btn-bar { display: flex; gap: 8px; margin-bottom: 16px; }
        @media (max-width: 900px) {
            .sidebar { transform: translateX(-100%); }
            .sidebar.open { transform: translateX(0); }
            .main-wrapper { margin-left: 0; }
            .topbar-mobile { display: flex; }
            .content-container { padding: 24px 16px 80px 16px; }
            .hero-title { font-size: 1.65rem; }
            .hero-subtitle { font-size: 0.92rem; }
            .ebook-hero { padding: 32px 20px; border-radius: var(--radius-lg); }
            .card { padding: 20px 16px; }
        }
        @media print {
            .sidebar, .topbar-mobile, .btn-copy, .btn-icon, .sidebar-footer, .print-btn-bar { display: none !important; }
            .main-wrapper { margin-left: 0 !important; }
            .content-container { max-width: 100% !important; padding: 0 !important; }
            .card { break-inside: avoid; box-shadow: none !important; border: 1px solid #ccc !important; }
            .chapter-section { break-before: page; }
            .ebook-hero { background: ${primaryColor} !important; color: #fff !important; }
        }
    </style>
</head>
<body>

<div class="app-layout">
    <header class="topbar-mobile">
        <button class="btn-icon" id="btnToggleSidebar" aria-label="Buka Menu">☰</button>
        <span style="font-weight: 800; font-size: 0.95rem;">E-BOOK STUDIO</span>
        <button class="btn-icon" id="btnThemeMobile" aria-label="Ganti Tema">🌓</button>
    </header>

    <aside class="sidebar" id="sidebarNav">
        <div class="sidebar-header">
            <div class="logo-badge">🔥 ${safeTag}</div>
            <h1 class="sidebar-title">${safeTitle}</h1>
        </div>

        <nav class="sidebar-nav">
            <div class="nav-group-title">Navigasi Modul</div>
            ${ebook.modules
              .map(
                (m, idx) => `
                <a href="#${m.id || `modul-${idx + 1}`}" class="nav-item ${idx === 0 ? 'active' : ''}">
                    <span class="nav-number">${m.moduleNumber || idx + 1}</span>
                    <span>${escapeHtml(m.title)}</span>
                </a>
            `
              )
              .join('')}
        </nav>

        <div class="sidebar-footer">
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">${escapeHtml(ebook.edition || 'Edisi 2026 • Lynk.id')}</span>
            <button class="btn-icon" id="btnThemeDesktop" title="Ganti Tema Gelap/Terang">🌓</button>
        </div>
    </aside>

    <main class="main-wrapper">
        <div class="content-container">

            <div class="print-btn-bar">
                <button class="btn-copy" onclick="window.print()" style="padding: 8px 16px; font-size: 0.85rem; font-weight: 700; background: ${primaryColor}; color: #fff; border-color: ${primaryColor};">
                    🖨️ Cetak / Simpan PDF
                </button>
            </div>

            <!-- HERO COVER -->
            <section class="ebook-hero">
                <div class="hero-badges-row">
                    <span class="hero-tag">${safeTag}</span>
                    <span class="hero-variant-badge">${heroBadge}</span>
                </div>
                <h1 class="hero-title">${safeTitle}</h1>
                <p class="hero-subtitle">${safeSubtitle}</p>
                <div class="hero-meta-grid">
                    <div class="hero-meta-item"><span class="hero-meta-label">Penulis</span><span class="hero-meta-value">${safeAuthor}</span></div>
                    <div class="hero-meta-item"><span class="hero-meta-label">Tingkat Kesulitan</span><span class="hero-meta-value">${escapeHtml(ebook.difficulty || 'Pemula')}</span></div>
                    <div class="hero-meta-item"><span class="hero-meta-label">Platform</span><span class="hero-meta-value">${escapeHtml(ebook.platform || 'AI Tools')}</span></div>
                    <div class="hero-meta-item"><span class="hero-meta-label">Potensi Cuan</span><span class="hero-meta-value">${escapeHtml(ebook.monetization || 'Shopee / Lynk.id')}</span></div>
                </div>
            </section>

            <!-- MODULES -->
            ${ebook.modules
              .map(
                (m, idx) => {
                  let text = (m.title || '') + ' ' + (m.description || '');
                  if (m.introCard) text += ' ' + (m.introCard.body || '');
                  if (m.steps) text += ' ' + m.steps.map((s) => s.title + ' ' + s.text).join(' ');
                  const words = text.trim().split(/\s+/).filter(Boolean).length;
                  const minutes = Math.max(1, Math.ceil(words / 140));

                  return `
                <section id="${m.id || `modul-${idx + 1}`}" class="chapter-section">
                    <div class="chapter-header">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                            <span class="chapter-badge">${escapeHtml(m.badge || `Modul ${idx + 1}`)}</span>
                            <span class="badge badge-blue">⏱️ ~${minutes} Menit Baca</span>
                        </div>
                        <h2 class="chapter-title">${escapeHtml(m.title)}</h2>
                        ${m.description ? `<p class="chapter-desc">${escapeHtml(m.description)}</p>` : ''}
                    </div>

                    ${
                      m.introCard
                        ? `
                        <div class="card">
                            <div class="card-header-flex">
                                <div class="card-title-group">
                                    <div class="card-icon-pill">${m.introCard.icon || '📘'}</div>
                                    <div>
                                        <h3 class="card-title">${escapeHtml(m.introCard.title)}</h3>
                                        ${
                                          m.introCard.subtitle
                                            ? `<p style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(m.introCard.subtitle)}</p>`
                                            : ''
                                        }
                                        ${
                                          m.introCard.badge
                                            ? `<span class="badge badge-blue" style="margin-top: 4px;">${escapeHtml(m.introCard.badge)}</span>`
                                            : ''
                                        }
                                    </div>
                                </div>
                            </div>
                            <p style="font-size: 0.92rem; color: var(--text-main); margin-bottom: 16px;">
                                ${escapeHtml(m.introCard.body)}
                            </p>
                            ${
                              m.introCard.checklist && m.introCard.checklist.length > 0
                                ? `
                                <ul class="check-list">
                                    ${m.introCard.checklist
                                      .map((item) => `<li onclick="this.classList.toggle('checked')" title="Klik untuk menandai">${escapeHtml(item)}</li>`)
                                      .join('')}
                                </ul>
                            `
                                : ''
                            }
                        </div>
                    `
                        : ''
                    }

                    ${
                      m.steps && m.steps.length > 0
                        ? `
                        <div class="step-grid">
                            ${m.steps
                              .map(
                                (st) => `
                                <div class="step-card">
                                    ${
                                      st.badge
                                        ? `<span class="badge badge-blue" style="margin-bottom: 8px;">${escapeHtml(st.badge)}</span>`
                                        : `<div class="step-badge">${st.number}</div>`
                                    }
                                    <h4 class="step-card-title">${escapeHtml(st.title)}</h4>
                                    <p class="step-card-text">${escapeHtml(st.text)}</p>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    `
                        : ''
                    }

                    ${
                      m.table
                        ? `
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        ${m.table.headers
                                          .map((h) => `<th>${escapeHtml(h)}</th>`)
                                          .join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${m.table.rows
                                      .map(
                                        (row) => `
                                        <tr>
                                            ${row.cols
                                              .map((col, cIdx) => {
                                                const badgeCol = row.badgeCols?.find(
                                                  (b) => b.index === cIdx
                                                );
                                                if (badgeCol) {
                                                  return `<td><span class="badge ${badgeCol.colorClass || 'badge-blue'}">${escapeHtml(col)}</span></td>`;
                                                }
                                                return `<td>${escapeHtml(col)}</td>`;
                                              })
                                              .join('')}
                                        </tr>
                                    `
                                      )
                                      .join('')}
                                </tbody>
                            </table>
                        </div>
                    `
                        : ''
                    }

                    ${
                      m.prompts && m.prompts.length > 0
                        ? `
                        <div style="margin: 20px 0;">
                            ${m.prompts
                              .map(
                                (pr) => `
                                <div class="prompt-container">
                                    <div class="prompt-header">
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <span class="terminal-dots">
                                                <span class="dot-red"></span>
                                                <span class="dot-yellow"></span>
                                                <span class="dot-green"></span>
                                            </span>
                                            <span class="prompt-tag">${escapeHtml(pr.tag)}</span>
                                        </div>
                                        <button class="btn-copy" onclick="copyPrompt(this)">📋 Salin Prompt</button>
                                    </div>
                                    <div class="prompt-content">${escapeHtml(pr.content)}</div>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                    `
                        : ''
                    }

                    ${
                      m.callouts && m.callouts.length > 0
                        ? `
                        ${m.callouts
                          .map(
                            (c) => `
                            <div class="callout callout-${c.type || 'info'}">
                                <div class="callout-icon">${c.icon || (c.type === 'warning' ? '⚠️' : c.type === 'success' ? '🎁' : '💡')}</div>
                                <div class="callout-body">
                                    <div class="callout-title">${escapeHtml(c.title)}</div>
                                    ${escapeHtml(c.body)}
                                </div>
                            </div>
                        `
                          )
                          .join('')}
                    `
                        : ''
                    }

                    <div class="golden-takeaway">
                        <div class="golden-title"><span>🎯</span> <span>Golden Takeaway (Intisari Penting Modul)</span></div>
                        <div class="golden-body">"${escapeHtml(m.introCard?.subtitle || m.description || m.title)}: Kuasai dan praktekkan langkah praktis ini secara bertahap untuk membangun produk digital dan konten bernilai tinggi."</div>
                    </div>
                </section>
            `;
                }
              )
              .join('')}
        </div>
    </main>
</div>

<script>
    function copyPrompt(btn) {
        const container = btn.closest('.prompt-container');
        const content = container.querySelector('.prompt-content').innerText;
        navigator.clipboard.writeText(content).then(() => {
            const orig = btn.innerHTML;
            btn.innerHTML = '✅ Tersalin!';
            btn.style.background = '#10b981';
            btn.style.color = '#ffffff';
            setTimeout(() => {
                btn.innerHTML = orig;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        });
    }

    const btnToggle = document.getElementById('btnToggleSidebar');
    const sidebar = document.getElementById('sidebarNav');
    if (btnToggle && sidebar) {
        btnToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                sidebar.classList.remove('open');
            });
        });
    }

    function toggleTheme() {
        const curr = document.documentElement.getAttribute('data-theme');
        const target = curr === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', target);
        localStorage.setItem('theme', target);
    }
    document.getElementById('btnThemeMobile')?.addEventListener('click', toggleTheme);
    document.getElementById('btnThemeDesktop')?.addEventListener('click', toggleTheme);

    const saved = localStorage.getItem('theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }

    const sections = document.querySelectorAll('.chapter-section');
    const navItems = document.querySelectorAll('.nav-item');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.pageYOffset >= top) {
                current = section.getAttribute('id');
            }
        });
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#' + current) {
                item.classList.add('active');
            }
        });
    });
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
