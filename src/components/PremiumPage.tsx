import React, { useState } from "react";
import { useApp } from "../lib/store";
import { Sparkles, CheckCircle2, CreditCard, Smartphone, ShieldAlert, Tag, Check, HelpCircle, Mail } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { useUIStore } from "../stores/uiStore";

export const PremiumPage: React.FC = () => {
  const { currentUser, submitPremiumRequest, premiumRequests, coupons } = useApp();
  const { addToast } = useUIStore();

  const isNative = Capacitor.isNativePlatform();

  const [selectedPlan, setSelectedPlan] = useState<"week" | "month" | "3months" | "6months" | "year">("month");
  const [paymentMethod, setPaymentMethod] = useState<"google_play" | "credit_card" | "mobile_wallet">(
    isNative ? "google_play" : "credit_card"
  );
  const [walletNumber, setWalletNumber] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  // Active requests
  const myPendingRequest = premiumRequests.find(r => r.userId === currentUser.id && r.status === "pending");

  const basePlans: Record<string, { label: string; rawPrice: number; currency: string; originalPrice: string; badge?: string; discount?: string; highlight?: boolean }> = {
    week: { label: "الاشتراك الأسبوعي", rawPrice: 49, currency: "ج.م", originalPrice: "69 ج.م", badge: "تجربة" },
    month: { label: "الاشتراك الشهري", rawPrice: 149, currency: "ج.م", originalPrice: "199 ج.م", badge: "الأكثر طلباً" },
    "3months": { label: "اشتراك 3 أشهر", rawPrice: 299, currency: "ج.م", originalPrice: "450 ج.م", discount: "وفر 33%" },
    "6months": { label: "اشتراك 6 أشهر", rawPrice: 499, currency: "ج.م", originalPrice: "890 ج.م", discount: "وفر 45%" },
    year: { label: "الاشتراك السنوي", rawPrice: 799, currency: "ج.م", originalPrice: "1780 ج.م", discount: "وفر 55%", highlight: true },
  };

  const getEffectivePrice = (planKey: string) => {
    const plan = basePlans[planKey];
    if (!plan) return "149 ج.م";
    if (!appliedCoupon) return `${plan.rawPrice} ${plan.currency}`;
    const discounted = Math.round(plan.rawPrice * (1 - appliedCoupon.discountPercent / 100));
    return `${discounted} ${plan.currency}`;
  };

  const premiumFeatures = [
    "الحصول على 20 بطاقة توافق سريع يومياً (Swipe Cards) بدلاً من 5 للمستخدم العادي.",
    "تعزيز وإظهار ملفك الشخصي في مقدمة نتائج البحث السريع والمتقدم.",
    "إرسال رسائل ومحادثات ومتابعات غير محدودة مع كافة الأعضاء.",
    "تحديث ومراجعة بيانات الملف الشخصي في أي وقت مع شارة التوثيق.",
    "التصفح الخفي تماماً لملفات الشركاء دون ترك أثر أو إشعارهم بزيارتك.",
    "إمكانية رفع صورة شخصية حقيقية آمنة لا يراها إلا من تقبل اهتمامه.",
    "شارة التميز الذهبية التي توثق الجدية وترفع معدلات التوافق.",
    "أولوية في الدعم الفني والمساعدة في التوفيق الأسري الشرعي.",
  ];

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCodeInput.trim().toUpperCase();
    if (!clean) return;

    const found = coupons.find(c => c.code.toUpperCase() === clean && c.isActive);
    if (found) {
      if (found.validUntil && new Date(found.validUntil) < new Date()) {
        addToast("هذا الكوبون انتهت صلاحيته.", "error");
        return;
      }
      setAppliedCoupon({ code: found.code, discountPercent: found.discountPercent });
      addToast(`تم تطبيق كود الخصم بنجاح! تم خصم ${found.discountPercent}% من قيمة الاشتراك.`, "success");
    } else {
      addToast("كود الخصم غير صحيح أو لم يعد متاحاً.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "mobile_wallet" && !walletNumber) {
      addToast("يرجى إدخال رقم المحفظة المحول منها لتأكيد العملية والتحقق منها.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitPremiumRequest(selectedPlan, paymentMethod, walletNumber);
      if (res.ok) {
        setHasSubmitted(true);
        addToast("تم تسجيل طلب تفعيل باقة التميز بنجاح! سيتم اعتماده فوراً.", "success");
      } else {
        addToast(res.error || "فشل إرسال طلب التفعيل", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 pt-4 font-sans text-right bg-slate-50 min-h-screen" dir="rtl">
      <div className="max-w-xl mx-auto px-4 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-50 text-amber-500 rounded-full">
            <Sparkles className="w-8 h-8 fill-amber-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">باقة التميز - مودة ورحمة</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            استفد من المميزات الكاملة لخدمة مودة ورحمة لبناء بيتك الجديد بكل سهولة وجدية ووفق الضوابط الشرعية.
          </p>
        </div>

        {/* Success Banner if Active */}
        {currentUser.isPremium && (
          <div className="bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 p-5 rounded-2xl border border-amber-400 shadow-md flex gap-3 items-center">
            <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm leading-tight">اشتراكك في باقة التميز نشط بالكامل!</h4>
              <p className="text-xs text-slate-900 font-medium mt-0.5">
                يمكنك الآن التمتع بجميع الميزات والتواصل الراقي والتصفح الخفي.
              </p>
            </div>
          </div>
        )}

        {/* Pending Request Warning */}
        {myPendingRequest && !hasSubmitted && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-blue-900 text-sm">طلب الاشتراك قيد المراجعة</h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                طلبك للاشتراك مسجل بنجاح وجاري التحقق منه وإتاحته خلال دقائق معدودة.
              </p>
            </div>
          </div>
        )}

        {/* Benefits list */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-r-4 border-emerald-600 pr-2">مزايا باقة التميز</h3>
          
          <ul className="space-y-3">
            {premiumFeatures.map((benefit, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Subscription Choice */}
        {!currentUser.isPremium && !myPendingRequest && !hasSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Packages list */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-r-4 border-emerald-600 pr-2">اختر الباقة المناسبة</h3>
              
              <div className="space-y-3">
                {Object.entries(basePlans).map(([planId, plan]) => {
                  const isSelected = selectedPlan === planId;
                  const effectivePrice = getEffectivePrice(planId);

                  return (
                    <button
                      type="button"
                      key={planId}
                      onClick={() => setSelectedPlan(planId as any)}
                      className={`w-full p-4 rounded-2xl border-2 transition duration-150 flex justify-between items-center ${
                        isSelected 
                          ? "border-amber-500 bg-amber-50/20 shadow-md" 
                          : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-amber-500 bg-amber-500" : "border-slate-300"
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className="text-right">
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{plan.label}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold line-through">{plan.originalPrice}</span>
                        </div>
                      </div>

                      <div className="text-left space-y-1">
                        <span className="font-extrabold text-amber-700 text-base font-mono">{effectivePrice}</span>
                        {plan.badge && (
                          <span className="block text-[9px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">
                            {plan.badge}
                          </span>
                        )}
                        {plan.discount && !appliedCoupon && (
                          <span className="block text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">
                            {plan.discount}
                          </span>
                        )}
                        {appliedCoupon && (
                          <span className="block text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                            خصم {appliedCoupon.discountPercent}% مفعّل
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-3">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>هل لديك كود خصم أو كوبون ترويجي؟</span>
              </label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder="أدخل كود الخصم (مثال: MAWADA2026)"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
                >
                  تطبيق الكود
                </button>
              </div>
              {appliedCoupon && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>تم تطبيق الكوبون {appliedCoupon.code} بخصم {appliedCoupon.discountPercent}%.</span>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-r-4 border-emerald-600 pr-2">وسيلة الدفع المعتمدة</h3>
              
              <div className={`grid ${isNative ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
                {/* On Android App: Google Play Billing is primary and official */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("google_play")}
                  className={`p-4 rounded-2xl border transition duration-150 flex flex-col items-center gap-2 ${
                    paymentMethod === "google_play" 
                      ? "border-emerald-600 bg-emerald-50/20 text-emerald-900 font-bold shadow-sm" 
                      : "border-slate-100 text-slate-500 hover:border-slate-200"
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-emerald-600" />
                  <span className="text-xs font-bold">متجر Google Play</span>
                  <span className="text-[10px] text-slate-400">دفع آمن ومعتمد بضغطة زر واحدة</span>
                </button>

                {!isNative && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("credit_card")}
                    className={`p-4 rounded-2xl border transition duration-150 flex flex-col items-center gap-2 ${
                      paymentMethod === "credit_card" 
                        ? "border-emerald-600 bg-emerald-50/20 text-emerald-900 font-bold shadow-sm" 
                        : "border-slate-100 text-slate-500 hover:border-slate-200"
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-emerald-600" />
                    <span className="text-xs font-bold">البطاقة البنكية / الائتمانية</span>
                    <span className="text-[10px] text-slate-400">بوابة دفع مشفرة ومتوافقة عالمياً</span>
                  </button>
                )}
              </div>

              {paymentMethod === "google_play" && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-emerald-900 leading-relaxed space-y-1">
                  <p className="font-bold">✓ الدفع الرسمي المعتمد لتطبيق الأندرويد:</p>
                  <p className="text-[11px] text-emerald-800">
                    تتم المعالجة مباشرة عبر نظام Google Play Billing المحمي. يمكنك إدارة وتجديد أو إلغاء اشتراكك في أي وقت عبر حسابك في متجر Google Play بكل شفافية.
                  </p>
                </div>
              )}

              {paymentMethod === "credit_card" && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs text-slate-500">
                  تتم المعالجة عبر بوابة دفع بنكية آمنة ومشفرة بالكامل وفق معايير PCI-DSS لحماية البيانات المالية.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 py-3.5 rounded-2xl font-extrabold transition text-center shadow-lg shadow-amber-500/15 text-sm"
            >
              {isSubmitting ? "جاري المعالجة..." : "تأكيد الاشتراك وتفعيل باقة التميز"}
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              بالضغط على تأكيد الاشتراك، أنت توافق على شروط الخدمة وسياسة الخصوصية لمنصة مودة ورحمة.
            </p>
          </form>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-center space-y-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-fit mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-800 text-base">تم تسجيل طلب الاشتراك بنجاح!</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                شكراً لثقتكم وسعيكم في إعفاف النفس وبناء البيت المسلم. يتم الآن تفعيل ميزات التميز على حسابكم، ويمكنكم التمتع بكافة الخصائص فوراً.
              </p>
            </div>
          </div>
        )}

        {/* Assistance card */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-emerald-400" />
              خدمة العملاء والدعم الفني
            </h4>
            <p className="text-slate-400 text-xs">فريق الدعم الفني متواجد لمساعدتكم والإجابة عن أي استفسار بشأن الاشتراكات والخدمات.</p>
          </div>
          <a 
            href="mailto:support@mawada-rahma.com"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition inline-flex items-center gap-1.5 self-stretch sm:self-auto text-center justify-center font-mono"
          >
            support@mawada-rahma.com
          </a>
        </div>

      </div>
    </div>
  );
};
