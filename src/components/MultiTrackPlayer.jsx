// File: components/MultiTrackPlayer.jsx
import React, { useState, useRef, useEffect } from 'react';

const MultiTrackPlayer = ({ stems, originalFile, fileName, audioAnalysis }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState({ vocals: 0.8, drums: 0.6, bass: 0.7, other: 0.5 });
  const [muted, setMuted] = useState({ vocals: false, drums: false, bass: false, other: false });
  const [solo, setSolo] = useState({ vocals: false, drums: false, bass: false, other: false });
  const [isLoaded, setIsLoaded] = useState(false);

  const audioRefs = useRef({});
  const intervalRef = useRef(null);
  const animationRef = useRef(null);

  // Use real analysis data with fallbacks
  const audioData = audioAnalysis || {
    bpm: 106,
    key: 'A♭ Major',
    tempo_description: 'Moderato',
    energy: 65.0,
    brightness: 1800.0,
    duration: 252.0
  };

  // LoopLytic theme colors
  const trackConfig = {
    vocals: { 
      color: '#00F5A0',
      icon: '🎤', 
      label: 'Vocals', 
      bgColor: 'rgba(0, 245, 160, 0.1)',
      borderColor: 'rgba(0, 245, 160, 0.3)'
    },
    drums: { 
      color: '#00D9FF',
      icon: '🥁', 
      label: 'Drums', 
      bgColor: 'rgba(0, 217, 255, 0.1)',
      borderColor: 'rgba(0, 217, 255, 0.3)'
    },
    bass: { 
      color: '#C77DFF',
      icon: '🎸', 
      label: 'Bass', 
      bgColor: 'rgba(199, 125, 255, 0.1)',
      borderColor: 'rgba(199, 125, 255, 0.3)'
    },
    other: { 
      color: '#FF6B6B',
      icon: '🎵', 
      label: 'Other', 
      bgColor: 'rgba(255, 107, 107, 0.1)',
      borderColor: 'rgba(255, 107, 107, 0.3)'
    }
  };

  // Download Icon SVG Component
  const DownloadIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>
  );

  useEffect(() => {
    initializeAudio();
    return () => cleanupAudio();
  }, [stems]);

  // Debug: Log currentTime changes
  useEffect(() => {
    console.log(`⏰ Current Time: ${currentTime.toFixed(2)}s`, isPlaying ? '▶️' : '⏸️');
  }, [currentTime, isPlaying]);

  const initializeAudio = async () => {
    try {
      console.log('🎵 Initializing audio with stems:', stems);
      
      const loadPromises = Object.entries(stems).map(async ([stemType, src]) => {
        const fullUrl = src.startsWith('http') ? src : `http://localhost:5001${src}`;
        console.log(`Loading ${stemType} from: ${fullUrl}`);
        
        const audio = new Audio(fullUrl);
        audio.preload = 'auto';
        audio.volume = volume[stemType];
        audio.crossOrigin = "anonymous";
        
        return new Promise((resolve) => {
          const onCanPlay = () => {
            audioRefs.current[stemType] = audio;
            if (stemType === 'vocals' && audio.duration && !duration) {
              setDuration(audio.duration);
              console.log(`Duration set: ${audio.duration}s`);
            }
            console.log(`✅ ${stemType} loaded successfully`);
            resolve();
          };
          
          const onError = (e) => {
            console.error(`❌ Failed to load ${stemType}:`, e);
            resolve();
          };

          audio.addEventListener('canplaythrough', onCanPlay);
          audio.addEventListener('error', onError);
          
          setTimeout(() => {
            if (!audioRefs.current[stemType]) {
              console.warn(`⚠️ ${stemType} loading timeout`);
              resolve();
            }
          }, 10000);
        });
      });

      await Promise.all(loadPromises);
      
      const loadedCount = Object.keys(audioRefs.current).length;
      console.log(`🎉 ${loadedCount}/${Object.keys(stems).length} tracks loaded`);
      
      if (loadedCount > 0) {
        setIsLoaded(true);
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      setIsLoaded(true);
    }
  };

  const cleanupAudio = () => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const syncAllTracks = () => {
    const masterTime = currentTime;
    Object.values(audioRefs.current).forEach(audio => {
      if (audio && Math.abs(audio.currentTime - masterTime) > 0.1) {
        audio.currentTime = masterTime;
      }
    });
  };

  const playAllTracks = async () => {
    if (!isLoaded) return;

    try {
      syncAllTracks();
      
      const validAudios = Object.values(audioRefs.current).filter(audio => audio);
      
      if (validAudios.length === 0) {
        console.warn('No valid audio tracks to play');
        return;
      }

      const playPromises = validAudios.map(audio => {
        return audio.play().catch(error => {
          console.warn('Play failed for audio track:', error);
          return null;
        });
      });

      await Promise.allSettled(playPromises);
      setIsPlaying(true);
      startTimeTracking();
      
      console.log('🎵 Playback started - tracking enabled');
    } catch (error) {
      console.error('Play error:', error);
    }
  };

  const pauseAllTracks = () => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause();
      }
    });
    setIsPlaying(false);
    stopTimeTracking();
    console.log('⏸️ Playback paused - tracking disabled');
  };

  // FIXED: Enhanced time tracking with requestAnimationFrame for smoother updates
  const startTimeTracking = () => {
    console.log('⏰ Starting time tracking...');
    
    // Clear any existing trackers
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Use both setInterval for reliability and requestAnimationFrame for smooth animation
    intervalRef.current = setInterval(() => {
      const firstAudio = Object.values(audioRefs.current).find(audio => audio);
      if (firstAudio && !firstAudio.paused && !firstAudio.ended) {
        setCurrentTime(firstAudio.currentTime);
        
        if (firstAudio.currentTime >= firstAudio.duration - 0.1) {
          pauseAllTracks();
          setCurrentTime(0);
          Object.values(audioRefs.current).forEach(audio => {
            if (audio) audio.currentTime = 0;
          });
        }
      }
    }, 50); // Update every 50ms for smoother animation

    // Additional smooth animation frame
    const updateAnimation = () => {
      if (isPlaying) {
        const firstAudio = Object.values(audioRefs.current).find(audio => audio);
        if (firstAudio && !firstAudio.paused) {
          setCurrentTime(firstAudio.currentTime);
        }
        animationRef.current = requestAnimationFrame(updateAnimation);
      }
    };
    animationRef.current = requestAnimationFrame(updateAnimation);
  };

  const stopTimeTracking = () => {
    console.log('⏹️ Stopping time tracking...');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const togglePlay = () => {
    console.log(`🎮 Toggle play - currently: ${isPlaying ? 'playing' : 'paused'}`);
    if (isPlaying) {
      pauseAllTracks();
    } else {
      playAllTracks();
    }
  };

  const handleVolumeChange = (stemType, newVolume) => {
    setVolume(prev => ({ ...prev, [stemType]: newVolume }));
    
    const audio = audioRefs.current[stemType];
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const toggleMute = (stemType) => {
    setMuted(prev => {
      const newMuted = { ...prev, [stemType]: !prev[stemType] };
      
      const audio = audioRefs.current[stemType];
      if (audio) {
        audio.muted = newMuted[stemType];
      }
      
      return newMuted;
    });
  };

  const toggleSolo = (stemType) => {
    setSolo(prev => {
      const newSolo = { ...prev, [stemType]: !prev[stemType] };
      const anySolo = Object.values(newSolo).some(isSolo => isSolo);
      
      Object.entries(audioRefs.current).forEach(([type, audio]) => {
        if (audio) {
          if (anySolo) {
            audio.muted = !newSolo[type];
          } else {
            audio.muted = muted[type];
          }
        }
      });
      
      return newSolo;
    });
  };

  const handleSeek = (e) => {
    if (duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const progress = clickX / rect.width;
      const seekTime = progress * duration;
      
      console.log(`🎯 Seeking to: ${seekTime.toFixed(2)}s (${(progress * 100).toFixed(1)}%)`);
      
      setCurrentTime(seekTime);
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.currentTime = seekTime;
        }
      });
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Download individual stem
  const downloadStem = (stemType) => {
    const stemUrl = stems[stemType];
    if (stemUrl) {
      const link = document.createElement('a');
      link.href = `http://localhost:5001${stemUrl}`;
      link.download = `${fileName?.replace('.mp3', '') || 'stem'}_${stemType}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`⬇️ Downloading ${stemType} stem...`);
    }
  };

  // Download all stems
  const downloadAllStems = () => {
    Object.keys(stems).forEach((stemType, index) => {
      setTimeout(() => downloadStem(stemType), 100 * index);
    });
  };

  // ENHANCED ANIMATED WAVEFORM WITH REAL-TIME UPDATES
  const generateLiveWaveform = () => {
    const bars = [];
    const barCount = 80;
    const progress = duration > 0 ? currentTime / duration : 0;
    const playheadPosition = progress * barCount;
    
    // Real-time animation timestamp for smooth movement
    const now = Date.now();
    
    for (let i = 0; i < barCount; i++) {
      // Generate smoother, more predictable heights
      const baseHeight = Math.sin(i * 0.15) * 16 + Math.cos(i * 0.08) * 12 + 30;
      
      // Enhanced animation with multiple frequencies for liveliness
      const animation1 = isPlaying ? Math.sin(now * 0.003 + i * 0.1) * 3 : 0;
      const animation2 = isPlaying ? Math.cos(now * 0.005 + i * 0.2) * 2 : 0;
      const height = Math.max(8, baseHeight + animation1 + animation2);
      
      const isActive = i < playheadPosition;
      const isNearPlayhead = Math.abs(i - playheadPosition) < 2;
      const isPast = i < (playheadPosition - 3);
      
      bars.push(
        <div
          key={i}
          className="transition-all duration-100 ease-out"
          style={{
            height: `${height}px`,
            width: '3px',
            marginRight: '1px',
            background: isPast 
              ? 'linear-gradient(to top, rgba(0, 245, 160, 0.5), rgba(0, 217, 255, 0.3))' 
              : isActive 
                ? 'linear-gradient(to top, rgba(0, 245, 160, 1), rgba(0, 217, 255, 0.8))' 
                : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            opacity: isPast ? 0.6 : isActive ? 1 : 0.3,
            transform: isNearPlayhead && isPlaying ? `scaleY(${1.2 + Math.sin(now * 0.01 + i) * 0.1}) scaleX(1.3)` : 'scaleY(1)',
            boxShadow: isNearPlayhead && isPlaying ? '0 0 8px rgba(0, 245, 160, 0.5)' : 'none'
          }}
        />
      );
    }
    
    return (
      <div className="relative flex items-center justify-center">
        {bars}
        {/* LIVE MOVING PLAYHEAD */}
        <div 
          className="absolute top-0 bottom-0 pointer-events-none z-20"
          style={{
            left: `${(progress * 100)}%`,
            width: '3px',
            background: 'linear-gradient(to bottom, rgba(0, 245, 160, 1), rgba(0, 217, 255, 0.9))',
            borderRadius: '2px',
            boxShadow: `
              0 0 10px rgba(0, 245, 160, 1), 
              0 0 20px rgba(0, 245, 160, 0.6),
              0 0 30px rgba(0, 245, 160, 0.3)
            `,
            opacity: 1,
            transform: `translateX(-50%) scaleX(${isPlaying ? 1.5 : 1})`,
            transition: 'left 0.1s ease-out, transform 0.2s ease'
          }}
        >
          {/* Animated playhead indicator */}
          <div 
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-lg"
            style={{
              boxShadow: '0 0 12px rgba(0, 245, 160, 0.8)',
              animation: isPlaying ? 'bounce 1s infinite' : 'none'
            }}
          ></div>
        </div>
      </div>
    );
  };

  if (!isLoaded) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-center border border-slate-700">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="animate-spin w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
          <span className="text-white text-lg font-medium">Loading tracks...</span>
        </div>
        <div className="text-slate-400 text-sm">Preparing zero-latency playback</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
      {/* Header with Live Timer */}
      <div className="p-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="text-3xl">🎵</div>
              </div>
              {isPlaying && (
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
              )}
            </div>
            
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">
                {fileName?.replace('.mp3', '') || 'Untitled Track'}
              </h1>
              <div className="flex items-center space-x-4 text-slate-400 mt-2 text-sm">
                <span className="font-medium">{audioData.bpm} BPM</span>
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                <span>{audioData.key}</span>
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                <span>{audioData.tempo_description}</span>
              </div>
            </div>
          </div>

          {/* LIVE TIMER & PLAY BUTTON */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-3xl font-mono text-white font-bold">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-slate-400 font-mono">
                / {formatTime(duration)}
              </div>
              {isPlaying && (
                <div className="flex items-center space-x-1 mt-1 justify-end">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">LIVE</span>
                </div>
              )}
            </div>

            <button
              onClick={togglePlay}
              disabled={!isLoaded}
              className="group relative w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-900 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-400/30"
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* LIVE ANIMATED WAVEFORM */}
        <div className="mb-6">
          <div 
            className="relative flex items-center justify-center h-24 bg-gradient-to-r from-slate-800/40 via-slate-700/30 to-slate-800/40 rounded-xl cursor-pointer group hover:bg-slate-700/40 transition-all duration-300 p-6 overflow-hidden"
            onClick={handleSeek}
          >
            {generateLiveWaveform()}
            
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="mt-4">
            <div 
              className="h-2 bg-slate-700/50 rounded-full cursor-pointer group relative overflow-hidden"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full relative overflow-hidden"
                style={{ 
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                  transition: 'width 0.1s ease-out'
                }}
              >
                {/* Moving progress glow */}
                {isPlaying && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3 text-xs">
              <span className="font-mono text-cyan-400 bg-slate-800/50 px-3 py-1 rounded-full">
                {formatTime(currentTime)}
              </span>
              <div className="flex items-center space-x-2 text-slate-500">
                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>Click to seek • Live playback</span>
              </div>
              <span className="font-mono text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Track Controls */}
      <div className="px-8 pb-8 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">Individual Tracks</h3>
          <button
            onClick={downloadAllStems}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-400/25"
          >
            <DownloadIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Download All</span>
          </button>
        </div>

        {Object.entries(stems).map(([stemType, src]) => {
          const config = trackConfig[stemType] || trackConfig.vocals;
          const hasAudio = audioRefs.current[stemType];
          
          return (
            <div 
              key={stemType} 
              className="group p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
              style={{ borderLeftColor: config.color, borderLeftWidth: '3px' }}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 w-24">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                    style={{ 
                      backgroundColor: config.bgColor,
                      color: config.color,
                      border: `1px solid ${config.color}30`
                    }}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{config.label}</div>
                    <div className={`text-xs ${hasAudio ? 'text-green-400' : 'text-red-400'}`}>
                      {hasAudio ? '●' : '○'} {hasAudio ? 'Ready' : 'Error'}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => toggleMute(stemType)}
                    disabled={!hasAudio}
                    className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center text-sm font-bold ${
                      !hasAudio ? 'opacity-30 cursor-not-allowed' :
                      muted[stemType]
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
                    }`}
                  >
                    M
                  </button>
                  
                  <button
                    onClick={() => toggleSolo(stemType)}
                    disabled={!hasAudio}
                    className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center text-sm font-bold ${
                      !hasAudio ? 'opacity-30 cursor-not-allowed' :
                      solo[stemType]
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' 
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
                    }`}
                  >
                    S
                  </button>

                  <button
                    onClick={() => downloadStem(stemType)}
                    disabled={!hasAudio}
                    className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center group relative ${
                      !hasAudio 
                        ? 'opacity-30 cursor-not-allowed bg-slate-700/30' 
                        : 'hover:shadow-lg hover:scale-105'
                    }`}
                    style={{ 
                      background: hasAudio ? config.color : 'rgba(100, 116, 139, 0.3)',
                      color: hasAudio ? '#0F172A' : '#64748B'
                    }}
                  >
                    <DownloadIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume[stemType]}
                      onChange={(e) => handleVolumeChange(stemType, parseFloat(e.target.value))}
                      disabled={!hasAudio}
                      className="w-full h-1 rounded-full appearance-none cursor-pointer bg-slate-700/50"
                      style={{
                        background: hasAudio 
                          ? `linear-gradient(to right, ${config.color}80 0%, ${config.color} ${volume[stemType] * 100}%, rgba(71, 85, 105, 0.3) ${volume[stemType] * 100}%, rgba(71, 85, 105, 0.3) 100%)`
                          : 'rgba(71, 85, 105, 0.2)',
                      }}
                    />
                  </div>
                  
                  <div className="text-right w-12">
                    <span className="text-xs font-medium text-slate-300 bg-slate-800/30 px-2 py-1 rounded">
                      {Math.round(volume[stemType] * 100)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 bg-slate-800/30 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span>LoopLytic AI • Live Playback • Real-Time Analysis</span>
          </div>
          <div>
            {audioData.energy}% Energy • {formatTime(audioData.duration)}
          </div>
        </div>
      </div>

      {/* Enhanced Animation Styles */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) translateX(-50%);
          }
          40% {
            transform: translateY(-4px) translateX(-50%);
          }
          60% {
            transform: translateY(-2px) translateX(-50%);
          }
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff, #f1f5f9);
          cursor: pointer;
          box-shadow: 
            0 2px 4px rgba(0,0,0,0.2),
            0 0 0 1px rgba(255,255,255,0.1);
          transition: all 0.2s ease;
        }
        
        input[type="range"]:hover::-webkit-slider-thumb {
          transform: scale(1.2);
          box-shadow: 
            0 4px 8px rgba(0,0,0,0.3),
            0 0 0 2px rgba(0, 245, 160, 0.4),
            0 0 12px rgba(0, 245, 160, 0.3);
        }
      `}</style>
    </div>
  );
};

export default MultiTrackPlayer;
