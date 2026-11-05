/**
 * مولد أفاتارات SVG عصرية (Flat Illustration) لتطبيق التعارف
 * - 16 شخصية (8 شباب + 8 بنات) بملامح وألوان بشرة قريبة من الواقع المصري
 * - ستايل مسطح حديث: خلفيات باستيل، شعر وملابس عصرية، تعبيرات وجه ودودة
 * - تنوّع: كاجوال، رسمي، رياضي، كاب، نظارات، كيرلي، حجاب عصري وغير محجبة
 * - نفس الـ interface والـ ids القديمة (female_1..8 / male_1..8) فمش هتكسر أي بيانات محفوظة
 */

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export interface CartoonAvatar {
  id: string;
  gender: "male" | "female";
  label: string;
  category: string;
  url: string;
}

// ==========================================
// أدوات الرسم المشتركة
// ==========================================

type Skin = { base: string; shade: string };

const SKIN = {
  fair: { base: "#F6D5B8", shade: "#E8BB99" },
  wheat: { base: "#E8BC94", shade: "#D6A178" },
  tan: { base: "#D19C73", shade: "#BB835B" },
  brown: { base: "#B67F58", shade: "#9E6944" },
} satisfies Record<string, Skin>;

const HAIR = {
  black: "#1E1A1A",
  darkBrown: "#3A261C",
  brown: "#5B3A29",
  lightBrown: "#8A5A3C",
  saltPepper: "#5E5E66",
};

const BODY = "M18 160 C18 133 46 120 80 120 C114 120 142 133 142 160 Z";

const mirror = (s: string) => `<g transform="translate(160 0) scale(-1 1)">${s}</g>`;

// ---------- الملابس ----------

const tee = (color: string, skin: Skin, neck: "round" | "v" = "round") =>
  `<path d="${BODY}" fill="${color}"/>` +
  (neck === "v"
    ? `<path d="M65 121 L80 143 L95 121 Z" fill="${skin.shade}"/>`
    : `<path d="M64 121 Q80 141 96 121 Z" fill="${skin.shade}"/>`);

const polo = (color: string, collar: string, skin: Skin) =>
  `<path d="${BODY}" fill="${color}"/>` +
  `<path d="M70 121 L80 137 L90 121 Z" fill="${skin.shade}"/>` +
  `<path d="M62 121 L76 126 L80 139 L66 134 Z" fill="${collar}"/>` +
  `<path d="M98 121 L84 126 L80 139 L94 134 Z" fill="${collar}"/>` +
  `<path d="M80 139 L80 160" stroke="#000" stroke-opacity=".12" stroke-width="1.5"/>`;

const shirtTie = (shirt: string, tie: string, skin: Skin) =>
  `<path d="${BODY}" fill="${shirt}"/>` +
  `<path d="M70 121 L80 134 L90 121 Z" fill="${skin.shade}"/>` +
  `<path d="M62 121 L77 127 L80 137 L66 133 Z" fill="#fff"/>` +
  `<path d="M98 121 L83 127 L80 137 L94 133 Z" fill="#fff"/>` +
  `<path d="M77 131 L83 131 L82 137 L78 137 Z" fill="${tie}"/>` +
  `<path d="M78 137 L74 148 L80 158 L86 148 L82 137 Z" fill="${tie}"/>`;

const hoodie = (color: string, hood: string, skin: Skin) =>
  `<path d="${BODY}" fill="${color}"/>` +
  `<path d="M54 123 C54 106 68 104 80 116 C92 104 106 106 106 123 C106 136 94 142 80 142 C66 142 54 136 54 123 Z" fill="${hood}"/>` +
  `<path d="M66 121 Q80 139 94 121 Z" fill="${skin.shade}"/>` +
  `<path d="M72 136 L71 152 M88 136 L89 152" stroke="#fff" stroke-width="2" stroke-linecap="round"/>` +
  `<circle cx="71" cy="153" r="2" fill="#fff"/><circle cx="89" cy="153" r="2" fill="#fff"/>`;

const jacket = (outer: string, lapel: string, inner: string, skin: Skin, stitch = false) =>
  `<path d="${BODY}" fill="${outer}"/>` +
  `<path d="M65 121 L80 152 L95 121 Z" fill="${inner}"/>` +
  `<path d="M68 121 L80 139 L92 121 Z" fill="${skin.shade}"/>` +
  `<path d="M58 124 L67 120 L80 150 L70 160 Z" fill="${lapel}"/>` +
  `<path d="M102 124 L93 120 L80 150 L90 160 Z" fill="${lapel}"/>` +
  (stitch
    ? `<path d="M60 130 L71 156 M100 130 L89 156" stroke="#F4D58D" stroke-width="1.2" stroke-dasharray="3 2"/>`
    : "");

