import React, { useState, useEffect } from 'react';
import { Card, Alert } from '../ui';
import { FiDownload, FiTrash2, FiFile } from 'react-icons/fi';
import { archiveService } from '../../services/archiveService';
import type { CaseDocument } from '../../types';

interface DocumentsListProps {
  caseId: string;
  refreshTrigger?: number;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({ caseId, refreshTrigger }) => {
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [caseId, refreshTrigger]);

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await archiveService.getDocumentsByCase(caseId);
      setDocuments(docs || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar documentos';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (doc: CaseDocument) => {
    try {
      await archiveService.downloadDocument(doc.id, doc.nombre_original || doc.nombre, doc.tipo_archivo);
    } catch (err) {
      alert(`Error al descargar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      setDeletingId(documentId);
      try {
        await archiveService.deleteDocument(documentId);
        setDocuments(documents.filter((doc) => doc.id !== documentId));
      } catch (err) {
        alert(`Error al eliminar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert type="error" title="Error" message={error} />
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <FiFile size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No hay documentos asociados a esta causa</p>
          <p className="text-sm text-gray-400">Sube documentos desde el botón de arriba</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Documentos ({documents.length})</h3>
        <div className="divide-y divide-gray-200">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="py-4 px-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FiFile size={20} className="text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{doc.nombre}</p>
                  <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
                    <span>{formatFileSize(doc.tamaño)}</span>
                    <span>{formatDate(doc.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Descargar"
                >
                  <FiDownload size={18} />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Eliminar"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
