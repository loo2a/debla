import React, { useState } from "react";
import { AdminBroadcastMessage, Gender } from "../../types";
import { useApp } from "../../lib/store";
import { useUIStore } from "../../stores/uiStore";
import { 
  Bell, Send, Users, Sparkles, User, AlertCircle, 
  CheckCircle2, Radio 
} from "lucide-react";

interface AdminBroadcastManagerProps {
  initialTargetUserId?: string | null;
  onClearInitialTarget?: () => void;
}

export const AdminBroadcastManager: React.FC<AdminBroadcastManagerProps> = ({ 
  initialTargetUserId,
  onClearInitialTarget
}) => {
  const { profiles, adminSendBroadcast } = useApp();
  const { addToast } = useUIStore();

  const [targetAudience, setTargetAudience] = useState<AdminBroadcastMessage["targetAudience"]>(
    initialTargetUserId ? "specific_user" : "all"
  );
  const [targetUserId, setTargetUserId] = useState<string>(initialTargetUserId || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Quick preset messages
  const presets = [
    {
      title: "تحديثات وتسهيلات جديدة في تطبيق مودة ورحمة",
      content: "السلام عليكم ورحمة الله، تم إطلاق تحديث جديد يسهل التوافق الدقيق وتصفية الخطوط الحمراء، ونتمنى لكم التوفيق في بناء بيت صالح.",
    },
    {
      title: "تنبيه شرعي هام بخصوص المحادثات والتعارف",
      content: "نذكر إخواننا وأخواتنا بأن الهدف الأسمى هو الزواج الشرعي العلني، ويرجى الانتقال للخطوات الرسمية ومشاركة الولي بمجرد حصول التوافق الأولي.",
    },
    {
      title: "عرض مميز على اشتراكات التميز",
      content: "بمناسبة إطلاق الميزات الجديدة، استخدم كوبون التخفيض المتاح لترقية عضويتك والاستفادة من بطاقات المرشحين والميزات الحصرية.",
    },
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      addToast("يرجى إدخال عنوان الإشعار ونصه", "error");
      return;
    }

    if (targetAudience === "specific_user" && !targetUserId) {
      addToast("يرجى اختيار العضو المستهدف", "error");
      return;
    }

    setIsSending(true);
    try {
      const res = await adminSendBroadcast({
        targetAudience,
        targetUserId: targetAudience === "specific_user" ? targetUserId : undefined,
        title: title.trim(),
        content: content.trim(),
      });

      if (res.ok) {
        addToast(
          targetAudience === "all" 
            ? "تم بث الإشعار بنجاح لجميع مستخدمي المنصة!" 
            : targetAudience === "specific_user"
            ? "تم إرسال الإشعار بنجاح للعضو المحدد!"
            : "تم إرسال الإشعار للشريحة المستهدفة بنجاح!",
          "success"
        );
        setTitle("");
        setContent("");
        if (onClearInitialTarget) onClearInitialTarget();
      } else {
        addToast(res.error || "فشل إرسال الإشعار", "error");
      }
    } finally {
      setIsSending(false);
    }
  };

  const selectedUserObj = profiles.find(p => p.id === targetUserId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>مركز البث والإشعارات الإدارية والتنبيهات</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            أرسل تنبيهات فورية داخل التطبيق لكافة الأعضاء أو لشرائح محددة (البريميوم، العاديين، أو عضو معين)
          </p>
        </div>
      </div>

      {/* Broadcast Form */}
      <form onSubmit={handleSend} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        {/* Target Audience Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">الفئة المستهدفة للإشعار:</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { id: "all", label: "كافة الأعضاء (الكل)", icon: Users },
              { id: "regular_only", label: "الأعضاء العاديين فقط", icon: User },
              { id: "premium_only", label: "أعضاء البريميوم فقط", icon: Sparkles },
              { id: "males_only", label: "الرجال (العرسان) فقط", icon: Users },
              { id: "females_only", label: "النساء (العرائس) فقط", icon: Users },
              { id: "specific_user", label: "عضو محدد بالاسم/الرقم", icon: User },
            ].map(opt => {
              const Icon = opt.icon;
              const isSelected = targetAudience === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setTargetAudience(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-right text-xs font-bold transition flex items-center gap-2 ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/10"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-600" : "text-slate-400"}`} />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Specific User Selection (if selected) */}
        {targetAudience === "specific_user" && (
          <div className="bg-emerald-50/60 border border-emerald-200/70 p-3.5 rounded-2xl space-y-2 animate-in fade-in duration-200">
            <label className="text-xs font-bold text-emerald-900 block">اختر العضو المستهدف:</label>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">-- اضغط لاختيار عضو من القائمة --</option>
              {profiles.filter(p => p.name).map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.memberNumber}) • {p.gender === Gender.MALE ? "عريس" : "عروسة"} {p.isPremium ? "★ بريميوم" : ""}
                </option>
              ))}
            </select>

            {selectedUserObj && (
              <div className="text-[11px] text-emerald-800 font-medium">
                العضو المختار: <span className="font-bold">{selectedUserObj.name}</span> ({selectedUserObj.memberNumber})
              </div>
            )}
          </div>
        )}

        {/* Preset Templates */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 block">نماذج رسائل جاهزة وسريعة:</label>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => {
                  setTitle(preset.title);
                  setContent(preset.content);
                }}
                className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition"
              >
                {preset.title.slice(0, 28)}...
              </button>
            ))}
          </div>
        </div>

        {/* Message Title */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">عنوان التنبيه أو الإشعار</label>
          <input
            type="text"
            required
            placeholder="مثال: تنبيه هام من إدارة منصة مودة ورحمة"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Message Content */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">نص الرسالة والإشعار</label>
          <textarea
            required
            rows={4}
            placeholder="اكتب التوجيه أو الإشعار بالتفصيل هنا..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSending}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{isSending ? "جاري البث والإرسال..." : "إرسال الإشعار الآن"}</span>
        </button>
      </form>
    </div>
  );
};