const zipJacket = (color: string, stripe: string, skin: Skin) =>
  `<path d="${BODY}" fill="${color}"/>` +
  `<path d="M70 121 L80 130 L90 121 Z" fill="${skin.shade}"/>` +
  `<path d="M63 121 L80 133 L97 121 L97 128 L80 140 L63 128 Z" fill="${stripe}"/>` +
  `<path d="M80 136 L80 160" stroke="#fff" stroke-width="2"/>` +
  `<path d="M30 160 C30 146 34 140 40 135 M130 160 C130 146 126 140 120 135" stroke="${stripe}" stroke-width="3" fill="none" stroke-linecap="round"/>`;

// ---------- شعر الرجالة ----------

const maleFade = (c: string) =>
  `<path d="M53 68 C50 42 62 27 80 27 C98 27 110 42 107 68 C105 56 100 48 92 46 C84 44 70 44 62 48 C57 52 54 58 53 68 Z" fill="${c}"/>`;

const maleQuiff = (c: string) =>
  `<path d="M52 66 C46 40 60 22 84 22 C104 22 112 40 108 66 C106 54 102 46 94 42 C82 38 66 42 60 50 C56 55 54 60 52 66 Z" fill="${c}"/>` +
  `<path d="M58 42 C60 24 86 14 100 26 C108 32 108 40 106 44 C96 34 78 32 58 42 Z" fill="${c}"/>`;

const maleSidePart = (c: string) =>
  `<path d="M52 68 C46 38 64 22 84 24 C102 26 112 42 108 68 C106 56 100 46 90 42 C80 48 64 46 56 54 C54 58 53 62 52 68 Z" fill="${c}"/>` +
  `<path d="M64 36 Q78 28 94 34" stroke="#fff" stroke-opacity=".18" stroke-width="2" fill="none" stroke-linecap="round"/>`;

const maleBuzz = (c: string) =>
  `<path d="M54 64 C52 44 64 32 80 32 C96 32 108 44 106 64 C102 52 94 46 80 46 C66 46 58 52 54 64 Z" fill="${c}" opacity=".92"/>`;

const curlyCircles = (pts: number[][], c: string) =>
  pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join("");

const maleCurly = (c: string) =>
  curlyCircles(
    [[56, 50, 10], [64, 38, 11], [76, 32, 12], [88, 32, 12], [100, 38, 11], [108, 50, 10]],
    c
  ) + `<path d="M53 66 C52 46 66 36 80 36 C94 36 108 46 107 66 C102 54 94 50 80 50 C66 50 58 54 53 66 Z" fill="${c}"/>`;

const cap = (color: string, hair: string) =>
  `<path d="M52 60 L52 70 C52 66 53 63 55 60 Z M108 60 L108 70 C108 66 107 63 105 60 Z" fill="${hair}"/>` +
  `<path d="M52 58 C50 34 66 24 80 24 C94 24 110 34 108 58 Z" fill="${color}"/>` +
  `<path d="M46 58 Q80 66 114 58 Q114 52 106 52 L54 52 Q46 52 46 58 Z" fill="${color}"/>` +
  `<path d="M46 58 Q80 66 114 58" stroke="#000" stroke-opacity=".18" stroke-width="2" fill="none"/>` +
  `<circle cx="80" cy="30" r="2.5" fill="#000" fill-opacity=".2"/>`;

// ---------- لحى ----------

const stubble = (c: string) =>
  `<g clip-path="url(#h)"><path d="M50 74 C52 100 66 106 80 106 C94 106 108 100 110 74 C104 86 96 90 80 90 C64 90 56 86 50 74 Z" fill="${c}" opacity=".22"/></g>`;

const trimmedBeard = (c: string) =>
  `<path d="M52 74 C52 98 64 108 80 108 C96 108 108 98 108 74 C106 84 100 87 94 87 C90 83 70 83 66 87 C60 87 54 84 52 74 Z" fill="${c}"/>`;

// ---------- شعر البنات ----------

type FemaleHair = { back: string; mid: string; front: string };

