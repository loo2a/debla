import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  UserProfile, Message, Notification, SuccessStory, Interaction,
  PremiumSubscriptionRequest,
  GuardianLinkStatus,
  CompatibilitySurvey, ProfileEditRequest,
  Coupon,
  AcademyArticle
} from "../types";
import { supabase } from "./supabase";
import { INITIAL_ACADEMY_ARTICLES } from "./defaultAcademyArticles";
import {
  ActionResult, PlanDuration, PaymentMethod, AppContextType
} from "./store/types";
import {
  LEGACY_STORAGE_KEYS, toProfile, toErrorMessage
} from "./store/mappers";
import { useAuthSlice } from "./store/useAuthSlice";
import { useInteractionActions } from "./store/useInteractionActions";
import { useMessagingActions } from "./store/useMessagingActions";
import { useSearchActions } from "./store/useSearchActions";
import { useGuardianActions } from "./store/useGuardianActions";
import { useSurveyActions } from "./store/useSurveyActions";
import { useAcademyActions } from "./store/useAcademyActions";
import { useAdminActions } from "./store/useAdminActions";

export type { ActionResult, PlanDuration, PaymentMethod, AppContextType };
export { LOCKED_IDENTITY_KEYS, SERVER_MANAGED_KEYS, toProfile } from "./store/mappers";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [premiumRequests, setPremiumRequests] = useState<PremiumSubscriptionRequest[]>([]);
  const [guardianStatus, setGuardianStatus] = useState<GuardianLinkStatus | null>(null);
  const [mySurvey, setMySurvey] = useState<CompatibilitySurvey | null>(null);
  const [allSurveys, setAllSurveys] = useState<Map<string, CompatibilitySurvey>>(new Map());
  const [profileEditRequests, setProfileEditRequests] = useState<ProfileEditRequest[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [academyArticles, setAcademyArticles] = useState<AcademyArticle[]>(INITIAL_ACADEMY_ARTICLES);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const [dbError, setDbError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(false);

  const loadedUserId = useRef<string | null>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isUserOnline = useCallback((userId: string): boolean => {
    if (onlineUserIds.has(userId)) return true;
    const p = profiles.find(x => x.id === userId);
    return Boolean(p?.isOnline);
  }, [onlineUserIds, profiles]);

  // ⚡ التواجد اللحظي الحقيقي (Realtime Presence) مع احترام التصفح الخفي
  useEffect(() => {
    if (!currentUser?.id) return;

    const isIncognito = Boolean(currentUser.isPremium && currentUser.incognitoMode);
    if (isIncognito) return;

    const channel = supabase.channel("online_presence_room", {
      config: { presence: { key: currentUser.id } }
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const activeIds = new Set<string>();
        for (const key of Object.keys(state)) {
          activeIds.add(key);
        }
        setOnlineUserIds(activeIds);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUser.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [currentUser?.id, currentUser?.isPremium, currentUser?.incognitoMode]);

  useEffect(() => {
    void Promise.resolve(supabase.rpc("expire_premium_subscriptions")).catch(() => {});
  }, []);

  const clearActionError = useCallback(() => setActionError(null), []);

  const showError = useCallback((message: string) => {
    setActionError(message);
    if (errorTimer.current) clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setActionError(null), 6000);
  }, []);

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
    setGuardianStatus(null);
    setMySurvey(null);
    setAllSurveys(new Map());
    setProfileEditRequests([]);
    setCoupons([]);
    setAcademyArticles([]);
  }, []);

  // ------------------------------------------------------------------
  // Data loading
  // ------------------------------------------------------------------
  const loadAll = useCallback(async (userId: string, force = false) => {
    if (!force && loadedUserId.current === userId) return;
    loadedUserId.current = userId;
    setIsSupabaseLoading(true);

    try {
      const { data: isAdminData } = await supabase.rpc("is_admin");
      const userIsAdmin = Boolean(isAdminData);

      const [
        myProfileRes, myPrivateRes, mySensitiveRes, myPrefRes,
        candidatesRes,
        messagesRes, notificationsRes, interactionsRes, requestsRes, storiesRes,
        surveysRes, editRequestsRes, couponsRes
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("profile_private").select("*").eq("id", userId).maybeSingle(),
        Promise.resolve(supabase.from("profile_sensitive").select("*").eq("user_id", userId).maybeSingle()).catch(() => ({ data: null } as any)),
        Promise.resolve(supabase.from("profile_preferences").select("*").eq("user_id", userId).maybeSingle()).catch(() => ({ data: null } as any)),
        supabase.from("profiles").select("*").neq("id", userId).limit(30),
        supabase.from("messages").select("*").or(`senderId.eq.${userId},receiverId.eq.${userId}`).order("timestamp", { ascending: false }).limit(100),
        supabase.from("notifications").select("*").eq("userId", userId).order("timestamp", { ascending: false }).limit(40),
        supabase.from("interactions").select("*").or(`fromUserId.eq.${userId},toUserId.eq.${userId}`).limit(150),
        userIsAdmin ? supabase.from("premium_requests").select("*").order("timestamp", { ascending: false }).limit(50) : Promise.resolve({ data: [] } as any),
        supabase.from("success_stories").select("*").order("date", { ascending: false }).limit(10),
        Promise.resolve(supabase.from("compatibility_surveys").select("*").limit(30)).catch(() => ({ data: [] } as any)),
        userIsAdmin ? Promise.resolve(supabase.from("profile_edit_requests").select("*").order("created_at", { ascending: false }).limit(50)).catch(() => ({ data: [] } as any)) : Promise.resolve({ data: [] } as any),
        userIsAdmin ? Promise.resolve(supabase.from("coupons").select("*").order("created_at", { ascending: false }).limit(50)).catch(() => ({ data: [] } as any)) : Promise.resolve({ data: [] } as any),
      ]);

      const firstError = [
        messagesRes, notificationsRes, interactionsRes, storiesRes
      ].find(r => r.error)?.error;
      if (firstError) throw firstError;

      const allProfiles: UserProfile[] = [];
      let me: UserProfile | undefined = undefined;

      if (myProfileRes.data) {
        me = toProfile(myProfileRes.data, myPrivateRes.data, mySensitiveRes.data, myPrefRes.data);
        allProfiles.push(me);
      }

      const myReligion = (me?.religion || "مسلم").trim();
      const targetGender = me ? (me.gender === "male" ? "female" : "male") : null;

      (candidatesRes.data ?? []).forEach((row: any) => {
        const p = toProfile(row);
        if (targetGender && p.gender !== targetGender) return;
        if ((p.religion || "مسلم").trim() !== myReligion) return;
        allProfiles.push(p);
      });

      if (!me) {
        const { data: myRow } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
        if (myRow) {
          me = toProfile(myRow, myPrivateRes.data, mySensitiveRes.data, myPrefRes.data);
          allProfiles.push(me);
        }
      }

      if (!me) {
        const { data: createdRow } = await supabase.rpc("ensure_my_profile");
        if (createdRow) {
          me = toProfile(createdRow, myPrivateRes.data, mySensitiveRes.data, myPrefRes.data);
          allProfiles.push(me);
        }
      }

      if (!me) {
        const { data: userData } = await supabase.auth.getUser();
        const googleUser = userData?.user;
        const initialName = googleUser?.user_metadata?.full_name || googleUser?.user_metadata?.name || "";
        const initialEmail = googleUser?.email || "";

        me = {
          id: userId,
          memberNumber: "MEMBER-" + userId.slice(0, 5),
          name: initialName,
          email: initialEmail,
          agreedToCharter: false,
          gender: "male" as any,
          accountRole: "seeker_male",
          avatar: "male_1",
          age: 25,
          nationality: "مصر",
          residence: "مصر",
          joinDate: new Date().toISOString().split("T")[0],
          viewsCount: 0,
        } as UserProfile;
        allProfiles.push(me);
      }

      const surveysMap = new Map<string, CompatibilitySurvey>();
      (surveysRes.data ?? []).forEach((row: any) => {
        surveysMap.set(row.user_id, {
          id: row.id,
          userId: row.user_id,
          leisureStyle: row.leisure_style || "",
          conflictStyle: row.conflict_style || "",
          financialView: row.financial_view || "",
          privacyBoundary: row.privacy_boundary || "",
          lifePriority: row.life_priority || "",
          redFlags: row.red_flags || [],
          flexiblePoints: row.flexible_points || [],
          isPublicInProfile: row.is_public_in_profile ?? true,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      });
      setAllSurveys(surveysMap);
      setMySurvey(surveysMap.get(userId) || null);

      const parsedEditRequests: ProfileEditRequest[] = (editRequestsRes.data ?? []).map((row: any) => {
        const userObj = allProfiles.find(p => p.id === row.user_id);
        return {
          id: row.id,
          userId: row.user_id,
          userName: userObj?.name || row.user_name || "مستخدم",
          userMemberNumber: userObj?.memberNumber || row.user_member_number,
          requestedChanges: row.requested_changes || {},
          reason: row.reason || "",
          status: row.status || "pending",
          adminNotes: row.admin_notes,
          createdAt: row.created_at,
          reviewedAt: row.reviewed_at,
        };
      });
      setProfileEditRequests(parsedEditRequests);

      const parsedCoupons: Coupon[] = (couponsRes.data ?? []).map((row: any) => ({
        id: row.id,
        code: row.code,
        discountPercent: row.discount_percent ?? row.discountPercent ?? 0,
        maxUses: row.max_uses ?? row.maxUses ?? 0,
        usedCount: row.used_count ?? row.usedCount ?? 0,
        validUntil: row.valid_until || row.validUntil,
        isActive: row.is_active ?? row.isActive ?? true,
        notes: row.notes || "",
        createdAt: row.created_at,
      }));
      setCoupons(parsedCoupons);

      setIsAdmin(userIsAdmin);
      setProfiles(allProfiles);
      setCurrentUser(me);
      setMessages(((messagesRes.data ?? []) as Message[]).slice().reverse());
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

    const cleanOAuthHash = () => {
      if (typeof window !== "undefined" && window.location.hash && window.location.hash.includes("access_token")) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };

    let authInitiated = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      cleanOAuthHash();
      if (event === "SIGNED_OUT" || !session) {
        resetState();
        setDbError(null);
        setIsAuthReady(true);
        return;
      }
      authInitiated = true;
      void loadAll(session.user.id);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        cleanOAuthHash();
        if (!authInitiated) {
          authInitiated = true;
          void loadAll(data.session.user.id);
        }
      } else {
        setIsAuthReady(true);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [loadAll, resetState]);

  // ------------------------------------------------------------------
  // Realtime subscription
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabase
      .channel(`rt-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiverId=eq.${currentUser.id}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
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
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `senderId=eq.${currentUser.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setMessages((prev) => prev.map(m => (m.id === updated.id ? { ...m, isRead: updated.isRead ?? updated.is_read ?? m.isRead } : m)));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `userId=eq.${currentUser.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newNotif = payload.new as any;
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
          filter: `toUserId=eq.${currentUser.id}`,
        },
        (payload) => {
          const newInt = payload.new as any;
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

  // Modular Slices Integration
  const authSlice = useAuthSlice(
    currentUser,
    isAdmin,
    setCurrentUser,
    setProfiles,
    resetState
  );

  const interactionActions = useInteractionActions(
    currentUser,
    setInteractions,
    setProfiles,
    loadAll
  );

  const messagingActions = useMessagingActions(
    currentUser,
    messages,
    setMessages,
    setNotifications
  );

  const searchActions = useSearchActions(
    currentUser,
    profiles,
    setProfiles
  );

  const guardianActions = useGuardianActions(
    currentUser?.id,
    setGuardianStatus
  );

  const surveyActions = useSurveyActions(
    currentUser,
    allSurveys,
    setMySurvey,
    setAllSurveys
  );

  const academyActions = useAcademyActions(
    currentUser,
    academyArticles,
    setAcademyArticles,
    setCurrentUser,
    authSlice.saveProfile
  );

  const adminActions = useAdminActions(
    currentUser,
    isAdmin,
    profileEditRequests,
    loadAll,
    setSuccessStories,
    setProfileEditRequests,
    setProfiles,
    setCurrentUser,
    setCoupons
  );

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
      return { ok: false, error: toErrorMessage(error) };
    }
    setPremiumRequests(prev => [data as PremiumSubscriptionRequest, ...prev]);
    return { ok: true };
  };

  const contextValue = useMemo<AppContextType>(() => ({
    currentUser,
    isAdmin,
    profiles,
    messages,
    notifications,
    successStories,
    interactions,
    premiumRequests,
    guardianStatus,
    mySurvey,
    allSurveys,
    profileEditRequests,
    dbError,
    actionError,
    isAuthReady,
    isSupabaseLoading,

    ...authSlice,
    clearActionError,

    ...interactionActions,
    onlineUserIds,
    isUserOnline,

    ...messagingActions,
    ...searchActions,

    submitPremiumRequest,
    retryLoadData,

    ...guardianActions,
    ...surveyActions,
    ...adminActions,

    coupons,
    academyArticles,
    ...academyActions,
  }), [
    currentUser,
    isAdmin,
    profiles,
    messages,
    notifications,
    successStories,
    interactions,
    premiumRequests,
    guardianStatus,
    mySurvey,
    allSurveys,
    profileEditRequests,
    dbError,
    actionError,
    isAuthReady,
    isSupabaseLoading,
    onlineUserIds,
    coupons,
    academyArticles,
    authSlice,
    interactionActions,
    messagingActions,
    searchActions,
    guardianActions,
    surveyActions,
    adminActions,
    academyActions,
    clearActionError,
    isUserOnline,
    retryLoadData,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
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
