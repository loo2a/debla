import React, { useState } from "react";
import { BookOpen, Check, Shield } from "lucide-react";
import { useApp } from "../../lib/store";
import { Button } from "../ui/Button";

interface StepCharterProps {
  onSuccess: () => void;
}

export const StepCharter: React.FC<StepCharterProps> = ({ onSuccess }) => {
  const { submitCharterAgreement } = useApp();
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    if (!agreed) return;
    setIsLoading(true);
    const res = await submitCharterAgreement();
    setIsLoading(false);
    if (res.ok) {
      onSuccess();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xl space-y-6 text-right max-w-lg mx-auto" dir="rtl">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-1">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">ميثاق شرف مودة ورحمة</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          يرجى قراءة بنود الميثاق الأخلاقي والموافقة عليها للمتابعة والبدء بجدية.
        </p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-xs leading-relaxed text-slate-700 max-h-72 overflow-y-auto">
        <div className="flex gap-2">
          <span className="text-emerald-600 font-bold">١.</span>
          <p><b>الجدية التامة وبناء الأسرة:</b> أقر بأن تسجيلي في هذا التطبيق هو بهدف الزواج الرسمي وبناء أسرة مستقرة، وليس للتسلية أو التعارف العابث.</p>
        </div>
        <div className="flex gap-2">
          <span className="text-emerald-600 font-bold">٢.</span>
          <p><b>الصدق والأمانة:</b> أتعهد بصحة جميع البيانات المدخلة في ملفي الشخصي من السن والمؤهل والحالة الاجتماعية والصحية دون تضليل.</p>
        </div>
        <div className="flex gap-2">
          <span className="text-emerald-600 font-bold">٣.</span>
          <p><b>صيانة الخصوصية والاحترام:</b> أتعهد بعدم نسخ أو نشر أو مشاركة أي بيانات أو صور لأي عضو خارج نطاق التطبيق وتحت طائلة المساءلة القانونية.</p>
        </div>
        <div className="flex gap-2">
          <span className="text-emerald-600 font-bold">٤.</span>
          <p><b>التواصل الجاد وإشراك الأهل:</b> أوافق على الالتزام بآداب التعارف الراقي وإشراك الأهل والعائلة في الوقت المناسب دون مماطلة.</p>
        </div>
      </div>

      <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-emerald-50/40 hover:bg-emerald-50 transition cursor-pointer select-none">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
        />
        <span className="text-xs font-bold text-slate-800 leading-tight">
          أقر وأتعهد بالالتزام التام ببنود ميثاق الشرف الأخلاقي ومعايير الجدية الأسرية أعلاه.
        </span>
      </label>

      <Button
        variant="primary"
        className="w-full py-3"
        disabled={!agreed}
        isLoading={isLoading}
        onClick={handleAccept}
      >
        الموافقة ومتابعة التسجيل
      </Button>

      <div className="text-center text-[11px] text-slate-500 space-x-2 space-x-reverse">
        <span>بالموافقة، أنت تقر أيضاً باطلاعك على</span>
        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold hover:text-emerald-800">
          شروط الاستخدام
        </a>
        <span>و</span>
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold hover:text-emerald-800">
          سياسة الخصوصية
        </a>
      </div>
    </div>
  );
};
