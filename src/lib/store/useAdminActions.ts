import {
  UserProfile, SuccessStory, ProfileEditRequest,
  Coupon, AdminBroadcastMessage, VerificationTierType
} from "../../types";
import { ActionResult } from "./types";
import { supabase } from "../supabase";
import { toErrorMessage } from "./mappers";

const fail = (err: any): ActionResult => ({
  ok: false,
  error: toErrorMessage(err),
});

export const useAdminActions = (
  currentUser: UserProfile | null,
  isAdmin: boolean,
  profileEditRequests: ProfileEditRequest[],
  loadAll: (userId: string, force?: boolean) => Promise<void>,
  setSuccessStories: React.Dispatch<React.SetStateAction<SuccessStory[]>>,
  setProfileEditRequests: React.Dispatch<React.SetStateAction<ProfileEditRequest[]>>,
  setProfiles: React.Dispatch<React.SetStateAction<UserProfile[]>>,
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>,
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>
) => {
  const runAdminAction = async (fn: string, args: Record<string, any>): Promise<ActionResult> => {
    if (!isAdmin) return { ok: false, error: "صلاحية الأدمن مطلوبة." };
    const { error } = await supabase.rpc(fn, args);
    if (error) return fail(error);
    if (currentUser) await loadAll(currentUser.id, true);
    return { ok: true };
  };

  const adminApprovePremium = (requestId: string) =>
    runAdminAction("admin_approve_premium", { p_request_id: requestId });

  const adminRejectPremium = (requestId: string) =>
    runAdminAction("admin_reject_premium", { p_request_id: requestId });

  const adminVerifyUser = (userId: string) =>
    runAdminAction("admin_verify_user", { p_user_id: userId });

  const adminDeleteUser = (userId: string) =>
    runAdminAction("admin_delete_user", { p_user_id: userId });

  const adminApproveStory = (storyId: string) =>
    runAdminAction("admin_approve_story", { p_story_id: storyId });

  const adminAddStory = async (husband: string, wife: string, content: string): Promise<ActionResult> => {
    if (!isAdmin) return { ok: false, error: "صلاحية الأدمن مطلوبة." };
    const { data, error } = await supabase
      .from("success_stories")
      .insert({
        husbandName: husband.trim(),
        wifeName: wife.trim(),
        content: content.trim(),
        date: new Date().toISOString().split("T")[0],
        isApproved: true,
      })
      .select()
      .single();

    if (error) return fail(error);
    setSuccessStories(prev => [data as SuccessStory, ...prev]);
    return { ok: true };
  };

  const requestTierVerification = async (tier: VerificationTierType, details?: string): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };
    try {
      const { data, error } = await supabase.rpc("submit_tier_verification_rpc", {
        p_tier: tier === "id" ? "identity" : tier === "docs" ? "academic" : "family",
        p_document_url: "submitted_via_app",
        p_notes: details || "",
      });
      if (error) return fail(error);
      return { ok: true, data };
    } catch (err) {
      return fail(err);
    }
  };

  const adminUpdateTierVerification = async (userId: string, tier: VerificationTierType, verified: boolean): Promise<ActionResult> => {
    if (!isAdmin) return { ok: false, error: "صلاحية الأدمن مطلوبة." };
    try {
      if (tier === "id" && verified) {
        const { error } = await supabase.rpc("admin_verify_user", { p_user_id: userId });
        if (error) return fail(error);
      } else {
        const { error } = await supabase.rpc("admin_review_tier_verification_rpc", {
          p_request_id: userId,
          p_approved: verified,
          p_notes: verified ? "تم الاعتماد من الإدارة" : "تم الرفض لعدم استيفاء الشروط",
        });
        if (error) return fail(error);
      }
      if (currentUser) await loadAll(currentUser.id, true);
      return { ok: true };
    } catch (err) {
      return fail(err);
    }
  };

  const submitProfileEditRequest = async (
    requestedChanges: Record<string, any>,
    reason: string
  ): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };
    if (!reason.trim()) return { ok: false, error: "يرجى توضيح سبب طلب التعديل للإدارة." };
    try {
      const { data, error } = await supabase.rpc("submit_profile_edit_request_rpc", {
        p_requested_changes: requestedChanges,
        p_reason: reason.trim(),
      });
      if (error) return fail(error);
      const newReq: ProfileEditRequest = {
        id: data?.id || ("req-" + Date.now()),
        userId: currentUser.id,
        userName: currentUser.name,
        userMemberNumber: currentUser.memberNumber,
        requestedChanges,
        reason: reason.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setProfileEditRequests(prev => [newReq, ...prev]);
      return { ok: true };
    } catch (err) {
      return fail(err);
    }
  };

  const adminReviewProfileEditRequest = async (
    requestId: string,
    action: "approved" | "rejected",
    adminNotes?: string
  ): Promise<ActionResult> => {
    if (!isAdmin) return { ok: false, error: "هذا الإجراء مخصص لإدارة المنصة فقط." };
    try {
      const { error } = await supabase.rpc("admin_review_profile_edit_request_rpc", {
        p_request_id: requestId,
        p_action: action,
        p_admin_notes: adminNotes || null,
      });
      if (error) return fail(error);

      setProfileEditRequests(prev => prev.map(req => req.id === requestId ? {
        ...req,
        status: action,
        adminNotes,
        reviewedAt: new Date().toISOString(),
      } : req));

      const targetReq = profileEditRequests.find(r => r.id === requestId);
      if (targetReq && action === "approved") {
        setProfiles(prev => prev.map(p => {
          if (p.id === targetReq.userId) {
            const updated = { ...p, ...targetReq.requestedChanges };
            if (currentUser?.id === targetReq.userId) {
              setCurrentUser(updated);
            }
            return updated;
          }
          return p;
        }));
      }

      return { ok: true };
    } catch (err) {
      return fail(err);
    }
  };

  const adminCreateCoupon = async (
    coupon: Omit<Coupon, "id" | "usedCount" | "createdAt">
  ): Promise<ActionResult> => {
    if (!isAdmin) return { ok: false, error: "هذا الإجراء مخصص لإدارة المنصة فقط." };
    try {
      const cleanCode = coupon.code.trim().toUpperCase();
      const { data, error } = await supabase.rpc("admin_create_coupon_rpc", {
        p_code: cleanCode,
        p_discount_percent: coupon.discountPercent,
        p_max_uses: coupon.maxUses || 0,
        p_valid_until: coupon.validUntil || null,
        p_notes: coupon.notes || null,
      });
      if (error) return fail(error);
      const newCoupon: Coupon = {
        id: data?.id || ("cpn-" + Date.now()),
        code: cleanCode,
        discountPercent: coupon.discountPercent,
        maxUses: coupon.maxUses,
        usedCount: 0,
        validUntil: coupon.validUntil,
        isActive: true,
        notes: coupon.notes,
        createdAt: new Date().toISOString(),
      };
      setCoupons(prev => [newCoupon, ...prev]);
      return { ok: true, data: newCoupon };
    } catch (err) {
      return fail(err);
    }
  };

  const adminToggleCoupon = async (couponId: string, isActive: boolean): Promise<ActionResult> => {
    if (!isAdmin) return { ok: false, error: "هذا الإجراء مخصص لإدارة المنصة فقط." };
    try {
      const { error } = await supabase.rpc("admin_toggle_coupon_rpc", {
        p_coupon_id: couponId,
        p_is_active: isActive,
      });
      if (error) return fail(error);
      setCoupons(prev => prev.map(c => (c.id === couponId ? { ...c, isActive } : c)));
      return { ok: true };
    } catch (err) {
      return fail(err);
    }
  };

  const adminDeleteCoupon = async (couponId: string): Promise<ActionResult> => {
    if (!isAdmin) return { ok: false, error: "هذا الإجراء مخصص لإدارة المنصة فقط." };
    try {
      const { error } = await supabase.rpc("admin_delete_coupon_rpc", {
        p_coupon_id: couponId,
      });
      if (error) return fail(error);
      setCoupons(prev => prev.filter(c => c.id !== couponId));
      return { ok: true };
    } catch (err) {
      return fail(err);
    }
  };

  const adminSendBroadcast = async (broadcast: AdminBroadcastMessage): Promise<ActionResult> => {
    if (!isAdmin) return { ok: false, error: "هذا الإجراء مخصص لإدارة المنصة فقط." };
    if (!broadcast.title.trim() || !broadcast.content.trim()) {
      return { ok: false, error: "يرجى كتابة عنوان الإشعار ومحتواه." };
    }
    try {
      const { data, error } = await supabase.rpc("admin_send_broadcast_rpc", {
        p_target_audience: broadcast.targetAudience,
        p_target_user_id: broadcast.targetUserId || null,
        p_title: broadcast.title.trim(),
        p_content: broadcast.content.trim(),
      });
      if (error) return fail(error);
      if (currentUser) {
        await loadAll(currentUser.id, true);
      }
      return { ok: true, data };
    } catch (err) {
      return fail(err);
    }
  };

  const adminGrantPremium = async (userId: string, durationDays: number): Promise<ActionResult> => {
    if (!isAdmin) return { ok: false, error: "هذا الإجراء مخصص لإدارة المنصة فقط." };
    try {
      const { data, error } = await supabase.rpc("admin_grant_premium_rpc", {
        p_user_id: userId,
        p_duration_days: durationDays,
      });
      if (error) return fail(error);
      const expiry = data?.expiry_date || new Date(Date.now() + durationDays * 86400000).toISOString();
      setProfiles(prev => prev.map(p => (p.id === userId ? { ...p, isPremium: true, premiumExpiryDate: expiry } : p)));
      return { ok: true, data };
    } catch (err) {
      return fail(err);
    }
  };

  const adminRevokePremium = async (userId: string): Promise<ActionResult> => {
    if (!isAdmin) return { ok: false, error: "هذا الإجراء مخصص لإدارة المنصة فقط." };
    try {
      const { error } = await supabase.rpc("admin_revoke_premium_rpc", {
        p_user_id: userId,
      });
      if (error) return fail(error);
      setProfiles(prev => prev.map(p => (p.id === userId ? { ...p, isPremium: false, premiumExpiryDate: undefined } : p)));
      return { ok: true };
    } catch (err) {
      return fail(err);
    }
  };

  const adminApprovePhoto = async (userId: string): Promise<ActionResult> => {
    if (!isAdmin) return { ok: false, error: "هذا الإجراء مخصص لإدارة المنصة فقط." };
    try {
      const { error } = await supabase.rpc("admin_approve_photo_rpc", { p_user_id: userId });
      if (error) {
        await supabase.from("profiles").update({ photo_moderation_status: "approved" }).eq("id", userId);
      }

      setProfiles(prev =>
        prev.map(p => (p.id === userId ? { ...p, photoModerationStatus: "approved", photoRejectedReason: undefined } : p))
      );
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, photoModerationStatus: "approved", photoRejectedReason: undefined } : prev);
      }
      return { ok: true };
    } catch (err) {
      return fail(err);
    }
  };

  const adminRejectPhoto = async (userId: string, reason: string): Promise<ActionResult> => {
    if (!isAdmin) return { ok: false, error: "هذا الإجراء مخصص لإدارة المنصة فقط." };
    if (!reason.trim()) return { ok: false, error: "يرجى كتابة سبب رفض الصورة لتوضيحه للعضو." };
    try {
      const { error } = await supabase.rpc("admin_reject_photo_rpc", {
        p_user_id: userId,
        p_reason: reason.trim(),
      });
      if (error) {
        await supabase.from("profiles").update({
          photo_moderation_status: "rejected",
          photo_rejected_reason: reason.trim(),
          profile_image_url: null,
        }).eq("id", userId);
      }

      setProfiles(prev =>
        prev.map(p => (p.id === userId ? {
          ...p,
          photoModerationStatus: "rejected",
          photoRejectedReason: reason.trim(),
          profileImage: null,
        } : p))
      );
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? {
          ...prev,
          photoModerationStatus: "rejected",
          photoRejectedReason: reason.trim(),
          profileImage: null,
        } : prev);
      }
      return { ok: true };
    } catch (err) {
      return fail(err);
    }
  };

  return {
    adminApprovePremium,
    adminRejectPremium,
    adminVerifyUser,
    adminDeleteUser,
    adminApproveStory,
    adminAddStory,
    requestTierVerification,
    adminUpdateTierVerification,
    submitProfileEditRequest,
    adminReviewProfileEditRequest,
    adminCreateCoupon,
    adminToggleCoupon,
    adminDeleteCoupon,
    adminSendBroadcast,
    adminGrantPremium,
    adminRevokePremium,
    adminApprovePhoto,
    adminRejectPhoto,
  };
};
