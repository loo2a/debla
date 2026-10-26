import { UserProfile, Gender, Interaction, CompatibilitySurvey } from "../types";

/**
 * دالة حساب نسبة التوافق الشرعي والموضوعي بين عضوين
 * معتمدة على بلد الإقامة، الجنسية، الالتزام الديني، الصلاة، التوافق العمري، الآراء الزواجية،
 * بالإضافة لنتائج استبيان التوافق الذكي وفحص الخطوط الحمراء (Red Flags).
 */
export function calculateCompatibility(
  me: UserProfile,
  other: UserProfile,
  mySurvey?: CompatibilitySurvey | null,
  otherSurvey?: CompatibilitySurvey | null
): number {
  if (!me || !other) return 0;

  // الشرط الحاسم: التوافق الديني التام (منع التوافق بين الأديان المختلفة)
  const myRel = (me.religion || "مسلم").trim();
  const otherRel = (other.religion || "مسلم").trim();
  if (myRel !== otherRel) return 0;

  let score = 55;

  // 1. التوافق في بلد الإقامة (من أهم معايير الزواج الواقعية)
  if (me.residence && other.residence && me.residence === other.residence) {
    score += 15;
  }

  // 2. التوافق في الجنسية
  if (me.nationality && other.nationality && me.nationality === other.nationality) {
    score += 10;
  }

  // 3. التوافق في الالتزام الديني
  if (me.religiousCommitment && other.religiousCommitment) {
    if (me.religiousCommitment === other.religiousCommitment) {
      score += 12;
    } else if (
      (me.religiousCommitment.includes("ملتزم") && other.religiousCommitment.includes("ملتزم")) ||
      (me.religiousCommitment.includes("يسعى") && other.religiousCommitment.includes("يسعى"))
    ) {
      score += 8;
    }
  }

  // 4. المحافظة على الصلاة
  if (me.prayers && other.prayers) {
    if (me.prayers === other.prayers) {
      score += 10;
    } else if (me.prayers.includes("كل الصلوات") && other.prayers.includes("كل الصلوات")) {
      score += 8;
    }
  }

  // 5. التوافق العمري المقبول اجتماعياً وشرعياً
  const ageDiff = other.age - me.age;
  if (me.gender === Gender.MALE) {
    // الرجل عادة يفضل تقارب السن أو أن تكون المرأة أصغر منه حتى 8 سنوات
    if (ageDiff <= 0 && ageDiff >= -8) {
      score += 10;
    } else if (Math.abs(ageDiff) <= 5) {
      score += 7;
    }
  } else {
    // المرأة عادة تفضل تقارب السن أو أن يكون الرجل أكبر منها حتى 8 سنوات
    if (ageDiff >= 0 && ageDiff <= 8) {
      score += 10;
    } else if (Math.abs(ageDiff) <= 5) {
      score += 7;
    }
  }

  // 6. التوافق في الحالة الاجتماعية
  if (me.maritalStatus && other.maritalStatus) {
    if (me.maritalStatus === other.maritalStatus) {
      score += 6;
    } else {
      score += 3;
    }
  }

  // 7. التوافق في رؤية نفقات الزواج (القايمة والمهر)
  if (
    (me.qaImaStance && other.qaImaStance && me.qaImaStance === other.qaImaStance) ||
    (me.mahrOpinion && other.mahrOpinion && me.mahrOpinion === other.mahrOpinion)
  ) {
    score += 5;
  }

  // 8. التوافق في استبيان الشخصية ونمط الحياة (إذا تم ملؤه)
  if (mySurvey && otherSurvey) {
    if (mySurvey.leisureStyle && otherSurvey.leisureStyle && mySurvey.leisureStyle === otherSurvey.leisureStyle) {
      score += 4;
    }
    if (mySurvey.conflictStyle && otherSurvey.conflictStyle && mySurvey.conflictStyle === otherSurvey.conflictStyle) {
      score += 4;
    }
    if (mySurvey.financialView && otherSurvey.financialView && mySurvey.financialView === otherSurvey.financialView) {
      score += 5;
    }
    if (mySurvey.privacyBoundary && otherSurvey.privacyBoundary && mySurvey.privacyBoundary === otherSurvey.privacyBoundary) {
      score += 4;
    }
    if (mySurvey.lifePriority && otherSurvey.lifePriority && mySurvey.lifePriority === otherSurvey.lifePriority) {
      score += 4;
    }
  }

  // 9. فحص الخطوط الحمراء (Red Flags) للطرفين
  if (mySurvey?.redFlags && mySurvey.redFlags.length > 0) {
    if (mySurvey.redFlags.includes("التدخين") && other.isSmoker) {
      score -= 25;
    }
    if (mySurvey.redFlags.includes("التهاون في الصلاة") && other.prayers && (other.prayers.includes("أحياناً") || other.prayers.includes("منقطع") || other.prayers.includes("لا أصلي"))) {
      score -= 25;
    }
    if (mySurvey.redFlags.includes("قلة الالتزام الديني") && other.religiousCommitment && other.religiousCommitment.includes("غير")) {
      score -= 20;
    }
  }

  if (otherSurvey?.redFlags && otherSurvey.redFlags.length > 0) {
    if (otherSurvey.redFlags.includes("التدخين") && me.isSmoker) {
      score -= 25;
    }
    if (otherSurvey.redFlags.includes("التهاون في الصلاة") && me.prayers && (me.prayers.includes("أحياناً") || me.prayers.includes("منقطع") || me.prayers.includes("لا أصلي"))) {
      score -= 25;
    }
    if (otherSurvey.redFlags.includes("قلة الالتزام الديني") && me.religiousCommitment && me.religiousCommitment.includes("غير")) {
      score -= 20;
    }
  }

  // ضمان ألا تزيد النسبة عن 98% أو تقل عن 40% (في حال وجود خطوط حمراء)
  return Math.min(98, Math.max(40, score));
}

