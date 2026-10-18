import React, { useState } from "react";
import { UserProfile, Gender } from "../../types";
import { getAvatarUrl } from "../../lib/avatarUtils";
import { getUserVerificationTiers } from "../../lib/verificationTiers";
import { VerificationTierType } from "../../types";
import { 
  Search, ShieldCheck, Award, Trash2, Camera, Smartphone, 
  FileCheck2, Check, X, Sparkles, Filter, Calendar, Eye
} from "lucide-react";
import { useApp } from "../../lib/store";
import { useUIStore } from "../../stores/uiStore";

interface AdminUsersManagerProps {
  onSelectUserForBroadcast?: (userId: string) => void;
}

export const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({ onSelectUserForBroadcast }) => {
  const { 
    profiles, adminVerifyUser, adminUpdateTierVerification,
    adminDeleteUser, adminGrantPremium, adminRevokePremium 
  } = useApp();
  const { addToast, showConfirm } = useUIStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "premium" | "regular" | "verified" | "unverified">("all");
  const [filterGender, setFilterGender] = useState<"all" | "male" | "female">("all");
  const [quickGrantDays, setQuickGrantDays] = useState<Record<string, number>>({});

  const filteredUsers = profiles.filter(user => {
    if (!user.name) return false;
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.memberNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.residence && user.residence.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (filterGender !== "all" && user.gender !== filterGender) return false;

    if (filterType === "premium" && !user.isPremium) return false;
    if (filterType === "regular" && user.isPremium) return false;
    if (filterType === "verified" && !user.isVerified) return false;
    if (filterType === "unverified" && user.isVerified) return false;

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث بالاسم، رقم العضوية، المدينة، أو البريد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            تصفية:
          </span>

          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
          >
            <option value="all">كل العضويات ({profiles.filter(p => p.name).length})</option>
            <option value="premium">البريميوم فقط</option>
            <option value="regular">العادي فقط</option>
            <option value="verified">الموثقين فقط</option>
            <option value="unverified">غير الموثقين</option>
          </select>

          <select
            value={filterGender}
            onChange={(e: any) => setFilterGender(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
          >
            <option value="all">كل الأجناس</option>
            <option value="male">رجال فقط</option>
            <option value="female">نساء فقط</option>
          </select>

          <span className="text-[11px] text-slate-400 mr-auto font-medium">
            المعروض: {filteredUsers.length} من {profiles.length}
          </span>
        </div>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400 text-xs">
            لم يتم العثور على أي أعضاء مطابقين للبحث.
          </div>
        ) : (
          filteredUsers.map(user => {
            const tiers = getUserVerificationTiers(user);
            return (
              <div key={user.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3.5">
                {/* User Header */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={getAvatarUrl(user)} 
                      alt="" 
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.isPremium && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                            بريميوم
                          </span>
                        )}
                        {user.isVerified && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                            موثق
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {user.memberNumber} • {user.gender === Gender.MALE ? "ذكر" : "أنثى"} • {user.age} سنة • {user.residence}
                      </p>
                      {user.email && (
                        <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {onSelectUserForBroadcast && (
                      <button
                        onClick={() => onSelectUserForBroadcast(user.id)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-[10px] font-bold transition"
                        title="إرسال إشعار مباشر لهذا العضو"
                      >
                        إشعار مخصص
                      </button>
                    )}
                    <button
                      onClick={() => {
                        showConfirm({
                          title: "حذف العضو",
                          message: `هل أنت متأكد من حذف حساب (${user.name}) بالكامل من النظام؟`,
                          confirmText: "نعم، حذف الحساب",
                          cancelText: "إلغاء",
                          onConfirm: async () => {
                            const res = await adminDeleteUser(user.id);
                            if (res.ok) {
                              addToast(`تم حذف حساب العضو ${user.name} بنجاح.`, "info");
                            } else {
                              addToast(res.error || "فشل حذف العضو", "error");
                            }
                          }
                        });
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="حذف الحساب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Verification Tiers Checklist */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/80 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>مستويات التوثيق الشرعي:</span>
                    <button
                      onClick={async () => {
                        const res = await adminVerifyUser(user.id);
                        if (res.ok) {
                          addToast(`تم تحديث التوثيق العام لـ ${user.name}`, "success");
                        }
                      }}
                      className="text-emerald-700 hover:underline text-[10px]"
                    >
                      {user.isVerified ? "إلغاء التوثيق العام" : "منح التوثيق العام"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                    {tiers.map(t => (
                      <button
                        key={t.tier.id}
                        onClick={async () => {
                          const res = await adminUpdateTierVerification(user.id, t.tier.id as VerificationTierType, !t.isVerified);
                          if (res.ok) {
                            addToast(`تم ${t.isVerified ? "إلغاء" : "تفعيل"} توثيق (${t.tier.title}) للمستخدم`, "success");
                          } else {
                            addToast(res.error || "فشل التحديث", "error");
                          }
                        }}
                        className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-between transition ${
                          t.isVerified 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        <span className="truncate">{t.tier.badgeLabel}</span>
                        {t.isVerified ? <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" /> : <X className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Premium Control */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-600 font-bold">حالة التميز:</span>
                    {user.isPremium ? (
                      <span className="text-[11px] text-emerald-700 font-bold">
                        نشط {user.premiumExpiryDate && `(حتى ${new Date(user.premiumExpiryDate).toLocaleDateString("ar-EG")})`}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">عضوية عادية</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mr-auto">
                    {user.isPremium ? (
                      <button
                        onClick={async () => {
                          const res = await adminRevokePremium(user.id);
                          if (res.ok) addToast(`تم إلغاء التميز عن ${user.name}`, "info");
                        }}
                        className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px] font-bold transition"
                      >
                        إلغاء التميز
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <select
                          value={quickGrantDays[user.id] || 30}
                          onChange={(e) => setQuickGrantDays(prev => ({ ...prev, [user.id]: Number(e.target.value) }))}
                          className="text-[10px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
                        >
                          <option value={7}>أسبوع (7 أيام)</option>
                          <option value={30}>شهر (30 يوماً)</option>
                          <option value={90}>3 شهور</option>
                          <option value={180}>6 شهور</option>
                          <option value={365}>سنة كاملة</option>
                        </select>
                        <button
                          onClick={async () => {
                            const days = quickGrantDays[user.id] || 30;
                            const res = await adminGrantPremium(user.id, days);
                            if (res.ok) addToast(`تم ترقية ${user.name} إلى بريميوم لمدة ${days} يوماً!`, "success");
                            else addToast(res.error || "فشل الترقية", "error");
                          }}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-0.5"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>ترقية بريميوم</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
