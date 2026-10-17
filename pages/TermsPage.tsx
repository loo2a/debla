import React from "react";
import { useNavigate } from "react-router-dom";
import { Scale, ArrowRight, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/Button";

export const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
              <Scale className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">شروط الاستخدام وميثاق الشرف</h1>
              <p className="text-xs text-slate-500 font-medium">الضوابط الشرعية والقانونية لمنصة مودة ورحمة</p>
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

        {/* Core Oath */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed space-y-2">
          <p className="font-bold flex items-center gap-1.5 text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            ميثاق العهد والأمانة الشرعية
          </p>
          <p>
            تطبيق مودة ورحمة مخصص حصرياً للتعارف الجاد بغرض الزواج الشرعي العلني، ولا نسمح بأي تعارف عابث، أو زواج سري، أو مخالفة للآداب والشرع الإسلامي الحنيف.
          </p>
        </div>

        {/* Terms list */}
        <section className="space-y-4">
          <div className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. شروط الأهلية والجدية
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed pr-2">
              • يجب ألا يقل عمر المشترك عن 18 عاماً هجرياً أو ميلادياً.
              <br />
              • يلتزم المشترك بصدق جميع البيانات المدخلة (السن، الحالة الاجتماعية، المؤهل، والمواصفات).
            </p>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              2. سياسة مكافحة الإساءة والتحرش (Google Play UGC Policy)
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed pr-2">
              • يمنع منعاً باتاً أي كلام بذيء، أو ألفاظ خادشة للحياء، أو طلبات غير لائقة في المراسلات.
              <br />
              • يمنع تبادل أرقام الهواتف أو الحسابات الخارجية في النبذة العامة لحماية الخصوصية.
              <br />
              • المنصة توفر زر <strong>"إبلاغ"</strong> وزر <strong>"حظر"</strong> فوري في كل صفحة شخصية ومحادثة، وتتم مراجعة البلاغات وحظر الحسابات المخالفة نهائياً من قبل الإدارة.
            </p>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              3. خصوصية الأسر والعائلات
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed pr-2">
              • نؤكد على ضرورة إشراك الأهل وولي الأمر في الرؤية الشرعية والمراحل الأولى للتعارف.
              <br />
              • يمنع نشر أو تداول أي معلومات أو صور تخص أي عضو خارج نطاق المنصة، ويعتبر ذلك خيانة للأمانة وتعرض صاحبها للمساءلة القانونية.
            </p>
          </div>
        </section>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          منصة مودة ورحمة • نسأل الله التوفيق والتيسير لجميع الشباب والفتيات في بناء بيوت صالحة.
        </div>

      </div>
    </div>
  );
};