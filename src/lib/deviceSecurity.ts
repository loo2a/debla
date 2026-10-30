import { Device } from "@capacitor/device";
import { supabase } from "./supabase";

const LOCAL_STORAGE_DEVICE_KEY = "debla_secure_device_id";

/**
 * الحصول على معرف الجهاز الموثق (Android ID على أندرويد، أو UUID مشفر مستمر على المتصفح)
 */
export async function getDeviceIdentifier(): Promise<string> {
  try {
    const info = await Device.getId();
    if (info?.identifier && info.identifier.trim().length > 0) {
      return info.identifier.trim();
    }
  } catch {
    // Fallback below
  }

  // Fallback for Web/Browser: Persistent Secure UUID
  let localId = localStorage.getItem(LOCAL_STORAGE_DEVICE_KEY);
  if (!localId) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      localId = crypto.randomUUID();
    } else {
      localId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_DEVICE_KEY, localId);
    } catch {
      // Storage might be restricted
    }
  }
  return localId;
}

/**
 * الحصول على تفاصيل الجهاز والمنصة
 */
export async function getDeviceDetails(): Promise<{
  deviceId: string;
  model: string;
  platform: string;
  osVersion: string;
}> {
  const deviceId = await getDeviceIdentifier();
  let model = "Web Browser";
  let platform = "web";
  let osVersion = "unknown";

  try {
    const info = await Device.getInfo();
    model = info.model || model;
    platform = info.platform || platform;
    osVersion = info.osVersion || osVersion;
  } catch {
    if (typeof navigator !== "undefined") {
      model = navigator.userAgent.slice(0, 50);
    }
  }

  return { deviceId, model, platform, osVersion };
}

export interface BanCheckResult {
  isBanned: boolean;
  banType?: "email" | "device";
  reason?: string;
}

/**
 * فحص ما إذا كان الجهاز أو الإيميل محظوراً في قاعدة البيانات
 */
export async function checkDeviceOrEmailBan(email?: string): Promise<BanCheckResult> {
  try {
    const deviceId = await getDeviceIdentifier();
    const { data, error } = await supabase.rpc("check_device_ban_rpc", {
      p_device_id: deviceId,
      p_email: email ? email.trim().toLowerCase() : null,
    });

    if (!error && data) {
      return {
        isBanned: Boolean(data.is_banned),
        banType: data.ban_type,
        reason: data.reason || "تم حظر الحساب أو الجهاز لمخالفة ميثاق الاستخدام والوقار.",
      };
    }
  } catch (err) {
    console.error("Ban check failed:", err);
  }

  return { isBanned: false };
}

/**
 * تسجيل جلسة الجهاز وربطها بالمستخدم الحالي لرصد أي محاولات تكرار
 */
export async function registerDeviceSession(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const { deviceId, model, platform } = await getDeviceDetails();
    await supabase.rpc("register_device_session_rpc", {
      p_device_id: deviceId,
      p_model: model,
      p_platform: platform,
    });
  } catch (err) {
    // Non-blocking
  }
}
