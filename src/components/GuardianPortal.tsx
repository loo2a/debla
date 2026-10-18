import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { 
  ShieldCheck, UserCheck, MessageSquare, HeartHandshake, 
  ArrowRight, CheckCircle2, Clock, Trash2, Key, Users, 
  RefreshCw, Sparkles, ExternalLink, AlertCircle
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { getAvatarUrl } from "../lib/avatarUtils";
import { MARRIAGE_STAGES } from "../lib/marriageJourney";

export const GuardianPortal: React.FC = () => {
  const { 
    currentUser, guardianStatus, acceptGuardianInvitation, 
    revokeGuardianLink, fetchGuardianStatus, messages, profiles 
  } = useApp();
  const { addToast, showConfirm } = useUIStore();
  const navigate = useNavigate();

  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  if (!currentUser) return null;

  // هل المستخدم ولي أمر؟
  const isGuardianRole = currentUser.accountRole === "guardian_bride" || currentUser.accountRole === "guardian_groom" || guardianStatus?.isGuardian;
  const isLinked = guardianStatus?.hasLink && guardianStatus.status === "active";

  // قبول رمز الدعوة وربط الحساب
  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = inviteCodeInput.trim().toUpperCase();
    if (!code) {
      addToast("يرجى إدخال رمز الدعوة المكوّن من أرقام وحروف", "error");
      return;
    }

    setIsLinking(true);
    const res = await acceptGuardianInvitation(code);
    setIsLinking(false);

    if (res.ok) {
      addToast("مبارك! تم ربط الحساب بنجاح وتفعيل إشرافك الشرعي المبارك.", "success");
      setInviteCodeInput("");
    } else {
      addToast(res.error || "تعذر ربط الحساب بهذا الرمز. تأكد من صحة الرمز.", "error");
    }
  };

  const handleRevoke = () => {
    if (!guardianStatus?.linkId) return;

    showConfirm({
      title: "إنهاء الإشراف على الحساب",
      message: "هل أنت متأكد من رغبتك في إنهاء ولايتك وإشرافك على هذا الحساب؟ يمكنك لاحقاً ربط حساب آخر بدعوة جديدة.",
      confirmText: "تأكيد فك الارتباط",
      isDangerous: true,
      onConfirm: async () => {
        const res = await revokeGuardianLink(guardianStatus.linkId!);
        if (res.ok) {
          addToast("تم فك ارتباط الإشراف بنجاح", "info");
        } else {
          addToast(res.error || "تعذر فك الارتباط", "error");
        }
      }
    });
  };

  // إيجاد ملف من تتولى أمره في الذاكرة إن وُجد
  const wardProfile = profiles.find(p => p.id === guardianStatus?.partnerId);

  // إيجاد محادثات من تتولى أمره (إذا كان مصرحاً لولي الأمر بقراءتها)
  const wardMessages = guardianStatus?.partnerId && guardianStatus.canViewChat
    ? messages.filter(m => m.senderId === guardianStatus.partnerId || m.receiverId === guardianStatus.partnerId)
    : [];

  const wardChatPartners = Array.from(new Set(wardMessages.map(m => 
    m.senderId === guardianStatus?.partnerId ? m.receiverId : m.senderId
  ))).map(partnerId => {
    const partner = profiles.find(p => p.id === partnerId);
    const partnerMsgs = wardMessages.filter(m => 
      (m.senderId === guardianStatus?.partnerId && m.receiverId === partnerId) ||
      (m.senderId === partnerId && m.receiverId === guardianStatus?.partnerId)
    );
    const lastMsg = partnerMsgs[partnerMsgs.length - 1];
    return {
      partnerId,
      partnerName: partner?.name || "طرف التعارف",
      partnerMemberNumber: partner?.memberNumber || "-",
      partnerAvatar: partner?.avatar || "male_1",
      lastMessage: lastMsg?.content || "",
      lastTime: lastMsg?.timestamp || "",
    };
  });

  return (
    <div className="space-y-6 max-w-xl mx-auto px-4 py-4 text-right font-sans" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute left-[-20px] bottom-[-20px] w-36 h-36 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="bg-emerald-700/60 text-emerald-100 text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              بوابة إشراف ولي الأمر والأسرة
            </span>
            <button
              onClick={() => void fetchGuardianStatus()}
              title="تحديث البيانات"
              className="p-1.5 bg-emerald-700/50 hover:bg-emerald-600 rounded-xl transition text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-xl font-black">
            أهلاً بك يا {currentUser.name || "ولي الأمر الفاضل"}
          </h2>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            {currentUser.accountRole === "guardian_bride" 
              ? "مرحباً بك كولي أمر عن عروسة، حفظها الله ورزقها الزوج الصالح التقي."
              : currentUser.accountRole === "guardian_groom"
              ? "مرحباً بك كولي أمر عن عريس، وفقه الله ورزقه الزوجة الصالحة النقية."
              : "منصتكم العائلية لمتابعة ومباركة خطوات التعارف الشرعي الجاد بكل أمان وشفافية."}
          </p>
        </div>
      </div>

      {/* الحالة 1: تم الربط بنجاح مع العروسة أو العريس */}
      {isLinked ? (
        <div className="space-y-5">
          
          {/* بطاقة من تتولى أمره */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                حساب من تتولى أمره المرتبط بك
              </span>
              <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                إشراف نشط
              </span>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center text-3xl shadow-sm shrink-0">
                {guardianStatus?.partnerGender === "female" ? "🧕" : "👨"}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    {guardianStatus?.partnerName || "الابن / الابنة"}
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200">
                    {guardianStatus?.partnerMemberNumber || "-"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  صلة القرابة: <strong className="text-slate-700">{guardianStatus?.relationship || "الوالد"}</strong>
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  أنت مفوّض شرعياً لمتابعة ومباركة خطوات التعارف
                </div>
              </div>
            </div>

            {/* حالة الصلاحيات الممنوحة من الابنة/الابن */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                guardianStatus?.canViewChat 
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-800" 
                  : "bg-amber-50/70 border-amber-200 text-amber-800"
              }`}>
                <MessageSquare className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-bold block text-[11px]">الاطلاع على المحادثات:</span>
                  <span className="text-[10px] font-extrabold">
                    {guardianStatus?.canViewChat ? "مصرّح لك بالقراءة ✅" : "غير مفعّل حالياً ⚠️"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl border bg-emerald-50/70 border-emerald-200 text-emerald-800 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-bold block text-[11px]">مراجعة طلبات التعارف:</span>
                  <span className="text-[10px] font-extrabold">مصرّح لك بالمباركة ✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* قسم محادثات التعارف الجاري (Chat Oversight) */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-800 text-sm">
                  محادثات التعارف النشطة لمن تتولى أمره
                </h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                {wardChatPartners.length} محادثة
              </span>
            </div>

            {guardianStatus?.canViewChat ? (
              wardChatPartners.length > 0 ? (
                <div className="space-y-2.5">
                  {wardChatPartners.map(chat => (
                    <div 
                      key={chat.partnerId}
                      onClick={() => navigate(`/inbox/${chat.partnerId}`)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg">
                          💬
                        </div>
                        <div className="space-y-0.5 text-right">
                          <h5 className="font-extrabold text-xs text-slate-800 group-hover:text-emerald-700">
                            محادثة مع: {chat.partnerName}
                          </h5>
                          <p className="text-[11px] text-slate-500 max-w-[200px] truncate">
                            {chat.lastMessage || "بدء الحوار والتعارف الشرعي"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                        <span>قراءة الشات</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:-translate-x-1 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                    💬
                  </div>
                  <p className="text-xs">لا توجد محادثات نشطة لمن تتولى أمره في الوقت الحالي.</p>
                </div>
              )
            ) : (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 space-y-1">
                <span className="font-bold block">ملاحظة الخصوصية:</span>
                <p className="text-[11px] leading-relaxed">
                  لم تفعّل الابنة/الابن صلاحية الاطلاع على المحادثات في الوقت الحالي. يمكنك التواصل معها لتفعيلها من قسم (وضع الولي والأسرة) بحسابها.
                </p>
              </div>
            )}
          </div>

          {/* زر فك الارتباط */}
          <div className="pt-2 text-center">
            <Button
              onClick={handleRevoke}
              variant="ghost"
              className="text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 w-full"
            >
              <Trash2 className="w-3.5 h-3.5 ml-1" />
              إنهاء الإشراف على هذا الحساب
            </Button>
          </div>

        </div>
      ) : (
        /* الحالة 2: لم يتم ربط حساب بعد - نموذج إدخال رمز الدعوة */
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto font-bold">
              <Key className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-800">
              ربط حساب من تتولى أمره (عروسة أو عريس)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              اطلب من ابنتك أو ابنك استخراج "رمز دعوة ولي الأمر" من داخل حسابه في التطبيق، ثم أدخله هنا للربط المباشر.
            </p>
          </div>

          <form onSubmit={handleAcceptInvite} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                رمز الدعوة المكوّن من أحرف وأرقام:
              </label>
              <Input
                type="text"
                placeholder="مثال: WALI-9842"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                className="text-center font-mono text-lg font-black tracking-widest uppercase py-3 border-2 focus:border-emerald-500"
                required
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ضمانات الخصوصية والأمان الشرعي:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li>لا حاجة لمشاركة كلمة المرور أو أي بيانات بنكية إطلاقاً.</li>
                <li>يتم الربط برخصة واضحة ومعلنة من الطرفين.</li>
                <li>حد أقصى: مستخدم واحد فقط لكل ولي أمر، لضمان أعلى درجات الجدية والتفرغ.</li>
              </ul>
            </div>

            <Button
              type="submit"
              isLoading={isLinking}
              variant="primary"
              className="w-full py-3.5 text-xs font-extrabold shadow-md"
            >
              ربط الحساب وتفعيل الإشراف الشرعي الآن
            </Button>
          </form>
        </div>
      )}

    </div>
  );
};
