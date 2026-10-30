import React, { useState, useEffect } from "react";
import { useApp } from "../../lib/store";
import { useUIStore } from "../../stores/uiStore";
import { 
  ShieldAlert, Smartphone, Mail, AlertTriangle, RefreshCw, 
  CheckCircle2, Ban, UserX, Clock, ChevronLeft, ShieldCheck, 
  HelpCircle, Trash2, Search
} from "lucide-react";
import { BannedEntity, RecurrentEvader } from "../../lib/store/types";

export const AdminDeviceSecurityManager: React.FC = () => {
  const { 
    bannedList, recurrentEvaders, fetchBannedList, fetchRecurrentEvaders,
    adminBanUser, adminUnban, profiles 
  } = useApp();
  const { addToast, showConfirm } = useUIStore();

  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "device" | "email">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Quick manual ban modal state
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [banType, setBanType] = useState<"email" | "device">("email");
  const [banReason, setBanReason] = useState("مخالفة ميثاق الاستخدام والوقار");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchBannedList(), fetchRecurrentEvaders()]);
    setIsLoading(false);
  };

  const handleExecuteBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      addToast("يرجى اختيار العضو المراد حظره.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminBanUser(selectedUserId, banType, banReason);
      if (res.ok) {
        addToast(
          banType === "device" 
            ? "تم حظر الجهاز بالكامل (Android ID) وحذف الحساب بنجاح."
            : "تم حظر البريد الإلكتروني ومنع التسجيل به وحذف الحساب بنجاح.",
          "success"
        );
        setShowBanModal(false);
        setSelectedUserId("");
        setBanReason("مخالفة ميثاق الاستخدام والوقار");
      } else {
        addToast(res.error || "فشل تنفيذ عملية الحظر.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantDeviceBan = (evader: RecurrentEvader) => {
    showConfirm({
      title: "حظر الجهاز بالكامل (Android ID)",
      message: `العضو (${evader.userName}) مسجل حالياً بإيميل (${evader.currentEmail || "غير محدد"}) على نفس الجهاز الذي تم حظر إيميل (${evader.bannedEmail}) عليه سابقاً. هل تريد حظر هذا الهاتف بالكامل ومنع أي حساب من الدخول عليه؟`,
      confirmText: "نعم، حظر الجهاز نهائياً",
      cancelText: "إلغاء",
      isDangerous: true,
      onConfirm: async () => {
        const res = await adminBanUser(evader.userId, "device", `تكرار التسجيل بعد حظر الإيميل (${evader.bannedEmail})`);
        if (res.ok) {
          addToast(`تم حظر هاتف (${evader.userName}) بنجاح عبر معرف الجهاز.`, "success");
        } else {
          addToast(res.error || "فشل حظر الجهاز.", "error");
        }
      }
    });
  };

  const handleUnban = (item: BannedEntity) => {
    const label = item.banType === "device" ? "معرف الجهاز" : "البريد الإلكتروني";
    showConfirm({
      title: `إلغاء الحظر عن ${label}`,
      message: `هل أنت متأكد من إلغاء الحظر عن (${item.identifier}) والسماح له بالدخول أو التسجيل مجدداً؟`,
      confirmText: "نعم، إلغاء الحظر",
      cancelText: "تراجع",
      onConfirm: async () => {
        const res = await adminUnban(item.id);
        if (res.ok) {
          addToast("تم إلغاء الحظر بنجاح.", "success");
        } else {
          addToast(res.error || "فشل إلغاء الحظر.", "error");
        }
      }
    });
  };

  const filteredBans = bannedList.filter(item => {
    if (filterType !== "all" && item.banType !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.identifier.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeDeviceBans = bannedList.filter(b => b.banType === "device" && b.isActive).length;
  const activeEmailBans = bannedList.filter(b => b.banType === "email" && b.isActive).length;

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm">منظومة أمان الأجهزة والحظر المتدرج</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                التحكم في حظر البريد الإلكتروني أو حظر الهاتف كاملاً (Android ID) ورصد محاولات الالتفاف
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowBanModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>إجراء حظر جديد</span>
            </button>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-rose-50/60 border border-rose-100/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-rose-700 font-bold">أجهزة محظورة تماماً</p>
              <h4 className="text-xl font-black text-rose-900">{activeDeviceBans}</h4>
            </div>
            <div className="p-2 bg-rose-100/80 text-rose-700 rounded-lg">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-100/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-amber-700 font-bold">إيميلات محظورة من التسجيل</p>
              <h4 className="text-xl font-black text-amber-900">{activeEmailBans}</h4>
            </div>
            <div className="p-2 bg-amber-100/80 text-amber-700 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-purple-50/60 border border-purple-100/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-purple-700 font-bold">محاولات عودة مرصودة</p>
              <h4 className="text-xl font-black text-purple-900">{recurrentEvaders.length}</h4>
            </div>
            <div className="p-2 bg-purple-100/80 text-purple-700 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Recurrent Evaders Section (كشف المتسللين العائدين بنفس الهاتف) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs">رصد محاولات العودة (سجلوا بإيميل مختلف من نفس الهاتف المحظور)</h4>
              <p className="text-[10px] text-slate-400">
                هؤلاء المستخدمون تم حظر إيميلهم سابقاً، وتم رصدهم يسجلون حالياً بحساب جديد من نفس معرّف الجهاز
              </p>
            </div>
          </div>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
            {recurrentEvaders.length} حالة
          </span>
        </div>

        {recurrentEvaders.length === 0 ? (
          <div className="text-center py-6 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5 opacity-80" />
            <p className="text-xs font-bold text-slate-600">لا توجد محاولات تسلل أو عودة حالياً</p>
            <p className="text-[10px] text-slate-400 mt-0.5">النظام يراقب باستمرار بصمات الأجهزة لمنع تكرار الإساءة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recurrentEvaders.map((evader, idx) => (
              <div 
                key={`${evader.userId}-${idx}`}
                className="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-xs">{evader.userName}</span>
                    {evader.memberNumber && (
                      <span className="bg-slate-200 text-slate-700 text-[9px] font-mono px-1.5 py-0.5 rounded">
                        {evader.memberNumber}
                      </span>
                    )}
                    <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      عائد متسلل
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-600">
                    <p>
                      <span className="text-slate-400">البريد الحالي: </span>
                      <span className="font-mono font-medium text-slate-700">{evader.currentEmail || "غير متاح"}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">البريد المحظور سابقاً: </span>
                      <span className="font-mono font-bold text-rose-700">{evader.bannedEmail}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">موديل الهاتف: </span>
                      <span className="font-medium text-slate-700">{evader.deviceModel || "هاتف أندرويد"}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">تاريخ الدخول الجديد: </span>
                      <span className="font-medium text-slate-700">
                        {new Date(evader.reentryAt).toLocaleDateString("ar-EG")}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleInstantDeviceBan(evader)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer flex-shrink-0"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>حظر الجهاز نهائياً الآن</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banned List & Search Table */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs">سجل المحظورين وإلغاء الحظر</h4>
              <p className="text-[10px] text-slate-400">إدارة كافة الأجهزة والإيميلات المحظورة مع إمكانية رفع الحظر</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterType === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              الكل ({bannedList.length})
            </button>
            <button
              onClick={() => setFilterType("device")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterType === "device" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              أجهزة ({activeDeviceBans})
            </button>
            <button
              onClick={() => setFilterType("email")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterType === "email" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              إيميلات ({activeEmailBans})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث بالمعرّف أو الإيميل أو سبب الحظر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        {/* List */}
        {filteredBans.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            لا توجد سجلات مطابقة في قائمة الحظر.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBans.map((item) => (
              <div 
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`p-2 rounded-xl mt-0.5 ${
                    item.banType === "device" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {item.banType === "device" ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {item.identifier}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        item.banType === "device" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {item.banType === "device" ? "حظر هاتف (Android ID)" : "حظر بريد إلكتروني"}
                      </span>
                      {!item.isActive && (
                        <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          تم إلغاء الحظر
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      السبب: <span className="text-slate-700">{item.reason}</span>
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      تاريخ الحظر: {new Date(item.createdAt).toLocaleString("ar-EG")}
                    </p>
                  </div>
                </div>

                {item.isActive ? (
                  <button
                    onClick={() => handleUnban(item)}
                    className="self-end sm:self-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>إلغاء الحظر</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold self-end sm:self-auto">
                    الحظر غير نشط
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-600" />
                <span>إجراء حظر متدرج لمستخدم</span>
              </h3>
              <button 
                onClick={() => setShowBanModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteBan} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اختر العضو المراد حظره:</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="">-- اضغط لاختيار عضو --</option>
                  {profiles.filter(p => p.name).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.memberNumber}) {p.email ? `- ${p.email}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">درجة الحظر المطلوبة:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBanType("email")}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                      banType === "email" 
                        ? "bg-amber-50 border-amber-300 text-amber-900 shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                      <span>حظر الإيميل فقط</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      يمنع الدخول أو إنشاء حساب جديد بنفس البريد، مع حذف الحساب الحالي.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBanType("device")}
                    className={`p-3 rounded-xl border text-right transition cursor-pointer ${
                      banType === "device" 
                        ? "bg-rose-50 border-rose-300 text-rose-900 shadow-xs" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Smartphone className="w-3.5 h-3.5 text-rose-600" />
                      <span>حظر الجهاز كاملاً</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      حظر معرّف الجهاز (Android ID) نهائياً ومنع فتح أي حساب من نفس الهاتف.
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">سبب الحظر (موجز للإدارة):</label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="اكتب سبب الحظر..."
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBanModal(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedUserId}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التنفيذ...</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" />
                      <span>تنفيذ الحظر الآن</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
