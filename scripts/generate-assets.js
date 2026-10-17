import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. Vector SVG for App Icon (Emerald circular gradient with golden double rings & heart)
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="50%" stop-color="#065f46" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="160" y1="160" x2="352" y2="352" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fde68a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="115" fill="url(#bgGrad)" />

  <!-- Inner Soft Glow Circle -->
  <circle cx="256" cy="256" r="210" stroke="white" stroke-opacity="0.08" stroke-width="2" fill="none" />
  <circle cx="256" cy="256" r="185" stroke="white" stroke-opacity="0.05" stroke-width="1.5" fill="none" />

  <!-- Central Symbol Group with Shadow -->
  <g filter="url(#shadow)">
    <!-- Right Ring -->
    <circle cx="286" cy="246" r="76" stroke="url(#goldGrad)" stroke-width="18" fill="none" />
    <!-- Left Ring -->
    <circle cx="226" cy="246" r="76" stroke="white" stroke-width="18" fill="none" />

    <!-- Islamic Heart Symbol inside the intersection -->
    <path d="M256 295 C256 295, 230 270, 218 252 C206 234, 212 216, 230 216 C244 216, 252 228, 256 235 C260 228, 268 216, 282 216 C300 216, 306 234, 294 252 C282 270, 256 295, 256 295 Z" 
          fill="#fbbf24" />

    <!-- Small Star Sparkle at Top -->
    <polygon points="256,120 262,138 280,144 262,150 256,168 250,150 232,144 250,138" fill="#fde68a" />
  </g>

  <!-- Elegant Arabic Subtitle Branding Curve -->
  <text x="256" y="420" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="1">
    مودة ورحمة
  </text>
  <text x="256" y="450" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="16" fill="#a7f3d0" text-anchor="middle" opacity="0.9">
    زواج إسلامي شرعي مبارك
  </text>
