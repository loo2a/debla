import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { UserProfile, Gender } from "../types";
import { getAvatarUrl } from "../lib/avatarUtils";
import { getRecommendedCandidates, RecommendedCandidate } from "../lib/compatibility";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { 
  Heart, X, Sparkles, Shield, User, MapPin, 
  Briefcase, GraduationCap, Eye, ArrowRight, 
  RotateCcw, CheckCircle2, Lock, Flame
} from "lucide-react";
import { TrustVerificationBadges } from "./TrustVerificationBadges";

interface CandidateSwipeCardsProps {
  onOpenProfile?: (userId: string) => void;
}

export const CandidateSwipeCards: React.FC<CandidateSwipeCardsProps> = ({ onOpenProfile }) => {
  const { currentUser, profiles, interactions, expressInterest, ignoreProfile, sendMessage, mySurvey, allSurveys } = useApp();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  if (!currentUser) return null;

  // اليوم الحالي لتحديد الحد اليومي (5 للمجاني، 20 للمميز)
  const todayKey = useMemo(() => {
    return `mawada_swipes_${currentUser.id}_${new Date().toISOString().slice(0, 10)}`;
  }, [currentUser.id]);

  // استرجاع السجلات المسحوبة اليوم من التخزين المحلي
  const [swipedTodayIds, setSwipedTodayIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // مزامنة التخزين المحلي عند تغيير المسحوبين
  const recordSwipe = (id: string) => {
    setSwipedTodayIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem(todayKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // الحد الأقصى للمرشحين حسب نوع الحساب
  const maxCandidatesLimit = currentUser.isPremium ? 20 : 5;

  // قائمة المرشحين المحسوبة
  const recommendedList = useMemo(() => {
    return getRecommendedCandidates(currentUser, profiles, interactions, swipedTodayIds, mySurvey, allSurveys);
  }, [currentUser, profiles, interactions, swipedTodayIds, mySurvey, allSurveys]);

  // حالة بطاقة السحب الحالية
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Motion values للتحكم في الإزاحة وتأثير الختم
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacityStampYes = useTransform(x, [20, 100], [0, 1]);
  const opacityStampNo = useTransform(x, [-100, -20], [1, 0]);

  // المرشح الحالي في أعلى الكومة
  const currentCandidate = recommendedList[0];
  const totalSwipedCount = swipedTodayIds.length;
  const progressCurrent = Math.min(maxCandidatesLimit, totalSwipedCount + (currentCandidate ? 1 : 0));

  // معالجة السحب لليمين (نعم / مهتم)
  const handleSwipeYes = async () => {
    if (!currentCandidate || isProcessing) return;
    setIsProcessing(true);
    setSwipeDirection("right");

    const candidateProfile = currentCandidate.profile;
    recordSwipe(candidateProfile.id);

    try {
      // 1. تسجيل الاهتمام في قاعدة البيانات (يوضع تلقائياً في قائمة الاهتمامات)
      const res = await expressInterest(candidateProfile.id);

      // 2. إرسال رسالة تعارف واهتمام شرعية تلقائية للعضو
      const introMessage = `السلام عليكم ورحمة الله، اطلعت على مواصفاتك الكريمة عبر بطاقات التوافق السريع وأبدي اهتمامي بالتوافق الشرعي بيننا، نسأل الله أن يكتب لنا ولكم الخير والتوفيق.`;
      void sendMessage(candidateProfile.id, introMessage).catch(() => {});

      if (res.ok) {
        addToast(`تم إبداء اهتمامك بـ ${candidateProfile.name} وإضافته لقائمة اهتماماتك بنجاح!`, "success");
      } else {
        addToast(res.error || "تم تسجيل الاهتمام بنجاح", "info");
      }
    } catch {
      addToast("تم تسجيل الاهتمام وإضافته لقائمتك.", "success");
    } finally {
      setTimeout(() => {
        setSwipeDirection(null);
        x.set(0);
        setIsProcessing(false);
      }, 250);
    }
  };

  // معالجة السحب لليسار (لا / تجاوز)
  const handleSwipeNo = async () => {
    if (!currentCandidate || isProcessing) return;
    setIsProcessing(true);
    setSwipeDirection("left");

    const candidateProfile = currentCandidate.profile;
    recordSwipe(candidateProfile.id);

    try {
      await ignoreProfile(candidateProfile.id);
    } catch {}

    setTimeout(() => {
      setSwipeDirection(null);
      x.set(0);
      setIsProcessing(false);
    }, 250);
  };

  // الانتقال للملف الكامل
  const handleViewFullProfile = (userId: string) => {
    if (onOpenProfile) {
      onOpenProfile(userId);
    }
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
            <Flame className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <span>بطاقات التوافق السريع</span>
              <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Swipe Cards
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              اسحب يميناً (مهتم) أو يساراً (تجاوز) وفق شروطك الشرعية
            </p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="text-left space-y-0.5">
          <span className="text-[10px] font-bold text-slate-400 block font-mono">
            {progressCurrent} / {maxCandidatesLimit}
          </span>
          {currentUser.isPremium ? (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
              <Sparkles className="w-2.5 h-2.5 fill-amber-500" />
              تميز (20)
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              مجاني (5)
            </span>
          )}
        </div>
      </div>

      {/* Main Card Container */}
      <div className="relative min-h-[460px] flex items-center justify-center overflow-hidden py-2">
        {currentCandidate ? (
          <div className="relative w-full max-w-sm h-[440px]">
            {/* Background Deck Card Shadow effect */}
            {recommendedList.length > 1 && (
              <div 
                className="absolute inset-0 bg-white rounded-3xl border border-slate-200/60 shadow-md transform scale-[0.95] translate-y-3 opacity-60 pointer-events-none transition-all duration-300"
              />
            )}

            {/* Active Swipe Card */}
            <motion.div
              style={{ x, rotate }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.65}
              onDragEnd={(_, info) => {
                if (info.offset.x > 80 || info.velocity.x > 300) {
                  void handleSwipeYes();
                } else if (info.offset.x < -80 || info.velocity.x < -300) {
                  void handleSwipeNo();
                } else {
                  x.set(0);
                }
              }}
              animate={
                swipeDirection === "right"
                  ? { x: 400, opacity: 0, rotate: 20 }
                  : swipeDirection === "left"
                  ? { x: -400, opacity: 0, rotate: -20 }
                  : { x: 0, opacity: 1, rotate: 0 }
              }
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col justify-between cursor-grab active:cursor-grabbing select-none"
            >
              {/* Dynamic Overlay Stamps during Drag */}
              <motion.div
                style={{ opacity: opacityStampYes }}
                className="absolute top-6 right-6 z-30 pointer-events-none transform -rotate-12 bg-emerald-600 text-white font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-white shadow-lg flex items-center gap-1.5"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>مهتم (نعم)</span>
              </motion.div>

              <motion.div
                style={{ opacity: opacityStampNo }}
                className="absolute top-6 left-6 z-30 pointer-events-none transform rotate-12 bg-rose-600 text-white font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-white shadow-lg flex items-center gap-1.5"
              >
                <X className="w-4 h-4 stroke-[3]" />
                <span>تجاوز (لا)</span>
              </motion.div>

              {/* Card Header & Avatar Banner */}
              <div className="relative h-44 bg-gradient-to-b from-emerald-800 to-emerald-950 p-4 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-radial from-emerald-600/20 to-transparent pointer-events-none" />

                {/* Badges on Top */}
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-500/30 text-white text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/20">
                      {currentCandidate.profile.memberNumber}
                    </span>
                    <TrustVerificationBadges user={currentCandidate.profile} variant="compact" />
                  </div>

                  {/* Compatibility Badge */}
                  <div className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-amber-300">
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    <span>توافق {currentCandidate.compatibilityScore}%</span>
                  </div>
                </div>

                {/* Avatar Display */}
                <div className="flex items-center gap-3 relative z-10 pt-2">
                  <div className="relative">
                    <img
                      src={getAvatarUrl(
                        currentCandidate.profile,
                        undefined,
                        currentCandidate.profile.photoPrivacy !== "public"
                      )}
                      alt={currentCandidate.profile.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white/90 shadow-md bg-white"
                      referrerPolicy="no-referrer"
                    />
                    {currentCandidate.profile.photoPrivacy !== "public" && (
                      <span className="absolute -bottom-1 -left-1 bg-slate-900/90 text-amber-300 text-[8px] font-bold p-1 rounded-full border border-white/40">
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="text-white space-y-0.5">
                    <h4 className="font-extrabold text-base leading-tight">
                      {currentCandidate.profile.name}
                    </h4>
                    <p className="text-xs text-emerald-200 flex items-center gap-1 font-medium">
                      <span>{currentCandidate.profile.age} سنة</span>
                      <span>•</span>
                      <span>{currentCandidate.profile.maritalStatus}</span>
                      <span>•</span>
                      <span className="truncate max-w-[120px]">{currentCandidate.profile.nationality}</span>
                    </p>
                    <p className="text-[11px] text-emerald-300/90 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>يقيم في {currentCandidate.profile.residence}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-4 space-y-3 flex-1 overflow-y-auto text-xs text-slate-700">
                {/* Highlights Grid */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{currentCandidate.profile.profession || "غير محدد"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{currentCandidate.profile.education || "مؤهل عالي"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{currentCandidate.profile.religiousCommitment || "ملتزم"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{currentCandidate.profile.prayers || "محافظ على الصلاة"}</span>
                  </div>
                </div>

                {/* About Me snippet */}
                {currentCandidate.profile.aboutMe && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">نبذة من الملف:</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2 bg-emerald-50/30 p-2 rounded-xl border border-emerald-100/40">
                      "{currentCandidate.profile.aboutMe}"
                    </p>
                  </div>
                )}

                {/* Partner specs snippet */}
                {currentCandidate.profile.partnerSpecs && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block">المواصفات المطلوبة:</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2 bg-amber-50/30 p-2 rounded-xl border border-amber-100/40">
                      "{currentCandidate.profile.partnerSpecs}"
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Action Buttons */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-around gap-4">
                {/* No Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => void handleSwipeNo()}
                  className="w-13 h-13 rounded-full bg-white border border-rose-200 text-rose-600 shadow-md hover:bg-rose-50 hover:scale-105 active:scale-95 transition flex flex-col items-center justify-center cursor-pointer group"
                  aria-label="تجاوز هذا المرشح"
                  title="تجاوز (لا)"
                >
                  <X className="w-6 h-6 stroke-[2.5] group-hover:scale-110 transition" />
                  <span className="text-[8px] font-bold text-rose-500">تجاوز</span>
                </button>

                {/* Details Button */}
                <button
                  type="button"
                  onClick={() => handleViewFullProfile(currentCandidate.profile.id)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs hover:bg-slate-100 active:scale-95 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  title="عرض الملف كاملاً"
                >
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>الملف كاملاً</span>
                </button>

                {/* Yes Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => void handleSwipeYes()}
                  className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-600/30 hover:scale-105 active:scale-95 transition flex flex-col items-center justify-center cursor-pointer group"
                  aria-label="إبداء الاهتمام بالمرشح"
                  title="مهتم (نعم)"
                >
                  <Heart className="w-6 h-6 fill-white group-hover:scale-110 transition" />
                  <span className="text-[8px] font-bold text-emerald-100">مهتم</span>
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Completion State */
          <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-5 shadow-sm">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-7 h-7 text-emerald-600 fill-emerald-200" />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-slate-800 text-sm">
                {currentUser.isPremium
                  ? "اطلعت على جميع مرشحي التوافق اليوم (20 من 20) 🌟"
                  : "اكتملت ترشيحاتك اليومية (5 من 5) ✨"}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                {currentUser.isPremium
                  ? "أحسنت! استعرضت أفضل 20 عضواً متوافقاً معك اليوم. سيتم تحديث وتجديد القائمة فور انضمام مرشحين جدد."
                  : "لقد اطلعت على بطاقات التوافق الـ 5 المخصصة لحسابك اليوم وفق أفضل درجات التوافق الشرعي."}
              </p>
            </div>

            {/* Upsell for Free Users */}
            {!currentUser.isPremium && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200 rounded-2xl p-4 text-right space-y-2.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                  <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>ضاعف مرشحيك إلى 20 مع باقة التميز</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  احصل على 20 بطاقة توافق يومياً بدلاً من 5، بالإضافة لإمكانية المراسلة الفورية المباشرة ورؤية الصور المحمية.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/premium")}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs cursor-pointer text-center block"
                >
                  ترقية الحساب لباقة التميز الآن
                </button>
              </div>
            )}

            {/* Search More Button */}
            <div className="pt-1 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate("/search")}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>البحث والاستكشاف المتقدم</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {totalSwipedCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.removeItem(todayKey);
                    } catch {}
                    setSwipedTodayIds([]);
                    addToast("تمت إعادة تحميل بطاقات التوافق", "info");
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-600 py-1 flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة مراجعة بطاقات اليوم</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
