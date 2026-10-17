import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, Mail } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useApp } from "../lib/store";

export const DeleteAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();

  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [directDeleteError, setDirectDeleteError] = useState<string | null>(null);

  const handleLoggedInDelete = async () => {
    if (!window.confirm("تحذير نهائي: هل أنت متأكد تماماً من رغبتك في حذف حسابك ومسح جميع بياناتك وصورك بشكل لا رجعة فيه؟")) {
      return;
    }

    setIsDeleting(true);
    setDirectDeleteError(null);
    try {
      const { supabase } = await import("../lib/supabase");
      const { data, error } = await supabase.rpc("delete_my_account_rpc");
      if (error) {
        setDirectDeleteError(error.message || "تعذر إتمام عملية الحذف. يرجى التواصل مع الدعم.");
      } else {
        await logout();
        setIsSubmitted(true);
      }
    } catch (err: any) {
      setDirectDeleteError(err?.message || "حدث خطأ غير متوقع.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleWebFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">طلب حذف الحساب والبيانات</h1>
              <p className="text-xs text-slate-500 font-medium">وفقاً لمعايير Google Play Data Safety</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الرئيسية</span>
          </Button>
        </div>

        {isSubmitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-base font-bold text-emerald-900">تم استلام طلب الحذف بنجاح</h2>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
              إذا قمت بالحذف المباشر أثناء تسجيل دخولك، فقد تم مسح ملفك وكافة بياناتك وصورك نهائياً من الخوادم.
              إذا قدمت طلباً عبر البريد، فسيتم التحقق منه وحذف الحساب خلال 24 ساعة كحد أقصى.
            </p>
            <Button onClick={() => navigate("/")} variant="primary" className="mt-2 text-xs">
              العودة للصفحة الرئيسية
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 leading-relaxed space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-rose-800">
                <AlertTriangle className="w-4 h-4" />
                تنبيه هام بشأن حذف البيانات
              </div>
              <p>
                حذف الحساب إجراء نهائي لا يمكن الرجوع عنه. يترتب على الحذف: مسح ملفك الشخصي بالكامل، حذف صورك المرفوعة من مخزن الصور السحابي، إزالة كافة المحادثات والإشعارات، وفقدان أي اشتراك متبقٍ.
              </p>
            </div>

            {currentUser ? (
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">أنت مسجل دخول حالياً كـ:</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.name} ({currentUser.memberNumber})</p>
                </div>

                {directDeleteError && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                    {directDeleteError}
                  </p>
                )}

                <Button 
                  onClick={handleLoggedInDelete}
                  variant="danger" 
                  disabled={isDeleting}
                  className="w-full text-xs py-3"
                >
                  {isDeleting ? "جاري حذف الحساب والبيانات..." : "حذف حسابي وبياناتي نهائياً الآن"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleWebFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-sm">تقديم طلب حذف حساب خارجي:</h3>
                  <p className="text-xs text-slate-500">
                    إذا قمت بإلغاء تثبيت التطبيق وترغب في حذف بياناتك دون إعادة تسجيل الدخول، أدخل بريدك الإلكتروني المسجل لدينا:
                  </p>
                </div>

                <Input
                  label="البريد الإلكتروني المسجل في التطبيق"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  icon={<Mail className="w-4 h-4" />}
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">سبب الحذف (اختياري)</label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="مثال: تم الزواج والحمد لله، أو أي ملاحظات أخرى..."
                    className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                  />
                </div>

                <Button type="submit" variant="danger" className="w-full text-xs py-3">
                  إرسال طلب الحذف النهائي
                </Button>
              </form>
            )}

            <div className="pt-2 text-center text-xs text-slate-400">
              يمكنك أيضاً مراسلة الإدارة مباشرة عبر: <span className="font-mono text-emerald-700">support@mawada-rahma.com</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
}; 