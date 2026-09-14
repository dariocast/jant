import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
const screenshotsDir = path.join(publicDir, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}
const iconsDir = path.join(publicDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Generate SVG Icon
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="pastelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF3C7" />
      <stop offset="50%" stop-color="#E0F2FE" />
      <stop offset="100%" stop-color="#F3E8FF" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.15"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#pastelGrad)"/>
  <rect x="64" y="64" width="384" height="384" rx="96" fill="#FFFFFF" fill-opacity="0.85" filter="url(#shadow)"/>
  <g transform="translate(110, 110)">
    <!-- J.A.N.T. Stylized Notebook & Timer Icon -->
    <rect x="20" y="20" width="250" height="250" rx="36" fill="#F8FAFC" stroke="#0F172A" stroke-width="12"/>
    <line x1="60" y1="75" x2="230" y2="75" stroke="#334155" stroke-width="12" stroke-linecap="round"/>
    <line x1="60" y1="125" x2="190" y2="125" stroke="#64748B" stroke-width="10" stroke-linecap="round"/>
    <line x1="60" y1="175" x2="210" y2="175" stroke="#94A3B8" stroke-width="10" stroke-linecap="round"/>
    <!-- Checklist Checkmark -->
    <circle cx="215" cy="215" r="45" fill="#10B981"/>
    <polyline points="195,215 210,230 235,198" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Time Tracker Badge -->
    <circle cx="65" cy="215" r="32" fill="#F59E0B"/>
    <polyline points="65,198 65,215 78,215" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), iconSvg);
fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), iconSvg);
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), iconSvg);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), iconSvg);

// 2. Generate SVG Screenshot 1: Narrow - Notes & Tasks Board (1080x2340)
const screenshotNarrow1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 2340" width="1080" height="2340">
  <rect width="1080" height="2340" fill="#FBFBFA"/>
  <!-- Status Bar -->
  <rect width="1080" height="90" fill="#FFFFFF"/>
  <text x="70" y="60" font-family="-apple-system, sans-serif" font-size="34" font-weight="600" fill="#0F172A">9:41</text>
  <!-- Header -->
  <text x="70" y="190" font-family="'Playfair Display', Georgia, serif" font-size="70" font-weight="800" fill="#0F172A">J.A.N.T.</text>
  <text x="70" y="240" font-family="-apple-system, sans-serif" font-size="28" fill="#64748B">Just Another Notes &amp; Tasks • AI &amp; Time Logging</text>
  <!-- Search bar -->
  <rect x="60" y="280" width="960" height="100" rx="50" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="3"/>
  <text x="130" y="342" font-family="-apple-system, sans-serif" font-size="32" fill="#94A3B8">✨ Ricerca semantica o filtra note...</text>
  <!-- Card 1: Pastel Amber Note -->
  <rect x="60" y="420" width="960" height="380" rx="36" fill="#FEF3C7" stroke="#FDE68A" stroke-width="2"/>
  <text x="110" y="490" font-family="'Playfair Display', Georgia, serif" font-size="42" font-weight="700" fill="#78350F">Strategia Q4 &amp; Architettura</text>
  <text x="110" y="550" font-family="-apple-system, sans-serif" font-size="30" fill="#92400E">Rilascio motore SQLite-Vec con Transformers.js integrato localmente.</text>
  <rect x="110" y="700" width="160" height="50" rx="25" fill="#F59E0B" fill-opacity="0.2"/>
  <text x="140" y="735" font-family="-apple-system, sans-serif" font-size="24" font-weight="600" fill="#B45309">#backend</text>
  <rect x="760" y="690" width="210" height="65" rx="32" fill="#B45309"/>
  <text x="800" y="733" font-family="-apple-system, sans-serif" font-size="26" font-weight="700" fill="#FFFFFF">▶ 01:24:18</text>
  <!-- Card 2: Pastel Sky Task -->
  <rect x="60" y="830" width="960" height="420" rx="36" fill="#E0F2FE" stroke="#BAE6FD" stroke-width="2"/>
  <circle cx="120" cy="900" r="22" fill="#0284C7"/>
  <text x="160" y="910" font-family="'Playfair Display', Georgia, serif" font-size="42" font-weight="700" fill="#0C4A6E">Review PR Flutter Bloc</text>
  <text x="110" y="980" font-family="-apple-system, sans-serif" font-size="30" fill="#0369A1">Verificare sincronizzazione cache offline e stream reactive.</text>
  <rect x="110" y="1030" width="280" height="55" rx="28" fill="#FFFFFF" fill-opacity="0.7"/>
  <text x="140" y="1068" font-family="-apple-system, sans-serif" font-size="26" font-weight="600" fill="#0369A1">📅 Scadenza: Oggi, 18:00</text>
  <rect x="760" y="1140" width="210" height="65" rx="32" fill="#0284C7"/>
  <text x="800" y="1183" font-family="-apple-system, sans-serif" font-size="26" font-weight="700" fill="#FFFFFF">▶ 00:45:10</text>
  <!-- Card 3: Pastel Sage Note -->
  <rect x="60" y="1280" width="960" height="380" rx="36" fill="#DCFCE7" stroke="#BBF7D0" stroke-width="2"/>
  <text x="110" y="1350" font-family="'Playfair Display', Georgia, serif" font-size="42" font-weight="700" fill="#14532D">Idee Design UI/UX Pastel</text>
  <text x="110" y="1410" font-family="-apple-system, sans-serif" font-size="30" fill="#166534">Palette morbida crema e lavanda con Playfair Display e Plus Jakarta Sans.</text>
  <rect x="110" y="1560" width="130" height="50" rx="25" fill="#16A34A" fill-opacity="0.2"/>
  <text x="140" y="1595" font-family="-apple-system, sans-serif" font-size="24" font-weight="600" fill="#15803D">#design</text>
  <!-- Bottom bar -->
  <rect y="2180" width="1080" height="160" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <text x="200" y="2270" font-family="-apple-system, sans-serif" font-size="34" font-weight="700" fill="#0F172A">📝 Note</text>
  <text x="500" y="2270" font-family="-apple-system, sans-serif" font-size="34" font-weight="700" fill="#64748B">⏱ Timer</text>
  <text x="800" y="2270" font-family="-apple-system, sans-serif" font-size="34" font-weight="700" fill="#64748B">📊 Stats</text>
