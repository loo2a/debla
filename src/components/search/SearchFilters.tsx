import React from "react";
import { SlidersHorizontal, ArrowUpDown, ChevronDown, ChevronUp, Flame, CheckCircle2 } from "lucide-react";
import {
  Nationalities, Countries, EducationLevels, IncomeLevels,
  SkinColors, BodyBuilds, ReligiousCommitmentLevels,
  PrayersCommitment, QaImaStances, MahrOpinions, MarriageTimeframes,
  ReligionsList, ChristianDenominationsList
} from "../../constants";
import { Gender, MaritalStatus, HijabType } from "../../types";
import { RED_FLAG_OPTIONS } from "../CompatibilitySurveyModal";

export interface SearchFilterState {
  nationality: string;
  residence: string;
  religion: string;
  christianDenomination: string;
  ageFrom: number;
  ageTo: number;
  maritalStatus: string;
  sortBy: string;
  isAdvanced: boolean;
  heightFrom: number;
  heightTo: number;
  weightFrom: number;
  weightTo: number;
  skinColor: string;
  bodyBuild: string;
  religiosity: string;
  prayers: string;
  smoking: string;
  beard: string;
  hijab: string;
  education: string;
  income: string;
  qaIma: string;
  mahr: string;
  timeframe: string;
  redFlags: string[];
}

interface SearchFiltersProps {
  filter: SearchFilterState;
  onChange: (updater: (prev: SearchFilterState) => SearchFilterState) => void;
  oppositeGender: Gender;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filter,
  onChange,
  oppositeGender,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm space-y-5 text-right" dir="rtl">
      {/* Header & Fast Filters */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-800">
          <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-sm sm:text-base">تصفية نتائج البحث</h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span>ترتيب حسب:</span>
          <select
            value={filter.sortBy}
            onChange={(e) => onChange((prev) => ({ ...prev, sortBy: e.target.value }))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="joinDate">الأحدث انضماماً</option>
            <option value="age">السن تصاعدياً</option>
            <option value="views">الأكثر مشاهدة</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Fast Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 block">الجنسية</label>
          <select
            value={filter.nationality}
            onChange={(e) => onChange((prev) => ({ ...prev, nationality: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">الكل</option>
            {Nationalities.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 block">بلد الإقامة</label>
          <select
            value={filter.residence}
            onChange={(e) => onChange((prev) => ({ ...prev, residence: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">الكل</option>
            {Countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 block">الديانة</label>
          <select
            value={filter.religion}
            onChange={(e) => onChange((prev) => ({ ...prev, religion: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">كل الأديان</option>
            {ReligionsList.map((rel) => (
              <option key={rel} value={rel}>{rel}</option>
            ))}
          </select>
        </div>

        {filter.religion === "مسيحي" && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">المذهب / الطائفة</label>
            <select
              value={filter.christianDenomination}
              onChange={(e) => onChange((prev) => ({ ...prev, christianDenomination: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">كل الطوائف</option>
              {ChristianDenominationsList.map((den) => (
                <option key={den} value={den}>{den}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 block">الحالة الاجتماعية</label>
          <select
            value={filter.maritalStatus}
            onChange={(e) => onChange((prev) => ({ ...prev, maritalStatus: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">الكل</option>
            <option value={MaritalStatus.SINGLE}>أعزب / عزباء</option>
            <option value={MaritalStatus.DIVORCED}>مطلق / مطلقة</option>
            <option value={MaritalStatus.WIDOWED}>أرمل / أرملة</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 block">
            السن: {filter.ageFrom} إلى {filter.ageTo}
          </label>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="range"
              min={18}
              max={65}
              value={filter.ageTo}
              onChange={(e) => onChange((prev) => ({ ...prev, ageTo: Number(e.target.value) }))}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Advanced Filter Toggle */}
      <div>
        <button
          type="button"
          onClick={() => onChange((prev) => ({ ...prev, isAdvanced: !prev.isAdvanced }))}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition"
        >
          {filter.isAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{filter.isAdvanced ? "إخفاء الفلاتر المتقدمة" : "عرض الفلاتر المتقدمة (الالتزام، القايمة، الطول...)"}</span>
        </button>
      </div>

      {/* Advanced Filters Expandable Box */}
      {filter.isAdvanced && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">الالتزام الديني</label>
            <select
              value={filter.religiosity}
              onChange={(e) => onChange((prev) => ({ ...prev, religiosity: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
            >
              <option value="all">الكل</option>
              {ReligiousCommitmentLevels.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">المحافظة على الصلاة</label>
            <select
              value={filter.prayers}
              onChange={(e) => onChange((prev) => ({ ...prev, prayers: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
            >
              <option value="all">الكل</option>
              {PrayersCommitment.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {oppositeGender === Gender.FEMALE ? (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">نوع الحجاب</label>
              <select
                value={filter.hijab}
                onChange={(e) => onChange((prev) => ({ ...prev, hijab: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
              >
                <option value="all">الكل</option>
                <option value={HijabType.HIJAB}>حجاب شرعي</option>
                <option value={HijabType.KHIMAR}>خمار</option>
                <option value={HijabType.NIQAB}>نقاب</option>
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">اللحية</label>
              <select
                value={filter.beard}
                onChange={(e) => onChange((prev) => ({ ...prev, beard: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
              >
                <option value="all">الكل</option>
                <option value="yes">ملتحي</option>
                <option value="no">غير ملتحي</option>
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">الموقف من القايمة</label>
            <select
              value={filter.qaIma}
              onChange={(e) => onChange((prev) => ({ ...prev, qaIma: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
            >
              <option value="all">الكل</option>
              {QaImaStances.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">المهر والشبكة</label>
            <select
              value={filter.mahr}
              onChange={(e) => onChange((prev) => ({ ...prev, mahr: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
            >
              <option value="all">الكل</option>
              {MahrOpinions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">التدخين</label>
            <select
              value={filter.smoking}
              onChange={(e) => onChange((prev) => ({ ...prev, smoking: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800"
            >
              <option value="all">الكل</option>
              <option value="no">غير مدخن</option>
              <option value="yes">مدخن</option>
            </select>
          </div>
        </div>
      )}

      {/* Red Flags Exclusion Filters */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-600" />
            <span>استبعاد الخطوط الحمراء (Red Flags) من نتائج البحث:</span>
          </label>
          {filter.redFlags && filter.redFlags.length > 0 && (
            <button
              type="button"
              onClick={() => onChange((prev) => ({ ...prev, redFlags: [] }))}
              className="text-[10px] text-slate-400 hover:text-slate-600 underline"
            >
              مسح تصفية الخطوط الحمراء
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RED_FLAG_OPTIONS.map((flag) => {
            const isSelected = filter.redFlags?.includes(flag);
            return (
              <button
                type="button"
                key={flag}
                onClick={() => {
                  onChange((prev) => {
                    const currentFlags = prev.redFlags || [];
                    const updated = isSelected
                      ? currentFlags.filter((f) => f !== flag)
                      : [...currentFlags, flag];
                    return { ...prev, redFlags: updated };
                  });
                }}
                className={`px-2.5 py-1 text-xs rounded-xl border transition flex items-center gap-1 ${
                  isSelected
                    ? "bg-rose-600 border-rose-600 text-white font-bold shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-rose-300"
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3 h-3" />}
                {flag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
