import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CustomVideoPlayer } from '../MediaPlayer/CustomVideoPlayer'
import { ImageViewer } from '../MediaPlayer/ImageViewer'
import { AudioPlayer } from '../MediaPlayer/AudioPlayer'
import { MetadataPanel } from './MetadataPanel'
import { useAppStore } from '../../stores/appStore'

interface PreviewPanelProps {
  selectedFile: File | null
  files: File[]
}
  const truncateFileName = (name: string, maxLength: number = 45) => {
    if (name.length <= maxLength) return name
    const extension = name.split('.').pop()
    const nameWithoutExt = name.slice(0, -(extension?.length || 0) - 1)
    const truncatedName = nameWithoutExt.slice(0, maxLength - 3 - (extension?.length || 0))
    return `${truncatedName}...${extension}`
  }


export function PreviewPanel({ selectedFile, files }: PreviewPanelProps) {
  const [objectUrl, setObjectUrl] = useState<string>('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const { selectedFileSystemItem, setSelectedFile, setSelectedFileSystemItem } = useAppStore()

  // Encontrar el índice actual cuando cambia el archivo seleccionado
  useEffect(() => {
    if (selectedFile && files.length > 0) {
      const index = files.findIndex(file => file.name === selectedFile.name)
      if (index !== -1) {
        setCurrentIndex(index)
      }
    }
  }, [selectedFile, files])

  // Actualizar object URL cuando cambia el archivo
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setObjectUrl(url)

      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setObjectUrl('')
    }
  }, [selectedFile])

  const navigateToFile = (direction: 'prev' | 'next') => {
    if (files.length === 0) return

    let newIndex
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : files.length - 1
    } else {
      newIndex = currentIndex < files.length - 1 ? currentIndex + 1 : 0
    }

    setCurrentIndex(newIndex)
    const newFile = files[newIndex]
    setSelectedFile(newFile)
    
    // Actualizar también el FileSystemItem seleccionado
    if (selectedFileSystemItem) {
      const newFileSystemItem = {
        ...selectedFileSystemItem,
        file: newFile,
        name: newFile.name
      }
      setSelectedFileSystemItem(newFileSystemItem)
    }
  }

  const renderMedia = () => {
    if (!selectedFile || !objectUrl) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500 p-4">
          <div className="text-center">
            <p className="text-lg">Selecciona un archivo para previsualizar</p>
          </div>
        </div>
      )
    }

    if (selectedFile.type.startsWith('video/')) {
      return (
        <CustomVideoPlayer src={objectUrl} file={selectedFile} />
      )
    }

    if (selectedFile.type.startsWith('image/')) {
      return (
        <ImageViewer src={objectUrl} file={selectedFile} />
      )
    }

    if (selectedFile.type.startsWith('audio/')) {
      return (
        <AudioPlayer src={objectUrl} file={selectedFile} />
      )
    }

    return (
      <div className="flex items-center justify-center h-48 text-gray-500 p-4">
        <div className="text-center">
          <p className="text-lg">Formato no soportado</p>
          <p className="text-sm">Tipo: {selectedFile.type}</p>
        </div>
      </div>
    )
  }

  if (!selectedFile) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Selecciona un archivo para previsualizar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header con navegación */}
      <div className="flex-shrink-0 border-b border-gray-700/50 p-4 bg-gray-800/30">
        <div className="flex items-center justify-between my-2">
          <button
            onClick={() => navigateToFile('prev')}
            className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={files.length <= 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center flex-1 mx-4">
            <div className="text-sm font-medium text-gray-300 mb-1">
              {currentIndex + 1} / {files.length}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {truncateFileName(selectedFile.name)}
            </div>
          </div>

          <button
            onClick={() => navigateToFile('next')}
            className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={files.length <= 1}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Media Preview - Sin altura fija para mejor ajuste */}
      <div className="flex-1 min-h-0 overflow-hidden bg-gray-900/20">
        <div className="h-full flex items-center justify-center p-4">
          {renderMedia()}
        </div>
      </div>

      {/* Metadata - Se ajusta al espacio disponible */}
      <div className="flex-shrink-0 border-t border-gray-700/50">
        <div className="p-4">
          <MetadataPanel file={selectedFile} />
        </div>
      </div>
    </div>
  )
}