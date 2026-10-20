import React, { useState, useEffect } from "react";
import { useApp } from "../lib/store";
import { Gender, AccountRole } from "../types";
import { StepEmailOtp } from "./auth/StepEmailOtp";
import { StepCharter } from "./auth/StepCharter";
import { StepGender } from "./auth/StepGender";
import { StepProfileForm } from "./auth/StepProfileForm";
import { StepAvatar } from "./auth/StepAvatar";
import { ProfileFormData } from "./auth/authSchemas";
import { useUIStore } from "../stores/uiStore";

export const AuthFlow: React.FC = () => {
  const { currentUser, saveProfile, acceptGuardianInvitation } = useApp();
  const { addToast } = useUIStore();

  const [step, setStep] = useState<"login" | "charter" | "gender" | "profile" | "avatar">(() => {
    if (!currentUser) return "login";
    if (!currentUser.agreedToCharter) return "charter";
    if (!currentUser.name) return "gender";
    return "profile";
  });

  const [selectedGender, setSelectedGender] = useState<Gender>(
    (currentUser?.gender as Gender) || Gender.MALE
  );
  const [selectedRole, setSelectedRole] = useState<AccountRole>(
    currentUser?.accountRole || "seeker_male"
  );
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData | null>(null);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setStep("login");
      return;
    }
    if (!currentUser.agreedToCharter) {
      setStep("charter");
      return;
    }
    if (!currentUser.name) {
      setStep("gender");
      return;
    }
  }, [currentUser?.id, currentUser?.agreedToCharter, currentUser?.name]);

  const handleGenderSelect = (gender: Gender, accountRole: AccountRole, inviteCode?: string) => {
    setSelectedGender(gender);
    setSelectedRole(accountRole);
    if (inviteCode) {
      setPendingInviteCode(inviteCode);
    }

    // تجهيز قيم أولية تناسب ولي الأمر لعدم إثقاله
    if (accountRole.startsWith("guardian_")) {
      const isBrideGuardian = accountRole === "guardian_bride";
      setFormData({
        name: currentUser?.name || (isBrideGuardian ? "أبو العروسة" : "والد العريس"),
        mobile: currentUser?.mobile || "",
        age: 52,
        nationality: "مصر",
        residence: "مصر",
        profession: isBrideGuardian ? "ولي أمر العروسة" : "ولي أمر العريس",
        education: "جامعي / عالي",
        income: "من 7,000 إلى 15,000 جنيه أو ما يعادلها",
        maritalStatus: "متزوج" as any,
        hasChildren: true,
        childrenCount: 2,
        isSmoker: false,
        height: 172,
        weight: 75,
        skinColor: "قمحي",
        bodyBuild: "متوسط",
        healthStatus: "بصحة جيدة جداً والحمد لله",
        hasDisability: false,
        chronicDiseases: "",
        religiousCommitment: "ملتزم يسعى للأفضل",
        prayers: "أصلي كل الصلوات في وقتها والحمد لله",
        hasBeard: true,
        hijabType: null,
        qaImaStance: "موضوع خاضع للاتفاق والتفاهم والمودة بين العائلتين",
        mahrOpinion: "اليسر والبركة والتيسير بما يتفق عليه الطرفان",
        marriageTimeframe: "خلال سنة على الأكثر بإذن الله",
        shariaVisionStance: "أؤيد اللقاء والتعارف الرسمي في أجواء عائلية محترمة ومباركة",
        aboutMe: isBrideGuardian 
          ? "ولي أمر مسجل في المنصة للمتابعة والرعاية الأسرية لخطوات التعارف لابنتي الكريمة وحفظ حقوقها."
          : "ولي أمر مسجل في المنصة للمتابعة والرعاية الأسرية لخطوات التعارف لابني الكريم وحسن التوفيق.",
        partnerSpecs: "الحرص على حسن الخلق والمبادئ الأصيلة، والجدية التامة والتوافق الأسري المحترم.",
      });
      setHobbies(["القراءة", "التربية", "الأسرة"]);
    }

    setStep("profile");
  };

  const handleProfileFormSubmit = (data: ProfileFormData, selectedHobbies: string[]) => {
    setFormData(data);
    setHobbies(selectedHobbies);
    setStep("avatar");
  };

  const handleAvatarSelect = async (avatarId: string) => {
    if (!formData) return;
    setIsFinishing(true);

    const res = await saveProfile({
      accountRole: selectedRole,
      name: formData.name,
      mobile: formData.mobile,
      gender: selectedGender,
      age: formData.age,
      nationality: formData.nationality,
      residence: formData.residence,
      profession: formData.profession,
      education: formData.education,
      income: formData.income,
      maritalStatus: formData.maritalStatus as any,
      hasChildren: formData.hasChildren,
      childrenCount: formData.childrenCount,
      isSmoker: formData.isSmoker,
      height: formData.height,
      weight: formData.weight,
      skinColor: formData.skinColor,
      bodyBuild: formData.bodyBuild,
      healthStatus: formData.healthStatus,
      hasDisability: formData.hasDisability,
      chronicDiseases: formData.chronicDiseases,
      religiousCommitment: formData.religiousCommitment,
      prayers: formData.prayers,
      hasBeard: formData.hasBeard,
      hijabType: formData.hijabType as any,
      qaImaStance: formData.qaImaStance,
      mahrOpinion: formData.mahrOpinion,
      marriageTimeframe: formData.marriageTimeframe,
      shariaVisionStance: formData.shariaVisionStance,
      aboutMe: formData.aboutMe,
      partnerSpecs: formData.partnerSpecs,
      hobbies,
      avatar: avatarId,
    });

    if (res.ok) {
      // إذا كان ولي أمر وقام بإدخال كود الدعوة في البداية، نقوم بربطه مباشرة الآن
      if (pendingInviteCode && selectedRole.startsWith("guardian_")) {
        const linkRes = await acceptGuardianInvitation(pendingInviteCode);
        if (linkRes.ok) {
          addToast("تم ربط حسابك بمن تتولى أمره وتفعيل الإشراف الشرعي بنجاح!", "success");
        } else {
          addToast(`تم إنشاء حسابك، ولكن تعذر ربط رمز الدعوة: ${linkRes.error}`, "info");
        }
      } else {
        addToast("مبارك! تم إعداد حسابك بنجاح، مرحباً بك في مودة ورحمة.", "success");
      }
    }

    setIsFinishing(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-2xl">
        {step === "login" && <StepEmailOtp />}
        {step === "charter" && <StepCharter onSuccess={() => setStep("gender")} />}
        {step === "gender" && <StepGender onSelect={handleGenderSelect} />}
        {step === "profile" && (
          <StepProfileForm
            gender={selectedGender}
            initialData={formData || undefined}
            onSubmit={handleProfileFormSubmit}
            onBack={() => setStep("gender")}
          />
        )}
        {step === "avatar" && (
          <StepAvatar
            gender={selectedGender}
            onSelect={handleAvatarSelect}
            isLoading={isFinishing}
          />
        )}
      </div>
    </div>
  );
};
