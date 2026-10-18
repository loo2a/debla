import { Avatars } from "../constants";
import { Gender } from "../types";

interface ProfileLike {
  id?: string;
  avatar?: string;
  gender?: Gender | string;
  profileImage?: string | null;
  photoPrivacy?: "public" | "accepted_interest_only" | "hidden";
  photoModerationStatus?: "unsubmitted" | "pending_approval" | "approved" | "rejected" | "frozen_by_reports";
}

export const DEFAULT_MALE_AVATAR = Avatars.find((a) => a.id === "male_1")?.url || "";
export const DEFAULT_FEMALE_AVATAR = Avatars.find((a) => a.id === "female_1")?.url || "";

/**
 * دالة مساعدة مركزية لاختيار رابط الصورة أو الأفاتار المناسب بدقة
 * خط الدفاع: لا تظهر الصورة الحقيقية للعامة إلا إذا كانت معتمدة من الإدارة (approved)
 * وغير مقفلة وليست مجمدة ببلاغات أو قيد المراجعة
 */
export function getAvatarUrl(
  profileOrAvatar?: ProfileLike | string | null,
  genderFallback?: Gender | string,
  isPhotoLocked?: boolean
): string {
  // إذا كان المدخل نصياً يمثل avatarId مباشرة
  if (typeof profileOrAvatar === "string") {
    const found = Avatars.find((a) => a.id === profileOrAvatar);
    if (found) return found.url;
    return profileOrAvatar.startsWith("female") || genderFallback === Gender.FEMALE || genderFallback === "female"
      ? Avatars.find((a) => a.id === "female_1")!.url
      : Avatars.find((a) => a.id === "male_1")!.url;
  }

  const p = profileOrAvatar;
  if (!p) {
    return genderFallback === Gender.FEMALE || genderFallback === "female"
      ? Avatars.find((a) => a.id === "female_1")!.url
      : Avatars.find((a) => a.id === "male_1")!.url;
  }

  // إذا كانت الصورة الشخصية الحقيقية موجودة ومعتمدة من الإدارة وغير مقفلة وغير مخفية
  const isApproved = !p.photoModerationStatus || p.photoModerationStatus === "approved";
  if (p.profileImage && isApproved && !isPhotoLocked && p.photoPrivacy !== "hidden") {
    return p.profileImage;
  }

  // البحث عن الأفاتار المختار من مصفوفة الأفاتارات الرسمية
  if (p.avatar) {
    const found = Avatars.find((a) => a.id === p.avatar);
    if (found) return found.url;
  }

  // بديل افتراضي محكم حسب جنس العضو
  const isFemale = p.gender === Gender.FEMALE || p.gender === "female" || genderFallback === Gender.FEMALE || genderFallback === "female";
  return isFemale
    ? Avatars.find((a) => a.id === "female_1")!.url
    : Avatars.find((a) => a.id === "male_1")!.url;
}
