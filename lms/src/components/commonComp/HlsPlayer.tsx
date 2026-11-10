"use client";
import { useEffect, useRef, forwardRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { useSelector } from "react-redux";
import { tokenSelector } from "@/redux/reducers/userSlice";
import {
    Play,
    Pause,
    Rewind,
    FastForward,
    Volume2,
    VolumeX,
    Maximize,
    Minimize
} from "lucide-react";

type Props = {
    src: string;
    onTimeUpdate?: React.ReactEventHandler<HTMLVideoElement>;
    className?: string;
};

const HlsPlayer = forwardRef<HTMLVideoElement, Props>(({ src, onTimeUpdate, className }, ref) => {
    const internalRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const volumeBarRef = useRef<HTMLDivElement>(null);
    const token = useSelector(tokenSelector);

    // State for video controls
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [isVolumeDragging, setIsVolumeDragging] = useState(false);

    // Hide controls after 3 seconds of inactivity
    useEffect(() => {
        if (!isPlaying) return;

        const timer = setTimeout(() => {
            setShowControls(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [isPlaying, currentTime]);

    // Format time helper function
    const formatTime = (seconds: number): string => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Handle play/pause
    const handlePlayPause = useCallback(() => {
        const video = internalRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
        setShowControls(true);
    }, []);

    // Handle fast rewind 10 seconds
    const handleRewind = useCallback(() => {
        const video = internalRef.current;
        if (!video) return;
        video.currentTime = Math.max(0, video.currentTime - 10);
        setShowControls(true);
    }, []);

    // Handle fast forward 10 seconds
    const handleForward = useCallback(() => {
        const video = internalRef.current;
        if (!video) return;
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        setShowControls(true);
    }, []);

    // Handle volume change
    const handleVolumeChange = useCallback((newVolume: number) => {
        const video = internalRef.current;
        if (!video) return;
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        video.volume = clampedVolume;
        setVolume(clampedVolume);
        setIsMuted(clampedVolume === 0);
        setShowControls(true);
    }, []);

    // Handle mute toggle
    const handleMuteToggle = useCallback(() => {
        const video = internalRef.current;
        if (!video) return;
        if (isMuted) {
            video.volume = volume > 0 ? volume : 0.5;
            setVolume(video.volume);
            setIsMuted(false);
        } else {
            video.volume = 0;
            setIsMuted(true);
        }
        setShowControls(true);
    }, [isMuted, volume]);

    // Handle playback speed change
    const handlePlaybackRateChange = useCallback(() => {
        const video = internalRef.current;
        if (!video) return;
        const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        const currentIndex = rates.indexOf(playbackRate);
        const nextIndex = (currentIndex + 1) % rates.length;
        const newRate = rates[nextIndex];
        video.playbackRate = newRate;
        setPlaybackRate(newRate);
        setShowControls(true);
    }, [playbackRate]);

    // Handle fullscreen toggle
    const handleFullscreen = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        if (!isFullscreen) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        setShowControls(true);
    }, [isFullscreen]);

    // Handle progress bar click/drag
    const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const video = internalRef.current;
        const progressBar = progressBarRef.current;
        if (!video || !progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        video.currentTime = percent * video.duration;
        setCurrentTime(video.currentTime);
        setShowControls(true);
    }, []);

    // Handle progress bar drag
    const handleProgressDrag = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        const video = internalRef.current;
        const progressBar = progressBarRef.current;
        if (!video || !progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        video.currentTime = percent * video.duration;
        setCurrentTime(video.currentTime);
    }, [isDragging]);

    // Handle volume bar click/drag
    const handleVolumeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const volumeBar = volumeBarRef.current;
        if (!volumeBar) return;

        const rect = volumeBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        handleVolumeChange(percent);
    }, [handleVolumeChange]);

    // Handle volume bar drag
    const handleVolumeDrag = useCallback((e: MouseEvent) => {
        if (!isVolumeDragging) return;
        const volumeBar = volumeBarRef.current;
        if (!volumeBar) return;

        const rect = volumeBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        handleVolumeChange(percent);
    }, [isVolumeDragging, handleVolumeChange]);

    // Add global mouse move and mouse up handlers for dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleProgressDrag);
            document.addEventListener("mouseup", () => setIsDragging(false));
        }
        return () => {
            document.removeEventListener("mousemove", handleProgressDrag);
        };
    }, [isDragging, handleProgressDrag]);

    useEffect(() => {
        if (isVolumeDragging) {
            document.addEventListener("mousemove", handleVolumeDrag);
            document.addEventListener("mouseup", () => setIsVolumeDragging(false));
        }
        return () => {
            document.removeEventListener("mousemove", handleVolumeDrag);
        };
    }, [isVolumeDragging, handleVolumeDrag]);

    // Update current time
    const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        if (!isDragging) {
            setCurrentTime(video.currentTime);
        }
        if (onTimeUpdate) {
            onTimeUpdate(e);
        }
    }, [isDragging, onTimeUpdate]);

    // Handle video loaded metadata
    const handleLoadedMetadata = useCallback(() => {
        const video = internalRef.current;
        if (!video) return;
        setDuration(video.duration);
    }, []);

    // Handle video play/pause events
    useEffect(() => {
        const video = internalRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleVolumeChange = () => {
            setVolume(video.volume);
            setIsMuted(video.muted || video.volume === 0);
        };

        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("volumechange", handleVolumeChange);

        return () => {
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("volumechange", handleVolumeChange);
        };
    }, []);

    // Handle fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    // Initialize HLS
    useEffect(() => {
        const video = internalRef.current;
        if (!video) return;
        if (!src) return;

        console.log("HlsPlayer initializing. Src:", src, "Token present:", !!token);

        if (Hls.isSupported()) {
            const hls = new Hls({
                xhrSetup: function (xhr) {
                    if (token) {
                        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                    }
                },
            });

            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.ERROR, function (event, data) {
                console.error("HLS Error details:", data);
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error("fatal network error encountered, try to recover");
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error("fatal media error encountered, try to recover");
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                }
            });

            return () => {
                hls.destroy();
            };
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Safari support
            video.src = src;
        }
    }, [src, token]);

    // Calculate progress percentage
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className={`relative w-full group ${className || ''}`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => {
                if (isPlaying) {
                    setTimeout(() => setShowControls(false), 2000);
                }
            }}
            onMouseMove={() => setShowControls(true)}
        >
            {/* Video element */}
            <video
                ref={(node) => {
                    internalRef.current = node;
                    if (typeof ref === "function") { 
                        ref(node);
                    } else if (ref) {
                        ref.current = node;
                    }
                }}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={handlePlayPause}
            />

            {/* Custom Controls Overlay */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-[#00000091] transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
                    }`}
            >
                {/* Progress Bar */}
                <div
                    ref={progressBarRef}
                    className="h-1 w-full bg-white cursor-pointer relative group/progress"
                    onClick={handleProgressClick}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                >
                    <div
                        className="h-full transition-all duration-150"
                        style={{
                            width: `${progressPercent}%`,
                            backgroundColor: "var(--primary-color, #5a5bb5)",
                        }}
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover/progress:opacity-100 transition-opacity"
                        style={{
                            left: `${progressPercent}%`,
                            transform: "translate(-50%, -50%)",
                        }}
                    />
                </div>

                {/* Control Bar */}
                <div className="flex items-center justify-between px-4 py-2 gap-4">
                    {/* Left Controls: Play, Rewind, Forward, Time */}
                    <div className="flex items-center gap-4 text-white">
                        {/* Play/Pause Button */}
                        <button
                            onClick={handlePlayPause}
                            className="p-1 hover:opacity-80 transition-opacity"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5" />
                            ) : (
                                <Play className="w-5 h-5" />
                            )}
                        </button>

                        {/* Rewind 10s Button */}
                        <button
                            onClick={handleRewind}
                            className="p-1 hover:opacity-80 transition-opacity relative"
                            aria-label="Rewind 10 seconds"
                        >
                            <Rewind className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 text-[10px] font-semibold">10</span>
                        </button>

                        {/* Forward 10s Button */}
                        <button
                            onClick={handleForward}
                            className="p-1 hover:opacity-80 transition-opacity relative"
                            aria-label="Forward 10 seconds"
                        >
                            <FastForward className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 text-[10px] font-semibold">10</span>
                        </button>

                        {/* Time Display */}
                        <span className="text-sm font-medium min-w-[80px]">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right Controls: Volume, Speed, Fullscreen */}
                    <div className="flex items-center gap-3 text-white">
                        {/* Volume Control */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleMuteToggle}
                                className="p-1 hover:opacity-80 transition-opacity"
                                aria-label={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="w-5 h-5" />
                                ) : (
                                    <Volume2 className="w-5 h-5" />
                                )}
                            </button>
                            <div
                                ref={volumeBarRef}
                                className="w-20 h-1 bg-gray-600 rounded-full cursor-pointer relative group/volume"
                                onClick={handleVolumeClick}
                                onMouseDown={() => setIsVolumeDragging(true)}
                                onMouseUp={() => setIsVolumeDragging(false)}
                                onMouseLeave={() => setIsVolumeDragging(false)}
                            >
                                <div
                                    className="h-full rounded-full transition-all duration-150 bg-white"
                                    style={{
                                        width: `${(isMuted ? 0 : volume) * 100}%`,
                                    }}
                                />
                                <div
                                    className="absolute top-[8px] -translate-y-1/2 w-2.5 h-2.5 rounded-full primaryBg border-2 p-1 transition-opacity"
                                    style={{
                                        left: `${(isMuted ? 0 : volume) * 100}%`,
                                        transform: "translate(-50%, -50%)",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Playback Speed */}
                        <button
                            onClick={handlePlaybackRateChange}
                            className="px-2 py-1 text-sm font-medium hover:opacity-80 transition-opacity"
                            aria-label="Change playback speed"
                        >
                            {playbackRate}x
                        </button>

                        {/* Fullscreen Button */}
                        <button
                            onClick={handleFullscreen}
                            className="p-1 hover:opacity-80 transition-opacity"
                            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        >
                            {isFullscreen ? (
                                <Minimize className="w-5 h-5" />
                            ) : (
                                <Maximize className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

HlsPlayer.displayName = "HlsPlayer";

export default HlsPlayer;

