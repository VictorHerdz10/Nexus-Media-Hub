/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { PreviewPanel } from './PreviewPanel'
import { useAppStore } from '../../stores/appStore'
import { useEffect, useState } from 'react'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  selectedFile: any
}

export function PreviewModal({ isOpen, onClose, selectedFile }: PreviewModalProps) {
  const { files } = useAppStore()
  const [, setWindowHeight] = useState(window.innerHeight)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight)
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1024

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-700/50 w-full max-w-6xl flex flex-col overflow-hidden
          ${isMobile ? 'h-[95vh]' : 'h-[90vh]'}
          ${isTablet ? 'max-w-5xl' : ''}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header compacto */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700/50 flex-shrink-0 bg-gray-900/80 backdrop-blur-sm">
          <h3 className="text-sm sm:text-lg font-semibold text-white truncate flex-1 mr-2">
            {selectedFile?.name || 'Vista Previa'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </button>
        </div>

        {/* Content - Prioridad al archivo multimedia */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className={`flex-1 overflow-hidden ${isMobile ? 'min-h-0' : ''}`}>
            <PreviewPanel 
              selectedFile={selectedFile} 
              files={files}
            />
          </div>
        </div>

        {/* Footer minimalista solo en móvil */}
        {isMobile && (
          <div className="flex-shrink-0 p-2 border-t border-gray-700/50 bg-gray-900/80">
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}