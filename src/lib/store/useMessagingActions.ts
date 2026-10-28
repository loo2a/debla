import { useCallback } from "react";
import { Message, Notification, UserProfile } from "../../types";
import { ActionResult } from "./types";
import { supabase } from "../supabase";
import { toErrorMessage, MAX_MESSAGE_LENGTH } from "./mappers";
import { checkMessageSafety } from "../safetyModeration";
import { getJourneyState } from "../marriageJourney";

const fail = (err: any): ActionResult => ({
  ok: false,
  error: toErrorMessage(err),
});

export const useMessagingActions = (
  currentUser: UserProfile | null,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  const sendMessage = async (toUserId: string, content: string): Promise<ActionResult> => {
    if (!currentUser) return { ok: false, error: "يجب تسجيل الدخول أولاً." };
    const text = content.trim();
    if (!text) return { ok: false, error: "الرسالة فارغة." };
    if (text.length > MAX_MESSAGE_LENGTH) {
      return fail({ code: "23514" });
    }

    const safetyCheck = checkMessageSafety(text);
    if (!safetyCheck.isAllowed) {
      return {
        ok: false,
        error: safetyCheck.reason || "الرسالة تحتوي على بيانات اتصال مخالفة لضوابط الأمان والوقار."
      };
    }

    const journeyState = getJourneyState(currentUser.id, toUserId);
    if (journeyState.status === "concluded" && !text.includes("اعتذار راقٍ وإنهاء مسار التعارف")) {
      return { 
        ok: false, 
        error: "تم إنهاء مسار التعارف باعتذار محترم مسبقاً، وتوقف التواصل لحفظ الكرامة ومنع الإلحاح وفق ميثاق الوقار." 
      };
    }

    const { data: rpcData, error: rpcError } = await supabase.rpc("send_message_rpc", {
      p_receiver_id: toUserId,
      p_content: text,
    });

    const triggerPushNotification = (recipientId: string, messageText: string) => {
      void Promise.resolve(
        supabase.functions.invoke("send-push", {
          body: {
            userId: recipientId,
            title: `رسالة جديدة من ${currentUser.name}`,
            body: messageText.length > 60 ? `${messageText.slice(0, 60)}...` : messageText,
            data: { chatUserId: currentUser.id, type: "message", url: `/inbox/${currentUser.id}` },
          },
        })
      ).catch(() => {});
    };

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
      triggerPushNotification(toUserId, text);
      return { ok: true };
    }

    return fail(rpcError || new Error("تعذر إرسال الرسالة، يرجى المحاولة لاحقاً."));
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

  const fetchConversationMessages = useCallback(async (partnerId: string, limit = 50): Promise<Message[]> => {
    if (!currentUser) return [];
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(senderId.eq.${currentUser.id},receiverId.eq.${partnerId}),and(senderId.eq.${partnerId},receiverId.eq.${currentUser.id})`)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) throw error;
      const fetched = ((data ?? []) as Message[]).slice().reverse();
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newOnes = fetched.filter(m => !existingIds.has(m.id));
        return [...prev, ...newOnes];
      });
      return fetched;
    } catch (err) {
      console.warn("fetchConversationMessages error:", err);
      return [];
    }
  }, [currentUser, setMessages]);

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    void Promise.resolve(supabase.rpc("mark_notification_read", { p_id: id }));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    void Promise.resolve(supabase.rpc("mark_all_notifications_read"));
  };

  return {
    sendMessage,
    markMessagesAsRead,
    fetchConversationMessages,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
};
