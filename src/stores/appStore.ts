/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FileSystemItem {
  name: string
  kind: 'file' | 'directory'
  file?: File
  handle?: any
}

interface AppState {
  currentFolder: { name: string; handle?: any } | null
  files: File[]
  fileSystemItems: FileSystemItem[]
  selectedFile: File | null
  selectedFileSystemItem: FileSystemItem | null
  showPreview: boolean
  viewMode: 'grid' | 'list'
  itemSize: 'small' | 'medium' | 'large'
  setCurrentFolder: (folder: { name: string; handle?: any } | null) => void
  setFiles: (files: File[]) => void
  setFileSystemItems: (items: FileSystemItem[]) => void
  setSelectedFile: (file: File | null) => void
  setSelectedFileSystemItem: (item: FileSystemItem | null) => void
  setShowPreview: (show: boolean) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setItemSize: (size: 'small' | 'medium' | 'large') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentFolder: null,
      files: [],
      fileSystemItems: [],
      selectedFile: null,
      selectedFileSystemItem: null,
      showPreview: true,
      viewMode: 'grid',
      itemSize: 'medium',
      setCurrentFolder: (folder) => set({ currentFolder: folder }),
      setFiles: (files) => set({ files }),
      setFileSystemItems: (items) => set({ fileSystemItems: items }),
      setSelectedFile: (file) => set({ selectedFile: file }),
      setSelectedFileSystemItem: (item) => set({ selectedFileSystemItem: item }),
      setShowPreview: (show) => set({ showPreview: show }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setItemSize: (size) => set({ itemSize: size }),
    }),
    {
      name: 'nexus-media-storage',
      partialize: (state) => ({ 
        currentFolder: state.currentFolder,
        showPreview: state.showPreview,
        viewMode: state.viewMode,
        itemSize: state.itemSize
      }),
    }
  )
)