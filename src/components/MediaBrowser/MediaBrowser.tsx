/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import {
  Home,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Image,
  Music,
  Grid3X3,
  List,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
} from "lucide-react";
import { FileExplorer } from "../FileExplorer/FileExplorer";
import { PreviewPanel } from "../PreviewPanel/PreviewPanel";
import { PreviewModal } from "../PreviewPanel/PreviewModal";
import { FolderModal } from "../FolderModal/FolderModal";
import { useAppStore } from "../../stores/appStore";
import { useFileSystem } from "../../hooks/useFileSystem";
import { useState, useEffect, useCallback } from "react";

interface MediaBrowserProps {
  onBackToLanding: () => void;
}

export function MediaBrowser({ onBackToLanding }: MediaBrowserProps) {
  const {
    currentFolder,
    fileSystemItems,
    selectedFileSystemItem,
    showPreview,
    viewMode,
    itemSize,
    setSelectedFile,
    setSelectedFileSystemItem,
    setShowPreview,
    setViewMode,
    setItemSize,
    setFileSystemItems,
    setCurrentFolder,
  } = useAppStore();

  const { selectFolder, loadDirectoryContents, navigateToFolder } =
    useFileSystem();
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [folderHistory, setFolderHistory] = useState<any[]>([]);

  // Detectar si es móvil
  const isMobile = windowWidth < 768;

  // Actualizar tamaño de ventana
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

useEffect(() => {
  const loadFolder = async () => {
    if (currentFolder) {
      setIsLoading(true);
      try {
        
        // Si no tenemos handle, mostrar mensaje para seleccionar carpeta
        if (!currentFolder.handle) {
          setFileSystemItems([]);
          return;
        }
        const items = await loadDirectoryContents(currentFolder.handle);
        setFileSystemItems(items);
      } catch (error) {
        console.error("💥 Error loading folder:", error);
        // Si hay error, limpiar caché corrupto
        localStorage.removeItem('nexus-current-folder');
        localStorage.removeItem('nexus-cache-timestamp');
        setCurrentFolder(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setFileSystemItems([]);
    }
  };

  loadFolder();
}, [currentFolder]);

  const handleSelectFolder = () => {
    setShowFolderModal(true);
  };

  const handleFolderSelected = async () => {
    setIsLoading(true);
    try {
      await selectFolder();
      setFolderHistory([]); // Reiniciar historial al seleccionar nueva carpeta
    } catch (error) {
      console.error("Error selecting folder:", error);
    } finally {
      setIsLoading(false);
      setShowFolderModal(false);
    }
  };

  const handleOpenFolder = async (folderHandle: any) => {
    setIsLoading(true);
    try {
      // Agregar carpeta actual al historial
      if (currentFolder) {
        setFolderHistory((prev) => [...prev, currentFolder]);
      }

      const items = await navigateToFolder(folderHandle);
      setFileSystemItems(items);
      setSelectedFileSystemItem(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error opening folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = async () => {
    if (folderHistory.length > 0) {
      setIsLoading(true);
      try {
        const previousFolder = folderHistory[folderHistory.length - 1];
        const items = await loadDirectoryContents(previousFolder.handle);
        setFileSystemItems(items);
        setCurrentFolder(previousFolder);
        setFolderHistory((prev) => prev.slice(0, -1));
        setSelectedFileSystemItem(null);
        setSelectedFile(null);
      } catch (error) {
        console.error("Error going back:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectFile = useCallback(
    (item: any) => {
      setSelectedFileSystemItem(item);
      if (item.kind === "file" && item.file) {
        setSelectedFile(item.file);
      } else {
        setSelectedFile(null);
      }

      if (windowWidth < 1024 && item.kind === "file") {
        setShowPreviewModal(true);
      }
    },
    [windowWidth, setSelectedFile, setSelectedFileSystemItem]
  );

  const sizeIcons = {
    small: <ZoomOut className="w-4 h-4" />,
    medium: <div className="w-4 h-4 border-2 border-current rounded" />,
    large: <ZoomIn className="w-4 h-4" />,
  };

  // Función para cambiar tamaño en móvil (cíclico)
  const handleMobileSizeChange = () => {
    const sizes = ['small', 'medium', 'large'] as const;
    const currentIndex = sizes.indexOf(itemSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    setItemSize(sizes[nextIndex]);
  };

  // Controls para móvil
  const MobileControls = () => (
    <div className="sm:hidden fixed bottom-4 right-4 z-30 flex flex-col space-y-2">
      {/* Botón de tamaño/zoom */}
      <motion.button
        onClick={handleMobileSizeChange}
        className="p-3 bg-gray-700/90 backdrop-blur-lg rounded-full border border-gray-600/50 text-white shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={`Tamaño actual: ${itemSize}. Click para cambiar`}
      >
        {sizeIcons[itemSize]}
      </motion.button>

      {/* Botón de vista (grid/list) */}
      <motion.button
        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
        className="p-3 bg-gray-700/90 backdrop-blur-lg rounded-full border border-gray-600/50 text-white shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={`Cambiar a vista ${
          viewMode === "grid" ? "lista" : "cuadrícula"
        }`}
      >
        {viewMode === "grid" ? (
          <List className="w-5 h-5" />
        ) : (
          <Grid3X3 className="w-5 h-5" />
        )}
      </motion.button>

      {/* Botón de preview (solo si hay archivo seleccionado) */}
      {selectedFileSystemItem?.kind === "file" && (
        <motion.button
          onClick={() => setShowPreviewModal(true)}
          className="p-3 bg-blue-500/90 backdrop-blur-lg rounded-full border border-blue-400/50 text-white shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Abrir vista previa"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Header Responsive */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 z-20 bg-gray-800/90 backdrop-blur-lg border-b border-gray-700/50 p-3 sm:p-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
          {/* Left Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <motion.button
              onClick={onBackToLanding}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 p-2 sm:p-3 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-gray-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Volver al inicio"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base hidden sm:inline">
                Inicio
              </span>
            </motion.button>

            {/* Botón Atrás */}
            {folderHistory.length > 0 && (
              <motion.button
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 p-2 sm:p-3 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-gray-500/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Volver a la carpeta anterior"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base hidden sm:inline">
                  Atrás
                </span>
              </motion.button>
            )}

            <div className="h-6 w-px bg-gray-600/50 hidden sm:block" />

            <motion.button
              onClick={handleSelectFolder}
              className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Abrir Carpeta</span>
              <span className="sm:hidden">Carpeta</span>
            </motion.button>

            {currentFolder && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center space-x-2 bg-gray-700/60 px-3 py-1 rounded-lg border border-gray-600/50"
              >
                <FolderOpen className="w-3 h-3 text-blue-400" />
                <span className="text-xs font-medium text-gray-200 hidden sm:block">
                  {currentFolder.name}
                </span>
                {folderHistory.length > 0 && (
                  <span className="text-xs text-gray-400">
                    ({folderHistory.length + 1} niveles)
                  </span>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Section - View Controls (solo desktop) */}
          <div className="hidden sm:flex items-center justify-end space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-700/60 rounded-lg p-1 border border-gray-600/50">
              <motion.button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-gray-400 hover:text-white"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Vista en cuadrícula"
              >
                <Grid3X3 className="w-4 h-4" />
              </motion.button>

              <motion.button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-purple-500/20 text-purple-400"
                    : "text-gray-400 hover:text-white"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Vista en lista"
              >
                <List className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Size Controls */}
            <div className="flex items-center space-x-1 bg-gray-700/60 rounded-lg p-1 border border-gray-600/50">
              {(["small", "medium", "large"] as const).map((size) => (
                <motion.button
                  key={size}
                  onClick={() => setItemSize(size)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    itemSize === size
                      ? "bg-green-500/20 text-green-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={`Tamaño ${size}`}
                >
                  {sizeIcons[size]}
                </motion.button>
              ))}
            </div>

            {/* Preview Toggle (solo desktop) */}
            <motion.button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 p-2 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-gray-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={
                showPreview ? "Ocultar vista previa" : "Mostrar vista previa"
              }
            >
              {showPreview ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Cargando archivos...</p>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex w-full pt-20 sm:pt-16 h-screen">
        {/* File Explorer - Siempre visible */}
        <div
          className={`relative ${
            showPreview && windowWidth >= 1024 ? "w-full lg:w-2/3" : "w-full"
          } transition-all duration-500 ease-out`}
        >
          <FileExplorer
            files={fileSystemItems}
            selectedFile={selectedFileSystemItem}
            onSelectFile={handleSelectFile}
            onSelectFolder={handleSelectFolder}
            onOpenFolder={handleOpenFolder}
            isMobile={isMobile}
          />
          
          {/* Stats Bar - Ahora dentro del FileExplorer container */}
          {fileSystemItems.length > 0 && (
            <motion.footer
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute bottom-0 left-0 right-0 z-10 bg-gray-800/90 backdrop-blur-lg border-t border-gray-700/50 p-2"
            >
              <div className="flex items-center justify-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-400 flex-wrap">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Image className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span>
                    {
                      fileSystemItems.filter(
                        (f) =>
                          f.kind === "file" && f.file?.type.startsWith("image/")
                      ).length
                    }{" "}
                    imágenes
                  </span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  <span>
                    {
                      fileSystemItems.filter(
                        (f) =>
                          f.kind === "file" && f.file?.type.startsWith("video/")
                      ).length
                    }{" "}
                    videos
                  </span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Music className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                  <span>
                    {
                      fileSystemItems.filter(
                        (f) =>
                          f.kind === "file" && f.file?.type.startsWith("audio/")
                      ).length
                    }{" "}
                    audios
                  </span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                  <span>
                    {fileSystemItems.filter((f) => f.kind === "directory").length}{" "}
                    carpetas
                  </span>
                </div>
              </div>
            </motion.footer>
          )}
        </div>

        {/* Preview Panel - Solo desktop */}
        {showPreview && windowWidth >= 1024 && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className="w-1/3 border-l border-gray-700/50 bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-lg"
          >
            <PreviewPanel
              selectedFile={selectedFileSystemItem?.file || null}
              files={fileSystemItems
                .filter(
                  (item): item is { kind: "file"; file: File; name: string } =>
                    item.kind === "file" && item.file !== undefined
                )
                .map((item) => item.file)}
            />
          </motion.div>
        )}
      </div>

      {/* Mobile Controls */}
      <MobileControls />

      {/* Folder Selection Modal */}
      <FolderModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onConfirm={handleFolderSelected}
      />

      {/* Preview Modal para móvil */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        selectedFile={selectedFileSystemItem?.file || null}
      />
    </div>
  );
}