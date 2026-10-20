import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimationControls, type PanInfo } from "motion/react";
import { UserProfile } from "../../types";
import { useApp } from "../../lib/store";
import { useUIStore } from "../../stores/uiStore";
import {
  User,
  MapPin,
  Sparkles,
  Heart,
  MessageCircle,
  EyeOff,
  Flag,
  AlertTriangle,
  X,
  ChevronRight,
} from "lucide-react";
import { getAvatarUrl } from "../../lib/avatarUtils";
import { TrustVerificationBadges } from "../TrustVerificationBadges";

interface SearchProfileCardProps {
  profile: UserProfile;
  onClick: () => void;
  onIgnore?: (profileId: string) => void;
}

const REPORT_REASONS = [
  "حساب غير جاد أو للتسلية",
  "بيانات غير صحيحة أو صورة مضللة",
  "طلب أموال أو تحايل مالي",
  "سلوك غير لائق أو رسائل مسيئة",
  "سبب آخر...",
];

const DRAWER_WIDTH = 270;

export const SearchProfileCard: React.FC<SearchProfileCardProps> = ({
  profile,
  onClick,
  onIgnore,
}) => {
  const navigate = useNavigate();
  const { currentUser, interactions, expressInterest, ignoreProfile, reportProfile } = useApp();
  const { addToast } = useUIStore();

  const controls = useAnimationControls();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Interest & Actions state
  const isAlreadyInterested = interactions.some(
    (i) => i.fromUserId === currentUser?.id && i.toUserId === profile.id && i.type === "interest"
  );
  const [isInterested, setIsInterested] = useState(isAlreadyInterested);
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);
  const [isIgnoring, setIsIgnoring] = useState(false);

  // Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    setIsInterested(isAlreadyInterested);
  }, [isAlreadyInterested]);

  const openDrawer = () => {
    controls.start({ x: DRAWER_WIDTH, transition: { type: "spring", stiffness: 450, damping: 32 } });
    setIsOpen(true);
  };

  const closeDrawer = () => {
    controls.start({ x: 0, transition: { type: "spring", stiffness: 450, damping: 32 } });
    setIsOpen(false);
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isOpen) {
      if (info.offset.x < -35 || info.velocity.x < -200) {
        closeDrawer();
      } else {
        openDrawer();
      }
    } else {
      if (info.offset.x > 50 || (info.velocity.x > 200 && info.offset.x > 15)) {
        openDrawer();
      } else {
        closeDrawer();
      }
    }
    setTimeout(() => setIsDragging(false), 120);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    if (isOpen) {
      e.stopPropagation();
      closeDrawer();
      return;
    }
    onClick();
  };

  const handleInterestClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSubmittingInterest) return;
    setIsSubmittingInterest(true);
    try {
      const res = await expressInterest(profile.id);
      if (res.ok) {
        setIsInterested(true);
        addToast(`تم إرسال إبداء الاهتمام بـ ${profile.name} بنجاح ✨`, "success");
      } else {
        addToast(res.error || "تعذر إرسال الاهتمام حالياً", "error");
      }
    } catch {
      addToast("تعذر إرسال الاهتمام", "error");
    } finally {
      setIsSubmittingInterest(false);
      closeDrawer();
    }
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeDrawer();
    navigate(`/inbox/${profile.id}`);
  };

  const handleIgnoreClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isIgnoring) return;
    setIsIgnoring(true);
    try {
      await ignoreProfile(profile.id);
      addToast(`تم إضافة ${profile.name} إلى قائمة التجاهل`, "info");
      closeDrawer();
      if (onIgnore) {
        onIgnore(profile.id);
      }
    } catch {
      addToast("تعذر تجاهل الملف الشخصي", "error");
    } finally {
      setIsIgnoring(false);
    }
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeDrawer();
    setShowReportModal(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === "سبب آخر..." ? customReason.trim() : selectedReason;
    if (!finalReason) {
      addToast("يرجى كتابة أو تحديد سبب الإبلاغ", "error");
      return;
    }

    setIsSubmittingReport(true);
    try {
      const res = await reportProfile(profile.id, finalReason);
      if (res.ok) {
        addToast("تم تقديم البلاغ للتحقق والمراجعة العاجلة من إدارة التطبيق.", "success");
        setShowReportModal(false);
        setSelectedReason(REPORT_REASONS[0]);
        setCustomReason("");
      } else {
        addToast(res.error || "فشل تقديم البلاغ", "error");
      }
    } catch {
      addToast("حدث خطأ أثناء إرسال البلاغ", "error");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden select-none" dir="rtl">
      {/* Background Action Bar (Revealed when card is swiped Left-to-Right) */}
      <div
        className="absolute inset-y-0 left-0 w-[270px] bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 rounded-2xl flex items-center justify-around px-3 z-0 shadow-inner"
        aria-label="إجراءات سريعة"
      >
        {/* 1. اهتمام */}
        <button
          type="button"
          onClick={handleInterestClick}
          disabled={isSubmittingInterest}
          className={`flex flex-col items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl transition cursor-pointer ${
            isInterested
              ? "text-rose-400 bg-rose-500/15"
              : "text-rose-300 hover:text-white hover:bg-rose-500/20 active:scale-95"
          }`}
          title="إبداء اهتمام"
        >
          <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xs">
            <Heart className={`w-5 h-5 ${isInterested ? "fill-rose-500 text-rose-500" : "text-rose-400"}`} />
          </div>
          <span className="text-[11px] font-bold">{isInterested ? "مهتم به" : "اهتمام"}</span>
        </button>

        {/* 2. مراسلة */}
        <button
          type="button"
          onClick={handleMessageClick}
          className="flex flex-col items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-sky-300 hover:text-white hover:bg-sky-500/20 active:scale-95 transition cursor-pointer"
          title="مراسلة"
        >
          <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-xs">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold">مراسلة</span>
        </button>

        {/* 3. تجاهل */}
        <button
          type="button"
          onClick={handleIgnoreClick}
          disabled={isIgnoring}
          className="flex flex-col items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-amber-300 hover:text-white hover:bg-amber-500/20 active:scale-95 transition cursor-pointer"
          title="تجاهل"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xs">
            <EyeOff className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold">تجاهل</span>
        </button>

        {/* 4. ابلاغ */}
        <button
          type="button"
          onClick={handleReportClick}
          className="flex flex-col items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-red-300 hover:text-white hover:bg-red-500/20 active:scale-95 transition cursor-pointer"
          title="ابلاغ"
        >
          <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-xs">
            <Flag className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold">ابلاغ</span>
        </button>
      </div>

      {/* Front Draggable Card */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: DRAWER_WIDTH }}
        dragElastic={{ left: 0.05, right: 0.15 }}
        animate={controls}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onClick={handleCardClick}
        className="relative z-10 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition cursor-pointer flex gap-4 overflow-hidden group text-right touch-pan-y"
        dir="rtl"
      >
        {profile.isPremium && (
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-bl-xl shadow-xs flex items-center gap-1 z-20">
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>تميز</span>
          </div>
        )}

        {/* Swipe Hint indicator button on card */}
        {isOpen && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              closeDrawer();
            }}
            className="absolute top-2 left-2 bg-slate-900/80 text-white p-1 rounded-full text-[10px] flex items-center gap-1 px-2 z-20 shadow-sm cursor-pointer hover:bg-slate-900 transition"
          >
            <span>إغلاق</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        )}

        <img
          src={getAvatarUrl(profile, undefined, profile.photoPrivacy !== "public")}
          alt={profile.name}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition duration-200 flex-shrink-0"
          referrerPolicy="no-referrer"
        />

        <div className="flex-1 space-y-2 min-w-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-extrabold text-slate-800 text-sm sm:text-base leading-tight truncate">
                {profile.name}
              </h4>
              <TrustVerificationBadges user={profile} variant="compact" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">عضوية: {profile.memberNumber}</p>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile.age} سنة • {profile.maritalStatus}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{profile.nationality} • يقيم في: {profile.residence}</span>
            </span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            "{profile.aboutMe}"
          </p>

          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg">
                {profile.religiousCommitment}
              </span>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">
                {profile.profession}
              </span>
            </div>

            {/* Quick swipe hint indicator */}
            <span className="text-[9px] text-slate-400 font-medium hidden sm:inline-block">
              ← اسحب للخيارات
            </span>
          </div>
        </div>
      </motion.div>

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          dir="rtl"
          onClick={(e) => {
            e.stopPropagation();
            setShowReportModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-100 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>إبلاغ عن مخالفة</span>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              تقديم بلاغ بخصوص الملف التعريفي لـ <strong className="text-slate-800 font-extrabold">{profile.name}</strong>. نرجو اختيار السبب بدقة لحماية بيئة التعارف الجادة:
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                      selectedReason === r
                        ? "border-rose-500 bg-rose-50/60 text-rose-800 shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`report-reason-${profile.id}`}
                      value={r}
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="text-rose-600 focus:ring-rose-500 h-4 w-4"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              {selectedReason === "سبب آخر..." && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">تفاصيل البلاغ</label>
                  <textarea
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="يرجى كتابة تفاصيل المخالفة بوضوح..."
                    rows={3}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-slate-800"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="flex-[2] py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/10 cursor-pointer"
                >
                  {isSubmittingReport ? "جاري الإرسال..." : "إرسال البلاغ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
