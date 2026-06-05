'use client';

import { useState } from 'react';
import { ChevronLeft, Eye, RotateCcw, Trash2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Version {
  id: string;
  created_at: string;
  changes_description?: string;
  description?: string;
  content: string;
}

interface EnhancedVersionHistoryProps {
  versions: Version[];
  currentScriptName: string;
  onRevert: (versionId: string) => Promise<void>;
  onBack: () => void;
}

export default function EnhancedVersionHistory({
  versions,
  currentScriptName,
  onRevert,
  onBack,
}: EnhancedVersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [reverting, setReverting] = useState<string | null>(null);

  const handleRevert = async (versionId: string) => {
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres revertir a esta versión?'
    );
    if (!confirmed) return;

    setReverting(versionId);
    try {
      await onRevert(versionId);
      toast.success('Versión restaurada');
      setSelectedVersion(null);
    } catch (error) {
      toast.error('Error al revertir');
    } finally {
      setReverting(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-3"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Volver al editor</span>
        </button>
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historial de Cambios</h1>
            <p className="text-sm text-gray-600">{currentScriptName}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex gap-4 p-4 bg-gray-50">
        {/* Versions List */}
        <div className="w-96 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-sm font-medium text-gray-700">
              {versions.length} cambios
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {versions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No hay historial de cambios</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {versions.map((version, index) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition border-l-4 ${
                      selectedVersion?.id === version.id
                        ? 'bg-blue-50 border-l-blue-600'
                        : 'border-l-transparent hover:border-l-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                            {index + 1}
                          </span>
                          <p className="font-medium text-gray-900 truncate">
                            {version.description || version.changes_description || 'Cambio sin descripción'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(version.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        {selectedVersion ? (
          <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedVersion.description || selectedVersion.changes_description || 'Cambio sin descripción'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(selectedVersion.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              <pre className="p-4 text-sm text-gray-800 font-mono whitespace-pre-wrap break-words">
                {selectedVersion.content}
              </pre>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-4 flex gap-2 justify-end">
              <button
                onClick={() => handleRevert(selectedVersion.id)}
                disabled={reverting === selectedVersion.id}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2 text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                {reverting === selectedVersion.id
                  ? 'Revirtiendo...'
                  : 'Deshacer a esta versión'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Selecciona un cambio para ver su contenido</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