const longHair = (c: string, wavy = false, flip = false): FemaleHair => {
  const back = wavy
    ? `<path d="M46 72 C38 44 56 20 80 20 C104 20 122 44 114 72 C112 96 124 108 120 124 C118 134 124 140 126 152 L34 152 C36 140 42 134 40 124 C36 108 48 96 46 72 Z" fill="${c}"/>`
    : `<path d="M48 70 C42 40 58 20 80 20 C102 20 118 40 112 70 C112 100 118 118 124 138 L36 138 C42 118 48 100 48 70 Z" fill="${c}"/>`;
  const lock = `<path d="M48 76 C44 98 44 118 38 140 C44 148 54 146 56 138 C56 116 58 96 58 80 Z" fill="${c}"/>`;
  const sweep = `<path d="M52 72 C48 42 64 24 82 24 C100 24 112 42 108 72 C106 60 100 50 94 46 C84 56 66 58 56 66 C54 68 53 70 52 72 Z" fill="${c}"/>`;
  return { back, mid: lock + mirror(lock), front: flip ? mirror(sweep) : sweep };
};

const bobHair = (c: string): FemaleHair => ({
  back: `<path d="M44 72 C40 36 60 18 80 18 C100 18 120 36 116 72 C116 92 114 104 108 110 L52 110 C46 104 44 92 44 72 Z" fill="${c}"/>`,
  mid: "",
  front: `<path d="M52 66 C50 40 64 26 80 26 C96 26 110 40 108 66 C98 54 62 54 52 66 Z" fill="${c}"/>`,
});

const curlyHair = (c: string): FemaleHair => ({
  back: curlyCircles(
    [[50, 60, 16], [46, 80, 15], [50, 100, 14], [110, 60, 16], [114, 80, 15], [110, 100, 14], [60, 36, 16], [80, 28, 18], [100, 36, 16]],
    c
  ) + `<ellipse cx="80" cy="66" rx="40" ry="38" fill="${c}"/>`,
  mid: "",
  front:
    curlyCircles([[58, 48, 10], [70, 40, 11], [82, 38, 11], [94, 40, 11], [104, 48, 10]], c) +
    `<path d="M54 66 C52 46 66 40 80 40 C94 40 108 46 106 66 C100 54 92 52 80 52 C68 52 60 54 54 66 Z" fill="${c}"/>`,
});

const bunHair = (c: string): FemaleHair => ({
  back:
    `<circle cx="80" cy="17" r="13" fill="${c}"/>` +
    `<path d="M52 70 C48 40 62 24 80 24 C98 24 112 40 108 70 Z" fill="${c}"/>`,
  mid: "",
  front:
    `<path d="M53 68 C50 42 64 30 80 30 C96 30 110 42 107 68 C104 56 96 48 80 48 C64 48 56 56 53 68 Z" fill="${c}"/>` +
    `<path d="M70 12 Q80 8 90 12" stroke="#fff" stroke-opacity=".2" stroke-width="2" fill="none" stroke-linecap="round"/>`,
});

// ---------- حجاب عصري ----------

const hijab = (color: string, shade: string): FemaleHair => ({
  back: "",
  mid:
    `<path d="M42 72 C40 34 58 20 80 20 C102 20 120 34 118 72 C118 96 128 112 130 138 C112 148 48 148 30 138 C32 112 42 96 42 72 Z" fill="${color}"/>` +
    `<path d="M40 122 Q60 134 80 128 Q100 134 120 122" stroke="${shade}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>` +
    `<path d="M62 142 Q80 148 98 142" stroke="${shade}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>`,
  front:
    `<path d="M42 70 a38 42 0 1 0 76 0 a38 42 0 1 0 -76 0 Z M56 75 a24 28 0 1 0 48 0 a24 28 0 1 0 -48 0 Z" fill="${color}" fill-rule="evenodd"/>` +
    `<path d="M56 75 a24 28 0 1 1 48 0" stroke="${shade}" stroke-width="2" fill="none" opacity=".55"/>` +
    `<circle cx="104" cy="104" r="3" fill="#F4D58D"/>`,
});

// ---------- إكسسوارات ----------

const glasses = (c: string) =>
  `<circle cx="69" cy="72" r="9.5" fill="#fff" fill-opacity=".18" stroke="${c}" stroke-width="2.2"/>` +
  `<circle cx="91" cy="72" r="9.5" fill="#fff" fill-opacity=".18" stroke="${c}" stroke-width="2.2"/>` +
  `<path d="M78.5 71 Q80 69 81.5 71 M59.5 71 L53 69 M100.5 71 L107 69" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`;

