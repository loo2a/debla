import { GuardianLinkStatus } from "../../types";
import { ActionResult } from "./types";
import { supabase } from "../supabase";
import { toErrorMessage } from "./mappers";

const fail = (err: any): ActionResult => ({
  ok: false,
  error: toErrorMessage(err),
});

export const useGuardianActions = (
  userId: string | undefined,
  setGuardianStatus: React.Dispatch<React.SetStateAction<GuardianLinkStatus | null>>
) => {
  const fetchGuardianStatus = async (): Promise<GuardianLinkStatus | null> => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase.rpc("get_guardian_status_rpc");
      if (error || !data) return null;
      const status: GuardianLinkStatus = {
        role: data.role || "ward",
        linkId: data.link_id,
        partnerId: data.partner_id,
        partnerName: data.partner_name || "الطرف الآخر",
        partnerMemberNumber: data.partner_member_number,
        relationship: data.relationship || "الوالد",
        status: data.status || "active",
        canViewChat: data.can_view_chat ?? true,
        canApproveRequests: data.can_approve_requests ?? true,
        createdAt: data.created_at || new Date().toISOString(),
      };
      setGuardianStatus(status);
      return status;
    } catch {
      return null;
    }
  };

  const createGuardianInvitation = async (inviteCode: string, relationship = "الوالد"): Promise<ActionResult> => {
    try {
      const { data, error } = await supabase.rpc("create_guardian_invitation_rpc", {
        p_invite_code: inviteCode,
        p_relationship: relationship,
      });
      if (error) return fail(error);
      await fetchGuardianStatus();
      return { ok: true, data };
    } catch (err) {
      return fail(err);
    }
  };

  const acceptGuardianInvitation = async (inviteCode: string): Promise<ActionResult> => {
    try {
      const { data, error } = await supabase.rpc("accept_guardian_invitation_rpc", {
        p_invite_code: inviteCode,
      });
      if (error) return fail(error);
      await fetchGuardianStatus();
      return { ok: true, data };
    } catch (err) {
      return fail(err);
    }
  };

  const revokeGuardianLink = async (linkId: string): Promise<ActionResult> => {
    try {
      const { data, error } = await supabase.rpc("revoke_guardian_link_rpc", {
        p_link_id: linkId,
      });
      if (error) return fail(error);
      await fetchGuardianStatus();
      return { ok: true, data };
    } catch (err) {
      return fail(err);
    }
  };

  const updateGuardianPermissions = async (
    linkId: string,
    canViewChat: boolean,
    canApproveRequests: boolean
  ): Promise<ActionResult> => {
    try {
      const { data, error } = await supabase.rpc("update_guardian_permissions_rpc", {
        p_link_id: linkId,
        p_can_view_chat: canViewChat,
        p_can_approve_requests: canApproveRequests,
      });
      if (error) return fail(error);
      await fetchGuardianStatus();
      return { ok: true, data };
    } catch (err) {
      return fail(err);
    }
  };

  return {
    fetchGuardianStatus,
    createGuardianInvitation,
    acceptGuardianInvitation,
    revokeGuardianLink,
    updateGuardianPermissions,
  };
};
