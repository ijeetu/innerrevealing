"use client"
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FaPlay } from 'react-icons/fa';
import { PreviewVideo } from '@/utils/api/user/getCourse';
import ReactPlayer from 'react-player';
import { useTranslation } from '@/hooks/useTranslation';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { CurrentPreviewVideo } from '../instructor/courses/types';

interface CoursePreviewModalProps {
    previewVideos?: PreviewVideo[];
    lesson?: unknown; // Keep for backward compatibility
    isOpen?: boolean;
    onClose?: () => void;
    CourseCurriculum?: boolean;
    currentPreviewVideo?: CurrentPreviewVideo;
}

const CoursePreviewModal: React.FC<CoursePreviewModalProps> = ({
    previewVideos = [],
    isOpen,
    onClose,
    CourseCurriculum,
    currentPreviewVideo
}) => {
    const [selectedVideo, setSelectedVideo] = useState<PreviewVideo | null>(null);
    const [showIntroVideo, setShowIntroVideo] = useState(true); // Track if intro video should be shown

    const { t } = useTranslation();

    // Find intro video and free preview videos
    const introVideo = previewVideos.find(video => video.type === 'intro');
    const freePreviewVideos = previewVideos.filter(video => video.free_preview === true && video.type === 'lecture');

    useEffect(() => {
        if (isOpen) {
            // Reset to show intro video first when modal opens
            setShowIntroVideo(true);
            setSelectedVideo(null);
        }
    }, [isOpen]);

    // handle video selection
    const handleVideoSelect = (video: PreviewVideo) => {
        setSelectedVideo(video);
        setShowIntroVideo(false); // Switch to preview videos when selecting a video
    }

    // handle intro video selection
    const handleIntroVideoSelect = () => {
        setShowIntroVideo(true);
        setSelectedVideo(null);
    }

    // Determine the current video URL
    const rawVideoUrl = CourseCurriculum && currentPreviewVideo
        ? (currentPreviewVideo?.file_url || (currentPreviewVideo?.file && currentPreviewVideo?.file !== "null" ? currentPreviewVideo.file : "") || currentPreviewVideo?.youtube_url)
        : (showIntroVideo ? (introVideo?.video || introVideo?.file_url) : (selectedVideo?.file_url || selectedVideo?.video));

    const videoUrl = rawVideoUrl || "";

    // Check if the file is a document that needs Google Viewer (PDF, Doc, etc.)
    const isGoogleViewerNeeded = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].some(ext =>
        videoUrl.toLowerCase().endsWith(ext)
    );

    // Use Google Docs Viewer for supported docs, otherwise use direct file URL
    const iframeSrc = isGoogleViewerNeeded
        ? `https://docs.google.com/gview?url=${encodeURIComponent(videoUrl)}&embedded=true`
        : videoUrl;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {CourseCurriculum && (
                <DialogTrigger className='w-[67px] h-[26px] rounded-[4px] py-1 px-2 text-[14px] font-normal primaryColor primaryLightBg flex items-center justify-center'>
                    {t("preview")}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[650px] md:max-w-[700px] lg:max-w-[650px] p-0 rounded-lg overflow-hidden bg-white  [&>.ring-offset-background]:!bg-[#F8F8F9] [&>.ring-offset-background]:!p-2 [&>.ring-offset-background]:!text-[#A2A2A5] [&>.ring-offset-background]:!opacity-100 [&>.ring-offset-background]:rounded-[8px] [&>.ring-offset-background]:border [&>.ring-offset-background]:borderColor [&>.ring-offset-background]:!text-lg">
                <div className="relative">
                    <DialogHeader className="p-4 border-b border-[#D8E0E6]">
                        <div className="flex justify-between items-center">
                            <DialogTitle className="text-base font-medium">
                                {CourseCurriculum ? (
                                    <p className='text-[16px] text-[#010211] font-normal text-left'>{t("lecture_preview")}</p>
                                ) : (
                                    <p className='text-[16px] text-[#010211] font-normal text-left'>{t("course_preview")}</p>
                                )}
                                {/* Current video title */}
                                {currentPreviewVideo ? (
                                    <p className="text-lg font-medium text-left">
                                        {CourseCurriculum
                                            ? currentPreviewVideo?.title : t("course_introduction")
                                        }
                                    </p>
                                ) : (
                                    <p className="text-lg font-medium text-left">
                                        {showIntroVideo
                                            ? introVideo?.title || t("course_introduction")
                                            : selectedVideo ? selectedVideo.title : freePreviewVideos[0]?.title
                                        }
                                    </p>
                                )}

                            </DialogTitle>
                        </div>
                    </DialogHeader>

                    <div className="p-4">

                        {/* Video Player */}
                        <div className="relative w-full aspect-video mb-6">
                            {isGoogleViewerNeeded ? (
                                <iframe
                                    src={iframeSrc}
                                    className='w-full h-full rounded-lg'
                                    frameBorder="0"
                                    allowFullScreen
                                    title="Document Viewer"
                                />
                            ) : (
                                <ReactPlayer
                                    width="320"
                                    height="240"
                                    controls
                                    src={videoUrl}
                                    className='w-full h-full rounded-lg'
                                />
                            )}
                        </div>

                        {/* Video Options */}
                        {!CourseCurriculum && (
                            <div>
                                <h3 className="font-medium mb-4">
                                    {/* Preview Videos ({freePreviewVideos.length + (introVideo ? 1 : 0)}) */}
                                    {t("more_free_previews")}
                                </h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {/* Intro Video Option */}
                                    {introVideo && (
                                        <div
                                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${showIntroVideo
                                                ? 'bg-blue-50 border border-blue-200'
                                                : 'hover:bg-gray-50'
                                                }`}
                                            onClick={handleIntroVideoSelect}
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-20 h-14 bg-gray-300 rounded shrink-0 flex items-center justify-center overflow-hidden">
                                                {introVideo.thumbnail ? (
                                                    <img
                                                        src={introVideo.thumbnail}
                                                        alt={introVideo.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FaPlay className="text-gray-600" size={16} />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1 ">
                                                    <FaPlay className="text-black rtl:rotate-180" size={12} />
                                                    <span className="text-sm font-medium">{introVideo.title}</span>
                                                </div>
                                                <p className="text-xs text-gray-400">{t("course_introduction")}</p>
                                            </div>

                                            {/* Active indicator */}
                                            {showIntroVideo && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
                                            )}
                                        </div>
                                    )}

                                    {/* Free Preview Videos */}
                                    {freePreviewVideos.map((video, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${selectedVideo?.title === video.title
                                                ? 'bg-blue-50 border border-blue-200'
                                                : 'hover:bg-gray-50'
                                                }`}
                                            onClick={() => handleVideoSelect(video)}
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-20 h-14 bg-gray-300 rounded shrink-0 flex items-center justify-center overflow-hidden">
                                                {video.thumbnail ? (
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FaPlay className="text-gray-600" size={16} />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FaPlay className="text-black rtl:rotate-180" size={12} />
                                                    <span className="text-sm font-medium">{video.title}</span>
                                                </div>
                                                {/* {video.chapter_title && (
                                                <p className="text-xs text-gray-400">{video.chapter_title}</p>
                                            )} */}
                                            </div>

                                            {/* Active indicator */}
                                            {selectedVideo?.title === video.title && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    )
}

export default CoursePreviewModal