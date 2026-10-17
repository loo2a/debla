import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  UserProfile, Message, Notification, SuccessStory, Interaction,
  PremiumSubscriptionRequest, SearchProfilesFilter, SearchProfilesResponse
} from "../types";
import { supabase } from "./supabase";
import { compressImage } from "./imageUtils";

export interface ActionResult {
  ok: boolean;
  error?: string;
  data?: any;
}

type PlanDuration = "week" | "month" | "3months" | "6months" | "year";
type PaymentMethod = "google_play" | "credit_card" | "mobile_wallet";

interface AppContextType {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  profiles: UserProfile[];
  messages: Message[];
  notifications: Notification[];
  successStories: SuccessStory[];
  interactions: Interaction[];
  premiumRequests: PremiumSubscriptionRequest[];
  dbError: string | null;
  actionError: string | null;
  isAuthReady: boolean;
  isSupabaseLoading: boolean;

  // Auth & Profile Actions
  requestEmailOtp: (email: string) => Promise<ActionResult>;
  verifyEmailOtp: (email: string, code: string) => Promise<ActionResult>;
  submitCharterAgreement: () => Promise<ActionResult>;
  saveProfile: (profile: Partial<UserProfile>) => Promise<ActionResult>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<ActionResult>;
  updateAvatar: (avatarId: string) => Promise<ActionResult>;
  uploadCustomImage: (fileOrBase64: File | Blob | string) => Promise<ActionResult>;
  updatePhotoPrivacy: (privacy: "public" | "accepted_interest_only" | "hidden") => Promise<ActionResult>;
  toggleIncognitoMode: () => Promise<ActionResult>;
  deleteMyAccount: () => Promise<ActionResult>;
  logout: () => Promise<void>;
  clearActionError: () => void;

  // Interaction Actions
  expressInterest: (toUserId: string) => Promise<ActionResult>;
  acceptInterest: (toUserId: string) => Promise<ActionResult>;
  ignoreProfile: (toUserId: string) => Promise<ActionResult>;
  unignoreProfile: (toUserId: string) => Promise<ActionResult>;
  blockProfile: (toUserId: string) => Promise<ActionResult>;
  reportProfile: (toUserId: string, reason: string) => Promise<ActionResult>;
  recordProfileView: (viewedId: string) => Promise<void>;

  // Messaging
  sendMessage: (toUserId: string, content: string) => Promise<ActionResult>;
  markMessagesAsRead: (senderId: string) => void;

  // Search & Pagination
  searchProfiles: (filter: SearchProfilesFilter) => Promise<SearchProfilesResponse>;
  fetchProfileById: (id: string) => Promise<UserProfile | null>;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Premium Subscriptions
  submitPremiumRequest: (plan: PlanDuration, paymentMethod: PaymentMethod, phoneNumber?: string) => Promise<ActionResult>;

