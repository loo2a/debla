/**
 * نظام "رحلة زواج بدل شات لا ينتهي"
 * يهدف لتحويل المحادثات إلى مسار تعارف شرعي هادف ومحدد المعالم يمر بست مراحل واضحة:
 * 1. اهتمام متبادل
 * 2. توافق أولي
 * 3. أسئلة مهمة ومصارحة
 * 4. إشراك الأسرة
 * 5. لقاء رسمي (الرؤية الشرعية)
 * 6. قرار الاستمرار أو الاعتذار
 */

import { supabase } from "./supabase";

export interface JourneyStageInfo {
  stage: number;
  title: string;
  shortTitle: string;
  iconName: string;
  description: string;
  goal: string;
  nextStepReminder: string;
  suggestedActionLabel: string;
}

export const MARRIAGE_STAGES: JourneyStageInfo[] = [
  {
    stage: 1,
    title: "اهتمام متبادل",
    shortTitle: "اهتمام متبادل",
    iconName: "Heart",
    description: "كلا الطرفين أبدى رغبته في التعارف الجاد وفق الشريعة الإسلامية.",
    goal: "الاطلاع على الملفين وملاحظة نقاط التوافق والاتفاق على بدء الاستكشاف الجاد.",
    nextStepReminder: "تأكد من قراءة الملف التعريفي والتحقق من التوافق المبدئي في السن، الإقامة، والجدية.",
    suggestedActionLabel: "الانتقال إلى: التوافق الأولي",
  },
  {
    stage: 2,
    title: "توافق أولي",
    shortTitle: "توافق أولي",
    iconName: "Compass",
    description: "نقاش مختصر في الخطوط العريضة للحياة والتوقعات العامة لتجنب إضاعة الوقت.",
    goal: "التأكد من عدم وجود موانع جذرية أو تعارض في مكان المعيشة أو وقت الزواج المتوقع.",
    nextStepReminder: "تحدثا بوضوح عن: أين ستقيمان؟ والوقت المستهدف للزواج، وشكل المعيشة المتوقع.",
    suggestedActionLabel: "الانتقال إلى: أسئلة مهمة ومصارحة",
  },
  {
    stage: 3,
    title: "أسئلة مهمة ومصارحة",
    shortTitle: "أسئلة مهمة",
    iconName: "HelpCircle",
    description: "مصارحة صادقة في الطباع، إدارة الميزانية، المسؤوليات الزوجية، والرؤية الدينية.",
    goal: "معرفة مفاتيح الشخصية وطريقة إدارة الخلافات والاتفاق المالي قبل خطوة الأهل.",
    nextStepReminder: "استعينا ببنك الأسئلة الذكي لطرح النقاط الجوهرية بدون تردد أو إحراج.",
    suggestedActionLabel: "الانتقال إلى: إشراك الأسرة",
  },
  {
    stage: 4,
    title: "إشراك الأسرة والولي",
    shortTitle: "إشراك الأسرة",
    iconName: "Users",
    description: "نقل الحديث إلى دائرة الشرف والعلن عبر إدخال الأهل وولي أمر الفتاة رسمياً.",
    goal: "تزويد الخاطب ببيانات ولي الأمر والتنسيق لتواصل العائلتين ومباركة السعي.",
    nextStepReminder: "البيوت تُؤتى من أبوابها. شاركا بيانات ولي الأمر وموعد الاتصال المناسب.",
    suggestedActionLabel: "الانتقال إلى: لقاء رسمي ورؤية شرعية",
  },
  {
    stage: 5,
    title: "لقاء رسمي (الرؤية الشرعية)",
    shortTitle: "لقاء رسمي",
    iconName: "Home",
    description: "جلسة الرؤية الشرعية الرسمية في بيت أهل الفتاة بوجود المحرم وفق السنة.",
    goal: "تحقق القبول القلبي والملاحظة المباشرة بوقار مصداقاً لقول النبي ﷺ: «انظر إليها فإنه أحرى أن يؤدم بينكما».",
    nextStepReminder: "استعدا للقاء بالدعاء وحسن الظن، واحرصا على حضور المحرم والضوابط الشرعية.",
    suggestedActionLabel: "الانتقال إلى: قرار الاستمرار أو الاعتذار",
  },
  {
    stage: 6,
    title: "قرار الاستمرار أو الاعتذار",
    shortTitle: "قرار نهائي",
    iconName: "CheckCircle",
    description: "صلاة الاستخارة والتوافق النهائي على إتمام الخطوبة رسمياً أو الاعتذار بأدب.",
    goal: "إعلان الخطوبة المباركة وبدء الترتيبات، أو إنهاء التعارف بكل مودة واحترام دون ضغط أو إحراج.",
    nextStepReminder: "استخيرا الله تعالى. إن كان خيراً فامضيا في الخطوبة، وإن لم يحصل نصيب فالاعتذار بأدب شيمة الأكارم.",
    suggestedActionLabel: "إتمام ومباركة الخطوبة رسمياً",
  },
];

