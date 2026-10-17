import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./lib/store";
import { supabaseConfigError } from "./lib/supabase";
import { useUIStore } from "./stores/uiStore";
import { AuthFlow } from "./components/AuthFlow";
import { Sidebar } from "./components/Sidebar";
import { BottomBar } from "./components/BottomBar";
import { ToastContainer } from "./components/ui/ToastContainer";
import { ConfirmModal } from "./components/ui/ConfirmModal";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Skeleton, ProfileCardSkeleton } from "./components/ui/Skeleton";
import { Button } from "./components/ui/Button";

// Lazy-loaded routes for optimal bundle splitting and performance
const Dashboard = lazy(() => import("./components/Dashboard").then(m => ({ default: m.Dashboard })));
const SearchPage = lazy(() => import("./components/SearchPage").then(m => ({ default: m.SearchPage })));
const ProfileDetails = lazy(() => import("./components/ProfileDetails").then(m => ({ default: m.ProfileDetails })));
const InboxPage = lazy(() => import("./components/InboxPage").then(m => ({ default: m.InboxPage })));
const PremiumPage = lazy(() => import("./components/PremiumPage").then(m => ({ default: m.PremiumPage })));
const AdminPanel = lazy(() => import("./components/AdminPanel").then(m => ({ default: m.AdminPanel })));
const SuccessStories = lazy(() => import("./components/SuccessStories").then(m => ({ default: m.SuccessStories })));
const MyProfilePage = lazy(() => import("./pages/MyProfilePage").then(m => ({ default: m.MyProfilePage })));
const InterestsPage = lazy(() => import("./pages/InterestsPage").then(m => ({ default: m.InterestsPage })));
const IgnoredPage = lazy(() => import("./pages/IgnoredPage").then(m => ({ default: m.IgnoredPage })));
const WhoInterestedPage = lazy(() => import("./pages/WhoInterestedPage").then(m => ({ default: m.WhoInterestedPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then(m => ({ default: m.ContactPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="p-4 space-y-4 max-w-md mx-auto pt-8" dir="rtl">
    <div className="h-28 bg-emerald-800/10 rounded-3xl animate-pulse" />
    <div className="grid grid-cols-2 gap-3">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
    <ProfileCardSkeleton />
    <ProfileCardSkeleton />
  </div>
);

const AppContent: React.FC = () => {
  const { currentUser, isAuthReady, dbError, retryLoadData, logout } = useApp();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  // Waiting for Supabase to restore the session
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3 text-slate-500 text-sm" dir="rtl">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-semibold text-slate-600 text-xs">جاري تهيئة المنصة والمصادقة الشرعية...</p>
      </div>
    );
  }

  // Logged in but data could not be loaded (e.g. database migration not applied)
  if (!currentUser && dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6" dir="rtl">
        <div className="max-w-sm w-full bg-white rounded-3xl border border-amber-200 p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            ⚠️
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 text-sm">تنبيه اتصال بقاعدة البيانات</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{dbError}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { void retryLoadData(); }} variant="primary" className="flex-1 text-xs">
              إعادة المحاولة
            </Button>
            <Button onClick={() => { void logout(); }} variant="outline" className="flex-1 text-xs">
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in, or onboarding (charter / profile) not finished yet
  if (!currentUser || !currentUser.agreedToCharter || !currentUser.name) {
    return <AuthFlow />;
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20 font-sans">
      
      {/* Sidebar Menu */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Screen Routes */}
      <main className="max-w-md mx-auto">
        <ErrorBoundary>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard onOpenSidebar={() => setSidebarOpen(true)} />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile/:userId" element={<ProfileDetails />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/inbox/:chatUserId" element={<InboxPage />} />
              <Route path="/premium" element={<PremiumPage />} />
              <Route path="/success-stories" element={<SuccessStories />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/my-profile" element={<MyProfilePage />} />
              <Route path="/interests" element={<InterestsPage />} />
              <Route path="/ignored" element={<IgnoredPage />} />
              <Route path="/who-interested" element={<WhoInterestedPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomBar />

      {/* Global Interactive Modals & Toasts */}
      <ToastContainer />
      <ConfirmModal />
    </div>
  );
};

export default function App() {
  if (supabaseConfigError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6" dir="rtl">
        <div className="max-w-md bg-white rounded-2xl border border-rose-200 p-6 text-center text-sm text-slate-700 leading-relaxed shadow-sm">
          {supabaseConfigError}
        </div>
      </div>
    );
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