  // Admin Operations (enforced server-side by SECURITY DEFINER functions)
  adminApprovePremium: (requestId: string) => Promise<ActionResult>;
  adminRejectPremium: (requestId: string) => Promise<ActionResult>;
  adminVerifyUser: (userId: string) => Promise<ActionResult>;
  adminDeleteUser: (userId: string) => Promise<ActionResult>;
  adminApproveStory: (storyId: string) => Promise<ActionResult>;
  adminAddStory: (husband: string, wife: string, content: string) => Promise<ActionResult>;
  retryLoadData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LEGACY_STORAGE_KEYS = [
  "islamic_matrimony_user",
  "islamic_matrimony_profiles",
  "islamic_matrimony_messages",
  "islamic_matrimony_notifications",
  "islamic_matrimony_stories",
  "islamic_matrimony_interactions",
  "islamic_matrimony_premium_requests",
];

const SERVER_MANAGED_KEYS = [
  "id", "memberNumber", "email", "mobile", "isMobileVerified", "agreedToCharter",
  "isPremium", "isVerified", "premiumExpiryDate", "joinDate", "viewsCount",
] as const;

const MAX_MESSAGE_LENGTH = 2000;

const toErrorMessage = (err: any): string => {
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
  if (/request_already_processed/.test(message)) return "تمت معالجة هذا الطلب مسبقاً.";
  if (/cannot_delete_admin|cannot_delete_self/.test(message)) return "لا يمكن حذف حساب مدير.";
  if (/Failed to fetch|NetworkError/i.test(message)) return "تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.";
  return err?.message || "حدث خطأ غير متوقع، حاول مرة أخرى.";
};

const toAuthErrorMessage = (err: any): string => {
  const status = err?.status as number | undefined;
  const message = String(err?.message ?? "");
  if (status === 429 || /rate limit|too many/i.test(message)) {
    return "تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.";
  }
  if (/expired|invalid|token/i.test(message)) return "رمز التحقق غير صحيح أو منتهي الصلاحية.";
  if (/email/i.test(message)) return "البريد الإلكتروني غير صالح.";
  if (/Failed to fetch|NetworkError/i.test(message)) return "تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.";
  return "تعذر إتمام العملية، حاول مرة أخرى.";
};

const toProfile = (row: any, priv?: any, sensitive?: any, pref?: any): UserProfile => ({
  id: row.id,
  memberNumber: row.member_number || row.memberNumber || ("MEMBER-" + (row.id ? String(row.id).slice(0, 5) : "10000")),
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
  prayers: row.prayers,
  hasBeard: row.has_beard ?? row.hasBeard ?? null,
  hijabType: row.hijab_type || row.hijabType || null,
  qaImaStance: row.qa_ima_stance || row.qaImaStance,
  mahrOpinion: row.mahr_opinion || row.mahrOpinion,
  marriageTimeframe: row.marriage_timeframe || row.marriageTimeframe,
  shariaVisionStance: row.sharia_vision_stance || row.shariaVisionStance,
  aboutMe: row.about_me || row.aboutMe || "",
  partnerSpecs: pref?.partner_specs || row.partner_specs || row.partnerSpecs || "",
  hobbies: row.hobbies || [],
  isPremium: row.is_premium ?? row.isPremium ?? false,
  isVerified: row.is_verified ?? row.isVerified ?? false,
  premiumExpiryDate: row.premium_expiry_date || row.premiumExpiryDate,
  joinDate: row.created_at ? String(row.created_at).split("T")[0] : (row.joinDate || "2026-01-01"),
  isOnline: row.is_online ?? row.isOnline ?? false,
  lastSeen: row.last_seen || row.lastSeen,
  viewsCount: row.viewsCount ?? 0,
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [premiumRequests, setPremiumRequests] = useState<PremiumSubscriptionRequest[]>([]);

  const [dbError, setDbError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(false);

  const loadedUserId = useRef<string | null>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearActionError = useCallback(() => setActionError(null), []);

  const showError = useCallback((message: string) => {
    setActionError(message);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setActionError(null), 6000);
  }, []);

  const fail = useCallback((err: any): ActionResult => {
    console.error("[action failed]", err);
    const message = toErrorMessage(err);
    showError(message);
    return { ok: false, error: message };
  }, [showError]);

  const resetState = useCallback(() => {
    loadedUserId.current = null;
    setCurrentUser(null);
    setIsAdmin(false);
    setProfiles([]);
    setMessages([]);
    setNotifications([]);
    setSuccessStories([]);
    setInteractions([]);
    setPremiumRequests([]);
  }, []);

  // ------------------------------------------------------------------
  // Data loading: queries filtered by RLS on the server
  // ------------------------------------------------------------------
  const loadAll = useCallback(async (userId: string, force = false) => {
    if (!force && loadedUserId.current === userId) return;
    loadedUserId.current = userId;
    setIsSupabaseLoading(true);

    try {
      const [
        adminRes, profilesRes, privateRes, sensitiveRes, prefRes,
        messagesRes, notificationsRes, interactionsRes, requestsRes, storiesRes
      ] = await Promise.all([
        supabase.rpc("is_admin"),
        supabase.from("profiles").select("*").limit(100),
        supabase.from("profile_private").select("*"),
        Promise.resolve(supabase.from("profile_sensitive").select("*")).catch(() => ({ data: [] } as any)),
        Promise.resolve(supabase.from("profile_preferences").select("*")).catch(() => ({ data: [] } as any)),
        supabase.from("messages").select("*").order("timestamp", { ascending: true }),
        supabase.from("notifications").select("*").order("timestamp", { ascending: false }),
        supabase.from("interactions").select("*"),
        supabase.from("premium_requests").select("*").order("timestamp", { ascending: false }),
        supabase.from("success_stories").select("*").order("date", { ascending: false }),
      ]);

      const firstError = [
        adminRes, profilesRes, privateRes, messagesRes,
        notificationsRes, interactionsRes, requestsRes, storiesRes
      ].find(r => r.error)?.error;
      if (firstError) throw firstError;

      const privateById = new Map<string, any>((privateRes.data ?? []).map((p: any) => [p.id, p]));
      const sensitiveById = new Map<string, any>((sensitiveRes.data ?? []).map((s: any) => [s.user_id, s]));
      const prefById = new Map<string, any>((prefRes.data ?? []).map((p: any) => [p.user_id, p]));

      const allProfiles = (profilesRes.data ?? []).map((row: any) =>
        toProfile(row, privateById.get(row.id), sensitiveById.get(row.id), prefById.get(row.id))
      );
      const me = allProfiles.find(p => p.id === userId);
      if (!me) throw new Error("profile_missing");

      setIsAdmin(adminRes.data === true);
      setProfiles(allProfiles);
      setCurrentUser(me);
      setMessages((messagesRes.data ?? []) as Message[]);
      setNotifications((notificationsRes.data ?? []) as Notification[]);
      setInteractions((interactionsRes.data ?? []) as Interaction[]);
      setPremiumRequests((requestsRes.data ?? []) as PremiumSubscriptionRequest[]);
      setSuccessStories((storiesRes.data ?? []) as SuccessStory[]);
      setDbError(null);

      if (!me.isOnline) {
        void Promise.resolve(supabase.from("profiles").update({ isOnline: true, is_online: true }).eq("id", userId));
      }
    } catch (err: any) {
      console.error("[loadAll failed]", err);
      loadedUserId.current = null;
      setDbError(
        err?.message === "profile_missing"
          ? "تعذر العثور على ملفك الشخصي. تأكد من تطبيق ملف الـ migration على قاعدة البيانات."
          : "تعذر تحميل البيانات من الخادم. تحقق من الاتصال ثم أعد المحاولة."
      );
    } finally {
      setIsSupabaseLoading(false);
      setIsAuthReady(true);
    }
  }, []);

  // ------------------------------------------------------------------
  // Auth session lifecycle
  // ------------------------------------------------------------------
  useEffect(() => {
    LEGACY_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        resetState();
        setDbError(null);
        setIsAuthReady(true);
        return;
      }
      setTimeout(() => { void loadAll(session.user.id); }, 0);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadAll, resetState]);

  // ------------------------------------------------------------------
  // Realtime subscription for messages & notifications
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel(`rt-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMsg = payload.new as any;
            if (newMsg.senderId === currentUser.id || newMsg.receiverId === currentUser.id ||
                newMsg.sender_id === currentUser.id || newMsg.receiver_id === currentUser.id) {
              const formatted: Message = {
                id: newMsg.id,
                senderId: newMsg.senderId || newMsg.sender_id,
                receiverId: newMsg.receiverId || newMsg.receiver_id,
                content: newMsg.content,
                timestamp: newMsg.timestamp || newMsg.created_at,
                isRead: newMsg.isRead ?? newMsg.is_read ?? false,
              };
              setMessages((prev) => {
                if (prev.some(m => m.id === formatted.id)) return prev;
                return [...prev, formatted];
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as any;
            setMessages((prev) => prev.map(m => (m.id === updated.id ? { ...m, isRead: updated.isRead ?? updated.is_read ?? m.isRead } : m)));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newNotif = payload.new as any;
            if (newNotif.userId === currentUser.id || newNotif.user_id === currentUser.id) {
              const formatted: Notification = {
                id: newNotif.id,
                userId: newNotif.userId || newNotif.user_id,
                type: newNotif.type,
                senderId: newNotif.senderId || newNotif.sender_id,
                senderName: newNotif.senderName || newNotif.sender_name,
                content: newNotif.content,
                timestamp: newNotif.timestamp || newNotif.created_at,
                isRead: newNotif.isRead ?? newNotif.is_read ?? false,
              };
              setNotifications((prev) => {
                if (prev.some(n => n.id === formatted.id)) return prev;
                return [formatted, ...prev];
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as any;
            setNotifications((prev) => prev.map(n => (n.id === updated.id ? { ...n, isRead: updated.isRead ?? updated.is_read ?? n.isRead } : n)));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interactions",
        },
        (payload) => {
          const newInt = payload.new as any;
          if (newInt.fromUserId === currentUser.id || newInt.toUserId === currentUser.id ||
              newInt.from_user_id === currentUser.id || newInt.to_user_id === currentUser.id) {
            const formatted: Interaction = {
              id: newInt.id,
              fromUserId: newInt.fromUserId || newInt.from_user_id,
              toUserId: newInt.toUserId || newInt.to_user_id,
              type: newInt.type,
              reason: newInt.reason,
              timestamp: newInt.timestamp || newInt.created_at,
            };
            setInteractions((prev) => {
              if (prev.some(i => i.id === formatted.id)) return prev;
              return [...prev, formatted];
            });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  const retryLoadData = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      await loadAll(data.session.user.id, true);
    } else {
      setIsAuthReady(true);
    }
  }, [loadAll]);

  // ------------------------------------------------------------------
  // Auth actions (email OTP)
  // ------------------------------------------------------------------
  const requestEmailOtp = async (email: string): Promise<ActionResult> => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    if (error) return { ok: false, error: toAuthErrorMessage(error) };
    return { ok: true };
  };

  const verifyEmailOtp = async (email: string, code: string): Promise<ActionResult> => {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email",
    });
    if (error) return { ok: false, error: toAuthErrorMessage(error) };
    return { ok: true };
  };

  const logout = async () => {
    if (currentUser) {
      await Promise.resolve(
        supabase.from("profiles").update({ isOnline: false, is_online: false, lastSeen: "الآن", last_seen: "الآن" }).eq("id", currentUser.id)
      ).catch(() => undefined);
    }
    await supabase.auth.signOut();
    resetState();
  };

  const deleteMyAccount = async (): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };
    const { error } = await supabase.rpc("delete_my_account_rpc");
    if (error) return fail(error);
    await logout();
    return { ok: true };
  };

  const submitCharterAgreement = async (): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };
    const { error } = await supabase.rpc("accept_charter", { p_version: "v1" });
    if (error) return fail(error);
    const updated = { ...currentUser, agreedToCharter: true };
    setCurrentUser(updated);
    setProfiles(prev => prev.map(p => (p.id === currentUser.id ? updated : p)));
    return { ok: true };
  };

  // ------------------------------------------------------------------
  // Profile & Sensitive / Preferences Saving
  // ------------------------------------------------------------------
  const saveProfile = async (updatedData: Partial<UserProfile>): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };

    const mobile = updatedData.mobile?.trim();
    const profileData: Record<string, unknown> = { ...updatedData };
    SERVER_MANAGED_KEYS.forEach(key => delete profileData[key]);

    // دعم snake_case
    if (profileData.maritalStatus) profileData.marital_status = profileData.maritalStatus;
    if (profileData.hasChildren !== undefined) profileData.has_children = profileData.hasChildren;
    if (profileData.childrenCount !== undefined) profileData.children_count = profileData.childrenCount;
    if (profileData.isSmoker !== undefined) profileData.is_smoker = profileData.isSmoker;
    if (profileData.skinColor) profileData.skin_color = profileData.skinColor;
    if (profileData.bodyBuild) profileData.body_build = profileData.bodyBuild;
    if (profileData.religiousCommitment) profileData.religious_commitment = profileData.religiousCommitment;
    if (profileData.hasBeard !== undefined) profileData.has_beard = profileData.hasBeard;
    if (profileData.hijabType !== undefined) profileData.hijab_type = profileData.hijabType;
    if (profileData.qaImaStance) profileData.qa_ima_stance = profileData.qaImaStance;
    if (profileData.mahrOpinion) profileData.mahr_opinion = profileData.mahrOpinion;
    if (profileData.marriageTimeframe) profileData.marriage_timeframe = profileData.marriageTimeframe;
    if (profileData.shariaVisionStance) profileData.sharia_vision_stance = profileData.shariaVisionStance;
    if (profileData.aboutMe) profileData.about_me = profileData.aboutMe;
    if (profileData.partnerSpecs) profileData.partner_specs = profileData.partnerSpecs;
    if (profileData.photoPrivacy) profileData.photo_privacy = profileData.photoPrivacy;
    if (profileData.incognitoMode !== undefined) profileData.incognito_mode = profileData.incognitoMode;

    let merged: UserProfile = { ...currentUser, ...updatedData };

    if (Object.keys(profileData).length > 0) {
      const { data, error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", currentUser.id)
        .select()
        .single();
      if (error) return fail(error);
      merged = { ...merged, ...toProfile(data) };
    }

    // حفظ في جداول البيانات الحساسة والتفضيلات
    const sensitiveFields: any = {};
    if (updatedData.income) sensitiveFields.income = updatedData.income;
    if (updatedData.healthStatus) sensitiveFields.health_status = updatedData.healthStatus;
    if (updatedData.hasDisability !== undefined) sensitiveFields.has_disability = updatedData.hasDisability;
    if (updatedData.chronicDiseases !== undefined) sensitiveFields.chronic_diseases = updatedData.chronicDiseases;

    if (Object.keys(sensitiveFields).length > 0) {
      await Promise.resolve(supabase.from("profile_sensitive").upsert({
        user_id: currentUser.id,
        ...sensitiveFields,
      })).catch(() => undefined);
    }

    if (updatedData.partnerSpecs) {
      await Promise.resolve(supabase.from("profile_preferences").upsert({
        user_id: currentUser.id,
        partner_specs: updatedData.partnerSpecs,
      })).catch(() => undefined);
    }

    if (mobile !== undefined && mobile !== currentUser.mobile) {
      const { error } = await supabase
        .from("profile_private")
        .update({ mobile })
        .eq("id", currentUser.id);
      if (error) return fail(error);
      merged = { ...merged, mobile, isMobileVerified: false };
    }

    setCurrentUser(merged);
    setProfiles(prev => prev.map(p => (p.id === merged.id ? merged : p)));
    return { ok: true };
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => saveProfile(updatedData);
  const updateAvatar = (avatarId: string) => saveProfile({ avatar: avatarId });

  // ------------------------------------------------------------------
  // Image Upload with Client-Side Compression & Storage Bucket
  // ------------------------------------------------------------------
  const uploadCustomImage = async (fileOrBase64: File | Blob | string): Promise<ActionResult> => {
    if (!currentUser?.isPremium) {
      return fail({ code: "42501", message: "رفع صورة خاصة متاح حصرياً للأعضاء المشتركين في باقة التميز." });
    }

    try {
      // ضغط الصورة في المتصفح أولاً
      const { blob, dataUrl } = await compressImage(fileOrBase64, 800, 800, 0.82);

      // محاولة الرفع إلى Supabase Storage Bucket 'profile-photos'
      const filePath = `${currentUser.id}/avatar_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (!uploadError) {
        // توليد Signed URL طويل المدى للمستخدم
        const { data: signedData } = await supabase.storage
          .from("profile-photos")
          .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

        const finalUrl = signedData?.signedUrl || dataUrl;
        return saveProfile({
          profileImage: finalUrl,
        });
      }

      // إذا لم يكن الـ bucket معداً بعد، نعتمد dataUrl المضغوط كبديل آمن
      return saveProfile({ profileImage: dataUrl });
    } catch (err: any) {
      return fail(err);
    }
  };

