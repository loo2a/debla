import React from "react";
import { useApp } from "../lib/store";
import { useNavigate } from "react-router-dom";
import { Users, ShieldCheck, Star } from "lucide-react";
import { Gender } from "../types";
import { getAvatarUrl } from "../lib/avatarUtils";
import { EmptyState } from "../components/ui/EmptyState";
import { Card } from "../components/ui/Card";

export const WhoInterestedPage: React.FC = () => {
  const { currentUser, profiles, interactions } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const oppositeGender = currentUser.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;
  const matchProfiles = profiles.filter(p => p.gender === oppositeGender && p.name !== "");

  const interestedInMeIds = interactions
    .filter(i => i.toUserId === currentUser.id && i.type === "interest")
    .map(i => i.fromUserId);
  const whoInterestedProfiles = matchProfiles.filter(p => interestedInMeIds.includes(p.id));

  return (
    <div className="p-4 space-y-4 pt-6 text-right pb-24" dir="rtl">
      <div className="text-center space-y-1">
        <Users className="w-10 h-10 text-emerald-600 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">من يهتم بملفي الشخصي؟</h3>
        <p className="text-xs text-slate-400">الملفات التي أبدت اهتماماً حقيقياً وموثقاً بك لتسهيل الاتفاق</p>
      </div>

      {whoInterestedProfiles.length === 0 ? (
        <EmptyState
          icon={Users}
          title="لم يبدِ أحد اهتماماً بملفك بعد"
          description="احرص على تفصيل فقرات التعريف بالذات ومواصفات الشريك لزيادة نسب القبول، أو بادر بتصفح الأعضاء والتعبير عن اهتمامك."
          actionLabel="تعديل ملفي الشخصي"
          onAction={() => navigate("/my-profile")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {whoInterestedProfiles.map(p => (
            <Card
              key={p.id}
              onClick={() => navigate(`/profile/${p.id}`)}
              className="hover:shadow transition cursor-pointer flex gap-3 items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={getAvatarUrl(p, undefined, p.photoPrivacy !== "public")} 
                  alt="" 
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1">
                    {p.name}
                    {p.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  </h4>
                  <p className="text-[10px] text-slate-400">{p.age} سنة • {p.nationality} • يقيم في {p.residence}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-pink-600" />
                مهتم بك
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
