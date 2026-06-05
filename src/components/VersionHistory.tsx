'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Version {
  id: string;
  version_number: number;
  changes_description: string;
  created_by: string;
  created_at: string;
  deployed_to_production: boolean;
}

interface VersionHistoryProps {
  scriptId: string;
  onRevert: (versionId: string) => Promise<void>;
}

export default function VersionHistory({ scriptId, onRevert }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, [scriptId]);

  const fetchVersions = async () => {
    try {
      const res = await fetch(`/api/scripts/${scriptId}/versions`);
      if (!res.ok) throw new Error('Failed to fetch versions');
      const data = await res.json();
      setVersions(data);
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Historial de Versiones</h3>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : versions.length === 0 ? (
        <p className="text-gray-500">Sin versiones previas</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {versions.map((version) => (
            <div key={version.id} className="border rounded-lg p-3 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">v{version.version_number}</p>
                  <p className="text-sm text-gray-600">
                    {version.changes_description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(version.created_at), {
                      locale: es,
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <button
                  onClick={() => onRevert(version.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                >
                  Revertir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