  const updatePhotoPrivacy = async (privacy: "public" | "accepted_interest_only" | "hidden"): Promise<ActionResult> => {
    return saveProfile({ photoPrivacy: privacy });
  };

  const toggleIncognitoMode = async (): Promise<ActionResult> => {
    if (!currentUser?.isPremium) {
      return fail({ message: "ميزة التصفح الخفي حصرية للأعضاء المشتركين في باقة التميز." });
    }
    const nextState = !currentUser.incognitoMode;
    return saveProfile({ incognitoMode: nextState });
  };

  // ------------------------------------------------------------------
  // Interactions & Real Profile Views
  // ------------------------------------------------------------------
  const insertInteraction = async (
    toUserId: string,
    type: Interaction["type"],
    reason?: string
  ): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };

    const { data, error } = await supabase
      .from("interactions")
      .insert({ fromUserId: currentUser.id, toUserId, type, ...(reason ? { reason } : {}) })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return { ok: true };
      return fail(error);
    }
    setInteractions(prev => [...prev, data as Interaction]);
    return { ok: true };
  };

  const expressInterest = async (toUserId: string): Promise<ActionResult> => {
    // محاولة استخدام RPC المحمي مع فحص Rate Limit
    const { error } = await supabase.rpc("express_interest_rpc", { p_target_id: toUserId });
    if (!error) {
      return insertInteraction(toUserId, "interest");
    }
    if (/rate_limit/i.test(error.message)) {
      return fail(error);
    }
    return insertInteraction(toUserId, "interest");
  };

  const acceptInterest = async (toUserId: string): Promise<ActionResult> => {
    const { error } = await supabase.rpc("accept_interest_rpc", { p_target_id: toUserId });
    if (!error) {
      const res = await insertInteraction(toUserId, "accept_interest");
      if (currentUser) await loadAll(currentUser.id, true);
      return res;
    }
    return insertInteraction(toUserId, "accept_interest");
  };

  const ignoreProfile = (toUserId: string) => insertInteraction(toUserId, "ignore");

  const unignoreProfile = async (toUserId: string): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };
    const { error } = await supabase
      .from("interactions")
      .delete()
      .eq("fromUserId", currentUser.id)
      .eq("toUserId", toUserId)
      .eq("type", "ignore");
    if (error) return fail(error);
    setInteractions(prev =>
      prev.filter(i => !(i.fromUserId === currentUser.id && i.toUserId === toUserId && i.type === "ignore"))
    );
    return { ok: true };
  };

  const blockProfile = async (toUserId: string): Promise<ActionResult> => {
    const res = await insertInteraction(toUserId, "block");
    if (res.ok && currentUser) {
      await loadAll(currentUser.id, true);
    }
    return res;
  };

  const reportProfile = (toUserId: string, reason: string) =>
    insertInteraction(toUserId, "report", reason.trim().slice(0, 500));

  const recordProfileView = async (viewedId: string): Promise<void> => {
    if (!currentUser || currentUser.id === viewedId) return;
    try {
      await supabase.rpc("record_profile_view_rpc", { p_viewed_id: viewedId });
    } catch {
      // Ignored if RPC is pending
    }
  };

  // ------------------------------------------------------------------
  // Server-Side Search with Pagination
  // ------------------------------------------------------------------
  const searchProfiles = async (filter: SearchProfilesFilter): Promise<SearchProfilesResponse> => {
    try {
      const { data, error } = await supabase.rpc("search_profiles_rpc", {
        p_gender: filter.gender,
        p_min_age: filter.minAge,
        p_max_age: filter.maxAge,
        p_residence: filter.residence,
        p_nationality: filter.nationality,
        p_marital_status: filter.maritalStatus,
        p_religious_commitment: filter.religiousCommitment,
        p_education: filter.education,
        p_prayers: filter.prayers,
        p_smoking: filter.smoking,
        p_min_height: filter.minHeight,
        p_max_height: filter.maxHeight,
        p_is_verified_only: filter.isVerifiedOnly || false,
        p_hijab_type: filter.hijabType,
        p_has_beard: filter.hasBeard,
        p_search_query: filter.searchQuery,
        p_sort_by: filter.sortBy || "latest",
        p_page: filter.page || 1,
        p_page_size: filter.pageSize || 12,
      });

      if (!error && data && data.results) {
        return {
          results: data.results.map((r: any) => toProfile(r)),
          total: data.total || 0,
          page: data.page || 1,
          pageSize: data.pageSize || 12,
          totalPages: data.totalPages || 1,
        };
      }
    } catch {
      // Fallback below
    }

    // Fallback: local memory filter
    const oppositeGender = currentUser?.gender === "male" ? "female" : "male";
    const filtered = profiles.filter(p => {
      if (p.id === currentUser?.id) return false;
      if (p.gender !== oppositeGender) return false;
      if (filter.minAge && p.age < filter.minAge) return false;
      if (filter.maxAge && p.age > filter.maxAge) return false;
      if (filter.residence && p.residence !== filter.residence) return false;
      if (filter.nationality && p.nationality !== filter.nationality) return false;
      if (filter.maritalStatus && p.maritalStatus !== filter.maritalStatus) return false;
      if (filter.religiousCommitment && p.religiousCommitment !== filter.religiousCommitment) return false;
      if (filter.education && p.education !== filter.education) return false;
      if (filter.prayers && p.prayers !== filter.prayers) return false;
      if (filter.smoking !== undefined && p.isSmoker !== filter.smoking) return false;
      if (filter.minHeight && p.height < filter.minHeight) return false;
      if (filter.maxHeight && p.height > filter.maxHeight) return false;
      if (filter.isVerifiedOnly && !p.isVerified) return false;
      if (filter.hijabType && p.hijabType !== filter.hijabType) return false;
      if (filter.hasBeard !== undefined && p.hasBeard !== filter.hasBeard) return false;
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        const matches = p.name.toLowerCase().includes(q) ||
          p.aboutMe.toLowerCase().includes(q) ||
          p.profession.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    const page = filter.page || 1;
    const pageSize = filter.pageSize || 12;
    const start = (page - 1) * pageSize;

    return {
      results: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    };
  };

  const fetchProfileById = useCallback(async (id: string): Promise<UserProfile | null> => {
    if (!id) return null;
    if (currentUser?.id === id) return currentUser;
    const existing = profiles.find(p => p.id === id);
    if (existing) return existing;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) return null;
      const loaded = toProfile(data);
      setProfiles(prev => (prev.some(p => p.id === loaded.id) ? prev : [...prev, loaded]));
      return loaded;
    } catch {
      return null;
    }
  }, [profiles, currentUser]);

  // ------------------------------------------------------------------
  // Messaging with Rate Limiting
  // ------------------------------------------------------------------
  const sendMessage = async (toUserId: string, content: string): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };
    const text = content.trim();
    if (!text) return { ok: false, error: "الرسالة فارغة." };
    if (text.length > MAX_MESSAGE_LENGTH) {
      return fail({ code: "23514" });
    }

    // محاولة استخدام RPC المحمي مع فحص Rate Limit
    const { data: rpcData, error: rpcError } = await supabase.rpc("send_message_rpc", {
      p_receiver_id: toUserId,
      p_content: text,
    });

    if (!rpcError && rpcData?.ok) {
      const msg: Message = {
        id: rpcData.message_id || `msg-${Date.now()}`,
        senderId: currentUser.id,
        receiverId: toUserId,
        content: text,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setMessages(prev => [...prev, msg]);
      return { ok: true };
    }

    if (rpcError && /rate_limit/i.test(rpcError.message)) {
      return fail(rpcError);
    }

    // Fallback: direct insert
    const { data, error } = await supabase
      .from("messages")
      .insert({ senderId: currentUser.id, receiverId: toUserId, content: text })
      .select()
      .single();
    if (error) return fail(error);

    setMessages(prev => [...prev, data as Message]);
    return { ok: true };
  };

  const markMessagesAsRead = (senderId: string) => {
    if (!currentUser) return;
    const hasUnread = messages.some(
      m => m.senderId === senderId && m.receiverId === currentUser.id && !m.isRead
    );
    if (!hasUnread) return;

    setMessages(prev => prev.map(m =>
      m.senderId === senderId && m.receiverId === currentUser.id ? { ...m, isRead: true } : m
    ));
    void Promise.resolve(supabase.rpc("mark_messages_read", { p_sender: senderId }));
  };

  // ------------------------------------------------------------------
  // Notifications
  // ------------------------------------------------------------------
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    void Promise.resolve(supabase.rpc("mark_notification_read", { p_id: id }));
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => (n.userId === currentUser.id ? { ...n, isRead: true } : n)));
    void Promise.resolve(supabase.rpc("mark_all_notifications_read"));
  };

  // ------------------------------------------------------------------
  // Premium
  // ------------------------------------------------------------------
  const submitPremiumRequest = async (
    plan: PlanDuration,
    paymentMethod: PaymentMethod,
    phoneNumber?: string
  ): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };

    const { data, error } = await supabase
      .from("premium_requests")
      .insert({
        userId: currentUser.id,
        planDuration: plan,
        paymentMethod,
        phoneNumber: phoneNumber?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        const message = "لديك طلب اشتراك معلق بالفعل بانتظار المراجعة.";
        showError(message);
        return { ok: false, error: message };
      }
      return fail(error);
    }
    setPremiumRequests(prev => [data as PremiumSubscriptionRequest, ...prev]);
    return { ok: true };
  };

  // ------------------------------------------------------------------
  // Admin Operations
  // ------------------------------------------------------------------
  const runAdminAction = async (fn: string, args: Record<string, string>): Promise<ActionResult> => {
    const { error } = await supabase.rpc(fn, args);
    if (error) return fail(error);
    if (currentUser) await loadAll(currentUser.id, true);
    return { ok: true };
  };

  const adminApprovePremium = (requestId: string) =>
    runAdminAction("admin_approve_premium", { p_request_id: requestId });

  const adminRejectPremium = (requestId: string) =>
    runAdminAction("admin_reject_premium", { p_request_id: requestId });

  const adminVerifyUser = (userId: string) =>
    runAdminAction("admin_verify_user", { p_user_id: userId });

  const adminDeleteUser = (userId: string) =>
    runAdminAction("admin_delete_user", { p_user_id: userId });

  const adminApproveStory = (storyId: string) =>
    runAdminAction("admin_approve_story", { p_story_id: storyId });

  const adminAddStory = async (husband: string, wife: string, storyContent: string): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };

    const { data, error } = await supabase
      .from("success_stories")
      .insert({
        husbandName: husband.trim(),
        wifeName: wife.trim(),
        story: storyContent.trim(),
        avatarHusband: "male_4",
        avatarWife: "female_4",
        submittedBy: currentUser.id,
      })
      .select()
      .single();
    if (error) return fail(error);

    setSuccessStories(prev => [data as SuccessStory, ...prev]);
    return { ok: true };
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      isAdmin,
      profiles,
      messages,
      notifications,
      successStories,
      interactions,
      premiumRequests,
      dbError,
      actionError,
      isAuthReady,
      isSupabaseLoading,

      requestEmailOtp,
      verifyEmailOtp,
      submitCharterAgreement,
      saveProfile,
      updateProfile,
      updateAvatar,
      uploadCustomImage,
      updatePhotoPrivacy,
      toggleIncognitoMode,
      deleteMyAccount,
      logout,
      clearActionError,

      expressInterest,
      acceptInterest,
      ignoreProfile,
      unignoreProfile,
      blockProfile,
      reportProfile,
      recordProfileView,

      sendMessage,
      markMessagesAsRead,
      searchProfiles,
      fetchProfileById,

      markNotificationAsRead,
      markAllNotificationsAsRead,

      submitPremiumRequest,

      adminApprovePremium,
      adminRejectPremium,
      adminVerifyUser,
      adminDeleteUser,
      adminApproveStory,
      adminAddStory,
      retryLoadData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
