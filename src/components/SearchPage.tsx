import React, { useState, useEffect } from "react";
import { useApp } from "../lib/store";
import { Gender, UserProfile } from "../types";
import { SearchFilters, SearchFilterState } from "./search/SearchFilters";
import { SearchProfileCard } from "./search/SearchProfileCard";
import { EmptyState } from "./ui/EmptyState";
import { Search, UserX, Share2 } from "lucide-react";
import { ProfileCardSkeleton } from "./ui/Skeleton";
import { useNavigate } from "react-router-dom";
import { shareMawadaApp } from "../lib/shareUtils";

interface SearchPageProps {
  onSelectProfile?: (userId: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onSelectProfile }) => {
  const navigate = useNavigate();
  const { currentUser, searchProfiles } = useApp();

  const handleCardClick = (userId: string) => {
    if (onSelectProfile) {
      onSelectProfile(userId);
    }
    navigate(`/profile/${userId}`);
  };

  if (!currentUser) return null;

  const oppositeGender = currentUser.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE;

  const [filter, setFilter] = useState<SearchFilterState>({
    nationality: "all",
    residence: "all",
    ageFrom: 18,
    ageTo: 65,
    maritalStatus: "all",
    sortBy: "joinDate",
    isAdvanced: false,
    heightFrom: 140,
    heightTo: 210,
    weightFrom: 40,
    weightTo: 150,
    skinColor: "all",
    bodyBuild: "all",
    religiosity: "all",
    prayers: "all",
    smoking: "all",
    beard: "all",
    hijab: "all",
    education: "all",
    income: "all",
    qaIma: "all",
    mahr: "all",
    timeframe: "all",
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [results, setResults] = useState<UserProfile[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isSearching, setIsSearching] = useState<boolean>(true);

  const pageSize = 8;

  // Real Server-Side Search with Debounce & Pagination
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchProfiles({
          gender: oppositeGender,
          minAge: filter.ageFrom,
          maxAge: filter.ageTo,
          nationality: filter.nationality === "all" ? undefined : filter.nationality,
          residence: filter.residence === "all" ? undefined : filter.residence,
          maritalStatus: filter.maritalStatus === "all" ? undefined : filter.maritalStatus,
          religiousCommitment: filter.isAdvanced && filter.religiosity !== "all" ? filter.religiosity : undefined,
          education: filter.isAdvanced && filter.education !== "all" ? filter.education : undefined,
          prayers: filter.isAdvanced && filter.prayers !== "all" ? filter.prayers : undefined,
          smoking: filter.isAdvanced && filter.smoking !== "all" ? (filter.smoking === "no" ? false : true) : undefined,
          minHeight: filter.isAdvanced && filter.heightFrom > 140 ? filter.heightFrom : undefined,
          maxHeight: filter.isAdvanced && filter.heightTo < 210 ? filter.heightTo : undefined,
          hijabType: filter.isAdvanced && filter.hijab !== "all" ? filter.hijab : undefined,
          hasBeard: filter.isAdvanced && filter.beard !== "all" ? (filter.beard === "yes") : undefined,
          sortBy: filter.sortBy === "joinDate" ? "latest" : filter.sortBy === "age" ? "age_asc" : "activity",
          page: currentPage,
          pageSize,
        });

        if (!isCancelled) {
          setResults(res.results);
          setTotalCount(res.total);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.error("[search failed]", err);
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [filter, currentPage, oppositeGender, searchProfiles]);

  return (
    <div className="pb-24 pt-4 font-sans text-right bg-slate-50 min-h-screen" dir="rtl">
      <div className="max-w-xl mx-auto px-4 space-y-6">
        
        {/* Page Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-1">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">البحث والاستكشاف المباشر</h2>
          <p className="text-xs text-slate-500">ابحث عن شريك حياتك المتوافق معك وفق ضوابط الشريعة بدقة وموضوعية</p>
        </div>

        {/* Filter Box */}
        <SearchFilters
          filter={filter}
          onChange={(updater) => {
            setFilter(updater);
            setCurrentPage(1);
          }}
          oppositeGender={oppositeGender}
        />

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
            <span>النتائج المطابقة ({isSearching ? "جاري البحث..." : totalCount})</span>
            {totalPages > 1 && <span>صفحة {currentPage} من {totalPages}</span>}
          </div>

          {isSearching ? (
            <div className="space-y-3">
              <ProfileCardSkeleton />
              <ProfileCardSkeleton />
              <ProfileCardSkeleton />
            </div>
          ) : results.length === 0 ? (
            <div className="space-y-4">
              <EmptyState
                icon={UserX}
                title="لم نجد أي ملف يطابق شروطك الحالية"
                description="التطبيق في مرحلة الإطلاق المبارك، جرب توسيع نطاق الفلاتر للوصول لفرص توافق أكثر شمولاً."
                actionLabel="إعادة ضبط الفلاتر"
                onAction={() => {
                  setFilter({
                    nationality: "all",
                    residence: "all",
                    ageFrom: 18,
                    ageTo: 65,
                    maritalStatus: "all",
                    sortBy: "joinDate",
                    isAdvanced: false,
                    heightFrom: 140,
                    heightTo: 210,
                    weightFrom: 40,
                    weightTo: 150,
                    skinColor: "all",
                    bodyBuild: "all",
                    religiosity: "all",
                    prayers: "all",
                    smoking: "all",
                    beard: "all",
                    hijab: "all",
                    education: "all",
                    income: "all",
                    qaIma: "all",
                    mahr: "all",
                    timeframe: "all",
                  });
                  setCurrentPage(1);
                }}
              />

              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-3xl p-5 text-center space-y-2 max-w-sm mx-auto shadow-sm">
                <p className="text-xs text-emerald-900 font-extrabold">
                  «الدال على الخير كفاعله»
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  ساهم في نشر التطبيق بين معارفك وأهلك لمساعدة الشباب والفتيات في تيسير الزواج الصالح وبناء بيوت مباركة.
                </p>
                <button
                  onClick={() => void shareMawadaApp()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>مشاركة التطبيق عبر واتساب</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {results.map((p) => (
                <SearchProfileCard
                  key={p.id}
                  profile={p}
                  onClick={() => handleCardClick(p.id)}
                />
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 pb-2 px-1">
                  <button
                    disabled={currentPage <= 1 || isSearching}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition shadow-xs cursor-pointer"
                  >
                    السابق
                  </button>

                  <span className="text-xs font-semibold text-slate-500">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    disabled={currentPage >= totalPages || isSearching}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                  >
                    التالي
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
