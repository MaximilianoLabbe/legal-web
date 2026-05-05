import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert } from '../ui';
import { FiX, FiDownload, FiTrash2, FiFile, FiUpload, FiEye } from 'react-icons/fi';
import { archiveService } from '../../services/archiveService';
import type { Case, CaseDocument } from '../../types';

interface CaseDetailModalProps {
  caseData: Case;
  clientName?: string;
  isOpen: boolean;
  onClose: () => void;
  onUploadClick?: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseData,
  clientName,
  isOpen,
  onClose,
  onUploadClick,
}) => {
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen, caseData.id]);

  const loadDocuments = async () => {
    setIsLoadingDocs(true);
    setError(null);
    try {
      const docs = await archiveService.getDocumentsByCase(caseData.id);
      setDocuments(docs || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar documentos';
      setError(errorMessage);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleView = async (doc: CaseDocument) => {
    try {
      await archiveService.viewDocument(doc.id, doc.nombre_original || doc.nombre, doc.tipo_archivo);
    } catch (err) {
      alert(`Error al visualizar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
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
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stateColors: Record<string, 'primary' | 'warning' | 'success' | 'danger'> = {
    abierto: 'primary',
    en_progreso: 'warning',
    cerrado: 'success',
    pausado: 'danger',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Detalle del Caso</h2>
            {clientName && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">👤 {clientName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Case Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                  Descripción
                </label>
                <p className="text-sm sm:text-base text-gray-900 break-words">{caseData.descripcion}</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                  Tipo de Caso
                </label>
                <p className="text-sm sm:text-base text-gray-900">{caseData.tipo}</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                  Estado
                </label>
                <Badge variant={stateColors[caseData.estado] || 'primary'}>
                  {caseData.estado}
                </Badge>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                  Fecha de Inicio
                </label>
                <p className="text-sm sm:text-base text-gray-900">
                  {formatDate(caseData.fecha_inicio)}
                </p>
              </div>

              {caseData.fecha_fin && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                    Fecha de Finalización
                  </label>
                  <p className="text-sm sm:text-base text-gray-900">
                    {formatDate(caseData.fecha_fin)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                  Última Actualización
                </label>
                <p className="text-xs sm:text-sm text-gray-900">
                  {formatDateTime(caseData.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Documents Section */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Documentos Adjuntos</h3>
              {onUploadClick && (
                <Button
                  onClick={onUploadClick}
                  className="inline-flex items-center gap-2 w-full sm:w-auto justify-center"
                  size="sm"
                >
                  <FiUpload size={16} />
                  <span className="hidden sm:inline">Subir</span>
                  <span className="sm:hidden">Subir Archivo</span>
                </Button>
              )}
            </div>

            {error && (
              <Alert type="error" title="Error" message={error} />
            )}

            {isLoadingDocs ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin">
                  <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FiFile size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm sm:text-base text-gray-500">No hay documentos asociados</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 sm:p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
                  >
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
                      <FiFile size={20} className="text-blue-500 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                          {doc.nombre}
                        </h4>
                        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-1">
                          <span>{formatFileSize(doc.tamaño)}</span>
                          <span>{formatDateTime(doc.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => handleView(doc)}
                        className="flex-1 sm:flex-none p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="flex-1 sm:flex-none p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Descargar"
                      >
                        <FiDownload size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                        className="flex-1 sm:flex-none p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
