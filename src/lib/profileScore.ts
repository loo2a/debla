import { UserProfile } from "../types";

export interface ProfileScoreResult {
  score: number;
  isComplete: boolean;
  missingItems: string[];
}

export function calculateProfileScore(profile?: UserProfile | null): ProfileScoreResult {
  if (!profile) {
    return { score: 0, isComplete: false, missingItems: [] };
  }

  let score = 0;
  const missingItems: string[] = [];

  // 1. Basic details (15%)
  if (profile.name && profile.age >= 18) {
    score += 15;
  } else {
    missingItems.push("الاسم والعمر");
  }

  // 2. Residence & Nationality (15%)
  if (profile.residence && profile.nationality) {
    score += 15;
  } else {
    missingItems.push("دولة الإقامة والجنسية");
  }

  // 3. Profession & Education (15%)
  if (profile.profession && profile.education) {
    score += 15;
  } else {
    missingItems.push("المؤهل العلمي والمهنة");
  }

  // 4. About Me description (15%)
  if (profile.aboutMe && profile.aboutMe.trim().length >= 40) {
    score += 15;
  } else {
    missingItems.push("نبذة كافية عن نفسك (40 حرفاً فأكثر)");
  }

  // 5. Partner Specs description (15%)
  if (profile.partnerSpecs && profile.partnerSpecs.trim().length >= 40) {
    score += 15;
  } else {
    missingItems.push("مواصفات شريك الحياة المطلوب");
  }

  // 6. Prayers & Religiosity (15%)
  if (profile.prayers && profile.religiousCommitment) {
    score += 15;
  } else {
    missingItems.push("الالتزام بالصلاة والتدين");
  }

  // 7. Marital views (10%)
  if (profile.mahrOpinion || profile.marriageTimeframe || profile.qaImaStance) {
    score += 10;
  } else {
    missingItems.push("الرؤية في نفقات الزواج والوقت المتوقع");
  }

  return {
    score: Math.min(100, score),
    isComplete: score >= 90,
    missingItems,
  };
}
