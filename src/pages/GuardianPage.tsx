import React from "react";
import { useApp } from "../lib/store";
import { GuardianPortal } from "../components/GuardianPortal";
import { WardGuardianSettings } from "../components/WardGuardianSettings";
import { ShieldCheck, HeartHandshake, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const GuardianPage: React.FC = () => {
  const { currentUser, guardianStatus } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const isGuardian = currentUser.accountRole?.startsWith("guardian_") || guardianStatus?.isGuardian;

  return (
    <div className="pb-24 pt-3 font-sans text-right min-h-screen bg-slate-50" dir="rtl">
      <div className="max-w-xl mx-auto px-4 space-y-4">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between py-1">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 font-bold transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة</span>
          </button>

          <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {isGuardian ? "بوابة ولي الأمر" : "وضع الولي والأسرة"}
          </span>
        </div>

        {/* Render GuardianPortal or WardGuardianSettings based on role */}
        {isGuardian ? (
          <GuardianPortal />
        ) : (
          <div className="space-y-4">
            <WardGuardianSettings />
          </div>
        )}

      </div>
    </div>
  );
};
