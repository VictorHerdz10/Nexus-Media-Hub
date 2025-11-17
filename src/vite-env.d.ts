/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Extender File con metadatos adicionales
declare global {
  interface File {
    path?: string
    metadata?: {
      duration?: number
      width?: number
      height?: number
      artist?: string
      album?: string
      [key: string]: unknown
    }
  }
}