import { motion } from 'framer-motion'
import { Play, Image, Video, FolderOpen, Sparkles, Users, Zap, Shield } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  }

  const featureVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white overflow-auto">
      {/* Background Animated Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <motion.div 
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Play className="w-4 h-4 sm:w-6 sm:h-6" />
              </motion.div>
              <h1 className="text-xl sm:text-2xl font-bold">Nexus Media Hub</h1>
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </motion.div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                Tu Centro Multimedia{' '}
                <span className="text-gradient bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Personalizado
                </span>
              </h1>
            </motion.div>

            <motion.p variants={itemVariants} className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto">
              Gestiona y reproduce tu colección multimedia local con una interfaz moderna, 
              rápida y llena de características avanzadas.
            </motion.p>

            <motion.div variants={itemVariants} className="mb-16 sm:mb-20">
              <motion.button
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 rounded-xl transition-all duration-300 relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Comenzar Ahora</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.button>
            </motion.div>

            {/* Features Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-left mb-16"
              variants={containerVariants}
            >
              <motion.div 
                variants={featureVariants}
                className="glass-effect bg-white/5 p-4 sm:p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Gestor Inteligente</h3>
                <p className="text-sm sm:text-base text-gray-300">
                  Organiza y navega por tus archivos multimedia como un profesional con nuestro explorador avanzado.
                </p>
              </motion.div>

              <motion.div 
                variants={featureVariants}
                className="glass-effect bg-white/5 p-4 sm:p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Video className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Reproductor Universal</h3>
                <p className="text-sm sm:text-base text-gray-300">
                  Soporte para todos los formatos de video y audio con controles personalizados y vista previa.
                </p>
              </motion.div>

              <motion.div 
                variants={featureVariants}
                className="glass-effect bg-white/5 p-4 sm:p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Image className="w-10 h-10 sm:w-12 sm:h-12 text-green-400 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Galería de Imágenes</h3>
                <p className="text-sm sm:text-base text-gray-300">
                  Visualiza tus fotos con metadatos EXIF y navegación fluida entre archivos.
                </p>
              </motion.div>
            </motion.div>

            {/* Additional Info Section */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center mb-20"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <div className="glass-effect bg-white/5 p-6 rounded-xl">
                  <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Rápido y Eficiente</h3>
                  <p className="text-gray-300">
                    Carga instantánea y reproducción sin interrupciones
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="glass-effect bg-white/5 p-6 rounded-xl">
                  <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">100% Local</h3>
                  <p className="text-gray-300">
                    Tus archivos nunca salen de tu dispositivo
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="glass-effect bg-white/5 p-6 rounded-xl">
                  <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Fácil de Usar</h3>
                  <p className="text-gray-300">
                    Interfaz intuitiva para todos los usuarios
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* CTA Section */}
            <motion.div 
              variants={itemVariants}
              className="glass-effect bg-blue-600/20 p-8 rounded-2xl border border-blue-500/30"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                ¿Listo para comenzar?
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                Descubre la mejor manera de gestionar tu colección multimedia
              </p>
              <motion.button
                onClick={onGetStarted}
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold text-lg px-8 py-3 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explorar Ahora
              </motion.button>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <motion.footer 
          variants={itemVariants}
          className="container mx-auto px-4 sm:px-6 py-8 text-center text-gray-400"
        >
          <p>© 2025 Nexus Media Hub. Tu centro multimedia personal.</p>
        </motion.footer>
      </motion.div>
    </div>
  )
}