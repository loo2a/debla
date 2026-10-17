import React, { useState } from "react";
import { useApp } from "../lib/store";
import { Gender } from "../types";
import { SearchFilters, SearchFilterState } from "./search/SearchFilters";
import { SearchProfileCard } from "./search/SearchProfileCard";
import { EmptyState } from "./ui/EmptyState";
import { Search, UserX } from "lucide-react";

import { useNavigate } from "react-router-dom";

interface SearchPageProps {
  onSelectProfile?: (userId: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onSelectProfile }) => {
  const navigate = useNavigate();
  const { currentUser, profiles } = useApp();

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
  const pageSize = 8;

  // Filter in-memory
  const filteredProfiles = profiles
    .filter((profile) => {
      if (profile.gender !== oppositeGender || !profile.name) return false;
      if (filter.nationality !== "all" && profile.nationality !== filter.nationality) return false;
      if (filter.residence !== "all" && profile.residence !== filter.residence) return false;
      if (profile.age < filter.ageFrom || profile.age > filter.ageTo) return false;
      if (filter.maritalStatus !== "all" && profile.maritalStatus !== filter.maritalStatus) return false;

      if (filter.isAdvanced) {
        if (filter.religiosity !== "all" && profile.religiousCommitment !== filter.religiosity) return false;
        if (filter.prayers !== "all" && profile.prayers !== filter.prayers) return false;
        if (filter.smoking !== "all") {
          const wantsSmoker = filter.smoking === "yes";
          if (profile.isSmoker !== wantsSmoker) return false;
        }
        if (oppositeGender === Gender.FEMALE && filter.hijab !== "all" && profile.hijabType !== filter.hijab) return false;
        if (oppositeGender === Gender.MALE && filter.beard !== "all") {
          const wantsBeard = filter.beard === "yes";
          if (profile.hasBeard !== wantsBeard) return false;
        }
        if (filter.qaIma !== "all" && profile.qaImaStance !== filter.qaIma) return false;
        if (filter.mahr !== "all" && profile.mahrOpinion !== filter.mahr) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filter.sortBy === "joinDate") {
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      } else if (filter.sortBy === "age") {
        return a.age - b.age;
      } else if (filter.sortBy === "views") {
        return b.viewsCount - a.viewsCount;
      }
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / pageSize));
  const paginatedProfiles = filteredProfiles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
            <span>النتائج المطابقة ({filteredProfiles.length})</span>
            {totalPages > 1 && <span>صفحة {currentPage} من {totalPages}</span>}
          </div>

          {filteredProfiles.length === 0 ? (
            <EmptyState
              icon={UserX}
              title="لم نجد أي ملف يطابق شروطك الحالية"
              description="يرجى توسيع نطاق الفلاتر للوصول لفرص توافق أكثر شمولاً."
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
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {paginatedProfiles.map((p) => (
                <SearchProfileCard
                  key={p.id}
                  profile={p}
                  onClick={() => handleCardClick(p.id)}
                />
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 pb-2 px-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition shadow-xs"
                  >
                    السابق
                  </button>

                  <span className="text-xs font-semibold text-slate-500">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold disabled:opacity-40 hover:bg-emerald-700 transition shadow-xs"
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
