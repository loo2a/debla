import React, { useState } from "react";
import { Gender } from "../../types";
import { Avatars } from "../../constants";
import { Button } from "../ui/Button";
import { Check, Sparkles } from "lucide-react";

interface StepAvatarProps {
  gender: Gender;
  onSelect: (avatarId: string) => void;
  isLoading?: boolean;
}

export const StepAvatar: React.FC<StepAvatarProps> = ({
  gender,
  onSelect,
  isLoading = false,
}) => {
  const filteredAvatars = Avatars.filter((a) => a.gender === gender);
  const [selected, setSelected] = useState<string>(
    filteredAvatars[0]?.id || (gender === Gender.MALE ? "male_1" : "female_1")
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xl text-right max-w-md mx-auto space-y-6" dir="rtl">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-1">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">اختر صورتك التعبيرية (الأفاتار)</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          حفاظاً على الخصوصية والوقار، يتم استخدام الأفاتار الرمزي كصورة رسمية للملف.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2.5 pt-2">
        {filteredAvatars.map((avatar) => {
          const isSelected = selected === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => setSelected(avatar.id)}
              className={`relative p-2 rounded-2xl border-2 transition cursor-pointer flex flex-col items-center gap-1.5 ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50/50 shadow-md shadow-emerald-600/10"
                  : "border-slate-100 hover:border-slate-300 bg-white"
              }`}
            >
              <img
                src={avatar.url}
                alt={avatar.label}
                className="w-16 h-16 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <span className="text-[10px] font-bold text-slate-600">{avatar.label}</span>

              {isSelected && (
                <div className="absolute top-1 left-1 bg-emerald-600 text-white rounded-full p-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Button
        variant="primary"
        className="w-full py-3"
        isLoading={isLoading}
        onClick={() => onSelect(selected)}
      >
        إتمام التسجيل وبدء التصفح
      </Button>
    </div>
  );
};
