import React from "react";
import { useApp } from "../lib/store";
import { useNavigate } from "react-router-dom";
import { Heart, ShieldCheck } from "lucide-react";
import { Gender } from "../types";
import { getAvatarUrl } from "../lib/avatarUtils";
import { EmptyState } from "../components/ui/EmptyState";
import { Card } from "../components/ui/Card";

export const InterestsPage: React.FC = () => {
  const { currentUser, profiles, interactions } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const oppositeGender = currentUser.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;
  const myReligion = (currentUser.religion || "مسلم").trim();
  const matchProfiles = profiles.filter(
    p => p.gender === oppositeGender && (p.religion || "مسلم").trim() === myReligion && p.name !== ""
  );

  const interestedUserIds = interactions
    .filter(i => i.fromUserId === currentUser.id && i.type === "interest")
    .map(i => i.toUserId);
  const interestedProfiles = matchProfiles.filter(p => interestedUserIds.includes(p.id));

  return (
    <div className="p-4 space-y-4 pt-6 text-right pb-24" dir="rtl">
      <div className="text-center space-y-1">
        <Heart className="w-10 h-10 text-pink-500 fill-pink-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">قائمة اهتماماتك الشخصية</h3>
        <p className="text-xs text-slate-400">الملفات التي أبديت اهتمامك بها للتعارف الجاد</p>
      </div>

      {interestedProfiles.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="قائمتك فارغة حالياً"
          description="تصفح الملفات وعبر عن اهتمامك بالملفات التي تعجبك لتظهر هنا."
          actionLabel="تصفح الأعضاء الآن"
          onAction={() => navigate("/search")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {interestedProfiles.map(p => (
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
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                عرض التفاصيل
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
