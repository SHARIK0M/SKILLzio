import { useEffect } from "react";
import Swal from "sweetalert2";

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  message,
  title = "CONFIRM ACTION",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (isOpen) {
      Swal.fire({
        title,
        text: message,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        confirmButtonColor: "#6366f1",
        cancelButtonColor: "#6b7280",
        background: "#1a1a1a",
        color: "#fff",
      }).then((result) => {
        if (result.isConfirmed) {
          onConfirm();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          onCancel();
        }
      });
    }
  }, [isOpen, message, title, confirmText, cancelText, onConfirm, onCancel]);

  return null; // ✅ No UI, SweetAlert handles the popup
};

export default ConfirmationModal;
