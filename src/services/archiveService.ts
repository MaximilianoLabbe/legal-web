import api from './api';
import type { CaseDocument, ApiResponse } from '../types';

/**
 * Mapeo de extensiones de archivo a MIME types
 */
const getMimeType = (fileNameOrExtension?: string, tipoArchivo?: string): string => {
  // Si tenemos el tipo de archivo directamente, usarlo
  if (tipoArchivo) {
    // Si ya es un MIME type, devolverlo
    if (tipoArchivo.includes('/')) {
      return tipoArchivo;
    }
    // Si es una extensión, procesarla
    fileNameOrExtension = tipoArchivo;
  }
  
  if (!fileNameOrExtension) return 'application/octet-stream';
  
  // Limpiar la extensión (remover puntos iniciales)
  let extension = fileNameOrExtension.toLowerCase().replace(/^\.*/, '');
  
  // Si contiene punto, extraer la parte después del último punto
  if (extension.includes('.')) {
    extension = extension.split('.').pop() || '';
  }
  
  const mimeTypes: Record<string, string> = {
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    
    // Spreadsheets
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'csv': 'text/csv',
    
    // Presentations
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    
    // Video
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

/**
 * Obtener la extensión de un tipo de archivo
 */
const getExtension = (tipoArchivo?: string): string => {
  if (!tipoArchivo) return '';
  
  // Mapeo inverso de MIME types a extensiones
  const extensionMap: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'text/plain': 'txt',
    'application/rtf': 'rtf',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/csv': 'csv',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-7z-compressed': '7z',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'video/mp4': 'mp4',
    'video/x-msvideo': 'avi',
    'video/quicktime': 'mov',
  };
  
  // Si es un MIME type, buscarlo en el mapa
  if (tipoArchivo.includes('/')) {
    return extensionMap[tipoArchivo] || '';
  }
  
  // Si es una extensión, devolverla sin el punto
  return tipoArchivo.toLowerCase().replace(/^\.*/, '');
};

export const archiveService = {
  /**
   * Subir un documento a una causa
   * @param caseId - ID de la causa
   * @param file - Archivo a subir
   * @param categoria - Categoría del archivo (opcional)
   * @param descripcion - Descripción del archivo (opcional)
   * @returns Promise con los datos del documento creado
   */
  uploadDocument: async (
    caseId: string,
    file: File,
    categoria?: string,
    descripcion?: string
  ): Promise<CaseDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    if (categoria) formData.append('category', categoria);
    if (descripcion) formData.append('description', descripcion);

    const response = await api.post<ApiResponse<CaseDocument>>(
      `/archivos/${caseId}/subir`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  },

  /**
   * Obtener todos los documentos de una causa
   * @param caseId - ID de la causa
   * @returns Promise con lista de documentos
   */
  getDocumentsByCase: async (caseId: string): Promise<CaseDocument[]> => {
    try {
      const response = await api.get<any>(
        `/archivos/caso/${caseId}`
      );
      
      // Manejar diferentes formatos de respuesta
      let documents = [];
      if (response.data && Array.isArray(response.data)) {
        documents = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        documents = response.data.data;
      } else if (response.data?.documents && Array.isArray(response.data.documents)) {
        documents = response.data.documents;
      }
      
      return documents;
    } catch (error: any) {
      // Si el endpoint no existe, retornar array vacío
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Obtener un documento específico
   * @param documentId - ID del documento/archivo
   * @returns Promise con los datos del documento
   */
  getDocument: async (documentId: string): Promise<CaseDocument> => {
    const response = await api.get<ApiResponse<CaseDocument>>(
      `/archivos/${documentId}`
    );

    return response.data.data;
  },

  /**
   * Descargar un documento
   * @param documentId - ID del documento
   * @param fileName - Nombre del archivo (nombre_original de la BD)
   * @param tipoArchivo - Tipo de archivo del backend (opcional)
   */
  downloadDocument: async (documentId: string, fileName: string, tipoArchivo?: string): Promise<void> => {
    try {
      const response = await api.get(
        `/archivos/${documentId}/descargar`,
        {
          responseType: 'blob',
        }
      );
      
      // Obtener el MIME type correcto
      const mimeType = getMimeType(fileName, tipoArchivo);
      
      // Usar el nombre_original si está disponible (ya tiene la extensión correcta)
      let fullFileName = fileName || `documento_${documentId}`;
      
      // Si el nombre ya tiene extensión, usarlo tal cual
      if (fullFileName.includes('.')) {
        // El nombre ya está completo, solo usarlo
      } else {
        // Si no tiene extensión, agregarla
        const extension = getExtension(tipoArchivo);
        if (extension) {
          fullFileName = `${fullFileName}.${extension}`;
        }
      }
      
      // Crear blob con el tipo MIME correcto
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fullFileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar un documento
   * @param documentId - ID del documento
   */
  deleteDocument: async (documentId: string): Promise<void> => {
    await api.delete(`/archivos/${documentId}`);
  },

  /**
   * Visualizar un documento en nueva pestaña con tipo MIME correcto
   * @param documentId - ID del documento
   * @param fileName - Nombre del archivo (para identificar el tipo, opcional)
   * @param tipoArchivo - Tipo de archivo del backend (opcional)
   */
  viewDocument: async (documentId: string, fileName?: string, tipoArchivo?: string): Promise<void> => {
    try {
      const response = await api.get(
        `/archivos/${documentId}/descargar`,
        {
          responseType: 'blob',
        }
      );

      // Obtener el MIME type correcto basado en la extensión del archivo
      const mimeType = getMimeType(fileName, tipoArchivo);
      
      // Crear blob con el tipo MIME correcto
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      
      // Abrir en nueva pestaña
      const newTab = window.open(url, '_blank');
      
      // Limpiar la URL después de un tiempo
      if (newTab) {
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 60000); // Limpiar después de 1 minuto
      }
    } catch (error) {
      throw error;
    }
  },
};
