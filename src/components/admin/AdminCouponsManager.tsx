import React, { useState } from "react";
import { Coupon } from "../../types";
import { useApp } from "../../lib/store";
import { useUIStore } from "../../stores/uiStore";
import { 
  Tag, Plus, Percent, CheckCircle2, XCircle, Trash2, 
  Calendar, Layers, Copy, Check 
} from "lucide-react";

export const AdminCouponsManager: React.FC = () => {
  const { coupons, adminCreateCoupon, adminToggleCoupon, adminDeleteCoupon } = useApp();
  const { addToast, showConfirm } = useUIStore();

  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [maxUses, setMaxUses] = useState<number>(100);
  const [validUntil, setValidUntil] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      addToast("يرجى إدخال كود الكوبون", "error");
      return;
    }
    if (discountPercent <= 0 || discountPercent > 100) {
      addToast("نسبة الخصم يجب أن تكون بين 1% و 100%", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminCreateCoupon({
        code: code.trim().toUpperCase(),
        discountPercent: Number(discountPercent),
        maxUses: Number(maxUses) || 0,
        validUntil: validUntil || undefined,
        isActive: true,
        notes: notes.trim() || undefined,
      });

      if (res.ok) {
        addToast("تم إنشاء الكوبون بنجاح!", "success");
        setCode("");
        setDiscountPercent(20);
        setMaxUses(100);
        setValidUntil("");
        setNotes("");
        setIsCreating(false);
      } else {
        addToast(res.error || "فشل إنشاء الكوبون", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = (couponCode: string, id: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedId(id);
    addToast(`تم نسخ الكوبون (${couponCode}) إلى الحافظة!`, "info");
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>نظام الخصومات والكوبونات والنقاط</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            أنشئ كوبونات تخفيض لاشتراكات التميز وشاركها مع الأعضاء أو في المناسبات
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? "إلغاء" : "كوبون جديد"}</span>
        </button>
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <form onSubmit={handleCreateCoupon} className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1 text-emerald-700">
            <Tag className="w-4 h-4" />
            <span>إضافة كوبون خصم جديد</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">كود الكوبون (إنجليزي أو أرقام)</label>
              <input
                type="text"
                required
                placeholder="مثال: MAWADA2026 أو EID50"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-xs uppercase font-mono font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">نسبة الخصم (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">أقصى عدد مرات استخدام (0 = غير محدود)</label>
              <input
                type="number"
                min="0"
                value={maxUses}
                onChange={(e) => setMaxUses(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">صالح حتى تاريخ (اختياري)</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">ملاحظات أو مناسبة الكوبون (اختياري)</label>
            <input
              type="text"
              placeholder="مثال: خصم عيد الفطر المبارك، أو هدية للمستخدمين الجدد"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
            >
              {isSubmitting ? "جاري الإنشاء..." : "حفظ وتفعيل الكوبون"}
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Coupons List */}
      <div className="space-y-3">
        {coupons.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center text-slate-400 text-xs">
            لا توجد أي كوبونات منشأة حالياً. اضغط على "كوبون جديد" لإضافة أول كوبون خصم.
          </div>
        ) : (
          coupons.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm tracking-wider text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {c.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(c.code, c.id)}
                      className="p-1 text-slate-400 hover:text-emerald-600 rounded-lg transition"
                      title="نسخ الكود"
                    >
                      {copiedId === c.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                      خصم {c.discountPercent}%
                    </span>
                  </div>

                  {c.notes && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      {c.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={async () => {
                      const res = await adminToggleCoupon(c.id, !c.isActive);
                      if (res.ok) {
                        addToast(`تم ${!c.isActive ? "تفعيل" : "تعطيل"} الكوبون ${c.code}`, "success");
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                      c.isActive 
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" 
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {c.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>نشط</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-slate-400" />
                        <span>معطّل</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      showConfirm({
                        title: "حذف الكوبون",
                        message: `هل أنت متأكد من حذف الكوبون (${c.code})؟`,
                        confirmText: "حذف",
                        cancelText: "إلغاء",
                        onConfirm: async () => {
                          const res = await adminDeleteCoupon(c.id);
                          if (res.ok) addToast(`تم حذف الكوبون ${c.code}`, "info");
                        }
                      });
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="حذف الكوبون"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-medium">
                <div>
                  عدد مرات الاستخدام: <span className="font-bold font-mono text-slate-700">{c.usedCount}</span>
                  {c.maxUses > 0 && <span> من أصل <span className="font-bold font-mono">{c.maxUses}</span></span>}
                  {c.maxUses === 0 && <span> (غير محدود)</span>}
                </div>

                {c.validUntil && (
                  <div>
                    الصلاحية حتى: <span className="font-bold font-mono text-slate-700">{c.validUntil}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
