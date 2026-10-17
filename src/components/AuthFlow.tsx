import React, { useState, useEffect } from "react";
import { useApp } from "../lib/store";
import { Gender } from "../types";
import { StepEmailOtp } from "./auth/StepEmailOtp";
import { StepCharter } from "./auth/StepCharter";
import { StepGender } from "./auth/StepGender";
import { StepProfileForm } from "./auth/StepProfileForm";
import { StepAvatar } from "./auth/StepAvatar";
import { ProfileFormData } from "./auth/authSchemas";
import { useUIStore } from "../stores/uiStore";

export const AuthFlow: React.FC = () => {
  const { currentUser, saveProfile } = useApp();
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

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);
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

    setIsFinishing(false);
    if (res.ok) {
      addToast("مبارك! تم إعداد ملفك الشخصي بنجاح، مرحباً بك في مودة ورحمة.", "success");
    }
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
