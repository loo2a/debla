import { useRef } from "react";
import { Interaction, UserProfile } from "../../types";
import { ActionResult } from "./types";
import { supabase } from "../supabase";
import { toErrorMessage } from "./mappers";

const fail = (err: any): ActionResult => ({
  ok: false,
  error: toErrorMessage(err),
});

export const useInteractionActions = (
  currentUser: UserProfile | null,
  setInteractions: React.Dispatch<React.SetStateAction<Interaction[]>>,
  setProfiles: React.Dispatch<React.SetStateAction<UserProfile[]>>,
  loadAll: (userId: string, force?: boolean) => Promise<void>
) => {
  const viewedProfilesInSession = useRef<Set<string>>(new Set());

  const insertInteraction = async (
    toUserId: string,
    type: Interaction["type"],
    reason?: string
  ): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };

    const { data, error } = await supabase
      .from("interactions")
      .insert({ fromUserId: currentUser.id, toUserId, type, ...(reason ? { reason } : {}) })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return { ok: true };
      return fail(error);
    }
    setInteractions(prev => [...prev, data as Interaction]);

    // إرسال إشعار لحظي FCM للطرف الآخر
    if (type === "interest") {
      void Promise.resolve(
        supabase.functions.invoke("send-push", {
          body: {
            userId: toUserId,
            title: "اهتمام جديد بملفك الشخصي",
            body: `أبدى عضو اهتماماً جاداً بملفك الشخصي في تطبيق دبلة.`,
            data: { chatUserId: currentUser.id, type: "interest", url: `/profile/${currentUser.id}` },
          },
        })
      ).catch(() => {});
    } else if (type === "accept_interest") {
      void Promise.resolve(
        supabase.functions.invoke("send-push", {
          body: {
            userId: toUserId,
            title: "تم قبول اهتمامك",
            body: `تم قبول اهتمامك المتبادل! يمكنك الآن بدء التواصل الشرعي.`,
            data: { chatUserId: currentUser.id, type: "accept_interest", url: `/inbox/${currentUser.id}` },
          },
        })
      ).catch(() => {});
    }

    return { ok: true };
  };

  const expressInterest = async (toUserId: string): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };

    let rpcSucceeded = false;
    try {
      const { error } = await supabase.rpc("express_interest_rpc", { p_target_id: toUserId });
      if (!error) {
        rpcSucceeded = true;
      } else {
        console.warn("express_interest_rpc error, trying direct insert fallback:", error.message);
      }
    } catch (e: any) {
      console.warn("express_interest_rpc exception, trying direct insert fallback:", e?.message);
    }

    if (!rpcSucceeded) {
      // إدراج مباشر في جدول interactions في حال عدم توفر الدالة أو خطأ جدول الحدود
      const fallbackRes = await insertInteraction(toUserId, "interest");
      if (!fallbackRes.ok) {
        return fallbackRes;
      }
      return { ok: true };
    }

    const newInteraction: Interaction = {
      id: `int-${Date.now()}`,
      fromUserId: currentUser.id,
      toUserId,
      type: "interest",
      timestamp: new Date().toISOString(),
    };

    setInteractions(prev => {
      if (prev.some(i => i.fromUserId === currentUser.id && i.toUserId === toUserId && i.type === "interest")) {
        return prev;
      }
      return [...prev, newInteraction];
    });

    void Promise.resolve(
      supabase.functions.invoke("send-push", {
        body: {
          userId: toUserId,
          title: "اهتمام جديد بملفك الشخصي",
          body: `أبدى عضو اهتماماً جاداً بملفك الشخصي في تطبيق دبلة.`,
          data: { chatUserId: currentUser.id, type: "interest", url: `/profile/${currentUser.id}` },
        },
      })
    ).catch(() => {});

    return { ok: true };
  };

  const acceptInterest = async (toUserId: string): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };

    let rpcSucceeded = false;
    try {
      const { error } = await supabase.rpc("accept_interest_rpc", { p_target_id: toUserId });
      if (!error) {
        rpcSucceeded = true;
      } else {
        console.warn("accept_interest_rpc error, trying direct insert fallback:", error.message);
      }
    } catch (e: any) {
      console.warn("accept_interest_rpc exception, trying direct insert fallback:", e?.message);
    }

    if (!rpcSucceeded) {
      const fallbackRes = await insertInteraction(toUserId, "accept_interest");
      if (!fallbackRes.ok) {
        return fallbackRes;
      }
      await loadAll(currentUser.id, true);
      return { ok: true };
    }

    const newInteraction: Interaction = {
      id: `int-${Date.now()}`,
      fromUserId: currentUser.id,
      toUserId,
      type: "accept_interest",
      timestamp: new Date().toISOString(),
    };

    setInteractions(prev => {
      if (prev.some(i => i.fromUserId === currentUser.id && i.toUserId === toUserId && i.type === "accept_interest")) {
        return prev;
      }
      return [...prev, newInteraction];
    });

    void Promise.resolve(
      supabase.functions.invoke("send-push", {
        body: {
          userId: toUserId,
          title: "تم قبول اهتمامك",
          body: `تم قبول اهتمامك المتبادل! يمكنك الآن بدء التواصل الشرعي.`,
          data: { chatUserId: currentUser.id, type: "accept_interest", url: `/inbox/${currentUser.id}` },
        },
      })
    ).catch(() => {});

    await loadAll(currentUser.id, true);
    return { ok: true };
  };

  const ignoreProfile = (toUserId: string) => insertInteraction(toUserId, "ignore");

  const unignoreProfile = async (toUserId: string): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };
    const { error } = await supabase
      .from("interactions")
      .delete()
      .eq("fromUserId", currentUser.id)
      .eq("toUserId", toUserId)
      .eq("type", "ignore");
    if (error) return fail(error);
    setInteractions(prev =>
      prev.filter(i => !(i.fromUserId === currentUser.id && i.toUserId === toUserId && i.type === "ignore"))
    );
    return { ok: true };
  };

  const blockProfile = async (toUserId: string): Promise<ActionResult> => {
    const res = await insertInteraction(toUserId, "block");
    if (res.ok && currentUser) {
      await loadAll(currentUser.id, true);
    }
    return res;
  };

  const reportProfile = async (toUserId: string, reason: string): Promise<ActionResult> => {
    const cleanReason = reason.trim().slice(0, 500);
    try {
      const { data, error } = await supabase.rpc("report_profile_with_defense_rpc", {
        p_reported_user_id: toUserId,
        p_reason: cleanReason,
      });

      if (!error && data?.photo_frozen) {
        setProfiles(prev =>
          prev.map(p => (p.id === toUserId ? { ...p, photoModerationStatus: "frozen_by_reports" } : p))
        );
      }
    } catch (_) {}

    return insertInteraction(toUserId, "report", cleanReason);
  };

  const recordProfileView = async (viewedId: string): Promise<void> => {
    if (!currentUser || currentUser.id === viewedId) return;
    if (viewedProfilesInSession.current.has(viewedId)) return;
    viewedProfilesInSession.current.add(viewedId);
    try {
      await supabase.rpc("record_profile_view_rpc", { p_viewed_id: viewedId });
    } catch {
      // Ignored if RPC is pending
    }
  };

  return {
    expressInterest,
    acceptInterest,
    ignoreProfile,
    unignoreProfile,
    blockProfile,
    reportProfile,
    recordProfileView,
  };
};
