import { motion } from 'framer-motion'
import { FolderOpen, X, Shield, AlertCircle } from 'lucide-react'

interface FolderModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function FolderModal({ isOpen, onClose, onConfirm }: FolderModalProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6 mx-4 max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FolderOpen className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Seleccionar Carpeta</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <p className="text-gray-300 text-sm">
            Para acceder a tus archivos multimedia, necesitamos permisos para leer la carpeta que selecciones.
          </p>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-blue-400 font-medium text-sm">Tus datos están seguros</h4>
                <p className="text-blue-300/80 text-xs mt-1">
                  Los archivos nunca salen de tu dispositivo. Todo el procesamiento es local.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-yellow-400/80 text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>Selecciona una carpeta que contenga imágenes, videos o audio</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors border border-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Seleccionar Carpeta
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}