interface MetadataPanelProps {
  file: File
}

export function MetadataPanel({ file }: MetadataPanelProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const truncateFileName = (name: string, maxLength: number = 68) => {
    if (name.length <= maxLength) return name
    const extension = name.split('.').pop()
    const nameWithoutExt = name.slice(0, -(extension?.length || 0) - 1)
    const truncatedName = nameWithoutExt.slice(0, maxLength - 3 - (extension?.length || 0))
    return `${truncatedName}...${extension}`
  }

  const displayName = truncateFileName(file.name)

  return (
    <div className="glass-effect rounded-xl p-4">
      <h3 className="text-md font-semibold mb-3">Información del Archivo</h3>
      <div className="grid grid-cols-1 gap-3 text-sm">
        <div className="break-words">
          <span className="text-gray-400 block text-xs mb-1">Nombre:</span>
          <p className="font-medium text-sm truncate" title={file.name}>
            {displayName}
          </p>
        </div>
        <div className="break-words">
          <span className="text-gray-400 block text-xs mb-1">Tipo:</span>
          <p className="font-medium text-sm">{file.type || 'Desconocido'}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-gray-400 block text-xs mb-1">Tamaño:</span>
            <p className="font-medium text-sm">{formatFileSize(file.size)}</p>
          </div>
          <div>
            <span className="text-gray-400 block text-xs mb-1">Modificado:</span>
            <p className="font-medium text-sm">
              {new Date(file.lastModified).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}