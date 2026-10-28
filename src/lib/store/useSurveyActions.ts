import { CompatibilitySurvey, UserProfile } from "../../types";
import { ActionResult } from "./types";
import { supabase } from "../supabase";
import { toErrorMessage } from "./mappers";

const fail = (err: any): ActionResult => ({
  ok: false,
  error: toErrorMessage(err),
});

export const useSurveyActions = (
  currentUser: UserProfile | null,
  allSurveys: Map<string, CompatibilitySurvey>,
  setMySurvey: React.Dispatch<React.SetStateAction<CompatibilitySurvey | null>>,
  setAllSurveys: React.Dispatch<React.SetStateAction<Map<string, CompatibilitySurvey>>>
) => {
  const saveCompatibilitySurvey = async (survey: Omit<CompatibilitySurvey, "userId">): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };
    try {
      const { data, error } = await supabase.rpc("save_compatibility_survey_rpc", {
        p_leisure_style: survey.leisureStyle || "",
        p_conflict_style: survey.conflictStyle || "",
        p_financial_view: survey.financialView || "",
        p_privacy_boundary: survey.privacyBoundary || "",
        p_life_priority: survey.lifePriority || "",
        p_red_flags: survey.redFlags || [],
        p_flexible_points: survey.flexiblePoints || [],
        p_is_public: survey.isPublicInProfile ?? true,
      });
      if (error) return fail(error);
      const updatedSurvey: CompatibilitySurvey = {
        id: data?.id,
        userId: currentUser.id,
        ...survey,
      };
      setMySurvey(updatedSurvey);
      setAllSurveys(prev => new Map(prev).set(currentUser.id, updatedSurvey));
      return { ok: true };
    } catch (err) {
      return fail(err);
    }
  };

  const fetchCompatibilitySurvey = async (userId: string): Promise<CompatibilitySurvey | null> => {
    if (allSurveys.has(userId)) {
      return allSurveys.get(userId)!;
    }
    try {
      const { data, error } = await supabase
        .from("compatibility_surveys")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error || !data) return null;
      const parsed: CompatibilitySurvey = {
        id: data.id,
        userId: data.user_id,
        leisureStyle: data.leisure_style || "",
        conflictStyle: data.conflict_style || "",
        financialView: data.financial_view || "",
        privacyBoundary: data.privacy_boundary || "",
        lifePriority: data.life_priority || "",
        redFlags: data.red_flags || [],
        flexiblePoints: data.flexible_points || [],
        isPublicInProfile: data.is_public_in_profile ?? true,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      setAllSurveys(prev => new Map(prev).set(userId, parsed));
      return parsed;
    } catch {
      return null;
    }
  };

  return {
    saveCompatibilitySurvey,
    fetchCompatibilitySurvey,
  };
};