/**
 * بنك الأسئلة الهامة للمصارحة الزوجية (المرحلة 3)
 */
export interface GuidedQuestion {
  id: string;
  category: "دين وخلق" | "مال وسكن" | "طباع وأسرة" | "مستقبل وعمل";
  question: string;
}

export const GUIDED_QUESTIONS: GuidedQuestion[] = [
  {
    id: "q1",
    category: "دين وخلق",
    question: "ما هي أولوياتك في المحافظة على الصلاة والالتزام الشرعي في بيتنا المستقبلي؟",
  },
  {
    id: "q2",
    category: "مال وسكن",
    question: "ما هي رؤيتك لإدارة ميزانية البيت ونفقات المعيشة والمهر وتجهيزات الزواج؟",
  },
  {
    id: "q3",
    category: "مال وسكن",
    question: "ما هو تصورك لمكان وطبيعة السكن (مستقل تماماً / قرب الأهل)؟",
  },
  {
    id: "q4",
    category: "طباع وأسرة",
    question: "كيف تفضل التعامل وحل الخلافات ووجهات النظر المتباينة بهدوء واحترام؟",
  },
  {
    id: "q5",
    category: "طباع وأسرة",
    question: "ما هي حدود وتوازن العلاقة مع العائلتين والأهل بعد الزواج؟",
  },
  {
    id: "q6",
    category: "مستقبل وعمل",
    question: "ما هو الوقت والميعاد المستهدف لك لإتمام عقد القران والزفاف؟",
  },
  {
    id: "q7",
    category: "مستقبل وعمل",
    question: "ما هي رؤيتك لعمل الزوجة وتنظيم وقت البيت والأولاد مستقبلاً؟",
  },
  {
    id: "q8",
    category: "طباع وأسرة",
    question: "ما هي الصفات التي تسعدك في شريك الحياة، وما هي الأمور التي لا ترتاح لوجودها؟",
  },
];

/**
 * رسائل الاعتذار الراقي والإنهاء المؤدب من غير إحراج
 */
export interface PoliteApologyTemplate {
  id: string;
  title: string;
  content: string;
}

export const APOLOGY_TEMPLATES: PoliteApologyTemplate[] = [
  {
    id: "apology_1",
    title: "اعتذار بعد الاستخارة ودعاء بالتوفيق (الموصى به)",
    content: "السلام عليكم ورحمة الله، قدر الله وما شاء فعل، بعد الاستخارة والتفكير الصادق شعرت بعدم التوافق المطلوب بيننا. نسأل الله العظيم أن يرزقك الشريك الصالح الذي تقر به عينك، وأن يبارك في خطاك بكل خير.",
  },
  {
    id: "apology_2",
    title: "شكر وتقدير واعتذار لطيف لعدم الاستمرار",
    content: "شكراً جزيلاً لاهتمامك ووقتك وحسن خلقك، ونعتذر بكل احترام وأدب عن عدم إمكانية إكمال التعارف. مع خالص الدعوات القلبية لك بالسعادة والتوفيق والتيسير في قادم الأيام.",
  },
  {
    id: "apology_3",
    title: "أمانة ووضوح بعدم إضاعة الوقت",
    content: "السلام عليكم، رأيت أنه من الأمانة والوضوح والصدق ألا نضيع وقتكما المبارك، وأعتذر بلطف عن إكمال المسار سائلاً المولى عز وجل لك التوفيق والخير حيثما كان.",
  },
  {
    id: "apology_4",
    title: "اختلاف في الرؤية المستقبلية أو ظروف الإقامة",
    content: "السلام عليكم ورحمة الله، تشرفت بمعرفة شخصكم الكريم، ولكن بعد دراسة ومراجعة الظروف والأولويات المستقبلية ومكان الإقامة، شعرت بوجود تفاوت في الرؤية المشتركة. نعتذر بكل أدب ونتمنى لك كل الخير والتوفيق.",
  },
  {
    id: "apology_5",
    title: "اعتذار بناءً على مشورة ورأي الأسرة والأهل",
    content: "السلام عليكم / تحياتي الطيبة، بعد التشاور الأسري ومناقشة الأمر مع الأهل بكل محبة واحترام، رأينا عدم مناسبة الاستمرار في هذا المسار. كل الشكر والتقدير لكم على حسن التواصل وخالص التمنيات لكم بكل الخير والبركة دائماً.",
  },
  {
    id: "apology_6",
    title: "اعتذار مهذب ببركة وسلام (للمستخدم المسيحي)",
    content: "تحياتي واحترامي الكامل لشخصك الكريم ولأسرتك الفاضلة، بعد الصلاة والتفكير الهادئ شعرت بعدم التوافق المطلوب بيننا في هذه المرحلة. أعتذر بكل احترام ومحبة عن إكمال التعارف، وخالص دعواتي لك بالسعادة والسلام والبركة في كل خطواتك القادمة.",
  },
];

