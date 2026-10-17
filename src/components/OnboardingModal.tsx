import React, { useState, useEffect } from "react";
import { ShieldCheck, EyeOff, Sparkles, ArrowLeft, ArrowRight, HeartHandshake, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/Button";

interface OnboardingModalProps {
  onComplete?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem("mawada_onboarding_completed");
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleFinish = () => {
    localStorage.setItem("mawada_onboarding_completed", "true");
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  if (!isOpen) return null;

  const slides = [
    {
      icon: <ShieldCheck className="w-12 h-12 text-emerald-600" />,
      badge: "الجدية والأمانة الشرعية",
      title: "بيئة محافظة بميثاق شرف ملزم",
      desc: "تطبيق مودة ورحمة مخصص حصرياً للتعارف الجاد بغرض الزواج الشرعي العلني، ولا نسمح بأي تعارف عابث أو مخالف للضوابط الشرعية.",
      bg: "bg-emerald-50",
    },
    {
      icon: <EyeOff className="w-12 h-12 text-amber-600" />,
      badge: "أعلى معايير الخصوصية",
      title: "تحكم كامل في خصوصية صورك",
      desc: "يمكنك استخدام الأفاتار المحتشم، أو قفل صورتك الشخصية لتظهر فقط لمن تبادلت معهم القبول والاهتمام الشرعي بعد إذنك.",
      bg: "bg-amber-50",
    },
    {
      icon: <Sparkles className="w-12 h-12 text-emerald-600" />,
      badge: "التكافؤ والتوافق",
      title: "بحث دقيق وتوافق مبارك",
      desc: "فلاتر شاملة للالتزام الديني، الصلاة، التعليم، السكن، ورأي الطرفين في تكاليف الزواج لتيسير بناء بيت صالح على مودة ورحمة.",
      bg: "bg-teal-50",
    },
  ];

  const current = slides[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Step indicator */}
        <div className="flex justify-center gap-1.5">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep ? "w-8 bg-emerald-600" : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Icon & Badge */}
        <div className="space-y-3">
          <div className={`w-20 h-20 mx-auto rounded-3xl ${current.bg} flex items-center justify-center shadow-inner`}>
            {current.icon}
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100/60 text-emerald-800">
            {current.badge}
          </span>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-extrabold text-slate-800">
            {current.title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            {current.desc}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-2 pt-2">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 text-xs"
            >
              <ArrowRight className="w-4 h-4 ml-1" />
              السابق
            </Button>
          )}

          {currentStep < slides.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="flex-1 text-xs py-3"
            >
              <span>التالي</span>
              <ArrowLeft className="w-4 h-4 mr-1" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleFinish}
              className="flex-1 text-xs py-3 bg-emerald-700 hover:bg-emerald-800"
            >
              <CheckCircle2 className="w-4 h-4 ml-1.5" />
              <span>ابدأ رحلتك المباركة</span>
            </Button>
          )}
        </div>

        {/* Skip button */}
        {currentStep < slides.length - 1 && (
          <button
            onClick={handleFinish}
            className="text-[11px] text-slate-400 hover:text-slate-600 transition"
          >
            تخطي المقدمة
          </button>
        )}

      </div>
    </div>
  );
};
