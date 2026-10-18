import { UserProfile, Gender, Interaction } from "../types";

/**
 * دالة حساب نسبة التوافق الشرعي والموضوعي بين عضوين (من 65% إلى 98%)
 * معتمدة على بلد الإقامة، الجنسية، الالتزام الديني، الصلاة، التوافق العمري، والآراء الزواجية
 */
export function calculateCompatibility(me: UserProfile, other: UserProfile): number {
  if (!me || !other) return 70;

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

  // ضمان ألا تزيد النسبة عن 98% أو تقل عن 65% للواقعية
  return Math.min(98, Math.max(65, score));
}

export interface RecommendedCandidate {
  profile: UserProfile;
  compatibilityScore: number;
}

/**
 * تصفية وترتيب المرشحين من الجنس الآخر وفق التوافق وحالة الاشتراك (5 للمجاني، 20 للمميز)
 */
export function getRecommendedCandidates(
  currentUser: UserProfile,
  allProfiles: UserProfile[],
  interactions: Interaction[],
  swipedIds: string[]
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

  // ترشيح الملفات المؤهلة
  const eligible = allProfiles.filter((p) => {
    if (p.id === currentUser.id) return false;
    if (p.gender !== oppositeGender) return false;
    if (!p.name || p.name.trim() === "") return false;
    if (interactedIds.has(p.id)) return false;
    return true;
  });

  // حساب درجة التوافق وترتيبهم تنازلياً
  const scored: RecommendedCandidate[] = eligible.map((p) => ({
    profile: p,
    compatibilityScore: calculateCompatibility(currentUser, p),
  }));

  scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // الحد الأقصى: 20 للمستخدم المميز، و 5 للمستخدم العادي
  const maxLimit = currentUser.isPremium ? 20 : 5;
  return scored.slice(0, maxLimit);
}
