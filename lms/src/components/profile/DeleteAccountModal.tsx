"use client";

import React from "react";
// Import shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { useTranslation } from '@/hooks/useTranslation';  

interface DeleteAccountModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onOpenChange,
  onConfirm
}) => {
  const { t } = useTranslation();

  return (
    // Use the Dialog component as the root
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* DialogContent contains the modal's visible part */}
      <DialogContent className="sm:max-w-md bg-white">
        {/* DialogHeader can be used for a title, though not in the original image */}
        <DialogHeader>
          {/* Add DialogTitle wrapped in VisuallyHidden for accessibility */}
          <VisuallyHidden>
            <DialogTitle>{t("confirm_account_deletion")}</DialogTitle>
          </VisuallyHidden>
          {/* DialogDescription holds the main text content */}
          <DialogDescription className="text-center text-gray-800 text-base md:text-lg pt-4 font-semibold">
            {t("delete_account_permanent_warning")}
          </DialogDescription>
        </DialogHeader>

        {/* DialogFooter typically holds action buttons */}
        <DialogFooter className="sm:justify-center gap-4 pt-4">
          {/* Confirm Button */}
          <Button
            type="button"
            variant="destructive" // Use destructive variant for delete actions
            onClick={onConfirm}
            className="px-6 py-2 rounded-[5px]" // Keep custom padding/rounding if needed
          >
            {t("yes")}
          </Button>
          {/* Cancel Button using DialogClose */}
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline" // Use outline variant for cancel
              className="px-6 py-2 rounded-[5px]" // Keep custom padding/rounding if needed
            >
              {t("cancel")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountModal;