</svg>
`;

// 2. Vector SVG for Google Play Feature Graphic (1024 x 500)
const featureGraphicSvg = `
<svg width="1024" height="500" viewBox="0 0 1024 500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="featBg" x1="0" y1="0" x2="1024" y2="500" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#022c22" />
      <stop offset="35%" stop-color="#064e3b" />
      <stop offset="70%" stop-color="#065f46" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="goldFeat" x1="0" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fde68a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <pattern id="islamicPattern" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M30 0 L60 30 L30 60 L0 30 Z" stroke="white" stroke-width="0.8" stroke-opacity="0.04" fill="none" />
      <circle cx="30" cy="30" r="10" stroke="white" stroke-width="0.5" stroke-opacity="0.04" fill="none" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1024" height="500" fill="url(#featBg)" />
  <rect width="1024" height="500" fill="url(#islamicPattern)" />

  <!-- Left Side: App Emblem -->
  <g transform="translate(140, 110)">
    <!-- Glow -->
    <circle cx="140" cy="140" r="130" fill="#047857" fill-opacity="0.3" filter="blur(30px)" />
    <!-- Rings Symbol -->
    <circle cx="170" cy="140" r="65" stroke="url(#goldFeat)" stroke-width="16" fill="none" />
    <circle cx="110" cy="140" r="65" stroke="white" stroke-width="16" fill="none" />
    <path d="M140 180 C140 180, 118 158, 108 142 C98 126, 102 110, 118 110 C130 110, 137 120, 140 126 C143 120, 150 110, 162 110 C178 110, 182 126, 172 142 C162 158, 140 180, 140 180 Z" 
          fill="#fbbf24" />
    <!-- Stars -->
    <polygon points="140,40 144,52 156,56 144,60 140,72 136,60 124,56 136,52" fill="#fde68a" />
  </g>

  <!-- Right Side: Arabic Content & Value Proposition -->
  <g transform="translate(480, 100)">
    <!-- Pill Badge -->
    <rect x="220" y="20" width="280" height="36" rx="18" fill="#047857" fill-opacity="0.6" stroke="#34d399" stroke-width="1" />
    <text x="360" y="44" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" fill="#6ee7b7" text-anchor="middle">
      ✓ منصة موثوقة • ميثاق شرف شرعي
    </text>

    <!-- Main Title -->
    <text x="500" y="115" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" fill="#ffffff" text-anchor="end">
      تطبيق مودة ورحمة
    </text>

    <!-- Subtitle -->
    <text x="500" y="160" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="22" fill="#fbbf24" text-anchor="end">
      المنصة الأولى للزواج الإسلامي الشرعي الميسر
    </text>

    <!-- Features Bullet Points -->
    <text x="500" y="215" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="16" fill="#e2e8f0" text-anchor="end">
      • حماية تامة لخصوصية الصور والتواصل الجاد تحت ضوابط الشرع
    </text>
    <text x="500" y="250" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="16" fill="#e2e8f0" text-anchor="end">
      • بحث دقيق وشامل بكافة المواصفات والالتزام الديني والسكني
    </text>
    <text x="500" y="285" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="16" fill="#e2e8f0" text-anchor="end">
      • إشعارات فورية ومراسلات شرعية آمنة بين الأعضاء الجادين
    </text>

    <!-- Footer Trust Tag -->
    <text x="500" y="340" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="14" fill="#a7f3d0" text-anchor="end">
      ﴿ وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا ﴾
    </text>
  </g>
</svg>
`;

// 3. Vector SVG for Splash Screen (2732 x 2732)
const splashSvg = `
<svg width="2732" height="2732" viewBox="0 0 2732 2732" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="splashGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="0%" stop-color="#065f46" />
      <stop offset="60%" stop-color="#064e3b" />
      <stop offset="100%" stop-color="#022c22" />
    </radialGradient>
    <linearGradient id="splashGold" x1="0" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fde68a" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>

  <rect width="2732" height="2732" fill="url(#splashGrad)" />

  <g transform="translate(1366, 1200)">
    <!-- Central Double Rings Emblem -->
    <circle cx="100" cy="0" r="230" stroke="url(#splashGold)" stroke-width="50" fill="none" />
    <circle cx="-100" cy="0" r="230" stroke="white" stroke-width="50" fill="none" />

    <path d="M0 130 C0 130, -75 55, -110 0 C-145 -55, -130 -110, -75 -110 C-35 -110, -10 -75, 0 -55 C10 -75, 35 -110, 75 -110 C130 -110, 145 -55, 110 0 C75 55, 0 130, 0 130 Z" 
          fill="#fbbf24" />

    <polygon points="0,-350 15,-300 65,-285 15,-270 0,-220 -15,-270 -65,-285 -15,-300" fill="#fde68a" />

    <!-- Typography -->
    <text x="0" y="440" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="110" fill="#ffffff" text-anchor="middle">
      مودة ورحمة
    </text>
    <text x="0" y="550" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="46" fill="#a7f3d0" text-anchor="middle" letter-spacing="2">
      منصة الزواج الإسلامي الشرعي
    </text>
  </g>
</svg>
`;

async function main() {
  console.log("Starting high-resolution asset generation for Google Play and Android Studio...");

  const publicDir = path.join(rootDir, "public");
  const androidResDir = path.join(rootDir, "android", "app", "src", "main", "res");

  // Ensure directories exist
  [publicDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

  // 1. Web & Play Store Icons
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, "icon-512.png"));

  await sharp(Buffer.from(iconSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, "icon-192.png"));

  await sharp(Buffer.from(iconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));

  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, "playstore-icon.png"));

  console.log("✓ Web & Play Store icons generated (512x512, 192x192, 180x180)");

  // 2. Play Store Feature Graphic (1024 x 500)
  await sharp(Buffer.from(featureGraphicSvg))
    .resize(1024, 500)
    .png()
    .toFile(path.join(publicDir, "playstore-feature-graphic.png"));

  console.log("✓ Play Store Feature Graphic banner generated (1024x500)");

  // 3. Splash Screen (2732 x 2732)
  await sharp(Buffer.from(splashSvg))
    .resize(2732, 2732)
    .png()
    .toFile(path.join(publicDir, "splash.png"));

  console.log("✓ Full Splash Screen image generated (2732x2732)");

  // 4. Android Studio Mipmap Icons & Drawables (if android directory exists)
  if (fs.existsSync(androidResDir)) {
    const densities = [
      { folder: "mipmap-mdpi", size: 48 },
      { folder: "mipmap-hdpi", size: 72 },
      { folder: "mipmap-xhdpi", size: 96 },
      { folder: "mipmap-xxhdpi", size: 144 },
      { folder: "mipmap-xxxhdpi", size: 192 },
    ];

    for (const d of densities) {
      const targetDir = path.join(androidResDir, d.folder);
      fs.mkdirSync(targetDir, { recursive: true });

      // Standard square launcher
      await sharp(Buffer.from(iconSvg))
        .resize(d.size, d.size)
        .png()
        .toFile(path.join(targetDir, "ic_launcher.png"));

      // Round launcher
      await sharp(Buffer.from(iconSvg))
        .resize(d.size, d.size)
        .png()
        .toFile(path.join(targetDir, "ic_launcher_round.png"));
    }

    // Android Splash drawables
    const drawables = ["drawable", "drawable-land", "drawable-port"];
    for (const draw of drawables) {
      const targetDir = path.join(androidResDir, draw);
      fs.mkdirSync(targetDir, { recursive: true });

      await sharp(Buffer.from(splashSvg))
        .resize(1080, 1920, { fit: "cover" })
        .png()
        .toFile(path.join(targetDir, "splash.png"));
    }

    console.log("✓ Android Studio mipmaps & splash drawables generated across all densities");
  }

  console.log("\nAll Google Play and Android Studio assets successfully generated!");
}

main().catch((err) => {
  console.error("Asset generation error:", err);
  process.exit(1);
});
