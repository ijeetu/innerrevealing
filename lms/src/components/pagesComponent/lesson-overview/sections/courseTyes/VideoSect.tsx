'use client'
import React, { useEffect, useState, useRef, useMemo } from 'react'
import ReactPlayer from 'react-player'
import MuxPlayer from '@mux/mux-player-react'
import type MuxPlayerElement from '@mux/mux-player'
import { useDispatch, useSelector } from 'react-redux'
import { previouslyCompletedCurriculumsIdsSelector, selectedCurriculumItemSelector, setIsCurriculumItemCompleted } from '@/redux/reducers/helpersReducer'
import { settingsSelector } from '@/redux/reducers/settingsSlice'
import { tokenSelector } from '@/redux/reducers/userSlice'
import HlsPlayer from '@/components/commonComp/HlsPlayer'

const VideoSect = () => {
  const dispatch = useDispatch();
  const selectedCurriculumItem = useSelector(selectedCurriculumItemSelector);
  const settings = useSelector(settingsSelector);
  const previouslyCompletedCurriculumsIds = useSelector(previouslyCompletedCurriculumsIdsSelector);
  const bearerToken = useSelector(tokenSelector);
  const isIdIncludes = previouslyCompletedCurriculumsIds?.includes(selectedCurriculumItem?.id as number)
  const primaryColor = settings?.data?.system_color;

  const [progress, setProgress] = useState(0);
  const [hlsManifestUrl, setHlsManifestUrl] = useState<string | null>(null);
  const youtubePlayerRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<MuxPlayerElement | null>(null);
  const hasDispatchedCompletion = useRef(false);

  const handleTimeUpdate = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.currentTime;
      const duration = playerRef.current.duration;

      if (duration > 0) {
        const currentProgress = (currentTime / duration) * 100;
        setProgress(Number(currentProgress.toFixed(0)));
      }
    }
  }

  const handleYoutubeTimeUpdate = () => {
    if (youtubePlayerRef.current) {
      const currentTime = youtubePlayerRef.current.currentTime;
      const duration = youtubePlayerRef.current.duration;

      if (duration > 0) {
        const currentProgress = (currentTime / duration) * 100;
        setProgress(Number(currentProgress.toFixed(0)));
      }
    }
  }

  useEffect(() => {
    hasDispatchedCompletion.current = false;
  }, [selectedCurriculumItem?.id]);

  useEffect(() => {
    if (!isIdIncludes && progress >= 90 && !hasDispatchedCompletion.current) {
      hasDispatchedCompletion.current = true;
      dispatch(setIsCurriculumItemCompleted({ completed: true }));
    }
  }, [progress]);

  // Get the raw data from the curriculum item
  const videoUrl = selectedCurriculumItem?.youtube_url ||
    selectedCurriculumItem?.url ||
    selectedCurriculumItem?.file_url || '';

  const fileType = selectedCurriculumItem?.file_type;
  // youtube video
  // NOTE:Change the fileType to 'yt' for youtube video
  // const isYoutubeUrl = fileType === 'yt' && selectedCurriculumItem?.file_url;
  const checkYoutubeUrl = (url: string): boolean => {
    const regex = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i;
    return regex.test(url);
  };

  const isYoutubeUrl = !!selectedCurriculumItem?.file_url && checkYoutubeUrl(videoUrl);
  // hls video
  const isHls = fileType === 'hls' && selectedCurriculumItem?.file_url;

  // document 
  const isDocument = fileType === 'doc' && selectedCurriculumItem?.file_url;


  useEffect(() => {
    if (isHls && videoUrl && bearerToken) {
      setHlsManifestUrl(null);

      fetch(videoUrl, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Accept': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.data?.manifest_url) {
            setHlsManifestUrl(data.data.manifest_url);
          }
        })
        .catch(err => console.error("Error fetching HLS manifest:", err));
    }
  }, [isHls, videoUrl, bearerToken]);


  // Check if the file is a document that needs Google Viewer (PDF, Doc, etc.)
  const isGoogleViewerNeeded = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].some(ext =>
    videoUrl.toLowerCase().endsWith(ext)
  );

  // Use Google Docs Viewer for supported docs, otherwise use direct file URL
  const iframeSrc = isGoogleViewerNeeded
    ? `https://docs.google.com/gview?url=${encodeURIComponent(videoUrl)}&embedded=true`
    : videoUrl;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isGoogleViewerNeeded && !isIdIncludes && !hasDispatchedCompletion.current) {
      timer = setTimeout(() => {
        setProgress(100);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isGoogleViewerNeeded, isIdIncludes]);


  return (
    <div className="relative aspect-video w-full min-h-[356px] sm:min-h-[486px] md:min-h-[686px] customScrollbar">
      {
        // for youtube video
        isYoutubeUrl ? (
          <ReactPlayer
            controls
            src={videoUrl}
            className='w-full h-full rounded-lg'
            ref={youtubePlayerRef}
            onTimeUpdate={handleYoutubeTimeUpdate}
          />
        ) : isHls ? (
          hlsManifestUrl ? (
            <HlsPlayer
              src={hlsManifestUrl}
              ref={youtubePlayerRef}
              className='w-full h-full'
              onTimeUpdate={handleYoutubeTimeUpdate}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )
        ) :
          // if any doc then show in this
          isGoogleViewerNeeded ? (
            <iframe
              src={iframeSrc}
              className='w-full h-full'
              frameBorder="0"
              allowFullScreen
              title="Document Viewer"
            />
          ) :
            // For Simple Video
            (
              <MuxPlayer
                ref={playerRef}
                src={videoUrl}
                className='w-full h-full rounded-lg'
                onTimeUpdate={handleTimeUpdate}
                style={{ width: '100%', height: '100%' }}
                accent-color={primaryColor}
              />
            )
      }
    </div>
  )
}

export default VideoSect