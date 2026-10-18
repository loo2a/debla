import React, { useState } from "react";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { 
  ShieldCheck, Users, Copy, Share2, Check, RefreshCw, 
  MessageSquare, UserCheck, AlertTriangle, Trash2, HeartHandshake,
  CheckCircle2, Clock
} from "lucide-react";
import { Button } from "./ui/Button";

interface WardGuardianSettingsProps {
  onSuccess?: () => void;
}

export const WardGuardianSettings: React.FC<WardGuardianSettingsProps> = () => {
  const { 
    currentUser, guardianStatus, createGuardianInvitation, 
    revokeGuardianLink, updateGuardianPermissions, fetchGuardianStatus 
  } = useApp();
  const { addToast, showConfirm } = useUIStore();

  const [relationship, setRelationship] = useState("الوالد");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingPerms, setIsUpdatingPerms] = useState(false);
  const [copied, setCopied] = useState(false);

  // Local state for permissions
  const [canViewChat, setCanViewChat] = useState(guardianStatus?.canViewChat ?? true);
  const [canApproveRequests, setCanApproveRequests] = useState(guardianStatus?.canApproveRequests ?? true);

  if (!currentUser) return null;

  // توليد كود عشوائي للربط
  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let suffix = "";
    for (let i = 0; i < 4; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `WALI-${suffix}`;
  };

  const handleCreateInvitation = async () => {
    setIsGenerating(true);
    const newCode = generateRandomCode();
    const res = await createGuardianInvitation(newCode, relationship);
    setIsGenerating(false);

    if (res.ok) {
      addToast(`تم إنشاء رمز دعوة ولي الأمر بنجاح: ${newCode}`, "success");
    } else {
      addToast(res.error || "تعذر إنشاء رمز الدعوة", "error");
    }
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      addToast("تم نسخ رمز الدعوة بنجاح!", "success");
    }
  };

  const handleShareWhatsApp = (code: string) => {
    const text = `السلام عليكم ورحمة الله وبركاته،\nأدعوك يا وليّ أمري الفاضل للانضمام والإشراف على حسابي في تطبيق (مودة ورحمة) للزواج الإسلامي.\n\nرمز ربط الحساب الخاص بك هو:\n${code}\n\nيمكنك إدخال هذا الرمز عند التسجيل أو من خلال قسم (وضع الولي) لربط الحسابين بأمان دون الحاجة لكلمة المرور.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleSavePermissions = async () => {
    if (!guardianStatus?.linkId) return;
    setIsUpdatingPerms(true);
    const res = await updateGuardianPermissions(guardianStatus.linkId, canViewChat, canApproveRequests);
    setIsUpdatingPerms(false);

    if (res.ok) {
      addToast("تم تحديث صلاحيات إشراف ولي الأمر بنجاح", "success");
    } else {
      addToast(res.error || "تعذر تحديث الصلاحيات", "error");
    }
  };

  const handleRevoke = () => {
    if (!guardianStatus?.linkId) return;

    showConfirm({
      title: "إلغاء ربط ولي الأمر",
      message: "هل أنت متأكد من رغبتك في إلغاء ربط ولي الأمر بحسابك؟ لن يتمكن بعدها من متابعة خطوات التعارف أو الاطلاع على المحادثات.",
      confirmText: "تأكيد الإلغاء",
      isDangerous: true,
      onConfirm: async () => {
        const res = await revokeGuardianLink(guardianStatus.linkId!);
        if (res.ok) {
          addToast("تم إلغاء ربط ولي الأمر بنجاح", "info");
        } else {
          addToast(res.error || "تعذر إلغاء الربط", "error");
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-6 text-right font-sans" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              وضع الولي والأسرة
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                إشراف شرعي
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              إشراك ولي أمرك في خطوات التعارف بخصوصية تامة دون مشاركة كلمة المرور
            </p>
          </div>
        </div>

        <button 
          onClick={() => void fetchGuardianStatus()}
          title="تحديث الحالة"
          className="p-2 text-slate-400 hover:text-emerald-600 rounded-xl hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* الحالة 1: يوجد ولي أمر مرتبط ونشط */}
      {guardianStatus?.hasLink && guardianStatus.status === "active" && (
        <div className="space-y-5">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                حسابك مرتبط بولي أمر معتمد
              </span>
              <span className="text-[11px] bg-white text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                إشراف نشط
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white/80 p-3 rounded-xl border border-emerald-100">
              <div>
                <span className="text-slate-400 text-[11px] block">اسم ولي الأمر:</span>
                <span className="font-bold text-slate-800">{guardianStatus.partnerName || "ولي الأمر"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">صلة القرابة:</span>
                <span className="font-bold text-slate-800">{guardianStatus.relationship || "الوالد"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">رقم عضوية الولي:</span>
                <span className="font-bold text-slate-700 font-mono">{guardianStatus.partnerMemberNumber || "-"}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">تاريخ الربط:</span>
                <span className="font-bold text-slate-700">{guardianStatus.createdAt ? String(guardianStatus.createdAt).split("T")[0] : "حديثاً"}</span>
              </div>
            </div>
          </div>

          {/* التحكم في الصلاحيات */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
            <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              صلاحيات إشراف ولي الأمر الممنوحة:
            </h4>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">الاطلاع على المحادثات (Chat Oversight)</span>
                    <span className="text-[10px] text-slate-500">تمكين ولي الأمر من قراءة الحوارات لضمان الجدية وحفظ المودة</span>
                  </div>
                </div>
                <input 
                  type="checkbox"
                  checked={canViewChat}
                  onChange={(e) => setCanViewChat(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">مراجعة ومباركة طلبات التعارف</span>
                    <span className="text-[10px] text-slate-500">تمكين ولي الأمر من مراجعة طلبات التعارف الجاد المتبادلة</span>
                  </div>
                </div>
                <input 
                  type="checkbox"
                  checked={canApproveRequests}
                  onChange={(e) => setCanApproveRequests(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </label>
            </div>

            <Button
              onClick={handleSavePermissions}
              isLoading={isUpdatingPerms}
              variant="outline"
              className="w-full text-xs"
            >
              حفظ تغييرات الصلاحيات
            </Button>
          </div>

          {/* زر فك الارتباط */}
          <div className="pt-2">
            <Button
              onClick={handleRevoke}
              variant="ghost"
              className="w-full text-xs text-rose-600 hover:bg-rose-50 border border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5 ml-1" />
              إلغاء ربط ولي الأمر بحسابي
            </Button>
          </div>
        </div>
      )}

      {/* الحالة 2: يوجد رمز دعوة قيد الانتظار */}
      {guardianStatus?.hasLink && guardianStatus.status === "pending" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              رمز الدعوة نشط وبانتظار قبول ولي الأمر
            </div>

            <div className="text-center py-3 bg-white rounded-xl border-2 border-dashed border-amber-300 space-y-1">
              <span className="text-[10px] text-slate-400 block font-semibold">رمز الربط المخصص لولي الأمر:</span>
              <span className="text-2xl font-black font-mono tracking-widest text-emerald-700">
                {guardianStatus.inviteCode}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              شارك هذا الرمز مع ولي أمرك ({guardianStatus.relationship || "الوالد"}) ليقوم بإدخاله في حسابه بالتطبيق لإتمام الربط والإشراف الشرعي.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleCopyCode(guardianStatus.inviteCode!)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? "تم النسخ!" : "نسخ الرمز"}
              </button>

              <button
                type="button"
                onClick={() => handleShareWhatsApp(guardianStatus.inviteCode!)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                <Share2 className="w-4 h-4" />
                مشاركة عبر واتساب
              </button>
            </div>
          </div>

          <Button
            onClick={handleRevoke}
            variant="ghost"
            className="w-full text-xs text-slate-500 hover:text-rose-600"
          >
            إلغاء هذا الرمز وإنشاء رمز جديد
          </Button>
        </div>
      )}

      {/* الحالة 3: لا يوجد ربط حالياً */}
      {(!guardianStatus?.hasLink || guardianStatus.status === "revoked") && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              تتيح لك المنصة إشراك ولي أمرك (الأب، الأخ الأكبر، العم، الخال...) في متابعة خطوات التعارف ومباركتها عن بُعد، والاطلاع على المحادثات لضمان الجدية والأمان الأسري.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                صلة قرابة ولي الأمر المطلوب دعوته:
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-slate-800"
              >
                <option value="الوالد">الوالد (الأب)</option>
                <option value="الأخ الأكبر">الأخ الأكبر</option>
                <option value="العم">العم</option>
                <option value="الخال">الخال</option>
                <option value="الوالدة">الوالدة (الأم)</option>
                <option value="ولي شرعي">ولي شرعي / وصي</option>
              </select>
            </div>

            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 flex items-start gap-2 text-[11px] text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                قيد المنصة الصارم: لكل مستخدم ولي أمر واحد فقط، ولا يمكن لولي الأمر الإشراف على أكثر من حساب واحد في نفس الوقت لضمان التفرغ والجدية التامة.
              </span>
            </div>

            <Button
              onClick={handleCreateInvitation}
              isLoading={isGenerating}
              variant="primary"
              className="w-full text-xs py-3"
            >
              توليد رمز دعوة ولي الأمر
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};
