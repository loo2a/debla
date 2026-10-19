import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().trim().email("يرجى إدخال بريد إلكتروني صالح"),
});

export const otpSchema = z.object({
  otp: z.string().trim().regex(/^[0-9]{6,8}$/, "رمز التحقق يجب أن يتكون من 6 إلى 8 أرقام"),
});

export const profileFormSchema = z.object({
  name: z.string().trim().min(3, "الاسم يجب ألا يقل عن 3 أحرف").max(80, "الاسم طويل جداً"),
  mobile: z.string().trim().regex(/^\+?[0-9 \-]{8,20}$/, "يرجى إدخال رقم موبايل صحيح بصيغة دولية (+20...)"),
  age: z.number().min(18, "العمر يجب ألا يقل عن 18 سنة").max(90, "العمر غير صالح"),
  nationality: z.string().min(1, "يرجى اختيار الجنسية"),
  residence: z.string().min(1, "يرجى اختيار بلد الإقامة"),
  profession: z.string().trim().min(2, "يرجى توضيح المهنة / الوظيفة"),
  education: z.string().min(1, "يرجى اختيار المستوى التعليمي"),
  income: z.string().min(1, "يرجى اختيار نطاق الدخل الشهري"),
  maritalStatus: z.string().min(1, "يرجى اختيار الحالة الاجتماعية"),
  hasChildren: z.boolean(),
  childrenCount: z.number().min(0),
  isSmoker: z.boolean(),

  // Physical
  height: z.number().min(120, "الطول يجب أن يكون 120 سم على الأقل").max(230),
  weight: z.number().min(30, "الوزن يجب أن يكون 30 كجم على الأقل").max(250),
  skinColor: z.string().min(1, "يرجى تحديد لون البشرة"),
  bodyBuild: z.string().min(1, "يرجى تحديد بنية الجسم"),
  healthStatus: z.string().min(1, "يرجى تحديد الحالة الصحية العامة"),
  hasDisability: z.boolean(),
  chronicDiseases: z.string().optional(),

  // Religiosity & Opinions
  religion: z.string().optional(),
  christianDenomination: z.string().optional(),
  religiousCommitment: z.string().min(1, "يرجى تحديد مستوى الالتزام الديني"),
  prayers: z.string().min(1, "يرجى تحديد الالتزام بالصلوات / العبادات"),
  churchAttendance: z.string().optional(),
  hasBeard: z.boolean().nullable().optional(),
  hijabType: z.string().nullable().optional(),
  qaImaStance: z.string().min(1, "يرجى تحديد الموقف من القايمة"),
  mahrOpinion: z.string().min(1, "يرجى تحديد الرأي في المهر والشبكة"),
  marriageTimeframe: z.string().min(1, "يرجى تحديد الفترة المتوقعة للزواج"),
  marriageReadiness: z.string().min(1, "يرجى تحديد مدى الاستعداد للزواج").optional(),
  shariaVisionStance: z.string().min(1, "يرجى تحديد الموقف من لقاء الرؤية والتعارف"),

  // Descriptions (Strict 140 char minimum for seriousness + Contact Leakage Shield)
  aboutMe: z.string().trim()
    .min(140, "يجب كتابة 140 حرفاً على الأقل في حقل 'تحدث عن نفسك' لتأكيد الجدية")
    .refine(
      (val) => !/(?:https?:\/\/|www\.|\.com|\.net|[0-9]{8,}|[\u0660-\u0669]{8,})/i.test(val),
      "يمنع إدراج أرقام الهواتف أو الروابط في النبذة العامة لحماية خصوصيتك والالتزام بضوابط المنصة"
    ),
  partnerSpecs: z.string().trim()
    .min(140, "يجب كتابة 140 حرفاً على الأقل في حقل 'مواصفات الشريك' لتأكيد الجدية")
    .refine(
      (val) => !/(?:https?:\/\/|www\.|\.com|\.net|[0-9]{8,}|[\u0660-\u0669]{8,})/i.test(val),
      "يمنع إدراج أرقام الهواتف أو الروابط في مواصفات الشريك لحماية الخصوصية"
    ),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
