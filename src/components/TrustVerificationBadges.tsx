import React, { useState } from "react";
import { UserProfile } from "../types";
import { 
  getUserVerificationTiers, UserTierStatus, 
  TRUST_AND_VERIFICATION_CHARTER 
} from "../lib/verificationTiers";
import { 
  Smartphone, Camera, ShieldCheck, FileCheck2, 
  CheckCircle2, XCircle, Info, ShieldAlert, X, AlertTriangle 
} from "lucide-react";

interface TrustVerificationBadgesProps {
  user: UserProfile;
  variant?: "compact" | "detailed" | "chips";
  className?: string;
}

export const TrustVerificationBadges: React.FC<TrustVerificationBadgesProps> = ({ 
  user, 
  variant = "compact",
  className = "" 
}) => {
  const [showModal, setShowModal] = useState(false);
  const tiers = getUserVerificationTiers(user);
  const verifiedCount = tiers.filter((t) => t.isVerified).length;

  const renderIcon = (iconName: string, className = "w-3.5 h-3.5") => {
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
    <>
      {/* ---------------------------------------------------- */}
      {/* 1. Compact Variant (For Cards / Headers)             */}
      {/* ---------------------------------------------------- */}
      {variant === "compact" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
            verifiedCount > 0
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/80"
              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200/80"
          } ${className}`}
          title="عرض مستويات التحقق المعتمدة"
        >
          <div className="flex items-center -space-x-1 space-x-reverse">
            {tiers
              .filter((t) => t.isVerified)
              .slice(0, 3)
              .map((t) => (
                <span
                  key={t.tier.id}
                  className="w-4 h-4 rounded-full bg-white border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-2xs"
                >
                  {renderIcon(t.tier.iconName, "w-2.5 h-2.5")}
                </span>
              ))}
          </div>
          <span>
            {verifiedCount > 0 ? `تحقق (${verifiedCount}/4)` : "غير موثق"}
          </span>
          <Info className="w-2.5 h-2.5 opacity-60" />
        </button>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. Chips Variant (For Horizontal Tags List)         */}
      {/* ---------------------------------------------------- */}
      {variant === "chips" && (
        <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
          {tiers.map((t) => (
            <button
              key={t.tier.id}
              type="button"
              onClick={() => setShowModal(true)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                t.isVerified
                  ? t.tier.colorClass
                  : "bg-slate-50 text-slate-400 border-slate-200 opacity-60"
              }`}
            >
              {renderIcon(t.tier.iconName, "w-3 h-3")}
              <span>{t.tier.badgeLabel}</span>
              {t.isVerified ? (
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              ) : (
                <span className="text-[9px] text-slate-400">➖</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. Detailed Variant (For Profile Details Screen)     */}
      {/* ---------------------------------------------------- */}
      {variant === "detailed" && (
        <div className={`bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4 text-right ${className}`} dir="rtl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  الثقة والتحقق متعدد المستويات
                </h4>
                <p className="text-[11px] text-slate-500">
                  شفافية كاملة: توضيح ما تم التحقق منه وما لا يعنيه
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
              {verifiedCount} من 4 مستويات
            </span>
          </div>

          {/* 4 Tiers List */}
          <div className="grid grid-cols-1 gap-2.5">
            {tiers.map((t) => (
              <div
                key={t.tier.id}
                className={`p-3 rounded-2xl border transition space-y-1.5 ${
                  t.isVerified
                    ? "bg-slate-50/70 border-slate-200/90"
                    : "bg-slate-50/30 border-slate-100 opacity-70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1.5 rounded-lg border ${
                        t.isVerified ? t.tier.colorClass : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}
                    >
                      {renderIcon(t.tier.iconName, "w-4 h-4")}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">
                        مستوى {t.tier.levelNumber}: {t.tier.title}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.isVerified
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {t.isVerified ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>تم التحقق</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-slate-400" />
                        <span>لم يُتحقق منه بعد</span>
                      </>
                    )}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed pr-8">
                  {t.isVerified ? t.tier.whatVerified : `هذا المستوى اختياري ولم يقم العضو بإتمامه حتى الآن.`}
                </p>
              </div>
            ))}
          </div>

          {/* Explicit Islamic Diligence Disclaimer */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 space-y-1.5 text-amber-900 text-xs">
            <p className="font-bold flex items-center gap-1.5 text-amber-800 text-[11px]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>مبدأ الأمانة والمسؤولية الشرعية:</span>
            </p>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              «كل علامة توضح بدقة ما تم التحقق منه مادياً؛ فلا تعني هوية موثقة أو هاتف مفحوص أن الشخص جاد أو حسن الخلق بالضرورة». 
              يظل السؤال العائلي والتقصي الشخصي عن الدين والخلق والاستخارة واجباً شرعياً أساسياً على الأسرة والطرفين.
            </p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Modal: Full Trust Transparency Sheet                 */}
      {/* ---------------------------------------------------- */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl text-right"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    مستويات التحقق لحساب: {user.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    عضوية رقم {user.memberNumber} • موثق {verifiedCount} من 4 مستويات
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Tiers */}
            <div className="space-y-3">
              {tiers.map((t) => (
                <div
                  key={t.tier.id}
                  className={`p-3.5 rounded-2xl border space-y-2 ${
                    t.isVerified
                      ? "bg-slate-50 border-emerald-200/80"
                      : "bg-slate-50/50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      {renderIcon(t.tier.iconName, "w-4 h-4 text-emerald-600")}
                      <span>مستوى {t.tier.levelNumber}: {t.tier.title}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.isVerified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {t.isVerified ? "تم التحقق ✓" : "غير مفعل ✗"}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600 leading-relaxed pr-2">
                    <p>
                      <strong>ما تم التحقق منه:</strong> {t.tier.whatVerified}
                    </p>
                    <p className="text-slate-500 text-[10px]">
                      <strong>توضيح الأمان:</strong> {t.tier.importantDisclaimer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* General Charter Alert */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>{TRUST_AND_VERIFICATION_CHARTER.title}</span>
              </p>
              <p className="text-[11px] leading-relaxed text-amber-900/90">
                {TRUST_AND_VERIFICATION_CHARTER.summary}
              </p>
              <ul className="text-[10px] text-amber-800 space-y-1 list-disc list-inside pt-1">
                {TRUST_AND_VERIFICATION_CHARTER.advice.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition"
            >
              فهمت ذلك، إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
};
