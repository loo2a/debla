import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { Gender } from "../types";
import { 
  Shield, Users, Sparkles, Check, X, AlertTriangle, 
  Trash2, Award, ShieldCheck, RefreshCw, CheckCircle2,
  Lock, Tag, Bell, BarChart3, ChevronLeft, Camera
} from "lucide-react";
import { AdminUsersManager } from "./admin/AdminUsersManager";
import { AdminCouponsManager } from "./admin/AdminCouponsManager";
import { AdminBroadcastManager } from "./admin/AdminBroadcastManager";
import { AdminAnalyticsDashboard } from "./admin/AdminAnalyticsDashboard";

type AdminTab = "analytics" | "users" | "photos" | "requests" | "coupons" | "broadcast" | "edit_requests" | "reports" | "stories";

export const AdminPanel: React.FC = () => {
  const { 
    isAdmin, profiles, premiumRequests, interactions, successStories, dbError, isSupabaseLoading,
    adminApprovePremium, adminRejectPremium, adminApproveStory, retryLoadData,
    profileEditRequests, adminReviewProfileEditRequest,
    adminApprovePhoto, adminRejectPhoto
  } = useApp();
  const { addToast, showConfirm } = useUIStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [isRetrying, setIsRetrying] = useState(false);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [targetedUserIdForBroadcast, setTargetedUserIdForBroadcast] = useState<string | null>(null);

  // Guard: Only admins can view this panel
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const pendingRequests = premiumRequests.filter(r => r.status === "pending");
  const reports = interactions.filter(i => i.type === "report");
  const pendingStories = successStories.filter(s => !s.isApproved);
  const pendingEditRequests = profileEditRequests.filter(r => r.status === "pending");
  const pendingPhotos = profiles.filter(p => p.photoModerationStatus === "pending_approval" || p.photoModerationStatus === "frozen_by_reports");

  const handleRetrySync = async () => {
    setIsRetrying(true);
    await retryLoadData();
    setIsRetrying(false);
  };

  const handleSelectUserForBroadcast = (userId: string) => {
    setTargetedUserIdForBroadcast(userId);
    setActiveTab("broadcast");
  };

  const navItems = [
    { id: "analytics", label: "نظرة عامة وإحصائيات", icon: BarChart3, badge: null },
    { id: "photos", label: "مراجعة واعتماد الصور", icon: Camera, badge: pendingPhotos.length, badgeColor: "bg-rose-500" },
    { id: "users", label: "التحكم في الحسابات", icon: Users, badge: profiles.filter(p => p.name).length },
    { id: "requests", label: "إدارة الاشتراكات", icon: Sparkles, badge: pendingRequests.length, badgeColor: "bg-amber-500" },
    { id: "coupons", label: "الخصومات والكوبونات", icon: Tag, badge: null },
    { id: "broadcast", label: "إرسال الإشعارات", icon: Bell, badge: null },
    { id: "edit_requests", label: "طلبات التعديل", icon: Lock, badge: pendingEditRequests.length, badgeColor: "bg-rose-500" },
    { id: "reports", label: "البلاغات", icon: AlertTriangle, badge: reports.length },
    { id: "stories", label: "قصص النجاح", icon: Award, badge: pendingStories.length },
  ];

  return (
    <div className="pb-28 pt-4 font-sans text-right bg-slate-50 min-h-screen" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 space-y-5">
        
        {/* Title Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-700 rounded-2xl mb-1 shadow-sm">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-800">بوابة الإدارة والمتابعة الشرعية الشاملة</h2>
          <p className="text-xs text-slate-500 font-medium">
            مركز القيادة والتحكم في الحسابات، الاشتراكات، الكوبونات، الإشعارات وطلبات التدقيق
          </p>
        </div>

        {/* Database Status Alert */}
        {dbError ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl flex-shrink-0 mt-0.5 md:mt-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-amber-900 text-xs">تنبيه اتصال بقاعدة البيانات (Supabase)</h4>
                <p className="text-[11px] text-amber-800 leading-relaxed">{dbError}</p>
              </div>
            </div>
            <button
              onClick={handleRetrySync}
              disabled={isRetrying}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition flex-shrink-0 self-end md:self-auto cursor-pointer"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-xs">قاعدة البيانات متصلة ومزامنة</h4>
                <p className="text-[10px] text-emerald-700">بيانات الأعضاء والاشتراكات محدثة ومباشرة</p>
              </div>
            </div>
            <button
              onClick={handleRetrySync}
              disabled={isRetrying || isSupabaseLoading}
              className="p-2 text-emerald-800 hover:bg-emerald-100 rounded-xl transition flex-shrink-0 cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
            </button>
          </div>
        )}

        {/* Admin Navigation Pills Bar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-2 shadow-xs overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {navItems.map(item => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono text-white ${item.badgeColor || (isSelected ? "bg-white/30" : "bg-emerald-600")}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* Tab 1: Overview Analytics */}
        {/* ======================================================== */}
        {activeTab === "analytics" && <AdminAnalyticsDashboard />}

        {/* ======================================================== */}
        {/* Tab 2: Users Management & Multi-tier Verification */}
        {/* ======================================================== */}
        {activeTab === "users" && (
          <AdminUsersManager onSelectUserForBroadcast={handleSelectUserForBroadcast} />
        )}

        {/* ======================================================== */}
        {/* Tab: Photo Moderation & Dignity Defense (مراجعة الصور) */}
        {/* ======================================================== */}
        {activeTab === "photos" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-1">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>مركز مراجعة واعتماد الصور الشخصية (خط الدفاع الثاني)</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                أي صورة يرفعها مستخدم مميز تبقى معلقة ومخفية عن العامة ويظهر الأفاتار الكرتوني بدلاً منها حتى تقوم باعتمادها أو رفضها.
              </p>
            </div>

            {pendingPhotos.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-slate-100 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">كل شيء آمن ومضبوط!</h4>
                <p className="text-xs text-slate-400">لا توجد أي صور شخصية معلقة بانتظار المراجعة حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingPhotos.map((user) => {
                  const isFrozen = user.photoModerationStatus === "frozen_by_reports";
                  return (
                    <div key={user.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs">{user.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({user.memberNumber})</span>
                        </div>
                        {isFrozen ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            مجمدة ببلاغات ({user.photoReportsCount || 2})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            بانتظار الاعتماد
                          </span>
                        )}
                      </div>

                      {/* عرض الصورة الشخصية المطلوب مراجعتها */}
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">لا يوجد رابط صورة</span>
                        )}
                      </div>

                      <div className="space-y-2 pt-1">
                        <input
                          type="text"
                          placeholder="سبب الرفض إن وجدت مخالفة (اختياري)..."
                          value={rejectNotes[user.id] || ""}
                          onChange={(e) => setRejectNotes(prev => ({ ...prev, [user.id]: e.target.value }))}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              const res = await adminApprovePhoto(user.id);
                              if (res.ok) addToast("تم اعتماد الصورة ونشرها بنجاح!", "success");
                              else addToast(res.error || "تعذر الاعتماد", "error");
                            }}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>اعتماد الصورة</span>
                          </button>

                          <button
                            onClick={async () => {
                              const reason = rejectNotes[user.id] || "الصورة غير مطابقة لمعايير الوقار والوضوح.";
                              const res = await adminRejectPhoto(user.id, reason);
                              if (res.ok) addToast("تم رفض الصورة وحذفها بنجاح", "info");
                              else addToast(res.error || "تعذر الرفض", "error");
                            }}
                            className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>رفض وحذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* Tab 3: Subscriptions and Premium Requests */}
        {/* ======================================================== */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-xs">طلبات تفعيل الاشتراكات المميزة المعلقة</h3>
            
            {pendingRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400 text-xs">
                لا توجد أي طلبات اشتراك معلقة حالياً.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(req => (
                  <div key={req.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="font-extrabold text-slate-800 text-sm">{req.userName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          عضوية رقم: {req.userId} • جنس العضو: {req.userGender === Gender.MALE ? "ذكر" : "أنثى"}
                        </p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        طلب: {req.planDuration}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                      <p>طريقة الدفع: <span className="font-bold text-slate-800">{req.paymentMethod}</span></p>
                      {req.phoneNumber && <p>رقم التحويل المحول منه: <span className="font-bold text-emerald-700 font-mono">{req.phoneNumber}</span></p>}
                      <p>تاريخ تقديم الطلب: <span className="font-mono">{new Date(req.timestamp).toLocaleString("ar-EG")}</span></p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          const res = await adminApprovePremium(req.id);
                          if (res.ok) {
                            addToast("تمت الموافقة وتفعيل اشتراك التميز للعضو وتحديث صلاحياته!", "success");
                          } else {
                            addToast(res.error || "فشل تفعيل الاشتراك", "error");
                          }
                        }}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-emerald-600/10 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>موافقة وتفعيل التميز</span>
                      </button>

                      <button
                        onClick={async () => {
                          const res = await adminRejectPremium(req.id);
                          if (res.ok) {
                            addToast("تم رفض طلب الاشتراك وإشعار العضو.", "info");
                          } else {
                            addToast(res.error || "فشل رفض الطلب", "error");
                          }
                        }}
                        className="w-1/3 py-2 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>رفض الطلب</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* Tab 4: Coupons and Discounts Management */}
        {/* ======================================================== */}
        {activeTab === "coupons" && <AdminCouponsManager />}

        {/* ======================================================== */}
        {/* Tab 5: Broadcast and Targeted Notifications */}
        {/* ======================================================== */}
        {activeTab === "broadcast" && (
          <AdminBroadcastManager 
            initialTargetUserId={targetedUserIdForBroadcast}
            onClearInitialTarget={() => setTargetedUserIdForBroadcast(null)}
          />
        )}

        {/* ======================================================== */}
        {/* Tab 6: Profile Locked Edit Requests */}
        {/* ======================================================== */}
        {activeTab === "edit_requests" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-600" />
                <span>طلبات تعديل البيانات الأساسية المقفلة ({pendingEditRequests.length})</span>
              </h3>
            </div>

            {profileEditRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400 text-xs">
                لا توجد أي طلبات تعديل بيانات مقدمة حالياً.
              </div>
            ) : (
              <div className="space-y-4">
                {profileEditRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm">
                          {req.userName || "عضو"} ({req.userMemberNumber || req.userId})
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          تاريخ الطلب: {new Date(req.createdAt).toLocaleString("ar-EG")}
                        </p>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : req.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {req.status === "pending" ? "قيد المراجعة" : req.status === "approved" ? "تم الاعتماد" : "مرفوض"}
                      </span>
                    </div>

                    {/* Requested Changes Details */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold block">التعديلات المطلوبة:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {Object.entries(req.requestedChanges).map(([key, val]) => (
                          <div key={key} className="bg-white p-2 rounded-lg border border-slate-100 flex justify-between">
                            <span className="text-slate-500">
                              {key === "name" ? "الاسم" : key === "age" ? "السن" : key === "gender" ? "الجنس" : key === "maritalStatus" ? "الحالة الاجتماعية" : key === "nationality" ? "الجنسية" : key}:
                            </span>
                            <span className="text-slate-800 font-bold">
                              {key === "gender" ? (val === Gender.MALE ? "رجل (عريس)" : "امرأة (عروسة)") : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Justification Reason */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">مبرر طلب التعديل:</span>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                        "{req.reason}"
                      </p>
                    </div>

                    {/* Admin Action Bar */}
                    {req.status === "pending" ? (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <input
                          type="text"
                          placeholder="ملاحظات الإدارة (اختياري، مثلاً: تم التحقق من بطاقة الهوية)"
                          value={rejectNotes[req.id] || ""}
                          onChange={(e) => setRejectNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              const res = await adminReviewProfileEditRequest(req.id, "approved", rejectNotes[req.id]);
                              if (res.ok) {
                                addToast("تم اعتماد طلب التعديل وتحديث بيانات العضو فوراً!", "success");
                              } else {
                                addToast(res.error || "فشل اعتماد الطلب", "error");
                              }
                            }}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>موافقة وتحديث البيانات فوراً</span>
                          </button>
                          <button
                            onClick={async () => {
                              const res = await adminReviewProfileEditRequest(req.id, "rejected", rejectNotes[req.id] || "لم يتم تقديم إثبات كافٍ");
                              if (res.ok) {
                                addToast("تم رفض طلب التعديل وإشعار العضو بالملاحظة.", "info");
                              } else {
                                addToast(res.error || "فشل رفض الطلب", "error");
                              }
                            }}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            <span>رفض الطلب</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 pt-1">
                        تمت المراجعة {req.adminNotes && `• ملاحظة الإدارة: ${req.adminNotes}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* Tab 7: Reports and Safety Violations */}
        {/* ======================================================== */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-xs">بلاغات المخالفات الشرعية والأخلاقية ({reports.length})</h3>

            {reports.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400 text-xs">
                لا توجد أي بلاغات مسجلة حالياً، المجتمع يسير وفق الضوابط الشرعية والحمد لله.
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        بلاغ مخالفة
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(report.timestamp).toLocaleString("ar-EG")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/70">
                      سبب البلاغ: {report.reason || "لم يذكر سبب محدد"}
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      مقدم البلاغ: {report.fromUserId} • المبلغ عنه: {report.toUserId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* Tab 8: Marriage Success Stories */}
        {/* ======================================================== */}
        {activeTab === "stories" && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-xs">قصص النجاح والزواج المبارك المعلقة</h3>

            {pendingStories.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400 text-xs">
                لا توجد أي قصص زواج جديدة بانتظار الاعتماد.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingStories.map((story) => (
                  <div key={story.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-xs">
                        زواج المبارك: {story.husbandName} و {story.wifeName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">{story.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      "{story.story}"
                    </p>
                    <button
                      onClick={async () => {
                        const res = await adminApproveStory(story.id);
                        if (res.ok) addToast("تم اعتماد قصة النجاح ونشرها للجميع!", "success");
                        else addToast(res.error || "فشل الاعتماد", "error");
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>اعتماد القصة ونشرها</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
