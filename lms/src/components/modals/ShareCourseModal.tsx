"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FaFacebook, FaWhatsapp, FaCopy } from "react-icons/fa";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { BiShareAlt } from "react-icons/bi";
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton, XIcon } from 'react-share';

// Props interface for the ShareCourseModal component
interface ShareCourseModalProps {
    courseTitle?: string; // Optional course URL to share (defaults to example URL)
    courseSlug?: string;
}
const ShareCourseModal: React.FC<ShareCourseModalProps> = ({
    courseTitle,
    courseSlug,
}) => {

    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const courseUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/course-details/${courseSlug}`;


    // Handler for copying the course link to clipboard
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(courseUrl);
            toast.success(t('link_copied_to_clipboard'));
        } catch (err) {
            console.error("Failed to copy link: ", err);
            toast.error(t('failed_to_copy_link'));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center justify-center px-3 py-1.5 border border-white/30 rounded-md text-sm hover:bg-white/10">
                    <BiShareAlt className="mr-1" />
                    {t("share")}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-max bg-white overflow-hidden">
                {/* Modal Header */}
                <DialogHeader className="pb-4">
                    <DialogTitle className=" text-lg md:text-xl font-semibold">
                        {t('share_this_course')}
                    </DialogTitle>
                </DialogHeader>
                <hr className="borderColor w-[120%] -ml-[10%]" />

                {/* Social Share Buttons Section */}
                <div className="flex gap-3 pt-6 flex-wrap">

                    <FacebookShareButton
                        url={decodeURI(courseUrl)}
                        title={courseTitle}
                        className="flexCenter w-full bg-[#4267B21F] text-[#4267B2] font-semibold rounded-2xl h-[46px] md:w-[196px] md:h-[56px] gap-2"
                    >
                        <FaFacebook size={22} className="rounded-full" />
                        <span className="">{t('facebook')}</span>
                    </FacebookShareButton>
                    <TwitterShareButton
                        url={decodeURI(courseUrl)}
                        title={courseTitle}
                        className="flexCenter w-full bg-[#1818181F] text-black font-semibold rounded-2xl h-[46px] md:w-[196px] md:h-[56px] gap-2"
                    >
                        <XIcon size={22} className="rounded-full" />
                        <span className="">{t('x')}</span>
                    </TwitterShareButton>
                    <WhatsappShareButton
                        url={decodeURI(courseUrl)}
                        title={courseTitle}
                        className="flexCenter w-full bg-[#25D3661F] text-[#25D366] font-semibold rounded-2xl h-[46px] md:w-[196px] md:h-[56px] gap-2"
                    >
                        <FaWhatsapp size={22} className="rounded-full" />
                        <span className="">{t('whatsapp')}</span>
                    </WhatsappShareButton>
                </div>

                {/* Share Link Section */}
                <div className="pt-6 space-y-2">
                    <label className="text-sm font-medium text-gray-900">
                        {t('share_link')}
                    </label>
                    <div className="flex gap-0">
                        {/* Link Input Field */}
                        <Input
                            type="text"
                            value={courseUrl}
                            readOnly
                            className="flex-1 bg-gray-100 text-gray-600 rounded-l-md rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        {/* Copy Button */}
                        <button
                            type="button"
                            className="primaryBg text-white rounded-r-md rounded-l-none px-4 gap-2 border-l-0 flexCenter"
                            onClick={handleCopyLink}
                        >
                            <FaCopy size={22} />
                            <span className="">{t('copy')}</span>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareCourseModal;
