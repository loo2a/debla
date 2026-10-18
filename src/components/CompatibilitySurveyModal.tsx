import React, { useState } from "react";
import {
  Sparkles,
  Heart,
  AlertTriangle,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Flame,
  Shield,
  Compass,
  Smile,
  Save,
} from "lucide-react";
import { useApp } from "../lib/store";
import { CompatibilitySurvey } from "../types";

interface CompatibilitySurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LEISURE_OPTIONS = [
  "قعدة بيت رايقة مع نسكافيه وقراءة أو فيلم مفيد",
  "خروجة وتمشية واكتشاف أماكن وكافيهات جديدة",
  "زيارة العيلة ولمة الأهل والأحباب",
  "رياضة أو سفر سريع لتغيير الجو وتجديد النشاط",
];

const CONFLICT_OPTIONS = [
  "نتكلم بهدوء في نفس اليوم ومنبيتش زعلانين من بعض",
  "نسكت شوية وناخد وقت نهدى وبعدين نناقش الموضوع بالعقل",
  "نكتب لبعض رسائل واضحة بدون شد وجذب ونقاش حاد",
  "الاعتذار الصادق وتجاوز الموقف مع مراعاة مشاعر الطرف التاني",
];

const FINANCIAL_OPTIONS = [
  "الزوج متكفل بالأساسيات، وراتب الزوجة إن عملت حرية شخصية",
  "المشاركة والتعاون والتخطيط المشترك لمستقبل وأولويات الأسرة",
  "ميزانية شهرية محددة وخطة ادخار واضحة من أول يوم",
  "البساطة والاعتدال وعدم التكلف والرضا بالمقسوم",
];

const PRIVACY_OPTIONS = [
  "خصوصية بيتنا خط أحمر تام ومحدش من برا يتدخل في تفاصيلنا",
  "بر الأهل وإكرامهم مع استقلالية تامة في القرارات الزوجية",
  "استشارة أصحاب الحكمة من الأهل في القرارات المصيرية فقط",
  "علاقة ودية منفتحة مع زيارات عائلية مستمرة",
];

const LIFE_PRIORITY_OPTIONS = [
  "السكينة والمودة وصحبة تعين على طاعة الله ودخول الجنة",
  "تربية أطفال صالحين وبناء أسرة متماسكة ومستقرة",
  "شراكة داعمة لتحقيق الطموح والنجاح العلمي والعملي",
  "حياة هادئة وبسيطة خالية من النكد والتعقيد",
];

export const RED_FLAG_OPTIONS = [
  "التدخين",
  "التهاون في الصلاة",
  "العصبية والصوت العالي",
  "البخل والحرص الشديد",
  "إدمان السوشيال ميديا وإفشاء الأسرار",
  "قلة الالتزام الديني",
  "الغيرة المرضية والشك",
  "الاعتمادية وعدم تحمل المسؤولية",
];

export const FLEXIBLE_POINTS_OPTIONS = [
  "فارق السن (أكبر أو أصغر بسنوات معقولة)",
  "المستوى المادي أو إمكانيات بداية الزواج",
  "طبيعة عمل الزوجة أو ساعات الدوام",
  "المسافة الجغرافية أو الاستعداد لتغيير السكن",
  "تقاسم الأعمال المنزلية برضا وتفاهم",
  "التفاصيل المادية المرتبطة بالعفش والذهب",
];

