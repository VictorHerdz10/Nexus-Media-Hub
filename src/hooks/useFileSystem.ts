/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppStore } from "../stores/appStore";
import { useCallback } from "react";
import { indexedDBService } from "../utils/indexedDB";
import { toast } from "sonner"; // ← Importar Sonner

interface FileSystemItem {
  name: string;
  kind: "file" | "directory";
  file?: File;
  handle?: any;
}


export function useFileSystem() {
  const { setFiles, setSelectedFile, setCurrentFolder, setFileSystemItems } =
    useAppStore();

  // Verificar si File System Access API está disponible
  const isFileSystemAPISupported = useCallback((): boolean => {
    const supported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
    
    // Toast para debug
    //if (supported) {
    //  toast.success("✅ File System API disponible", {
    //    description: "Puedes seleccionar carpetas completas"
    //  });
    //} else {
    //  toast.warning("⚠️ File System API no disponible", {
    //    description: "Usando selección de archivos individuales"
    //  });
    //}
    //
    return supported;
  }, []);

  // Verificar si es móvil (solo para mostrar mensajes diferentes)
  const isMobile = useCallback((): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  const loadDirectoryContents = useCallback(
    async (directoryHandle: any): Promise<FileSystemItem[]> => {
      const items: FileSystemItem[] = [];

      try {
        // Actualizar timestamp cada vez que se cargan archivos
        localStorage.setItem("nexus-cache-timestamp", Date.now().toString());

        const entries = [];
        try {
          // Método más compatible para iterar directorios
          if (directoryHandle.entries) {
            for await (const [, handle] of directoryHandle.entries()) {
              entries.push(handle);
            }
          } else if (directoryHandle.values) {
            for await (const entry of directoryHandle.values()) {
              entries.push(entry);
            }
          } else {
            console.warn("No se puede iterar el directorio:", directoryHandle);
            return items;
          }
        } catch (error) {
          console.warn("Error iterando directorio:", error);
          return items;
        }

        for (const entry of entries) {
          if (entry.kind === "file") {
            try {
              const file = await entry.getFile();
              if (isMediaFile(file)) {
                items.push({
                  name: file.name,
                  kind: "file",
                  file: file,
                  handle: entry,
                });
              }
            } catch (fileError) {
              console.warn("Error loading file:", entry.name, fileError);
            }
          } else if (entry.kind === "directory") {
            items.push({
              name: entry.name,
              kind: "directory",
              handle: entry,
            });
          }
        }

        const mediaFiles = items
          .filter((item) => item.kind === "file" && item.file)
          .map((item) => item.file!);
        setFiles(mediaFiles);
        setFileSystemItems(items);
      } catch (error) {
        console.error("Error loading directory contents:", error);
      }

      return items;
    },
    [setFiles, setFileSystemItems]
  );

  // Método alternativo para cuando File System API no está disponible
  const selectFilesFallback = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*,video/*,audio/*';
      
      input.onchange = async (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        
        if (files.length > 0) {
          // Crear una estructura similar a FileSystemItem para mantener compatibilidad
          const items: FileSystemItem[] = files.map(file => ({
            name: file.name,
            kind: 'file' as const,
            file: file,
            handle: null
          }));

          setFiles(files);
          setFileSystemItems(items);
          
          // Simular una carpeta para mantener la estructura
          setCurrentFolder({
            name: 'Archivos Seleccionados',
            handle: null
          });

          // Guardar en caché
          localStorage.setItem('nexus-current-folder', JSON.stringify({
            name: 'Archivos Seleccionados'
          }));
          localStorage.setItem('nexus-cache-timestamp', Date.now().toString());
          
          resolve(true);
        } else {
          resolve(false);
        }
      };

      input.oncancel = () => {
        resolve(false);
      };

      input.click();
    });
  }, [setFiles, setFileSystemItems, setCurrentFolder]);

  // Función principal para seleccionar carpeta/archivos
  const selectFolder = useCallback(async (): Promise<boolean> => {
    if (isFileSystemAPISupported()) {
      // Usar File System Access API (disponible en Chrome desktop y móvil)
      try {
        // @ts-expect-error - File System Access API
        const directoryHandle = await window.showDirectoryPicker();

        const folderData = {
          name: directoryHandle.name,
          handle: directoryHandle,
        };
        setCurrentFolder(folderData);

        await indexedDBService.saveDirectoryHandle(
          directoryHandle.name,
          directoryHandle
        );

        localStorage.setItem(
          "nexus-current-folder",
          JSON.stringify({
            name: folderData.name,
          })
        );
        localStorage.setItem("nexus-cache-timestamp", Date.now().toString());
        await loadDirectoryContents(directoryHandle);

        return true;
      } catch (error) {
        console.log("❌ Usuario canceló la selección de carpeta", error);
        return false;
      }
    } else {
      // Fallback: input file múltiple
      console.log("File System API no disponible, usando fallback");
      return await selectFilesFallback();
    }
  }, [isFileSystemAPISupported, selectFilesFallback, loadDirectoryContents, setCurrentFolder]);

  const loadFiles = useCallback(
    async (directoryHandle: any) => {
      const fileList: File[] = [];

      try {
        const entries = [];
        for await (const entry of directoryHandle.values()) {
          entries.push(entry);
        }

        for (const entry of entries) {
          if (entry.kind === "file") {
            const file = await entry.getFile();
            if (isMediaFile(file)) {
              fileList.push(file);
            }
          }
        }

        setFiles(fileList);
        setSelectedFile(null);
      } catch (error) {
        console.error("Error loading files:", error);
      }
    },
    [setFiles, setSelectedFile]
  );

  const navigateToFolder = useCallback(
    async (folderHandle: any): Promise<FileSystemItem[]> => {
      try {
        const items = await loadDirectoryContents(folderHandle);

        setCurrentFolder({
          name: folderHandle.name,
          handle: folderHandle,
        });

        await indexedDBService.saveDirectoryHandle(
          folderHandle.name,
          folderHandle
        );

        // Actualizar caché al navegar
        localStorage.setItem(
          "nexus-current-folder",
          JSON.stringify({
            name: folderHandle.name,
          })
        );
        localStorage.setItem("nexus-cache-timestamp", Date.now().toString());

        return items;
      } catch (error) {
        console.error("❌ Error navigating to folder:", error);
        return [];
      }
    },
    [loadDirectoryContents, setCurrentFolder]
  );

  // Función para forzar la recarga de la carpeta actual
  const reloadCurrentFolder = useCallback(
    async (directoryHandle: any) => {
      try {
        // Actualizar timestamp
        localStorage.setItem("nexus-cache-timestamp", Date.now().toString());

        const items = await loadDirectoryContents(directoryHandle);
        return items;
      } catch (error) {
        console.error("Error reloading folder:", error);
        return [];
      }
    },
    [loadDirectoryContents]
  );

  const getFileInfo = useCallback(
    async (fileHandle: any): Promise<File | null> => {
      try {
        return await fileHandle.getFile();
      } catch (error) {
        console.error("Error getting file info:", error);
        return null;
      }
    },
    []
  );

  const verifyPermissions = useCallback(
    async (directoryHandle: any): Promise<boolean> => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - File System Access API
        return (
          (await directoryHandle.requestPermission({ mode: "read" })) ===
          "granted"
        );
      } catch (error) {
        console.error("Error verifying permissions:", error);
        return false;
      }
    },
    []
  );

  const isMediaFile = useCallback((file: File): boolean => {
    if (!file.type) return false;

    const mediaTypes = ["image/", "video/", "audio/"];

    return mediaTypes.some((type) => file.type.startsWith(type));
  }, []);

  const getFolderStats = useCallback((items: FileSystemItem[]) => {
    const stats = {
      total: items.length,
      files: items.filter((item) => item.kind === "file").length,
      directories: items.filter((item) => item.kind === "directory").length,
      images: items.filter(
        (item) => item.kind === "file" && item.file?.type.startsWith("image/")
      ).length,
      videos: items.filter(
        (item) => item.kind === "file" && item.file?.type.startsWith("video/")
      ).length,
      audio: items.filter(
        (item) => item.kind === "file" && item.file?.type.startsWith("audio/")
      ).length,
    };

    return stats;
  }, []);

  const searchFiles = useCallback(
    (items: FileSystemItem[], query: string): FileSystemItem[] => {
      if (!query.trim()) return items;

      const searchTerm = query.toLowerCase();
      return items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm)
      );
    },
    []
  );

  const filterByType = useCallback(
    (
      items: FileSystemItem[],
      fileType: "image" | "video" | "audio" | "all"
    ): FileSystemItem[] => {
      if (fileType === "all") return items;

      return items.filter((item) => {
        if (item.kind === "directory") return true;
        if (!item.file) return false;

        switch (fileType) {
          case "image":
            return item.file.type.startsWith("image/");
          case "video":
            return item.file.type.startsWith("video/");
          case "audio":
            return item.file.type.startsWith("audio/");
          default:
            return true;
        }
      });
    },
    []
  );

  const sortItems = useCallback(
    (
      items: FileSystemItem[],
      sortBy: "name" | "size" | "date" | "type",
      order: "asc" | "desc" = "asc"
    ): FileSystemItem[] => {
      return [...items].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "size": {
            const sizeA = a.kind === "file" && a.file ? a.file.size : 0;
            const sizeB = b.kind === "file" && b.file ? b.file.size : 0;
            comparison = sizeA - sizeB;
            break;
          }
          case "date": {
            const dateA = a.kind === "file" && a.file ? a.file.lastModified : 0;
            const dateB = b.kind === "file" && b.file ? b.file.lastModified : 0;
            comparison = dateA - dateB;
            break;
          }
          case "type": {
            const typeA =
              a.kind === "file" && a.file ? a.file.type : `directory-${a.name}`;
            const typeB =
              b.kind === "file" && b.file ? b.file.type : `directory-${b.name}`;
            comparison = typeA.localeCompare(typeB);
            break;
          }
        }

        return order === "desc" ? -comparison : comparison;
      });
    },
    []
  );

  return {
    selectFolder,
    loadFiles,
    loadDirectoryContents,
    navigateToFolder,
    reloadCurrentFolder,
    getFileInfo,
    verifyPermissions,
    getFolderStats,
    searchFiles,
    filterByType,
    sortItems,
    isMediaFile,
    isFileSystemAPISupported,
    isMobile,
  };
}