import { useEffect } from "react";
import { UserProfile } from "../../types";
import { ActionResult } from "./types";
import { supabase } from "../supabase";
import {
  toErrorMessage, toAuthErrorMessage, toProfile,
  LOCKED_IDENTITY_KEYS, SERVER_MANAGED_KEYS
} from "./mappers";
import { compressImage } from "../imageUtils";
import { preCheckUploadedImage } from "../photoModeration";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";

const fail = (err: any): ActionResult => ({
  ok: false,
  error: toErrorMessage(err),
});

export const useAuthSlice = (
  currentUser: UserProfile | null,
  isAdmin: boolean,
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>,
  setProfiles: React.Dispatch<React.SetStateAction<UserProfile[]>>,
  resetState: () => void
) => {
  const requestEmailOtp = async (email: string): Promise<ActionResult> => {
    const cleanEmail = email.trim().toLowerCase();

    const lastRequest = Number(sessionStorage.getItem(`otp_request_${cleanEmail}`) || "0");
    const now = Date.now();
    if (now - lastRequest < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - lastRequest)) / 1000);
      return { ok: false, error: `يرجى الانتظار ${waitSeconds} ثانية قبل طلب رمز تحقق جديد.` };
    }

    sessionStorage.setItem(`otp_request_${cleanEmail}`, String(now));

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: true },
    });
    if (error) return { ok: false, error: toAuthErrorMessage(error) };
    return { ok: true };
  };

  const verifyEmailOtp = async (email: string, code: string): Promise<ActionResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const { error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanCode,
      type: "email",
    });
    if (error) return { ok: false, error: toAuthErrorMessage(error) };
    return { ok: true };
  };

  const signInWithGoogle = async (): Promise<ActionResult> => {
    try {
      const isNative = Capacitor.isNativePlatform();
      const redirectUrl = isNative
        ? "com.mawada.rahma://auth-callback"
        : (window.location.origin.endsWith("/") ? window.location.origin : `${window.location.origin}/`);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) return { ok: false, error: toAuthErrorMessage(error) };
      return { ok: true };
    } catch (err) {
      return fail(err);
    }
  };

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const sub = CapApp.addListener("appUrlOpen", async ({ url }) => {
      try {
        if (url && (url.includes("access_token=") || url.includes("code="))) {
          const rawParams = url.includes("#") ? url.split("#")[1] : url.split("?")[1];
          const params = new URLSearchParams(rawParams);
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        }
      } catch (err) {
        console.warn("Deep link auth error:", err);
      }
    });
    return () => {
      void sub.then(handle => handle.remove());
    };
  }, []);

  const logout = async () => {
    if (currentUser) {
      await Promise.resolve(
        supabase.from("profiles").update({ isOnline: false, is_online: false, lastSeen: "الآن", last_seen: "الآن" }).eq("id", currentUser.id)
      ).catch(() => undefined);
      await Promise.resolve(
        supabase.from("push_subscriptions").delete().eq("user_id", currentUser.id)
      ).catch(() => undefined);
    }
    await supabase.auth.signOut();
    resetState();
  };

  const deleteMyAccount = async (immediate = false): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };
    const { error } = await supabase.rpc("delete_my_account_rpc", { p_immediate: immediate });
    if (error) return fail(error);
    await logout();
    return { ok: true };
  };

  const cancelAccountDeletion = async (): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };
    const { error } = await supabase.rpc("cancel_account_deletion_rpc");
    if (error) return fail(error);
    const updated = { ...currentUser, scheduledDeletionAt: null };
    setCurrentUser(updated);
    setProfiles(prev => prev.map(p => (p.id === currentUser.id ? updated : p)));
    return { ok: true };
  };

  const submitCharterAgreement = async (): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };
    const { error } = await supabase.rpc("accept_charter", { p_version: "v1" });
    if (error) return fail(error);
    const updated = { ...currentUser, agreedToCharter: true };
    setCurrentUser(updated);
    setProfiles(prev => prev.map(p => (p.id === currentUser.id ? updated : p)));
    return { ok: true };
  };

  const saveProfile = async (updatedData: Partial<UserProfile>): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };

    if (!isAdmin && currentUser.name && currentUser.name.trim() !== "") {
      const changedLocked = LOCKED_IDENTITY_KEYS.filter(key => {
        const val = updatedData[key as keyof UserProfile];
        if (val === undefined) return false;
        return String(val) !== String(currentUser[key as keyof UserProfile]);
      });
      if (changedLocked.length > 0) {
        return {
          ok: false,
          error: "تعديل البيانات الأساسية (الاسم، السن، الجنس، الحالة الاجتماعية، الجنسية) مقفل لمنع التلاعب. يرجى تقديم طلب تعديل رسمي للإدارة للمراجعة.",
        };
      }
    }

    const mobile = updatedData.mobile?.trim();
    const dbPayload: Record<string, unknown> = {};

    if (updatedData.name !== undefined) dbPayload.name = updatedData.name;
    if (updatedData.gender !== undefined) dbPayload.gender = updatedData.gender;
    if (updatedData.avatar !== undefined) dbPayload.avatar = updatedData.avatar;
    if (updatedData.age !== undefined) dbPayload.age = updatedData.age;
    if (updatedData.nationality !== undefined) dbPayload.nationality = updatedData.nationality;
    if (updatedData.residence !== undefined) dbPayload.residence = updatedData.residence;
    if (updatedData.profession !== undefined) dbPayload.profession = updatedData.profession;
    if (updatedData.education !== undefined) dbPayload.education = updatedData.education;
    if (updatedData.income !== undefined) dbPayload.income = updatedData.income;
    if (updatedData.height !== undefined) dbPayload.height = updatedData.height;
    if (updatedData.weight !== undefined) dbPayload.weight = updatedData.weight;
    if (updatedData.hobbies !== undefined) dbPayload.hobbies = updatedData.hobbies;
    if (updatedData.healthStatus !== undefined) dbPayload.health_status = updatedData.healthStatus;
    if (updatedData.hasDisability !== undefined) dbPayload.has_disability = updatedData.hasDisability;
    if (updatedData.chronicDiseases !== undefined) dbPayload.chronic_diseases = updatedData.chronicDiseases;

    if (updatedData.accountRole !== undefined) dbPayload.account_role = updatedData.accountRole;
    if (updatedData.maritalStatus !== undefined) dbPayload.marital_status = updatedData.maritalStatus;
    if (updatedData.hasChildren !== undefined) dbPayload.has_children = updatedData.hasChildren;
    if (updatedData.childrenCount !== undefined) dbPayload.children_count = updatedData.childrenCount;
    if (updatedData.isSmoker !== undefined) dbPayload.is_smoker = updatedData.isSmoker;
    if (updatedData.skinColor !== undefined) dbPayload.skin_color = updatedData.skinColor;
    if (updatedData.bodyBuild !== undefined) dbPayload.body_build = updatedData.bodyBuild;
    if (updatedData.religion !== undefined) dbPayload.religion = updatedData.religion;
    if (updatedData.christianDenomination !== undefined) dbPayload.christian_denomination = updatedData.christianDenomination;
    if (updatedData.churchAttendance !== undefined) dbPayload.church_attendance = updatedData.churchAttendance;
    if (updatedData.religiousCommitment !== undefined) dbPayload.religious_commitment = updatedData.religiousCommitment;
    if (updatedData.prayers !== undefined) dbPayload.prayers = updatedData.prayers;
    if (updatedData.hasBeard !== undefined) dbPayload.has_beard = updatedData.hasBeard;
    if (updatedData.hijabType !== undefined) dbPayload.hijab_type = updatedData.hijabType;
    if (updatedData.qaImaStance !== undefined) dbPayload.qa_ima_stance = updatedData.qaImaStance;
    if (updatedData.mahrOpinion !== undefined) dbPayload.mahr_opinion = updatedData.mahrOpinion;
    if (updatedData.marriageTimeframe !== undefined) dbPayload.marriage_timeframe = updatedData.marriageTimeframe;
    if (updatedData.marriageReadiness !== undefined) dbPayload.marriage_readiness = updatedData.marriageReadiness;
    if (updatedData.shariaVisionStance !== undefined) dbPayload.sharia_vision_stance = updatedData.shariaVisionStance;
    if (updatedData.aboutMe !== undefined) dbPayload.about_me = updatedData.aboutMe;
    if (updatedData.partnerSpecs !== undefined) dbPayload.partner_specs = updatedData.partnerSpecs;
    if (updatedData.profileImage !== undefined) dbPayload.profile_image_url = updatedData.profileImage;
    if (updatedData.photoPrivacy !== undefined) dbPayload.photo_privacy = updatedData.photoPrivacy;
    if (updatedData.photoModerationStatus !== undefined) dbPayload.photo_moderation_status = updatedData.photoModerationStatus;
    if (updatedData.photoSubmittedAt !== undefined) dbPayload.photo_submitted_at = updatedData.photoSubmittedAt;
    if (updatedData.incognitoMode !== undefined) dbPayload.incognito_mode = updatedData.incognitoMode;
    if (updatedData.isMarriageCertified !== undefined) dbPayload.is_marriage_certified = updatedData.isMarriageCertified;
    if (updatedData.marriageCertificateDate !== undefined) dbPayload.marriage_certificate_date = updatedData.marriageCertificateDate;
    if (updatedData.marriageExamScore !== undefined) dbPayload.marriage_exam_score = updatedData.marriageExamScore;

    SERVER_MANAGED_KEYS.forEach(key => {
      delete dbPayload[key];
    });

    let merged: UserProfile = { ...currentUser, ...updatedData };

    if (Object.keys(dbPayload).length > 0) {
      const { data, error } = await supabase
        .from("profiles")
        .update(dbPayload)
        .eq("id", currentUser.id)
        .select()
        .single();
      if (error) return fail(error);
      if (data) {
        const serverProfile = toProfile(data);
        merged = {
          ...merged,
          ...serverProfile,
          agreedToCharter: currentUser.agreedToCharter ?? true,
          email: currentUser.email,
          mobile: mobile !== undefined ? mobile : currentUser.mobile,
          isMobileVerified: mobile !== undefined && mobile !== currentUser.mobile ? false : currentUser.isMobileVerified,
          income: updatedData.income || currentUser.income,
          healthStatus: updatedData.healthStatus || currentUser.healthStatus,
          hasDisability: updatedData.hasDisability !== undefined ? updatedData.hasDisability : currentUser.hasDisability,
          chronicDiseases: updatedData.chronicDiseases !== undefined ? updatedData.chronicDiseases : currentUser.chronicDiseases,
          partnerSpecs: updatedData.partnerSpecs !== undefined ? updatedData.partnerSpecs : currentUser.partnerSpecs,
        };
      }
    }

    const sensitiveFields: any = {};
    if (updatedData.income) sensitiveFields.income = updatedData.income;
    if (updatedData.healthStatus) sensitiveFields.health_status = updatedData.healthStatus;
    if (updatedData.hasDisability !== undefined) sensitiveFields.has_disability = updatedData.hasDisability;
    if (updatedData.chronicDiseases !== undefined) sensitiveFields.chronic_diseases = updatedData.chronicDiseases;

    if (Object.keys(sensitiveFields).length > 0) {
      await Promise.resolve(supabase.from("profile_sensitive").upsert({
        user_id: currentUser.id,
        ...sensitiveFields,
      })).catch(() => undefined);
    }

    if (updatedData.partnerSpecs) {
      await Promise.resolve(supabase.from("profile_preferences").upsert({
        user_id: currentUser.id,
        partner_specs: updatedData.partnerSpecs,
      })).catch(() => undefined);
    }

    if (mobile !== undefined && mobile !== currentUser.mobile) {
      const { error } = await supabase
        .from("profile_private")
        .update({ mobile })
        .eq("id", currentUser.id);
      if (error) return fail(error);
      merged = { ...merged, mobile, isMobileVerified: false };
    }

    setCurrentUser(merged);
    setProfiles(prev => prev.map(p => (p.id === merged.id ? merged : p)));
    return { ok: true };
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => saveProfile(updatedData);
  const updateAvatar = (avatarId: string) => saveProfile({ avatar: avatarId });

  const uploadCustomImage = async (fileOrBase64: File | Blob | string): Promise<ActionResult> => {
    if (!currentUser?.isPremium) {
      return fail({ code: "42501", message: "رفع صورة خاصة متاح حصرياً للأعضاء المشتركين في باقة التميز." });
    }

    try {
      const preCheck = await preCheckUploadedImage(fileOrBase64);
      if (!preCheck.isSafe) {
        return fail(new Error(preCheck.reason || "الصورة المرفوعة تخالف معايير الوقار والخصوصية المعتمدة."));
      }

      const { blob } = await compressImage(fileOrBase64, 800, 800, 0.82);

      try {
        const { data: existingFiles } = await supabase.storage
          .from("profile-photos")
          .list(currentUser.id);
        if (existingFiles && existingFiles.length > 0) {
          const filesToRemove = existingFiles.map(f => `${currentUser.id}/${f.name}`);
          await supabase.storage.from("profile-photos").remove(filesToRemove);
        }
      } catch {
        // مواصلة الرفع إذا فشل سرد القديم
      }

      const filePath = `${currentUser.id}/avatar_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, blob, {
          contentType: "image/jpeg",
          upsert: true,
          cacheControl: "86400",
        });

      if (uploadError) {
        return fail(new Error("تعذر رفع الصورة إلى التخزين السحابي، يرجى التحقق من اتصالك والمحاولة لاحقاً."));
      }

      const { data: signedData, error: signError } = await supabase.storage
        .from("profile-photos")
        .createSignedUrl(filePath, 60 * 60 * 24 * 7);

      if (signError || !signedData?.signedUrl) {
        return fail(new Error("تعذر إنشاء رابط العرض المحمي للصورة."));
      }

      const finalUrl = signedData.signedUrl;

      const saveRes = await saveProfile({
        profileImage: finalUrl,
        photoModerationStatus: "pending_approval",
        photoSubmittedAt: new Date().toISOString(),
      });

      return {
        ...saveRes,
        data: {
          status: "pending_approval",
          message: "تم رفع صورتك بنجاح. وحرصاً على الأمان والوقار، تخضع الصورة لمراجعة سريعة من الإدارة قبل ظهورها للعامة."
        }
      };
    } catch (err: any) {
      return fail(err);
    }
  };

  const updatePhotoPrivacy = async (privacy: "public" | "accepted_interest_only" | "hidden"): Promise<ActionResult> => {
    return saveProfile({ photoPrivacy: privacy });
  };

  const toggleIncognitoMode = async (): Promise<ActionResult> => {
    if (!currentUser?.isPremium) {
      return fail({ message: "ميزة التصفح الخفي حصرية للأعضاء المشتركين في باقة التميز." });
    }
    const nextState = !currentUser.incognitoMode;
    return saveProfile({ incognitoMode: nextState });
  };

  return {
    requestEmailOtp,
    verifyEmailOtp,
    signInWithGoogle,
    logout,
    deleteMyAccount,
    cancelAccountDeletion,
    submitCharterAgreement,
    saveProfile,
    updateProfile,
    updateAvatar,
    uploadCustomImage,
    updatePhotoPrivacy,
    toggleIncognitoMode,
  };
};
