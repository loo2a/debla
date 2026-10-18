import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { getAvatarUrl } from "../lib/avatarUtils";
import { 
  Menu, ArrowRight, Shield, Sparkles, Search, 
  Bell, User, ShieldAlert, Heart, EyeOff, Users, 
  HelpCircle, FileText, Info, Share2, Check, ExternalLink, X
} from "lucide-react";
import { shareMawadaApp } from "../lib/shareUtils";

export const AppHeader: React.FC = () => {
  const { currentUser, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const { setSidebarOpen, addToast } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // إغلاق قائمة الإشعارات عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  if (!currentUser) return null;

  const pathname = location.pathname;

  // الإشعارات الخاصة بالمستخدم الحالي
  const myNotifications = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  // فحص ما إذا كانت الصفحة الحالية صفحة فرعية تحتاج زر رجوع
  const isHome = pathname === "/" || pathname === "/home";
  const isMainTab = isHome || pathname === "/search" || pathname === "/inbox" || pathname === "/premium" || pathname === "/my-profile";
  const isSubPage = !isMainTab;

  // تحديد عنوان وأيقونة الصفحة الحالية
  const getPageInfo = () => {
    if (isHome) {
      return {
        title: "مودة ورحمة",
        subtitle: "نظام إسلامي جاد",
        isBrand: true,
      };
    }
    if (pathname.startsWith("/search")) {
      return { title: "البحث والاستكشاف", icon: Search };
    }
    if (pathname.startsWith("/inbox")) {
      return { title: "الرسائل والتنبيهات", icon: Bell };
    }
    if (pathname.startsWith("/premium")) {
      return { title: "باقة التميز", icon: Sparkles, iconColor: "text-amber-500 fill-amber-300" };
    }
    if (pathname.startsWith("/my-profile")) {
      return { title: "ملفي الشخصي", icon: User };
    }
    if (pathname.startsWith("/admin")) {
      return { title: "لوحة تحكم المدير", icon: ShieldAlert, iconColor: "text-rose-600" };
    }
    if (pathname.startsWith("/profile/")) {
      return { title: "الملف التعريفي", icon: User };
    }
    if (pathname.startsWith("/success-stories")) {
      return { title: "قصص النجاح والمباركة", icon: Heart, iconColor: "text-rose-500 fill-rose-100" };
    }
    if (pathname.startsWith("/interests")) {
      return { title: "قائمة الاهتمامات", icon: Heart, iconColor: "text-rose-500" };
    }
    if (pathname.startsWith("/who-interested")) {
      return { title: "من أبدى اهتماماً بي", icon: Users };
    }
    if (pathname.startsWith("/ignored")) {
      return { title: "قائمة المتجاهلين", icon: EyeOff };
    }
    if (pathname.startsWith("/contact")) {
      return { title: "الدعم والتواصل", icon: HelpCircle };
    }
    if (pathname.startsWith("/terms") || pathname.startsWith("/charter")) {
      return { title: "الشروط والضوابط الشرعية", icon: FileText };
    }
    if (pathname.startsWith("/privacy")) {
      return { title: "سياسة الخصوصية", icon: Info };
    }
    if (pathname.startsWith("/delete-account")) {
      return { title: "حذف الحساب نهائياً", icon: ShieldAlert, iconColor: "text-rose-600" };
    }
    return { title: "مودة ورحمة", isBrand: true };
  };

  const pageInfo = getPageInfo();
  const Icon = pageInfo.icon;

  const handleShare = async () => {
    const res = await shareMawadaApp();
    if (res.success && res.method === "clipboard") {
      addToast("تم نسخ رابط تطبيق مودة ورحمة بنجاح! شاركه مع الأهل والأصدقاء.", "success");
    }
  };

  return (
    <header 
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm"
      dir="rtl"
    >
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between relative">
        {/* Right side: Sidebar Toggle Button + Back Button on Subpages */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-1.5 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
            aria-label="فتح القائمة الرئيسية"
            title="القائمة الرئيسية"
          >
            <Menu className="w-6 h-6" />
          </button>

          {isSubPage && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              aria-label="الرجوع للخلف"
              title="رجوع"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Center: Branding or Page Title */}
        <div className="flex items-center justify-center">
          {pageInfo.isBrand ? (
            <div className="flex items-center gap-2">
              <img
                src="/icon-192.png"
                alt="مودة ورحمة"
                className="w-7 h-7 rounded-lg object-cover shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/icon.svg";
                }}
              />
              <span className="font-black text-sm text-slate-900 tracking-tight">مودة ورحمة</span>
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>زواج شرعي</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {Icon && <Icon className={`w-4 h-4 ${pageInfo.iconColor || "text-emerald-600"}`} />}
              <span className="font-extrabold text-sm text-slate-900 truncate max-w-[180px]">
                {pageInfo.title}
              </span>
            </div>
          )}
        </div>

        {/* Left side: Share Button + Notification Bell + User Avatar */}
        <div className="flex items-center gap-1" ref={notifDropdownRef}>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition active:scale-95 cursor-pointer"
            aria-label="مشاركة التطبيق"
            title="مشاركة التطبيق مع الأهل والأصدقاء"
          >
            <Share2 className="w-4.5 h-4.5" />
          </button>

          {/* 🔔 أيقونة جرس الإشعارات اللحظية مثل فيسبوك */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(prev => !prev)}
              className={`relative p-2 rounded-xl transition active:scale-95 cursor-pointer ${
                isNotifOpen 
                  ? "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/30" 
                  : "text-slate-700 hover:text-emerald-700 hover:bg-slate-100"
              }`}
              aria-label="الإشعارات اللحظية"
              title="الإشعارات"
            >
              <Bell className={`w-5 h-5 ${unreadCount > 0 ? "animate-wiggle" : ""}`} />
              
              {unreadCount > 0 && (
                <span className="absolute 0 top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm font-mono animate-pulse">
                  {unreadCount > 99 ? "+99" : unreadCount}
                </span>
              )}
            </button>

            {/* نافذة الإشعارات المنسدلة (Facebook-Style Dropdown) */}
            {isNotifOpen && (
              <div 
                className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden text-right animate-in fade-in slide-in-from-top-2 duration-150"
                dir="rtl"
              >
                {/* Header */}
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-extrabold text-xs text-slate-800">الإشعارات اللحظية</h3>
                    {unreadCount > 0 && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {unreadCount} جديد
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllNotificationsAsRead()}
                      className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>قراءة الكل</span>
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {myNotifications.length === 0 ? (
                    <div className="p-6 text-center space-y-1.5 text-slate-400">
                      <Bell className="w-7 h-7 text-slate-200 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">لا توجد إشعارات حالياً</p>
                      <p className="text-[10px] text-slate-400">ستصلك التنبيهات فور حدوث أي تفاعل مع ملفك.</p>
                    </div>
                  ) : (
                    myNotifications.slice(0, 8).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.isRead) markNotificationAsRead(notif.id);
                          if (notif.type === "message" || notif.type === "interest") {
                            navigate("/inbox");
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-3 flex gap-2.5 items-start transition cursor-pointer hover:bg-slate-50 ${
                          !notif.isRead ? "bg-emerald-50/40" : "bg-white"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          !notif.isRead ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                            !notif.isRead ? "font-bold text-slate-900" : "text-slate-600"
                          }`}>
                            {notif.content}
                          </p>
                          <span className="text-[9px] text-slate-400 font-mono block">
                            {new Date(notif.timestamp).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-2" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer link to full inbox */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/inbox");
                      setIsNotifOpen(false);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition flex items-center justify-center gap-1 w-full py-1 cursor-pointer"
                  >
                    <span>عرض كافة الرسائل والتنبيهات</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <button
            type="button"
            onClick={() => navigate("/my-profile")}
            className="relative group p-0.5 rounded-full hover:ring-2 hover:ring-emerald-500/50 transition focus:outline-none cursor-pointer"
            aria-label="الانتقال لملفي الشخصي"
            title="حسابي"
          >
            <img
              src={getAvatarUrl(currentUser)}
              alt={currentUser.name || "الملف الشخصي"}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
              referrerPolicy="no-referrer"
            />
            {currentUser.isPremium && (
              <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-amber-400 border border-white rounded-full flex items-center justify-center">
                <Sparkles className="w-2 h-2 fill-slate-950 text-slate-950" />
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
