import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { PushNotifications, Token, ActionPerformed } from "@capacitor/push-notifications";
import { supabase } from "./supabase";

/**
 * فئة الجسر الأصيل لبيئة أندرويد و Capacitor
 * تعمل بتوافق تام على الويب (تتجاهل أوامر الموبايل بهدوء) وعلى تطبيق أندرويد
 */
export class NativeBridge {
  private static isInitialized = false;

  public static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * إخفاء شاشة البداية بعد اكتمال تحميل واجهة المستخدم
   */
  public static async hideSplashScreen(): Promise<void> {
    if (this.isNative()) {
      try {
        await SplashScreen.hide({ fadeOutDuration: 400 });
      } catch (err) {
        console.warn("Could not hide splash screen:", err);
      }
    }
  }

  /**
   * تفعيل زر الرجوع المادي لهواتف أندرويد
   */
  public static setupBackButton(onNavigateBack: () => void): void {
    if (this.isNative()) {
      CapApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          onNavigateBack();
        }
      });
    }
  }

  /**
   * إعداد وتهيئة الإشعارات اللحظية عبر FCM / Supabase
   */
  public static async initPushNotifications(userId?: string): Promise<string | null> {
    if (!this.isNative()) {
      // على الويب: دعم Web Push الافتراضي إذا كان مدعوماً
      if ("Notification" in window && "serviceWorker" in navigator) {
        try {
          const perm = await Notification.requestPermission();
          return perm === "granted" ? "web_granted" : null;
        } catch {
          return null;
        }
      }
      return null;
    }

    try {
      // 1. طلب الصلاحية من نظام أندرويد
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === "prompt") {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== "granted") {
        return null;
      }

      // 2. تسجيل الجهاز للحصول على FCM Token
      await PushNotifications.register();

      // 3. الاستماع لوصول التوكن وحفظه في Supabase
      return new Promise((resolve) => {
        PushNotifications.addListener("registration", async (token: Token) => {
          const fcmToken = token.value;
          if (userId && fcmToken) {
            try {
              await supabase.from("push_subscriptions").upsert({
                user_id: userId,
                fcm_token: fcmToken,
                platform: "android",
                updated_at: new Date().toISOString(),
              }, { onConflict: "user_id" });
            } catch (err) {
              console.warn("Failed to save push token to supabase:", err);
            }
          }
          resolve(fcmToken);
        });

        PushNotifications.addListener("registrationError", (err) => {
          console.warn("FCM Registration error:", err);
          resolve(null);
        });

        // 4. معالجة النقر على الإشعار للانتقال للمحادثة
        PushNotifications.addListener("pushNotificationActionPerformed", (notification: ActionPerformed) => {
          const data = notification.notification.data;
          if (data?.chatUserId) {
            window.location.hash = `#/inbox/${data.chatUserId}`;
          } else if (data?.url) {
            window.location.href = data.url;
          }
        });
      });
    } catch (err) {
      console.warn("Push notification setup error:", err);
      return null;
    }
  }
}
