import { useState, useRef, useEffect } from 'react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface ImageViewerProps {
  src: string
  file: File
}

export function ImageViewer({ src, file }: ImageViewerProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [initialScale, setInitialScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Obtener dimensiones reales de la imagen cuando carga y calcular escala inicial
  const handleImageLoad = () => {
    if (imageRef.current && containerRef.current) {
      const img = imageRef.current
      const container = containerRef.current
      
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      })

      // Calcular la escala inicial para que la imagen quepa completamente en el contenedor
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      const imageWidth = img.naturalWidth
      const imageHeight = img.naturalHeight

      // Calcular la escala que hace que la imagen quepa completamente
      const scaleX = containerWidth / imageWidth
      const scaleY = containerHeight / imageHeight
      const minScale = Math.min(scaleX, scaleY) // Escala para que quepa completamente

      setInitialScale(minScale)
      setScale(minScale)
      setPosition({ x: 0, y: 0 }) // Centrar la imagen
    }
  }

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.1, 3) // Incrementos más pequeños
    setScale(newScale)
  }

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.1, initialScale * 0.1) // Permite reducir hasta 10% del tamaño inicial
    setScale(newScale)
    // Si volvemos a la escala inicial o menor, centrar la imagen
    if (newScale <= initialScale) {
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleReset = () => {
    setScale(initialScale)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
    // Resetear posición al rotar
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= initialScale) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= initialScale) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // Calcular límites basados en las dimensiones reales de la imagen y la escala actual
    if (containerRef.current && imageDimensions.width > 0) {
      const containerRect = containerRef.current.getBoundingClientRect()
      
      // Dimensiones escaladas de la imagen
      const scaledWidth = imageDimensions.width * scale
      const scaledHeight = imageDimensions.height * scale
      
      // Calcular cuánto podemos mover la imagen sin que se salga de los bordes
      // Los límites dependen de cuánto más grande es la imagen escalada que el contenedor
      const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2)
      const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2)

      // Solo permitir movimiento si la imagen escalada es más grande que el contenedor
      if (maxX > 0 || maxY > 0) {
        const boundedX = Math.max(Math.min(newX, maxX), -maxX)
        const boundedY = Math.max(Math.min(newY, maxY), -maxY)

        setPosition({
          x: boundedX,
          y: boundedY
        })
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.002 // Zoom más suave
    const newScale = Math.min(Math.max(scale + delta, initialScale * 0.1), 3)
    
    // Mantener la posición relativa al punto donde se hace zoom
    if (containerRef.current && scale > initialScale) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - containerRect.left - containerRect.width / 2
      const mouseY = e.clientY - containerRect.top - containerRect.height / 2
      
      const scaleFactor = newScale / scale
      setPosition({
        x: position.x * scaleFactor + mouseX * (1 - scaleFactor),
        y: position.y * scaleFactor + mouseY * (1 - scaleFactor)
      })
    }
    
    setScale(newScale)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && scale > initialScale) {
        const newX = e.clientX - dragStart.x
        const newY = e.clientY - dragStart.y

        if (containerRef.current && imageDimensions.width > 0) {
          const containerRect = containerRef.current.getBoundingClientRect()
          const scaledWidth = imageDimensions.width * scale
          const scaledHeight = imageDimensions.height * scale
          
          const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2)
          const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2)

          if (maxX > 0 || maxY > 0) {
            const boundedX = Math.max(Math.min(newX, maxX), -maxX)
            const boundedY = Math.max(Math.min(newY, maxY), -maxY)

            setPosition({
              x: boundedX,
              y: boundedY
            })
          }
        }
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('mousemove', handleGlobalMouseMove)

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDragging, dragStart, scale, initialScale, imageDimensions])

  const truncateFileName = (name: string, maxLength: number = 30) => {
    if (name.length <= maxLength) return name
    const extension = name.split('.').pop()
    const nameWithoutExt = name.slice(0, -(extension?.length || 0) - 1)
    const truncatedName = nameWithoutExt.slice(0, maxLength - 3 - (extension?.length || 0))
    return `${truncatedName}...${extension}`
  }

  const displayName = truncateFileName(file.name)

  // Calcular el porcentaje relativo a la escala inicial
  const relativeScalePercentage = Math.round((scale / initialScale) * 100)

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controles */}
      <div className="flex items-center justify-center space-x-3 mb-4 p-2 bg-gray-800/50 rounded-lg">
        <button
          onClick={handleZoomOut}
          className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
          title="Zoom Out"
          disabled={scale <= initialScale * 0.1}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
          title="Zoom In"
          disabled={scale >= 3}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleRotate}
          className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
          title="Rotar 90°"
        >
          <span className="text-sm font-medium">↻</span>
        </button>
        <span className="text-sm text-gray-400 px-2">
          {relativeScalePercentage}%
        </span>
        <span className="text-xs text-gray-500 truncate max-w-[120px]">
          {displayName}
        </span>
      </div>

      {/* Contenedor de la imagen */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-gray-900/20 rounded-lg"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor: scale > initialScale ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
      >
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <img
            ref={imageRef}
            src={src}
            alt={file.name}
            className="max-w-none max-h-none transition-all duration-200 select-none"
            style={{ 
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              objectFit: 'contain'
            }}
            onMouseDown={handleMouseDown}
            onLoad={handleImageLoad}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>

        {/* Indicador de que se puede desplazar */}
        {scale > initialScale && !isDragging && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            Click y arrastra para explorar
          </div>
        )}
      </div>

      {/* Información de dimensiones */}
      {imageDimensions.width > 0 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            {imageDimensions.width} × {imageDimensions.height} px • {Math.round(file.size / 1024)} KB
            {initialScale < 1 && ` • Escala inicial: ${Math.round(initialScale * 100)}%`}
          </p>
        </div>
      )}
    </div>
  )
}