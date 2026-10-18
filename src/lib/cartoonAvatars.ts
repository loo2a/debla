/**
 * مولد صور الأفاتار الكارتونية بصيغة SVG فائقة النقاء والخفة
 * تدعم 8 شخصيات كرتونية مرسومة للرجال و 8 شخصيات كرتونية مرسومة للنساء
 * تشمل تفاصيل: منتقبة، محجبة بستايلات وألوان مختلفة، غير محجبة،
 * وللرجال: لحية كاملة، لحية خفيفة، بدون لحية، نظارات، شماغ/طاقية، ستايلات متنوعة.
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
// 8 أفاتارات نسائية كرتونية مرسومة
// ==========================================

// 1. منتقبة (نقاب أسود وقور مع لمسة كحلي وعينين هادئتين)
const femaleNiqab1 = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#E8F5E9"/>
  <!-- عباءة/كتف -->
  <path d="M20 160 C20 120 45 105 80 105 C115 105 140 120 140 160 Z" fill="#1E293B"/>
  <!-- حجاب الرأس الخارجي -->
  <path d="M36 82 C36 40 54 22 80 22 C106 22 124 40 124 82 C124 110 115 125 80 125 C45 125 36 110 36 82 Z" fill="#0F172A"/>
  <!-- فتحة العينين (البشرة) -->
  <ellipse cx="80" cy="68" rx="28" ry="11" fill="#FCD34D"/>
  <!-- العيون الكارتونية الوقورة -->
  <ellipse cx="69" cy="68" rx="4.5" ry="3" fill="#1E293B"/>
  <circle cx="68" cy="67" r="1.2" fill="#FFFFFF"/>
  <ellipse cx="91" cy="68" rx="4.5" ry="3" fill="#1E293B"/>
  <circle cx="90" cy="67" r="1.2" fill="#FFFFFF"/>
  <!-- رموش لطيفة -->
  <path d="M64 66 Q69 63 74 66" stroke="#0F172A" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M86 66 Q91 63 96 66" stroke="#0F172A" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <!-- قطعة النقاب الساترة للوجه -->
  <path d="M48 74 C58 73 102 73 112 74 C112 108 100 122 80 122 C60 122 48 108 48 74 Z" fill="#0F172A"/>
  <!-- ربطة النقاب العلوية -->
  <rect x="48" y="58" width="64" height="6" rx="2" fill="#0F172A"/>
</svg>`);

// 2. منتقبة (نقاب كحلي كلاسيكي أنيق)
const femaleNiqab2 = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#E0F2FE"/>
  <!-- كتف -->
  <path d="M22 160 C22 122 46 106 80 106 C114 106 138 122 138 160 Z" fill="#1E3A5F"/>
  <!-- خمار الرأس -->
  <path d="M38 80 C38 38 55 20 80 20 C105 20 122 38 122 80 C122 115 112 126 80 126 C48 126 38 115 38 80 Z" fill="#0F2847"/>
  <!-- فتحة العينين -->
  <ellipse cx="80" cy="66" rx="27" ry="10" fill="#FDE68A"/>
  <!-- عيون كرتونية واسعة -->
  <ellipse cx="70" cy="66" rx="4" ry="3.5" fill="#1E293B"/>
  <circle cx="69" cy="65" r="1.3" fill="#FFFFFF"/>
  <ellipse cx="90" cy="66" rx="4" ry="3.5" fill="#1E293B"/>
  <circle cx="89" cy="65" r="1.3" fill="#FFFFFF"/>
  <!-- شريط النقاب -->
  <path d="M49 72 C60 71 100 71 111 72 C111 106 98 120 80 120 C62 120 49 106 49 72 Z" fill="#0F2847"/>
  <rect x="50" y="56" width="60" height="6" rx="2" fill="#0F2847"/>
</svg>`);

// 3. محجبة - خمار إسلامي زمردي أخضر
const femaleHijabEmerald = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#ECFDF5"/>
  <!-- فستان -->
  <path d="M25 160 C25 125 48 110 80 110 C112 110 135 125 135 160 Z" fill="#047857"/>
  <!-- خمار الرأس -->
  <path d="M40 78 C40 38 56 22 80 22 C104 22 120 38 120 78 C120 120 110 135 80 135 C50 135 40 120 40 78 Z" fill="#065F46"/>
  <!-- الوجه البيضاوي -->
  <ellipse cx="80" cy="74" rx="26" ry="30" fill="#FDE68A"/>
  <!-- بندانة داخلية بيضاء -->
  <path d="M57 58 C66 52 94 52 103 58 C96 50 64 50 57 58 Z" fill="#FFFFFF"/>
  <!-- عيون كرتونية -->
  <circle cx="70" cy="72" r="3.5" fill="#1F2937"/>
  <circle cx="69" cy="71" r="1.2" fill="#FFFFFF"/>
  <circle cx="90" cy="72" r="3.5" fill="#1F2937"/>
  <circle cx="89" cy="71" r="1.2" fill="#FFFFFF"/>
  <!-- حواجب -->
  <path d="M65 65 Q70 63 75 66" stroke="#92400E" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M85 66 Q90 63 95 65" stroke="#92400E" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <!-- ابتسامة لطيفة -->
  <path d="M74 88 Q80 94 86 88" stroke="#BE123C" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- خدود موردة -->
  <circle cx="63" cy="80" r="4.5" fill="#FDA4AF" opacity="0.6"/>
  <circle cx="97" cy="80" r="4.5" fill="#FDA4AF" opacity="0.6"/>
</svg>`);

// 4. محجبة - حجاب عصري أنيق وردي وبندانة
const femaleHijabRose = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#FFF1F2"/>
  <path d="M25 160 C25 125 48 112 80 112 C112 112 135 125 135 160 Z" fill="#BE185D"/>
  <!-- لفة الطرحة العصرية -->
  <path d="M38 78 C38 38 55 22 80 22 C105 22 122 38 122 78 C122 115 110 130 80 130 C50 130 38 115 38 78 Z" fill="#FB7185"/>
  <ellipse cx="80" cy="76" rx="25" ry="29" fill="#FEF08A"/>
  <!-- بندانة بيج -->
  <path d="M58 59 C67 54 93 54 102 59 C95 51 65 51 58 59 Z" fill="#FDE68A"/>
  <!-- ملامح -->
  <circle cx="70" cy="74" r="3.5" fill="#374151"/>
  <circle cx="69" cy="73" r="1.2" fill="#FFFFFF"/>
  <circle cx="90" cy="74" r="3.5" fill="#374151"/>
  <circle cx="89" cy="73" r="1.2" fill="#FFFFFF"/>
  <path d="M65 67 Q70 65 75 68" stroke="#78350F" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M85 68 Q90 65 95 67" stroke="#78350F" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M74 90 Q80 96 86 90" stroke="#E11D48" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="64" cy="82" r="4.5" fill="#FB7185" opacity="0.6"/>
  <circle cx="96" cy="82" r="4.5" fill="#FB7185" opacity="0.6"/>
</svg>`);

// 5. محجبة - حجاب أزرق سماوي ونظارات طبية لطيفة
const femaleHijabGlasses = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#F0F9FF"/>
  <path d="M25 160 C25 125 48 110 80 110 C112 110 135 125 135 160 Z" fill="#0284C7"/>
  <path d="M40 76 C40 38 56 22 80 22 C104 22 120 38 120 76 C120 118 108 132 80 132 C52 132 40 118 40 76 Z" fill="#38BDF8"/>
  <ellipse cx="80" cy="74" rx="25" ry="29" fill="#FDE68A"/>
  <!-- نظارة دائرية أنيقة -->
  <circle cx="69" cy="72" r="8" fill="none" stroke="#D97706" stroke-width="2"/>
  <circle cx="91" cy="72" r="8" fill="none" stroke="#D97706" stroke-width="2"/>
  <line x1="77" y1="72" x2="83" y2="72" stroke="#D97706" stroke-width="2"/>
  <circle cx="69" cy="72" r="3" fill="#1F2937"/>
  <circle cx="91" cy="72" r="3" fill="#1F2937"/>
  <circle cx="68" cy="71" r="1" fill="#FFFFFF"/>
  <circle cx="90" cy="71" r="1" fill="#FFFFFF"/>
  <path d="M75 88 Q80 93 85 88" stroke="#DC2626" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`);

// 6. محجبة - حجاب بيج ترابي كلاسيكي هادئ
const femaleHijabWarm = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#FEF3C7"/>
  <path d="M25 160 C25 125 48 112 80 112 C112 112 135 125 135 160 Z" fill="#78350F"/>
  <path d="M38 78 C38 38 55 22 80 22 C105 22 122 38 122 78 C122 116 110 130 80 130 C50 130 38 116 38 78 Z" fill="#B45309"/>
  <ellipse cx="80" cy="75" rx="25" ry="29" fill="#FDE68A"/>
  <path d="M58 58 C67 53 93 53 102 58 C95 50 65 50 58 58 Z" fill="#FEF3C7"/>
  <circle cx="70" cy="73" r="3.5" fill="#1F2937"/>
  <circle cx="90" cy="73" r="3.5" fill="#1F2937"/>
  <circle cx="69" cy="72" r="1.2" fill="#FFFFFF"/>
  <circle cx="89" cy="72" r="1.2" fill="#FFFFFF"/>
  <path d="M74 89 Q80 95 86 89" stroke="#B91C1C" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="64" cy="81" r="4.5" fill="#FCA5A5" opacity="0.6"/>
  <circle cx="96" cy="81" r="4.5" fill="#FCA5A5" opacity="0.6"/>
</svg>`);

// 7. غير محجبة - شعر بني متموج أنيق ومحتشم
const femaleUnveiledBrunette = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#FDF2F8"/>
  <path d="M25 160 C25 125 48 114 80 114 C112 114 135 125 135 160 Z" fill="#4338CA"/>
  <!-- خلفية الشعر المنسدل -->
  <path d="M38 65 C38 40 52 22 80 22 C108 22 122 40 122 65 C122 105 116 125 114 135 C108 128 106 112 106 100 C98 105 62 105 54 100 C54 112 52 128 46 135 C44 125 38 105 38 65 Z" fill="#451A03"/>
  <ellipse cx="80" cy="74" rx="25" ry="29" fill="#FDE68A"/>
  <!-- قصة الشعر الأمامية -->
  <path d="M50 56 C60 40 76 45 80 50 C84 45 100 40 110 56 C112 68 104 68 104 58 C96 46 64 46 56 58 C56 68 48 68 50 56 Z" fill="#451A03"/>
  <!-- عيون -->
  <circle cx="70" cy="72" r="3.5" fill="#1F2937"/>
  <circle cx="90" cy="72" r="3.5" fill="#1F2937"/>
  <circle cx="69" cy="71" r="1.2" fill="#FFFFFF"/>
  <circle cx="89" cy="71" r="1.2" fill="#FFFFFF"/>
  <path d="M65 65 Q70 63 75 66" stroke="#451A03" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M85 66 Q90 63 95 65" stroke="#451A03" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M74 88 Q80 94 86 88" stroke="#BE123C" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="64" cy="80" r="4.5" fill="#FDA4AF" opacity="0.6"/>
  <circle cx="96" cy="80" r="4.5" fill="#FDA4AF" opacity="0.6"/>
</svg>`);

// 8. غير محجبة - شعر أسود ناعم مصفف بوقار
const femaleUnveiledBlack = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#F5F3FF"/>
  <path d="M25 160 C25 125 48 114 80 114 C112 114 135 125 135 160 Z" fill="#6D28D9"/>
  <!-- شعر أسود أنيق -->
  <path d="M38 68 C38 38 54 20 80 20 C106 20 122 38 122 68 C122 108 118 128 115 136 C108 128 106 110 106 98 C98 104 62 104 54 98 C54 110 52 128 45 136 C42 128 38 108 38 68 Z" fill="#18181B"/>
  <ellipse cx="80" cy="75" rx="25" ry="29" fill="#FCD34D"/>
  <path d="M52 54 C62 44 76 47 80 50 C84 47 98 44 108 54 C110 64 102 64 102 55 C95 47 65 47 58 55 C58 64 50 64 52 54 Z" fill="#18181B"/>
  <circle cx="70" cy="73" r="3.5" fill="#18181B"/>
  <circle cx="90" cy="73" r="3.5" fill="#18181B"/>
  <circle cx="69" cy="72" r="1.2" fill="#FFFFFF"/>
  <circle cx="89" cy="72" r="1.2" fill="#FFFFFF"/>
  <path d="M65 66 Q70 64 75 67" stroke="#18181B" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M85 67 Q90 64 95 66" stroke="#18181B" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M74 90 Q80 96 86 90" stroke="#E11D48" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="64" cy="82" r="4.5" fill="#F472B6" opacity="0.6"/>
  <circle cx="96" cy="82" r="4.5" fill="#F472B6" opacity="0.6"/>
</svg>`);


// ==========================================
// 8 أفاتارات رجالية كرتونية مرسومة
// ==========================================

// 1. رجل بلحية كاملة مهذبة ووقورة وثوب إسلامي
const maleBeardFull = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#ECFDF5"/>
  <!-- جلباب / قميص أبيض -->
  <path d="M25 160 C25 125 48 112 80 112 C112 112 135 125 135 160 Z" fill="#047857"/>
  <!-- ياقة -->
  <path d="M70 112 L80 124 L90 112 Z" fill="#FFFFFF"/>
  <ellipse cx="80" cy="70" rx="26" ry="30" fill="#FDE68A"/>
  <!-- شعر كارتوني مهذب -->
  <path d="M52 56 C52 35 62 25 80 25 C98 25 108 35 108 56 C108 58 100 45 80 45 C60 45 52 58 52 56 Z" fill="#1F2937"/>
  <!-- لحية كاملة مهذبة وشارب -->
  <path d="M54 75 C54 108 65 116 80 116 C95 116 106 108 106 75 C102 85 96 90 80 90 C64 90 58 85 54 75 Z" fill="#1F2937"/>
  <path d="M68 83 Q80 88 92 83 Q80 81 68 83 Z" fill="#111827"/>
  <!-- عيون وحواجب -->
  <circle cx="69" cy="65" r="3.5" fill="#111827"/>
  <circle cx="91" cy="65" r="3.5" fill="#111827"/>
  <circle cx="68" cy="64" r="1.2" fill="#FFFFFF"/>
  <circle cx="90" cy="64" r="1.2" fill="#FFFFFF"/>
  <path d="M63 58 Q69 56 75 59" stroke="#1F2937" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M85 59 Q91 56 97 58" stroke="#1F2937" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M75 88 Q80 91 85 88" stroke="#FDE68A" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>`);

// 2. رجل بلحية خفيفة أنيقة (شاب عصري)
const maleBeardTrimmed = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#EFF6FF"/>
  <path d="M25 160 C25 125 48 112 80 112 C112 112 135 125 135 160 Z" fill="#1D4ED8"/>
  <ellipse cx="80" cy="72" rx="26" ry="30" fill="#FDE68A"/>
  <!-- شعر شبابي مرفوع -->
  <path d="M52 54 C54 30 68 22 80 22 C92 22 106 30 108 54 C106 44 95 38 80 38 C65 38 54 44 52 54 Z" fill="#292524"/>
  <!-- ذقن خفيف كارتوني مهذب -->
  <path d="M57 78 C57 98 67 106 80 106 C93 106 103 98 103 78 C100 86 94 92 80 92 C66 92 60 86 57 78 Z" fill="#44403C" opacity="0.85"/>
  <!-- شارب خفيف -->
  <path d="M71 82 Q80 85 89 82" stroke="#44403C" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="69" cy="66" r="3.5" fill="#1C1917"/>
  <circle cx="91" cy="66" r="3.5" fill="#1C1917"/>
  <circle cx="68" cy="65" r="1.2" fill="#FFFFFF"/>
  <circle cx="90" cy="65" r="1.2" fill="#FFFFFF"/>
  <path d="M63 59 Q69 57 75 60" stroke="#292524" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M85 60 Q91 57 97 59" stroke="#292524" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M74 89 Q80 94 86 89" stroke="#78350F" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`);

// 3. رجل بدون لحية (حليق / شاب مبتسم)
const maleCleanShaven = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#F0FDF4"/>
  <path d="M25 160 C25 125 48 112 80 112 C112 112 135 125 135 160 Z" fill="#0F766E"/>
  <ellipse cx="80" cy="74" rx="26" ry="30" fill="#FCD34D"/>
  <!-- شعر أسود كلاسيكي جانبي -->
  <path d="M52 58 C52 32 64 24 80 24 C96 24 108 32 108 58 C108 48 96 40 80 40 C64 40 52 48 52 58 Z" fill="#18181B"/>
  <circle cx="69" cy="68" r="3.5" fill="#18181B"/>
  <circle cx="91" cy="68" r="3.5" fill="#18181B"/>
  <circle cx="68" cy="67" r="1.2" fill="#FFFFFF"/>
  <circle cx="90" cy="67" r="1.2" fill="#FFFFFF"/>
  <path d="M63 61 Q69 59 75 62" stroke="#18181B" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M85 62 Q91 59 97 61" stroke="#18181B" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- ابتسامة واضحة ومشرقة -->
  <path d="M72 88 Q80 96 88 88" stroke="#991B1B" stroke-width="2.2" fill="none" stroke-linecap="round"/>
</svg>`);

// 4. رجل بنظارات طبية وذقن مهذب (مظهر أكاديمي / مهني)
const maleGlasses = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#F8FAFC"/>
  <path d="M25 160 C25 125 48 112 80 112 C112 112 135 125 135 160 Z" fill="#334155"/>
  <ellipse cx="80" cy="73" rx="26" ry="30" fill="#FDE68A"/>
  <!-- شعر بني داكن -->
  <path d="M52 55 C52 32 64 24 80 24 C96 24 108 32 108 55 C108 46 96 40 80 40 C64 40 52 46 52 55 Z" fill="#3F2E21"/>
  <!-- نظارة مستطيلة كارتونية -->
  <rect x="60" y="61" width="16" height="13" rx="3" fill="none" stroke="#0F172A" stroke-width="2"/>
  <rect x="84" y="61" width="16" height="13" rx="3" fill="none" stroke="#0F172A" stroke-width="2"/>
  <line x1="76" y1="67" x2="84" y2="67" stroke="#0F172A" stroke-width="2"/>
  <circle cx="68" cy="67" r="3" fill="#1E293B"/>
  <circle cx="92" cy="67" r="3" fill="#1E293B"/>
  <!-- ذقن خفيف -->
  <path d="M62 82 C62 98 70 105 80 105 C90 105 98 98 98 82 C94 88 88 92 80 92 C72 92 66 88 62 82 Z" fill="#4B382A" opacity="0.8"/>
  <path d="M74 88 Q80 92 86 88" stroke="#78350F" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>`);

// 5. رجل بشماغ وعقال عربي كلاسيكي
const maleShemagh = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#FFFBEB"/>
  <path d="M22 160 C22 125 45 110 80 110 C115 110 138 125 138 160 Z" fill="#FFFFFF" stroke="#E2E8F0"/>
  <!-- شماغ أحمر وأبيض منسدل -->
  <path d="M40 70 C40 35 56 20 80 20 C104 20 120 35 120 70 C120 115 112 135 112 145 C98 128 62 128 48 145 C48 135 40 115 40 70 Z" fill="#DC2626"/>
  <!-- عقال أسود مزدوج -->
  <ellipse cx="80" cy="38" rx="36" ry="7" fill="none" stroke="#0F172A" stroke-width="4.5"/>
  <ellipse cx="80" cy="44" rx="36" ry="6" fill="none" stroke="#0F172A" stroke-width="4"/>
  <ellipse cx="80" cy="74" rx="25" ry="29" fill="#FDE68A"/>
  <!-- شارب ولحية وقورة -->
  <path d="M58 80 C58 100 68 108 80 108 C92 108 102 100 102 80 C98 86 92 90 80 90 C68 90 62 86 58 80 Z" fill="#1F2937"/>
  <path d="M68 83 Q80 87 92 83" stroke="#111827" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="69" cy="67" r="3.5" fill="#111827"/>
  <circle cx="91" cy="67" r="3.5" fill="#111827"/>
  <circle cx="68" cy="66" r="1.2" fill="#FFFFFF"/>
  <circle cx="90" cy="66" r="1.2" fill="#FFFFFF"/>
</svg>`);

// 6. رجل بطاقية إسلامية بيضاء وقميص أنيق
const maleTaqiyah = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#F0FDF4"/>
  <path d="M25 160 C25 125 48 112 80 112 C112 112 135 125 135 160 Z" fill="#065F46"/>
  <ellipse cx="80" cy="75" rx="26" ry="30" fill="#FDE68A"/>
  <!-- طاقية بيضاء منقوشة بنعومة -->
  <path d="M54 55 C54 32 65 24 80 24 C95 24 106 32 106 55 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
  <line x1="56" y1="52" x2="104" y2="52" stroke="#CBD5E1" stroke-width="1.5"/>
  <!-- لحية دائرية خفيفة وشارب -->
  <path d="M60 80 C60 100 68 106 80 106 C92 106 100 100 100 80 C96 86 90 90 80 90 C70 90 64 86 60 80 Z" fill="#27272A"/>
  <circle cx="69" cy="67" r="3.5" fill="#18181B"/>
  <circle cx="91" cy="67" r="3.5" fill="#18181B"/>
  <circle cx="68" cy="66" r="1.2" fill="#FFFFFF"/>
  <circle cx="90" cy="66" r="1.2" fill="#FFFFFF"/>
  <path d="M74 88 Q80 92 86 88" stroke="#713F12" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`);

// 7. رجل كبير السن وقور بلحية بيضاء/رمادية (مناسب أيضاً للأولياء وكبار السن)
const maleElderly = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#FEFCE8"/>
  <path d="M25 160 C25 125 48 112 80 112 C112 112 135 125 135 160 Z" fill="#713F12"/>
  <ellipse cx="80" cy="72" rx="26" ry="30" fill="#FDE68A"/>
  <!-- شعر أبيض وقور جانبي -->
  <path d="M52 56 C52 35 64 26 80 26 C96 26 108 35 108 56 C108 48 98 42 80 42 C62 42 52 48 52 56 Z" fill="#E2E8F0"/>
  <!-- لحية بيضاء رمادية وقورة -->
  <path d="M54 75 C54 112 65 120 80 120 C95 120 106 112 106 75 C102 85 96 90 80 90 C64 90 58 85 54 75 Z" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.5"/>
  <circle cx="69" cy="65" r="3.5" fill="#334155"/>
  <circle cx="91" cy="65" r="3.5" fill="#334155"/>
  <path d="M63 58 Q69 56 75 59" stroke="#94A3B8" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M85 59 Q91 56 97 58" stroke="#94A3B8" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M74 86 Q80 90 86 86" stroke="#94A3B8" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>`);

// 8. رجل ببدلة رسمية عصرية بدون لحية (ستايل كلاسيكي حديث)
const maleSuit = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="80" fill="#F1F5F9"/>
  <!-- بدلة كحلية وقميص وربطة عنق -->
  <path d="M25 160 C25 125 48 112 80 112 C112 112 135 125 135 160 Z" fill="#1E293B"/>
  <path d="M65 112 L80 135 L95 112 Z" fill="#FFFFFF"/>
  <path d="M77 118 L83 118 L81 142 L79 142 Z" fill="#047857"/>
  <ellipse cx="80" cy="72" rx="26" ry="30" fill="#FDE68A"/>
  <!-- شعر بني كلاسيكي -->
  <path d="M52 54 C54 30 68 22 80 22 C92 22 106 30 108 54 C106 44 95 36 80 36 C65 36 54 44 52 54 Z" fill="#451A03"/>
  <circle cx="69" cy="66" r="3.5" fill="#1E293B"/>
  <circle cx="91" cy="66" r="3.5" fill="#1E293B"/>
  <circle cx="68" cy="65" r="1.2" fill="#FFFFFF"/>
  <circle cx="90" cy="65" r="1.2" fill="#FFFFFF"/>
  <path d="M63 59 Q69 57 75 60" stroke="#451A03" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M85 60 Q91 57 97 59" stroke="#451A03" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M73 88 Q80 94 87 88" stroke="#991B1B" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`);

export const CARTOON_AVATARS: CartoonAvatar[] = [
  // 8 نسائي
  { id: "female_1", gender: "female", label: "منتقبة وقور", category: "niqab", url: femaleNiqab1 },
  { id: "female_2", gender: "female", label: "منتقبة كحلي", category: "niqab", url: femaleNiqab2 },
  { id: "female_3", gender: "female", label: "محجبة - خمار زمردي", category: "hijab", url: femaleHijabEmerald },
  { id: "female_4", gender: "female", label: "محجبة - طرحة وردية", category: "hijab", url: femaleHijabRose },
  { id: "female_5", gender: "female", label: "محجبة - نظارات طبية", category: "hijab", url: femaleHijabGlasses },
  { id: "female_6", gender: "female", label: "محجبة - بيج ترابي", category: "hijab", url: femaleHijabWarm },
  { id: "female_7", gender: "female", label: "غير محجبة - شعر بني", category: "unveiled", url: femaleUnveiledBrunette },
  { id: "female_8", gender: "female", label: "غير محجبة - شعر أسود", category: "unveiled", url: femaleUnveiledBlack },

  // 8 رجالي
  { id: "male_1", gender: "male", label: "لحية كاملة وثوب", category: "beard_full", url: maleBeardFull },
  { id: "male_2", gender: "male", label: "لحية خفيفة عصرية", category: "beard_trim", url: maleBeardTrimmed },
  { id: "male_3", gender: "male", label: "شاب حليق مبتسم", category: "clean", url: maleCleanShaven },
  { id: "male_4", gender: "male", label: "نظارات طبية وذقن", category: "glasses", url: maleGlasses },
  { id: "male_5", gender: "male", label: "شماغ وعقال عربي", category: "shemagh", url: maleShemagh },
  { id: "male_6", gender: "male", label: "طاقية إسلامية ولحية", category: "taqiyah", url: maleTaqiyah },
  { id: "male_7", gender: "male", label: "وقور بلحية بيضاء", category: "elderly", url: maleElderly },
  { id: "male_8", gender: "male", label: "بدلة رسمية كلاسيكية", category: "suit", url: maleSuit },
];
