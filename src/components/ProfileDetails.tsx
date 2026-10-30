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
  User, CheckCircle, Lock, Check, Share2,
  Flame, CheckCircle2, Smile, X, Award, Briefcase,
  GraduationCap, Ruler, Scale, Activity, HeartHandshake,
  Calendar, BookOpen, Layers, Shield,
  ChevronDown, Copy, CheckCheck, Wallet, UserCheck
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

type TabType = "all" | "about" | "personal" | "religion" | "marriage" | "survey";

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
  const [copiedMemberId, setCopiedMemberId] = useState(false);

  // الفلترة السريعة وتسهيل قراءة الأقسام
  const [activeTab, setActiveTab] = useState<TabType>("all");

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
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <User className="w-8 h-8" />
        </div>
        <p className="text-slate-700 font-bold text-base">عذراً، لم يتم العثور على هذا العضو في قاعدة البيانات.</p>
        <button 
          onClick={handleBack} 
          className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition"
        >
          العودة للبحث والتصفح
        </button>
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
      addToast(`تم إبداء اهتمامك بـ ${profile.name} وإرسال إشعار لطيف له.`, "success");
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
    const text = `اطلعت على هذا الملف التعريفي الجاد على تطبيق دبلة:\nعضوية: ${profile.memberNumber}\nالعمر: ${profile.age} سنة\nالإقامة: ${profile.residence} (${profile.nationality})\nالمؤهل: ${profile.education} - ${profile.profession}`;
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

  const handleCopyMemberNumber = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(profile.memberNumber);
      setCopiedMemberId(true);
      addToast("تم نسخ رقم العضوية بنجاح.", "info");
      setTimeout(() => setCopiedMemberId(false), 2000);
    }
  };

  const handleToggleBookmark = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    addToast(
      nextSaved ? "تم حفظ الملف في قائمتك المفضلة للرجوع إليه لاحقاً." : "تمت إزالة الملف من قائمة المحفوظات.",
      "info"
    );
  };

  // تعريف التبويبات المتاحة لتسهيل القراءة وتصفح الخيارات
  const tabs = [
    { id: "all" as TabType, label: "عرض شامل", icon: Layers },
    { id: "about" as TabType, label: "عن الشخصية", icon: User },
    { id: "personal" as TabType, label: "البيانات الأساسية", icon: Briefcase },
    { id: "religion" as TabType, label: "التدين والصلوات", icon: BookOpen },
    { id: "marriage" as TabType, label: "شروط الزواج", icon: HeartHandshake },
    { id: "survey" as TabType, label: "التوافق والخطوط الحمراء", icon: Flame },
  ];

  return (
    <div className="pb-32 pt-2 font-sans text-right bg-slate-50/60 min-h-screen relative" dir="rtl">
      
      {/* 1. Header Navigation Bar (شريط الترويسة الأنيق) */}
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex justify-between items-center text-xs text-slate-500">
        <button 
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 font-bold transition shadow-2xs cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 text-emerald-600" />
          <span>العودة للتصفح</span>
        </button>

        <div className="flex items-center gap-2">
          {/* رقم العضوية مع زر نسخ سريع */}
          <button
            type="button"
            onClick={() => void handleCopyMemberNumber()}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 text-xs font-mono font-medium transition cursor-pointer"
            title="انقر لنسخ رقم العضوية"
          >
            {copiedMemberId ? (
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{profile.memberNumber}</span>
          </button>

          {/* زر مشاركة سريع مع الأهل */}
          <button
            type="button"
            onClick={() => void handleShareProfile()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 font-medium transition shadow-2xs cursor-pointer"
            title="مشاركة الملف مع الأهل"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">مشاركة</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-2 space-y-5">
        
        {/* 2. Hero Profile Card (بطاقة الملف الشخصي الرئيسية) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden relative">
          
          {/* خلفية جمالية علوية ناعمة */}
          <div className="h-28 bg-gradient-to-l from-emerald-800 via-teal-800 to-emerald-900 relative">
            {profile.isPremium && (
              <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                عضو متميز
              </div>
            )}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              {profile.isOnline && (
                <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  متصل الآن
                </span>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center -mt-14 space-y-3.5">
            {/* الصورة الشخصية أو حالة الخصوصية */}
            <div className="relative">
              {isPhotoLocked ? (
                <div className="w-28 h-28 rounded-full bg-slate-100 border-4 border-white shadow-md flex flex-col items-center justify-center text-slate-500">
                  <Lock className="w-8 h-8 text-emerald-700 mb-1" />
                  <span className="text-[10px] font-bold text-slate-600">صورة خاصة</span>
                </div>
              ) : (
                <img 
                  src={getAvatarUrl(profile, undefined, isPhotoLocked)} 
                  alt={profile.name} 
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md bg-white"
                  referrerPolicy="no-referrer"
                />
              )}
              {profile.isVerified && (
                <div className="absolute bottom-1 right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-sm" title="عضو موثق رسمياً">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* تنبيه خصوصية الصورة إن كانت مقفلة */}
            {isPhotoLocked && (
              <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50/80 border border-emerald-200/60 px-3.5 py-1.5 rounded-xl max-w-md">
                {profile.photoPrivacy === "hidden" 
                  ? "🔒 هذا العضو يفضل عدم إظهار صورته الشخصية حرصاً على الخصوصية." 
                  : "🔒 هذا العضو جعل صورته مرئية حصرياً لمن يتبادل معهم قبول الاهتمام."}
              </div>
            )}

            {/* الاسم والعضوية وتاريخ الانضمام */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                <span>{profile.name}</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                عضوية رقم: {profile.memberNumber} • انضم: {profile.joinDate}
              </p>
              
              {/* شارات التحقق والموثوقية المتعددة */}
              <div className="flex justify-center pt-1">
                <TrustVerificationBadges user={profile} variant="chips" />
              </div>
            </div>

            {/* بطاقات المؤشرات الأساسية السريعة (Quick Highlights) */}
            <div className="flex flex-wrap justify-center items-center gap-2 pt-1 max-w-lg">
              {compatibilityScore !== null && (
                <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs px-3.5 py-1 rounded-full font-black shadow-2xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-white" />
                  نسبة التوافق {compatibilityScore}%
                </span>
              )}
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs px-3 py-1 rounded-full font-bold">
                {profile.religiousCommitment}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full font-semibold">
                {profile.age} سنة • {profile.maritalStatus}
              </span>
              <span className="bg-teal-50 text-teal-800 border border-teal-200/60 text-xs px-3 py-1 rounded-full font-medium">
                {profile.residence} ({profile.nationality})
              </span>
            </div>
          </div>
        </div>

        {/* 3. Action Hub (مركز الأزرار والإجراءات المنسق جنباً إلى جنب) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              إجراءات التفاعل مع الملف
            </span>
            <span className="text-[11px] text-slate-400">تواصل شرعي وقور يحفظ الكرامة</span>
          </div>

          {/* الصف الأول: الإجراءات الأساسية الكبرى جنباً إلى جنب */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* زر إبداء الاهتمام الأساسي */}
            <button 
              onClick={handleInterest}
              disabled={isInterested}
              className={`w-full py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer ${
                isInterested 
                  ? "bg-pink-50 border-2 border-pink-200 text-pink-700 cursor-default" 
                  : "bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white hover:shadow-md active:scale-[0.99]"
              }`}
            >
              <Heart className={`w-5 h-5 ${isInterested ? "fill-pink-600 text-pink-600" : "fill-white"}`} />
              <span>{isInterested ? "تم إبداء اهتمامك بالعضو ✓" : "إبداء الاهتمام بالعضو"}</span>
            </button>

            {/* زر بدء المحادثة المباشرة */}
            <button 
              onClick={handleMessageClick}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 transition shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              <span>محادثة فورية هادفة</span>
              {!currentUser?.isPremium && (
                <Lock className="w-3.5 h-3.5 text-emerald-200 mr-1" />
              )}
            </button>
          </div>

          {/* الصف الثاني: الأزرار المساعدة جنباً إلى جنب بتنسيق متوازن */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* زر حفظ الملف */}
            <button 
              onClick={handleToggleBookmark}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isSaved 
                  ? "bg-amber-50 border-amber-300 text-amber-700 shadow-2xs" 
                  : "bg-slate-50/80 border-slate-200 hover:bg-white text-slate-700"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500 text-amber-500" : "text-slate-500"}`} />
              <span>{isSaved ? "محفوظ بالمفضلة" : "حفظ الملف"}</span>
            </button>

            {/* زر اعتذار راقٍ ومحترم */}
            <button 
              onClick={() => setShowApologyModal(true)}
              className="py-2.5 px-3 rounded-xl border border-rose-200/80 bg-rose-50/50 hover:bg-rose-100/70 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="إنهاء التواصل بأدب بدون إحراج"
            >
              <Smile className="w-4 h-4 text-rose-600" />
              <span>اعتذار راقٍ</span>
            </button>

            {/* زر تجاهل العضو */}
            <button 
              onClick={handleIgnore}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="إخفاء الملف من نتائج البحث"
            >
              <EyeOff className="w-4 h-4 text-slate-500" />
              <span>تجاهل وإخفاء</span>
            </button>
          </div>
        </div>

        {/* 4. تنبيه وصول اهتمام متبادل إن وجد */}
        {hasReceivedInterest && !hasAcceptedInterest && (
          <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-3xl p-4.5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-1 text-center sm:text-right">
              <h4 className="font-black text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <Heart className="w-4 h-4 fill-white" />
                <span>أبدى هذا العضو اهتمامه بملفك الشخصي!</span>
              </h4>
              <p className="text-xs text-pink-100">قبولك للاهتمام يتيح لكما بدء المحادثة ورؤية الصورة الشخصية فوراً.</p>
            </div>
            <button
              onClick={handleAcceptInterest}
              className="px-5 py-2.5 bg-white text-rose-600 rounded-xl text-xs font-black hover:bg-pink-50 transition flex items-center gap-1.5 flex-shrink-0 shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>قبول الاهتمام الآن</span>
            </button>
          </div>
        )}

        {/* 5. بانر مسار رحلة الزواج */}
        {(hasAcceptedInterest || isInterested) && (
          <div className="bg-gradient-to-l from-emerald-800 to-teal-800 rounded-3xl p-4.5 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-1 text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-black text-emerald-200">
                <Sparkles className="w-4 h-4 fill-emerald-300" />
                <span>رحلة زواج هادفة بدل محادثات لا تنتهي</span>
              </div>
              <p className="text-xs text-white/90 font-medium">
                مسار تعارف شرعي منظم ينتهي بالرؤية الشرعية وإشراك الأهل وفق الضوابط.
              </p>
            </div>
            <button
              onClick={() => handleOpenChatScreen(profile.id)}
              className="px-4 py-2 bg-white text-emerald-800 rounded-xl text-xs font-black hover:bg-emerald-50 transition flex items-center gap-1 flex-shrink-0 shadow-xs cursor-pointer"
            >
              <span>متابعة المسار</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 6. شهادة أكاديمية الاستعداد للزواج (إن كان حاصلاً عليها) */}
        {profile.isMarriageCertified && (
          <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 rounded-3xl p-4.5 text-slate-950 shadow-sm flex items-center justify-between gap-3 border border-amber-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-6 h-6 fill-amber-300" />
              </div>
              <div className="space-y-0.5 text-right">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-sm text-slate-950">
                    مؤهل للزواج وواعٍ بالمسؤولية 🎓
                  </h4>
                  <span className="text-[10px] bg-slate-950 text-amber-300 font-black px-2 py-0.5 rounded-full">
                    معتمد
                  </span>
                </div>
                <p className="text-xs text-slate-900 font-medium leading-relaxed">
                  اجتاز صاحب هذا الملف دورة واختبار أكاديمية الاستعداد للزواج (بدرجة {profile.marriageExamScore || 100}%) تأكيداً على نضجه ووعيه بالحقوق الأسرية وحسن المعاشرة.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 7. تفاصيل الثقة والتحقق الشاملة */}
        <TrustVerificationBadges user={profile} variant="detailed" />

        {/* 8. شريط التبويبات والتصفح السريع لتسهيل القراءة وتحديد الخيارات */}
        <div className="sticky top-2 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-1.5 shadow-sm">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                    isActive 
                      ? "bg-emerald-700 text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 9. الأقسام التفصيلية للملف الشخصي مع سهولة القراءة والتنقل */}

        {/* القسم الأول: نبذة عن النفس ومواصفات شريك العمر */}
        {(activeTab === "all" || activeTab === "about") && (
          <div className="space-y-4">
            {/* نبذة عن النفس */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-r-4 border-emerald-600 pr-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-800 text-sm">تحدث عن نفسي بوضوح وصدق</h3>
              </div>
              <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50">
                <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                  "{profile.aboutMe}"
                </p>
              </div>
            </div>

            {/* مواصفات الشريك */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-r-4 border-teal-600 pr-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-800 text-sm">المواصفات المنشودة في شريك الحياة</h3>
              </div>
              <div className="bg-teal-50/30 p-4 rounded-2xl border border-teal-100/50">
                <p className="text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                  "{profile.partnerSpecs}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* القسم الثاني: البيانات الشخصية والاجتماعية والبدنية والعمل */}
        {(activeTab === "all" || activeTab === "personal") && (
          <div className="space-y-4">
            
            {/* البيانات الشخصية والاجتماعية */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-r-4 border-blue-600 pr-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-800 text-sm">البيانات الشخصية والاجتماعية</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">العمر الحقيقي</span>
                  <span className="font-black text-sm text-slate-800">{profile.age} سنة</span>
                </div>

                <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">الجنسية</span>
                  <span className="font-black text-sm text-slate-800">{profile.nationality}</span>
                </div>

                <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">الإقامة الحالية</span>
                  <span className="font-black text-sm text-slate-800">{profile.residence}</span>
                </div>

                <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">الحالة الاجتماعية</span>
                  <span className="font-black text-sm text-slate-800">{profile.maritalStatus}</span>
                </div>

                <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">الأطفال</span>
                  <span className="font-black text-sm text-slate-800">
                    {profile.hasChildren ? `نعم (${profile.childrenCount} أطفال)` : "لا يوجد"}
                  </span>
                </div>

                <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">التدخين</span>
                  <span className={`text-xs font-black inline-block px-2 py-0.5 rounded-md ${
                    profile.isSmoker ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {profile.isSmoker ? "مدخن" : "غير مدخن مطلقاً"}
                  </span>
                </div>
              </div>
            </div>

            {/* المواصفات البدنية والصحية */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-r-4 border-slate-600 pr-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-800 text-sm">المواصفات الجسمانية والصحية</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">الطول</span>
                  <span className="font-black text-sm text-slate-800 font-mono">{profile.height} سم</span>
                </div>

                <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">الوزن</span>
                  <span className="font-black text-sm text-slate-800 font-mono">{profile.weight} كجم</span>
                </div>

                <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">لون البشرة</span>
                  <span className="font-black text-sm text-slate-800">{profile.skinColor}</span>
                </div>

                <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-150">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">بنية الجسم</span>
                  <span className="font-black text-sm text-slate-800">{profile.bodyBuild}</span>
                </div>

                <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150 col-span-2 sm:col-span-4">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">الحالة الصحية العامة</span>
                  <span className="font-black text-sm text-slate-800">{profile.healthStatus}</span>
                  {profile.hasDisability && (
                    <p className="text-xs text-rose-600 font-semibold mt-1 bg-rose-50 p-2 rounded-xl">
                      ملاحظة صحية: {profile.chronicDiseases}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* بيانات العمل والتعليم والدخل */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-r-4 border-indigo-600 pr-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-800 text-sm">العمل والمؤهل الدراسي ومستوى الدخل</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">المهنة / الوظيفة</span>
                  <span className="font-black text-sm text-slate-800">{profile.profession}</span>
                </div>

                <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">المؤهل الدراسي</span>
                  <span className="font-black text-sm text-slate-800">{profile.education}</span>
                </div>

                <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150">
                  <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">مستوى الدخل الشهري</span>
                  <span className="font-black text-sm text-slate-800">{profile.income}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* القسم الثالث: بيانات التدين والصلوات والزي الشرعي */}
        {(activeTab === "all" || activeTab === "religion") && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-r-4 border-emerald-600 pr-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-800 text-sm">
                {profile.religion === "مسيحي" ? "البيانات الروحية والكنسية" : "بيانات التدين والصلوات والزي"}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150">
                <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">الديانة</span>
                <span className="font-black text-sm text-slate-800">{profile.religion || "مسلم"}</span>
              </div>

              {profile.religion === "مسيحي" ? (
                <>
                  <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150">
                    <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">المذهب / الطائفة</span>
                    <span className="font-black text-sm text-slate-800">{profile.christianDenomination || "أرثوذكسي"}</span>
                  </div>

                  <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150">
                    <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">الالتزام الروحي والكنسي</span>
                    <span className="font-black text-sm text-slate-800">{profile.religiousCommitment}</span>
                  </div>

                  <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150">
                    <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">القداسات والتناول والصلوات</span>
                    <span className="font-black text-sm text-slate-800">{profile.prayers}</span>
                  </div>

                  {profile.churchAttendance && (
                    <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150 sm:col-span-2">
                      <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">الخدمة والأنشطة الكنسية</span>
                      <span className="font-black text-sm text-slate-800">{profile.churchAttendance}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150">
                    <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">درجة الالتزام الديني</span>
                    <span className="font-black text-sm text-emerald-800">{profile.religiousCommitment}</span>
                  </div>

                  <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150">
                    <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">المحافظة على الصلوات</span>
                    <span className="font-black text-sm text-slate-800">{profile.prayers}</span>
                  </div>

                  <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150">
                    <span className="text-[11px] text-slate-400 block font-semibold mb-0.5">
                      {profile.gender === Gender.MALE ? "اللحية" : "نوع الحجاب الشرعي"}
                    </span>
                    <span className="font-black text-sm text-slate-800">
                      {profile.gender === Gender.MALE 
                        ? (profile.hasBeard ? "نعم (ملتحي)" : "لا يوجد")
                        : (profile.hijabType || HijabType.HIJAB)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* القسم الرابع: شروط الزواج والاتفاقات المادية */}
        {(activeTab === "all" || activeTab === "marriage") && (
          <div className="bg-white rounded-3xl border border-amber-200/90 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-r-4 border-amber-500 pr-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">رؤيته في الاتفاقات المادية وشروط الزواج</h3>
                <span className="text-[11px] text-slate-400">الوضوح المسبق يمنع الخلافات مستقبلاً</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-amber-50/40 p-3.5 rounded-2xl border border-amber-100">
                <span className="text-[11px] text-amber-800 block font-bold mb-1">قائمة المنقولات (القايمة)</span>
                <span className="font-black text-sm text-slate-800">{profile.qaImaStance}</span>
              </div>

              <div className="bg-amber-50/40 p-3.5 rounded-2xl border border-amber-100">
                <span className="text-[11px] text-amber-800 block font-bold mb-1">المهر والشبكة</span>
                <span className="font-black text-sm text-slate-800">{profile.mahrOpinion}</span>
              </div>

              <div className="bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100">
                <span className="text-[11px] text-emerald-800 block font-bold mb-1">الجاهزية والاستعداد للزواج</span>
                <span className="font-black text-sm text-emerald-900">{profile.marriageReadiness || "مستعد تماماً وجاهز من كافة الجوانب"}</span>
              </div>

              <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150">
                <span className="text-[11px] text-slate-500 block font-bold mb-1">الإطار الزمني المناسب للزواج</span>
                <span className="font-black text-sm text-slate-800">{profile.marriageTimeframe}</span>
              </div>

              <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-150 sm:col-span-2">
                <span className="text-[11px] text-slate-500 block font-bold mb-1">الموقف من الرؤية الشرعية ولقاء الأهل</span>
                <span className="font-black text-sm text-slate-800">{profile.shariaVisionStance}</span>
              </div>
            </div>
          </div>
        )}

        {/* القسم الخامس: استبيان التوافق والخطوط الحمراء */}
        {(activeTab === "all" || activeTab === "survey") && targetSurvey && targetSurvey.isPublicInProfile && (
          <div className="bg-white rounded-3xl border border-rose-200/90 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-r-4 border-rose-500 pr-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <Flame className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">
                  استبيان التوافق والخطوط الحمراء للشريك
                </h3>
                <span className="text-[11px] text-slate-400">نقاط الاتفاق والحدود الواضحة للشخصية</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {targetSurvey.leisureStyle && (
                <div className="bg-rose-50/40 p-3.5 rounded-2xl border border-rose-100">
                  <span className="text-[11px] text-rose-700 block font-bold mb-0.5">نمط قضاء الإجازة</span>
                  <span className="font-black text-slate-800 text-xs sm:text-sm">{targetSurvey.leisureStyle}</span>
                </div>
              )}
              {targetSurvey.conflictStyle && (
                <div className="bg-amber-50/40 p-3.5 rounded-2xl border border-amber-100">
                  <span className="text-[11px] text-amber-700 block font-bold mb-0.5">التعامل مع الخلافات</span>
                  <span className="font-black text-slate-800 text-xs sm:text-sm">{targetSurvey.conflictStyle}</span>
                </div>
              )}
              {targetSurvey.financialView && (
                <div className="bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100">
                  <span className="text-[11px] text-emerald-700 block font-bold mb-0.5">الرؤية المالية للبيت</span>
                  <span className="font-black text-slate-800 text-xs sm:text-sm">{targetSurvey.financialView}</span>
                </div>
              )}
              {targetSurvey.privacyBoundary && (
                <div className="bg-purple-50/40 p-3.5 rounded-2xl border border-purple-100">
                  <span className="text-[11px] text-purple-700 block font-bold mb-0.5">الخصوصية وحدود الأهل</span>
                  <span className="font-black text-slate-800 text-xs sm:text-sm">{targetSurvey.privacyBoundary}</span>
                </div>
              )}
              {targetSurvey.lifePriority && (
                <div className="bg-blue-50/40 p-3.5 rounded-2xl border border-blue-100 sm:col-span-2">
                  <span className="text-[11px] text-blue-700 block font-bold mb-0.5">الهدف والأولوية الكبرى في الزواج</span>
                  <span className="font-black text-slate-800 text-xs sm:text-sm">{targetSurvey.lifePriority}</span>
                </div>
              )}
            </div>

            {/* الخطوط الحمراء */}
            {targetSurvey.redFlags && targetSurvey.redFlags.length > 0 && (
              <div className="pt-3 border-t border-rose-100 space-y-2">
                <span className="text-xs font-black text-rose-800 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-600" />
                  خطوط حمراء يرفضها العضو تماماً (Red Flags):
                </span>
                <div className="flex flex-wrap gap-2">
                  {targetSurvey.redFlags.map((flag: string) => (
                    <span
                      key={flag}
                      className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-900 font-black text-xs border border-rose-200/80 shadow-2xs"
                    >
                      ⛔ {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* نقاط المرونة */}
            {targetSurvey.flexiblePoints && targetSurvey.flexiblePoints.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  نقاط يتقبل فيها العضو المرونة والتفاهم:
                </span>
                <div className="flex flex-wrap gap-2">
                  {targetSurvey.flexiblePoints.map((pt: string) => (
                    <span
                      key={pt}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs"
                    >
                      ✓ {pt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* الهوايات والاهتمامات */}
        {(activeTab === "all" || activeTab === "about") && profile.hobbies && profile.hobbies.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
            <h4 className="font-black text-slate-800 text-sm border-r-4 border-slate-600 pr-2">
              الهوايات والاهتمامات الشخصية
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {profile.hobbies.map(hobby => (
                <span 
                  key={hobby}
                  className="bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-200/60 shadow-2xs"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 10. صندوق السلامة والأمان (حظر وبلاغ) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-center sm:text-right">
            <Shield className="w-4 h-4 text-slate-400 shrink-0" />
            <span>حرصاً على بيئة آمنة، يمكنك حظر أي عضو مسيء أو تقديم بلاغ سري للإدارة.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={handleBlock}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>حظر العضو</span>
            </button>

            <button 
              onClick={() => setShowReportModal(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-amber-600 hover:bg-amber-50 border border-amber-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>إبلاغ عن مخالفة</span>
            </button>
          </div>
        </div>

      </div>

      {/* 11. شريط الإجراءات العائم السريع أسفل الشاشة للتصفح السهل (Floating Action Dock) */}
      <div className="fixed bottom-3 inset-x-0 z-40 max-w-xl mx-auto px-4 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md text-white rounded-2xl p-2.5 shadow-2xl border border-white/10 flex items-center justify-between gap-2 pointer-events-auto">
          {/* معلومات مصغرة عن العضو */}
          <div className="flex items-center gap-2 min-w-0 pr-1">
            <img 
              src={getAvatarUrl(profile, undefined, isPhotoLocked)} 
              alt={profile.name} 
              className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <span className="font-black text-xs text-white block truncate">{profile.name}</span>
              <span className="text-[10px] text-slate-400 block font-mono">{profile.age} سنة • {profile.residence}</span>
            </div>
          </div>

          {/* الأزرار السريعة جنباً إلى جنب */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInterest}
              disabled={isInterested}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition ${
                isInterested 
                  ? "bg-pink-900/50 text-pink-300 border border-pink-700/50 cursor-default" 
                  : "bg-rose-600 hover:bg-rose-500 text-white shadow-xs"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isInterested ? "fill-pink-400 text-pink-400" : "fill-white"}`} />
              <span className="hidden sm:inline">{isInterested ? "مهتم به" : "اهتمام"}</span>
            </button>

            <button
              onClick={handleMessageClick}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">محادثة</span>
            </button>

            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl border transition ${
                isSaved ? "bg-amber-400/20 border-amber-400 text-amber-300" : "bg-white/10 border-white/15 text-white hover:bg-white/20"
              }`}
              title="حفظ الملف"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>

            <button
              onClick={() => setShowApologyModal(true)}
              className="p-2 rounded-xl bg-white/10 border border-white/15 text-rose-300 hover:bg-rose-950/40 transition"
              title="اعتذار راقٍ"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 12. Abuse Report Modal (نافذة تقديم البلاغ) */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 space-y-4 shadow-2xl">
            <div className="text-center space-y-1">
              <h3 className="font-black text-slate-800 text-base">إرسال بلاغ عن إساءة استخدام</h3>
              <p className="text-xs text-slate-500 leading-relaxed">نتخذ إجراءات صارمة وحظراً فورياً لغير الجادين لضمان بيئة آمنة ووقورة.</p>
            </div>

            <form onSubmit={handleReport} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">سبب البلاغ بالتفصيل</label>
                <textarea 
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows={3}
                  placeholder="يرجى توضيح السلوك المخالف بالتفصيل (مثل: عدم الجدية، طلب التواصل خارج الضوابط، عدم صحة البيانات، إلخ)"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition shadow-sm"
                >
                  إرسال البلاغ فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 13. Premium Membership Blocker Modal (نافذة تنبيه اشتراك التميز) */}
      {showPremiumBlocker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 text-center space-y-4 shadow-2xl relative">
            <div className="p-3 bg-amber-50 text-amber-500 w-fit rounded-full mx-auto animate-bounce">
              <Lock className="w-8 h-8 fill-amber-100" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-slate-800 text-base flex items-center justify-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                المحادثات مخصصة للأعضاء المتميزين
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                حفاظاً على مستوى الجدية وتجنباً للعشوائية في التواصل، فإن تفعيل المحادثات وقراءة الرسائل وطلب الرؤية الشرعية متاح حصرياً لمشتركي <span className="font-black text-amber-600">باقة التميز</span>.
              </p>
            </div>

            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 text-right space-y-2">
              <h4 className="text-xs font-black text-amber-900">مميزات اشتراك التميز:</h4>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside leading-relaxed">
                <li>إرسال رسائل ومحادثات غير محدودة للشركاء.</li>
                <li>رفع صورة شخصية حقيقية يراها المقبولون فقط.</li>
                <li>شارة التميز الذهبية على ملفك لزيادة الجدية والمصداقية.</li>
                <li>تصفح الملفات خفية دون الكشف عن هويتك.</li>
              </ul>
            </div>

            <div className="flex gap-2.5 pt-2">
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
                className="w-2/3 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black transition shadow-sm"
              >
                الاشتراك في باقة التميز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 14. Polite Apology Modal (إنهاء التعارف بأدب ووقار) */}
      {showApologyModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-slate-900 text-sm">اعتذار راقٍ وإنهاء مسار التعارف</h3>
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

            {/* ميثاق الحماية والضمانات */}
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-950 space-y-1 leading-snug">
              <span className="font-black flex items-center gap-1.5 text-emerald-800 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ضمانات وقواعد التطبيق لإنهاء التعارف بكرامة:</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-emerald-900/90 pr-1">
                <li><strong>توقف التواصل فوراً:</strong> يتم إغلاق صندوق المحادثة تلقائياً لمنع أي عتاب.</li>
                <li><strong>حظر الانتقام والتقييمات الكيدية:</strong> يُمنع الطرفان من تقديم أي تقييم مسيء.</li>
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
                  <p className="text-xs text-slate-600 leading-relaxed pr-6">
                    "{tmpl.content}"
                  </p>
                </label>
              ))}
            </div>

            {/* رسالة اعتذار مخصصة */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">أو اكتب رسالة اعتذار مخصصة مهذبة:</span>
              <textarea
                value={customApologyText}
                onChange={(e) => setCustomApologyText(e.target.value)}
                rows={2}
                placeholder="اكتب كلماتك الطيبة هنا..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                disabled={isSendingApology}
                onClick={() => void handleConfirmApology()}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isSendingApology ? "جاري الإرسال..." : "إرسال الاعتذار وإنهاء المسار"}
              </button>
              <button
                type="button"
                onClick={() => setShowApologyModal(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer"
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
