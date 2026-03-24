import React, { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { ThumbsUp, ThumbsDown, Flag, Share2, Maximize2, Minimize2, Play, Pause, Volume2, VolumeX, Settings, MonitorPlay } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VideoPlayerProps {
  videoId: string;
  youtubeId: string;
  title: string;
  likes: number;
  dislikes: number;
  onReport: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, youtubeId, title, likes: initialLikes, dislikes: initialDislikes, onReport }) => {
  const [user] = useAuthState(auth);
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userAction, setUserAction] = useState<'like' | 'dislike' | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    setIsPlaying(event.data === YouTube.PlayerState.PLAYING);
  };

  const togglePlay = () => {
    if (isPlaying) player.pauseVideo();
    else player.playVideo();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    player.setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      player.unMute();
      player.setVolume(volume || 50);
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    player.seekTo(time);
    setCurrentTime(time);
  };

  const handleRateChange = (rate: number) => {
    player.setPlaybackRate(rate);
    setPlaybackRate(rate);
  };

  const togglePip = async () => {
    try {
      const videoElement = document.querySelector('iframe');
      if (videoElement && (videoElement as any).requestPictureInPicture) {
        await (videoElement as any).requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP failed:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (player && isPlaying) {
        setCurrentTime(player.getCurrentTime());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [player, isPlaying]);

  const handleLike = async () => {
    if (!user) return;
    const videoRef = doc(db, 'videos', videoId);
    try {
      if (userAction === 'like') {
        await updateDoc(videoRef, { likes: increment(-1) });
        setLikes(prev => prev - 1);
        setUserAction(null);
      } else {
        await updateDoc(videoRef, { 
          likes: increment(1),
          dislikes: userAction === 'dislike' ? increment(-1) : increment(0)
        });
        setLikes(prev => prev + 1);
        if (userAction === 'dislike') setDislikes(prev => prev - 1);
        setUserAction('like');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `videos/${videoId}`);
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    const videoRef = doc(db, 'videos', videoId);
    try {
      if (userAction === 'dislike') {
        await updateDoc(videoRef, { dislikes: increment(-1) });
        setDislikes(prev => prev - 1);
        setUserAction(null);
      } else {
        await updateDoc(videoRef, { 
          dislikes: increment(1),
          likes: userAction === 'like' ? increment(-1) : increment(0)
        });
        setDislikes(prev => prev + 1);
        if (userAction === 'like') setLikes(prev => prev - 1);
        setUserAction('dislike');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `videos/${videoId}`);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl group relative">
      <div className="aspect-video relative">
        <YouTube
          videoId={youtubeId}
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 0,
              controls: 0,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
            },
          }}
          onReady={onPlayerReady}
          onStateChange={onStateChange}
          className="w-full h-full"
        />

        {/* Custom Controls Overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 flex flex-col justify-end p-6",
            showControls ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          {/* Progress Bar */}
          <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-6 group/progress cursor-pointer">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            {/* Heatmap Simulation */}
            <div className="absolute top-0 left-0 w-full h-full flex gap-0.5 opacity-30 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-white" 
                  style={{ height: `${Math.random() * 100}%`, alignSelf: 'flex-end' }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-6">
              <button onClick={togglePlay} className="hover:scale-110 transition-transform">
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>
              
              <div className="flex items-center gap-3 group/volume">
                <button onClick={toggleMute}>
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-24 transition-all duration-300 h-1 bg-white/30 rounded-full accent-white"
                />
              </div>

              <span className="text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative group/rate">
                <button className="text-sm font-bold bg-white/10 px-2 py-1 rounded hover:bg-white/20">
                  {playbackRate}x
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 backdrop-blur-md rounded-lg p-2 hidden group-hover/rate:block border border-white/10">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                    <button
                      key={rate}
                      onClick={() => handleRateChange(rate)}
                      className={cn(
                        "block w-full text-left px-4 py-1.5 text-xs rounded hover:bg-white/10",
                        playbackRate === rate ? "text-blue-400 font-bold" : "text-white"
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={togglePip} className="hover:text-blue-400 transition-colors">
                <MonitorPlay className="w-5 h-5" />
              </button>
              
              <button className="hover:text-blue-400 transition-colors">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info & Engagement */}
      <div className="p-6 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <button 
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  userAction === 'like' ? "bg-blue-500 text-white shadow-lg" : "hover:bg-gray-200 text-gray-700"
                )}
              >
                <ThumbsUp className={cn("w-5 h-5", userAction === 'like' && "fill-current")} />
                <span className="text-sm font-bold">{likes}</span>
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button 
                onClick={handleDislike}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  userAction === 'dislike' ? "bg-red-500 text-white shadow-lg" : "hover:bg-gray-200 text-gray-700"
                )}
              >
                <ThumbsDown className={cn("w-5 h-5", userAction === 'dislike' && "fill-current")} />
                <span className="text-sm font-bold">{dislikes}</span>
              </button>
            </div>

            <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            
            <button 
              onClick={onReport}
              className="p-3 rounded-full bg-gray-100 hover:bg-red-50 text-red-500 transition-colors group/report"
            >
              <Flag className="w-5 h-5 group-hover/report:fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
