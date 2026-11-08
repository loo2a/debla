import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().trim().email("يرجى إدخال بريد إلكتروني صالح").max(80, "البريد الإلكتروني يجب ألا يتجاوز 80 حرفاً"),
});

export const otpSchema = z.object({
  otp: z.string().trim().regex(/^[0-9]{6}$/, "رمز التحقق يجب أن يتكون من 6 أرقام"),
});

export const profileFormSchema = z.object({
  name: z.string().trim().min(3, "الاسم يجب ألا يقل عن 3 أحرف").max(30, "الاسم يجب ألا يتجاوز 30 حرفاً"),
  mobile: z.string().trim().regex(/^(\+?[0-9]{10,14}|01[0-2,5][0-9]{8})$/, "يرجى إدخال رقم هاتف صحيح (11 رقماً محلياً أو بصيغة دولية)"),
  age: z.number().min(18, "العمر يجب ألا يقل عن 18 سنة").max(90, "العمر غير صالح"),
  nationality: z.string().min(1, "يرجى اختيار الجنسية"),
  residence: z.string().min(1, "يرجى اختيار بلد الإقامة"),
  profession: z.string().trim().min(2, "يرجى توضيح المهنة / الوظيفة").max(50, "المهنة يجب ألا تتجاوز 50 حرفاً"),
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
  chronicDiseases: z.string().max(100, "الحقل يجب ألا يتجاوز 100 حرف").optional(),

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

  // Descriptions (Strict 140 char minimum for seriousness + 1000 max + Contact Leakage Shield)
  aboutMe: z.string().trim()
    .min(140, "يجب كتابة 140 حرفاً على الأقل في حقل 'تحدث عن نفسك' لتأكيد الجدية")
    .max(1000, "حقل 'تحدث عن نفسك' يجب ألا يتجاوز 1000 حرف")
    .refine(
      (val) => !/(?:https?:\/\/|www\.|\.com|\.net|[0-9]{8,}|[\u0660-\u0669]{8,})/i.test(val),
      "يمنع إدراج أرقام الهواتف أو الروابط في النبذة العامة لحماية خصوصيتك والالتزام بضوابط المنصة"
    ),
  partnerSpecs: z.string().trim()
    .min(140, "يجب كتابة 140 حرفاً على الأقل في حقل 'مواصفات الشريك' لتأكيد الجدية")
    .max(1000, "حقل 'مواصفات الشريك' يجب ألا يتجاوز 1000 حرف")
    .refine(
      (val) => !/(?:https?:\/\/|www\.|\.com|\.net|[0-9]{8,}|[\u0660-\u0669]{8,})/i.test(val),
      "يمنع إدراج أرقام الهواتف أو الروابط في مواصفات الشريك لحماية الخصوصية"
    ),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
