import React, { useState } from "react";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { 
  Sparkles, EyeOff, Edit, ShieldCheck, Trash2, AlertTriangle, 
  User, Check, X, Camera 
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { getAvatarUrl } from "../lib/avatarUtils";
import { 
  Nationalities, Countries, EducationLevels, IncomeLevels, 
  ReligiousCommitmentLevels, PrayersCommitment, QaImaStances, 
  MahrOpinions, MarriageTimeframes, Avatars 
} from "../constants";
import { MaritalStatus, Gender } from "../types";

export const MyProfilePage: React.FC = () => {
  const { 
    currentUser, updateProfile, updateAvatar, uploadCustomImage, 
    updatePhotoPrivacy, toggleIncognitoMode, deleteMyAccount 
  } = useApp();
  const { addToast, showConfirm } = useUIStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

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
      nationality: editNationality,
      education: editEducation,
      income: editIncome,
      maritalStatus: editMaritalStatus as MaritalStatus,
      religiousCommitment: editReligiousCommitment,
      prayers: editPrayers,
      qaImaStance: editQaImaStance,
      mahrOpinion: editMahrOpinion,
      marriageTimeframe: editMarriageTimeframe,
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
      message: "تحذير أخير: هل أنت متأكد تماماً من رغبتك في حذف حسابك؟ سيتم مسح ملفك الشخصي بالكامل، وصورك المرفوعة، وكافة رسائلك وسجلاتك نهائياً من خوادم المنصة دون أي إمكانية للاسترجاع.",
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
    <div className="p-4 space-y-6 pt-6 text-right pb-24 font-sans" dir="rtl">
      
      {/* Profile Header Card */}
      <Card className="text-center space-y-4">
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
            className="absolute -top-1 -right-1 bg-white border border-slate-200 text-slate-700 p-1.5 rounded-full shadow hover:bg-slate-50 transition"
            title="تغيير الأفاتار"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-800">{currentUser.name}</h3>
          <p className="text-xs text-slate-400 font-mono">رقم العضوية: {currentUser.memberNumber} • جوال: {currentUser.mobile}</p>
        </div>

        {/* Photo Upload & Privacy Controls */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <label className={`cursor-pointer px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isUploading ? "جاري الرفع..." : "رفع صورة حقيقية (للتميز)"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={handlePhotoUpload}
              />
            </label>

            <button
              type="button"
              onClick={() => setShowAvatarModal(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>تغيير الأفاتار</span>
            </button>

            {currentUser.isPremium && (
              <button
                type="button"
                onClick={handleToggleIncognito}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 ${
                  currentUser.incognitoMode 
                    ? "bg-purple-600 text-white shadow-sm" 
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>{currentUser.incognitoMode ? "التصفح الخفي مفعّل" : "تفعيل التصفح الخفي"}</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">خصوصية الصورة:</span>
            <select
              value={currentUser.photoPrivacy || "public"}
              onChange={(e) => handlePrivacyChange(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="public">مرئية للجميع (عامة)</option>
              <option value="accepted_interest_only">فقط لمن أقبل اهتمامه 🔒</option>
              <option value="hidden">مخفية مؤقتاً</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Content: View Mode vs Edit Mode */}
      {!isEditing ? (
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-800 text-xs">الفقرات التعريفية</h4>
              <button 
                type="button"
                onClick={handleStartEdit}
                className="text-emerald-700 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition"
              >
                <Edit className="w-3.5 h-3.5" />
                تعديل كافة البيانات
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold">عن نفسي:</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  "{currentUser.aboutMe}"
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold">شريك حياتي المطلوب:</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  "{currentUser.partnerSpecs}"
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-800 text-xs">المواصفات الشخصية والاجتماعية</h4>
              <button 
                type="button"
                onClick={handleStartEdit}
                className="text-emerald-600 text-xs font-semibold hover:underline"
              >
                تعديل
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block">السن</span>
                <span className="font-bold text-slate-800">{currentUser.age} سنة</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block">المهنة</span>
                <span className="font-bold text-slate-800 truncate block">{currentUser.profession || "غير محدد"}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block">الجنسية</span>
                <span className="font-bold text-slate-800">{currentUser.nationality}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block">بلد الإقامة</span>
                <span className="font-bold text-slate-800">{currentUser.residence}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block">الحالة الاجتماعية</span>
                <span className="font-bold text-slate-800">{currentUser.maritalStatus}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block">المؤهل الدراسي</span>
                <span className="font-bold text-slate-800">{currentUser.education}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block">الالتزام الديني</span>
                <span className="font-bold text-slate-800">{currentUser.religiousCommitment}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block">مستوى الدخل</span>
                <span className="font-bold text-slate-800 truncate block">{currentUser.income}</span>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Comprehensive Edit Form */
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <Card className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">تعديل الملف الشخصي والمواصفات</h3>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <Input
                label="المهنة / الوظيفة"
                value={editProfession}
                onChange={(e) => setEditProfession(e.target.value)}
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
                label="الجنسية"
                value={editNationality}
                onChange={(e) => setEditNationality(e.target.value)}
              >
                {Nationalities.map((n) => (
                  <option key={n} value={n}>{n}</option>
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
                label="الحالة الاجتماعية"
                value={editMaritalStatus}
                onChange={(e) => setEditMaritalStatus(e.target.value)}
              >
                <option value={MaritalStatus.SINGLE}>أعزب / عزباء</option>
                <option value={MaritalStatus.DIVORCED}>مطلق / مطلقة</option>
                <option value={MaritalStatus.WIDOWED}>أرمل / أرملة</option>
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

              <div className="sm:col-span-2">
                <Select
                  label="الفترة المتوقعة لإتمام الزواج"
                  value={editMarriageTimeframe}
                  onChange={(e) => setEditMarriageTimeframe(e.target.value)}
                >
                  {MarriageTimeframes.map((tf) => (
                    <option key={tf} value={tf}>{tf}</option>
                  ))}
                </Select>
              </div>
            </div>
            
            {/* Bio text areas */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>تحدث عن نفسك بالتفصيل</span>
                <span className={`text-[10px] font-mono ${editAboutMe.length < 140 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {editAboutMe.length} / 140 حرف كحد أدنى
                </span>
              </div>
              <textarea
                required
                value={editAboutMe}
                onChange={(e) => setEditAboutMe(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white leading-relaxed resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>المواصفات المطلوبة في شريك الحياة</span>
                <span className={`text-[10px] font-mono ${editPartnerSpecs.length < 140 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {editPartnerSpecs.length} / 140 حرف كحد أدنى
                </span>
              </div>
              <textarea
                required
                value={editPartnerSpecs}
                onChange={(e) => setEditPartnerSpecs(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white leading-relaxed resize-none"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-1/3 text-xs"
                disabled={isSaving}
                onClick={() => setIsEditing(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="w-2/3 text-xs"
                isLoading={isSaving}
              >
                حفظ التعديلات
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">اختر صورتك التعبيرية (الأفاتار)</h4>
              <button 
                type="button" 
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {availableAvatars.map((av) => {
                const isSelected = currentUser.avatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => handleAvatarChange(av.id)}
                    className={`relative p-2 rounded-2xl border-2 transition cursor-pointer flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 shadow-sm"
                        : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.label}
                      className="w-14 h-14 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-[9px] font-bold text-slate-600">{av.label}</span>
                    {isSelected && (
                      <div className="absolute top-1 left-1 bg-emerald-600 text-white rounded-full p-0.5">
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

      {/* Danger Zone: Account Deletion (Google Play Compliance) */}
      <Card className="border border-rose-200/80 bg-rose-50/30 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 flex-shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 flex-1">
            <h4 className="text-xs font-bold text-rose-900">إدارة الحساب وحذف البيانات</h4>
            <p className="text-[11px] text-rose-700/90 leading-relaxed">
              وفقاً لسياسات متجر Google Play وحماية الخصوصية، يمكنك مسح حسابك وكافة محادثاتك وصورك نهائياً من النظام في أي وقت.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={handleDeleteAccount}
          className="w-full text-xs py-2.5"
        >
          حذف الحساب ومسح كافة البيانات نهائياً
        </Button>
      </Card>

    </div>
  );
};