</svg>`;

// 3. Generate SVG Screenshot 2: Narrow - Time Tracker & Focus (1080x2340)
const screenshotNarrow2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 2340" width="1080" height="2340">
  <rect width="1080" height="2340" fill="#FAF5FF"/>
  <text x="70" y="180" font-family="'Playfair Display', Georgia, serif" font-size="64" font-weight="800" fill="#581C87">Atomic Time Tracker</text>
  <text x="70" y="235" font-family="-apple-system, sans-serif" font-size="28" fill="#7E22CE">Sessioni di concentrazione e log temporale persistente</text>
  <!-- Big Timer Card -->
  <rect x="60" y="320" width="960" height="600" rx="48" fill="#FFFFFF" stroke="#E9D5FF" stroke-width="3"/>
  <text x="120" y="420" font-family="'Playfair Display', Georgia, serif" font-size="38" font-weight="700" fill="#6B21A8">In corso: Refactor MCP Server API</text>
  <text x="120" y="580" font-family="-apple-system, monospace" font-size="110" font-weight="800" fill="#7C3AED">02:15:34</text>
  <rect x="120" y="680" width="380" height="90" rx="45" fill="#EF4444"/>
  <text x="210" y="738" font-family="-apple-system, sans-serif" font-size="34" font-weight="700" fill="#FFFFFF">⏹ Ferma Timer</text>
  <!-- Stats row -->
  <rect x="60" y="960" width="460" height="260" rx="36" fill="#FEF3C7" stroke="#FDE68A" stroke-width="2"/>
  <text x="100" y="1030" font-family="-apple-system, sans-serif" font-size="26" font-weight="600" fill="#92400E">Oggi Tracciati</text>
  <text x="100" y="1120" font-family="'Playfair Display', Georgia, serif" font-size="60" font-weight="800" fill="#78350F">4h 12m</text>
  <rect x="560" y="960" width="460" height="260" rx="36" fill="#DCFCE7" stroke="#BBF7D0" stroke-width="2"/>
  <text x="600" y="1030" font-family="-apple-system, sans-serif" font-size="26" font-weight="600" fill="#166534">Task Completati</text>
  <text x="600" y="1120" font-family="'Playfair Display', Georgia, serif" font-size="60" font-weight="800" fill="#14532D">8 / 10</text>
</svg>`;

