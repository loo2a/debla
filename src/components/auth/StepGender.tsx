import React from "react";
import { Gender } from "../../types";
import { User, Sparkles } from "lucide-react";

interface StepGenderProps {
  onSelect: (gender: Gender) => void;
}

export const StepGender: React.FC<StepGenderProps> = ({ onSelect }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xl space-y-6 text-right max-w-md mx-auto" dir="rtl">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-1">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">تحديد نوع الحساب</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          يرجى تحديد جنسك لعرض التوافقات المناسبة وضبط الخصوصية الشرعية بدقة.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          onClick={() => onSelect(Gender.MALE)}
          className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group space-y-3 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition">
            👨
          </div>
          <span className="font-extrabold text-slate-800 text-sm group-hover:text-emerald-700">شاب / رجل</span>
          <span className="text-[10px] text-slate-400">باحث عن زوجة صالحة</span>
        </button>

        <button
          type="button"
          onClick={() => onSelect(Gender.FEMALE)}
          className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group space-y-3 cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition">
            🧕
          </div>
          <span className="font-extrabold text-slate-800 text-sm group-hover:text-emerald-700">آنسة / سيدة</span>
          <span className="text-[10px] text-slate-400">باحثة عن زوج صالح</span>
        </button>
      </div>
    </div>
  );
};
