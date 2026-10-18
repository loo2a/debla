import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { getAvatarUrl } from "../lib/avatarUtils";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, Bell, User, Heart, EyeOff, Users, Award, 
  Sparkles, Mail, Share2, LogOut, X, ShieldAlert, ShieldCheck,
  GraduationCap
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen?: string;
  setActiveScreen?: (screen: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeScreen: propActiveScreen, 
  setActiveScreen: propSetActiveScreen 
}) => {
  const { currentUser, logout, notifications, isAdmin } = useApp();
  const { addToast, showConfirm } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleItemClick = (path: string, legacyScreenId: string) => {
    if (propSetActiveScreen) {
      propSetActiveScreen(legacyScreenId);
    }
    navigate(path);
    onClose();
  };

  const unreadNotifications = notifications.filter(n => n.userId === currentUser.id && !n.isRead).length;

  const menuItems = [
    { id: "home", path: "/", label: "الرئيسية", icon: Home },
    { 
      id: "guardian", 
      path: "/guardian", 
      label: currentUser.accountRole?.startsWith("guardian_") ? "بوابة إشراف ولي الأمر" : "وضع الولي والأسرة", 
      icon: ShieldCheck,
      highlight: currentUser.accountRole?.startsWith("guardian_")
    },
    { 
      id: "academy", 
      path: "/academy", 
      label: "أكاديمية الاستعداد للزواج", 
      icon: GraduationCap,
      badge: currentUser.academyPoints ? currentUser.academyPoints : undefined
    },
    { id: "notifications", path: "/inbox", label: "الإشعارات والبريد", icon: Bell, badge: unreadNotifications },
    { id: "profile", path: "/my-profile", label: "الملف الشخصي", icon: User },
    { id: "interests", path: "/interests", label: "قائمة الاهتمامات", icon: Heart },
    { id: "ignored", path: "/ignored", label: "قائمة التجاهل", icon: EyeOff },
    { id: "who_interested", path: "/who-interested", label: "من يهتم بي", icon: Users },
    { id: "success_stories", path: "/success-stories", label: "قصص النجاح", icon: Award },
    { id: "premium", path: "/premium", label: "الانضمام لباقة التميز", icon: Sparkles, highlight: true },
    { id: "contact_us", path: "/contact", label: "اتصل بنا", icon: Mail },
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'تطبيق الزواج الإسلامي - مودة ورحمة',
        text: 'انضم إلينا في تطبيق الزواج الإسلامي للتعارف الجاد والموثق على الطريقة الشرعية.',
        url: window.location.href,
      }).catch(console.error);
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      addToast("تم نسخ رابط التطبيق بنجاح! يمكنك مشاركته الآن مع الأصدقاء والعائلة.", "success");
    }
  };

  const handleLogoutClick = () => {
    showConfirm({
      title: "تسجيل الخروج",
      message: "هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟",
      confirmText: "تسجيل الخروج",
      isDangerous: true,
      onConfirm: async () => {
        await logout();
        onClose();
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950 z-40"
          />

          {/* Sidebar drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col font-sans text-right"
            dir="rtl"
          >
            {/* Sidebar Header */}
            <div className="p-6 bg-gradient-to-l from-emerald-800 to-emerald-700 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-4 left-4 p-1 rounded-full hover:bg-white/10 text-white transition duration-200"
                aria-label="إغلاق القائمة"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mt-4">
                <div className="relative">
                  <img 
                    src={getAvatarUrl(currentUser)} 
                    alt={currentUser.name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400"
                    referrerPolicy="no-referrer"
                  />
                  {currentUser.isPremium && (
                    <span className="absolute -bottom-1 -left-1 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                      تميز
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-base leading-tight flex items-center gap-1">
                    {currentUser.name || "مستخدم جديد"}
                    {currentUser.isVerified && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1 py-0.5 rounded">موثق</span>
                    )}
                  </h3>
                  <p className="text-xs text-emerald-200 font-mono">رقم العضوية: {currentUser.memberNumber}</p>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              
              {/* Admin role is decided by the server (user_roles table), never by the email */}
              {isAdmin && (
                <button
                  onClick={() => handleItemClick("/admin", "admin")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition duration-200 ${
                    location.pathname === "/admin" || propActiveScreen === "admin"
                      ? "bg-rose-50 text-rose-700 border-r-4 border-rose-600" 
                      : "text-rose-600 hover:bg-rose-50/50"
                  }`}
                >
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>لوحة تحكم المدير</span>
                </button>
              )}

              {menuItems.map(item => {
                const isSelected = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path)) || propActiveScreen === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.path, item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 ${
                      item.highlight 
                        ? "bg-amber-50 text-amber-800 hover:bg-amber-100/80 border border-amber-200" 
                        : isSelected 
                          ? "bg-emerald-50 text-emerald-700 border-r-4 border-emerald-600" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${
                        item.highlight 
                          ? "text-amber-600 animate-pulse" 
                          : isSelected 
                            ? "text-emerald-700" 
                            : "text-slate-400"
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-emerald-600 text-white text-xs font-bold font-mono px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition duration-200 text-right"
              >
                <Share2 className="w-5 h-5 text-slate-400" />
                <span>مشاركة التطبيق</span>
              </button>
            </div>

            {/* Logout Footer */}
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition duration-200 text-right"
              >
                <LogOut className="w-5 h-5 text-rose-500" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
