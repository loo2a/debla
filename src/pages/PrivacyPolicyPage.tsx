import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, Lock, Eye, Trash2, Mail, FileText, Database, KeyRound, Download } from "lucide-react";
import { Button } from "../components/ui/Button";

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">سياسة الخصوصية وحماية البيانات</h1>
              <p className="text-xs text-slate-500 font-medium">منصة وتطبيق مودة ورحمة للزواج الشرعي</p>
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
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-950 leading-relaxed space-y-2">
          <p>
            نولي في منصة <strong>مودة ورحمة</strong> أعلى درجات الحرص والأمانة على خصوصية مستخدمينا، انطلاقاً من أحكام الشريعة الإسلامية، والامتثال التام لـ <strong>قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020</strong>، ولائحة <strong>Google Play Data Safety</strong>.
          </p>
          <p className="font-semibold text-emerald-900">
            تعهّد رسمي: لا نقوم ببيع أو تأجير أو مشاركة أي بيانات شخصية أو حساسة لأي طرف ثالث أو شبكات إعلانية على الإطلاق.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            1. ما هي البيانات التي نجمعها؟
          </h2>
          <ul className="text-xs text-slate-600 leading-relaxed list-disc list-inside space-y-1.5 pr-2">
            <li><strong>بيانات الحساب والمصادقة:</strong> البريد الإلكتروني ورقم الهاتف للتحقق عبر رمز الاستخدام لمرة واحدة (OTP) لمنع الحسابات الوهمية.</li>
            <li><strong>بيانات التوافق للزواج:</strong> العمر، الحالة الاجتماعية، المؤهل الدراسي، المهنة، بلد الإقامة والجنسية، والالتزام الديني والصلوات.</li>
            <li><strong>البيانات الحساسة المشروطة:</strong> الطائفة، والعادات الصحية (كالتدخين)، والسمات الجسدية العامة المعتادة في طلبات الزواج؛ يتم جمعها بموافقة صريحة من المستخدم فقط لغرض التوفيق الزواجي الشرعي.</li>
            <li><strong>البيانات المعزولة:</strong> أرقام الهواتف ووثائق إثبات الهوية تُحفظ في جداول معزولة تماماً ولا تظهر لأي مستخدم آخر أو في نتائج البحث.</li>
          </ul>
        </section>

        {/* Section 2: Law 151/2020 */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            2. الامتثال لقانون حماية البيانات الشخصية المصري (رقم 151 لسنة 2020)
          </h2>
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-700 leading-relaxed space-y-2">
            <p>
              يقر المستخدم بموافقته المستنيرة الصريحة على معالجة البيانات الضرورية للزواج. ويكفل القانون للمستخدم الحقوق الآتية:
            </p>
            <ul className="list-disc list-inside space-y-1 pr-2 text-slate-600">
              <li><strong>حق العلم والاطلاع:</strong> معرفة كافة البيانات المسجلة وتحديثها في أي وقت من شاشة الملف الشخصي.</li>
              <li><strong>حق تصدير البيانات (Data Portability):</strong> إمكانية طلب وتنزيل نسخة إلكترونية من كافة بياناتك الشخصية عبر خيار تصدير البيانات.</li>
              <li><strong>حق سحب الموافقة والاعتراض:</strong> لك الحق في وقف معالجة بياناتك وإخفاء ملفك عن الظهور بضغطة زر (وضع التخفي المؤقت).</li>
            </ul>
          </div>
        </section>

        {/* Section 3: Photos */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            3. خصوصية الصور الشخصية والرقابة الأخلاقية
          </h2>
          <ul className="text-xs text-slate-600 leading-relaxed list-disc list-inside space-y-1.5 pr-2">
            <li><strong>خيارات الخصوصية:</strong> لك كامل الحرية في اختيار ألا تظهر صورتك إلا لمن تتبادل معهم قبول الاهتمام فقط، أو الاعتماد على الأفاتار المحتشم بدون رفع أي صورة شخصية.</li>
            <li><strong>تخزين آمن ومحمي:</strong> تُحفظ الصور في وحدات تخزين سحابية خاصة لا تُنشئ روابط عامة دائمة، وتخضع لسياسات صلاحيات صارمة تمنع وصول غير المصرح لهم.</li>
            <li><strong>الفحص والمراجعة:</strong> تخضع الصور للتدقيق الآلي والبشري لحظر أي محتوى غير وقور أو مخالف للآداب العامة.</li>
          </ul>
        </section>

        {/* Section 4: Deletion & Retention */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600" />
            4. سياسة الحذف والاحتفاظ بالبيانات (Google Play Data Safety)
          </h2>
          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              يحق لكل مستخدم طلب حذف حسابه وكافة بياناته نهائياً في أي وقت عبر طريقتين رسميتين معتمدتين:
            </p>
            <ul className="list-disc list-inside space-y-1 pr-2">
              <li><strong>من داخل التطبيق:</strong> عبر التوجه إلى "ملفي الشخصي" ➔ "حذف الحساب".</li>
              <li><strong>عبر صفحة الويب المعتمدة لمتجر جوجل:</strong> من خلال الرابط العام المباشر: <span className="font-mono text-emerald-700 bg-slate-100 px-1.5 py-0.5 rounded">/delete-account</span>.</li>
              <li><strong>الاحتفاظ والنسخ الاحتياطية:</strong> عند طلب الحذف، يُحذف الملف والصور فوراً، وتُطهّر النسخ الاحتياطية تلقائياً خلال مدة لا تتجاوز 90 يوماً وفق المعايير الدولية.</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Security */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            5. حماية البيانات والتشفير
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            يتم تشفير كافة البيانات أثناء الانتقال عبر بروتوكولات <strong>TLS/HTTPS</strong> المعتمدة عالمياً، مع فرض سياسات أمان مشددة على مستوى صفوف قاعدة البيانات (Row Level Security) لمنع وصول أي مستخدم لبيانات غير مصرح له بها.
          </p>
        </section>

        {/* Section 6: Contact */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-600" />
            6. مسؤول حماية البيانات والشكاوى
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            لأي استفسار أو لطلب تصدير بياناتك أو تقديم شكوى تتعلق بالخصوصية:
            <br />
            البريد الرسمي: <strong className="text-emerald-700 font-mono">support@mawada-rahma.com</strong>
          </p>
        </section>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          تاريخ السريان: أكتوبر 2026 • متوافق مع سياسات متجر Google Play وقانون حماية البيانات الشخصية رقم 151 لسنة 2020
        </div>

      </div>
    </div>
  );
};
