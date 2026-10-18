import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { getAvatarUrl } from "../lib/avatarUtils";
import { 
  Menu, ArrowRight, Shield, Sparkles, Search, 
  Bell, User, ShieldAlert, Heart, EyeOff, Users, 
  HelpCircle, FileText, Info
} from "lucide-react";

export const AppHeader: React.FC = () => {
  const { currentUser } = useApp();
  const { setSidebarOpen } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const pathname = location.pathname;

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

  return (
    <header 
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm"
      dir="rtl"
    >
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
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

        {/* Left side: User Avatar */}
        <div className="flex items-center">
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
