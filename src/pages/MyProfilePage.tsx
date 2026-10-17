import React, { useState } from "react";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { Sparkles, EyeOff, Edit, ShieldCheck, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export const MyProfilePage: React.FC = () => {
  const { 
    currentUser, updateProfile, uploadCustomImage, 
    updatePhotoPrivacy, toggleIncognitoMode, deleteMyAccount 
  } = useApp();
  const { addToast, showConfirm } = useUIStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editAboutMe, setEditAboutMe] = useState(currentUser?.aboutMe || "");
  const [editPartnerSpecs, setEditPartnerSpecs] = useState(currentUser?.partnerSpecs || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) return null;

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editAboutMe.length < 140 || editPartnerSpecs.length < 140) {
      addToast("يجب ألا تقل فقرة التحدث عن النفس أو مواصفات الشريك عن 140 حرفاً لضمان الجدية التامة.", "error");
      return;
    }
    setIsSaving(true);
    const res = await updateProfile({
      aboutMe: editAboutMe,
      partnerSpecs: editPartnerSpecs
    });
    setIsSaving(false);
    if (res.ok) {
      setIsEditing(false);
      addToast("تم تحديث الفقرات التعريفية بنجاح!", "success");
    } else {
      addToast(res.error || "تعذر حفظ التعديلات", "error");
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

  return (
    <div className="p-4 space-y-6 pt-6 text-right pb-24" dir="rtl">
      {/* Profile Header Card */}
      <Card className="text-center space-y-4">
        <div className="relative w-24 h-24 mx-auto">
          <img 
            src={currentUser.profileImage || `https://images.unsplash.com/photo-${currentUser.avatar === "male_1" ? "1534528741775-53994a69daeb" : currentUser.avatar === "female_1" ? "1494790108377-be9c29b29330" : "1507003211169-0a1dd7228f2d"}?auto=format&fit=crop&w=150&q=80`} 
            alt={currentUser.name} 
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md mx-auto"
            referrerPolicy="no-referrer"
          />
          {currentUser.isVerified && (
            <div className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow" title="حساب موثق">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
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
              <span>{isUploading ? "جاري الرفع..." : "رفع صورة شخصية"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={handlePhotoUpload}
              />
            </label>

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

      {!isEditing ? (
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-800 text-xs">الفقرات التعريفية الحالية</h4>
              <button 
                type="button"
                onClick={() => {
                  setEditAboutMe(currentUser.aboutMe);
                  setEditPartnerSpecs(currentUser.partnerSpecs);
                  setIsEditing(true);
                }}
                className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:underline"
              >
                <Edit className="w-3.5 h-3.5" />
                تعديل الفقرات
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
            <h4 className="font-bold text-slate-800 text-xs">مواصفاتي التفصيلية المسجلة</h4>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block">السن</span>
                <span className="font-bold text-slate-800">{currentUser.age} سنة</span>
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
                <span className="text-[9px] text-slate-400 block">المؤهل</span>
                <span className="font-bold text-slate-800">{currentUser.education}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block">التدين</span>
                <span className="font-bold text-slate-800">{currentUser.religiousCommitment}</span>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <form onSubmit={handleUpdateSubmit}>
          <Card className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">تعديل فقرات الملف الشخصي</h3>
            
            <div className="space-y-1.5">
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
                rows={5}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white leading-relaxed"
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
                rows={5}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white leading-relaxed"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-1/3"
                disabled={isSaving}
                onClick={() => setIsEditing(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="w-2/3"
                isLoading={isSaving}
              >
                حفظ التعديلات
              </Button>
            </div>
          </Card>
        </form>
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
