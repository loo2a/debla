import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

/**
 * OfflineBanner — يظهر شريط تحذير عند انقطاع الإنترنت مع زر إعادة المحاولة
 */
export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRetrying, setShowRetrying] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setShowRetrying(false);
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const handleRetry = () => {
    setShowRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) {
        setIsOffline(false);
        setShowRetrying(false);
        // إعادة تحميل بيانات التطبيق عند استعادة الاتصال
        window.dispatchEvent(new Event("online"));
      } else {
        setShowRetrying(false);
      }
    }, 2000);
  };

  if (!isOffline) return null;

  return (
    <div
      dir="rtl"
      role="alert"
      aria-live="assertive"
      className="fixed top-0 inset-x-0 z-[200] flex items-center justify-between gap-3 bg-rose-600 text-white px-4 py-2.5 shadow-lg text-xs font-semibold"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span>لا يوجد اتصال بالإنترنت — بعض الميزات قد لا تعمل</span>
      </div>
      <button
        onClick={handleRetry}
        disabled={showRetrying}
        aria-label="إعادة محاولة الاتصال"
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-60 rounded-lg px-3 py-1 transition cursor-pointer"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 ${showRetrying ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
        <span>{showRetrying ? "جاري..." : "إعادة المحاولة"}</span>
      </button>
    </div>
  );
};
