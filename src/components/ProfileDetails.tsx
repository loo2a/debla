import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { UserProfile, Gender, HijabType, CompatibilitySurvey } from "../types";
import { getAvatarUrl } from "../lib/avatarUtils";
import { calculateCompatibility } from "../lib/compatibility";
import { 
  Heart, EyeOff, Ban, AlertTriangle, MessageSquare, 
  Bookmark, ArrowRight, ShieldCheck, Sparkles, MapPin, 
  User, CheckCircle, HelpCircle, Lock, Check, Share2,
  Flame, CheckCircle2, Smile, X, Award
} from "lucide-react";
import { TrustVerificationBadges } from "./TrustVerificationBadges";
import { 
  APOLOGY_TEMPLATES, getJourneyState, saveJourneyState, syncJourneyToSupabase 
} from "../lib/marriageJourney";

interface ProfileDetailsProps {
  userId?: string;
  onBack?: () => void;
  onOpenChat?: (userId: string) => void;
  setActiveScreen?: (screen: string) => void;
}

export const ProfileDetails: React.FC<ProfileDetailsProps> = ({ 
  userId: propUserId, 
  onBack: propOnBack, 
  onOpenChat: propOnOpenChat,
  setActiveScreen: propSetActiveScreen
}) => {
  const params = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const userId = propUserId || params.userId || "";

  const { 
    currentUser, profiles, expressInterest, acceptInterest, ignoreProfile, 
    blockProfile, reportProfile, interactions, recordProfileView,
    mySurvey, allSurveys, fetchCompatibilitySurvey, sendMessage
  } = useApp();
  const { addToast, showConfirm, triggerReviewPrompt } = useUIStore();

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showPremiumBlocker, setShowPremiumBlocker] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // اعتذار محترم بضغطة واحدة
  const [showApologyModal, setShowApologyModal] = useState(false);
  const [selectedApologyId, setSelectedApologyId] = useState("apology_1");
  const [customApologyText, setCustomApologyText] = useState("");
  const [isSendingApology, setIsSendingApology] = useState(false);

  const profile = profiles.find(p => p.id === userId);

  const [fetchedSurvey, setFetchedSurvey] = useState<CompatibilitySurvey | null>(null);

  useEffect(() => {
    if (profile?.id) {
      if (allSurveys.has(profile.id)) {
        setFetchedSurvey(allSurveys.get(profile.id)!);
      } else {
        void fetchCompatibilitySurvey(profile.id).then(s => setFetchedSurvey(s));
      }
    }
  }, [profile?.id, allSurveys, fetchCompatibilitySurvey]);

  const targetSurvey = allSurveys.get(profile?.id || "") || fetchedSurvey;
  const compatibilityScore = (currentUser && profile)
    ? calculateCompatibility(currentUser, profile, mySurvey, targetSurvey)
    : null;

  useEffect(() => {
    if (profile?.id) {
      void recordProfileView(profile.id);
    }
  }, [profile?.id]);

  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
    } else {
      navigate(-1);
    }
  };

  const handleOpenChatScreen = (targetId: string) => {
    if (propOnOpenChat) {
      propOnOpenChat(targetId);
    } else {
      navigate(`/inbox/${targetId}`);
    }
  };

  const handleGoToPremium = () => {
    if (propSetActiveScreen) {
      propSetActiveScreen("premium");
    } else {
      navigate("/premium");
    }
  };

  if (!profile) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <p className="text-slate-600 font-bold">عذراً، لم يتم العثور على هذا العضو في قاعدة البيانات.</p>
        <button onClick={handleBack} className="mt-4 text-emerald-600 font-bold underline">العودة للبحث</button>
      </div>
    );
  }

  const isInterested = interactions.some(i => i.fromUserId === currentUser?.id && i.toUserId === profile.id && i.type === "interest");
  const hasReceivedInterest = interactions.some(i => i.fromUserId === profile.id && i.toUserId === currentUser?.id && i.type === "interest");
  const hasAcceptedInterest = interactions.some(i => 
    (i.fromUserId === currentUser?.id && i.toUserId === profile.id && i.type === "accept_interest") ||
    (i.fromUserId === profile.id && i.toUserId === currentUser?.id && i.type === "accept_interest")
  );
  const isIgnored = interactions.some(i => i.fromUserId === currentUser?.id && i.toUserId === profile.id && i.type === "ignore");
  const isBlocked = interactions.some(i => i.fromUserId === currentUser?.id && i.toUserId === profile.id && i.type === "block");

  const isPhotoLocked = profile.photoPrivacy === "hidden" || (profile.photoPrivacy === "accepted_interest_only" && !hasAcceptedInterest);

  const handleInterest = async () => {
    const res = await expressInterest(profile.id);
    if (res.ok) {
      addToast(`تم تسجيل إبدائك للاهتمام بـ ${profile.name} وإرسال إشعار له.`, "success");
    } else {
      addToast(res.error || "فشل تسجيل الاهتمام", "error");
    }
  };

  const handleAcceptInterest = async () => {
    const res = await acceptInterest(profile.id);
    if (res.ok) {
      addToast(`تم قبول الاهتمام المتبادل بنجاح! تم فتح تفاصيل التواصل ورؤية الصورة.`, "success");
      setTimeout(() => {
        triggerReviewPrompt();
      }, 1500);
    } else {
      addToast(res.error || "فشل قبول الاهتمام", "error");
    }
  };

  const handleIgnore = async () => {
    const res = await ignoreProfile(profile.id);
    if (res.ok) {
      addToast(`تم إضافة ${profile.name} إلى قائمة المتجاهلين لإخفاء ملفه.`, "info");
      handleBack();
    } else {
      addToast(res.error || "فشل تجاهل الملف", "error");
    }
  };

  const handleConfirmApology = async () => {
    if (!currentUser || !profile) return;
    setIsSendingApology(true);
    try {
      let finalApologyText = "";
      if (customApologyText.trim()) {
        finalApologyText = customApologyText.trim();
      } else {
        const found = APOLOGY_TEMPLATES.find((t) => t.id === selectedApologyId);
        finalApologyText = found ? found.content : APOLOGY_TEMPLATES[0].content;
      }

      // تحديث حالة رحلة الزواج إلى concluded محلياً وعلى السيرفر
      const existingJourney = getJourneyState(currentUser.id, profile.id);
      const updatedJourney = {
        ...existingJourney,
        status: "concluded" as const,
        concludedReason: finalApologyText,
        concludedBy: currentUser.id,
        updatedAt: new Date().toISOString(),
      };
      saveJourneyState(updatedJourney);
      void syncJourneyToSupabase(currentUser.id, profile.id, updatedJourney);

      // إرسال رسالة الاعتذار المهذبة
      const message = `🌸 [اعتذار راقٍ وإنهاء مسار التعارف]:\n${finalApologyText}\n\n(تم إغلاق المحادثة تلقائياً وفق ميثاق الوقار لحفظ الكرامة ومنع أي إلحاح أو عتاب)`;
      try {
        await sendMessage(profile.id, message);
      } catch {}

      // تسجيل التجاهل بهدوء لمنع تكرار الإزعاج
      try {
        await ignoreProfile(profile.id);
      } catch {}

      setShowApologyModal(false);
      addToast("تم إرسال الاعتذار المحترم وإغلاق التواصل بنجاح، حفظ الله كرامتكما ووفقكما.", "success");
      handleBack();
    } finally {
      setIsSendingApology(false);
    }
  };

  const handleBlock = () => {
    showConfirm({
      title: "حظر نهائي للعضو",
      message: "هل أنت متأكد من حظر هذا العضو بشكل كامل ونهائي؟ لن يتمكن من رؤيتك أو التواصل معك إطلاقاً.",
      confirmText: "تأكيد الحظر",
      isDangerous: true,
      onConfirm: async () => {
        const res = await blockProfile(profile.id);
        if (res.ok) {
          addToast("تم حظر العضو بنجاح.", "success");
          handleBack();
        } else {
          addToast(res.error || "فشل حظر العضو", "error");
        }
      }
    });
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    
    const res = await reportProfile(profile.id, reportReason);
    if (res.ok) {
      addToast("تم تقديم البلاغ للتحقق والمراجعة العاجلة من إدارة التطبيق.", "success");
      setShowReportModal(false);
      setReportReason("");
    } else {
      addToast(res.error || "فشل تقديم البلاغ", "error");
    }
  };

  const handleMessageClick = () => {
    if (!currentUser?.isPremium) {
      setShowPremiumBlocker(true);
    } else {
      handleOpenChatScreen(profile.id);
    }
  };

  const handleShareProfile = async () => {
    const title = `ملف تعريفي لطلب زواج شرعي (${profile.name || profile.memberNumber})`;
    const text = `اطلعت على هذا الملف التعريفي الجاد على تطبيق مودة ورحمة:\nعضوية: ${profile.memberNumber}\nالعمر: ${profile.age} سنة\nالإقامة: ${profile.residence} (${profile.nationality})\nالمؤهل: ${profile.education} - ${profile.profession}`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {}
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
      addToast("تم نسخ رابط وتفاصيل الملف بنجاح! يمكنك مشاركته مع الأهل.", "success");
    }
  };

  return (
    <div className="pb-24 pt-4 font-sans text-right bg-slate-50 min-h-screen relative" dir="rtl">
      
      {/* Breadcrumb & Actions info */}
      <div className="max-w-xl mx-auto px-4 py-1 flex justify-between items-center text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span>عضوية رقم: {profile.memberNumber}</span>
          <button
            type="button"
            onClick={() => void handleShareProfile()}
            className="flex items-center gap-1 text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-sans font-medium transition cursor-pointer"
            title="مشاركة الملف مع الأهل"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>مشاركة الملف</span>
          </button>
        </div>
        <button 
          onClick={handleBack}
          className="text-emerald-700 hover:underline font-sans font-medium flex items-center gap-1"
        >
          <span>العودة للبحث</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 relative overflow-hidden">
          {profile.isPremium && (
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-bl-2xl shadow-sm flex items-center gap-1">
              <Sparkles className="w-4 h-4 fill-slate-950" />
              عضو متميز
            </div>
          )}

          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="relative">
              {isPhotoLocked ? (
                <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-200 shadow-md flex flex-col items-center justify-center text-slate-500">
                  <Lock className="w-7 h-7 text-emerald-600 mb-1" />
                  <span className="text-[9px] font-bold">صورة خاصة</span>
                </div>
              ) : (
                <img 
                  src={getAvatarUrl(profile, undefined, isPhotoLocked)} 
                  alt={profile.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md"
                  referrerPolicy="no-referrer"
                />
              )}
              {profile.isVerified && (
                <div className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {isPhotoLocked && (
              <p className="text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
                {profile.photoPrivacy === "hidden" ? "🔒 هذا العضو يفضل عدم إظهار صورته الشخصية مؤقتاً." : "🔒 هذا العضو جعل صورته مرئية حصرياً لمن يتبادل معهم قبول الاهتمام."}
              </p>
            )}

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-800 flex items-center justify-center gap-1.5">
                {profile.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">عضوية رقم فريد: {profile.memberNumber} • انضم في: {profile.joinDate}</p>
              
              {/* Multi-tier Verification Badges */}
              <div className="flex justify-center pt-1">
                <TrustVerificationBadges user={profile} variant="chips" />
              </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-2">
              {compatibilityScore !== null && (
                <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-white" />
                  نسبة التوافق {compatibilityScore}%
                </span>
              )}
              <span className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1 rounded-full font-semibold">
                {profile.religiousCommitment}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-semibold">
                {profile.age} سنة • {profile.maritalStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Multi-tier Trust & Verification Section */}
        <TrustVerificationBadges user={profile} variant="detailed" />

        {/* Mutual interest incoming alert banner */}
        {hasReceivedInterest && !hasAcceptedInterest && (
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-4 text-white shadow-md flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs flex items-center gap-1">
                <Heart className="w-4 h-4 fill-white" />
                <span>أبدى هذا العضو اهتمامه بملفك الشخصي!</span>
              </h4>
              <p className="text-[11px] text-pink-100">قبولك للاهتمام سيتيح لكما بدء المحادثة المباشرة ورؤية الصورة الشخصية.</p>
            </div>
            <button
              onClick={handleAcceptInterest}
              className="px-3.5 py-2 bg-white text-rose-600 rounded-xl text-xs font-bold hover:bg-pink-50 transition flex items-center gap-1 flex-shrink-0 shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>قبول الاهتمام</span>
            </button>
          </div>
        )}

        {/* Marriage Journey Banner on Profile */}
        {(hasAcceptedInterest || isInterested) && (
          <div className="bg-gradient-to-l from-emerald-800 to-teal-800 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-200">
                <Sparkles className="w-3.5 h-3.5 fill-emerald-300" />
                <span>رحلة زواج بدل شات لا ينتهي</span>
              </div>
              <p className="text-[11px] text-white font-medium">
                مسار تعارف شرعي هادف يمر بمراحل واضحة تنتهي بإشراك الأسرة واللقاء الرسمي.
              </p>
            </div>
            <button
              onClick={() => handleOpenChatScreen(profile.id)}
              className="px-3.5 py-2 bg-white text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-50 transition flex items-center gap-1 flex-shrink-0 shadow-xs cursor-pointer"
            >
              <span>متابعة المسار</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Marriage Readiness Academy Certificate Spotlight Card */}
        {profile.isMarriageCertified && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-3xl p-4.5 text-slate-950 shadow-sm flex items-center justify-between gap-3 border border-amber-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-6 h-6 fill-amber-300" />
              </div>
              <div className="space-y-0.5 text-right">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-xs sm:text-sm text-slate-950">
                    مؤهل للزواج وواعٍ بالمسؤولية 🎓
                  </h4>
                  <span className="text-[10px] bg-slate-950 text-amber-300 font-extrabold px-2 py-0.5 rounded-full">
                    معتمد
                  </span>
                </div>
                <p className="text-[11px] text-slate-900 font-medium leading-snug">
                  اجتاز صاحب هذا الملف دورة واختبار أكاديمية الاستعداد للزواج (بدرجة {profile.marriageExamScore || 100}%) تأكيداً على نضجه ووعيه بالحقوق الأسرية وحسن المعاشرة.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Action Buttons bar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-wrap justify-around gap-2">
          <button 
            onClick={handleInterest}
            disabled={isInterested}
            className={`flex flex-col items-center justify-center flex-1 min-w-[70px] py-2.5 rounded-xl border transition ${
              isInterested 
                ? "bg-pink-50 border-pink-200 text-pink-600" 
                : "bg-white border-slate-150 hover:bg-slate-50 text-slate-600"
            }`}
          >
            <Heart className={`w-5 h-5 mb-1 ${isInterested ? "fill-pink-600 text-pink-600" : ""}`} />
            <span className="text-[10px] font-bold">{isInterested ? "مهتم به" : "اهتمام"}</span>
          </button>

          <button 
            onClick={() => setShowApologyModal(true)}
            className="flex flex-col items-center justify-center flex-1 min-w-[70px] py-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-700 transition"
            title="إنهاء التعارف برسالة مهذبة جاهزة"
          >
            <Smile className="w-5 h-5 mb-1 text-rose-600" />
            <span className="text-[10px] font-bold">اعتذار محترم</span>
          </button>

          <button 
            onClick={handleIgnore}
            className="flex flex-col items-center justify-center flex-1 min-w-[70px] py-2.5 rounded-xl border border-slate-150 hover:bg-slate-50 text-slate-600 bg-white transition"
          >
            <EyeOff className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold">تجاهل</span>
          </button>

          <button 
            onClick={handleMessageClick}
            className="flex flex-col items-center justify-center flex-1 min-w-[70px] py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 transition"
          >
            <MessageSquare className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold">رسالة</span>
          </button>

          <button 
            onClick={() => setIsSaved(!isSaved)}
            className={`flex flex-col items-center justify-center flex-1 min-w-[70px] py-2.5 rounded-xl border transition ${
              isSaved 
                ? "bg-amber-50 border-amber-200 text-amber-600" 
                : "bg-white border-slate-150 hover:bg-slate-50 text-slate-600"
            }`}
          >
            <Bookmark className={`w-5 h-5 mb-1 ${isSaved ? "fill-amber-600 text-amber-600" : ""}`} />
            <span className="text-[10px] font-bold">{isSaved ? "تم الحفظ" : "حفظ"}</span>
          </button>
        </div>

        {/* Public Compatibility Survey & Red Flags Card */}
        {targetSurvey && targetSurvey.isPublicInProfile && (
          <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-r-4 border-rose-500 pr-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <h4 className="font-extrabold text-slate-800 text-sm">
                استبيان التوافق والخطوط الحمراء للشريك
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {targetSurvey.leisureStyle && (
                <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100/60">
                  <span className="text-[10px] text-rose-600 block font-semibold">نمط قضاء الإجازة</span>
                  <span className="font-bold text-slate-800">{targetSurvey.leisureStyle}</span>
                </div>
              )}
              {targetSurvey.conflictStyle && (
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/60">
                  <span className="text-[10px] text-amber-600 block font-semibold">التعامل مع الخلافات</span>
                  <span className="font-bold text-slate-800">{targetSurvey.conflictStyle}</span>
                </div>
              )}
              {targetSurvey.financialView && (
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/60">
                  <span className="text-[10px] text-emerald-600 block font-semibold">الرؤية المالية للبيت</span>
                  <span className="font-bold text-slate-800">{targetSurvey.financialView}</span>
                </div>
              )}
              {targetSurvey.privacyBoundary && (
                <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100/60">
                  <span className="text-[10px] text-purple-600 block font-semibold">الخصوصية وحدود الأهل</span>
                  <span className="font-bold text-slate-800">{targetSurvey.privacyBoundary}</span>
                </div>
              )}
              {targetSurvey.lifePriority && (
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/60 sm:col-span-2">
                  <span className="text-[10px] text-blue-600 block font-semibold">الهدف والأولوية في الزواج</span>
                  <span className="font-bold text-slate-800">{targetSurvey.lifePriority}</span>
                </div>
              )}
            </div>

            {targetSurvey.redFlags && targetSurvey.redFlags.length > 0 && (
              <div className="pt-2 border-t border-rose-100/80 space-y-2">
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-600" />
                  خطوط حمراء يرفضها العضو تماماً (Red Flags):
                </span>
                <div className="flex flex-wrap gap-2">
                  {targetSurvey.redFlags.map((flag: string) => (
                    <span
                      key={flag}
                      className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs"
                    >
                      ⛔ {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {targetSurvey.flexiblePoints && targetSurvey.flexiblePoints.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  نقاط يتقبل فيها العضو المرونة والتفاهم:
                </span>
                <div className="flex flex-wrap gap-2">
                  {targetSurvey.flexiblePoints.map((pt: string) => (
                    <span
                      key={pt}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium"
                    >
                      ✓ {pt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 1: Speak about yourself & Partner specs (Min 140 chars validated) */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="space-y-3">
            <h4 className="font-extrabold text-emerald-800 text-sm border-r-4 border-emerald-600 pr-2">تحدث عن نفسي بالتفصيل</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/25 p-4 rounded-2xl border border-emerald-100/30 whitespace-pre-wrap">
              "{profile.aboutMe}"
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-emerald-800 text-sm border-r-4 border-emerald-600 pr-2">المواصفات المطلوبة في شريك الحياة</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-teal-50/25 p-4 rounded-2xl border border-teal-100/30 whitespace-pre-wrap">
              "{profile.partnerSpecs}"
            </p>
          </div>
        </div>

        {/* Section 2: Detailed Personal Dropdown fields */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h4 className="font-extrabold text-slate-800 text-sm border-r-4 border-slate-600 pr-2">البيانات الشخصية والاجتماعية</h4>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">العمر الحقيقي</span>
              <span className="font-bold text-slate-800">{profile.age} سنة</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">الجنسية</span>
              <span className="font-bold text-slate-800">{profile.nationality}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">الإقامة الحالية</span>
              <span className="font-bold text-slate-800">{profile.residence}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">الحالة الاجتماعية</span>
              <span className="font-bold text-slate-800">{profile.maritalStatus}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">وجود أطفال</span>
              <span className="font-bold text-slate-800">
                {profile.hasChildren ? `نعم (${profile.childrenCount} أطفال)` : "لا يوجد"}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">التدخين</span>
              <span className="font-bold text-slate-800">{profile.isSmoker ? "نعم، مدخن" : "لا يدخن مطلقاً"}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Physical Body specs */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h4 className="font-extrabold text-slate-800 text-sm border-r-4 border-slate-600 pr-2">المواصفات الجسمانية والصحية</h4>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">الطول</span>
              <span className="font-bold text-slate-800 font-mono">{profile.height} سم</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">الوزن</span>
              <span className="font-bold text-slate-800 font-mono">{profile.weight} كجم</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">لون البشرة</span>
              <span className="font-bold text-slate-800">{profile.skinColor}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">بنية الجسم</span>
              <span className="font-bold text-slate-800">{profile.bodyBuild}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 md:col-span-2">
              <span className="text-[10px] text-slate-400 block font-semibold">الحالة الصحية والإعاقات</span>
              <span className="font-bold text-slate-800">{profile.healthStatus}</span>
              {profile.hasDisability && (
                <p className="text-[10px] text-rose-600 font-semibold mt-1">تفاصيل: {profile.chronicDiseases}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Work, Education & Income */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h4 className="font-extrabold text-slate-800 text-sm border-r-4 border-slate-600 pr-2">بيانات العمل ومستوى الدخل المالي</h4>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">المهنة / الوظيفة</span>
              <span className="font-bold text-slate-800">{profile.profession}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">المؤهل الدراسي</span>
              <span className="font-bold text-slate-800">{profile.education}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 md:col-span-2">
              <span className="text-[10px] text-slate-400 block font-semibold">مستوى الدخل التقريبي</span>
              <span className="font-bold text-slate-800">{profile.income}</span>
            </div>
          </div>
        </div>

        {/* Section 5: Religious specifications */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h4 className="font-extrabold text-slate-800 text-sm border-r-4 border-slate-600 pr-2">
            {profile.religion === "مسيحي" ? "البيانات الروحية والكنسية" : "بيانات التدين والصلوات والزي"}
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">الديانة</span>
              <span className="font-bold text-slate-800">{profile.religion || "مسلم"}</span>
            </div>

            {profile.religion === "مسيحي" ? (
              <>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">المذهب / الطائفة</span>
                  <span className="font-bold text-slate-800">{profile.christianDenomination || "أرثوذكسي"}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">الالتزام الروحي والكنسي</span>
                  <span className="font-bold text-slate-800">{profile.religiousCommitment}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">القداسات والتناول والصلوات</span>
                  <span className="font-bold text-slate-800">{profile.prayers}</span>
                </div>

                {profile.churchAttendance && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 md:col-span-2">
                    <span className="text-[10px] text-slate-400 block font-semibold">الخدمة والأنشطة الكنسية</span>
                    <span className="font-bold text-slate-800">{profile.churchAttendance}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">درجة الالتزام الديني</span>
                  <span className="font-bold text-slate-800">{profile.religiousCommitment}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">المحافظة على الصلاة</span>
                  <span className="font-bold text-slate-800">{profile.prayers}</span>
                </div>

                {profile.gender === Gender.MALE ? (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 md:col-span-2">
                    <span className="text-[10px] text-slate-400 block font-semibold">اللحية</span>
                    <span className="font-bold text-slate-800">{profile.hasBeard ? "نعم (ملتحي)" : "لا يوجد"}</span>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 md:col-span-2">
                    <span className="text-[10px] text-slate-400 block font-semibold">نوع الحجاب الشرعي</span>
                    <span className="font-bold text-slate-800">{profile.hijabType || HijabType.HIJAB}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Section 6: Opinions & stances on marriage agreement */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h4 className="font-extrabold text-slate-800 text-sm border-r-4 border-slate-600 pr-2">رؤيته في الاتفاقات المادية والشرعية</h4>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">الموقف من قائمة المنقولات (القايمة)</span>
              <span className="font-bold text-slate-800">{profile.qaImaStance}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">الموقف من المهر والشبكة</span>
              <span className="font-bold text-slate-800">{profile.mahrOpinion}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">مدى الاستعداد والجاهزية للزواج</span>
              <span className="font-bold text-emerald-800">{profile.marriageReadiness || "مستعد تماماً وجاهز من كافة الجوانب"}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">الإطار الزمني الذي يناسبه للزواج</span>
              <span className="font-bold text-slate-800">{profile.marriageTimeframe}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-2">
              <span className="text-[10px] text-slate-400 block font-semibold">الموقف من الرؤية الشرعية</span>
              <span className="font-bold text-slate-800">{profile.shariaVisionStance}</span>
            </div>
          </div>
        </div>

        {/* Section 7: Hobbies */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3">
          <h4 className="font-extrabold text-slate-800 text-sm border-r-4 border-slate-600 pr-2">الهوايات والاهتمامات الشخصية</h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {profile.hobbies.map(hobby => (
              <span 
                key={hobby}
                className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-100/45"
              >
                {hobby}
              </span>
            ))}
          </div>
        </div>

        {/* Block / Report Actions */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex gap-3">
          <button 
            onClick={handleBlock}
            className="flex items-center justify-center gap-2 flex-1 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 text-xs font-bold transition"
          >
            <Ban className="w-4 h-4" />
            <span>حظر العضو</span>
          </button>

          <button 
            onClick={() => setShowReportModal(true)}
            className="flex items-center justify-center gap-2 flex-1 py-2 rounded-xl text-amber-600 hover:bg-amber-50 border border-amber-100 text-xs font-bold transition"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>بلاغ إساءة استخدام</span>
          </button>
        </div>

      </div>

      {/* Abuse Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 space-y-4">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-800 text-base">إرسال بلاغ عن إساءة استخدام</h3>
              <p className="text-xs text-slate-500">نحن نتخذ إجراءات صارمة وحظرًا فوريًا لغير الجادين لحماية أخلاقيات المجتمع.</p>
            </div>

            <form onSubmit={handleReport} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">سبب البلاغ بالتفصيل</label>
                <textarea 
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows={3}
                  placeholder="يرجى توضيح السلوك المخالف بالتفصيل (مثل: التسلية، طلب التواصل خارج الضوابط، عدم مطابقة البيانات، إلخ)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="w-1/3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/10"
                >
                  إرسال البلاغ فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Membership Blocker Modal */}
      {showPremiumBlocker && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 text-center space-y-4 relative">
            <div className="p-3 bg-amber-50 text-amber-500 w-fit rounded-full mx-auto animate-bounce">
              <Lock className="w-8 h-8 fill-amber-100" />
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-base flex items-center justify-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                المحادثات مخصصة للأعضاء المتميزين
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                حفاظاً على مستوى الجدية وتجنباً للعشوائية في التواصل، فإن تفعيل المحادثات وقراءة الرسائل وطلب الرؤية الشرعية متاح حصرياً لمشتركي <span className="font-bold text-amber-600">باقة التميز</span>.
              </p>
            </div>

            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/40 text-right space-y-2">
              <h4 className="text-xs font-bold text-amber-900">مميزات اشتراك التميز:</h4>
              <ul className="text-[10px] text-slate-600 space-y-1 list-disc list-inside leading-relaxed">
                <li>إرسال رسائل ومحادثات غير محدودة للشركاء.</li>
                <li>رفع صورة شخصية حقيقية يراها المقبولون فقط.</li>
                <li>شارة التميز الذهبية على ملفك الشخصي لزيادة الجدية.</li>
                <li>تصفح الملفات خفية دون الكشف عن هويتك.</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPremiumBlocker(false)}
                className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
              >
                ربما لاحقاً
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPremiumBlocker(false);
                  handleGoToPremium();
                }}
                className="w-2/3 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-md shadow-amber-500/10"
              >
                الاشتراك في باقة التميز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Polite Apology Modal (إنهاء التعارف بأدب من غير إحراج) */}
      {showApologyModal && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">اعتذار محترم وإنهاء مسار التعارف</h3>
              </div>
              <button 
                onClick={() => setShowApologyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              من أدب المسلم والوفاء بالأمانة إعلام الطرف الآخر بقرارك بلطف ودعاء بالتوفيق عند عدم وجود توافق، من غير إحراج أو تجاهل مفاجئ:
            </p>

            {/* Anti-harassment and safety rules notice */}
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 text-[11px] text-emerald-950 space-y-1 leading-snug">
              <span className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ضمانات وقواعد التطبيق لإنهاء التعارف بكرامة:</span>
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-900/90 pr-1">
                <li><strong>توقف التواصل فوراً:</strong> يتم إغلاق صندوق المحادثة تلقائياً لمنع أي إلحاح أو عتاب.</li>
                <li><strong>حظر الانتقام والتقييمات الكيدية:</strong> يُمنع الطرفان من تقديم أي تقييم مسيء أو بلاغ كيدي.</li>
                <li><strong>حفظ السمعة والخصوصية:</strong> لا يؤثر الاعتذار على نقاط أو ظهور حساب أي منكما.</li>
              </ul>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                      name="profile_apology_option"
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

    </div>
  );
};
