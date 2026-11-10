"use client";
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { FaPlay } from "react-icons/fa";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function LectureVideoPreviewModal({ previewUrl }) {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger className="primaryBg flex items-center gap-2 text-white px-4 py-2 rounded-md">
                <FaPlay className="h-3 w-3" /> {t("preview")}
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl overflow-hidden p-0 rounded-md border-none">
                <DialogHeader className="p-4 hidden">
                    <DialogTitle>{t("preview")}</DialogTitle>
                </DialogHeader>
                <div className="aspect-video w-full bg-black flex items-center justify-center">
                    <video src={previewUrl} controls className="w-full h-full" autoPlay />
                </div>
            </DialogContent>
        </Dialog>
    );
}
