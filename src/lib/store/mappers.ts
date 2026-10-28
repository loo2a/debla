import { UserProfile, AccountRole } from "../../types";

export const LEGACY_STORAGE_KEYS = [
  "islamic_matrimony_user",
  "islamic_matrimony_profiles",
  "islamic_matrimony_messages",
  "islamic_matrimony_notifications",
  "islamic_matrimony_stories",
  "islamic_matrimony_interactions",
  "islamic_matrimony_premium_requests",
];

export const SERVER_MANAGED_KEYS = [
  "id", "memberNumber", "email", "mobile", "isMobileVerified", "agreedToCharter",
  "isPremium", "isVerified", "premiumExpiryDate", "joinDate", "viewsCount",
] as const;

export const LOCKED_IDENTITY_KEYS = [
  "name", "gender", "age", "maritalStatus", "nationality", "accountRole"
] as const;

export const MAX_MESSAGE_LENGTH = 2000;

export const toErrorMessage = (err: any): string => {
  const code = err?.code as string | undefined;
  const message = String(err?.message ?? "");
  if (code === "23505") return "هذا الإجراء تم تسجيله مسبقاً.";
  if (code === "23514") return "إحدى القيم المُدخلة غير صالحة. يرجى مراجعتها.";
  if (code === "42501" || /row-level security|not_authorized|permission denied/i.test(message)) {
    return "غير مسموح لك بتنفيذ هذا الإجراء.";
  }
  if (/rate_limit_exceeded/i.test(message)) {
    return message.includes(":") ? message.split(":")[1].trim() : "لقد استهلكت الحد الأقصى المسموح به اليوم لهذا النشاط.";
  }
  if (/safety_policy_violation/i.test(message)) {
    return message.includes(":") ? message.split(":")[1].trim() : "الرسالة تخالف ضوابط الأمان وميثاق الوقار.";
  }
  if (/request_already_processed/.test(message)) return "تمت معالجة هذا الطلب مسبقاً.";
  if (/already_has_active_guardian/i.test(message)) return "لديك ولي أمر مرتبط بالفعل بحسابك.";
  if (/guardian_already_linked/i.test(message)) return "لا يمكن لولي الأمر الإشراف على أكثر من حساب واحد في نفس الوقت.";
  if (/invalid_invite_code/i.test(message)) return "رمز الدعوة غير صالح أو انتهت صلاحيته.";
  if (/cannot_be_own_guardian/i.test(message)) return "لا يمكن ربط الحساب بنفس المستخدم كولي أمر.";
  if (/link_not_found/i.test(message)) return "لم يتم العثور على رابط الإشراف المطلوب.";
  if (/reason_required/i.test(message)) return "يرجى توضيح سبب طلب تعديل البيانات الأساسية للإدارة.";
  if (/already_reviewed/i.test(message)) return "تمت مراجعة والبت في هذا الطلب مسبقاً.";
  if (/request_not_found/i.test(message)) return "لم يتم العثور على طلب التعديل المحدد.";
  if (/Failed to fetch|NetworkError/i.test(message)) return "تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.";
  return err?.message || "حدث خطأ غير متوقع، حاول مرة أخرى.";
};

export const toAuthErrorMessage = (err: any): string => {
  const status = err?.status as number | undefined;
  const message = String(err?.message ?? "");
  if (status === 429 || /rate limit|too many/i.test(message)) {
    return "تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.";
  }
  if (status === 500 || /internal server error|error sending confirmation|error sending/i.test(message)) {
    return "واجه خادم Supabase مشكلة في إرسال البريد (غالباً بسبب استهلاك الحد الأقصى للإرسال المجاني لـ Supabase بالساعة، أو الحاجة لضبط SMTP).";
  }
  if (/database error/i.test(message)) {
    return "خطأ في قاعدة بيانات Supabase عند إنشاء المستخدم الجديد.";
  }
  if (/expired|invalid|token/i.test(message)) return "رمز التحقق غير صحيح أو منتهي الصلاحية.";
  if (/email/i.test(message)) return "البريد الإلكتروني غير صالح.";
  if (/Failed to fetch|NetworkError/i.test(message)) return "تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.";
  return err?.message || "تعذر إتمام العملية، حاول مرة أخرى.";
};

