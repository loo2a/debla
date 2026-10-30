import React, { useState, useEffect } from "react";
import { useApp } from "../../lib/store";
import { useUIStore } from "../../stores/uiStore";
import { 
  Mail, MessageSquare, CheckCircle2, Clock, 
  Archive, RefreshCw, Search, Reply, User, 
  Check, AlertCircle, FileText
} from "lucide-react";
import { ContactMessage } from "../../types";

export const AdminContactMessagesManager: React.FC = () => {
  const { contactMessages, fetchContactMessages, adminUpdateContactMessageStatus } = useApp();
  const { addToast } = useUIStore();

  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read" | "replied" | "archived">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await fetchContactMessages();
    setIsLoading(false);
  };

  const handleUpdateStatus = async (
    messageId: string, 
    status: "unread" | "read" | "replied" | "archived", 
    note?: string
  ) => {
    setIsUpdating(true);
    try {
      const res = await adminUpdateContactMessageStatus(messageId, status, note);
      if (res.ok) {
        addToast("تم تحديث حالة الرسالة بنجاح", "success");
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(prev => prev ? { ...prev, status, adminNotes: note ?? prev.adminNotes } : null);
        }
      } else {
        addToast(res.error || "فشل تحديث حالة الرسالة", "error");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredMessages = contactMessages.filter(msg => {
    if (filterStatus !== "all" && msg.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        msg.subject.toLowerCase().includes(q) ||
        msg.message.toLowerCase().includes(q) ||
        (msg.senderName && msg.senderName.toLowerCase().includes(q)) ||
        (msg.senderEmail && msg.senderEmail.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const unreadCount = contactMessages.filter(m => m.status === "unread").length;
  const repliedCount = contactMessages.filter(m => m.status === "replied").length;

  return (
    <div className="space-y-5 text-right font-sans" dir="rtl">
      
      {/* Header and Stats */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm">رسائل وتذاكر الدعم وخدمة العملاء</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                متابعة الاستفسارات والرسائل الواردة من صفحة التواصل والرد عليها
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="self-end sm:self-auto p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="تحديث الرسائل"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>تحديث</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-blue-700 font-bold">رسائل جديدة بانتظار المتابعة</p>
              <h4 className="text-xl font-black text-blue-900">{unreadCount}</h4>
            </div>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-emerald-700 font-bold">تم الرد عليها والمعالجة</p>
              <h4 className="text-xl font-black text-emerald-900">{repliedCount}</h4>
            </div>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-600 font-bold">إجمالي الرسائل الواردة</p>
              <h4 className="text-xl font-black text-slate-800">{contactMessages.length}</h4>
            </div>
            <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterStatus === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              الكل ({contactMessages.length})
            </button>
            <button
              onClick={() => setFilterStatus("unread")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterStatus === "unread" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              غير مقروءة ({unreadCount})
            </button>
            <button
              onClick={() => setFilterStatus("read")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterStatus === "read" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              قيد المتابعة
            </button>
            <button
              onClick={() => setFilterStatus("replied")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterStatus === "replied" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              تم الرد
            </button>
            <button
              onClick={() => setFilterStatus("archived")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterStatus === "archived" ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              مؤرشفة
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              placeholder="ابحث بالعنوان، النص، أو البريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>
        </div>

        {/* Message List */}
        {filteredMessages.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            لا توجد أي رسائل واردة تطابق معايير العرض الحالية.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {filteredMessages.map((msg) => {
              const isUnread = msg.status === "unread";
              return (
                <div 
                  key={msg.id}
                  className={`border rounded-2xl p-4 transition space-y-3 shadow-xs ${
                    isUnread 
                      ? "bg-blue-50/40 border-blue-200" 
                      : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{msg.subject}</h4>
                        {isUnread && (
                          <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            جديدة
                          </span>
                        )}
                        {msg.status === "replied" && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            تم الرد
                          </span>
                        )}
                        {msg.status === "archived" && (
                          <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            مؤرشفة
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {msg.senderName || "مستخدم"}
                        </span>
                        {msg.senderEmail && (
                          <span className="font-mono text-slate-600">{msg.senderEmail}</span>
                        )}
                        <span className="text-slate-400 font-mono">
                          {new Date(msg.createdAt).toLocaleString("ar-EG")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                      {msg.senderEmail && (
                        <a
                          href={`mailto:${msg.senderEmail}?subject=${encodeURIComponent(`رد الدعم الفني: ${msg.subject}`)}`}
                          onClick={() => {
                            if (msg.status === "unread") {
                              void handleUpdateStatus(msg.id, "read");
                            }
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>رد بالبريد</span>
                        </a>
                      )}

                      {msg.status === "unread" && (
                        <button
                          onClick={() => handleUpdateStatus(msg.id, "read")}
                          disabled={isUpdating}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          تعليم كمقروء
                        </button>
                      )}

                      {msg.status !== "replied" && (
                        <button
                          onClick={() => handleUpdateStatus(msg.id, "replied")}
                          disabled={isUpdating}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          تم الرد
                        </button>
                      )}

                      {msg.status !== "archived" && (
                        <button
                          onClick={() => handleUpdateStatus(msg.id, "archived")}
                          disabled={isUpdating}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                          title="أرشفة الرسالة"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Content Box */}
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                    {msg.message}
                  </div>

                  {/* Admin notes if present */}
                  {msg.adminNotes && (
                    <div className="text-[11px] bg-amber-50/80 border border-amber-200/70 p-2.5 rounded-xl text-amber-900">
                      <span className="font-bold">ملاحظة الإدارة: </span>
                      {msg.adminNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
