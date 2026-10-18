import React, { useState, useEffect } from "react";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { UserProfile, Gender } from "../types";
import { 
  MARRIAGE_STAGES, GUIDED_QUESTIONS, APOLOGY_TEMPLATES, 
  getJourneyState, saveJourneyState, MarriageJourneyState 
} from "../lib/marriageJourney";
import { 
  Heart, Compass, HelpCircle, Users, Home, CheckCircle2, 
  ChevronDown, ChevronUp, Sparkles, Send, ShieldCheck, 
  AlertTriangle, X, Phone, Clock, MessageSquare, ArrowRight,
  Smile, Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MarriageJourneyTrackerProps {
  partner: UserProfile;
  onSendMessage?: (content: string) => Promise<any>;
}

export const MarriageJourneyTracker: React.FC<MarriageJourneyTrackerProps> = ({ 
  partner,
  onSendMessage 
}) => {
  const { currentUser, sendMessage, ignoreProfile } = useApp();
  const { addToast } = useUIStore();

  if (!currentUser || !partner) return null;

  // حالة الرحلة
  const [journey, setJourney] = useState<MarriageJourneyState>(() => {
    return getJourneyState(currentUser.id, partner.id);
  });

  // التحكم في ظهور القوائم المنبثقة
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showWaliModal, setShowWaliModal] = useState(false);
  const [showApologyModal, setShowApologyModal] = useState(false);
  const [showEngagementModal, setShowEngagementModal] = useState(false);

  // حقول نموذج ولي الأمر
  const [waliName, setWaliName] = useState("");
  const [waliPhone, setWaliPhone] = useState("");
  const [waliRelation, setWaliRelation] = useState("الوالد");
  const [waliBestTime, setWaliBestTime] = useState("مساءً بعد صلاة العشاء");

  // حقول الاعتذار
  const [selectedApologyId, setSelectedApologyId] = useState("apology_1");
  const [customApologyText, setCustomApologyText] = useState("");
  const [isSendingApology, setIsSendingApology] = useState(false);

  const currentStageInfo = MARRIAGE_STAGES.find((s) => s.stage === journey.currentStage) || MARRIAGE_STAGES[0];
  const isConcluded = journey.status === "concluded";
  const isCompleted = journey.status === "completed";

  // حفظ التعديلات في LocalStorage
  const updateJourney = (updater: Partial<MarriageJourneyState>) => {
    const updated = {
      ...journey,
      ...updater,
      updatedAt: new Date().toISOString(),
    };
    setJourney(updated);
    saveJourneyState(updated);
  };

  // إرسال رسالة المحادثة (عبر الوسيط الممرر أو عبر store)
  const sendChatMessage = async (text: string) => {
    if (onSendMessage) {
      await onSendMessage(text);
    } else {
      await sendMessage(partner.id, text);
    }
  };

  // الترقية للمرحلة التالية
  const handleAdvanceStage = async () => {
    if (journey.currentStage >= 6) return;

    const nextStage = journey.currentStage + 1;
    const nextStageInfo = MARRIAGE_STAGES.find((s) => s.stage === nextStage);
    if (!nextStageInfo) return;

    updateJourney({ currentStage: nextStage });

    // إشعار شات مباشر وشفاف للطرفين
    const milestoneMessage = `🎯 [رحلة زواج]: خطوة مباركة! اتفق الطرفان على الانتقال إلى المرحلة (${nextStage}): «${nextStageInfo.title}». نسأل الله التوفيق والسداد.`;
    await sendChatMessage(milestoneMessage);

    addToast(`تم الانتقال إلى المرحلة (${nextStage}): ${nextStageInfo.title}`, "success");
  };

  // اختيار سؤال من بنك الأسئلة الهامة
  const handleSelectQuestion = async (qText: string) => {
    setShowQuestionsModal(false);
    const message = `❓ [أسئلة المصارحة الزوجية]:\n«${qText}»`;
    await sendChatMessage(message);
    addToast("تم طرح السؤال في المحادثة بنجاح", "success");
  };

  // إرسال بيانات ولي الأمر رسميّاً
  const handleSubmitWaliContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waliName.trim() || !waliPhone.trim()) {
      addToast("يرجى إدخال اسم ورقم ولي الأمر", "error");
      return;
    }

    const contactData = {
      name: waliName.trim(),
      phone: waliPhone.trim(),
      relationship: waliRelation,
      preferredTime: waliBestTime.trim(),
    };

    updateJourney({
      waliContact: contactData,
      currentStage: Math.max(journey.currentStage, 4),
    });

    setShowWaliModal(false);

    const message = `🤝 [إشراك الأسرة والتواصل الرسمي]:\nتمت مشاركة بيانات ولي الأمر الكريمة للتواصل ومباركة السعي:\n• الاسم: ${contactData.name}\n• الصفة: ${contactData.relationship}\n• الهاتف: ${contactData.phone}\n• الموعد المفضل للاتصال: ${contactData.preferredTime}\nنسأل الله أن يبارك في الخطوات ويجمع بينكما على خير.`;
    await sendChatMessage(message);

    addToast("تمت مشاركة بيانات ولي الأمر بنجاح للتواصل الرسمي", "success");
  };

  // إتمام الخطوبة بنجاح (المرحلة 6)
  const handleConfirmEngagement = async () => {
    updateJourney({ status: "completed", currentStage: 6 });
    setShowEngagementModal(false);

    const message = `💍 [مباركة وقرار الاستمرار]:\nالحمد لله الذي بنعمته تتم الصالحات، اتفق الطرفان بفضل الله وتوفيقه على إعلان القبول ومباركة الخطوبة الرسمية. نسأل الله أن يبارك لكما وعليكما وأن يجمع بينكما في خير.`;
    await sendChatMessage(message);

    addToast("مبارك الخطوبة الرسمية! بارك الله لكما وعليكما", "success");
  };

  // إنهاء التعارف بأدب من غير إحراج
  const handleConfirmApology = async () => {
    setIsSendingApology(true);
    try {
      let finalApologyText = "";
      if (customApologyText.trim()) {
        finalApologyText = customApologyText.trim();
      } else {
        const found = APOLOGY_TEMPLATES.find((t) => t.id === selectedApologyId);
        finalApologyText = found ? found.content : APOLOGY_TEMPLATES[0].content;
      }

      updateJourney({
        status: "concluded",
        concludedReason: finalApologyText,
      });

      const message = `🌸 [اعتذار راقٍ وإنهاء مسار التعارف]:\n${finalApologyText}`;
      await sendChatMessage(message);

      // تسجيل التجاهل بهدوء لمنع تكرار الإزعاج
      try {
        await ignoreProfile(partner.id);
      } catch {}

      setShowApologyModal(false);
      addToast("تم إنهاء التعارف بكل أدب واحترام متبادل وحفظ كرامة الطرفين.", "info");
    } finally {
      setIsSendingApology(false);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 font-sans text-right" dir="rtl">
      {/* Top Banner Bar */}
      <div className="px-4 py-2.5 bg-gradient-to-l from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/30 rounded-lg text-emerald-200 border border-white/10">
            <Sparkles className="w-4 h-4 fill-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-wide">رحلة زواج بدل شات لا ينتهي</span>
              <span className="bg-emerald-600/70 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                مرحلة {journey.currentStage} من 6
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/90 font-medium leading-tight">
              {isConcluded ? (
                <span className="text-amber-200 font-bold">تم إنهاء التعارف بأدب ودعاء بالتوفيق</span>
              ) : isCompleted ? (
                <span className="text-amber-300 font-bold">مبارك الخطوبة الرسمية!</span>
              ) : (
                <span>المرحلة الحالية: <strong>{currentStageInfo.title}</strong></span>
              )}
            </p>
          </div>
        </div>

        {/* Toggle details & Exit button */}
        <div className="flex items-center gap-1.5">
          {!isConcluded && !isCompleted && (
            <button
              type="button"
              onClick={() => setShowApologyModal(true)}
              className="text-[10px] font-bold text-rose-200 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 border border-rose-300/30 px-2 py-1 rounded-lg transition cursor-pointer"
              title="إنهاء التعارف بلطف"
            >
              اعتذار بأدب
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            aria-label="تفاصيل رحلة الزواج"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 6-Steps Visual Progress Timeline Bar */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between min-w-[340px] gap-1">
          {MARRIAGE_STAGES.map((s) => {
            const isCurrent = s.stage === journey.currentStage && !isConcluded && !isCompleted;
            const isDone = s.stage < journey.currentStage || isCompleted;

            return (
              <div 
                key={s.stage} 
                className={`flex-1 flex flex-col items-center text-center cursor-pointer group ${
                  isCurrent ? "scale-105" : ""
                }`}
                onClick={() => setIsExpanded(true)}
              >
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition shadow-xs ${
                    isCurrent
                      ? "bg-emerald-600 text-white ring-2 ring-emerald-300 animate-pulse"
                      : isDone
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.stage}
                </div>
                <span 
                  className={`text-[9px] mt-1 truncate max-w-[54px] font-medium leading-none ${
                    isCurrent ? "font-bold text-emerald-800" : isDone ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {s.shortTitle}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collapsible Action Card / Current Step Guidance */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white px-4 py-3 space-y-3 text-xs"
          >
            {/* If Concluded */}
            {isConcluded ? (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl space-y-1.5 text-amber-900">
                <p className="font-extrabold flex items-center gap-1.5 text-amber-800">
                  <Smile className="w-4 h-4 text-amber-600" />
                  <span>انتهى مسار التعارف بكل مودة وأدب</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  «وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ». تم ختام الحديث بأسلوب شرعي راقٍ، نسأل الله أن يرزقكما التوفيق والخير.
                </p>
              </div>
            ) : isCompleted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl space-y-1.5 text-emerald-900 text-center">
                <p className="font-extrabold text-sm flex items-center justify-center gap-1.5 text-emerald-800">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>مبارك الخطوبة الرسمية!</span>
                </p>
                <p className="text-[11px] text-emerald-700">
                  الحمد لله الذي بنعمته تتم الصالحات، نتمنى لكما حياة زوجية هانئة ملؤها المودة والرحمة.
                </p>
              </div>
            ) : (
              <>
                {/* Stage Info Card */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-900 text-xs flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{currentStageInfo.title}</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      الهدف: {currentStageInfo.goal}
                    </span>
                  </div>

                  {/* Next Step Reminder */}
                  <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-100 text-[11px] text-slate-700 leading-relaxed space-y-1">
                    <span className="font-bold text-emerald-800 block text-[10px]">💡 تذكير التطبيق بالخطوة الحالية:</span>
                    <p>{currentStageInfo.nextStepReminder}</p>
                  </div>
                </div>

                {/* Stage-Specific Quick Action Tools */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {/* Stage 3: Crucial Questions Tool */}
                  <button
                    type="button"
                    onClick={() => setShowQuestionsModal(true)}
                    className="flex-1 min-w-[140px] py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>أسئلة المصارحة</span>
                  </button>

                  {/* Stage 4: Involve Family Tool */}
                  <button
                    type="button"
                    onClick={() => setShowWaliModal(true)}
                    className="flex-1 min-w-[140px] py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>مشاركة بيانات الولي</span>
                  </button>

                  {/* Stage 6: Decision / Engagement */}
                  {journey.currentStage === 6 && (
                    <button
                      type="button"
                      onClick={() => setShowEngagementModal(true)}
                      className="w-full py-2.5 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs hover:scale-[1.01] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-4 h-4 fill-slate-950" />
                      <span>إعلان القبول والخطوبة رسمياً 💍</span>
                    </button>
                  )}

                  {/* Advance to Next Stage Button */}
                  {journey.currentStage < 6 && (
                    <button
                      type="button"
                      onClick={() => void handleAdvanceStage()}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>الانتقال للمرحلة التالية: {MARRIAGE_STAGES[journey.currentStage]?.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------- */}
      {/* Modal 1: بنك أسئلة المصارحة الزوجية (Smart Questions) */}
      {/* ---------------------------------------------------- */}
      {showQuestionsModal && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">أسئلة المصارحة الزوجية الهامة</h3>
              </div>
              <button 
                onClick={() => setShowQuestionsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              اختر أي سؤال ليتم طرحه مباشرة في المحادثة بأسلوب موضوعي وراقٍ يفتح باب النقاش الصادق:
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {GUIDED_QUESTIONS.map((q) => (
                <div 
                  key={q.id}
                  onClick={() => void handleSelectQuestion(q.question)}
                  className="p-3 rounded-2xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer space-y-1 group"
                >
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    {q.category}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900">
                    «{q.question}»
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowQuestionsModal(false)}
              className="w-full py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Modal 2: نموذج إشراك الأسرة والتواصل الرسمي (Wali Contact) */}
      {/* ---------------------------------------------------- */}
      {showWaliModal && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">مشاركة بيانات ولي الأمر الكريمة</h3>
              </div>
              <button 
                onClick={() => setShowWaliModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
              «البيوت تُؤتى من أبوابها». تزويد الخاطب برقم الولي يعزز الجدية ويحفظ كرامة الفتاة، وينقل التعارف لمرحلة التنسيق العائلي الرسمي.
            </p>

            <form onSubmit={handleSubmitWaliContact} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">اسم ولي الأمر</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الحاج أحمد عبد الرحمن"
                  value={waliName}
                  onChange={(e) => setWaliName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">صلة القرابة</label>
                  <select
                    value={waliRelation}
                    onChange={(e) => setWaliRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600"
                  >
                    <option value="الوالد">الوالد</option>
                    <option value="الأخ الأكبر">الأخ الأكبر</option>
                    <option value="العم">العم</option>
                    <option value="الخال">الخال</option>
                    <option value="الوصي / الولي الشرعي">الوصي الشرعي</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">رقم الهاتف للتواصل</label>
                  <input
                    type="tel"
                    required
                    placeholder="01xxxxxxxxx"
                    value={waliPhone}
                    onChange={(e) => setWaliPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الوقت المفضل للاتصال</label>
                <input
                  type="text"
                  placeholder="مثال: بعد صلاة العشاء من 8 إلى 10 مساءً"
                  value={waliBestTime}
                  onChange={(e) => setWaliBestTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  إرسال البيانات في المحادثة
                </button>
                <button
                  type="button"
                  onClick={() => setShowWaliModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Modal 3: إنهاء التعارف بأدب من غير إحراج (Polite Apology) */}
      {/* ---------------------------------------------------- */}
      {showApologyModal && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">إنهاء مسار التعارف بأدب واحترام</h3>
              </div>
              <button 
                onClick={() => setShowApologyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              من أدب المسلم والوفاء بالأمانة إعلام الطرف الآخر بقرارك بلطف، من غير إحراج أو تجاهل مفاجئ. اختر الرسالة المناسبة ليتم إرسالها بود ودعاء بالتوفيق:
            </p>

            <div className="space-y-2">
              {APOLOGY_TEMPLATES.map((tmpl) => (
                <label 
                  key={tmpl.id}
                  className={`p-3 rounded-2xl border block cursor-pointer transition space-y-1 ${
                    selectedApologyId === tmpl.id
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="apology_option"
                      checked={selectedApologyId === tmpl.id}
                      onChange={() => setSelectedApologyId(tmpl.id)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-xs text-slate-800">{tmpl.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pr-6">
                    "{tmpl.content}"
                  </p>
                </label>
              ))}
            </div>

            {/* Custom apology option */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">أو اكتب رسالة اعتذار مخصصة مهذبة:</span>
              <textarea
                value={customApologyText}
                onChange={(e) => setCustomApologyText(e.target.value)}
                rows={2}
                placeholder="اكتب كلماتك الطيبة هنا..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-emerald-600 leading-relaxed"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                disabled={isSendingApology}
                onClick={() => void handleConfirmApology()}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50"
              >
                {isSendingApology ? "جاري الإرسال..." : "إرسال الاعتذار وإنهاء المسار"}
              </button>
              <button
                type="button"
                onClick={() => setShowApologyModal(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Modal 4: إعلان ومباركة الخطوبة رسمياً (المرحلة 6) */}
      {/* ---------------------------------------------------- */}
      {showEngagementModal && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 text-center shadow-2xl">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-7 h-7 fill-amber-300" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">إعلان القبول والخطوبة رسمياً 💍</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                هل تم الاتفاق والقبول بينكما بحمد الله وتوفيقه لإتمام الخطوبة الرسمية بمباركة الأهل؟
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => void handleConfirmEngagement()}
                className="w-full py-2.5 bg-gradient-to-l from-emerald-600 to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-emerald-800 transition"
              >
                نعم، تم القبول والاتفاق والحمد لله
              </button>
              <button
                type="button"
                onClick={() => setShowEngagementModal(false)}
                className="w-full py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