export const toProfile = (row: any, priv?: any, sensitive?: any, pref?: any): UserProfile => ({
  id: row.id,
  memberNumber: row.member_number || row.memberNumber || ("MEMBER-" + (row.id ? String(row.id).slice(0, 5) : "10000")),
  accountRole: (row.account_role || row.accountRole || (row.gender === "female" ? "seeker_female" : "seeker_male")) as AccountRole,
  name: row.name || "",
  email: priv?.email,
  mobile: priv?.mobile,
  isMobileVerified: priv?.isMobileVerified ?? priv?.is_mobile_verified ?? false,
  agreedToCharter: priv?.agreedToCharter ?? priv?.agreed_to_charter ?? false,
  gender: row.gender,
  avatar: row.avatar || "male_1",
  profileImage: row.profile_image_url || row.profileImage || null,
  photoPrivacy: row.photo_privacy || row.photoPrivacy || "public",
  isPhotoLocked: row.isPhotoLocked ?? false,
  incognitoMode: row.incognito_mode ?? row.incognitoMode ?? false,
  age: row.age,
  nationality: row.nationality,
  residence: row.residence,
  profession: row.profession || "",
  education: row.education,
  income: sensitive?.income || row.income || "من 7,000 إلى 15,000 جنيه أو ما يعادلها",
  maritalStatus: row.marital_status || row.maritalStatus,
  hasChildren: row.has_children ?? row.hasChildren ?? false,
  childrenCount: row.children_count ?? row.childrenCount ?? 0,
  isSmoker: row.is_smoker ?? row.isSmoker ?? false,
  height: row.height,
  weight: row.weight,
  skinColor: row.skin_color || row.skinColor,
  bodyBuild: row.body_build || row.bodyBuild,
  healthStatus: sensitive?.health_status || row.health_status || row.healthStatus || "بصحة جيدة جداً والحمد لله",
  hasDisability: sensitive?.has_disability ?? row.has_disability ?? row.hasDisability ?? false,
  chronicDiseases: sensitive?.chronic_diseases ?? row.chronic_diseases ?? row.chronicDiseases ?? "",
  religiousCommitment: row.religious_commitment || row.religiousCommitment,
  religion: row.religion || row.religion || undefined,
  christianDenomination: row.christian_denomination || row.christianDenomination || undefined,
  churchAttendance: row.church_attendance || row.churchAttendance || undefined,
  prayers: row.prayers,
  hasBeard: row.has_beard ?? row.hasBeard ?? null,
  hijabType: row.hijab_type || row.hijabType || null,
  qaImaStance: row.qa_ima_stance || row.qaImaStance,
  mahrOpinion: row.mahr_opinion || row.mahrOpinion,
  marriageTimeframe: row.marriage_timeframe || row.marriageTimeframe,
  marriageReadiness: row.marriage_readiness || row.marriageReadiness || undefined,
  shariaVisionStance: row.sharia_vision_stance || row.shariaVisionStance,
  aboutMe: row.about_me || row.aboutMe || "",
  partnerSpecs: pref?.partner_specs || row.partner_specs || row.partnerSpecs || "",
  hobbies: row.hobbies || [],
  isPremium: row.is_premium ?? row.isPremium ?? false,
  isVerified: row.is_verified ?? row.isVerified ?? false,
  isPhotoVerified: row.is_photo_verified ?? row.isPhotoVerified ?? false,
  isIdVerified: row.is_id_verified ?? row.isIdVerified ?? (row.is_verified ?? row.isVerified ?? false),
  isDocsVerified: row.is_docs_verified ?? row.isDocsVerified ?? false,
  premiumExpiryDate: row.premium_expiry_date || row.premiumExpiryDate,
  joinDate: row.created_at ? String(row.created_at).split("T")[0] : (row.joinDate || "2026-01-01"),
  isOnline: row.is_online ?? row.isOnline ?? false,
  lastSeen: row.last_seen || row.lastSeen,
  viewsCount: row.viewsCount ?? 0,
  scheduledDeletionAt: row.scheduled_deletion_at || row.scheduledDeletionAt || null,
  academyPoints: row.academy_points ?? row.academyPoints ?? 0,
  photoModerationStatus: row.photo_moderation_status || row.photoModerationStatus || (row.profile_image_url ? "approved" : "unsubmitted"),
  photoRejectedReason: row.photo_rejected_reason || row.photoRejectedReason || undefined,
  photoReportsCount: row.photo_reports_count ?? row.photoReportsCount ?? 0,
  photoSubmittedAt: row.photo_submitted_at || row.photoSubmittedAt || undefined,
  isMarriageCertified: row.is_marriage_certified ?? row.isMarriageCertified ?? false,
  marriageCertificateDate: row.marriage_certificate_date || row.marriageCertificateDate || undefined,
  marriageExamScore: row.marriage_exam_score ?? row.marriageExamScore ?? undefined,
});
