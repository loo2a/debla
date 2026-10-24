import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../lib/store";
import { Gender, MaritalStatus, Message, Notification, UserProfile } from "../types";
import { 
  Bell, Mail, MessageSquare, Send, CheckCheck, 
  Trash2, ShieldCheck, ChevronLeft, ArrowRight, Sparkles, Lock, ShieldAlert 
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getAvatarUrl } from "../lib/avatarUtils";
import { MarriageJourneyTracker } from "./MarriageJourneyTracker";
import { getJourneyState, MARRIAGE_STAGES } from "../lib/marriageJourney";

interface InboxPageProps {
  selectedChatUserId?: string | null;
  onCloseChat?: () => void;
  onOpenChat?: (userId: string) => void;
}

export const InboxPage: React.FC<InboxPageProps> = ({ 
  selectedChatUserId: propSelectedChatUserId, 
  onCloseChat: propOnCloseChat, 
  onOpenChat: propOnOpenChat 
}) => {
  const params = useParams<{ chatUserId?: string }>();
  const navigate = useNavigate();
  const selectedChatUserId = propSelectedChatUserId ?? (params.chatUserId || null);

  const handleCloseChat = () => {
    if (propOnCloseChat) {
      propOnCloseChat();
    } else {
      navigate("/inbox");
    }
  };

  const handleOpenChat = (userId: string) => {
    if (propOnOpenChat) {
      propOnOpenChat(userId);
    } else {
      navigate(`/inbox/${userId}`);
    }
  };

  const { 
    currentUser, messages, notifications, profiles, sendMessage, 
    markMessagesAsRead, markNotificationAsRead, markAllNotificationsAsRead,
    fetchProfileById, guardianStatus 
  } = useApp();

  const [activeTab, setActiveTab] = useState<"messages" | "notifications">("messages");
  const [typedMessage, setTypedMessage] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  if (!currentUser) return null;

  const createFallbackPartner = (partnerId: string): UserProfile => ({
    id: partnerId,
    memberNumber: partnerId.slice(0, 8),
    name: "طرف المحادثة",
    gender: currentUser.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE,
    avatar: currentUser.gender === Gender.MALE ? "female_1" : "male_1",
    profileImage: null,
    isMobileVerified: false,
    agreedToCharter: true,
    age: 25,
    nationality: "",
    residence: "",
    profession: "",
    education: "",
    income: "",
    maritalStatus: MaritalStatus.SINGLE,
    hasChildren: false,
    childrenCount: 0,
    isSmoker: false,
    height: 170,
    weight: 70,
    skinColor: "",
    bodyBuild: "",
    healthStatus: "",
    hasDisability: false,
    chronicDiseases: "",
    religiousCommitment: "",
    prayers: "",
    hasBeard: null,
    hijabType: null,
    qaImaStance: "",
    mahrOpinion: "",
    marriageTimeframe: "",
    shariaVisionStance: "",
    aboutMe: "",
    partnerSpecs: "",
    hobbies: [],
    isPremium: false,
    isVerified: false,
    photoPrivacy: "public",
    joinDate: new Date().toISOString(),
    isOnline: false,
    viewsCount: 0,
  });

  // Auto scroll to bottom in chat
  useEffect(() => {
    if (selectedChatUserId && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatUserId, messages]);

  // Mark messages as read when opening a chat
  useEffect(() => {
    if (selectedChatUserId) {
      markMessagesAsRead(selectedChatUserId);
    }
  }, [selectedChatUserId, messages]);

  // Fetch missing profiles for chat partners or active chat user
  useEffect(() => {
    if (selectedChatUserId && !profiles.some(p => p.id === selectedChatUserId)) {
      fetchProfileById(selectedChatUserId);
    }
  }, [selectedChatUserId, profiles, fetchProfileById]);

  // تحديد ما إذا كان المستخدم الحالي ولي أمر يتصفح محادثات من يتولى أمره
  const isGuardianViewingWard = Boolean(
    guardianStatus?.isGuardian && 
    guardianStatus?.hasLink && 
    guardianStatus?.partnerId && 
    guardianStatus?.canViewChat
  );

  const wardId = isGuardianViewingWard ? guardianStatus!.partnerId! : null;
  const effectiveUserId = wardId || currentUser.id;

  // Filter messages related to the effective user (current user or ward being overseen)
  const myMessages = messages.filter(m => m.senderId === effectiveUserId || m.receiverId === effectiveUserId);

  useEffect(() => {
    const missingPartnerIds = Array.from(new Set(
      myMessages.map(m => (m.senderId === effectiveUserId ? m.receiverId : m.senderId))
    )).filter(id => id && !profiles.some(p => p.id === id));

    missingPartnerIds.forEach(id => {
      fetchProfileById(id);
    });
  }, [myMessages, effectiveUserId, profiles, fetchProfileById]);

  // Group messages by partner with fallback so conversations are never lost
  const chatPartners = Array.from(new Set(myMessages.map(m => 
    m.senderId === effectiveUserId ? m.receiverId : m.senderId
  ))).map(partnerId => {
    const partner: UserProfile = profiles.find(p => p.id === partnerId) || createFallbackPartner(partnerId);
    const partnerMessages = myMessages.filter(m => 
      (m.senderId === effectiveUserId && m.receiverId === partnerId) || 
      (m.senderId === partnerId && m.receiverId === effectiveUserId)
    );
    const lastMessage = partnerMessages[partnerMessages.length - 1];
    const unreadCount = partnerMessages.filter(m => m.senderId === partnerId && !m.isRead).length;

    return {
      partner,
      lastMessage,
      unreadCount
    };
  });

  // Active Chat Message history
  const activeChatMessages = myMessages.filter(m => 
    (m.senderId === effectiveUserId && m.receiverId === selectedChatUserId) || 
    (m.senderId === selectedChatUserId && m.receiverId === effectiveUserId)
  );

  const activeChatPartner: UserProfile | undefined = selectedChatUserId 
    ? (profiles.find(p => p.id === selectedChatUserId) || createFallbackPartner(selectedChatUserId))
    : undefined;

  const [chatError, setChatError] = useState<string | null>(null);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setChatError(null);
    const text = typedMessage.trim();
    if (!text || !selectedChatUserId) return;

    const res = await sendMessage(selectedChatUserId, text);
    if (res.ok) {
      setTypedMessage("");
    } else if (res.error) {
      setChatError(res.error);
    }
  };

  // Filter user notifications
  const myNotifications = notifications.filter(n => n.userId === currentUser.id);

  return (
    <div className="pb-24 pt-4 font-sans text-right bg-slate-50 min-h-screen" dir="rtl">
      <div className="max-w-xl mx-auto px-4">
        
        {/* If Active Chat is Open */}
        {selectedChatUserId && activeChatPartner ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[650px] relative">
            
            {/* Active Chat Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <button 
                onClick={handleCloseChat}
                className="p-1 text-slate-500 hover:text-slate-800 transition rounded-lg hover:bg-slate-100"
                aria-label="الرجوع لقائمة المحادثات"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <img 
                  src={getAvatarUrl(activeChatPartner)} 
                  alt={activeChatPartner.name} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className="text-right">
                  <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1">
                    {activeChatPartner.name}
                    {activeChatPartner.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">عضوية رقم: {activeChatPartner.memberNumber} • {activeChatPartner.isOnline ? "نشط الآن" : "أوفلاين"}</p>
                </div>
              </div>

              <div className="w-8" /> {/* spacing */}
            </div>

            {/* Islamic & Financial Safety Warning Banner */}
            <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 flex items-center gap-2.5 text-[11px] text-amber-900 leading-snug">
              <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>تنبيه أمان وشرع:</strong> احذر مشاركة أي بيانات بنكية أو تحويل أموال لأي طرف. التطبيق مخصص للتعارف الجاد بغرض الزواج الشرعي العلني بإشراك الأهل.
              </span>
            </div>

            {/* Guardian Oversight Banner */}
            {isGuardianViewingWard && (
              <div className="bg-emerald-50 border-b border-emerald-200/80 px-4 py-2.5 flex items-center gap-2 text-xs text-emerald-900 leading-snug">
                <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                <span>
                  <strong>وضع إشراف ولي الأمر:</strong> أنت تطّلع على محادثة ({guardianStatus?.partnerName || "الابن / الابنة"}) مع ({activeChatPartner.name}) كضمانة شرعية وأسرية لحفظ الحقوق وبارك الله في سعيكما.
                </span>
              </div>
            )}

            {/* Marriage Journey Tracker: 6 defined stages with reminders & polite apology exit */}
            <MarriageJourneyTracker partner={activeChatPartner} />

            {/* Chat Body messages list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {activeChatMessages.map(msg => {
                const isFromWardSide = msg.senderId === effectiveUserId;
                const senderDisplayName = isFromWardSide 
                  ? (isGuardianViewingWard ? (guardianStatus?.partnerName || "من تتولى أمره") : "أنا")
                  : activeChatPartner.name;

                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${isFromWardSide ? "items-start" : "items-end"}`}
                  >
                    {isGuardianViewingWard && (
                      <span className="text-[10px] text-slate-400 font-bold px-1 mb-0.5">
                        {senderDisplayName}
                      </span>
                    )}
                    <div className={`p-3.5 rounded-2xl max-w-[80%] text-xs leading-relaxed shadow-sm ${
                      isFromWardSide 
                        ? "bg-emerald-600 text-white rounded-br-none" 
                        : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                    }`}>
                      <p>{msg.content}</p>
                      
                      <div className={`flex items-center gap-1.5 mt-1 justify-end text-[9px] ${isFromWardSide ? "text-emerald-200" : "text-slate-400"}`}>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isFromWardSide && <CheckCheck className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Premium Lock safeguard for Messaging */}
            {!currentUser.isPremium && !isGuardianViewingWard && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col justify-center items-center text-center p-6 space-y-4">
                <div className="p-3 bg-amber-50 text-amber-500 rounded-full">
                  <Lock className="w-8 h-8 fill-amber-100" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">المحادثات مغلقة للأعضاء المتميزين</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  أنت تتصفح في الوضع المجاني حالياً. لتمكين إرسال واستقبال الرسائل وبدء محادثات جادة، يرجى تفعيل باقة التميز التفضيلية.
                </p>
                <button
                  onClick={() => {
                    handleCloseChat();
                    navigate("/premium");
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-amber-500/10"
                >
                  الاشتراك في باقة التميز
                </button>
              </div>
            )}

            {/* Active Chat Input footer form or Guardian Read-only bar or Concluded apology state */}
            {isGuardianViewingWard ? (
              <div className="p-3 border-t border-slate-100 bg-emerald-50/70 flex items-center justify-center gap-2 text-xs font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>جلسة قراءة ومتابعة لولي الأمر (المحادثة مسجلة وتحت الإشراف الشرعي)</span>
              </div>
            ) : (() => {
              const activeJourney = selectedChatUserId ? getJourneyState(currentUser.id, selectedChatUserId) : null;
              if (activeJourney?.status === "concluded") {
                return (
                  <div className="p-3.5 border-t border-amber-200/60 bg-gradient-to-r from-amber-50 to-rose-50 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <div className="leading-snug">
                        <span className="font-extrabold text-amber-900 block">المحادثة متوقفة بعد تقديم الاعتذار</span>
                        <span className="text-[10px] text-slate-500">حفظاً للكرامة والوقار، يتوقف تبادل الرسائل تماماً ويُمنع الإلحاح أو اللوم.</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-white border border-amber-200 text-amber-900 text-[10px] font-bold flex-shrink-0 shadow-2xs">
                      تم الإنهاء بأدب ✓
                    </span>
                  </div>
                );
              }

              if (currentUser.isPremium) {
                return (
                  <div className="border-t border-slate-100 bg-white">
                    {chatError && (
                      <div className="p-2.5 mx-3 mt-2 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 flex items-center justify-between">
                        <span>⚠️ {chatError}</span>
                        <button 
                          onClick={() => setChatError(null)} 
                          className="text-rose-500 hover:text-rose-800 text-xs px-1"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <form onSubmit={handleSendMessage} className="p-3 flex gap-2">
                      <input 
                        type="text" 
                        value={typedMessage}
                        onChange={(e) => {
                          setTypedMessage(e.target.value);
                          if (chatError) setChatError(null);
                        }}
                        placeholder="اكتب رسالتك الجادة والمحترمة هنا..."
                        className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/10"
                      >
                        <Send className="w-4 h-4 rotate-180" />
                      </button>
                    </form>
                  </div>
                );
              }

              return null;
            })()}

          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Tab navigation */}
            <div className="bg-white rounded-2xl border border-slate-100 p-1.5 shadow-sm flex">
              <button
                onClick={() => setActiveTab("messages")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "messages" 
                    ? "bg-emerald-600 text-white" 
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>المحادثات والرسائل ({chatPartners.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("notifications");
                  markAllNotificationsAsRead();
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeTab === "notifications" 
                    ? "bg-emerald-600 text-white" 
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>الإشعارات والأنشطة ({myNotifications.filter(n => !n.isRead).length})</span>
              </button>
            </div>

            {/* Tab content 1: Conversations */}
            {activeTab === "messages" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-xs">صندوق الوارد والمراسلات الجارية</h3>

                {chatPartners.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center space-y-2">
                    <Mail className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">صندوق رسائلك فارغ تماماً حالياً.</p>
                    <p className="text-[10px] text-slate-400">بادر بتصفح الأعضاء، وإبداء الاهتمام والحديث مع من تشعر بالارتياح الأولي نحو مواصفاتهم.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
                    {chatPartners.map(item => (
                      <div 
                        key={item.partner.id}
                        onClick={() => handleOpenChat(item.partner.id)}
                        className="p-4 hover:bg-slate-50 transition cursor-pointer flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img 
                            src={getAvatarUrl(item.partner)} 
                            alt={item.partner.name} 
                            className="w-11 h-11 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-right truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1 truncate">
                                {item.partner.name}
                                {item.partner.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                              </h4>
                              {(() => {
                                const partnerJourney = getJourneyState(currentUser.id, item.partner.id);
                                const stageInfo = MARRIAGE_STAGES.find(s => s.stage === partnerJourney.currentStage);
                                return (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
                                    partnerJourney.status === "concluded"
                                      ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : partnerJourney.status === "completed"
                                      ? "bg-amber-50 text-amber-800 border-amber-200"
                                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  }`}>
                                    {partnerJourney.status === "concluded" 
                                      ? "اعتذار بأدب" 
                                      : partnerJourney.status === "completed" 
                                      ? "مبارك الخطوبة" 
                                      : `${stageInfo?.shortTitle || `مرحلة ${partnerJourney.currentStage}`}`}
                                  </span>
                                );
                              })()}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate leading-relaxed">
                              {item.lastMessage ? item.lastMessage.content : "ابدأ التحدث الشرعي الجاد..."}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {item.lastMessage && (
                            <span className="text-[9px] text-slate-400 font-mono">
                              {new Date(item.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {item.unreadCount > 0 && (
                            <span className="bg-emerald-600 text-white text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full min-w-4 text-center">
                              {item.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab content 2: Notifications */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-xs">سجل إشعارات الأنشطة والتفاعلات الشرعية</h3>

                {myNotifications.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center space-y-2">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">لا توجد إشعارات جديدة بانتظارك.</p>
                    <p className="text-[10px] text-slate-400">ستظهر هنا الأنشطة؛ مثل إبداء اهتمام أحد الأعضاء بك، أو تفعيل اشتراكاتك.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
                    {myNotifications.map(notif => (
                      <div 
                        key={notif.id}
                        className={`p-4 flex gap-3.5 items-start transition ${notif.isRead ? "bg-white" : "bg-emerald-50/20"}`}
                      >
                        <div className="p-2 bg-slate-50 text-emerald-600 rounded-xl flex-shrink-0 mt-0.5">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                            {notif.content}
                          </p>
                          <span className="text-[9px] text-slate-400 font-mono block">
                            {new Date(notif.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
