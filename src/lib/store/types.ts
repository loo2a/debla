import {
  UserProfile, Message, Notification, SuccessStory, Interaction,
  PremiumSubscriptionRequest, SearchProfilesFilter, SearchProfilesResponse,
  VerificationTierType, GuardianLinkStatus,
  CompatibilitySurvey, ProfileEditRequest,
  Coupon, AdminBroadcastMessage,
  AcademyArticle
} from "../../types";

export interface ActionResult {
  ok: boolean;
  error?: string;
  data?: any;
}

export type PlanDuration = "week" | "month" | "3months" | "6months" | "year";
export type PaymentMethod = "google_play" | "credit_card" | "mobile_wallet";

export interface AppContextType {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  profiles: UserProfile[];
  messages: Message[];
  notifications: Notification[];
  successStories: SuccessStory[];
  interactions: Interaction[];
  premiumRequests: PremiumSubscriptionRequest[];
  dbError: string | null;
  actionError: string | null;
  isAuthReady: boolean;
  isSupabaseLoading: boolean;

  // Auth & Profile Actions
  requestEmailOtp: (email: string) => Promise<ActionResult>;
  verifyEmailOtp: (email: string, code: string) => Promise<ActionResult>;
  signInWithGoogle: () => Promise<ActionResult>;
  submitCharterAgreement: () => Promise<ActionResult>;
  saveProfile: (profile: Partial<UserProfile>) => Promise<ActionResult>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<ActionResult>;
  updateAvatar: (avatarId: string) => Promise<ActionResult>;
  uploadCustomImage: (fileOrBase64: File | Blob | string) => Promise<ActionResult>;
  updatePhotoPrivacy: (privacy: "public" | "accepted_interest_only" | "hidden") => Promise<ActionResult>;
  toggleIncognitoMode: () => Promise<ActionResult>;
  deleteMyAccount: (immediate?: boolean) => Promise<ActionResult>;
  cancelAccountDeletion: () => Promise<ActionResult>;
  logout: () => Promise<void>;
  clearActionError: () => void;

  // Interaction Actions
  expressInterest: (toUserId: string) => Promise<ActionResult>;
  acceptInterest: (toUserId: string) => Promise<ActionResult>;
  ignoreProfile: (toUserId: string) => Promise<ActionResult>;
  unignoreProfile: (toUserId: string) => Promise<ActionResult>;
  blockProfile: (toUserId: string) => Promise<ActionResult>;
  reportProfile: (toUserId: string, reason: string) => Promise<ActionResult>;
  recordProfileView: (viewedId: string) => Promise<void>;

  // Online Presence
  onlineUserIds: Set<string>;
  isUserOnline: (userId: string) => boolean;

  // Messaging & Conversation Pagination
  sendMessage: (toUserId: string, content: string) => Promise<ActionResult>;
  markMessagesAsRead: (senderId: string) => void;
  fetchConversationMessages: (partnerId: string, limit?: number) => Promise<Message[]>;

  // Search & Pagination
  searchProfiles: (filter: SearchProfilesFilter) => Promise<SearchProfilesResponse>;
  fetchProfileById: (id: string) => Promise<UserProfile | null>;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Premium Subscriptions
  submitPremiumRequest: (plan: PlanDuration, paymentMethod: PaymentMethod, phoneNumber?: string) => Promise<ActionResult>;

  // Multi-tier Verification
  requestTierVerification: (tier: VerificationTierType, details?: string) => Promise<ActionResult>;
  adminUpdateTierVerification: (userId: string, tier: VerificationTierType, verified: boolean) => Promise<ActionResult>;

  // Admin Operations
  adminApprovePremium: (requestId: string) => Promise<ActionResult>;
  adminRejectPremium: (requestId: string) => Promise<ActionResult>;
  adminVerifyUser: (userId: string) => Promise<ActionResult>;
  adminDeleteUser: (userId: string) => Promise<ActionResult>;
  adminApproveStory: (storyId: string) => Promise<ActionResult>;
  adminAddStory: (husband: string, wife: string, content: string) => Promise<ActionResult>;
  retryLoadData: () => Promise<void>;

  // Guardian & Family Oversight Mode
  guardianStatus: GuardianLinkStatus | null;
  fetchGuardianStatus: () => Promise<GuardianLinkStatus | null>;
  createGuardianInvitation: (inviteCode: string, relationship?: string) => Promise<ActionResult>;
  acceptGuardianInvitation: (inviteCode: string) => Promise<ActionResult>;
  revokeGuardianLink: (linkId: string) => Promise<ActionResult>;
  updateGuardianPermissions: (linkId: string, canViewChat: boolean, canApproveRequests: boolean) => Promise<ActionResult>;

  // Compatibility Survey & Red Flags
  mySurvey: CompatibilitySurvey | null;
  allSurveys: Map<string, CompatibilitySurvey>;
  saveCompatibilitySurvey: (survey: Omit<CompatibilitySurvey, "userId">) => Promise<ActionResult>;
  fetchCompatibilitySurvey: (userId: string) => Promise<CompatibilitySurvey | null>;

  // Locked Profile Edit Requests
  profileEditRequests: ProfileEditRequest[];
  submitProfileEditRequest: (requestedChanges: Record<string, any>, reason: string) => Promise<ActionResult>;
  adminReviewProfileEditRequest: (requestId: string, action: "approved" | "rejected", adminNotes?: string) => Promise<ActionResult>;

  // Admin Coupons & Discounts
  coupons: Coupon[];
  adminCreateCoupon: (coupon: Omit<Coupon, "id" | "usedCount" | "createdAt">) => Promise<ActionResult>;
  adminToggleCoupon: (couponId: string, isActive: boolean) => Promise<ActionResult>;
  adminDeleteCoupon: (couponId: string) => Promise<ActionResult>;

  // Admin Broadcast Notifications
  adminSendBroadcast: (broadcast: AdminBroadcastMessage) => Promise<ActionResult>;

  // Admin Direct User Management
  adminGrantPremium: (userId: string, durationDays: number) => Promise<ActionResult>;
  adminRevokePremium: (userId: string) => Promise<ActionResult>;

  // Academy — أكاديمية الاستعداد للزواج
  academyArticles: AcademyArticle[];
  fetchAcademyArticles: () => Promise<void>;
  markArticleRead: (articleId: string) => Promise<{ pointsAwarded: number; alreadyRead: boolean }>;
  rateArticle: (articleId: string, rating: number) => Promise<void>;
  submitMarriageQuizResult: (scorePercent: number) => Promise<ActionResult>;

  // Photo Moderation & Defense
  adminApprovePhoto: (userId: string) => Promise<ActionResult>;
  adminRejectPhoto: (userId: string, reason: string) => Promise<ActionResult>;
}