const earrings = (c = "#F4C95D") =>
  `<circle cx="52.5" cy="85" r="2.8" fill="${c}"/><circle cx="107.5" cy="85" r="2.8" fill="${c}"/>`;

// ---------- ملامح الوجه ----------

type Mouth = "smile" | "open" | "smirk";

function features(o: { skin: Skin; female: boolean; mouth: Mouth; brow: string; lip?: string }): string {
  const { skin, female, mouth, brow, lip = "#C95A6B" } = o;
  const sw = female ? 2 : 2.8;
  const browsY = female ? 62 : 63;
  const brows =
    `<path d="M61 ${browsY + 1} Q68 ${browsY - 3} 76 ${browsY}" stroke="${brow}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>` +
    `<path d="M84 ${browsY} Q92 ${browsY - 3} 99 ${browsY + 1}" stroke="${brow}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`;
  const eyes =
    `<ellipse cx="69" cy="72" rx="3.2" ry="3.8" fill="#2B2220"/><ellipse cx="91" cy="72" rx="3.2" ry="3.8" fill="#2B2220"/>` +
    `<circle cx="70.2" cy="70.8" r="1.1" fill="#fff"/><circle cx="92.2" cy="70.8" r="1.1" fill="#fff"/>`;
  const lashes = female
    ? `<path d="M64 70 Q69 65.5 74 69.5 M86 69.5 Q91 65.5 96 70" stroke="#2B2220" stroke-width="2" fill="none" stroke-linecap="round"/>` +
      `<path d="M64 70 L62 68.5 M96 70 L98 68.5" stroke="#2B2220" stroke-width="1.6" stroke-linecap="round"/>`
    : "";
  const nose = `<path d="M80 76 Q83 82 79 83" stroke="${skin.shade}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const blush = `<ellipse cx="60" cy="84" rx="5" ry="3" fill="#F58C8C" opacity="${female ? 0.3 : 0.18}"/><ellipse cx="100" cy="84" rx="5" ry="3" fill="#F58C8C" opacity="${female ? 0.3 : 0.18}"/>`;
  const mouthSvg =
    mouth === "open"
      ? `<path d="M72 89 Q80 91 88 89 Q86 99 80 99 Q74 99 72 89 Z" fill="#fff" stroke="${female ? lip : "#8B3A3A"}" stroke-width="1.8" stroke-linejoin="round"/>`
      : mouth === "smirk"
        ? `<path d="M74 91 Q81 96 88 90" stroke="${female ? lip : "#9B3B3B"}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
        : `<path d="M72 90 Q80 98 88 90" stroke="${female ? lip : "#9B3B3B"}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  return blush + brows + eyes + lashes + nose + mouthSvg;
}

// ==========================================
// تجميع الأفاتار
// ==========================================

interface Spec {
  skin: Skin;
  bg: [string, string];
  outfit: string;
  female?: boolean;
  hair?: FemaleHair;
  maleHair?: string;
  beard?: string;
  glasses?: string;
  earrings?: boolean;
  noEars?: boolean;
  mouth: Mouth;
  brow: string;
  lip?: string;
}

