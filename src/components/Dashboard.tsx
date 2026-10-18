import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../lib/store";
import { Gender } from "../types";
import { getAvatarUrl } from "../lib/avatarUtils";
import { calculateProfileScore } from "../lib/profileScore";
import { motion } from "motion/react";
import { 
  Menu, Sparkles, Heart, CheckCircle, Shield, 
  Users, Eye, Award, ExternalLink, HelpCircle, AlertTriangle, ChevronLeft, ShieldCheck, X
} from "lucide-react";
import { CandidateSwipeCards } from "./CandidateSwipeCards";
import { GuardianPortal } from "./GuardianPortal";
import { CompatibilitySurveyModal } from "./CompatibilitySurveyModal";

interface DashboardProps {
  onOpenSidebar?: () => void;
  setActiveScreen?: (screen: string) => void;
  onSelectProfile?: (userId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onOpenSidebar, 
  setActiveScreen,
  onSelectProfile
}) => {
  const { currentUser, profiles, successStories, guardianStatus, mySurvey } = useApp();
  const navigate = useNavigate();

  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isSurveyBannerDismissed, setIsSurveyBannerDismissed] = useState(false);

  if (!currentUser) return null;

  // إذا كان الحساب لولي أمر، يتم عرض بوابة ولي الأمر مباشرة
  if (currentUser.accountRole?.startsWith("guardian_") || guardianStatus?.isGuardian) {
    return <GuardianPortal />;
  }

  // Filter candidates of opposite gender
  const oppositeGender = currentUser.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;
  const oppositeGenderProfiles = profiles.filter(p => p.gender === oppositeGender && p.name !== "");

  // Calculate matching count
  const matchingCount = oppositeGenderProfiles.length;

  const handleQuickMatchClick = () => {
    if (setActiveScreen) {
      setActiveScreen("search");
    }
    navigate("/search");
  };

  const handleSelectCandidate = (userId: string) => {
    if (onSelectProfile) {
      onSelectProfile(userId);
    }
    navigate(`/profile/${userId}`);
  };

  const handleGoPremium = () => {
    if (setActiveScreen) {
      setActiveScreen("premium");
    }
    navigate("/premium");
  };

  const handleGoSuccessStories = () => {
    if (setActiveScreen) {
      setActiveScreen("success_stories");
    }
    navigate("/success-stories");
  };

  const activeStories = successStories.filter(s => s.isApproved).slice(0, 2);
  const profileScore = calculateProfileScore(currentUser);

  return (
    <div className="pb-24 pt-2 font-sans text-right min-h-screen bg-slate-50" dir="rtl">
      <div className="max-w-xl mx-auto px-4 mt-2 space-y-6">
        
        {/* Welcome Section Banner */}
        <div className="bg-gradient-to-l from-emerald-800 to-emerald-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-800/10 relative overflow-hidden">
          <div className="absolute left-[-20px] bottom-[-20px] w-36 h-36 bg-emerald-600/30 rounded-full blur-xl pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-600/60 text-emerald-100 text-[10px] px-2.5 py-1 rounded-full font-semibold">
                عضوية رقم {currentUser.memberNumber}
              </span>
              {currentUser.isPremium && (
                <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  عضو متميز
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold leading-snug">
              أهلاً بك يا {currentUser.name}، بارك الله في سعيك
            </h2>

            <p className="text-xs text-emerald-100 leading-relaxed max-w-sm">
              نسأل الله تعالى أن يكتب لك التوفيق والخير وأن يجمع بينكما على سنة نبيه ومودته ورحمته.
            </p>

            <div className="pt-2">
              <button 
                onClick={handleQuickMatchClick}
                className="bg-white text-emerald-800 font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition duration-150 shadow-md"
              >
                تصفح طلبات الزواج الآن
              </button>
            </div>
          </div>
        </div>

        {/* Optional Compatibility Survey & Red Flags Banner */}
        {!mySurvey && !isSurveyBannerDismissed && (
          <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200/80 rounded-2xl p-4 shadow-xs relative overflow-hidden text-right">
            <button
              onClick={() => setIsSurveyBannerDismissed(true)}
              className="absolute left-3 top-3 p-1 text-gray-400 hover:text-gray-600 rounded-full transition"
              title="إخفاء مؤقت"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 pr-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-xs sm:text-sm text-gray-900">
                    استبيان التوافق الذكي والخطوط الحمراء
                  </h4>
                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                    مستحسن
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                  أجب عن 5 سيناريوهات سريعة وحدد خطوطك الحمراء لتحسين ترشيحات الشريك واستبعاد ما لا يناسبك.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => setIsSurveyModalOpen(true)}
                    className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
                  >
                    بدء الاستبيان السريع ←
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Completion Meter */}
        {profileScore.score < 100 && (
          <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                اكتمال ملفك الشخصي
              </span>
              <span className="font-extrabold text-emerald-700 font-mono bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs">
                {profileScore.score}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${profileScore.score}%` }}
              />
            </div>

            <div className="flex justify-between items-center pt-1">
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-[280px]">
                أكمل بياناتك لزيادة ظهورك وفرص التوافق الجاد 3 أضعاف.
              </p>
              <button
                onClick={() => navigate("/my-profile")}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 transition"
              >
                <span>استكمال</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic High-Quality Stats Dashboard widgets */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="p-2 bg-pink-50 text-pink-500 w-fit rounded-xl">
              <Heart className="w-5 h-5 fill-pink-500" />
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-xs font-semibold">متوافقين معك</span>
              <h3 className="text-xl font-extrabold text-slate-800">{matchingCount} ملفاً</h3>
            </div>
            <p className="text-[10px] text-slate-400">ملفات من الجنس الآخر متوافقة للبحث</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 w-fit rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-xs font-semibold">زيارات لملفك</span>
              <h3 className="text-xl font-extrabold text-slate-800">{currentUser.viewsCount} زيارة</h3>
            </div>
            <p className="text-[10px] text-slate-400">عدد زيارات الأعضاء لملفك الشخصي</p>
          </div>
        </div>

        {/* Swipe Cards: 5 for Free users, 20 for Premium users */}
        <CandidateSwipeCards onOpenProfile={handleSelectCandidate} />

        {/* Guardian and Family Oversight Card */}
        <div 
          onClick={() => navigate("/guardian")}
          className="bg-gradient-to-l from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4 shadow-sm hover:border-emerald-300 transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 border border-emerald-200 flex items-center justify-center text-xl shadow-xs shrink-0">
              🛡️
            </div>
            <div className="space-y-0.5 text-right">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-emerald-800">
                  وضع الولي والأسرة
                </h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  ميزة تميز المنصة
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                أشرك ولي أمرك في خطوات التعارف بكل خصوصية وأمان دون مشاركة كلمة مرورك.
              </p>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-1 transition shrink-0 mr-2" />
        </div>

        {/* Quick action banners */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 flex justify-between items-center bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-sm">عتبات شرعية مقترحة</h3>
            </div>
            <button 
              onClick={handleQuickMatchClick}
              className="text-emerald-600 text-xs font-bold hover:underline"
            >
              بحث متقدم ←
            </button>
          </div>

          <div className="divide-y divide-slate-50 p-3">
            {oppositeGenderProfiles.slice(0, 3).map(profile => (
              <div 
                key={profile.id}
                onClick={() => handleSelectCandidate(profile.id)}
                className="p-3 hover:bg-slate-50 rounded-xl transition cursor-pointer flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={getAvatarUrl(profile, undefined, profile.photoPrivacy !== "public")} 
                    alt={profile.name} 
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{profile.name}</h4>
                    <p className="text-xs text-slate-400">{profile.age} سنة • {profile.nationality} • يقيم في {profile.residence}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                  <span>عرض</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Join Premium Banner */}
        {!currentUser.isPremium && (
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                اشترك في باقة التميز الشرعية
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                تواصل بشكل مباشر، وأرسل رسائل غير محدودة للمهتمين بك، مع إمكانية رفع صورتك الشخصية وتصفح الأعضاء بشكل خفي وآمن تماماً.
              </p>
            </div>
            <button 
              onClick={handleGoPremium}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-amber-500/15 relative z-10 whitespace-nowrap"
            >
              انضم للتميز الآن
            </button>
          </div>
        )}

        {/* Success Stories Preview */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-r-4 border-emerald-600 pr-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">قصص نجاح من مودة ورحمة</h3>
          </div>

          <div className="space-y-4">
            {activeStories.map(story => (
              <div key={story.id} className="bg-slate-50 p-4 rounded-xl space-y-2 relative border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2 space-x-reverse">
                    <img 
                      src={getAvatarUrl(story.avatarHusband || "male_1", Gender.MALE)} 
                      className="w-7 h-7 rounded-full object-cover border border-white z-10"
                      alt=""
                    />
                    <img 
                      src={getAvatarUrl(story.avatarWife || "female_1", Gender.FEMALE)} 
                      className="w-7 h-7 rounded-full object-cover border border-white"
                      alt=""
                    />
                  </div>
                  <h5 className="text-xs font-bold text-emerald-800">{story.husbandName} و {story.wifeName}</h5>
                  <span className="text-[10px] text-slate-400 mr-auto">{story.date}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  "{story.story}"
                </p>
              </div>
            ))}
          </div>

          <button 
            onClick={handleGoSuccessStories}
            className="w-full py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition text-center block"
          >
            تصفح المزيد من قصص النجاح والمباركات
          </button>
        </div>

        {/* Marriage Journey Explainer Feature Banner */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-md border border-emerald-700/40 space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/20">
              <Sparkles className="w-5 h-5 fill-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">رحلة زواج بدل شات لا ينتهي 🎯</h3>
              <p className="text-[11px] text-emerald-200">مسار تعارف شرعي هادف يمر بمراحل واضحة ومحددة</p>
            </div>
          </div>

          <p className="text-xs text-emerald-100/90 leading-relaxed">
            كل محادثة جادة في التطبيق تتقدم وفق 6 خطوات أساسية متفق عليها، مع تذكير مستمر بالخطوة التالية وإمكانية الاعتذار بأدب ودون إحراج:
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-emerald-200 bg-emerald-950/60 p-3 rounded-2xl border border-emerald-800/60">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">1</span>
              <span>اهتمام متبادل</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">2</span>
              <span>توافق أولي</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">3</span>
              <span>أسئلة مهمة ومصارحة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">4</span>
              <span>إشراك الأسرة والولي</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">5</span>
              <span>لقاء رسمي ورؤية شرعية</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">6</span>
              <span>قرار الاستمرار أو الاعتذار</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <span className="text-[10px] text-emerald-300">يسمح بإنهاء التعارف بأدب من غير ضغط أو إحراج</span>
            <button
              onClick={() => navigate("/inbox")}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              متابعة محادثاتك
            </button>
          </div>
        </div>

        {/* Matrimonial Guide lines */}
        <div className="bg-slate-950 text-slate-200 rounded-3xl p-6 space-y-4 border border-slate-800 relative overflow-hidden">
          <div className="absolute left-2 top-2 opacity-10">
            <HelpCircle className="w-24 h-24 text-white" />
          </div>
          <div className="space-y-1 relative z-10">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              تذكير بآداب البحث والتعارف الشرعي
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              تذكر دائماً أن الغاية من هذا التطبيق هي تيسير السبل المباحة لبناء بيت مسلم طاهر قائم على طاعة الله. اتبع الوصايا التالية لتنال بركة السعي:
            </p>
          </div>

          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed relative z-10">
            <li>كن صادقاً وواضحاً في كل التفاصيل التي تعرضها في ملفك.</li>
            <li>تحدث بوعي وناضجة فكرياً وبمنتهى الاحترام والمحافظة.</li>
            <li>لا تسعى خلف العلاقات خارج إطار الجدية وطلب الرؤية الشرعية الرسمية.</li>
            <li>بادر بإدخال الأهل في أقرب مرحلة ممكنة لتبني زواجاً سليماً ومباركاً.</li>
          </ul>
        </div>

        {/* Compatibility Survey Modal */}
        <CompatibilitySurveyModal
          isOpen={isSurveyModalOpen}
          onClose={() => setIsSurveyModalOpen(false)}
        />

      </div>
    </div>
  );
};
