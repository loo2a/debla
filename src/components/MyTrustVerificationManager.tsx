import React, { useState } from "react";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { 
  getUserVerificationTiers, TRUST_AND_VERIFICATION_CHARTER, 
  VERIFICATION_TIERS 
} from "../lib/verificationTiers";
import { VerificationTierType } from "../types";
import { 
  ShieldCheck, Smartphone, Camera, FileCheck2, 
  CheckCircle2, AlertTriangle, ArrowRight, X, Clock,
  Lock, Send, Check
} from "lucide-react";

export const MyTrustVerificationManager: React.FC = () => {
  const { currentUser, requestTierVerification } = useApp();
  const { addToast } = useUIStore();

  const [activeModalTier, setActiveModalTier] = useState<VerificationTierType | null>(null);
  const [phoneInput, setPhoneInput] = useState(currentUser?.mobile || "");
  const [requestNotes, setRequestNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  const tiers = getUserVerificationTiers(currentUser);
  const verifiedCount = tiers.filter((t) => t.isVerified).length;

  const handleOpenRequestModal = (tierId: VerificationTierType) => {
    setActiveModalTier(tierId);
    setRequestNotes("");
    if (tierId === "phone") {
      setPhoneInput(currentUser.mobile || "");
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalTier) return;

    setIsSubmitting(true);
    try {
      const details = activeModalTier === "phone" ? phoneInput : requestNotes;
      const res = await requestTierVerification(activeModalTier, details);

      if (res.ok) {
        if (activeModalTier === "phone") {
          addToast("تم التحقق من رقم الهاتف وتوثيقه بنجاح!", "success");
        } else {
          addToast("تم إرسال طلب التوثيق للمراجعة والتدقيق من الإدارة بنجاح.", "success");
        }
        setActiveModalTier(null);
      } else {
        addToast(res.error || "فشل إرسال الطلب", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTierIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case "Smartphone":
        return <Smartphone className={className} />;
      case "Camera":
        return <Camera className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      case "FileCheck2":
        return <FileCheck2 className={className} />;
      default:
        return <ShieldCheck className={className} />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">
              مركز الثقة والتحقق متعدد المستويات
            </h4>
            <p className="text-[11px] text-slate-500">
              وثّق حسابك لزيادة الثقة والمصداقية الشرعية أمام الأعضاء الجادين
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
          {verifiedCount} من 4 مستويات
        </span>
      </div>

      {/* 4 Tiers List */}
      <div className="space-y-3">
        {tiers.map((t) => (
          <div
            key={t.tier.id}
            className={`p-3.5 rounded-2xl border transition space-y-2 ${
              t.isVerified
                ? "bg-emerald-50/40 border-emerald-200/80"
                : "bg-slate-50/70 border-slate-200/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`p-1.5 rounded-lg border ${
                    t.isVerified ? t.tier.colorClass : "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  {renderTierIcon(t.tier.iconName)}
                </span>
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    مستوى {t.tier.levelNumber}: {t.tier.title}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {t.tier.whatVerified}
                  </span>
                </div>
              </div>

              {t.isVerified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>موثق بنجاح</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenRequestModal(t.tier.id)}
                  className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span>طلب التوثيق</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Essential Islamic Transparency Charter Box */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5">
        <p className="font-extrabold flex items-center gap-1.5 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>مبدأ الأمانة والشفافية الشرعية:</span>
        </p>
        <p className="text-[11px] leading-relaxed text-amber-900/90">
          «كل علامة توضّح بالضبط ما تم التحقق منه؛ فلا تعني هوية موثقة أو هاتف مفحوص أن الشخص جاد أو حسن الخلق بالضرورة». 
          المنصة تثبت البيانات المادية، ويظل السؤال العائلي والاستخارة والتقصي المباشر واجباً شرعياً على كل أسرة.
        </p>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Request Modal                                        */}
      {/* ---------------------------------------------------- */}
      {activeModalTier && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveModalTier(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-right"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>
                  طلب: {VERIFICATION_TIERS.find((t) => t.id === activeModalTier)?.title}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModalTier(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {VERIFICATION_TIERS.find((t) => t.id === activeModalTier)?.whatVerified}
            </p>

            <form onSubmit={handleSubmitRequest} className="space-y-3">
              {activeModalTier === "phone" ? (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    أدخل رقم الهاتف لتأكيده
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01xxxxxxxxx"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 font-mono text-left"
                    dir="ltr"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    يتم التحقق من ملكية الرقم لضمان التواصل الرسمي ومنع الحسابات المكررة.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ملاحظات أو تفاصيل التحقق المطلوبة
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      activeModalTier === "photo"
                        ? "أؤكد أن صورتي المرفوعة حقيقية وأطلب مطابقتها واعتماد شارة مطابقة الصورة..."
                        : activeModalTier === "id"
                        ? "أطلب التحقق الآمن من بطاقة الهوية الرسمية لمطابقة الاسم والسن القانوني..."
                        : "مستندات المؤهل الدراسي أو جهة العمل للمراجعة..."
                    }
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600"
                  />
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 mt-1.5">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                    <span>جميع البيانات والمستندات تُعامل بمنتهى السرية والأمانة ولا تُنشر إطلاقاً.</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الإرسال..." : "إرسال طلب التحقق"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTier(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