export const CompatibilitySurveyModal: React.FC<CompatibilitySurveyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { mySurvey, saveCompatibilitySurvey } = useApp();

  const [leisureStyle, setLeisureStyle] = useState<string>(mySurvey?.leisureStyle || "");
  const [conflictStyle, setConflictStyle] = useState<string>(mySurvey?.conflictStyle || "");
  const [financialView, setFinancialView] = useState<string>(mySurvey?.financialView || "");
  const [privacyBoundary, setPrivacyBoundary] = useState<string>(mySurvey?.privacyBoundary || "");
  const [lifePriority, setLifePriority] = useState<string>(mySurvey?.lifePriority || "");
  const [redFlags, setRedFlags] = useState<string[]>(mySurvey?.redFlags || []);
  const [flexiblePoints, setFlexiblePoints] = useState<string[]>(mySurvey?.flexiblePoints || []);
  const [isPublicInProfile, setIsPublicInProfile] = useState<boolean>(
    mySurvey?.isPublicInProfile ?? true
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  if (!isOpen) return null;

  const toggleRedFlag = (flag: string) => {
    setRedFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const toggleFlexiblePoint = (point: string) => {
    setFlexiblePoints((prev) =>
      prev.includes(point) ? prev.filter((p) => p !== point) : [...prev, point]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    const payload: Omit<CompatibilitySurvey, "userId"> = {
      leisureStyle,
      conflictStyle,
      financialView,
      privacyBoundary,
      lifePriority,
      redFlags,
      flexiblePoints,
      isPublicInProfile,
    };

    const result = await saveCompatibilitySurvey(payload);
    setIsSubmitting(false);

    if (result.ok) {
      setFeedback({ type: "success", message: "تم حفظ استبيان التوافق بنجاح! سيتم استخدامه في ترشيحات الشريك." });
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setFeedback({ type: "error", message: result.error || "حدث خطأ أثناء الحفظ." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-rose-100 dark:border-slate-800 my-8 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                استبيان التوافق الذكي والخطوط الحمراء
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                إجاباتك تساعدنا في اقتراح الشريك الأكثر توافقاً وتفادي ما لا يناسبك
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Questions Body */}
        <div className="overflow-y-auto pr-1 py-4 space-y-6 flex-1 text-right">
          {/* Section 1: Leisure */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Smile className="w-4 h-4 text-rose-500" />
              1. لو عندك يوم إجازة كامل، إيه نمطك المفضل لقضاء الوقت؟
            </label>
            <div className="flex flex-wrap gap-2">
              {LEISURE_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setLeisureStyle(opt)}
                  className={`px-3.5 py-2 text-xs sm:text-sm rounded-xl border transition-all text-right ${
                    leisureStyle === opt
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 font-medium shadow-sm"
                      : "bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-rose-50/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Conflict */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-500" />
              2. لما يحصل سوء تفاهم أو خلاف بين الزوجين، إيه أسلوبك في التعامل؟
            </label>
            <div className="flex flex-wrap gap-2">
              {CONFLICT_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setConflictStyle(opt)}
                  className={`px-3.5 py-2 text-xs sm:text-sm rounded-xl border transition-all text-right ${
                    conflictStyle === opt
                      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300 font-medium shadow-sm"
                      : "bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-amber-50/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Financial */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              3. إيه نظرتك لإدارة مصاريف البيت والتخطيط المالي؟
            </label>
            <div className="flex flex-wrap gap-2">
              {FINANCIAL_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setFinancialView(opt)}
                  className={`px-3.5 py-2 text-xs sm:text-sm rounded-xl border transition-all text-right ${
                    financialView === opt
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-medium shadow-sm"
                      : "bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-50/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Privacy */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Heart className="w-4 h-4 text-purple-500" />
              4. حدود علاقة البيت الجديد بالأهل والعائلتين؟
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIVACY_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setPrivacyBoundary(opt)}
                  className={`px-3.5 py-2 text-xs sm:text-sm rounded-xl border transition-all text-right ${
                    privacyBoundary === opt
                      ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300 font-medium shadow-sm"
                      : "bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-purple-50/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Life Priority */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              5. إيه أكتر أولوية أو هدف بيشغلك في رحلة الزواج؟
            </label>
            <div className="flex flex-wrap gap-2">
              {LIFE_PRIORITY_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setLifePriority(opt)}
                  className={`px-3.5 py-2 text-xs sm:text-sm rounded-xl border transition-all text-right ${
                    lifePriority === opt
                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 font-medium shadow-sm"
                      : "bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Section 6: Red Flags */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
            <label className="text-sm font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              6. الخطوط الحمراء (Red Flags) التي لا تتقبلها مطلقاً في الشريك:
            </label>
            <p className="text-xs text-rose-600/80 dark:text-rose-400">
              اختر الأمور التي تعتبرها حاسمة لعدم التوافق (يمكن اختيار أكثر من خيار):
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {RED_FLAG_OPTIONS.map((flag) => {
                const selected = redFlags.includes(flag);
                return (
                  <button
                    type="button"
                    key={flag}
                    onClick={() => toggleRedFlag(flag)}
                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-xl border transition-all flex items-center gap-1.5 ${
                      selected
                        ? "bg-rose-600 border-rose-600 text-white font-medium shadow-sm shadow-rose-600/30"
                        : "bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 hover:border-rose-400"
                    }`}
                  >
                    {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {flag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 7: Flexible Points */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <label className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              7. أمور ونقاط تتقبل فيها المرونة والتفاهم:
            </label>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400">
              اختر الأمور التي تعتبرها ثانوية ويمكنك التغاضي عنها والتفاهم بشأنها:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {FLEXIBLE_POINTS_OPTIONS.map((pt) => {
                const selected = flexiblePoints.includes(pt);
                return (
                  <button
                    type="button"
                    key={pt}
                    onClick={() => toggleFlexiblePoint(pt)}
                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-xl border transition-all flex items-center gap-1.5 ${
                      selected
                        ? "bg-emerald-600 border-emerald-600 text-white font-medium shadow-sm shadow-emerald-600/30"
                        : "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 hover:border-emerald-400"
                    }`}
                  >
                    {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {pt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 8: Profile Display Privacy */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                {isPublicInProfile ? (
                  <Eye className="w-4 h-4 text-rose-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
                عرض نتائج الاستبيان في ملفك الشخصي
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                عند التفعيل، ستظهر إجاباتك والخطوط الحمراء للأعضاء المهتمين بك لمزيد من الوضوح.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isPublicInProfile}
                onChange={(e) => setIsPublicInProfile(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              {feedback.message}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-rose-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 text-sm font-medium transition"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "جاري الحفظ..." : "حفظ نتائج الاستبيان"}
          </button>
        </div>
      </div>
    </div>
  );
};
