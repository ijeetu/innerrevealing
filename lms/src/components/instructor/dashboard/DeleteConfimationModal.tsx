"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
    isPending?: boolean;
    error?: string;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    onOpenChange,
    isPending = false,
    error,
}: DeleteConfirmationModalProps) {
    const { t } = useTranslation();
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[390px] px-4 text-center gap-0 [&_.closeBtn]:hidden">
                {/* <DialogHeader> */}
                <DialogTitle className="text-base font-semibold text-[#010211] text-center">
                    {t("are_you_sure_you_want_to_delete_this_course_this_action_cannot_be_undone")}
                </DialogTitle>
                {/* </DialogHeader> */}
                {error && <p role="alert" className="text-sm text-red-700 mt-4">{error}</p>}
                <DialogFooter className="flex justify-center gap-3 sm:justify-center mt-6">
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isPending}
                        className="bg-[#DB3D26] text-white px-4 py-1 text-base rounded-md h-12 min-w-[100px]"
                    >
                        {isPending ? "Deleting…" : t("yes")}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isPending}
                        className="border-gray-200 text-gray-500 px-4 py-1 text-base rounded-md h-12 min-w-[100px]"
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}