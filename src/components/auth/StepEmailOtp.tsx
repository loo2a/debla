import React, { useState, useEffect } from "react";
import { Mail, Lock, AlertCircle, ArrowLeft, ShieldCheck, Heart, Sparkles, CheckCircle2 } from "lucide-react";
import { useApp } from "../../lib/store";
import { useUIStore } from "../../stores/uiStore";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export const StepEmailOtp: React.FC = () => {
  const { requestEmailOtp, verifyEmailOtp, signInWithGoogle } = useApp();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMessage("");
    const res = await requestEmailOtp(email);
    setIsLoading(false);

    if (!res.ok) {
      setErrorMessage(res.error || "تعذر إرسال رمز التحقق.");
      return;
    }

    setIsOtpSent(true);
    setResendCountdown(60);
    addToast("تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح!", "success");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setIsLoading(true);
    setErrorMessage("");
    const res = await verifyEmailOtp(email, otp);
    setIsLoading(false);

    if (!res.ok) {
      setErrorMessage(res.error || "رمز التحقق غير صحيح أو منتهي الصلاحية.");
      return;
    }

    addToast("تم تأكيد هويتك بنجاح!", "success");
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setErrorMessage("");
    const res = await signInWithGoogle();
    if (!res.ok) {
      setIsLoadingGoogle(false);
      setErrorMessage(res.error || "تعذر تسجيل الدخول بواسطة Google. يرجى التأكد من تفعيل الخدمة.");
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setIsLoading(true);
    setErrorMessage("");
    const res = await requestEmailOtp(email);
    setIsLoading(false);
    if (!res.ok) {
      setErrorMessage(res.error || "تعذر إعادة إرسال الرمز.");
      return;
    }
    setResendCountdown(60);
    addToast("تمت إعادة إرسال رمز التحقق.", "info");
  };

  return (
    <div className="w-full max-w-md mx-auto" dir="rtl">
      {/* Outer Card with Luxury Islamic Theme */}
      <div className="bg-white rounded-3xl border border-emerald-100/80 shadow-2xl shadow-emerald-950/10 overflow-hidden transition-all duration-300">
        {/* Top Header Banner with Brand Icon */}
        <div className="relative bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] p-6 text-white text-center select-none overflow-hidden">
          {/* Subtle Islamic Pattern Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-300/10 rounded-full blur-2xl pointer-events-none" />

          {/* Centered App Icon with Halo */}
          <div className="relative inline-flex flex-col items-center mb-3">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-300 to-emerald-300 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-20 h-20 rounded-2xl bg-emerald-950 p-1 border-2 border-amber-300/60 shadow-xl overflow-hidden flex items-center justify-center">
                <img
                  src="/icon-192.png"
                  alt="شعار مودة ورحمة"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/icon.svg";
                  }}
                />
              </div>
            </div>

            <span className="mt-2 text-[10px] font-bold tracking-widest text-amber-200 uppercase bg-emerald-950/60 px-3 py-0.5 rounded-full border border-amber-300/30">
              زواج جاد ومسؤول
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-sm font-sans mb-1">
            مَوَدَّةٌ وَرَحْمَة
          </h1>
          <p className="text-xs text-emerald-100/90 font-medium">
            المنصة الموثوقة لتيسير الزواج وبناء الأسرة
          </p>

          {/* Inspiring Value Slogan */}
          <div className="mt-4 pt-3 border-t border-emerald-500/30">
            <p className="text-[11px] text-amber-100/90 font-medium leading-relaxed">
              «بيئة آمنة تجمع أصحاب النوايا الصادقة لتيسير الزواج وبناء بيوت قائمة على المودة والرحمة»
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 text-center py-2 px-3 bg-emerald-50/60 rounded-2xl border border-emerald-100/60">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span className="text-[10px] font-bold text-emerald-900">خصوصية تامة</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-emerald-200/50">
              <Heart className="w-4 h-4 text-emerald-700" />
              <span className="text-[10px] font-bold text-emerald-900">ضوابط أخلاقية وأسرية</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span className="text-[10px] font-bold text-emerald-900">جدية وتوثيق</span>
            </div>
          </div>

          {!isOtpSent ? (
            <div className="space-y-5">
              {/* Google Fast Sign-In */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoadingGoogle || isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {/* Official Google 4-Color SVG Icon */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>
                    {isLoadingGoogle ? "جاري الاتصال بـ Google..." : "المتابعة السريعة بحساب Google"}
                  </span>
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  دخول آمن وفوري بنقرة واحدة بدون الحاجة لانتظار رسائل البريد
                </p>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                  أو عبر رمز التحقق (OTP)
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Input
                  label="البريد الإلكتروني"
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  icon={<Mail className="w-4 h-4 text-emerald-600" />}
                />

                {errorMessage && (
                  <div
                    className="flex items-start gap-2 text-rose-700 text-xs font-semibold bg-rose-50 p-3 rounded-2xl border border-rose-200 leading-relaxed"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-700/20 rounded-2xl"
                  isLoading={isLoading}
                >
                  إرسال رمز التحقق
                </Button>

                {/* Reviewer / Demo Note */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    💡 <span className="font-bold text-slate-700">للمعاينة السريعة:</span> يمكنك استخدام البريد التجريبي <code className="text-emerald-700 font-mono text-[10px] bg-emerald-50 px-1 py-0.5 rounded">reviewer@mawada-rahma.com</code> مع الرمز <code className="text-emerald-700 font-mono text-[10px] bg-emerald-50 px-1 py-0.5 rounded">123456</code>.
                  </p>
                </div>
              </form>
            </div>
          ) : (
            /* OTP Verification Screen */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-1 border border-emerald-100 shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-800">تأكيد رمز التحقق</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  تم إرسال رمز التحقق المكون من 6 أرقام إلى:
                </p>
                <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-mono font-bold text-slate-700 dir-ltr">
                  {email}
                </div>
              </div>

              <div className="flex justify-center py-2">
                <input
                  type="text"
                  required
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="••••••"
                  className="w-52 text-center py-3.5 rounded-2xl border-2 border-emerald-500 focus:outline-none text-3xl font-mono tracking-widest text-slate-900 focus:ring-4 focus:ring-emerald-100 transition shadow-inner bg-slate-50/50"
                />
              </div>

              {errorMessage && (
                <div
                  className="flex items-start gap-2 text-rose-700 text-xs font-semibold bg-rose-50 p-3 rounded-2xl border border-rose-200 leading-relaxed"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-700/20 rounded-2xl"
                isLoading={isLoading}
                disabled={otp.length < 6}
              >
                تأكيد ومتابعة
              </Button>

              <div className="text-center space-y-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={resendCountdown > 0 || isLoading}
                  onClick={handleResend}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
                >
                  {resendCountdown > 0
                    ? `إعادة إرسال الرمز بعد ${resendCountdown} ثانية`
                    : "إعادة إرسال رمز التحقق"}
                </button>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpSent(false);
                      setOtp("");
                      setErrorMessage("");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition cursor-pointer font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>تغيير البريد الإلكتروني</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Ethical Compliance Footer */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              بالتسجيل في مودة ورحمة، تتعهد بالالتزام بميثاق الشرف الأخلاقي ومعايير الجدية التامة وصيانة الخصوصية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
