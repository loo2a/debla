import React, { useState } from "react";
import { Mail, Phone, Send, ShieldCheck, MessageSquare } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useUIStore } from "../stores/uiStore";
import { useApp } from "../lib/store";

export const ContactPage: React.FC = () => {
  const { addToast } = useUIStore();
  const { sendContactMessage } = useApp();

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSubject = subject.trim();
    const cleanBody = body.trim();

    if (!cleanSubject || !cleanBody) {
      addToast("يرجى ملء عنوان ونص الرسالة", "error");
      return;
    }
    if (cleanSubject.length > 50) {
      addToast("عنوان الرسالة يجب ألا يتجاوز 50 حرفاً أو رمزاً", "error");
      return;
    }
    if (cleanBody.length > 240) {
      addToast("نص الرسالة يجب ألا يتجاوز 240 حرفاً أو رمزاً", "error");
      return;
    }

    setIsSending(true);
    try {
      const res = await sendContactMessage(cleanSubject, cleanBody);
      if (res.ok) {
        setIsSubmitted(true);
        setSubject("");
        setBody("");
        addToast("تم إرسال رسالتك لفريق الدعم الفني وخدمة العملاء بنجاح", "success");
      } else {
        addToast(res.error || "تعذر إرسال الرسالة حالياً، يرجى المحاولة لاحقاً", "error");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pt-6 text-right pb-24" dir="rtl">
      {/* Header without religious tone */}
      <div className="text-center space-y-1">
        <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">مركز المساعدة وخدمة العملاء</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          فريق الدعم الفني وخدمة العملاء جاهز للإجابة على استفساراتكم وتلقي آرائكم وملاحظاتكم ومساعدتكم على مدار الساعة.
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit}>
          <Card className="space-y-4">
            {/* Subject Field: max 50 chars */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">عنوان الرسالة أو الموضوع</label>
                <span className={`text-[10px] font-mono ${subject.length >= 50 ? "text-rose-600 font-bold" : "text-slate-400"}`}>
                  {subject.length}/50
                </span>
              </div>
              <Input
                required
                maxLength={50}
                value={subject}
                onChange={(e) => setSubject(e.target.value.slice(0, 50))}
                placeholder="استفسار عن الحساب / مساعدة تقنية / اقتراح"
              />
            </div>

            {/* Message Body Field: max 240 chars */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">نص الرسالة بالتفصيل</label>
                <span className={`text-[10px] font-mono ${body.length >= 240 ? "text-rose-600 font-bold" : "text-slate-400"}`}>
                  {body.length}/240
                </span>
              </div>
              <textarea
                required
                maxLength={240}
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, 240))}
                rows={4}
                placeholder="اكتب استفسارك أو مشكلتك بوضوح هنا بحد أقصى 240 حرفاً..."
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white leading-relaxed resize-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSending}
              rightIcon={<Send className="w-4 h-4" />}
            >
              إرسال الرسالة للدعم الفني
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
              شكراً لتواصلك معنا. تم تسجيل تذكرتك بنجاح وسيقوم فريق خدمة العملاء بمراجعتها والتواصل معك قريباً.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSubmitted(false)}
            className="text-emerald-700 hover:text-emerald-800 underline"
          >
            إرسال استفسار آخر
          </Button>
        </Card>
      )}

      <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200/55 space-y-3">
        <h4 className="text-xs font-bold text-slate-800">قنوات التواصل والمساعدة المباشرة:</h4>
        <div className="text-[11px] text-slate-600 space-y-1">
          <p className="flex items-center gap-1.5 font-mono"><Mail className="w-3.5 h-3.5 text-slate-400" /> support@mawada-rahma.com</p>
          <p className="flex items-center gap-1.5 font-mono"><Phone className="w-3.5 h-3.5 text-slate-400" /> خدمة العملاء والدعم الفني</p>
        </div>
        <a
          href="https://api.whatsapp.com/send?phone=201012345678&text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%A7%D9%84%D8%AA%D8%B7%D8%A8%D9%8A%D9%82"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          <Phone className="w-4 h-4" />
          <span>محادثة الدعم الفني المباشر (WhatsApp)</span>
        </a>
      </div>
    </div>
  );
};
