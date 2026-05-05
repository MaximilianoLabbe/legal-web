import React, { useState } from 'react';
import { Card, Button, Alert } from '../ui';
import { FiX, FiUpload } from 'react-icons/fi';
import { archiveService } from '../../services/archiveService';
import type { CaseDocument } from '../../types';

interface DocumentUploadModalProps {
  caseId: string;
  caseName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (document: CaseDocument) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  caseId,
  caseName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tamaño máximo (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('El archivo no debe exceder 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setIsLoading(true);

    try {
      const document = await archiveService.uploadDocument(
        caseId,
        file,
        categoria || undefined,
        descripcion || undefined
      );
      
      setSuccessMessage(`✓ "${file.name}" subido exitosamente`);
      setFile(null);
      setCategoria('');
      setDescripcion('');
      
      // Limpiar el input
      const fileInput = globalThis.document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      onSuccess(document);
      
      // Cerrar modal después de 2s
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir el documento';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCloseModal = () => {
    // Limpiar estados
    setFile(null);
    setCategoria('');
    setDescripcion('');
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Subir Documento</h2>
            {caseName && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">Caso: {caseName}</p>
            )}
          </div>
          <button
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            disabled={isLoading}
          >
            <FiX size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" title="Error" message={error} />
          </div>
        )}

        {successMessage && (
          <div className="mb-4">
            <Alert type="success" title="Éxito" message={successMessage} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <FiUpload size={32} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                {file ? file.name : 'Haz clic para seleccionar un archivo'}
              </span>
              <span className="text-xs text-gray-400">
                Máximo 10MB
              </span>
            </label>
          </div>

          {/* File Info */}
          {file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Archivo:</span> {file.name}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Tamaño:</span> {(file.size / 1024 / 1024).toFixed(2)}MB
              </p>
            </div>
          )}

          {/* Categoria (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría (Opcional)
            </label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ej: Contrato, Demanda, Prueba..."
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          {/* Descripcion (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Agrega notas o detalles sobre este documento..."
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !file}
            >
              {isLoading ? 'Subiendo...' : 'Subir Documento'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
