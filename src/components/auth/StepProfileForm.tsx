import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileFormSchema, ProfileFormData } from "./authSchemas";
import { Gender, MaritalStatus, HijabType } from "../../types";
import {
  Nationalities, Countries, EducationLevels, IncomeLevels,
  SkinColors, BodyBuilds, HealthStatuses, ReligiousCommitmentLevels,
  PrayersCommitment, QaImaStances, MahrOpinions, MarriageTimeframes,
  MarriageReadinessLevels, ShariaVisionStances, ChristianMeetingStances, HobbiesList,
  ReligionsList, ChristianDenominationsList, ChristianReligiousCommitmentLevels,
  ChristianPrayersCommitment, ChurchAttendanceOptions
} from "../../constants";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { User, Heart, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface StepProfileFormProps {
  gender: Gender;
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData, hobbies: string[]) => void;
  onBack: () => void;
}

export const StepProfileForm: React.FC<StepProfileFormProps> = ({
  gender,
  initialData,
  onSubmit,
  onBack,
}) => {
  const [activeSection, setActiveSection] = useState<number>(0);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      mobile: initialData?.mobile || "",
      age: initialData?.age || 26,
      nationality: initialData?.nationality || "مصر",
      residence: initialData?.residence || "مصر",
      profession: initialData?.profession || "",
      education: initialData?.education || "بكالوريوس / ليسانس",
      income: initialData?.income || "من 7,000 إلى 15,000 جنيه أو ما يعادلها",
      maritalStatus: initialData?.maritalStatus || MaritalStatus.SINGLE,
      hasChildren: initialData?.hasChildren || false,
      childrenCount: initialData?.childrenCount || 0,
      isSmoker: initialData?.isSmoker || false,
      height: initialData?.height || 170,
      weight: initialData?.weight || 70,
      skinColor: initialData?.skinColor || "قمحي",
      bodyBuild: initialData?.bodyBuild || "متوسط",
      healthStatus: initialData?.healthStatus || "بصحة جيدة جداً والحمد لله",
      hasDisability: initialData?.hasDisability || false,
      religion: initialData?.religion || "مسلم",
      christianDenomination: initialData?.christianDenomination || "أرثوذكسي",
      churchAttendance: initialData?.churchAttendance || "مواظب على حضور القداسات أسبوعياً",
      religiousCommitment: initialData?.religiousCommitment || "ملتزم متوسط يسعى للأفضل",
      prayers: initialData?.prayers || "أصلي كل الصلوات في وقتها والحمد لله",
      hasBeard: gender === Gender.MALE ? true : null,
      hijabType: gender === Gender.FEMALE ? HijabType.HIJAB : null,
      qaImaStance: initialData?.qaImaStance || "موضوع خاضع للاتفاق بين العائلتين",
      mahrOpinion: initialData?.mahrOpinion || "موضوع خاضع للاتفاق والنقاش المرن",
      marriageTimeframe: initialData?.marriageTimeframe || "خلال سنة على الأكثر",
      marriageReadiness: initialData?.marriageReadiness || "مستعد تماماً وجاهز من كافة الجوانب (السكن والإمكانيات جاهزة)",
      shariaVisionStance: initialData?.shariaVisionStance || "أؤيد اللقاء والتعارف الرسمي بوجود الأهل في أقرب فرصة",
      aboutMe: initialData?.aboutMe || "",
      partnerSpecs: initialData?.partnerSpecs || "",
    },
  });

  const selectedReligion = watch("religion") || "مسلم";

  const aboutMeText = watch("aboutMe") || "";
  const partnerSpecsText = watch("partnerSpecs") || "";

  const toggleHobby = (hobby: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    );
  };

  const sections = [
    { title: "البيانات الأساسية", icon: User },
    { title: "المواصفات والالتزام", icon: Sparkles },
    { title: "عن نفسي وشريك حياتي", icon: Heart },
  ];

  const onFormSubmit = (data: ProfileFormData) => {
    onSubmit(data, selectedHobbies);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xl text-right max-w-2xl mx-auto space-y-6" dir="rtl">
      {/* Header & Step Indicator */}
      <div className="space-y-3 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-extrabold text-slate-800 flex items-center justify-between">
          <span>استكمال بيانات الملف الشخصي</span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            {gender === Gender.MALE 
              ? "👨 حساب شاب مقبل على الزواج" 
              : (selectedReligion === "مسلم" ? "🧕 حساب فتاة مقبلة على الزواج" : "👩 حساب فتاة مقبلة على الزواج")}
          </span>
        </h2>

        {/* Section Tabs */}
        <div className="flex gap-2">
          {sections.map((sec, idx) => (
            <button
              key={sec.title}
              type="button"
              onClick={() => setActiveSection(idx)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeSection === idx
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <sec.icon className="w-3.5 h-3.5" />
              <span>{sec.title}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Section 0: Basic Info */}
        {activeSection === 0 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="الاسم المستعار أو الاسم الأول"
                required
                placeholder="أحمد / فاطمة"
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="رقم الموبايل (لا يظهر لأحد)"
                required
                dir="ltr"
                placeholder="+201012345678"
                error={errors.mobile?.message}
                {...register("mobile")}
              />

              <Input
                label="العمر (بالسنوات)"
                type="number"
                required
                error={errors.age?.message}
                {...register("age", { valueAsNumber: true })}
              />

              <Select
                label="الجنسية"
                required
                error={errors.nationality?.message}
                {...register("nationality")}
              >
                {Nationalities.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>

              <Select
                label="بلد الإقامة الحالي"
                required
                error={errors.residence?.message}
                {...register("residence")}
              >
                {Countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>

              <Input
                label="المهنة / الوظيفة"
                required
                placeholder="مهندس برمجيات / معلمة"
                error={errors.profession?.message}
                {...register("profession")}
              />

              <Select
                label="المؤهل العلمي"
                required
                error={errors.education?.message}
                {...register("education")}
              >
                {EducationLevels.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </Select>

              <Select
                label="نطاق الدخل الشهري"
                required
                error={errors.income?.message}
                {...register("income")}
              >
                {IncomeLevels.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </Select>

              <Select
                label="الحالة الاجتماعية"
                required
                error={errors.maritalStatus?.message}
                {...register("maritalStatus")}
              >
                <option value={MaritalStatus.SINGLE}>أعزب / عزباء</option>
                <option value={MaritalStatus.DIVORCED}>مطلق / مطلقة</option>
                <option value={MaritalStatus.WIDOWED}>أرمل / أرملة</option>
              </Select>

              <Select
                label="الديانة"
                required
                error={errors.religion?.message}
                {...register("religion")}
              >
                {ReligionsList.map((rel) => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </Select>

              <div className="flex items-center gap-4 pt-4 sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    {...register("hasChildren")}
                  />
                  <span>لديك أبناء؟</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    {...register("isSmoker")}
                  />
                  <span>مدخن؟</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={onBack}>
                العودة
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={() => setActiveSection(1)}>
                <span>التالي: المواصفات والالتزام</span>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Section 1: Physical & Religious */}
        {activeSection === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="الطول (سم)"
                type="number"
                error={errors.height?.message}
                {...register("height", { valueAsNumber: true })}
              />

              <Input
                label="الوزن (كجم)"
                type="number"
                error={errors.weight?.message}
                {...register("weight", { valueAsNumber: true })}
              />

              <Select
                label="لون البشرة"
                error={errors.skinColor?.message}
                {...register("skinColor")}
              >
                {SkinColors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>

              <Select
                label="بنية الجسم"
                error={errors.bodyBuild?.message}
                {...register("bodyBuild")}
              >
                {BodyBuilds.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>

              <Select
                label="الحالة الصحية العامة"
                error={errors.healthStatus?.message}
                {...register("healthStatus")}
              >
                {HealthStatuses.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </Select>

              {selectedReligion === "مسيحي" ? (
                <>
                  <Select
                    label="المذهب / الطائفة"
                    required
                    error={errors.christianDenomination?.message}
                    {...register("christianDenomination")}
                  >
                    {ChristianDenominationsList.map((den) => (
                      <option key={den} value={den}>{den}</option>
                    ))}
                  </Select>

                  <Select
                    label="الالتزام الكنسي والروحي"
                    error={errors.religiousCommitment?.message}
                    {...register("religiousCommitment")}
                  >
                    {ChristianReligiousCommitmentLevels.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Select>

                  <Select
                    label="حضور القداسات والتناول والصلوات"
                    error={errors.prayers?.message}
                    {...register("prayers")}
                  >
                    {ChristianPrayersCommitment.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Select>

                  <Select
                    label="الخدمة والأنشطة الكنسية"
                    error={errors.churchAttendance?.message}
                    {...register("churchAttendance")}
                  >
                    {ChurchAttendanceOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </>
              ) : (
                <>
                  <Select
                    label="مستوى الالتزام الديني"
                    error={errors.religiousCommitment?.message}
                    {...register("religiousCommitment")}
                  >
                    {ReligiousCommitmentLevels.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Select>

                  <Select
                    label="المحافظة على الصلاة"
                    error={errors.prayers?.message}
                    {...register("prayers")}
                  >
                    {PrayersCommitment.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Select>

                  {gender === Gender.FEMALE && (
                    <Select
                      label="الحجاب / الالتزام بالزي"
                      error={errors.hijabType?.message}
                      {...register("hijabType")}
                    >
                      <option value={HijabType.HIJAB}>حجاب شرعي</option>
                      <option value={HijabType.KHIMAR}>خمار</option>
                      <option value={HijabType.NIQAB}>نقاب</option>
                      <option value={HijabType.NONE}>غير محجبة</option>
                    </Select>
                  )}
                </>
              )}

              <Select
                label="الموقف من القايمة"
                error={errors.qaImaStance?.message}
                {...register("qaImaStance")}
              >
                {QaImaStances.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </Select>

              <Select
                label="الرأي في المهر والشبكة"
                error={errors.mahrOpinion?.message}
                {...register("mahrOpinion")}
              >
                {MahrOpinions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>

              <Select
                label="الإطار الزمني المتوقع للزواج"
                error={errors.marriageTimeframe?.message}
                {...register("marriageTimeframe")}
              >
                {MarriageTimeframes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>

              <Select
                label="مدى الاستعداد والجاهزية للزواج"
                error={errors.marriageReadiness?.message}
                {...register("marriageReadiness")}
              >
                {MarriageReadinessLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </Select>

              <Select
                label={selectedReligion === "مسيحي" ? "الموقف من اللقاء والتعارف الرسمي بمباركة الأهل" : "الموقف من الرؤية الشرعية"}
                error={errors.shariaVisionStance?.message}
                {...register("shariaVisionStance")}
              >
                {(selectedReligion === "مسيحي" ? ChristianMeetingStances : ShariaVisionStances).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </Select>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setActiveSection(0)}>
                السابق
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={() => setActiveSection(2)}>
                <span>التالي: التحدث عن النفس</span>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Section 2: Descriptions & Hobbies */}
        {activeSection === 2 && (
          <div className="space-y-4 animate-in fade-in">
            {/* About Me */}
            <div className="space-y-1 text-right">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700">
                  تحدث عن نفسك بالتفصيل <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`font-mono text-[11px] ${
                    aboutMeText.length >= 140 ? "text-emerald-600 font-bold" : "text-amber-600"
                  }`}
                >
                  {aboutMeText.length} / 140 حرف كحد أدنى
                </span>
              </div>
              <textarea
                rows={4}
                required
                placeholder="اكتب عن طباعك، اهتماماتك، طبيعة عملك، أهدافك في الحياة، وما يهم الطرف الآخر معرفته بصدق ووضوح..."
                className={`w-full p-3 rounded-2xl border text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 leading-relaxed ${
                  errors.aboutMe
                    ? "border-rose-300 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-emerald-100 focus:border-emerald-500"
                }`}
                {...register("aboutMe")}
              />
              {errors.aboutMe && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.aboutMe.message}</p>
              )}
            </div>

            {/* Partner Specs */}
            <div className="space-y-1 text-right">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700">
                  مواصفات شريك الحياة المطلوب <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`font-mono text-[11px] ${
                    partnerSpecsText.length >= 140 ? "text-emerald-600 font-bold" : "text-amber-600"
                  }`}
                >
                  {partnerSpecsText.length} / 140 حرف كحد أدنى
                </span>
              </div>
              <textarea
                rows={4}
                required
                placeholder="وضح الصفات الدينية والخلقية والاجتماعية التي تبحث عنها، وما تفضله في شريك حياتك وطبيعة البيت الذي ترغب في بنائه..."
                className={`w-full p-3 rounded-2xl border text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 leading-relaxed ${
                  errors.partnerSpecs
                    ? "border-rose-300 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-emerald-100 focus:border-emerald-500"
                }`}
                {...register("partnerSpecs")}
              />
              {errors.partnerSpecs && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.partnerSpecs.message}</p>
              )}
            </div>

            {/* Hobbies */}
            <div className="space-y-2 pt-2 text-right">
              <label className="block text-xs font-bold text-slate-700">الهوايات والاهتمامات (اختياري)</label>
              <div className="flex flex-wrap gap-1.5">
                {HobbiesList.map((hobby) => {
                  const isSelected = selectedHobbies.includes(hobby);
                  return (
                    <button
                      key={hobby}
                      type="button"
                      onClick={() => toggleHobby(hobby)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {hobby}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setActiveSection(1)}>
                السابق
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={aboutMeText.length < 140 || partnerSpecsText.length < 140}
              >
                متابعة واختيار الأفاتار
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
