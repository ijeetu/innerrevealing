"use client";


import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose, // Import DialogClose for the Cancel button
} from "@/components/ui/dialog"; // Assuming Shadcn UI components are in this path
import { Button } from "@/components/ui/button"; // Corrected: Use default import for Shadcn Button
import { useTranslation } from '@/hooks/useTranslation';

// Define the props for the LogoutModal component
interface LogoutModalProps {
  isOpen: boolean; // Controls whether the modal is visible
  onClose: () => void; // Function to call when the modal should be closed
  onConfirm: () => void; // Function to call when the logout is confirmed
}

/**
 * A modal component using Shadcn UI to confirm user logout.
 * Displays a message and provides "Yes" and "Cancel" options.
 */
const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  // Handler for when the open state changes (e.g., clicking overlay, escape key)
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose(); // Call the onClose prop when the dialog tries to close
    }
  };

  // Handler for the confirm button click
  const handleConfirmClick = () => {
    onConfirm(); // Execute the confirmation action
    // Note: onClose is not called here directly; the Dialog's state change handles closing
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] border gap-0">
        <DialogHeader>
          {/* Centered title */}
          <DialogTitle className="text-center text-lg sm:text-xl flex p-4">
            {t("are_you_sure_you_want_to_log_out")}
          </DialogTitle>
          {/* Shadcn Dialog doesn't have a built-in description prop used here, 
              but you could add <DialogDescription> if needed. */}
        </DialogHeader>
        {/* DialogFooter typically used for action buttons */}
        <DialogFooter className="sm:justify-center gap-2 pt-4">
          {" "}
          {/* Center buttons on larger screens, add gap, add padding top */}
          {/* Confirm Button */}
          <Button
            type="button"
            onClick={handleConfirmClick}
            className="primaryBg text-white "
          // Using a Shadcn variant that matches the desired purple color,
          // you might need to customize your theme or use a specific className
          // For now, using the default variant which is often primary colored.
          // className="bg-[#6B46C1] hover:bg-[#5A3E9C]" // Example direct styling if needed
          >
            {t("yes")}
          </Button>
          {/* Cancel Button - Uses DialogClose for simplicity */}
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("cancel")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutModal;
