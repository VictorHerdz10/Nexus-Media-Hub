import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface AudioPlayerProps {
  src: string
  file: File
}

export function AudioPlayer({ src, file }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnd = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnd)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnd)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = previousVolume
      setVolume(previousVolume)
    } else {
      setPreviousVolume(volume)
      audio.volume = 0
      setVolume(0)
    }
    setIsMuted(!isMuted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    audio.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    if (newVolume > 0) {
      setPreviousVolume(newVolume)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const truncateFileName = (name: string, maxLength: number = 25) => {
    if (name.length <= maxLength) return name
    const extension = name.split('.').pop()
    const nameWithoutExt = name.slice(0, -(extension?.length || 0) - 1)
    const truncatedName = nameWithoutExt.slice(0, maxLength - 3 - (extension?.length || 0))
    return `${truncatedName}...${extension}`
  }

  const displayName = truncateFileName(file.name)

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <audio ref={audioRef} src={src} />

      {/* Header con animación */}
      <div className="text-center mb-4 w-full">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span className="text-2xl">🎵</span>
        </div>
        
        {/* Nombre con animación continua */}
        <div className="relative overflow-hidden mb-2 max-w-full h-6">
          {file.name.length > 25 ? (
            <div className="animate-marquee-infinite whitespace-nowrap">
              {file.name}
            </div>
          ) : (
            <div className="font-semibold text-sm truncate px-4">
              {displayName}
            </div>
          )}
        </div>
        
        <p className="text-gray-400 text-xs">
          {formatTime(currentTime)} / {formatTime(duration || 0)}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs mb-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-6 mb-4">
        <button
          onClick={togglePlay}
          className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full hover:from-purple-600 hover:to-blue-700 transition-all shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-center space-x-3 w-full max-w-xs">
        <button
          onClick={toggleMute}
          className="p-1 hover:bg-gray-700/50 rounded transition-colors"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-gray-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-gray-400" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  )
}