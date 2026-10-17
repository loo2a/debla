import React, { useState } from "react";
import { useUIStore } from "../../stores/uiStore";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, HelpCircle } from "lucide-react";

export const ConfirmModal: React.FC = () => {
  const { confirmDialog, closeConfirm } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  if (!confirmDialog || !confirmDialog.isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await confirmDialog.onConfirm();
      closeConfirm();
    } catch {
      // Handled in caller
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    confirmDialog.onCancel?.();
    closeConfirm();
  };

  return (
    <Modal isOpen={confirmDialog.isOpen} onClose={handleCancel} maxWidth="sm">
      <div className="space-y-4 text-center">
        <div
          className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
            confirmDialog.isDangerous
              ? "bg-rose-50 text-rose-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {confirmDialog.isDangerous ? (
            <AlertTriangle className="w-7 h-7" />
          ) : (
            <HelpCircle className="w-7 h-7" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900">{confirmDialog.title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{confirmDialog.message}</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant={confirmDialog.isDangerous ? "danger" : "primary"}
            className="flex-1"
            isLoading={isLoading}
            onClick={handleConfirm}
          >
            {confirmDialog.confirmText || "تأكيد"}
          </Button>

          <Button
            variant="outline"
            className="flex-1"
            disabled={isLoading}
            onClick={handleCancel}
          >
            {confirmDialog.cancelText || "إلغاء"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
