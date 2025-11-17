import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LandingPage } from './components/Landing/LandingPage'
import { MediaBrowser } from './components/MediaBrowser/MediaBrowser'
import { useAppStore } from './stores/appStore'
import { indexedDBService } from './utils/indexedDB'

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [isCheckingCache, setIsCheckingCache] = useState(true)
  const { setCurrentFolder, currentFolder } = useAppStore()

useEffect(() => {
  const checkAndCleanCache = async () => {
    try {
      const cachedFolder = localStorage.getItem('nexus-current-folder');
      const cacheTimestamp = localStorage.getItem('nexus-cache-timestamp');
      
      if (cachedFolder && cacheTimestamp) {
        const timestamp = parseInt(cacheTimestamp);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        // Si el caché tiene más de 1 hora, limpiarlo
        if (now - timestamp > oneHour) {
          console.log('🕒 Caché expirado, limpiando...');
          localStorage.removeItem('nexus-current-folder');
          localStorage.removeItem('nexus-cache-timestamp');
          localStorage.removeItem('nexus-media-storage');
        } else {
          // Caché válido - intentar recuperar la carpeta
          const folderData = JSON.parse(cachedFolder);
          
          try {
            // Intentar recuperar el handle desde IndexedDB
            const directoryHandle = await indexedDBService.getDirectoryHandle(folderData.name);
            
            if (directoryHandle) {
              
              // Verificar si el handle sigue siendo válido de manera más simple
              try {
                // Método más simple para verificar permisos
                const permission = await directoryHandle.queryPermission({ mode: 'read' });
              
                
                if (permission === 'granted') {
                  setCurrentFolder({ 
                    name: directoryHandle.name,
                    handle: directoryHandle 
                  });
                  setShowLanding(false);
                } else {
                  const newPermission = await directoryHandle.requestPermission({ mode: 'read' });
                  if (newPermission === 'granted') {
                    setCurrentFolder({ 
                      name: directoryHandle.name,
                      handle: directoryHandle 
                    });
                    setShowLanding(false);
                  } else {
                    throw new Error('Permisos denegados');
                  }
                }
              } catch (error) {
                console.log('❌ Handle inválido:', error);
                // El handle ya no es válido, eliminarlo
                await indexedDBService.deleteDirectoryHandle(folderData.name);
                setCurrentFolder({ 
                  name: folderData.name, 
                  handle: null 
                });
                setShowLanding(false);
              }
            } else {
              // No hay handle guardado
              setCurrentFolder({ 
                name: folderData.name, 
                handle: null 
              });
              setShowLanding(false);
            }
          } catch (error) {
            console.log('❌ Error recuperando handle desde IndexedDB:', error);
            setCurrentFolder({ 
              name: folderData.name, 
              handle: null 
            });
            setShowLanding(false);
          }
        }
      }
    } catch (error) {
      console.error('💥 Error checking cache:', error);
      localStorage.removeItem('nexus-current-folder');
      localStorage.removeItem('nexus-cache-timestamp');
    } finally {
      setIsCheckingCache(false);
    }
  }

  checkAndCleanCache();
}, [setCurrentFolder]);

  const handleGetStarted = () => {
    setShowLanding(false)
    localStorage.setItem('nexus-cache-timestamp', Date.now().toString())
  }

  const handleBackToLanding = () => {
    setShowLanding(true)
    if (currentFolder) {
      indexedDBService.deleteDirectoryHandle(currentFolder.name)
    }
    setCurrentFolder(null)
    localStorage.removeItem('nexus-current-folder')
    localStorage.removeItem('nexus-cache-timestamp')
    localStorage.removeItem('nexus-media-storage')
  }

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  }

const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 0.5
}
  if (isCheckingCache) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {showLanding ? (
        <motion.div
          key="landing"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <LandingPage onGetStarted={handleGetStarted} />
        </motion.div>
      ) : (
        <motion.div
          key="browser"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <MediaBrowser onBackToLanding={handleBackToLanding} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App