import React, { useState, useEffect } from "react";
import { Star, Heart, X, Sparkles } from "lucide-react";
import { Button } from "./ui/Button";

interface ReviewPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewPromptModal: React.FC<ReviewPromptModalProps> = ({ isOpen, onClose }) => {
  const [rated, setRated] = useState(false);

  if (!isOpen) return null;

  const handleRateNow = () => {
    localStorage.setItem("mawada_app_reviewed", "true");
    onClose();
    // Open Google Play store listing
    window.open("https://play.google.com/store/apps/details?id=com.mawada.rahma", "_blank");
  };

  const handleLater = () => {
    // Postpone for 7 days
    localStorage.setItem("mawada_review_postponed_until", String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" dir="rtl">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-5 text-center relative animate-in fade-in zoom-in-95 duration-150">
        
        <button
          onClick={handleLater}
          className="absolute top-4 left-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner">
          <Sparkles className="w-8 h-8 fill-amber-400 text-amber-500" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold text-slate-800">
            ما رأيك في تجربة مودة ورحمة؟
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            تقييمك الطيب بـ 5 نجوم على Google Play يساهم في دعم المنصة ونشر الخير وتيسير العفاف بين الشباب والفتيات.
          </p>
        </div>

        {/* 5 Stars Illustration */}
        <div className="flex justify-center gap-1 text-amber-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-6 h-6 fill-amber-400" />
          ))}
        </div>

        <div className="space-y-2 pt-2">
          <Button
            variant="primary"
            onClick={handleRateNow}
            className="w-full text-xs py-3 bg-emerald-600 hover:bg-emerald-700 font-bold"
          >
            تقييم التطبيق على متجر بلاي ⭐
          </Button>

          <button
            onClick={handleLater}
            className="text-xs text-slate-400 hover:text-slate-600 py-1 transition"
          >
            ربما لاحقاً
          </button>
        </div>

      </div>
    </div>
  );
};
