import React, { useState } from "react";
import { Mail, Phone, Send, ShieldCheck } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useUIStore } from "../stores/uiStore";

export const ContactPage: React.FC = () => {
  const { addToast } = useUIStore();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      addToast("يرجى ملء جميع حقول رسالة التواصل", "error");
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSubmitted(true);
      setSubject("");
      setBody("");
      addToast("تم إرسال رسالتك لفريق الإدارة والدعم الفني بنجاح", "success");
    }, 600);
  };

  return (
    <div className="p-4 space-y-6 pt-6 text-right pb-24" dir="rtl">
      <div className="text-center space-y-1">
        <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full">
          <Mail className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">اتصل بنا وادعم مودة ورحمة</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          فريق الدعم الفني والإرشاد الأسري الموثق جاهز للرد على استفساراتكم أو تلقي الاقتراحات والمباركات طوال اليوم.
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit}>
          <Card className="space-y-4">
            <Input
              label="عنوان الرسالة أو الموضوع"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="استفسار عن تفعيل باقة التميز / مشكلة تقنية"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">نص الرسالة بالتفصيل</label>
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="يرجى كتابة رسالتك أو استفسارك بوضوح، وسنرد على بريدك الإلكتروني في أقرب فرصة..."
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white leading-relaxed"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSending}
              rightIcon={<Send className="w-4 h-4" />}
            >
              إرسال الرسالة للإدارة
            </Button>
          </Card>
        </form>
      ) : (
        <Card className="text-center space-y-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full w-fit mx-auto">
            <ShieldCheck className="w-10 h-10" />
          </div>
          
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">تم إرسال رسالتك بنجاح!</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              نشكر تواصلك معنا. تم قيد الرسالة في تذاكر المتابعة وسيرد عليك ممثلو خدمة مودة ورحمة قريباً.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSubmitted(false)}
            className="text-emerald-700 hover:text-emerald-800 underline"
          >
            إرسال رسالة أخرى
          </Button>
        </Card>
      )}

      <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200/55 space-y-2">
        <h4 className="text-xs font-bold text-slate-800">قنوات التواصل المباشر السريعة:</h4>
        <div className="text-[11px] text-slate-600 space-y-1">
          <p className="flex items-center gap-1.5 font-mono"><Mail className="w-3.5 h-3.5 text-slate-400" /> support@mawada-rahma.com</p>
          <p className="flex items-center gap-1.5 font-mono"><Phone className="w-3.5 h-3.5 text-slate-400" /> +20 1012345678</p>
        </div>
      </div>
    </div>
  );
};
