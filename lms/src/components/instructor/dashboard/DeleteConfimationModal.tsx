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
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    onOpenChange,
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
                <DialogFooter className="flex justify-center gap-3 sm:justify-center mt-6">
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="bg-[#DB3D26] text-white px-4 py-1 text-base rounded-md h-12 min-w-[100px]"
                    >
                        {t("yes")}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-200 text-gray-500 px-4 py-1 text-base rounded-md h-12 min-w-[100px]"
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}