import React, { useState } from "react";
import {
  Lock,
  Send,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileEdit,
} from "lucide-react";
import { useApp } from "../lib/store";
import { Gender } from "../types";

interface ProfileEditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCKED_FIELDS_INFO = [
  { key: "name", label: "الاسم الكامل", type: "text" },
  { key: "gender", label: "النوع / الجنس", type: "gender" },
  { key: "age", label: "السن / العمر", type: "number" },
  { key: "maritalStatus", label: "الحالة الاجتماعية", type: "marital" },
  { key: "nationality", label: "الجنسية", type: "text" },
];

const MARITAL_STATUS_OPTIONS = ["أعزب / آنسة", "مطلق / مطلقة", "أرمل / أرملة", "متزوج / متزوجة"];

export const ProfileEditRequestModal: React.FC<ProfileEditRequestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, submitProfileEditRequest, profileEditRequests } = useApp();

  const [selectedField, setSelectedField] = useState<string>("name");
  const [newValue, setNewValue] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  if (!isOpen || !currentUser) return null;

  const currentFieldValue = (currentUser as any)[selectedField] ?? "";

  const myRequests = profileEditRequests.filter((r) => r.userId === currentUser.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) {
      setFeedback({ type: "error", message: "يرجى إدخال القيمة الجديدة المطلوبة." });
      return;
    }
    if (!reason.trim()) {
      setFeedback({ type: "error", message: "يرجى كتابة سبب طلب التعديل لمراجعته من الإدارة." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    let parsedVal: any = newValue.trim();
    if (selectedField === "age") {
      parsedVal = parseInt(parsedVal, 10);
      if (isNaN(parsedVal) || parsedVal < 18 || parsedVal > 90) {
        setIsSubmitting(false);
        setFeedback({ type: "error", message: "يرجى إدخال عمر صحيح بين 18 و 90 عاماً." });
        return;
      }
    }

    const requestedChanges = {
      [selectedField]: parsedVal,
    };

    const res = await submitProfileEditRequest(requestedChanges, reason.trim());
    setIsSubmitting(false);

    if (res.ok) {
      setFeedback({
        type: "success",
        message: "تم إرسال طلب التعديل إلى الإدارة بنجاح، وستتم مراجعته والبت فيه قريباً.",
      });
      setNewValue("");
      setReason("");
    } else {
      setFeedback({ type: "error", message: res.error || "حدث خطأ أثناء إرسال الطلب." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-gray-100 dark:border-slate-800 my-8 relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                طلب تعديل بيانات أساسية
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                البيانات الأساسية مقفلة لمنع التلاعب وتتطلب موافقة الإدارة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 py-4 space-y-5 flex-1 text-right">
          {/* Notice Card */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs sm:text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <p className="leading-relaxed">
              حرصاً على مصداقية المنصة وحماية الأعضاء من انتحال الشخصيات، لا يمكن تعديل (الاسم، السن، الجنس، الحالة الاجتماعية، والجنسية) إلا بعد مراجعة الإدارة وتدقيق سبب التعديل.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                البيان الأساسي المراد تعديله:
              </label>
              <select
                value={selectedField}
                onChange={(e) => {
                  setSelectedField(e.target.value);
                  setNewValue("");
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                {LOCKED_FIELDS_INFO.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Value Preview */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60 text-xs sm:text-sm">
              <span className="text-gray-500 dark:text-gray-400">القيمة المسجلة حالياً: </span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {selectedField === "gender"
                  ? currentFieldValue === Gender.MALE
                    ? "رجل (عريس)"
                    : "امرأة (عروسة)"
                  : String(currentFieldValue) || "غير مسجل"}
              </span>
            </div>

            {/* New Value Input */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                القيمة الصحيحة الجديدة المطلوبة:
              </label>
              {selectedField === "gender" ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewValue(Gender.MALE)}
                    className={`p-3 rounded-xl border text-sm font-medium transition ${
                      newValue === Gender.MALE
                        ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        : "border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    رجل (عريس)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewValue(Gender.FEMALE)}
                    className={`p-3 rounded-xl border text-sm font-medium transition ${
                      newValue === Gender.FEMALE
                        ? "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                        : "border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    امرأة (عروسة)
                  </button>
                </div>
              ) : selectedField === "maritalStatus" ? (
                <select
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="">اختر الحالة الاجتماعية الجديدة...</option>
                  {MARITAL_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={selectedField === "age" ? "number" : "text"}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="أدخل القيمة الجديدة هنا..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              )}
            </div>

            {/* Justification Reason */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                سبب التعديل والتوضيح للإدارة:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="مثال: حدث خطأ إملائي في كتابة الاسم عند التسجيل، أو تصحيح تاريخ الميلاد حسب الهوية الشخصية..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
              />
            </div>

            {feedback && (
              <div
                className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 ${
                  feedback.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {feedback.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "جاري إرسال الطلب..." : "إرسال طلب التعديل للإدارة"}
            </button>
          </form>

          {/* Previous Requests Section */}
          {myRequests.length > 0 && (
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                طلباتك السابقة:
              </h4>
              <div className="space-y-2">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        طلب تعديل: {Object.keys(req.requestedChanges).join(", ")}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold ${
                          req.status === "approved"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : req.status === "rejected"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {req.status === "approved"
                          ? "تمت الموافقة وتحديث البيانات"
                          : req.status === "rejected"
                          ? "تم الرفض"
                          : "قيد المراجعة"}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">السبب: {req.reason}</p>
                    {req.adminNotes && (
                      <p className="text-rose-600 dark:text-rose-400 font-medium">
                        ملاحظات الإدارة: {req.adminNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 text-sm font-medium transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
