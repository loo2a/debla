import React, { useState, useEffect } from "react";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { useApp } from "../../lib/store";
import { useUIStore } from "../../stores/uiStore";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export const StepEmailOtp: React.FC = () => {
  const { requestEmailOtp, verifyEmailOtp } = useApp();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xl space-y-6 text-right max-w-md mx-auto" dir="rtl">
      {!isOtpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-1">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">تسجيل الدخول / إنشاء حساب</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              أدخل بريدك الإلكتروني لتلقي رمز التحقق لمرة واحدة (OTP) لتأكيد هويتك وجديتك.
            </p>
          </div>

          <Input
            label="البريد الإلكتروني"
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
            icon={<Mail className="w-4 h-4" />}
          />

          {errorMessage && (
            <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold bg-rose-50 p-3 rounded-xl border border-rose-100" role="alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading}>
            إرسال رمز التحقق
          </Button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            بالتسجيل، أنت توافق على احترام الخصوصية التامة والضوابط الأخلاقية المتبعة في المنصة.
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-1">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800">تأكيد رمز التحقق</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              تم إرسال رمز التحقق إلى <span className="font-bold text-slate-800 dir-ltr inline-block">{email}</span>. يرجى إدخال الرمز المكون من 6 أرقام.
            </p>
          </div>

          <div className="flex justify-center">
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
              className="w-48 text-center py-3 rounded-2xl border-2 border-emerald-500 focus:outline-none text-3xl font-mono tracking-widest text-slate-900 focus:ring-4 focus:ring-emerald-100 transition shadow-inner"
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold bg-rose-50 p-3 rounded-xl border border-rose-100" role="alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            isLoading={isLoading}
            disabled={otp.length < 6}
          >
            تأكيد ومتابعة
          </Button>

          <div className="text-center space-y-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={resendCountdown > 0 || isLoading}
              onClick={handleResend}
              className="text-xs font-bold text-emerald-600 hover:underline disabled:text-slate-400 disabled:no-underline"
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
                className="text-xs text-slate-400 hover:text-slate-600 transition"
              >
                تغيير البريد الإلكتروني
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
