import React, { useState } from "react";
import { Gender, AccountRole } from "../../types";
import { User, ShieldCheck, Heart, Sparkles, Key, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface StepGenderProps {
  onSelect: (gender: Gender, accountRole: AccountRole, inviteCode?: string) => void;
}

export const StepGender: React.FC<StepGenderProps> = ({ onSelect }) => {
  const [selectedRole, setSelectedRole] = useState<AccountRole | null>(null);
  const [inviteCode, setInviteCode] = useState("");

  const handleSeekerSelect = (role: "seeker_male" | "seeker_female") => {
    const gender = role === "seeker_male" ? Gender.MALE : Gender.FEMALE;
    onSelect(gender, role);
  };

  const handleGuardianContinue = () => {
    if (!selectedRole) return;
    const gender = Gender.MALE; // Default gender for guardian
    onSelect(gender, selectedRole, inviteCode.trim() ? inviteCode.trim().toUpperCase() : undefined);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xl space-y-6 text-right max-w-md mx-auto font-sans" dir="rtl">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-1">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800">تحديد صفة ونوع الحساب</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          اختر صفتك في منصة (مودة ورحمة) لتهيئة التجربة الشرعية المناسبة لغرضك.
        </p>
      </div>

      {/* خيارات الحساب الأربعة */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        
        {/* 1. عريس مقبل على الزواج */}
        <button
          type="button"
          onClick={() => handleSeekerSelect("seeker_male")}
          className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group space-y-2 cursor-pointer text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl font-bold group-hover:scale-105 transition">
            👨
          </div>
          <span className="font-black text-slate-800 text-xs sm:text-sm group-hover:text-emerald-700">
            مقبل على الزواج (عريس)
          </span>
          <span className="text-[10px] text-slate-400">باحث عن زوجة صالحة</span>
        </button>

        {/* 2. عروسة مقبلة على الزواج */}
        <button
          type="button"
          onClick={() => handleSeekerSelect("seeker_female")}
          className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group space-y-2 cursor-pointer text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center text-3xl font-bold group-hover:scale-105 transition">
            🧕
          </div>
          <span className="font-black text-slate-800 text-xs sm:text-sm group-hover:text-emerald-700">
            مقبلة على الزواج (عروسة)
          </span>
          <span className="text-[10px] text-slate-400">باحثة عن زوج صالح</span>
        </button>

        {/* 3. ولي أمر عن عروسة */}
        <button
          type="button"
          onClick={() => setSelectedRole("guardian_bride")}
          className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 transition group space-y-2 cursor-pointer text-center relative ${
            selectedRole === "guardian_bride"
              ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20"
              : "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-3xl font-bold group-hover:scale-105 transition">
            🛡️🧕
          </div>
          <span className="font-black text-slate-800 text-xs sm:text-sm group-hover:text-emerald-700">
            ولي أمر عن عروسة
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            أب / أخ للإشراف الشرعي
          </span>
        </button>

        {/* 4. ولي أمر عن عريس */}
        <button
          type="button"
          onClick={() => setSelectedRole("guardian_groom")}
          className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 transition group space-y-2 cursor-pointer text-center relative ${
            selectedRole === "guardian_groom"
              ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20"
              : "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-3xl font-bold group-hover:scale-105 transition">
            🛡️👨
          </div>
          <span className="font-black text-slate-800 text-xs sm:text-sm group-hover:text-emerald-700">
            ولي أمر عن عريس
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            والد / ولي أمر للمتابعة
          </span>
        </button>
      </div>

      {/* قسم إضافي اختياري لولي الأمر عند تحديده لإدخال رمز الدعوة إن وُجد */}
      {selectedRole && (
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
            <Key className="w-4 h-4 text-emerald-600" />
            <span>
              {selectedRole === "guardian_bride" ? "إشراف على حساب عروسة" : "متابعة حساب عريس"}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">
              هل استلمت رمز دعوة من العروسة أو العريس؟ (اختياري الآن):
            </label>
            <Input
              type="text"
              placeholder="مثال: WALI-9842"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="font-mono text-center tracking-widest text-sm uppercase bg-white"
            />
            <span className="text-[10px] text-slate-500 block">
              إذا لم يكن لديك الرمز حالياً، يمكنك المتابعة وإدخاله لاحقاً في أي وقت.
            </span>
          </div>

          <Button
            type="button"
            onClick={handleGuardianContinue}
            variant="primary"
            className="w-full text-xs py-2.5 font-bold"
          >
            متابعة إعداد حساب ولي الأمر
            <ArrowRight className="w-3.5 h-3.5 mr-1" />
          </Button>
        </div>
      )}
    </div>
  );
};
