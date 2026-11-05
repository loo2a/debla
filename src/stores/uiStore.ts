import { create } from "zustand";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration?: number;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isDangerous?: boolean;
}

interface UIStoreState {
  toasts: ToastItem[];
  addToast: (message: string, type?: "success" | "error" | "info", duration?: number) => void;
  removeToast: (id: string) => void;

  confirmDialog: ConfirmDialogState | null;
  showConfirm: (dialog: Omit<ConfirmDialogState, "isOpen">) => void;
  closeConfirm: () => void;

  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;

  isReviewModalOpen: boolean;
  openReviewModal: () => void;
  closeReviewModal: () => void;
  triggerReviewPrompt: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  toasts: [],
  addToast: (message, type = "info", duration = 4500) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({ toasts: [...state.toasts, { id, type, message, duration }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  confirmDialog: null,
  showConfirm: (dialog) =>
    set({ confirmDialog: { ...dialog, isOpen: true } }),
  closeConfirm: () => set({ confirmDialog: null }),

  isSidebarOpen: false,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  isReviewModalOpen: false,
  openReviewModal: () => set({ isReviewModalOpen: true }),
  closeReviewModal: () => set({ isReviewModalOpen: false }),
  triggerReviewPrompt: () => {
    if (typeof localStorage === "undefined") return;
    const reviewed = localStorage.getItem("debla_app_reviewed") || localStorage.getItem("mawada_app_reviewed");
    const postponedUntil = Number(localStorage.getItem("debla_review_postponed_until") || localStorage.getItem("mawada_review_postponed_until") || "0");
    if (reviewed === "true" || Date.now() < postponedUntil) return;
    set({ isReviewModalOpen: true });
  },
}));