function build(s: Spec): string {
  const { skin } = s;
  const female = !!s.female;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs><clipPath id="c"><circle cx="80" cy="80" r="80"/></clipPath><clipPath id="h"><ellipse cx="80" cy="72" rx="27" ry="30"/></clipPath></defs>
  <g clip-path="url(#c)">
    <rect width="160" height="160" fill="${s.bg[0]}"/>
    <circle cx="130" cy="30" r="30" fill="${s.bg[1]}" opacity=".7"/>
    <circle cx="24" cy="138" r="22" fill="${s.bg[1]}" opacity=".55"/>
    ${s.hair?.back ?? ""}
    <path d="M70 92 L70 124 Q80 130 90 124 L90 92 Z" fill="${skin.shade}"/>
    ${s.outfit}
    ${s.hair?.mid ?? ""}
    ${s.noEars ? "" : `<circle cx="53" cy="77" r="5.5" fill="${skin.base}"/><circle cx="107" cy="77" r="5.5" fill="${skin.base}"/>`}
    <ellipse cx="80" cy="72" rx="27" ry="30" fill="${skin.base}"/>
    ${s.beard ?? ""}
    ${features({ skin, female, mouth: s.mouth, brow: s.brow, lip: s.lip })}
    ${s.maleHair ?? ""}
    ${s.hair?.front ?? ""}
    ${s.glasses ? glasses(s.glasses) : ""}
    ${s.earrings ? earrings() : ""}
  </g>
</svg>`;
}

// ==========================================
// 8 أفاتارات بنات
// ==========================================

// 1. شعر طويل ناعم وبلوزة وردي
const female1 = svgToDataUrl(
  build({
    female: true, skin: SKIN.fair, bg: ["#FDE8EF", "#F9C9DA"],
    hair: longHair(HAIR.black), outfit: tee("#E88FA6", SKIN.fair, "v"),
    earrings: true, mouth: "smile", brow: HAIR.black,
  })
);

// 2. بوب عصري مع بليزر بيج
const female2 = svgToDataUrl(
  build({
    female: true, skin: SKIN.wheat, bg: ["#EFE9E1", "#DCD0C2"],
    hair: bobHair(HAIR.darkBrown), outfit: jacket("#CDBBA7", "#B9A590", "#FFFFFF", SKIN.wheat),
    earrings: true, mouth: "smirk", brow: HAIR.darkBrown, lip: "#B5475A",
  })
);

// 3. كيرلي طبيعي وتيشيرت بنفسجي
const female3 = svgToDataUrl(
  build({
    female: true, skin: SKIN.brown, bg: ["#EDE6FA", "#D5C7F3"],
    hair: curlyHair(HAIR.black), outfit: tee("#7C5CBF", SKIN.brown),
    earrings: true, mouth: "open", brow: HAIR.black, lip: "#A8374F",
  })
);

// 4. كعكة عالية ونظارة
const female4 = svgToDataUrl(
  build({
    female: true, skin: SKIN.tan, bg: ["#DDF4F1", "#BDE8E3"],
    hair: bunHair(HAIR.darkBrown), outfit: tee("#4DA3A0", SKIN.tan),
    glasses: "#D28A6A", mouth: "smile", brow: HAIR.darkBrown, lip: "#B5475A",
  })
);

// 5. حجاب عصري وردي بودرة
const female5 = svgToDataUrl(
  build({
    female: true, skin: SKIN.fair, bg: ["#FFF0F4", "#FFD6E2"], noEars: true,
    hair: hijab("#E7A5B5", "#C98598"), outfit: tee("#F6EFE8", SKIN.fair),
    mouth: "smile", brow: "#4A3028",
  })
);

// 6. حجاب زيتي ونظارة تورتواز
const female6 = svgToDataUrl(
  build({
    female: true, skin: SKIN.wheat, bg: ["#EEF4E2", "#D7E6B8"], noEars: true,
    hair: hijab("#7E8F5C", "#5F6F43"), outfit: tee("#EDE4D3", SKIN.wheat),
    glasses: "#7A4B2A", mouth: "open", brow: "#3A261C", lip: "#B5475A",
  })
);

// 7. حجاب كحلي أنيق
const female7 = svgToDataUrl(
  build({
    female: true, skin: SKIN.tan, bg: ["#E2EAF4", "#C2D3EA"], noEars: true,
    hair: hijab("#34495E", "#243445"), outfit: tee("#F3F4F6", SKIN.tan),
    mouth: "smirk", brow: "#2B1D17", lip: "#A8374F",
  })
);

// 8. شعر مموج بني فاتح وتوب خردلي
const female8 = svgToDataUrl(
  build({
    female: true, skin: SKIN.wheat, bg: ["#FFF3DD", "#FFDDA5"],
    hair: longHair(HAIR.lightBrown, true, true), outfit: tee("#E0A03A", SKIN.wheat, "v"),
    earrings: true, mouth: "open", brow: HAIR.brown, lip: "#C0475A",
  })
);

// ==========================================
// 8 أفاتارات شباب
// ==========================================

// 1. كاجوال بهودي ولحية خفيفة
const male1 = svgToDataUrl(
  build({
    skin: SKIN.wheat, bg: ["#DFF3EA", "#BFE6D5"],
    outfit: hoodie("#3F6E8C", "#345A74", SKIN.wheat), beard: stubble("#4A3022"),
    maleHair: maleFade(HAIR.black), mouth: "smile", brow: HAIR.black,
  })
);

// 2. شاب أنيق ببليزر وتيشيرت ولحية مهذبة
const male2 = svgToDataUrl(
  build({
    skin: SKIN.fair, bg: ["#E3E9F8", "#C5D1F0"],
    outfit: jacket("#2D3A52", "#243046", "#F3F4F6", SKIN.fair),
    beard: trimmedBeard(HAIR.darkBrown), maleHair: maleQuiff(HAIR.darkBrown),
    mouth: "open", brow: HAIR.darkBrown,
  })
);

// 3. مبتسم بتيشيرت بولو وشعر كيرلي
const male3 = svgToDataUrl(
  build({
    skin: SKIN.tan, bg: ["#FFF1DC", "#FFD9A8"],
    outfit: polo("#E4785A", "#F08B6E", SKIN.tan), maleHair: maleCurly(HAIR.black),
    mouth: "open", brow: HAIR.black,
  })
);

// 4. نظارة وقميص سماوي
const male4 = svgToDataUrl(
  build({
    skin: SKIN.wheat, bg: ["#F0E8FB", "#DCCBF5"],
    outfit: polo("#A8C5E8", "#C3D8F0", SKIN.wheat), beard: stubble("#4A3022"),
    maleHair: maleSidePart(HAIR.brown), glasses: "#2B2B33",
    mouth: "smile", brow: HAIR.brown,
  })
);

// 5. جاكيت جينز وتيشيرت أبيض
const male5 = svgToDataUrl(
  build({
    skin: SKIN.fair, bg: ["#FFE9E3", "#FFCBBD"],
    outfit: jacket("#5C84B1", "#4C709B", "#FFFFFF", SKIN.fair, true),
    beard: stubble("#4A3022"), maleHair: maleFade(HAIR.darkBrown),
    mouth: "smirk", brow: HAIR.darkBrown,
  })
);

// 6. شاب رياضي بجاكيت سحاب
const male6 = svgToDataUrl(
  build({
    skin: SKIN.brown, bg: ["#E4F7FB", "#BDE8F2"],
    outfit: zipJacket("#2F9E8F", "#1F7A6E", SKIN.brown), maleHair: maleBuzz(HAIR.black),
    mouth: "open", brow: HAIR.black,
  })
);

// 7. رجل أعمال بقميص وكرافتة
const male7 = svgToDataUrl(
  build({
    skin: SKIN.wheat, bg: ["#EEF0F3", "#D5DAE2"],
    outfit: shirtTie("#F3F5F8", "#7A1F3D", SKIN.wheat),
    beard: trimmedBeard(HAIR.saltPepper), maleHair: maleSidePart(HAIR.saltPepper),
    mouth: "smile", brow: HAIR.saltPepper,
  })
);

// 8. كاب كحلي وتيشيرت خردلي
const male8 = svgToDataUrl(
  build({
    skin: SKIN.tan, bg: ["#FFF6D6", "#FBE29A"],
    outfit: tee("#F2C14E", SKIN.tan), beard: stubble("#4A3022"),
    maleHair: cap("#27408B", HAIR.black), mouth: "open", brow: HAIR.black,
  })
);

export const CARTOON_AVATARS: CartoonAvatar[] = [
  // 8 بنات
  { id: "female_1", gender: "female", label: "شعر طويل ناعم", category: "long_hair", url: female1 },
  { id: "female_2", gender: "female", label: "بوب عصري وبليزر", category: "bob", url: female2 },
  { id: "female_3", gender: "female", label: "كيرلي طبيعي", category: "curly", url: female3 },
  { id: "female_4", gender: "female", label: "كعكة ونظارة", category: "bun_glasses", url: female4 },
  { id: "female_5", gender: "female", label: "حجاب عصري وردي", category: "hijab", url: female5 },
  { id: "female_6", gender: "female", label: "حجاب زيتي ونظارة", category: "hijab", url: female6 },
  { id: "female_7", gender: "female", label: "حجاب كحلي أنيق", category: "hijab", url: female7 },
  { id: "female_8", gender: "female", label: "شعر مموج فاتح", category: "wavy", url: female8 },

  // 8 شباب
  { id: "male_1", gender: "male", label: "كاجوال بهودي", category: "casual", url: male1 },
  { id: "male_2", gender: "male", label: "أنيق وبليزر", category: "smart", url: male2 },
  { id: "male_3", gender: "male", label: "مبتسم وكيرلي", category: "curly", url: male3 },
  { id: "male_4", gender: "male", label: "نظارة وقميص سماوي", category: "glasses", url: male4 },
  { id: "male_5", gender: "male", label: "جاكيت جينز", category: "denim", url: male5 },
  { id: "male_6", gender: "male", label: "رياضي", category: "sporty", url: male6 },
  { id: "male_7", gender: "male", label: "رجل أعمال", category: "business", url: male7 },
  { id: "male_8", gender: "male", label: "كاب وتيشيرت", category: "cap", url: male8 },
];