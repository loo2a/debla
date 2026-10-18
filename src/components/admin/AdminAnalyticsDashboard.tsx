import React from "react";
import { useApp } from "../../lib/store";
import { Gender } from "../../types";
import { 
  Users, Sparkles, ShieldCheck, HeartHandshake, MessageSquare, 
  Tag, Lock, AlertTriangle, TrendingUp, Award 
} from "lucide-react";

export const AdminAnalyticsDashboard: React.FC = () => {
  const { profiles, premiumRequests, profileEditRequests, coupons, messages, interactions, successStories } = useApp();

  const validProfiles = profiles.filter(p => p.name);
  const totalUsers = validProfiles.length;
  const malesCount = validProfiles.filter(p => p.gender === Gender.MALE).length;
  const femalesCount = validProfiles.filter(p => p.gender === Gender.FEMALE).length;

  const premiumUsersCount = validProfiles.filter(p => p.isPremium).length;
  const verifiedUsersCount = validProfiles.filter(p => p.isVerified).length;
  const onlineUsersCount = validProfiles.filter(p => p.isOnline).length;

  const pendingPremiumRequests = premiumRequests.filter(r => r.status === "pending").length;
  const pendingEdits = profileEditRequests.filter(r => r.status === "pending").length;
  const activeCoupons = coupons.filter(c => c.isActive).length;

  const totalInterests = interactions.filter(i => i.type === "interest" || i.type === "accept_interest").length;
  const acceptedMatches = interactions.filter(i => i.type === "accept_interest").length;

  return (
    <div className="space-y-4">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">إجمالي الأعضاء</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono">{totalUsers}</div>
          <div className="text-[10px] text-slate-400 font-medium">
            {malesCount} رجال • {femalesCount} نساء
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">المشتركون بالبريميوم</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">{premiumUsersCount}</div>
          <div className="text-[10px] text-slate-400 font-medium">
            نسبة التحويل {totalUsers > 0 ? Math.round((premiumUsersCount / totalUsers) * 100) : 0}%
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">الأعضاء الموثقون</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{verifiedUsersCount}</div>
          <div className="text-[10px] text-slate-400 font-medium">
            بمستويات التوثيق الشرعي
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">التوافقات المقبولة</span>
            <HeartHandshake className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono">{acceptedMatches}</div>
          <div className="text-[10px] text-slate-400 font-medium">
            من إجمالي {totalInterests} طلب تعارف
          </div>
        </div>
      </div>

      {/* Pending Action Items Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
        <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>مهام معلقة تتطلب إجراء الإدارة:</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-900">طلبات اشتراك معلقة</p>
              <p className="text-[10px] text-amber-700">بانتظار مراجعة التحويل والدفع</p>
            </div>
            <span className="font-mono font-extrabold text-lg text-amber-900 bg-white px-2.5 py-0.5 rounded-lg border border-amber-200">
              {pendingPremiumRequests}
            </span>
          </div>

          <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-rose-900">طلبات تعديل بيانات أساسية</p>
              <p className="text-[10px] text-rose-700">تعديلات مقفلة تطلب موافقة</p>
            </div>
            <span className="font-mono font-extrabold text-lg text-rose-900 bg-white px-2.5 py-0.5 rounded-lg border border-rose-200">
              {pendingEdits}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-900">كوبونات خصم نشطة</p>
              <p className="text-[10px] text-emerald-700">جاهزة للاستخدام من الأعضاء</p>
            </div>
            <span className="font-mono font-extrabold text-lg text-emerald-900 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200">
              {activeCoupons}
            </span>
          </div>
        </div>
      </div>

      {/* Engagement & Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-2">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>نشاط المحادثات والرسائل</span>
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            إجمالي الرسائل المتبادلة في المنصة: <span className="font-mono font-bold text-slate-800">{messages.length}</span> رسالة.
            المنصة تضمن ضبط الشات وفق أحكام الشريعة مع إمكانية إشراك الولي والأسرة.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-2">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>قصص النجاح والزواج المبارك</span>
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            إجمالي قصص الزواج المسجلة: <span className="font-mono font-bold text-slate-800">{successStories.length}</span> قصة.
            تم التحقق من اكتمال زواجهم ومشاركتهم لتشجيع الشباب والفتيات.
          </p>
        </div>
      </div>
    </div>
  );
};
