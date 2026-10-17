import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, Lock, Eye, Trash2, Mail } from "lucide-react";
import { Button } from "../components/ui/Button";

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">سياسة الخصوصية وحماية البيانات</h1>
              <p className="text-xs text-slate-500 font-medium">منصة مودة ورحمة للزواج الإسلامي الشرعي</p>
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

        {/* Intro */}
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-900 leading-relaxed">
          نولي في منصة <strong>مودة ورحمة</strong> أهمية قصوى لخصوصية مستخدمينا وحرمة بياناتهم، انطلاقاً من مبادئ الشريعة الإسلامية وأعلى معايير الأمان التقني وقوانين حماية البيانات الرقمية ومعايير Google Play.
        </div>

        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            1. ما هي البيانات التي نجمعها ولماذا؟
          </h2>
          <ul className="text-xs text-slate-600 leading-relaxed list-disc list-inside space-y-1.5 pr-2">
            <li><strong>بيانات المصادقة:</strong> البريد الإلكتروني ورقم الهاتف للتحقق الصارم من جدية العضو وهوية الحساب بواسطة OTP.</li>
            <li><strong>البيانات التعريفية للزواج:</strong> العمر، المؤهل العلمي، المهنة، الحالة الاجتماعية، الالتزام الديني، والصفات البدنية، بهدف تيسير التوافق والبحث الشرعي بين الجنسين.</li>
            <li><strong>بيانات التواصل الخاصة:</strong> رقم الهاتف والبريد معزولان تماماً في جدول محمي ولا يظهران لأي عضو آخر تحت أي ظرف.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            2. خصوصية الصور الشخصية
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            نوفر خيارات متعددة لخصوصية الصور تناسب العادات والتقاليد الشرعية:
          </p>
          <ul className="text-xs text-slate-600 leading-relaxed list-disc list-inside space-y-1 pr-2">
            <li><strong>أفاتار تعبيري محتشم:</strong> خيار متاح مجاناً للجميع بدون رفع أي صورة شخصية.</li>
            <li><strong>صورة مقفلة (للمقبولين فقط):</strong> لا تظهر صورتك الحقيقية إلا لمن تبادل معك الاهتمام وقبلت التواصل معه.</li>
            <li><strong>تخزين سحابي مشفر:</strong> الصور يتم ضغطها وتخزينها بروابط مؤقتة لا يمكن الوصول إليها خارج إطار الصلاحيات المحددة.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            3. حقك الكامل في حذف الحساب والبيانات (Google Play Data Safety)
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            يحق لأي مستخدم حذف حسابه وجميع بياناته بشكل فوري ونهائي في أي وقت:
          </p>
          <ul className="text-xs text-slate-600 leading-relaxed list-disc list-inside space-y-1 pr-2">
            <li><strong>من داخل التطبيق:</strong> عبر التوجه إلى "ملفي الشخصي" ➔ ثم الضغط على "حذف الحساب نهائياً".</li>
            <li><strong>من خلال صفحة الويب العامة:</strong> عبر الرابط المباشر المعتمد في متجر بلاي: <span className="font-mono text-emerald-700 bg-slate-100 px-1 rounded">/delete-account</span>.</li>
            <li><strong>ماذا يُحذف؟</strong> يُمسح ملفك الشخصي بالكامل، وصورك من خوادم التخزين، وكافة سجلات المحادثات والإشعارات بشكل غير قابل للاسترجاع.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-600" />
            4. التواصل مع مسؤول حماية البيانات
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            لأي استفسار أو بلاغ يتعلق بالخصوصية وحماية البيانات، يمكنك مراسلة فريق الإشراف عبر:
            <br />
            <strong className="text-emerald-700 font-mono">support@mawada-rahma.com</strong>
          </p>
        </section>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          تاريخ آخر تحديث: أكتوبر 2026 • متوافق مع معايير Google Play Developer Program Policies
        </div>

      </div>
    </div>
  );
};
