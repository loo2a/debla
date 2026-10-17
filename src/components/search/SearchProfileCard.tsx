import React from "react";
import { UserProfile } from "../../types";
import { User, MapPin, ShieldCheck, Sparkles } from "lucide-react";

interface SearchProfileCardProps {
  profile: UserProfile;
  onClick: () => void;
}

export const SearchProfileCard: React.FC<SearchProfileCardProps> = ({ profile, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition cursor-pointer flex gap-4 relative overflow-hidden group text-right"
      dir="rtl"
    >
      {profile.isPremium && (
        <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-bl-xl shadow-xs flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
          <span>تميز</span>
        </div>
      )}

      <img
        src={
          profile.profileImage ||
          `https://images.unsplash.com/photo-${
            profile.avatar === "male_1"
              ? "1534528741775-53994a69daeb"
              : profile.avatar === "female_1"
              ? "1494790108377-be9c29b29330"
              : "1507003211169-0a1dd7228f2d"
          }?auto=format&fit=crop&w=150&q=80`
        }
        alt={profile.name}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition duration-200 flex-shrink-0"
        referrerPolicy="no-referrer"
      />

      <div className="flex-1 space-y-2 min-w-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h4 className="font-extrabold text-slate-800 text-sm sm:text-base leading-tight truncate">
              {profile.name}
            </h4>
            {profile.isVerified && (
              <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100 flex-shrink-0" />
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">عضوية: {profile.memberNumber}</p>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{profile.age} سنة • {profile.maritalStatus}</span>
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{profile.nationality} • يقيم في: {profile.residence}</span>
          </span>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          "{profile.aboutMe}"
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg">
            {profile.religiousCommitment}
          </span>
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">
            {profile.profession}
          </span>
        </div>
      </div>
    </div>
  );
};
