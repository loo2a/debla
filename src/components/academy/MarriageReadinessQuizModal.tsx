import React, { useState } from "react";
import { 
  Award, CheckCircle2, XCircle, ChevronLeft, ArrowRight, 
  HelpCircle, Sparkles, RefreshCw, X, ShieldCheck 
} from "lucide-react";
import { 
  getMarriageQuizQuestions, 
  PASSING_SCORE_PERCENTAGE 
} from "../../lib/marriageQuizData";
import { useApp } from "../../lib/store";
import { useUIStore } from "../../stores/uiStore";

interface MarriageReadinessQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarriageReadinessQuizModal: React.FC<MarriageReadinessQuizModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, submitMarriageQuizResult } = useApp();
  const { addToast } = useUIStore();

  const questions = getMarriageQuizQuestions(currentUser?.religion);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [scorePercentage, setScorePercentage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentQuestion = questions[currentIndex];
  const selectedOptionId = selectedAnswers[currentQuestion.id];
  const selectedOption = currentQuestion.options.find((o) => o.id === selectedOptionId);
  const totalQuestions = questions.length;

  const handleSelectOption = (optionId: string) => {
    if (showExplanation) return; // Prevent changing after showing answer
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
    setShowExplanation(true);
  };

  const handleNext = async () => {
    setShowExplanation(false);
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate final score
      let correctCount = 0;
      questions.forEach((q) => {
        const chosenId = selectedAnswers[q.id];
        const correctOpt = q.options.find((o) => o.isCorrect);
        if (chosenId && correctOpt && chosenId === correctOpt.id) {
          correctCount += 1;
        }
      });

      const calculatedScore = Math.round((correctCount / totalQuestions) * 100);
      setScorePercentage(calculatedScore);
      setIsFinished(true);

      // Save to server
      setIsSubmitting(true);
      try {
        const res = await submitMarriageQuizResult(calculatedScore);
        if (res.ok && calculatedScore >= PASSING_SCORE_PERCENTAGE) {
          addToast("مبارك! حصلت على شارة «مؤهل للزواج وواعٍ بالمسؤولية» بنجاح 🎓", "success");
        }
      } catch (err) {
        console.warn("Quiz result save error:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setIsFinished(false);
    setScorePercentage(0);
  };

  const isPassed = scorePercentage >= PASSING_SCORE_PERCENTAGE;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans text-right" dir="rtl">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                اختبار اجتياز دورة الاستعداد للزواج
              </h3>
              <p className="text-[11px] text-slate-400">
                اختبار تفاعلي خفيف من 5 مواقف واقعية لتقييم الوعي الأسري
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isFinished ? (
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">
                  السؤال {currentIndex + 1} من {totalQuestions}
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                  نسبة الاجتياز المطلوبة: {PASSING_SCORE_PERCENTAGE}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-l from-emerald-600 to-teal-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Scenario Context */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                الموقف العملي:
              </span>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {currentQuestion.scenario}
              </p>
            </div>

            {/* Question Text */}
            <h4 className="font-extrabold text-slate-800 text-sm leading-snug">
              {currentQuestion.question}
            </h4>

            {/* Options */}
            <div className="space-y-2 pt-1">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                let optionStyle = "border-slate-200 hover:border-emerald-300 bg-white text-slate-700";

                if (showExplanation) {
                  if (option.isCorrect) {
                    optionStyle = "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold";
                  } else if (isSelected && !option.isCorrect) {
                    optionStyle = "border-rose-300 bg-rose-50/80 text-rose-900";
                  } else {
                    optionStyle = "border-slate-200 opacity-60 text-slate-400";
                  }
                } else if (isSelected) {
                  optionStyle = "border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold";
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    disabled={showExplanation}
                    className={`w-full text-right p-3.5 rounded-2xl border text-xs leading-relaxed transition flex items-start gap-3 cursor-pointer ${optionStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                      {option.id.toUpperCase()}
                    </span>
                    <span className="flex-1">{option.text}</span>
                    {showExplanation && option.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {showExplanation && isSelected && !option.isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Educational feedback after answering */}
            {showExplanation && selectedOption && (
              <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 animate-fadeIn ${
                selectedOption.isCorrect 
                  ? "bg-emerald-50/90 border-emerald-200 text-emerald-950" 
                  : "bg-amber-50/90 border-amber-200 text-amber-950"
              }`}>
                <div className="font-extrabold flex items-center gap-1.5">
                  {selectedOption.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>إجابة موفقة وصحيحة!</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>لنتعلم معاً الفهم الأنسب:</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed pr-5">
                  {selectedOption.explanation}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Results Card */
          <div className="flex-1 overflow-y-auto py-6 text-center space-y-5">
            <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg ${
              isPassed 
                ? "bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 shadow-amber-500/20" 
                : "bg-slate-100 text-slate-400"
            }`}>
              {isPassed ? (
                <Award className="w-10 h-10 fill-amber-200" />
              ) : (
                <RefreshCw className="w-9 h-9" />
              )}
            </div>

            <div className="space-y-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                isPassed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                نتيجتك: {scorePercentage}%
              </span>

              {isPassed ? (
                <>
                  <h4 className="text-lg font-extrabold text-slate-800">
                    تهانينا! اجتزت الاختبار بنجاح 🎓
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    تم منحك رسمياً شارة <strong>«مؤهل للزواج وواعٍ بالمسؤولية»</strong>. ستظهر الشارة الآن على ملفك الشخصي لإعطاء طمأنينة وأولوية للأسر والباحثين عن الجدية.
                  </p>
                </>
              ) : (
                <>
                  <h4 className="text-lg font-extrabold text-slate-800">
                    أحسنت المحاولة! ينقصك القليل للاجتياز
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    نسبة النجاح المطلوبة هي {PASSING_SCORE_PERCENTAGE}%. ننصحك بقراءة مقالات الأكاديمية والمحاولة مرة أخرى لتعزيز فهمك والحصول على الشارة.
                  </p>
                </>
              )}
            </div>

            {/* Badge Preview */}
            {isPassed && (
              <div className="bg-gradient-to-l from-amber-50 via-emerald-50 to-teal-50 border border-amber-200/80 rounded-2xl p-4 max-w-xs mx-auto shadow-2xs space-y-2 text-right">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500 text-slate-950 rounded-xl shadow-xs">
                    <Award className="w-4 h-4 fill-amber-200" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-800 block">
                      مؤهل للزواج وواعٍ بالمسؤولية 🎓
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      شارة موثقة من أكاديمية مودة
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  تؤكد أن صاحب الحساب اجتاز محتوى الوعي بالحقوق الزوجية وإدارة الخلافات بحكمة.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer controls */}
        <div className="pt-3 border-t border-slate-100 flex gap-2">
          {!isFinished ? (
            <button
              type="button"
              disabled={!showExplanation}
              onClick={handleNext}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-2xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{currentIndex + 1 === totalQuestions ? "عرض النتيجة واعتماد الشارة" : "السؤال التالي"}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <>
              {isPassed ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xs transition"
                >
                  تم، عرض الملف الشخصي
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRestart}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>إعادة المحاولة الآن</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition"
              >
                إغلاق
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
