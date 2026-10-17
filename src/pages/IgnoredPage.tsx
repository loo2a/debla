import React from "react";
import { useApp } from "../lib/store";
import { useUIStore } from "../stores/uiStore";
import { EyeOff } from "lucide-react";
import { Gender } from "../types";
import { getAvatarUrl } from "../lib/avatarUtils";
import { EmptyState } from "../components/ui/EmptyState";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export const IgnoredPage: React.FC = () => {
  const { currentUser, profiles, interactions, unignoreProfile } = useApp();
  const { addToast, showConfirm } = useUIStore();

  if (!currentUser) return null;

  const oppositeGender = currentUser.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;
  const matchProfiles = profiles.filter(p => p.gender === oppositeGender && p.name !== "");

  const ignoredUserIds = interactions
    .filter(i => i.fromUserId === currentUser.id && i.type === "ignore")
    .map(i => i.toUserId);
  const ignoredProfiles = matchProfiles.filter(p => ignoredUserIds.includes(p.id));

  const handleUnignore = (id: string, name: string) => {
    showConfirm({
      title: "إلغاء التجاهل",
      message: `هل تود إزالة العضو ${name} من قائمة المتجاهلين والسماح بظهوره مجدداً؟`,
      confirmText: "إلغاء التجاهل",
      onConfirm: async () => {
        const res = await unignoreProfile(id);
        if (res.ok) {
          addToast(`تم إزالة العضو ${name} من قائمة المتجاهلين.`, "success");
        } else {
          addToast(res.error || "فشل إلغاء التجاهل", "error");
        }
      }
    });
  };

  return (
    <div className="p-4 space-y-4 pt-6 text-right pb-24" dir="rtl">
      <div className="text-center space-y-1">
        <EyeOff className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">قائمة المتجاهلين</h3>
        <p className="text-xs text-slate-400">الملفات التي قمت بتجاهلها لإخفائها من لوائح البحث</p>
      </div>

      {ignoredProfiles.length === 0 ? (
        <EmptyState
          icon={EyeOff}
          title="قائمة التجاهل فارغة"
          description="لم تقم بإضافة أي ملف لقائمة التجاهل."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {ignoredProfiles.map(p => (
            <Card
              key={p.id}
              className="flex gap-3 items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={getAvatarUrl(p, undefined, p.photoPrivacy !== "public")} 
                  alt="" 
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{p.name}</h4>
                  <p className="text-[10px] text-slate-400">{p.age} سنة • {p.nationality}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnignore(p.id, p.name)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                إلغاء التجاهل
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
