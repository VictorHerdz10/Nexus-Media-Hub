/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion'
import { FileText, Image, Video, Music, Folder, FolderOpen } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { useState, useEffect, useRef } from 'react'

interface FileSystemItem {
  name: string
  kind: 'file' | 'directory'
  file?: File
  handle?: any
}

interface FileExplorerProps {
  files: FileSystemItem[]
  selectedFile: FileSystemItem | null
  onSelectFile: (item: FileSystemItem) => void
  onSelectFolder: () => void
  onOpenFolder: (folderHandle: any) => void
  isMobile?: boolean
}

export function FileExplorer({ files, selectedFile, onSelectFile, onSelectFolder, onOpenFolder, isMobile = false }: FileExplorerProps) {
  const { viewMode, itemSize } = useAppStore()
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null)
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map())
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  // Generar thumbnails para imágenes y videos
  useEffect(() => {
    const newThumbnails = new Map()
    const videoThumbnailPromises: Promise<{name: string, url: string}>[] = []

    files.forEach(item => {
      if (item.kind === 'file' && item.file) {
        if (item.file.type.startsWith('image/')) {
          // Para imágenes: crear URL directamente - FIXED
          const url = URL.createObjectURL(item.file)
          newThumbnails.set(item.name, url)
        } else if (item.file.type.startsWith('video/')) {
          // Para videos: generar thumbnail
          videoThumbnailPromises.push(generateVideoThumbnail(item.file, item.name))
        }
      }
    })

    // Primero establecer las imágenes inmediatamente
    if (newThumbnails.size > 0) {
      setThumbnails(prev => new Map([...prev, ...newThumbnails]))
    }

    // Luego procesar los videos
    if (videoThumbnailPromises.length > 0) {
      Promise.all(videoThumbnailPromises).then(results => {
        setThumbnails(prev => {
          const updated = new Map(prev)
          results.forEach(({name, url}) => {
            if (url) {
              updated.set(name, url)
            }
          })
          return updated
        })
      })
    }

    // Cleanup function
    return () => {
      newThumbnails.forEach(url => URL.revokeObjectURL(url))
    }
  }, [files])

  // Función para generar thumbnail de video
  const generateVideoThumbnail = (file: File, name: string): Promise<{name: string, url: string}> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      videoRefs.current.set(name, video)

      video.addEventListener('loadeddata', () => {
        // Intentar ir a un frame específico (ej: 1 segundo o 10% de la duración)
        const targetTime = video.duration > 0 ? Math.min(video.duration * 0.1, 1) : 0.5
        video.currentTime = targetTime
      })

      video.addEventListener('seeked', () => {
        if (context && video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              resolve({name, url})
            } else {
              resolve({name, url: ''})
            }
          }, 'image/jpeg', 0.8)
        } else {
          resolve({name, url: ''})
        }
      })

      video.addEventListener('error', () => {
        resolve({name, url: ''})
      })

      // Timeout de seguridad
      setTimeout(() => {
        if (!video.readyState) {
          resolve({name, url: ''})
        }
      }, 5000)

      // Configurar y cargar el video
      video.preload = 'metadata'
      video.src = URL.createObjectURL(file)
      video.load()
    })
  }

  const handleItemClick = (item: FileSystemItem) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout)
      setClickTimeout(null)
    }

    // En móvil: un solo clic abre carpetas inmediatamente
    if (isMobile && item.kind === 'directory' && item.handle) {
      onOpenFolder(item.handle)
      return
    }

    const timeout = setTimeout(() => {
      // Click simple - seleccionar
      onSelectFile(item)
    }, 200)

    setClickTimeout(timeout)
  }

  const handleItemDoubleClick = (item: FileSystemItem) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout)
      setClickTimeout(null)
    }

    // Doble click - abrir carpeta si es directorio (solo en desktop)
    if (!isMobile && item.kind === 'directory' && item.handle) {
      onOpenFolder(item.handle)
    }
  }

  const getFileIcon = (item: FileSystemItem) => {
    if (item.kind === 'directory') {
      return <Folder className="w-5 h-5 text-yellow-400" />
    }
    
    if (!item.file) return <FileText className="w-5 h-5 text-gray-400" />
    
    if (item.file.type.startsWith('image/')) return <Image className="w-5 h-5 text-green-400" />
    if (item.file.type.startsWith('video/')) return <Video className="w-5 h-5 text-blue-400" />
    if (item.file.type.startsWith('audio/')) return <Music className="w-5 h-5 text-purple-400" />
    return <FileText className="w-5 h-5 text-gray-400" />
  }

  const getThumbnail = (item: FileSystemItem) => {
    if (item.kind === 'directory') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-yellow-400/10 rounded-lg">
          <Folder className="w-8 h-8 text-yellow-400" />
        </div>
      )
    }

    if (!item.file) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-400/10 rounded-lg">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
      )
    }

    const thumbnailUrl = thumbnails.get(item.name)
    
    // IMÁGENES - FIXED: Mostrar thumbnail si existe
    if (item.file.type.startsWith('image/')) {
      if (thumbnailUrl) {
        return (
          <img 
            src={thumbnailUrl} 
            alt={item.name}
            className="w-full h-full object-cover rounded-lg"
          />
        )
      } else {
        // Mientras se carga, mostrar icono
        return (
          <div className="w-full h-full flex items-center justify-center bg-green-400/10 rounded-lg">
            <Image className="w-8 h-8 text-green-400" />
          </div>
        )
      }
    }

    // VIDEOS
    if (item.file.type.startsWith('video/')) {
      if (thumbnailUrl) {
        return (
          <div className="relative w-full h-full">
            <img 
              src={thumbnailUrl} 
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
          </div>
        )
      } else {
        // Mientras se carga el thumbnail, mostrar icono
        return (
          <div className="w-full h-full flex items-center justify-center bg-blue-400/10 rounded-lg">
            <Video className="w-8 h-8 text-blue-400" />
          </div>
        )
      }
    }

    if (item.file.type.startsWith('audio/')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-purple-400/10 rounded-lg">
          <Music className="w-8 h-8 text-purple-400" />
        </div>
      )
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-400/10 rounded-lg">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getSizeClasses = () => {
    switch (itemSize) {
      case 'small': return 'p-2 text-xs'
      case 'medium': return 'p-3 text-sm'
      case 'large': return 'p-4 text-base'
      default: return 'p-3 text-sm'
    }
  }

  const getGridClasses = () => {
    switch (itemSize) {
      case 'small': return 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2'
      case 'medium': return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3'
      case 'large': return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
      default: return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3'
    }
  }

  const getThumbnailSize = () => {
    switch (itemSize) {
      case 'small': return 'h-12'
      case 'medium': return 'h-20'
      case 'large': return 'h-28'
      default: return 'h-20'
    }
  }

  const getFolderHint = () => {
    return isMobile ? 'Tocar para abrir' : 'Doble clic para abrir'
  }

  const renderGridItem = (item: FileSystemItem, index: number) => (
    <motion.div
      key={`${item.name}-${index}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => handleItemClick(item)}
      onDoubleClick={() => handleItemDoubleClick(item)}
      className={`
        flex flex-col items-center text-center cursor-pointer rounded-2xl border-2 transition-all duration-300
        ${getSizeClasses()}
        ${
          selectedFile?.name === item.name 
            ? 'bg-blue-500/20 border-blue-400 scale-105' 
            : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-600/50 hover:border-gray-500/50 hover:scale-105'
        }
        ${item.kind === 'directory' ? 'cursor-pointer' : ''}
      `}
      title={item.kind === 'directory' ? getFolderHint() : item.name}
    >
      {/* Thumbnail para medium y large, icono para small */}
      <div className={`w-full ${getThumbnailSize()} mb-2 rounded-lg overflow-hidden`}>
        {itemSize === 'small' ? (
          <div className="w-full h-full flex items-center justify-center">
            {getFileIcon(item)}
          </div>
        ) : (
          getThumbnail(item)
        )}
      </div>
      
      <div className="w-full">
        <p className="font-medium truncate mb-1">{item.name}</p>
        {item.kind === 'file' && item.file && (
          <p className="text-gray-400 text-xs truncate">
            {formatFileSize(item.file.size)}
          </p>
        )}
        {item.kind === 'directory' && (
          <p className="text-yellow-400 text-xs">{isMobile ? 'Tocar para abrir' : 'Carpeta'}</p>
        )}
      </div>
    </motion.div>
  )

  const renderListItem = (item: FileSystemItem, index: number) => (
    <motion.div
      key={`${item.name}-${index}`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => handleItemClick(item)}
      onDoubleClick={() => handleItemDoubleClick(item)}
      className={`
        flex items-center space-x-3 cursor-pointer rounded-xl border transition-all duration-300
        ${getSizeClasses()}
        ${
          selectedFile?.name === item.name 
            ? 'bg-blue-500/20 border-blue-400' 
            : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-600/50 hover:border-gray-500/50'
        }
        ${item.kind === 'directory' ? 'cursor-pointer' : ''}
      `}
      title={item.kind === 'directory' ? getFolderHint() : item.name}
    >
      {/* Thumbnail para lista en medium y large */}
      <div className={`flex-shrink-0 ${itemSize === 'small' ? 'w-8 h-8' : 'w-12 h-12'} rounded-lg overflow-hidden`}>
        {itemSize === 'small' ? (
          <div className="w-full h-full flex items-center justify-center">
            {getFileIcon(item)}
          </div>
        ) : (
          getThumbnail(item)
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.name}</p>
        <div className="flex items-center space-x-2 text-gray-400 text-xs">
          {item.kind === 'file' && item.file && (
            <>
              <span>{formatFileSize(item.file.size)}</span>
              <span>•</span>
              <span>{item.file.type.split('/')[1]?.toUpperCase() || 'Archivo'}</span>
            </>
          )}
          {item.kind === 'directory' && (
            <span className="text-yellow-400">{isMobile ? 'Tocar para abrir carpeta' : 'Carpeta - Doble clic para abrir'}</span>
          )}
        </div>
      </div>
    </motion.div>
  )

  // Cleanup adicional para videos
  useEffect(() => {
    return () => {
      // Limpiar referencias de video
      videoRefs.current.forEach(video => {
        if (video.src) {
          URL.revokeObjectURL(video.src)
        }
      })
      videoRefs.current.clear()
      
      // Limpiar thumbnails
      thumbnails.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  return (
    <div className="h-full flex flex-col p-4 my-10">
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 pt-2 mb-10">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg mb-2">No hay archivos multimedia</p>
            <p className="text-center mb-4 text-sm">
              Selecciona una carpeta para comenzar a explorar tu contenido
            </p>
            <button
              onClick={onSelectFolder}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Abrir Carpeta
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className={`grid ${getGridClasses()}`}>
            {files.map((item, index) => renderGridItem(item, index))}
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((item, index) => renderListItem(item, index))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {files.length > 0 && (
        <div className="pt-4 border-t border-gray-700/50 text-xs text-gray-400">
          {files.length} elemento{files.length !== 1 ? 's' : ''} encontrado{files.length !== 1 ? 's' : ''}
          {files.some(f => f.kind === 'directory') && ` • ${isMobile ? 'Tocar' : 'Doble clic'} en carpetas para abrir`}
        </div>
      )}
    </div>
  )
}