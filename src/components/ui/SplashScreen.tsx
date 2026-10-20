import React from "react";

interface SplashScreenProps {
  message?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  message = "جاري تهيئة المنصة وبدء الاتصال الآمن...",
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#064e3b] via-[#065f46] to-[#047857] text-white select-none overflow-hidden"
      dir="rtl"
    >
      {/* Background Subtle Geometric Pattern Accent */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="modern-splash-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#fef08a" strokeWidth="1" />
              <circle cx="30" cy="30" r="10" fill="none" stroke="#fef08a" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#modern-splash-pattern)" />
        </svg>
      </div>

      {/* Top Spacer / Tagline */}
      <div className="pt-8 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-emerald-200 text-xs font-medium tracking-wide shadow-inner backdrop-blur-sm">
          <span>✨</span>
          <span>أَمَانٌ • مَوَدَّةٌ • اسْتِقْرَارٌ</span>
          <span>✨</span>
        </div>
      </div>

      {/* Center Branding & Logo */}
      <div className="flex flex-col items-center text-center z-10 space-y-6 max-w-sm px-4">
        {/* Animated App Icon Badge */}
        <div className="relative group">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-300/30 to-emerald-400/30 rounded-3xl blur-xl opacity-75 animate-pulse" />
          
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-emerald-950/80 p-2 shadow-2xl border-2 border-amber-300/40 backdrop-blur-md flex items-center justify-center transform transition duration-500 hover:scale-105">
            <img
              src="/icon-192.png"
              alt="شعار مودة ورحمة"
              className="w-full h-full object-contain rounded-2xl drop-shadow-md"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/icon.svg";
              }}
            />
          </div>
        </div>

        {/* App Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm font-sans">
            مَوَدَّةٌ وَرَحْمَة
          </h1>
          <p className="text-emerald-200 text-sm sm:text-base font-medium">
            المنصة الموثوقة للزواج الجاد وبناء الأسرة
          </p>
        </div>

        {/* Loading Spinner & Message */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="w-8 h-8 rounded-full border-3 border-amber-400/30 border-t-amber-400 animate-spin" />
          <p className="text-xs text-emerald-100/90 font-medium animate-pulse">
            {message}
          </p>
        </div>
      </div>

      {/* Footer Inspiring Quote */}
      <div className="pb-6 text-center z-10 max-w-md px-4">
        <p className="text-xs sm:text-sm text-emerald-100 font-sans leading-relaxed">
          «منصة آمنة تجمع القلوب الصادقة لبناء بيوت عامرة بالمودة والسكينة والاحترام المتبادل»
        </p>
      </div>
    </div>
  );
};
