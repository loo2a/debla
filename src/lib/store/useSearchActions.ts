import { useCallback } from "react";
import { SearchProfilesFilter, SearchProfilesResponse, UserProfile } from "../../types";
import { supabase } from "../supabase";
import { toProfile } from "./mappers";

export const useSearchActions = (
  currentUser: UserProfile | null,
  profiles: UserProfile[],
  setProfiles: React.Dispatch<React.SetStateAction<UserProfile[]>>
) => {
  const searchProfiles = async (filter: SearchProfilesFilter): Promise<SearchProfilesResponse> => {
    try {
      const { data, error } = await supabase.rpc("search_profiles_rpc", {
        p_gender: filter.gender,
        p_min_age: filter.minAge,
        p_max_age: filter.maxAge,
        p_residence: filter.residence,
        p_nationality: filter.nationality,
        p_religion: filter.religion,
        p_christian_denomination: filter.christianDenomination,
        p_marital_status: filter.maritalStatus,
        p_religious_commitment: filter.religiousCommitment,
        p_education: filter.education,
        p_prayers: filter.prayers,
        p_smoking: filter.smoking,
        p_min_height: filter.minHeight,
        p_max_height: filter.maxHeight,
        p_is_verified_only: filter.isVerifiedOnly || false,
        p_hijab_type: filter.hijabType,
        p_has_beard: filter.hasBeard,
        p_red_flags: filter.redFlags && filter.redFlags.length > 0 ? filter.redFlags : null,
        p_search_query: filter.searchQuery,
        p_sort_by: filter.sortBy || "latest",
        p_page: filter.page || 1,
        p_page_size: filter.pageSize || 12,
      });

      if (!error && data && data.results) {
        return {
          results: data.results.map((r: any) => toProfile(r)),
          total: data.total || 0,
          page: data.page || 1,
          pageSize: data.pageSize || 12,
          totalPages: data.totalPages || 1,
        };
      }
    } catch {
      // Fallback below
    }

    // Fallback: local memory filter
    const oppositeGender = currentUser?.gender === "male" ? "female" : "male";
    const filtered = profiles.filter(p => {
      if (p.id === currentUser?.id) return false;
      if (p.gender !== oppositeGender) return false;
      // الفلترة الدينية الصارمة: منع خلط المسلمين والمسيحيين نهائياً
      const targetReligion = (filter.religion || currentUser?.religion || "مسلم").trim();
      if ((p.religion || "مسلم").trim() !== targetReligion) return false;
      if (targetReligion === "مسيحي" && filter.christianDenomination && filter.christianDenomination !== "all" && p.christianDenomination !== filter.christianDenomination) return false;
      if (filter.minAge && p.age < filter.minAge) return false;
      if (filter.maxAge && p.age > filter.maxAge) return false;
      if (filter.residence && p.residence !== filter.residence) return false;
      if (filter.nationality && p.nationality !== filter.nationality) return false;
      if (filter.maritalStatus && p.maritalStatus !== filter.maritalStatus) return false;
      if (filter.religiousCommitment && p.religiousCommitment !== filter.religiousCommitment) return false;
      if (filter.education && p.education !== filter.education) return false;
      if (filter.prayers && p.prayers !== filter.prayers) return false;
      if (filter.smoking !== undefined && p.isSmoker !== filter.smoking) return false;
      if (filter.minHeight && p.height < filter.minHeight) return false;
      if (filter.maxHeight && p.height > filter.maxHeight) return false;
      if (filter.isVerifiedOnly && !p.isVerified) return false;
      if (filter.hijabType && p.hijabType !== filter.hijabType) return false;
      if (filter.hasBeard !== undefined && p.hasBeard !== filter.hasBeard) return false;
      if (filter.redFlags && filter.redFlags.length > 0) {
        if (filter.redFlags.includes("التدخين") && p.isSmoker) return false;
        if (filter.redFlags.includes("التهاون في الصلاة") && p.prayers && (p.prayers.includes("أحياناً") || p.prayers.includes("منقطع") || p.prayers.includes("لا أصلي"))) return false;
        if (filter.redFlags.includes("قلة الالتزام الديني") && p.religiousCommitment && p.religiousCommitment.includes("غير")) return false;
      }
      if (filter.searchQuery) {
        const q = filter.searchQuery.toLowerCase();
        const matches = p.name.toLowerCase().includes(q) ||
          p.aboutMe.toLowerCase().includes(q) ||
          p.profession.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    const page = filter.page || 1;
    const pageSize = filter.pageSize || 12;
    const start = (page - 1) * pageSize;

    return {
      results: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    };
  };

  const fetchProfileById = useCallback(async (id: string): Promise<UserProfile | null> => {
    if (!id) return null;
    if (currentUser?.id === id) return currentUser;
    const existing = profiles.find(p => p.id === id);
    if (existing) return existing;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) return null;
      const loaded = toProfile(data);
      setProfiles(prev => (prev.some(p => p.id === loaded.id) ? prev : [...prev, loaded]));
      return loaded;
    } catch {
      return null;
    }
  }, [profiles, currentUser, setProfiles]);

  return {
    searchProfiles,
    fetchProfileById,
  };
};