export interface RecommendedCandidate {
  profile: UserProfile;
  compatibilityScore: number;
}

/**
 * تصفية وترتيب المرشحين من الجنس الآخر وفق التوافق والاستبيان وحالة الاشتراك (5 للمجاني، 20 للمميز)
 */
export function getRecommendedCandidates(
  currentUser: UserProfile,
  allProfiles: UserProfile[],
  interactions: Interaction[],
  swipedIds: string[],
  mySurvey?: CompatibilitySurvey | null,
  surveysMap?: Map<string, CompatibilitySurvey>
): RecommendedCandidate[] {
  if (!currentUser) return [];

  const oppositeGender = currentUser.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;

  // مجموعة المعرفات التي تمت معها تفاعلات سابقة (اهتمام، تجاهل، حظر)
  const interactedIds = new Set<string>();
  interactions.forEach((i) => {
    if (i.fromUserId === currentUser.id) {
      if (i.type === "interest" || i.type === "ignore" || i.type === "block") {
        interactedIds.add(i.toUserId);
      }
    }
  });

  // إضافة من تم سحبهم في الجلسة الحالية
  swipedIds.forEach((id) => interactedIds.add(id));

  // ترشيح الملفات المؤهلة مع الالتزام الصارم بالتطابق الديني
  const myReligion = (currentUser.religion || "مسلم").trim();
  const eligible = allProfiles.filter((p) => {
    if (p.id === currentUser.id) return false;
    if (p.gender !== oppositeGender) return false;
    if ((p.religion || "مسلم").trim() !== myReligion) return false;
    if (!p.name || p.name.trim() === "") return false;
    if (interactedIds.has(p.id)) return false;
    return true;
  });

  // حساب درجة التوافق وترتيبهم تنازلياً مع إدخال الاستبيانات
  const scored: RecommendedCandidate[] = eligible.map((p) => {
    const otherSurvey = surveysMap?.get(p.id) || null;
    return {
      profile: p,
      compatibilityScore: calculateCompatibility(currentUser, p, mySurvey, otherSurvey),
    };
  });

  scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // الحد الأقصى: 20 للمستخدم المميز، و 5 للمستخدم العادي
  const maxLimit = currentUser.isPremium ? 20 : 5;
  return scored.slice(0, maxLimit);
}
