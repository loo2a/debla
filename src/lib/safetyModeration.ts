/**
 * وحدة الحماية والأمان الأخلاقي للدردشة والمحتوى (Chat & Content Safety Moderation)
 * تكشف محاولات مشاركة أرقام الهواتف، الروابط، الحسابات الخارجية، أو الألفاظ غير اللائقة
 */

export interface ModerationResult {
  isAllowed: boolean;
  violationType?: "phone" | "link" | "social" | "inappropriate";
  reason?: string;
}

// أرقام باللغة العربية والإنجليزية
const ARABIC_DIGIT_MAP: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

// الأرقام المكتوبة بالحروف
const NUMBER_WORDS_REGEX = /(صفر|واحد|إثنين|اثنين|تلاتة|ثلاثة|أربعة|اربعة|خمسة|ستة|سبعة|تمانية|ثمانية|تسعة|عشرة)/gi;

export function normalizeDigits(text: string): string {
  return text.replace(/[٠-٩]/g, (d) => ARABIC_DIGIT_MAP[d] || d);
}

/**
 * فحص الرسالة لمنع تبادل وسائل التواصل الخارجية أو أرقام الهواتف
 */
export function checkMessageSafety(content: string): ModerationResult {
  if (!content || !content.trim()) {
    return { isAllowed: true };
  }

  const raw = content.trim();
  const normalizedDigits = normalizeDigits(raw);

  // 1) فحص أرقام الهواتف (تسلسلات رقمية 8 أرقام فما فوق، أو مفاتيح دولية وأرقام مصرية/عربية)
  // يغطي الحالات مع الفواصل والمسافات والشرطات: 0 1 0 1 2 3 4 5 6 7
  const strippedNumberLike = normalizedDigits.replace(/[\s\-_.,/\\()]/g, "");
  
  const phonePatterns = [
    /(01[0125][0-9]{8})/g,                 // أرقام الموبايل المصرية
    /(\+?20[0-9]{10})/g,                   // كود مصر الدولي
    /(05[0-9]{8})/g,                       // أرقام السعودية
    /(\+?966[0-9]{9})/g,                   // كود السعودية الدولي
    /(\+?[0-9]{10,14})/g,                  // أي رقم دولي من 10 إلى 14 رقماً
  ];

  for (const regex of phonePatterns) {
    if (regex.test(strippedNumberLike)) {
      return {
        isAllowed: false,
        violationType: "phone",
        reason: "يُمنع مشاركة أرقام الهواتف مباشرة في المحادثات حفاظاً على خصوصيتك وأمان التعارف الشرعي.",
      };
    }
  }

  // فحص الكلمات الرقمية المتتالية (مثل: زيرو واحد صفر...)
  const spelledNumbers = raw.match(NUMBER_WORDS_REGEX);
  if (spelledNumbers && spelledNumbers.length >= 5) {
    return {
      isAllowed: false,
      violationType: "phone",
      reason: "يُمنع كتابة أرقام الهواتف بالحروف لتفادي انتهاك ميثاق الخصوصية والوقار.",
    };
  }

  // 2) فحص الروابط والمواقع الخارجية
  const linkPatterns = [
    /https?:\/\/[^\s]+/i,
    /www\.[^\s]+/i,
    /[a-zA-Z0-9-]+\.(com|net|org|me|info|io|xyz|app|site|online)[^\s]*/i,
    /(wa\.me|t\.me|telegram\.me|fb\.com|instagram\.com|snapchat\.com|tiktok\.com)/i,
  ];

  for (const regex of linkPatterns) {
    if (regex.test(raw)) {
      return {
        isAllowed: false,
        violationType: "link",
        reason: "يُمنع إرسال الروابط أو المواقع الخارجية داخل التطبيق حرصاً على الأمان التقني والأخلاقي.",
      };
    }
  }

  // 3) فحص طلبات ووسائل التواصل الخارجي
  const socialKeywords = [
    /(واتس|واتساب|الواتس|واتس اب|whatsapp)/i,
    /(تليجرام|تيليجرام|تليغرام|تيليغرام|telegram)/i,
    /(انستجرام|انستقرام|إنستغرام|انستا|instagram|insta)/i,
    /(فيسبوك|فيس بوك|فيس|facebook)/i,
    /(سناب|سناب شات|snapchat)/i,
    /(رقمي|تليفوني|تلفوني|موبايلي|رقم الموبايل|هاتفي)/i,
  ];

  for (const regex of socialKeywords) {
    // إذا ذكر وسيلة خارجية مصحوبة بأرقام أو طلب مباشر
    if (regex.test(raw) && (/[0-9]/.test(normalizedDigits) || /ابعتلي|كلمني|ضيفني|نتكلم برة|نتكلم برا/i.test(raw))) {
      return {
        isAllowed: false,
        violationType: "social",
        reason: "يُرجى إتمام مسار التعارف برقي ووقار داخل المنصة؛ يُمنع طلب أو تداول وسائل التواصل الخارجية.",
      };
    }
  }

  return { isAllowed: true };
}
