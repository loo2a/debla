/**
 * مولد صور الأفاتار الكارتونية بصيغة SVG فائقة النقاء والخفة والجمالية
 * تدعم 8 شخصيات كرتونية مرسومة بعناية للرجال و 8 شخصيات كرتونية مرسومة بعناية للنساء
 * تشمل تفاصيل وقورة وجذابة بتدرجات لونية عصرية، ظلال ناعمة، ملامح وجه معبرة،
 * وستايلات إسلامية وعربية وعصرية راقية.
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
// 8 أفاتارات نسائية كرتونية فائقة الجمال والوقار
// ==========================================

// 1. منتقبة (نقاب أسود فاخر مع لمسات كحلي ملكي وظلال انسيابية وعيون كحيلة)
const femaleNiqab1 = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="fn1_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ECFDF5"/>
      <stop offset="100%" stop-color="#A7F3D0"/>
    </linearGradient>
    <linearGradient id="fn1_cape" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="60%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="fn1_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE4D6"/>
      <stop offset="100%" stop-color="#F7C6B3"/>
    </linearGradient>
    <linearGradient id="fn1_veil" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#090D16"/>
    </linearGradient>
  </defs>
  <!-- خلفية دائرية مع إطار ناعم -->
  <circle cx="80" cy="80" r="78" fill="url(#fn1_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#10B981" stroke-width="1.5" opacity="0.35"/>
  
  <!-- عباءة الأكتاف -->
  <path d="M16 160 C16 122 44 105 80 105 C116 105 144 122 144 160 Z" fill="url(#fn1_cape)"/>
  <path d="M40 160 C42 128 58 116 80 116 C102 116 118 128 120 160" fill="none" stroke="#475569" stroke-width="1.5" opacity="0.4"/>
  
  <!-- خمار الرأس الانسيابي -->
  <path d="M34 82 C34 38 52 18 80 18 C108 18 126 38 126 82 C126 116 116 132 80 132 C44 132 34 116 34 82 Z" fill="url(#fn1_cape)"/>
  
  <!-- فتحة العينين (البشرة الطبيعية) -->
  <path d="M50 63 C50 56 62 52 80 52 C98 52 110 56 110 63 C110 74 98 77 80 77 C62 77 50 74 50 63 Z" fill="url(#fn1_skin)"/>
  <ellipse cx="60" cy="71" rx="4" ry="2.5" fill="#F472B6" opacity="0.25"/>
  <ellipse cx="100" cy="71" rx="4" ry="2.5" fill="#F472B6" opacity="0.25"/>
  
  <!-- حواجب مهذبة -->
  <path d="M60 59 Q68 55 75 58" stroke="#3D2619" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M85 58 Q92 55 100 59" stroke="#3D2619" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  
  <!-- خط الكحل والرموش -->
  <path d="M61 66 C65 62 72 62 76 66" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M84 66 C88 62 95 62 99 66" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M76 66 L78.5 64" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M99 66 L101.5 64" stroke="#0F172A" stroke-width="1.5" stroke-linecap="round"/>
  
  <!-- عيون واسعة ببريق حيوي -->
  <ellipse cx="68.5" cy="67" rx="4" ry="4.5" fill="#1E293B"/>
  <ellipse cx="91.5" cy="67" rx="4" ry="4.5" fill="#1E293B"/>
  <circle cx="67" cy="65.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="90" cy="65.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="70" cy="68.5" r="0.8" fill="#FFFFFF"/>
  <circle cx="93" cy="68.5" r="0.8" fill="#FFFFFF"/>
  
  <!-- قطعة النقاب الساترة المنسدلة -->
  <path d="M46 72 C56 70 104 70 114 72 C116 110 102 128 80 128 C58 128 44 110 46 72 Z" fill="url(#fn1_veil)"/>
  
  <!-- ثنيات قماش النقاب وظلاله -->
  <path d="M80 78 Q80 112 76 126" stroke="#334155" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.6"/>
  <path d="M68 85 Q72 108 70 122" stroke="#334155" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.4"/>
  <path d="M92 85 Q88 108 90 122" stroke="#334155" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.4"/>
  
  <!-- ربطة النقاب العلوية مع لمسة زمردية راقية -->
  <path d="M47 52 C58 50 102 50 113 52 C114 57 102 59 80 59 C58 59 46 57 47 52 Z" fill="#1E293B"/>
  <line x1="56" y1="55" x2="104" y2="55" stroke="#10B981" stroke-width="1.2" opacity="0.7"/>
</svg>`);

// 2. منتقبة (نقاب أزرق كحلي ملكي راقي مع تفاصيل ناعمة)
const femaleNiqab2 = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="fn2_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EFF6FF"/>
      <stop offset="100%" stop-color="#BAE6FD"/>
    </linearGradient>
    <linearGradient id="fn2_cloth" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="60%" stop-color="#0F2847"/>
      <stop offset="100%" stop-color="#0B1B30"/>
    </linearGradient>
    <linearGradient id="fn2_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF0E5"/>
      <stop offset="100%" stop-color="#F9D4C2"/>
    </linearGradient>
    <linearGradient id="fn2_veil" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#172554"/>
      <stop offset="100%" stop-color="#0B132B"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#fn2_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#38BDF8" stroke-width="1.5" opacity="0.4"/>
  
  <!-- الأكتاف -->
  <path d="M16 160 C16 122 44 105 80 105 C116 105 144 122 144 160 Z" fill="url(#fn2_cloth)"/>
  <path d="M42 160 C44 128 58 116 80 116 C102 116 116 128 118 160" fill="none" stroke="#3B82F6" stroke-width="1.5" opacity="0.3"/>
  
  <!-- خمار الرأس -->
  <path d="M34 82 C34 38 52 18 80 18 C108 18 126 38 126 82 C126 116 116 132 80 132 C44 132 34 116 34 82 Z" fill="url(#fn2_cloth)"/>
  
  <!-- فتحة العينين -->
  <path d="M50 63 C50 56 62 52 80 52 C98 52 110 56 110 63 C110 74 98 77 80 77 C62 77 50 74 50 63 Z" fill="url(#fn2_skin)"/>
  
  <!-- حواجب -->
  <path d="M60 59 Q68 55 75 58" stroke="#374151" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M85 58 Q92 55 100 59" stroke="#374151" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  
  <!-- عيون عسلية كحيلة ببريق جميل -->
  <path d="M61 66 C65 62 72 62 76 66" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M84 66 C88 62 95 62 99 66" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <ellipse cx="68.5" cy="67" rx="4" ry="4.5" fill="#3B2E2A"/>
  <ellipse cx="91.5" cy="67" rx="4" ry="4.5" fill="#3B2E2A"/>
  <circle cx="67" cy="65.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="90" cy="65.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="70" cy="68.5" r="0.8" fill="#FFFFFF"/>
  <circle cx="93" cy="68.5" r="0.8" fill="#FFFFFF"/>
  
  <!-- قطعة النقاب -->
  <path d="M46 72 C56 70 104 70 114 72 C116 110 102 128 80 128 C58 128 44 110 46 72 Z" fill="url(#fn2_veil)"/>
  <path d="M80 78 Q80 112 76 126" stroke="#2563EB" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.35"/>
  
  <!-- ربطة النقاب بشريط فضي كلاسيكي -->
  <path d="M47 52 C58 50 102 50 113 52 C114 57 102 59 80 59 C58 59 46 57 47 52 Z" fill="#1E3A8A"/>
  <line x1="56" y1="55" x2="104" y2="55" stroke="#93C5FD" stroke-width="1.2" opacity="0.8"/>
</svg>`);

// 3. محجبة - خمار إسلامي زمردي أخضر أنيق
const femaleHijabEmerald = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="fh1_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0FDF4"/>
      <stop offset="100%" stop-color="#BBF7D0"/>
    </linearGradient>
    <linearGradient id="fh1_hijab" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="60%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#064E3B"/>
    </linearGradient>
    <linearGradient id="fh1_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF0E5"/>
      <stop offset="100%" stop-color="#F8D3C0"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#fh1_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#10B981" stroke-width="1.5" opacity="0.4"/>
  
  <!-- ثوب / كتف -->
  <path d="M18 160 C18 124 45 108 80 108 C115 108 142 124 142 160 Z" fill="url(#fh1_hijab)"/>
  
  <!-- خمار الرأس والانسدال الخلفي -->
  <path d="M36 80 C36 36 54 18 80 18 C106 18 124 36 124 80 C124 122 114 136 80 136 C46 136 36 122 36 80 Z" fill="url(#fh1_hijab)"/>
  <path d="M50 130 Q80 142 110 130" fill="none" stroke="#064E3B" stroke-width="2" opacity="0.4"/>
  
  <!-- رقبة الوجه والظل -->
  <path d="M68 96 L80 108 L92 96 Z" fill="#E8B5A0"/>
  
  <!-- استدارة الوجه الناعمة -->
  <ellipse cx="80" cy="74" rx="27" ry="30" fill="url(#fh1_skin)"/>
  
  <!-- بندانة بيضاء حريرية تحت الحجاب -->
  <path d="M55 58 C65 50 95 50 105 58 C96 48 64 48 55 58 Z" fill="#F8FAFC"/>
  
  <!-- خدود موردة بلطافة -->
  <ellipse cx="61" cy="78" rx="5" ry="3" fill="#FB7185" opacity="0.35"/>
  <ellipse cx="99" cy="78" rx="5" ry="3" fill="#FB7185" opacity="0.35"/>
  
  <!-- حواجب -->
  <path d="M62 64 Q69 61 75 64" stroke="#451A03" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M85 64 Q91 61 98 64" stroke="#451A03" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  
  <!-- عيون واسعة ومبتسمة ببريق -->
  <ellipse cx="69" cy="72" rx="4" ry="4.2" fill="#292524"/>
  <ellipse cx="91" cy="72" rx="4" ry="4.2" fill="#292524"/>
  <circle cx="67.5" cy="70.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="89.5" cy="70.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="70.5" cy="73.5" r="0.8" fill="#FFFFFF"/>
  <circle cx="92.5" cy="73.5" r="0.8" fill="#FFFFFF"/>
  <path d="M62 70 C65 67 73 67 76 70" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M84 70 C87 67 95 67 98 70" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none"/>
  
  <!-- أنف ناعم وابتسامة رقيقة ودافئة -->
  <path d="M79 77 Q80 81 81 81" stroke="#D97706" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.7"/>
  <path d="M73 89 Q80 96 87 89" stroke="#BE123C" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M77 93 Q80 94.5 83 93" stroke="#FDA4AF" stroke-width="1.8" stroke-linecap="round" fill="none"/>
</svg>`);

// 4. محجبة - حجاب عصري بطرحة وردية راقية
const femaleHijabRose = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="fh2_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF1F2"/>
      <stop offset="100%" stop-color="#FECDD3"/>
    </linearGradient>
    <linearGradient id="fh2_hijab" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FB7185"/>
      <stop offset="60%" stop-color="#E11D48"/>
      <stop offset="100%" stop-color="#9F1239"/>
    </linearGradient>
    <linearGradient id="fh2_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3E8"/>
      <stop offset="100%" stop-color="#FCD8C5"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#fh2_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#FB7185" stroke-width="1.5" opacity="0.4"/>
  
  <!-- ملابس الكتف -->
  <path d="M18 160 C18 124 45 110 80 110 C115 110 142 124 142 160 Z" fill="#9F1239"/>
  
  <!-- لفة الطرحة العصرية الانسيابية -->
  <path d="M36 80 C36 36 54 18 80 18 C106 18 124 36 124 80 C124 120 112 134 80 134 C48 134 36 120 36 80 Z" fill="url(#fh2_hijab)"/>
  <!-- طرف الطرحة المنسدل على الكتف الأيسر -->
  <path d="M42 98 C42 135 56 155 64 160 L48 160 C40 145 36 125 36 98 Z" fill="#BE185D" opacity="0.9"/>
  
  <ellipse cx="80" cy="74" rx="26" ry="29" fill="url(#fh2_skin)"/>
  
  <!-- بندانة بيج ناعمة -->
  <path d="M56 57 C66 50 94 50 104 57 C95 49 65 49 56 57 Z" fill="#FEF08A"/>
  
  <!-- خدود وردية نضرة -->
  <ellipse cx="62" cy="78" rx="5" ry="3.2" fill="#F43F5E" opacity="0.35"/>
  <ellipse cx="98" cy="78" rx="5" ry="3.2" fill="#F43F5E" opacity="0.35"/>
  
  <path d="M62 63 Q69 60 75 63" stroke="#4A1D24" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M85 63 Q91 60 98 63" stroke="#4A1D24" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  
  <ellipse cx="69" cy="72" rx="4" ry="4.2" fill="#3F2E21"/>
  <ellipse cx="91" cy="72" rx="4" ry="4.2" fill="#3F2E21"/>
  <circle cx="67.5" cy="70.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="89.5" cy="70.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="70.5" cy="73.5" r="0.8" fill="#FFFFFF"/>
  <circle cx="92.5" cy="73.5" r="0.8" fill="#FFFFFF"/>
  
  <path d="M62 70 C65 67 73 67 76 70" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M84 70 C87 67 95 67 98 70" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none"/>
  
  <path d="M79 77 Q80 81 81 81" stroke="#D97706" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.6"/>
  <path d="M73 89 Q80 96 87 89" stroke="#E11D48" stroke-width="2.4" stroke-linecap="round" fill="none"/>
</svg>`);

// 5. محجبة - حجاب أزرق نيلي أنيق ونظارات طبية ذهبية
const femaleHijabGlasses = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="fh3_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FAF5FF"/>
      <stop offset="100%" stop-color="#E9D5FF"/>
    </linearGradient>
    <linearGradient id="fh3_hijab" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#6366F1"/>
      <stop offset="60%" stop-color="#4F46E5"/>
      <stop offset="100%" stop-color="#3730A3"/>
    </linearGradient>
    <linearGradient id="fh3_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2E8"/>
      <stop offset="100%" stop-color="#FCDBC9"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#fh3_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#818CF8" stroke-width="1.5" opacity="0.4"/>
  
  <path d="M18 160 C18 124 45 110 80 110 C115 110 142 124 142 160 Z" fill="#312E81"/>
  
  <path d="M36 80 C36 36 54 18 80 18 C106 18 124 36 124 80 C124 122 112 134 80 134 C48 134 36 122 36 80 Z" fill="url(#fh3_hijab)"/>
  
  <ellipse cx="80" cy="74" rx="26" ry="29" fill="url(#fh3_skin)"/>
  <path d="M56 57 C66 50 94 50 104 57 C95 49 65 49 56 57 Z" fill="#EDE9FE"/>
  
  <!-- نظارة طبية ذهبية أنيقة بإطار دائري عصري -->
  <circle cx="67" cy="72" r="9.5" fill="#FFFFFF" fill-opacity="0.15" stroke="#D97706" stroke-width="2"/>
  <circle cx="93" cy="72" r="9.5" fill="#FFFFFF" fill-opacity="0.15" stroke="#D97706" stroke-width="2"/>
  <line x1="76.5" y1="71" x2="83.5" y2="71" stroke="#D97706" stroke-width="2"/>
  <!-- لمعة زجاج النظارة -->
  <line x1="62" y1="67" x2="66" y2="65" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
  <line x1="88" y1="67" x2="92" y2="65" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
  
  <ellipse cx="67" cy="72" rx="3.5" ry="3.8" fill="#1F2937"/>
  <ellipse cx="93" cy="72" rx="3.5" ry="3.8" fill="#1F2937"/>
  <circle cx="66" cy="70.5" r="1.3" fill="#FFFFFF"/>
  <circle cx="92" cy="70.5" r="1.3" fill="#FFFFFF"/>
  
  <path d="M61 61 Q67 58 73 61" stroke="#312E81" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M87 61 Q93 58 99 61" stroke="#312E81" stroke-width="2" stroke-linecap="round" fill="none"/>
  
  <ellipse cx="60" cy="79" rx="4.5" ry="2.8" fill="#F472B6" opacity="0.3"/>
  <ellipse cx="100" cy="79" rx="4.5" ry="2.8" fill="#F472B6" opacity="0.3"/>
  
  <path d="M74 89 Q80 96 86 89" stroke="#DC2626" stroke-width="2.4" stroke-linecap="round" fill="none"/>
</svg>`);

// 6. محجبة - حجاب بيج كشميري دافئ وهادئ
const femaleHijabWarm = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="fh4_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="100%" stop-color="#FDE68A"/>
    </linearGradient>
    <linearGradient id="fh4_hijab" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#B45309"/>
      <stop offset="60%" stop-color="#92400E"/>
      <stop offset="100%" stop-color="#78350F"/>
    </linearGradient>
    <linearGradient id="fh4_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3E8"/>
      <stop offset="100%" stop-color="#FBD6C2"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#fh4_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#F59E0B" stroke-width="1.5" opacity="0.4"/>
  
  <path d="M18 160 C18 124 45 110 80 110 C115 110 142 124 142 160 Z" fill="#78350F"/>
  
  <path d="M36 80 C36 36 54 18 80 18 C106 18 124 36 124 80 C124 122 112 134 80 134 C48 134 36 122 36 80 Z" fill="url(#fh4_hijab)"/>
  
  <ellipse cx="80" cy="74" rx="26" ry="29" fill="url(#fh4_skin)"/>
  <path d="M56 57 C66 50 94 50 104 57 C95 49 65 49 56 57 Z" fill="#FFFBEB"/>
  
  <ellipse cx="62" cy="78" rx="5" ry="3.2" fill="#FB923C" opacity="0.35"/>
  <ellipse cx="98" cy="78" rx="5" ry="3.2" fill="#FB923C" opacity="0.35"/>
  
  <path d="M62 63 Q69 60 75 63" stroke="#451A03" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M85 63 Q91 60 98 63" stroke="#451A03" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  
  <ellipse cx="69" cy="72" rx="4" ry="4.2" fill="#292524"/>
  <ellipse cx="91" cy="72" rx="4" ry="4.2" fill="#292524"/>
  <circle cx="67.5" cy="70.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="89.5" cy="70.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="70.5" cy="73.5" r="0.8" fill="#FFFFFF"/>
  <circle cx="92.5" cy="73.5" r="0.8" fill="#FFFFFF"/>
  
  <path d="M62 70 C65 67 73 67 76 70" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M84 70 C87 67 95 67 98 70" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none"/>
  
  <path d="M79 77 Q80 81 81 81" stroke="#D97706" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.6"/>
  <path d="M73 89 Q80 96 87 89" stroke="#B45309" stroke-width="2.4" stroke-linecap="round" fill="none"/>
</svg>`);

// 7. غير محجبة - شعر بني متموج أنيق ومحتشم
const femaleUnveiledBrunette = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="fu1_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF7ED"/>
      <stop offset="100%" stop-color="#FED7AA"/>
    </linearGradient>
    <linearGradient id="fu1_hair" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#78350F"/>
      <stop offset="50%" stop-color="#451A03"/>
      <stop offset="100%" stop-color="#2D1102"/>
    </linearGradient>
    <linearGradient id="fu1_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2E8"/>
      <stop offset="100%" stop-color="#FCDBC9"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#fu1_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#F97316" stroke-width="1.5" opacity="0.35"/>
  
  <!-- فستان كحلي أنيق -->
  <path d="M18 160 C18 124 45 110 80 110 C115 110 142 124 142 160 Z" fill="#0F766E"/>
  
  <!-- الشعر المنسدل خلف الرقبة والكتفين -->
  <path d="M34 68 C34 34 50 16 80 16 C110 16 126 34 126 68 C126 108 120 134 116 148 C108 136 104 116 104 100 C98 106 62 106 56 100 C56 116 52 136 44 148 C40 134 34 108 34 68 Z" fill="url(#fu1_hair)"/>
  
  <!-- رقبة الوجه -->
  <path d="M70 95 L80 108 L90 95 Z" fill="#E8B5A0"/>
  
  <!-- الوجه -->
  <ellipse cx="80" cy="74" rx="26" ry="29" fill="url(#fu1_skin)"/>
  
  <!-- خصلات شعر أمامية متموجة -->
  <path d="M46 54 C54 38 72 40 80 48 C88 40 106 38 114 54 C116 66 108 66 106 56 C98 44 62 44 54 56 C52 66 44 66 46 54 Z" fill="#451A03"/>
  <!-- بريق الشعر -->
  <path d="M60 38 Q75 32 80 42" stroke="#9A3412" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.6"/>
  
  <ellipse cx="62" cy="78" rx="5" ry="3.2" fill="#FDA4AF" opacity="0.4"/>
  <ellipse cx="98" cy="78" rx="5" ry="3.2" fill="#FDA4AF" opacity="0.4"/>
  
  <path d="M62 63 Q69 60 75 63" stroke="#451A03" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M85 63 Q91 60 98 63" stroke="#451A03" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  
  <ellipse cx="69" cy="72" rx="4" ry="4.2" fill="#292524"/>
  <ellipse cx="91" cy="72" rx="4" ry="4.2" fill="#292524"/>
  <circle cx="67.5" cy="70.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="89.5" cy="70.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="70.5" cy="73.5" r="0.8" fill="#FFFFFF"/>
  <circle cx="92.5" cy="73.5" r="0.8" fill="#FFFFFF"/>
  
  <path d="M62 70 C65 67 73 67 76 70" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M84 70 C87 67 95 67 98 70" stroke="#1C1917" stroke-width="2" stroke-linecap="round" fill="none"/>
  
  <path d="M79 77 Q80 81 81 81" stroke="#D97706" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.6"/>
  <path d="M73 89 Q80 96 87 89" stroke="#E11D48" stroke-width="2.4" stroke-linecap="round" fill="none"/>
</svg>`);

// 8. غير محجبة - شعر أسود ناعم مصفف بوقار ورقي
const femaleUnveiledBlack = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="fu2_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5F3FF"/>
      <stop offset="100%" stop-color="#DDD6FE"/>
    </linearGradient>
    <linearGradient id="fu2_hair" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#27272A"/>
      <stop offset="60%" stop-color="#18181B"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <linearGradient id="fu2_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2E8"/>
      <stop offset="100%" stop-color="#FCDBC9"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#fu2_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#8B5CF6" stroke-width="1.5" opacity="0.35"/>
  
  <!-- بليزر بنفسجي ملكي -->
  <path d="M18 160 C18 124 45 110 80 110 C115 110 142 124 142 160 Z" fill="#6D28D9"/>
  <path d="M70 110 L80 128 L90 110 Z" fill="#FFFFFF"/>
  
  <!-- شعر أسود حريري منسدل -->
  <path d="M34 68 C34 32 50 16 80 16 C110 16 126 32 126 68 C126 108 120 134 116 148 C108 136 104 116 104 100 C98 106 62 106 56 100 C56 116 52 136 44 148 C40 134 34 108 34 68 Z" fill="url(#fu2_hair)"/>
  
  <path d="M70 95 L80 108 L90 95 Z" fill="#E8B5A0"/>
  
  <ellipse cx="80" cy="74" rx="26" ry="29" fill="url(#fu2_skin)"/>
  
  <!-- قصة شعر جانبية كلاسيكية -->
  <path d="M48 54 C56 40 76 40 80 46 C86 40 104 40 112 54 C114 64 106 64 104 55 C96 46 64 46 56 55 C54 64 46 64 48 54 Z" fill="#18181B"/>
  <path d="M58 36 Q75 30 84 40" stroke="#52525B" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.5"/>
  
  <ellipse cx="62" cy="78" rx="5" ry="3.2" fill="#F472B6" opacity="0.35"/>
  <ellipse cx="98" cy="78" rx="5" ry="3.2" fill="#F472B6" opacity="0.35"/>
  
  <path d="M62 63 Q69 60 75 63" stroke="#18181B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M85 63 Q91 60 98 63" stroke="#18181B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  
  <ellipse cx="69" cy="72" rx="4" ry="4.2" fill="#18181B"/>
  <ellipse cx="91" cy="72" rx="4" ry="4.2" fill="#18181B"/>
  <circle cx="67.5" cy="70.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="89.5" cy="70.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="70.5" cy="73.5" r="0.8" fill="#FFFFFF"/>
  <circle cx="92.5" cy="73.5" r="0.8" fill="#FFFFFF"/>
  
  <path d="M62 70 C65 67 73 67 76 70" stroke="#09090B" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M84 70 C87 67 95 67 98 70" stroke="#09090B" stroke-width="2" stroke-linecap="round" fill="none"/>
  
  <path d="M79 77 Q80 81 81 81" stroke="#D97706" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.6"/>
  <path d="M73 89 Q80 96 87 89" stroke="#E11D48" stroke-width="2.4" stroke-linecap="round" fill="none"/>
</svg>`);


// ==========================================
// 8 أفاتارات رجالية كرتونية راقية ومتميزة
// ==========================================

// 1. رجل بلحية كاملة مهذبة ووقورة وثوب إسلامي ناصع
const maleBeardFull = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="mb1_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ECFDF5"/>
      <stop offset="100%" stop-color="#A7F3D0"/>
    </linearGradient>
    <linearGradient id="mb1_beard" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#27272A"/>
      <stop offset="70%" stop-color="#18181B"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <linearGradient id="mb1_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE7D6"/>
      <stop offset="100%" stop-color="#F5CBB6"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#mb1_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#10B981" stroke-width="1.5" opacity="0.4"/>
  
  <!-- ثوب إسلامي أبيض ناصع مع ياقة مطرزة بوقار -->
  <path d="M18 160 C18 122 45 108 80 108 C115 108 142 122 142 160 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
  <path d="M70 108 L72 135 L88 135 L90 108 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1"/>
  <line x1="80" y1="112" x2="80" y2="135" stroke="#94A3B8" stroke-width="1"/>
  <circle cx="80" cy="118" r="1.5" fill="#64748B"/>
  <circle cx="80" cy="128" r="1.5" fill="#64748B"/>
  
  <!-- الوجه والأذنان -->
  <circle cx="53" cy="72" r="6" fill="#F5CBB6"/>
  <circle cx="107" cy="72" r="6" fill="#F5CBB6"/>
  <ellipse cx="80" cy="70" rx="27" ry="30" fill="url(#mb1_skin)"/>
  
  <!-- شعر أسود مهذب ومصفف -->
  <path d="M50 56 C50 32 62 20 80 20 C98 20 110 32 110 56 C110 58 100 42 80 42 C60 42 50 58 50 56 Z" fill="url(#mb1_beard)"/>
  
  <!-- لحية كاملة سنية مهذبة وشارب وقور -->
  <path d="M53 72 C53 108 64 122 80 122 C96 122 107 108 107 72 C103 84 96 90 80 90 C64 90 57 84 53 72 Z" fill="url(#mb1_beard)"/>
  <path d="M66 82 Q80 88 94 82 Q80 80 66 82 Z" fill="#111827"/>
  
  <!-- حواجب -->
  <path d="M61 58 Q68 55 75 58" stroke="#18181B" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M85 58 Q92 55 99 58" stroke="#18181B" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  
  <!-- عيون مفعمة بالسكينة والصدق -->
  <ellipse cx="68.5" cy="66" rx="4" ry="4" fill="#18181B"/>
  <ellipse cx="91.5" cy="66" rx="4" ry="4" fill="#18181B"/>
  <circle cx="67" cy="64.5" r="1.4" fill="#FFFFFF"/>
  <circle cx="90" cy="64.5" r="1.4" fill="#FFFFFF"/>
  <circle cx="70" cy="67.5" r="0.7" fill="#FFFFFF"/>
  <circle cx="93" cy="67.5" r="0.7" fill="#FFFFFF"/>
  
  <path d="M78 72 Q80 76 82 76" stroke="#D97706" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.7"/>
  <path d="M74 88 Q80 92 86 88" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`);

// 2. رجل بلحية خفيفة عصرية (شاب كاجوال جذاب)
const maleBeardTrimmed = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="mb2_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EFF6FF"/>
      <stop offset="100%" stop-color="#93C5FD"/>
    </linearGradient>
    <linearGradient id="mb2_hair" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3F2E21"/>
      <stop offset="60%" stop-color="#271E17"/>
      <stop offset="100%" stop-color="#140F0B"/>
    </linearGradient>
    <linearGradient id="mb2_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFEBDD"/>
      <stop offset="100%" stop-color="#F7CDBB"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#mb2_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#3B82F6" stroke-width="1.5" opacity="0.4"/>
  
  <!-- قميص أزرق ملكي كاجوال -->
  <path d="M18 160 C18 122 45 108 80 108 C115 108 142 122 142 160 Z" fill="#1D4ED8"/>
  <path d="M68 108 L80 125 L92 108 Z" fill="#FFFFFF"/>
  <path d="M75 108 L80 116 L85 108 Z" fill="#F1F5F9"/>
  
  <!-- أذنان ووجه -->
  <circle cx="53" cy="72" r="6" fill="#F7CDBB"/>
  <circle cx="107" cy="72" r="6" fill="#F7CDBB"/>
  <ellipse cx="80" cy="72" rx="27" ry="30" fill="url(#mb2_skin)"/>
  
  <!-- قصة شعر عصرية كيرف شبابي مدروس -->
  <path d="M50 52 C52 26 68 18 80 18 C92 18 108 26 110 52 C106 42 96 34 80 34 C64 34 54 42 50 52 Z" fill="url(#mb2_hair)"/>
  <path d="M62 28 Q78 22 88 30" stroke="#78350F" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.6"/>
  
  <!-- لحية خفيفة مهذبة (Designer Stubble) متدرجة -->
  <path d="M54 74 C54 98 66 110 80 110 C94 110 106 98 106 74 C102 82 96 88 80 88 C64 88 58 82 54 74 Z" fill="#271E17" opacity="0.8"/>
  <path d="M68 81 Q80 85 92 81" stroke="#271E17" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.85"/>
  
  <!-- حواجب -->
  <path d="M61 58 Q68 55 75 58" stroke="#271E17" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M85 58 Q92 55 99 58" stroke="#271E17" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  
  <!-- عيون شبابية مشرقة -->
  <ellipse cx="68.5" cy="66" rx="4" ry="4" fill="#18181B"/>
  <ellipse cx="91.5" cy="66" rx="4" ry="4" fill="#18181B"/>
  <circle cx="67" cy="64.5" r="1.4" fill="#FFFFFF"/>
  <circle cx="90" cy="64.5" r="1.4" fill="#FFFFFF"/>
  <circle cx="70" cy="67.5" r="0.7" fill="#FFFFFF"/>
  <circle cx="93" cy="67.5" r="0.7" fill="#FFFFFF"/>
  
  <path d="M78 72 Q80 76 82 76" stroke="#D97706" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.7"/>
  <path d="M73 90 Q80 97 87 90" stroke="#991B1B" stroke-width="2.4" stroke-linecap="round" fill="none"/>
</svg>`);

// 3. رجل بدون لحية (شاب وسيم مبتسم بقميص بولو)
const maleCleanShaven = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="mb3_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0FDFA"/>
      <stop offset="100%" stop-color="#99F6E4"/>
    </linearGradient>
    <linearGradient id="mb3_hair" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#27272A"/>
      <stop offset="60%" stop-color="#18181B"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <linearGradient id="mb3_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF0E5"/>
      <stop offset="100%" stop-color="#F8D3C0"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#mb3_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#14B8A6" stroke-width="1.5" opacity="0.4"/>
  
  <!-- قميص بولو زيتي / تركوازي أنيق -->
  <path d="M18 160 C18 122 45 108 80 108 C115 108 142 122 142 160 Z" fill="#0D9488"/>
  <path d="M68 108 L80 126 L92 108 Z" fill="#115E59"/>
  <circle cx="80" cy="116" r="1.5" fill="#FFFFFF"/>
  <circle cx="80" cy="124" r="1.5" fill="#FFFFFF"/>
  
  <circle cx="53" cy="72" r="6" fill="#F8D3C0"/>
  <circle cx="107" cy="72" r="6" fill="#F8D3C0"/>
  <ellipse cx="80" cy="73" rx="27" ry="30" fill="url(#mb3_skin)"/>
  
  <!-- شعر أسود كلاسيكي فرق جانبي -->
  <path d="M50 54 C50 28 64 20 80 20 C96 20 110 28 110 54 C108 44 96 36 80 36 C64 36 52 44 50 54 Z" fill="url(#mb3_hair)"/>
  <path d="M60 30 Q75 25 85 34" stroke="#52525B" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.6"/>
  
  <!-- بشرة صافية بدون لحية -->
  <ellipse cx="61" cy="78" rx="5" ry="3" fill="#FB7185" opacity="0.25"/>
  <ellipse cx="99" cy="78" rx="5" ry="3" fill="#FB7185" opacity="0.25"/>
  
  <path d="M61 59 Q68 56 75 59" stroke="#18181B" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M85 59 Q92 56 99 59" stroke="#18181B" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  
  <ellipse cx="68.5" cy="67" rx="4" ry="4" fill="#18181B"/>
  <ellipse cx="91.5" cy="67" rx="4" ry="4" fill="#18181B"/>
  <circle cx="67" cy="65.5" r="1.4" fill="#FFFFFF"/>
  <circle cx="90" cy="65.5" r="1.4" fill="#FFFFFF"/>
  <circle cx="70" cy="68.5" r="0.7" fill="#FFFFFF"/>
  <circle cx="93" cy="68.5" r="0.7" fill="#FFFFFF"/>
  
  <path d="M78 73 Q80 77 82 77" stroke="#D97706" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.7"/>
  <!-- ابتسامة واضحة ومبهجة -->
  <path d="M72 88 Q80 97 88 88" stroke="#B91C1C" stroke-width="2.4" stroke-linecap="round" fill="none"/>
</svg>`);

// 4. رجل بنظارات طبية وذقن مهذب (مظهر أكاديمي / راقي)
const maleGlasses = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="mb4_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <linearGradient id="mb4_hair" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#451A03"/>
      <stop offset="70%" stop-color="#2D1102"/>
      <stop offset="100%" stop-color="#190901"/>
    </linearGradient>
    <linearGradient id="mb4_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2E8"/>
      <stop offset="100%" stop-color="#FCDBC9"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#mb4_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#64748B" stroke-width="1.5" opacity="0.4"/>
  
  <!-- سترة تريكو أنيقة وياقة قميص -->
  <path d="M18 160 C18 122 45 108 80 108 C115 108 142 122 142 160 Z" fill="#334155"/>
  <path d="M68 108 L80 124 L92 108 Z" fill="#F8FAFC"/>
  
  <circle cx="53" cy="72" r="6" fill="#FCDBC9"/>
  <circle cx="107" cy="72" r="6" fill="#FCDBC9"/>
  <ellipse cx="80" cy="72" rx="27" ry="30" fill="url(#mb4_skin)"/>
  
  <path d="M50 54 C50 28 64 20 80 20 C96 20 110 28 110 54 C108 44 96 36 80 36 C64 36 52 44 50 54 Z" fill="url(#mb4_hair)"/>
  
  <!-- نظارة مستطيلة عصرية بإطار داكن شيك ولمعة زجاج -->
  <rect x="58" y="60" width="19" height="15" rx="4" fill="#FFFFFF" fill-opacity="0.15" stroke="#0F172A" stroke-width="2.2"/>
  <rect x="83" y="60" width="19" height="15" rx="4" fill="#FFFFFF" fill-opacity="0.15" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="77" y1="67" x2="83" y2="67" stroke="#0F172A" stroke-width="2.2"/>
  <line x1="60" y1="63" x2="64" y2="61" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity="0.8"/>
  <line x1="85" y1="63" x2="89" y2="61" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity="0.8"/>
  
  <ellipse cx="67.5" cy="67" rx="3.5" ry="3.8" fill="#1E293B"/>
  <ellipse cx="92.5" cy="67" rx="3.5" ry="3.8" fill="#1E293B"/>
  <circle cx="66" cy="65.5" r="1.3" fill="#FFFFFF"/>
  <circle cx="91" cy="65.5" r="1.3" fill="#FFFFFF"/>
  
  <!-- ذقن خفيف وشارب مهذب -->
  <path d="M60 80 C60 98 70 106 80 106 C90 106 100 98 100 80 C96 86 90 90 80 90 C70 90 64 86 60 80 Z" fill="#2D1102" opacity="0.8"/>
  <path d="M68 81 Q80 85 92 81" stroke="#2D1102" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.85"/>
  
  <path d="M74 89 Q80 94 86 89" stroke="#991B1B" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`);

// 5. رجل بشماغ وعقال عربي أصيل ومظهر ملكي
const maleShemagh = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="mb5_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="100%" stop-color="#FDE68A"/>
    </linearGradient>
    <linearGradient id="mb5_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE7D6"/>
      <stop offset="100%" stop-color="#F5CBB6"/>
    </linearGradient>
    <linearGradient id="mb5_agal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="60%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#mb5_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#F59E0B" stroke-width="1.5" opacity="0.4"/>
  
  <!-- ثوب أبيض بياقة رسمية -->
  <path d="M18 160 C18 122 45 108 80 108 C115 108 142 122 142 160 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
  
  <!-- شماغ أحمر وأبيض منسدل على الكتفين بانسيابية أصيلة -->
  <path d="M34 70 C34 32 52 18 80 18 C108 18 126 32 126 70 C126 118 116 142 114 156 C102 136 60 136 46 156 C44 142 34 118 34 70 Z" fill="#DC2626"/>
  <!-- نقوش الشماغ الهندسية الدقيقة -->
  <path d="M40 70 L48 85 L56 70 L64 85 L72 70 L80 85 L88 70 L96 85 L104 70 L112 85 L120 70" stroke="#FFFFFF" stroke-width="1.8" fill="none" opacity="0.85"/>
  <path d="M40 90 L48 105 L56 90 L64 105 L72 90 L80 105 L88 90 L96 105 L104 90 L112 105 L120 90" stroke="#FFFFFF" stroke-width="1.8" fill="none" opacity="0.85"/>
  <path d="M42 110 L50 125 L58 110 L66 125 L74 110 L82 125 L90 110 L98 125 L106 110 L114 125" stroke="#FFFFFF" stroke-width="1.8" fill="none" opacity="0.85"/>
  
  <!-- عقال أسود فخم مزدوج بحبات ذهبية -->
  <ellipse cx="80" cy="38" rx="38" ry="7.5" fill="none" stroke="url(#mb5_agal)" stroke-width="5.5"/>
  <ellipse cx="80" cy="45" rx="38" ry="6.5" fill="none" stroke="url(#mb5_agal)" stroke-width="5"/>
  <circle cx="80" cy="41" r="1.5" fill="#FBBF24"/>
  
  <!-- الوجه العربي الأصيل -->
  <ellipse cx="80" cy="74" rx="26" ry="29" fill="url(#mb5_skin)"/>
  
  <!-- شوارب ولحية خليجية مشذبة -->
  <path d="M57 78 C57 98 68 108 80 108 C92 108 103 98 103 78 C98 85 92 89 80 89 C68 89 62 85 57 78 Z" fill="#18181B"/>
  <path d="M66 82 Q80 87 94 82" stroke="#09090B" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  
  <path d="M61 60 Q68 57 75 60" stroke="#18181B" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M85 60 Q92 57 99 60" stroke="#18181B" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  
  <ellipse cx="68.5" cy="67" rx="4" ry="4" fill="#18181B"/>
  <ellipse cx="91.5" cy="67" rx="4" ry="4" fill="#18181B"/>
  <circle cx="67" cy="65.5" r="1.4" fill="#FFFFFF"/>
  <circle cx="90" cy="65.5" r="1.4" fill="#FFFFFF"/>
  <circle cx="70" cy="68.5" r="0.7" fill="#FFFFFF"/>
  <circle cx="93" cy="68.5" r="0.7" fill="#FFFFFF"/>
  
  <path d="M78 73 Q80 77 82 77" stroke="#D97706" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.7"/>
</svg>`);

// 6. رجل بطاقية إسلامية بيضاء وجبة خضراء راقية
const maleTaqiyah = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="mb6_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0FDF4"/>
      <stop offset="100%" stop-color="#BBF7D0"/>
    </linearGradient>
    <linearGradient id="mb6_robe" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="60%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#064E3B"/>
    </linearGradient>
    <linearGradient id="mb6_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE7D6"/>
      <stop offset="100%" stop-color="#F5CBB6"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#mb6_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#10B981" stroke-width="1.5" opacity="0.4"/>
  
  <!-- جبة إسلامية خضراء مع تطريز صدري ذهبي -->
  <path d="M18 160 C18 122 45 108 80 108 C115 108 142 122 142 160 Z" fill="url(#mb6_robe)"/>
  <line x1="80" y1="108" x2="80" y2="145" stroke="#FBBF24" stroke-width="2"/>
  <circle cx="80" cy="116" r="2" fill="#FBBF24"/>
  <circle cx="80" cy="128" r="2" fill="#FBBF24"/>
  
  <circle cx="53" cy="72" r="6" fill="#F5CBB6"/>
  <circle cx="107" cy="72" r="6" fill="#F5CBB6"/>
  <ellipse cx="80" cy="74" rx="27" ry="30" fill="url(#mb6_skin)"/>
  
  <!-- طاقية إسلامية بيضاء مخرمة بنقوش هندسية دقيقة -->
  <path d="M52 52 C52 28 64 20 80 20 C96 20 108 28 108 52 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
  <path d="M56 46 Q80 40 104 46" stroke="#CBD5E1" stroke-width="1.5" fill="none"/>
  <path d="M60 36 Q80 30 100 36" stroke="#CBD5E1" stroke-width="1.5" fill="none"/>
  
  <!-- لحية دائرية إسلامية مهذبة -->
  <path d="M58 78 C58 102 68 110 80 110 C92 110 102 102 102 78 C98 85 92 89 80 89 C68 89 62 85 58 78 Z" fill="#18181B"/>
  <path d="M68 81 Q80 85 92 81" stroke="#09090B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  
  <path d="M61 59 Q68 56 75 59" stroke="#18181B" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M85 59 Q92 56 99 59" stroke="#18181B" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  
  <ellipse cx="68.5" cy="67" rx="4" ry="4" fill="#18181B"/>
  <ellipse cx="91.5" cy="67" rx="4" ry="4" fill="#18181B"/>
  <circle cx="67" cy="65.5" r="1.4" fill="#FFFFFF"/>
  <circle cx="90" cy="65.5" r="1.4" fill="#FFFFFF"/>
  
  <path d="M78 73 Q80 77 82 77" stroke="#D97706" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.7"/>
  <path d="M74 89 Q80 94 86 89" stroke="#B45309" stroke-width="2.2" stroke-linecap="round" fill="none"/>
</svg>`);

// 7. رجل كبير السن وقور بلحية بيضاء فضية وبشت بني
const maleElderly = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="mb7_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="100%" stop-color="#FDE68A"/>
    </linearGradient>
    <linearGradient id="mb7_bisht" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#92400E"/>
      <stop offset="60%" stop-color="#78350F"/>
      <stop offset="100%" stop-color="#451A03"/>
    </linearGradient>
    <linearGradient id="mb7_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF0E5"/>
      <stop offset="100%" stop-color="#F3CBB8"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#mb7_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#F59E0B" stroke-width="1.5" opacity="0.4"/>
  
  <!-- بشت جملي فاخر مطرز بالقصب الذهبي -->
  <path d="M18 160 C18 122 45 108 80 108 C115 108 142 122 142 160 Z" fill="url(#mb7_bisht)"/>
  <path d="M70 108 L80 135 L90 108 Z" fill="#FFFFFF"/>
  <line x1="72" y1="112" x2="80" y2="135" stroke="#FBBF24" stroke-width="2"/>
  <line x1="88" y1="112" x2="80" y2="135" stroke="#FBBF24" stroke-width="2"/>
  
  <circle cx="53" cy="72" r="6" fill="#F3CBB8"/>
  <circle cx="107" cy="72" r="6" fill="#F3CBB8"/>
  <ellipse cx="80" cy="71" rx="27" ry="30" fill="url(#mb7_skin)"/>
  
  <!-- شعر أبيض فضي جانبي -->
  <path d="M50 56 C50 32 62 22 80 22 C98 22 110 32 110 56 C110 58 100 44 80 44 C60 44 50 58 50 56 Z" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
  
  <!-- لحية بيضاء فضية وقورة جداً -->
  <path d="M53 72 C53 110 64 125 80 125 C96 125 107 110 107 72 C103 84 96 90 80 90 C64 90 57 84 53 72 Z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>
  <path d="M66 82 Q80 88 94 82 Q80 80 66 82 Z" fill="#E2E8F0"/>
  
  <!-- خطوط وقار وتجاعيد حكمة حول العينين -->
  <path d="M60 67 Q63 65 65 67" stroke="#94A3B8" stroke-width="1.2" stroke-linecap="round" fill="none"/>
  <path d="M95 67 Q97 65 100 67" stroke="#94A3B8" stroke-width="1.2" stroke-linecap="round" fill="none"/>
  
  <!-- حواجب رمادية -->
  <path d="M61 58 Q68 55 75 58" stroke="#94A3B8" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M85 58 Q92 55 99 58" stroke="#94A3B8" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  
  <!-- عيون هادئة ودافئة -->
  <ellipse cx="68.5" cy="66" rx="3.8" ry="3.8" fill="#334155"/>
  <ellipse cx="91.5" cy="66" rx="3.8" ry="3.8" fill="#334155"/>
  <circle cx="67" cy="64.5" r="1.3" fill="#FFFFFF"/>
  <circle cx="90" cy="64.5" r="1.3" fill="#FFFFFF"/>
  
  <path d="M78 72 Q80 76 82 76" stroke="#D97706" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.7"/>
  <path d="M74 88 Q80 92 86 88" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`);

// 8. رجل ببدلة رسمية كحلية أنيقة وربطة عنق زمردية
const maleSuit = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <defs>
    <linearGradient id="mb8_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <linearGradient id="mb8_suit" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="60%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="mb8_hair" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3F2E21"/>
      <stop offset="70%" stop-color="#271E17"/>
      <stop offset="100%" stop-color="#140F0B"/>
    </linearGradient>
    <linearGradient id="mb8_skin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFEBDD"/>
      <stop offset="100%" stop-color="#F7CDBB"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="78" fill="url(#mb8_bg)"/>
  <circle cx="80" cy="80" r="77" fill="none" stroke="#64748B" stroke-width="1.5" opacity="0.4"/>
  
  <!-- بدلة إيطالية كحلية فاخرة وقميص وربطة عنق زمردية -->
  <path d="M18 160 C18 122 45 108 80 108 C115 108 142 122 142 160 Z" fill="url(#mb8_suit)"/>
  <!-- قميص أبيض مثلث -->
  <path d="M64 108 L80 136 L96 108 Z" fill="#FFFFFF"/>
  <!-- ربطة عنق زمردية مع دبوس ذهبي -->
  <path d="M76 114 L84 114 L82 145 L78 145 Z" fill="#047857"/>
  <line x1="77" y1="124" x2="83" y2="124" stroke="#FBBF24" stroke-width="1.5"/>
  <!-- طيات جاكيت البدلة -->
  <path d="M60 108 L76 142 L72 160" fill="none" stroke="#334155" stroke-width="1.8"/>
  <path d="M100 108 L84 142 L88 160" fill="none" stroke="#334155" stroke-width="1.8"/>
  
  <circle cx="53" cy="72" r="6" fill="#F7CDBB"/>
  <circle cx="107" cy="72" r="6" fill="#F7CDBB"/>
  <ellipse cx="80" cy="72" rx="27" ry="30" fill="url(#mb8_skin)"/>
  
  <!-- شعر كلاسيكي رجالي أنيق ومسرح -->
  <path d="M50 52 C52 26 68 18 80 18 C92 18 108 26 110 52 C106 42 96 34 80 34 C64 34 54 42 50 52 Z" fill="url(#mb8_hair)"/>
  <path d="M62 28 Q78 22 88 30" stroke="#78350F" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.6"/>
  
  <path d="M61 58 Q68 55 75 58" stroke="#271E17" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M85 58 Q92 55 99 58" stroke="#271E17" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  
  <ellipse cx="68.5" cy="66" rx="4" ry="4" fill="#18181B"/>
  <ellipse cx="91.5" cy="66" rx="4" ry="4" fill="#18181B"/>
  <circle cx="67" cy="64.5" r="1.4" fill="#FFFFFF"/>
  <circle cx="90" cy="64.5" r="1.4" fill="#FFFFFF"/>
  <circle cx="70" cy="67.5" r="0.7" fill="#FFFFFF"/>
  <circle cx="93" cy="67.5" r="0.7" fill="#FFFFFF"/>
  
  <path d="M78 72 Q80 76 82 76" stroke="#D97706" stroke-width="1.3" stroke-linecap="round" fill="none" opacity="0.7"/>
  <path d="M73 90 Q80 97 87 90" stroke="#991B1B" stroke-width="2.4" stroke-linecap="round" fill="none"/>
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
