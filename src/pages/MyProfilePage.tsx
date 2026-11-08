import React, { useState } from "react";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { 
  Sparkles, EyeOff, Edit, ShieldCheck, Trash2, AlertTriangle, 
  User, Check, X, Camera, Lock, Flame, CheckCircle2, Award, 
  Briefcase, GraduationCap, Heart, HelpCircle, ChevronDown, 
  ChevronUp, UserCheck, BookOpen, Clock, FileText, Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { getAvatarUrl } from "../lib/avatarUtils";
import { 
  Nationalities, Countries, EducationLevels, IncomeLevels, 
  ReligiousCommitmentLevels, PrayersCommitment, QaImaStances, 
  MahrOpinions, MarriageTimeframes, MarriageReadinessLevels, Avatars 
} from "../constants";
import { MaritalStatus, Gender } from "../types";
import { MyTrustVerificationManager } from "../components/MyTrustVerificationManager";
import { WardGuardianSettings } from "../components/WardGuardianSettings";
import { GuardianPortal } from "../components/GuardianPortal";
import { CompatibilitySurveyModal } from "../components/CompatibilitySurveyModal";
import { ProfileEditRequestModal } from "../components/ProfileEditRequestModal";
import { MarriageReadinessQuizModal } from "../components/academy/MarriageReadinessQuizModal";

export const MyProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser, updateProfile, updateAvatar, uploadCustomImage, 
    updatePhotoPrivacy, toggleIncognitoMode, deleteMyAccount,
    mySurvey
  } = useApp();
  const { addToast, showConfirm } = useUIStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showPrivacyGuide, setShowPrivacyGuide] = useState(false);

  // Form Fields State
  const [editProfession, setEditProfession] = useState(currentUser?.profession || "");
  const [editResidence, setEditResidence] = useState(currentUser?.residence || "مصر");
  const [editNationality, setEditNationality] = useState(currentUser?.nationality || "مصر");
  const [editEducation, setEditEducation] = useState(currentUser?.education || "بكالوريوس / ليسانس");
  const [editIncome, setEditIncome] = useState(currentUser?.income || "من 7,000 إلى 15,000 جنيه أو ما يعادلها");
  const [editMaritalStatus, setEditMaritalStatus] = useState<string>(currentUser?.maritalStatus || MaritalStatus.SINGLE);
  const [editReligiousCommitment, setEditReligiousCommitment] = useState(currentUser?.religiousCommitment || "ملتزم متوسط يسعى للأفضل");
  const [editPrayers, setEditPrayers] = useState(currentUser?.prayers || "أصلي كل الصلوات في وقتها والحمد لله");
  const [editQaImaStance, setEditQaImaStance] = useState(currentUser?.qaImaStance || "موضوع خاضع للاتفاق بين العائلتين");
  const [editMahrOpinion, setEditMahrOpinion] = useState(currentUser?.mahrOpinion || "موضوع خاضع للاتفاق والنقاش المرن");
  const [editMarriageTimeframe, setEditMarriageTimeframe] = useState(currentUser?.marriageTimeframe || "خلال سنة على الأكثر");
  const [editMarriageReadiness, setEditMarriageReadiness] = useState(currentUser?.marriageReadiness || "مستعد تماماً وجاهز من كافة الجوانب (السكن والإمكانيات جاهزة)");
  const [editAboutMe, setEditAboutMe] = useState(currentUser?.aboutMe || "");
  const [editPartnerSpecs, setEditPartnerSpecs] = useState(currentUser?.partnerSpecs || "");

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) return null;

  const handleStartEdit = () => {
    setEditProfession(currentUser.profession);
    setEditResidence(currentUser.residence);
    setEditNationality(currentUser.nationality);
    setEditEducation(currentUser.education);
    setEditIncome(currentUser.income);
    setEditMaritalStatus(currentUser.maritalStatus);
    setEditReligiousCommitment(currentUser.religiousCommitment);
    setEditPrayers(currentUser.prayers);
    setEditQaImaStance(currentUser.qaImaStance);
    setEditMahrOpinion(currentUser.mahrOpinion);
    setEditMarriageTimeframe(currentUser.marriageTimeframe);
    setEditMarriageReadiness(currentUser.marriageReadiness || "مستعد تماماً وجاهز من كافة الجوانب (السكن والإمكانيات جاهزة)");
    setEditAboutMe(currentUser.aboutMe);
    setEditPartnerSpecs(currentUser.partnerSpecs);
    setIsEditing(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editAboutMe.length < 140 || editPartnerSpecs.length < 140) {
      addToast("يجب ألا تقل فقرة التحدث عن النفس أو مواصفات الشريك عن 140 حرفاً لضمان الجدية التامة.", "error");
      return;
    }
    if (editAboutMe.length > 1000 || editPartnerSpecs.length > 1000) {
      addToast("يجب ألا تتجاوز فقرة التحدث عن النفس أو مواصفات الشريك 1000 حرف.", "error");
      return;
    }
    if (editProfession.trim().length > 50) {
      addToast("حقل المهنة / الوظيفة يجب ألا يتجاوز 50 حرفاً.", "error");
      return;
    }

    // Contact Leakage check
    const contactLeakPattern = /(?:https?:\/\/|www\.|\.com|\.net|[0-9]{8,}|[\u0660-\u0669]{8,})/i;
    if (contactLeakPattern.test(editAboutMe) || contactLeakPattern.test(editPartnerSpecs)) {
      addToast("يمنع إدراج أرقام الهواتف أو روابط التواصل في النبذة لحماية الخصوصية.", "error");
      return;
    }

    setIsSaving(true);
    const res = await updateProfile({
      profession: editProfession.trim(),
      residence: editResidence,
      nationality: currentUser.nationality,
      education: editEducation,
      income: editIncome,
      maritalStatus: currentUser.maritalStatus,
      religiousCommitment: editReligiousCommitment,
      prayers: editPrayers,
      qaImaStance: editQaImaStance,
      mahrOpinion: editMahrOpinion,
      marriageTimeframe: editMarriageTimeframe,
      marriageReadiness: editMarriageReadiness,
      aboutMe: editAboutMe.trim(),
      partnerSpecs: editPartnerSpecs.trim()
    });
    setIsSaving(false);

    if (res.ok) {
      setIsEditing(false);
      addToast("تم تحديث كافة بيانات ملفك الشخصي بنجاح!", "success");
    } else {
      addToast(res.error || "تعذر حفظ التعديلات", "error");
    }
  };

  const handleAvatarChange = async (avatarId: string) => {
    const res = await updateAvatar(avatarId);
    if (res.ok) {
      setShowAvatarModal(false);
      addToast("تم تحديث صورتك التعبيرية (الأفاتار) بنجاح!", "success");
    } else {
      addToast(res.error || "فشل تغيير الأفاتار", "error");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadCustomImage(file);
      if (res.ok) {
        addToast("تم ضغط ورفع صورتك الشخصية بنجاح إلى السيرفر!", "success");
      } else {
        addToast(res.error || "فشل رفع الصورة", "error");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrivacyChange = async (val: "public" | "accepted_interest_only" | "hidden") => {
    const res = await updatePhotoPrivacy(val);
    if (res.ok) {
      addToast("تم تحديث إعدادات خصوصية الصورة بنجاح!", "success");
    } else {
      addToast(res.error || "فشل تحديث الخصوصية", "error");
    }
  };

  const handleToggleIncognito = async () => {
    const res = await toggleIncognitoMode();
    if (res.ok) {
      addToast(
        currentUser.incognitoMode
          ? "تم إيقاف التصفح الخفي."
          : "تم تفعيل التصفح الخفي! يمكنك تصفح الملفات دون ترك أثر في الزيارات.",
        "info"
      );
    } else {
      addToast(res.error || "فشل تغيير وضع التصفح", "error");
    }
  };

  const handleDeleteAccount = () => {
    showConfirm({
      title: "حذف الحساب والبيانات نهائياً",
      message: "تحذير: هل أنت متأكد من رغبتك في حذف حسابك؟ سيتم مسح ملفك الشخصي وصورك ومحادثاتك نهائياً من خوادم المنصة ولا يمكن التراجع.",
      confirmText: "نعم، احذف حسابي وبياناتي نهائياً",
      cancelText: "إلغاء وتراجع",
      isDangerous: true,
      onConfirm: async () => {
        const res = await deleteMyAccount();
        if (res.ok) {
          addToast("تم حذف حسابك وجميع بياناتك بنجاح.", "info");
        } else {
          addToast(res.error || "تعذر إتمام عملية الحذف، يرجى المحاولة لاحقاً.", "error");
        }
      },
    });
  };

  // Gender specific avatars list
  const userGender = currentUser.gender || Gender.MALE;
  const availableAvatars = Avatars.filter(a => a.gender === userGender);

  return (
    <div className="max-w-2xl mx-auto px-3.5 sm:px-6 py-5 pb-28 space-y-4 sm:space-y-5 text-right font-sans" dir="rtl">
      
      {/* 1. بطاقة الحساب العلوية والصورة الشخصية والأفاتار */}
      <Card className="p-4 sm:p-5 text-center space-y-4 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="relative w-24 h-24 mx-auto">
          <img 
            src={getAvatarUrl(currentUser)} 
            alt={currentUser.name} 
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md mx-auto"
            referrerPolicy="no-referrer"
          />
          {currentUser.isVerified && (
            <div className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow" title="حساب موثق">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowAvatarModal(true)}
            className="absolute -top-1 -right-1 bg-white border border-slate-200 text-slate-700 p-1.5 rounded-full shadow-xs hover:bg-slate-50 transition cursor-pointer"
            title="تغيير الأفاتار"
          >
            <Camera className="w-4 h-4 text-emerald-700" />
          </button>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">{currentUser.name}</h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            عضوية: <span className="font-bold text-slate-700">{currentUser.memberNumber}</span> • جوال: {currentUser.mobile}
          </p>
        </div>

        {/* أزرار الإجراءات السريعة بصيغة متناسقة للموبايل */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setShowAvatarModal(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>تغيير الأفاتار</span>
            </button>

            <label className={`cursor-pointer px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl transition inline-flex items-center justify-center gap-1.5 border border-emerald-200/60 shadow-2xs ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isUploading ? "جاري الرفع..." : "رفع صورة حقيقية"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={handlePhotoUpload}
              />
            </label>

            {currentUser.isPremium ? (
              <button
                type="button"
                onClick={handleToggleIncognito}
                className={`col-span-2 sm:col-span-1 px-3 py-2 text-xs font-bold rounded-2xl transition inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentUser.incognitoMode 
                    ? "bg-purple-600 text-white shadow-sm" 
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60"
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>{currentUser.incognitoMode ? "التصفح الخفي مفعّل" : "التصفح الخفي"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowPrivacyGuide(!showPrivacyGuide)}
                className="col-span-2 sm:col-span-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-2xl transition inline-flex items-center justify-center gap-1 border border-slate-200/60 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>إرشادات الخصوصية</span>
              </button>
            )}
          </div>

          {/* خصوصية الصورة مع زر توضيح مرن */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100 text-xs">
            <span className="text-slate-600 font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              خصوصية الصورة:
            </span>
            <select
              value={currentUser.photoPrivacy || "public"}
              onChange={(e) => handlePrivacyChange(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="public">مرئية للجميع (عامة)</option>
              <option value="accepted_interest_only">فقط لمن أقبل اهتمامه 🔒</option>
              <option value="hidden">مخفية مؤقتاً</option>
            </select>
          </div>

          {/* تنبيه إرشادات الخصوصية القابل للطي والمختصر */}
          {showPrivacyGuide && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-right text-xs space-y-1.5 transition">
              <div className="flex justify-between items-center text-emerald-900 font-bold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  ضوابط الخصوصية والوقار
                </span>
                <button 
                  type="button" 
                  onClick={() => setShowPrivacyGuide(false)}
                  className="text-emerald-700 hover:text-emerald-900 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                صور الأعضاء تخضع لمراجعة فورية لتأكيد الوقار. يمكنك في أي وقت تخصيص ظهور صورتك للمقبولين فقط أو الاكتفاء بالأفاتار الكرتوني الرسمي.
              </p>
            </div>
          )}

          {/* تنبيهات حالة مراجعة الصورة بصيغة مختصرة وأنيقة */}
          {currentUser.profileImage && currentUser.photoModerationStatus === "pending_approval" && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-center">
              <p className="text-xs font-bold text-amber-800 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                الصورة قيد مراجعة الإدارة (يظهر الأفاتار مؤقتاً حفاظاً على الوقار)
              </p>
            </div>
          )}

          {currentUser.photoModerationStatus === "rejected" && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-center">
              <p className="text-xs font-bold text-rose-800">
                ⚠️ لم تعتمد الصورة: {currentUser.photoRejectedReason || "لا تطابق معايير الوقار"}
              </p>
            </div>
          )}

          {currentUser.photoModerationStatus === "frozen_by_reports" && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-center">
              <p className="text-xs font-bold text-rose-800">
                🔒 تم إيقاف عرض الصورة مؤقتاً للفحص والمراجعة
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* نموذج التعديل أو العرض المنظم */}
      {!isEditing ? (
        <div className="space-y-4 sm:space-y-5">
          
          {/* 2. البيانات الأساسية والهوية (أولاً كما طلب المستخدم) */}
          <Card className="p-4 sm:p-5 space-y-3.5 rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/30 via-white to-amber-50/10 shadow-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">البيانات الأساسية والهوية</h4>
                  <p className="text-[10px] text-amber-700">بيانات موثقة مقفلة لضمان المصداقية</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditRequestModal(true)}
                className="text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-amber-100/90 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                طلب تعديل
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 text-xs">
              <div className="bg-white/90 p-2.5 sm:p-3 rounded-2xl border border-amber-100/80">
                <span className="text-[10px] text-slate-400 block font-medium">الاسم الكامل</span>
                <span className="font-bold text-slate-800 text-xs sm:text-sm">{currentUser.name}</span>
              </div>
              <div className="bg-white/90 p-2.5 sm:p-3 rounded-2xl border border-amber-100/80">
                <span className="text-[10px] text-slate-400 block font-medium">النوع / الجنس</span>
                <span className="font-bold text-slate-800">
                  {currentUser.gender === Gender.MALE ? "رجل (عريس)" : "امرأة (عروسة)"}
                </span>
              </div>
              <div className="bg-white/90 p-2.5 sm:p-3 rounded-2xl border border-amber-100/80">
                <span className="text-[10px] text-slate-400 block font-medium">العمر</span>
                <span className="font-bold text-slate-800">{currentUser.age} سنة</span>
              </div>
              <div className="bg-white/90 p-2.5 sm:p-3 rounded-2xl border border-amber-100/80">
                <span className="text-[10px] text-slate-400 block font-medium">الحالة الاجتماعية</span>
                <span className="font-bold text-slate-800">{currentUser.maritalStatus}</span>
              </div>
              <div className="bg-white/90 p-2.5 sm:p-3 rounded-2xl border border-amber-100/80">
                <span className="text-[10px] text-slate-400 block font-medium">الجنسية</span>
                <span className="font-bold text-slate-800">{currentUser.nationality}</span>
              </div>
              <div className="bg-white/90 p-2.5 sm:p-3 rounded-2xl border border-amber-100/80">
                <span className="text-[10px] text-slate-400 block font-medium">بلد الإقامة</span>
                <span className="font-bold text-slate-800">{currentUser.residence}</span>
              </div>
            </div>
          </Card>

          {/* 3. المواصفات الشخصية والتعليم والعمل (ثانياً) */}
          <Card className="p-4 sm:p-5 space-y-3.5 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-blue-50 text-blue-700">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">المواصفات والتعليم والعمل</h4>
                  <p className="text-[10px] text-slate-500">المستوى الدراسي والمهني والمعيشي</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleStartEdit}
                className="text-emerald-700 text-xs font-bold flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                تعديل البيانات
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 text-xs">
              <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">المهنة / الوظيفة</span>
                <span className="font-bold text-slate-800 truncate block">{currentUser.profession || "غير محدد"}</span>
              </div>
              <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">المؤهل الدراسي</span>
                <span className="font-bold text-slate-800 truncate block">{currentUser.education}</span>
              </div>
              <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block font-medium">نطاق الدخل الشهري</span>
                <span className="font-bold text-slate-800 truncate block">{currentUser.income}</span>
              </div>
            </div>
          </Card>

          {/* 4. الالتزام الديني والجاهزية للزواج */}
          <Card className="p-4 sm:p-5 space-y-3.5 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">الالتزام الديني وتفاصيل الزواج</h4>
                  <p className="text-[10px] text-slate-500">الصلاة والمهر والجاهزية والاستقرار</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleStartEdit}
                className="text-emerald-700 text-xs font-bold hover:underline cursor-pointer"
              >
                تعديل
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-xs">
              <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">الالتزام الديني</span>
                <span className="font-bold text-slate-800">{currentUser.religiousCommitment}</span>
              </div>
              <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">المحافظة على الصلاة</span>
                <span className="font-bold text-slate-800">{currentUser.prayers}</span>
              </div>
              <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">مدى الاستعداد للزواج</span>
                <span className="font-bold text-emerald-800 block text-[11px] sm:text-xs">{currentUser.marriageReadiness || "مستعد تماماً وجاهز"}</span>
              </div>
              <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">الإطار الزمني للزواج</span>
                <span className="font-bold text-slate-800 block text-[11px] sm:text-xs">{currentUser.marriageTimeframe || "خلال سنة"}</span>
              </div>
              <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">الموقف من القايمة</span>
                <span className="font-bold text-slate-800">{currentUser.qaImaStance || "موضوع خاضع للاتفاق"}</span>
              </div>
              <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">الرأي في المهر والشبكة</span>
                <span className="font-bold text-slate-800">{currentUser.mahrOpinion || "موضوع خاضع للنقاش المرن"}</span>
              </div>
            </div>
          </Card>

          {/* 5. النبذة التعريفية ومواصفات شريك الحياة المطلوب */}
          <Card className="p-4 sm:p-5 space-y-3.5 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-purple-50 text-purple-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">النبذة التعريفية وشريك الحياة</h4>
                  <p className="text-[10px] text-slate-500">تحدثك عن نفسك وشروطك في الطرف الآخر</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleStartEdit}
                className="text-emerald-700 text-xs font-bold hover:underline cursor-pointer"
              >
                تعديل
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">عن نفسي:</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/90 p-3 sm:p-3.5 rounded-2xl border border-slate-100">
                  "{currentUser.aboutMe}"
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-bold block">شريك حياتي المطلوب:</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/90 p-3 sm:p-3.5 rounded-2xl border border-slate-100">
                  "{currentUser.partnerSpecs}"
                </p>
              </div>
            </div>
          </Card>

          {/* 6. استبيان التوافق والخطوط الحمراء */}
          <Card className="p-4 sm:p-5 space-y-3.5 rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-50/30 via-white to-orange-50/10 shadow-xs">
            <div className="flex justify-between items-center pb-2.5 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-rose-100 text-rose-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">استبيان التوافق والخطوط الحمراء</h4>
                  <p className="text-[10px] text-slate-500">
                    {mySurvey ? "مكتمل • يدخل في خوارزمية التوافق الذكي" : "غير مكتمل بعد"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSurveyModal(true)}
                className="text-[11px] font-bold text-rose-700 hover:text-rose-800 bg-rose-100/90 hover:bg-rose-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                {mySurvey ? "تعديل" : "بدء الاستبيان"}
              </button>
            </div>

            {mySurvey ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {mySurvey.leisureStyle && (
                    <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200/80 text-[11px]">
                      🏖️ {mySurvey.leisureStyle}
                    </span>
                  )}
                  {mySurvey.conflictStyle && (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px]">
                      🤝 {mySurvey.conflictStyle}
                    </span>
                  )}
                  {mySurvey.financialView && (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px]">
                      💼 {mySurvey.financialView}
                    </span>
                  )}
                  {mySurvey.lifePriority && (
                    <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200/80 text-[11px]">
                      🎯 {mySurvey.lifePriority}
                    </span>
                  )}
                </div>

                {mySurvey.redFlags && mySurvey.redFlags.length > 0 && (
                  <div className="pt-2 border-t border-rose-100/80 space-y-1">
                    <span className="text-[10px] font-bold text-rose-800 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-rose-600" />
                      الخطوط الحمراء (Red Flags):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {mySurvey.redFlags.map((flag) => (
                        <span
                          key={flag}
                          className="px-2 py-0.5 rounded-lg bg-rose-100/80 text-rose-800 font-medium text-[10px]"
                        >
                          ⛔ {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mySurvey.flexiblePoints && mySurvey.flexiblePoints.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      نقاط المرونة والتفاهم:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {mySurvey.flexiblePoints.map((pt) => (
                        <span
                          key={pt}
                          className="px-2 py-0.5 rounded-lg bg-emerald-100/80 text-emerald-800 font-medium text-[10px]"
                        >
                          ✓ {pt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-2.5 space-y-2">
                <p className="text-xs text-slate-500">
                  إجابات الاستبيان تدعم اقتراح الشريك الأكثر ملاءمة وتفادي التعارضات.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(true)}
                  className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-2xl transition cursor-pointer"
                >
                  ملء استبيان التوافق (دقيقتان) ←
                </button>
              </div>
            )}
          </Card>

          {/* 7. شهادة المقبلين على الزواج (الأكاديمية) */}
          <Card className="p-4 sm:p-5 border border-amber-300/80 bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30 rounded-3xl shadow-xs">
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-500 text-slate-950 shadow-2xs">
                  <Award className="w-5 h-5 fill-amber-200" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>شهادة المقبلين على الزواج</span>
                    {currentUser.isMarriageCertified ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        مُجتاز ({currentUser.marriageExamScore || 100}%)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        موصى به
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {currentUser.isMarriageCertified
                      ? "شارة «مؤهل للزواج 🎓» مفعّلة في ملفك الشخصي لزيادة فرص القبول."
                      : "اجتز اختبار الأكاديمية القصير لتحصل على شارة التميز والجدية."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuizModal(true)}
                className="text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-500 px-3.5 py-2 rounded-2xl transition flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>{currentUser.isMarriageCertified ? "إعادة الاختبار" : "بدء الاختبار"}</span>
              </button>
            </div>
          </Card>

          {/* 8. إشراف الولي والأسرة */}
          {currentUser.accountRole?.startsWith("guardian_") ? (
            <GuardianPortal />
          ) : (
            <WardGuardianSettings />
          )}

          {/* 9. مركز الثقة والتحقق متعدد المستويات (موقعه هنا فوق إدارة الحساب وحذف البيانات مباشرة) */}
          <MyTrustVerificationManager />

          {/* 10. إدارة الحساب وحذف البيانات (Danger Zone) */}
          <Card className="p-4 sm:p-5 border border-rose-200/80 bg-rose-50/20 rounded-3xl shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-2xl bg-rose-100 text-rose-700 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-rose-900">إدارة الحساب وحذف البيانات</h4>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  يمكنك مسح حسابك وكافة محادثاتك وسجلاتك نهائياً من خوادم النظام في أي وقت وفق سياسات حماية الخصوصية.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeleteAccount}
              className="w-full text-xs py-2.5 rounded-2xl font-bold cursor-pointer"
            >
              حذف الحساب ومسح كافة البيانات نهائياً
            </Button>
          </Card>

        </div>
      ) : (
        /* نموذج التعديل الشامل مع تبويبات وأقسام مريحة للموبايل */
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <Card className="p-4 sm:p-6 space-y-5 rounded-3xl border border-slate-200/90 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">تعديل بيانات الملف الشخصي</h3>
                  <p className="text-[10px] text-slate-500">قم بتحديث بياناتك لتطابق أحدث مستجداتك بدقة</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* القسم الأول: التعليم والعمل والإقامة */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-r-2 border-emerald-600 pr-2">
                <span>التعليم والعمل والإقامة</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Input
                  label="المهنة / الوظيفة"
                  maxLength={50}
                  value={editProfession}
                  onChange={(e) => setEditProfession(e.target.value.slice(0, 50))}
                  required
                />

                <Select
                  label="بلد الإقامة"
                  value={editResidence}
                  onChange={(e) => setEditResidence(e.target.value)}
                >
                  {Countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>

                <Select
                  label="المستوى التعليمي"
                  value={editEducation}
                  onChange={(e) => setEditEducation(e.target.value)}
                >
                  {EducationLevels.map((ed) => (
                    <option key={ed} value={ed}>{ed}</option>
                  ))}
                </Select>

                <Select
                  label="نطاق الدخل الشهري"
                  value={editIncome}
                  onChange={(e) => setEditIncome(e.target.value)}
                >
                  {IncomeLevels.map((inc) => (
                    <option key={inc} value={inc}>{inc}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* القسم الثاني: الالتزام الديني والصلوات */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-r-2 border-emerald-600 pr-2">
                <span>الالتزام الديني والصلوات</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Select
                  label="الالتزام الديني"
                  value={editReligiousCommitment}
                  onChange={(e) => setEditReligiousCommitment(e.target.value)}
                >
                  {ReligiousCommitmentLevels.map((rc) => (
                    <option key={rc} value={rc}>{rc}</option>
                  ))}
                </Select>

                <Select
                  label="المحافظة على الصلاة"
                  value={editPrayers}
                  onChange={(e) => setEditPrayers(e.target.value)}
                >
                  {PrayersCommitment.map((pr) => (
                    <option key={pr} value={pr}>{pr}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* القسم الثالث: شروط وتفاصيل الزواج */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-r-2 border-emerald-600 pr-2">
                <span>شروط وتفاصيل الزواج</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Select
                  label="مدى الجاهزية والاستعداد للزواج"
                  value={editMarriageReadiness}
                  onChange={(e) => setEditMarriageReadiness(e.target.value)}
                >
                  {MarriageReadinessLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </Select>

                <Select
                  label="الإطار الزمني المناسب للزواج"
                  value={editMarriageTimeframe}
                  onChange={(e) => setEditMarriageTimeframe(e.target.value)}
                >
                  {MarriageTimeframes.map((tf) => (
                    <option key={tf} value={tf}>{tf}</option>
                  ))}
                </Select>

                <Select
                  label="الموقف من القايمة"
                  value={editQaImaStance}
                  onChange={(e) => setEditQaImaStance(e.target.value)}
                >
                  {QaImaStances.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </Select>

                <Select
                  label="الرأي في المهر والشبكة"
                  value={editMahrOpinion}
                  onChange={(e) => setEditMahrOpinion(e.target.value)}
                >
                  {MahrOpinions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </div>
            </div>
            
            {/* القسم الرابع: النبذة والشريك المطلوب */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-r-2 border-emerald-600 pr-2">
                <span>النبذة ومواصفات شريك الحياة</span>
              </h4>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>تحدث عن نفسك بالتفصيل</span>
                  <span className={`text-[10px] font-mono ${editAboutMe.length < 140 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}`}>
                    {editAboutMe.length} / 140 حرف كحد أدنى (الحد الأقصى 1000)
                  </span>
                </div>
                <textarea
                  required
                  maxLength={1000}
                  value={editAboutMe}
                  onChange={(e) => setEditAboutMe(e.target.value.slice(0, 1000))}
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white leading-relaxed resize-none shadow-2xs"
                  placeholder="اكتب عن طباعك، اهتماماتك، روتين يومك، وقيمك..."
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>المواصفات المطلوبة في شريك الحياة</span>
                  <span className={`text-[10px] font-mono ${editPartnerSpecs.length < 140 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}`}>
                    {editPartnerSpecs.length} / 140 حرف كحد أدنى (الحد الأقصى 1000)
                  </span>
                </div>
                <textarea
                  required
                  maxLength={1000}
                  value={editPartnerSpecs}
                  onChange={(e) => setEditPartnerSpecs(e.target.value.slice(0, 1000))}
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white leading-relaxed resize-none shadow-2xs"
                  placeholder="المواصفات الدينية، الاجتماعية، والشخصية التي ترغب بها..."
                />
              </div>
            </div>

            {/* أزرار الحفظ والإلغاء بتصميم عريض ومريح */}
            <div className="flex gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                className="w-1/3 text-xs py-2.5 rounded-2xl cursor-pointer"
                disabled={isSaving}
                onClick={() => setIsEditing(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="w-2/3 text-xs py-2.5 rounded-2xl font-bold cursor-pointer"
                isLoading={isSaving}
              >
                حفظ التعديلات
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* نافذة اختيار الأفاتار */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" dir="rtl">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">اختر صورتك التعبيرية (الأفاتار)</h4>
                <p className="text-[11px] text-slate-500">نماذج وقورة عالية الدقة تليق بك</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {availableAvatars.map((av) => {
                const isSelected = currentUser.avatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => handleAvatarChange(av.id)}
                    className={`relative p-2 rounded-2xl border-2 transition cursor-pointer flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/70 shadow-sm"
                        : "border-slate-100 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.label}
                      className="w-14 h-14 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">{av.label}</span>
                    {isSelected && (
                      <div className="absolute top-1 left-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* النوافذ الفرعية */}
      <CompatibilitySurveyModal
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
      />

      <ProfileEditRequestModal
        isOpen={showEditRequestModal}
        onClose={() => setShowEditRequestModal(false)}
      />

      <MarriageReadinessQuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
      />

    </div>
  );
};