/**
 * هيكل بيانات حالة رحلة الزواج بين طرفين
 */
export interface MarriageJourneyState {
  pairKey: string;
  currentStage: number; // 1 to 6
  status: "active" | "completed" | "concluded";
  updatedAt: string;
  waliContact?: {
    name: string;
    phone: string;
    relationship: string;
    preferredTime?: string;
  };
  concludedReason?: string;
  concludedBy?: string; // معرف الطرف الذي أنهى التعارف بالاعتذار
}

/**
 * مفتاح تخزين رحلة الزواج الثنائية
 */
export function getPairKey(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join("_");
}

/**
 * استرجاع حالة الرحلة من التخزين المحلي
 */
export function getJourneyState(myId: string, partnerId: string): MarriageJourneyState {
  const pairKey = getPairKey(myId, partnerId);
  const storageKey = `mawada_journey_${pairKey}`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  // الحالة الافتراضية: مرحلة 1 (اهتمام متبادل)
  return {
    pairKey,
    currentStage: 1,
    status: "active",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * حفظ وتحديث حالة الرحلة
 */
export function saveJourneyState(state: MarriageJourneyState): void {
  const storageKey = `mawada_journey_${state.pairKey}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {}
}

/**
 * مزامنة حالة رحلة الزواج مع قاعدة البيانات Supabase
 */
export async function syncJourneyToSupabase(myId: string, partnerId: string, state: MarriageJourneyState): Promise<void> {
  try {
    const [userA, userB] = [myId, partnerId].sort();
    await supabase.from("marriage_journeys").upsert({
      pair_key: state.pairKey,
      user_a: userA,
      user_b: userB,
      current_stage: state.currentStage,
      status: state.status,
      wali_name: state.waliContact?.name,
      wali_phone: state.waliContact?.phone,
      wali_relation: state.waliContact?.relationship,
      concluded_reason: state.concludedReason,
      concluded_by: state.concludedBy,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Could not sync journey to Supabase (offline fallback active):", err);
  }
}

/**
 * جلب حالة رحلة الزواج المشتركة من Supabase
 */
export async function fetchRemoteJourneyState(myId: string, partnerId: string): Promise<MarriageJourneyState | null> {
  try {
    const pairKey = getPairKey(myId, partnerId);
    const { data, error } = await supabase
      .from("marriage_journeys")
      .select("*")
      .eq("pair_key", pairKey)
      .maybeSingle();

    if (error || !data) return null;

    const parsed: MarriageJourneyState = {
      pairKey: data.pair_key,
      currentStage: data.current_stage,
      status: data.status,
      updatedAt: data.updated_at,
      waliContact: data.wali_name ? {
        name: data.wali_name,
        phone: data.wali_phone || "",
        relationship: data.wali_relation || "الوالد",
      } : undefined,
      concludedReason: data.concluded_reason,
      concludedBy: data.concluded_by,
    };
    saveJourneyState(parsed);
    return parsed;
  } catch {
    return null;
  }
}
