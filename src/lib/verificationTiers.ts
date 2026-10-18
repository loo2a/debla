import { UserProfile, VerificationTierType, VerificationTierConfig } from "../types";

/**
 * إعدادات وبيانات مستويات الثقة والتحقق الأربعة (الثقة والتحقق متعدد المستويات)
 * كل علامة توضح بدقة ما تم التحقق منه، ولا تعني بالضرورة الصلاح أو حسن الخلق.
 */
export const VERIFICATION_TIERS: VerificationTierConfig[] = [
  {
    id: "phone",
    levelNumber: 1,
    title: "التحقق من رقم الهاتف",
    badgeLabel: "هاتف موثق",
    iconName: "Smartphone",
    colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    whatVerified: "تم التحقق من ملكية وصحة رقم الهاتف المسجل عبر رمز تأكيد SMS / OTP رسمي.",
    importantDisclaimer: "التحقق يؤكد أن الرقم صالح ويعود للمشترك، ولا يعني معرفة مسبقة بشخصيته أو خلقه.",
  },
  {
    id: "photo",
    levelNumber: 2,
    title: "مطابقة الصورة الشخصية",
    badgeLabel: "صورة مطابقة",
    iconName: "Camera",
    colorClass: "bg-blue-50 text-blue-700 border-blue-200",
    whatVerified: "تمت مراجعة ومطابقة ملامح الصورة الحقيقية للتأكد من أنها تخص صاحب الحساب وليست صورة عامة أو وهمية.",
    importantDisclaimer: "مطابقة الصورة تمنع انتحال الشخصيات، لكنها لا تضمن المواصفات الأخلاقية أو السلوكية.",
  },
  {
    id: "id",
    levelNumber: 3,
    title: "التحقق الآمن من الهوية الرسمية",
    badgeLabel: "هوية موثقة",
    iconName: "ShieldCheck",
    colorClass: "bg-purple-50 text-purple-700 border-purple-200",
    whatVerified: "تمت مطابقة الاسم والسن القانوني (18+) من بطاقة الهوية / جواز السفر بإجراء مشفر وآمن دون حفظ الوثائق.",
    importantDisclaimer: "توثيق الهوية يضمن وجود الشخص القانوني وسنه، ولكنه لا يعني بالضرورة الصلاح التام أو الجدية الزوجية.",
  },
  {
    id: "docs",
    levelNumber: 4,
    title: "مراجعة مستندات وبيانات إضافية",
    badgeLabel: "مستندات مراجعة",
    iconName: "FileCheck2",
    colorClass: "bg-amber-50 text-amber-700 border-amber-200",
    whatVerified: "تمت مراجعة مستندات إضافية تدعم صحة المؤهل العلمي، أو الوظيفة، أو الحالة الاجتماعية المعروضة بالملف.",
    importantDisclaimer: "مراجعة المستندات تؤكد الشهادات والبيانات الورقية، ولا تغني عن السؤال الشرعي والاستخارة.",
  },
];

export interface UserTierStatus {
  tier: VerificationTierConfig;
  isVerified: boolean;
}

/**
 * فحص وحساب حالة كل مستوى من مستويات التوثيق لحساب معين
 */
export function getUserVerificationTiers(user?: UserProfile | null): UserTierStatus[] {
  if (!user) {
    return VERIFICATION_TIERS.map((tier) => ({ tier, isVerified: false }));
  }

  return VERIFICATION_TIERS.map((tier) => {
    let isVerified = false;
    switch (tier.id) {
      case "phone":
        isVerified = Boolean(user.isMobileVerified || user.mobile);
        break;
      case "photo":
        isVerified = Boolean(user.isPhotoVerified);
        break;
      case "id":
        isVerified = Boolean(user.isIdVerified ?? user.isVerified);
        break;
      case "docs":
        isVerified = Boolean(user.isDocsVerified);
        break;
    }
    return { tier, isVerified };
  });
}

/**
 * نصيحة وميثاق الأمانة الشرعية
 */
export const TRUST_AND_VERIFICATION_CHARTER = {
  title: "مبدأ الشفافية والأمانة الشرعية في التحقق",
  summary:
    "في منصة مودة ورحمة، نوثق الحقائق المجردة ولا نمنح تزكية للنفوس. توثيق الهوية أو الهاتف يعني ثبوت البيانات المدخلة، لكنه لا يعني بالضرورة الصلاح أو حسن الخلق أو الجدية التامة.",
  advice: [
    "توثيق الهوية والرقم يمنع الحسابات الوهمية والاحتيال.",
    "التحقق من الصورة يمنع استخدام صور المشاهير أو الصور المنقولة.",
    "يظل السؤال العائلي والتقصي المباشر عن الدين والخلق واجباً شرعياً على ولي الأمر والأسرة.",
    "صلاة الاستخارة واستشارة الصالحين أساس لا غنى عنه قبل أي خطوة رسمية.",
  ],
};