// 4. Generate SVG Screenshot 3: Narrow - AI Semantic Search (1080x2340)
const screenshotNarrow3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 2340" width="1080" height="2340">
  <rect width="1080" height="2340" fill="#F8FAFC"/>
  <text x="70" y="180" font-family="'Playfair Display', Georgia, serif" font-size="64" font-weight="800" fill="#0F172A">Ricerca Semantica AI</text>
  <text x="70" y="235" font-family="-apple-system, sans-serif" font-size="28" fill="#64748B">Embeddings Transformers.js 100% Locali</text>
  <rect x="60" y="300" width="960" height="110" rx="55" fill="#FFFFFF" stroke="#6366F1" stroke-width="4"/>
  <text x="130" y="368" font-family="-apple-system, sans-serif" font-size="34" font-weight="600" fill="#1E293B">"progetti backend con database SQLite"</text>
  <!-- Match 1 -->
  <rect x="60" y="460" width="960" height="300" rx="36" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="800" y="490" width="180" height="50" rx="25" fill="#EEF2FF"/>
  <text x="825" y="525" font-family="-apple-system, sans-serif" font-size="24" font-weight="700" fill="#4F46E5">94.8% Match</text>
  <text x="110" y="530" font-family="'Playfair Display', Georgia, serif" font-size="38" font-weight="700" fill="#1E293B">Integrazione Hono + SQLite</text>
  <text x="110" y="590" font-family="-apple-system, sans-serif" font-size="28" fill="#64748B">Configurazione prisma locale con vettore BLOB per sqlite-vec...</text>
</svg>`;

// 5. Generate SVG Screenshot Wide: Desktop (1920x1080)
const screenshotWide = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <rect width="1920" height="1080" fill="#FBFBFA"/>
  <!-- Top Navigation -->
  <rect width="1920" height="80" fill="#FFFFFF" stroke="#F1F5F9" stroke-width="2"/>
  <text x="60" y="52" font-family="'Playfair Display', Georgia, serif" font-size="36" font-weight="800" fill="#0F172A">J.A.N.T.</text>
  <text x="180" y="50" font-family="-apple-system, sans-serif" font-size="18" fill="#64748B">Just Another Notes &amp; Tasks • Pastel Productivity Suite</text>
  <!-- Search Bar Center -->
  <rect x="600" y="16" width="720" height="48" rx="24" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>
  <text x="640" y="46" font-family="-apple-system, sans-serif" font-size="16" fill="#94A3B8">✨ Cerca qualsiasi idea, nota o task con AI semantica...</text>
  <!-- Quick Creation Bar -->
  <rect x="500" y="110" width="920" height="64" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
  <text x="540" y="150" font-family="-apple-system, sans-serif" font-size="18" fill="#64748B">Scrivi una nuova nota o imposta una data per creare un task...</text>
  <!-- 3 Columns Grid -->
  <!-- Col 1 -->
  <rect x="120" y="210" width="520" height="360" rx="24" fill="#FEF3C7" stroke="#FDE68A" stroke-width="1.5"/>
  <text x="150" y="260" font-family="'Playfair Display', Georgia, serif" font-size="26" font-weight="700" fill="#78350F">Architettura Backend Hono</text>
  <text x="150" y="305" font-family="-apple-system, sans-serif" font-size="16" fill="#92400E">Entità unificata, time tracking serializzato in JSON e Transformers.js locale.</text>
  <!-- Col 2 -->
  <rect x="700" y="210" width="520" height="420" rx="24" fill="#E0F2FE" stroke="#BAE6FD" stroke-width="1.5"/>
  <text x="730" y="260" font-family="'Playfair Display', Georgia, serif" font-size="26" font-weight="700" fill="#0C4A6E">Sviluppo App Mobile Flutter</text>
  <text x="730" y="305" font-family="-apple-system, sans-serif" font-size="16" fill="#0369A1">Implementare offline cache con SQLite locale, Bloc state management e sync.</text>
  <!-- Col 3 -->
  <rect x="1280" y="210" width="520" height="320" rx="24" fill="#F3E8FF" stroke="#E9D5FF" stroke-width="1.5"/>
  <text x="1310" y="260" font-family="'Playfair Display', Georgia, serif" font-size="26" font-weight="700" fill="#581C87">PWA Supercell Experience</text>
  <text x="1310" y="305" font-family="-apple-system, sans-serif" font-size="16" fill="#6B21A8">Modal interattivo con carosello di screenshot, guida iOS e Chromium prompt.</text>
</svg>`;

fs.writeFileSync(path.join(screenshotsDir, 'screenshot-narrow-1.svg'), screenshotNarrow1);
fs.writeFileSync(path.join(screenshotsDir, 'screenshot-narrow-2.svg'), screenshotNarrow2);
fs.writeFileSync(path.join(screenshotsDir, 'screenshot-narrow-3.svg'), screenshotNarrow3);
fs.writeFileSync(path.join(screenshotsDir, 'screenshot-wide.svg'), screenshotWide);

console.log('✅ PWA Assets & High-Resolution Screenshots Generated Successfully!');
