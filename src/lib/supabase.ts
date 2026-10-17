import { createClient } from "@supabase/supabase-js";

// لا توجد قيم افتراضية مكتوبة في الكود: الإعدادات تأتي من متغيرات البيئة فقط.
const env = (import.meta as any).env ?? {};
const SUPABASE_URL: string | undefined = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY: string | undefined = env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigError: string | null =
  !SUPABASE_URL || !SUPABASE_ANON_KEY
    ? "إعدادات Supabase غير مكتملة. تأكد من ضبط VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في ملف .env (أو في متغيرات البيئة على الاستضافة)."
    : null;

// قيم placeholder فقط لتفادي انهيار التطبيق قبل عرض شاشة الخطأ.
export const supabase = createClient(
  SUPABASE_URL || "http://localhost:54321",
  SUPABASE_ANON_KEY || "missing-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
