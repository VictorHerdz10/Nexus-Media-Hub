import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

interface CustomVideoPlayerProps {
  src: string
  file: File
}

export function CustomVideoPlayer({ src, file }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(1)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Configurar event listeners
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = () => setIsLoading(false)

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)

    // Configurar el src después de que el video esté listo
    video.src = src
    video.load()

    return () => {
      // Limpiar event listeners
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      
      // Pausar y resetear el video al desmontar
      video.pause()
      video.src = ''
      video.load()
    }
  }, [src])

  const togglePlay = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (isPlaying) {
        video.pause()
      } else {
        // Esperar a que el video esté listo para reproducir
        if (video.readyState < 3) {
          await video.play()
        } else {
          video.play()
        }
      }
    } catch (error) {
      console.error('Error al reproducir el video:', error)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = previousVolume
      setVolume(previousVolume)
    } else {
      setPreviousVolume(volume)
      video.volume = 0
      setVolume(0)
    }
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = parseFloat(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    if (newVolume > 0) {
      setPreviousVolume(newVolume)
    }
  }

  const handleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (video.requestFullscreen) {
      video.requestFullscreen()
    }
  }

  const truncateFileName = (name: string, maxLength: number = 35) => {
    if (name.length <= maxLength) return name
    const extension = name.split('.').pop()
    const nameWithoutExt = name.slice(0, -(extension?.length || 0) - 1)
    const truncatedName = nameWithoutExt.slice(0, maxLength - 3 - (extension?.length || 0))
    return `${truncatedName}...${extension}`
  }

  const displayName = truncateFileName(file.name)

  return (
    <div className="w-full h-full flex flex-col">
      {/* Video Container */}
      <div 
        className="flex-1 relative bg-black rounded-lg overflow-hidden"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          controls={false}
          preload="metadata"
        >
          Tu navegador no soporta el elemento video.
        </video>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Custom Controls Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex items-center justify-between">
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              disabled={isLoading}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleMute}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <button 
                onClick={handleFullscreen}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Play/Pause Overlay Center */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="p-6 bg-black/50 rounded-full hover:bg-black/70 transition-all backdrop-blur-sm"
              disabled={isLoading}
            >
              <Play className="w-12 h-12 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Información del video */}
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-300 font-medium truncate px-4">
          {displayName}
        </p>
        <p className="text-xs text-gray-400">
          {Math.round(file.size / (1024 * 1024))} MB • {file.type.split('/')[1]?.toUpperCase()}
        </p>
      </div>
    </div>
  )
}