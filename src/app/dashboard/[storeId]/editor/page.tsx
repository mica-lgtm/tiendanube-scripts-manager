'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import EditorSelection from '@/components/EditorSelection';
import UnifiedScriptEditor from '@/components/UnifiedScriptEditor';
import EnhancedVersionHistory from '@/components/EnhancedVersionHistory';
import toast from 'react-hot-toast';
import type { Script, ScriptVersion } from '@/types';

const dummyVersion = dynamic(() => Promise.resolve(() => null), { ssr: false });

type EditorView = 'selection' | 'editor' | 'history';
type ScriptType = 'home' | 'product-list' | 'product-page';

interface ScriptData extends Script {
  versions?: ScriptVersion[];
}

export default function EditorPage() {
  const { storeId } = useParams() as { storeId: string };
  const [view, setView] = useState<EditorView>('selection');
  const [selectedType, setSelectedType] = useState<ScriptType | null>(null);
  const [scripts, setScripts] = useState<ScriptData[]>([]);
  const [selectedScript, setSelectedScript] = useState<ScriptData | null>(null);
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [loading, setLoading] = useState(true);

  // Map script type names to our new types
  const mapScriptType = (name: string): ScriptType => {
    if (name.toLowerCase().includes('home')) return 'home';
    if (name.toLowerCase().includes('product') && name.toLowerCase().includes('list'))
      return 'product-list';
    if (name.toLowerCase().includes('product')) return 'product-page';
    return 'home';
  };

  const fetchScripts = async () => {
    try {
      const res = await fetch(`/api/scripts?storeId=${storeId}`);
      if (!res.ok) throw new Error('Failed to fetch scripts');
      const data = await res.json();
      setScripts(data || []);
    } catch (error) {
      console.error('Error loading scripts:', error);
      toast.error('Error cargando scripts');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async (scriptId: string) => {
    try {
      console.log('fetchVersions: Fetching for scriptId:', scriptId);
      const res = await fetch(`/api/scripts/${scriptId}`);
      const text = await res.text();
      console.log('fetchVersions: Response status:', res.status, 'text:', text.slice(0, 200));

      if (!res.ok) {
        console.error('Failed to fetch versions:', res.status, text);
        setVersions([]);
        return;
      }

      const data = JSON.parse(text);
      console.log('fetchVersions: Data received:', data);
      setVersions(data.versions || []);
    } catch (error) {
      console.error('Error loading versions:', error);
      setVersions([]);
    }
  };

  useEffect(() => {
    const initScripts = async () => {
      await fetchScripts();
      // If no scripts exist, create default ones
      const res = await fetch(`/api/scripts?storeId=${storeId}`);
      const data = await res.json();
      if (!data || data.length === 0) {
        await createDefaultScripts();
      }
    };
    initScripts();
  }, [storeId]);

  const createDefaultScripts = async () => {
    try {
      // Create three default scripts if they don't exist
      const scriptTypes = [
        { name: 'Home Page', script_type: 'html', description: 'Página de Inicio' },
        { name: 'Product List', script_type: 'html', description: 'Listado de Productos' },
        { name: 'Product Page', script_type: 'html', description: 'Página de Producto' },
      ];

      for (const script of scriptTypes) {
        const response = await fetch('/api/scripts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: script.name,
            script_type: script.script_type,
            content: '',
            storeId,
            description: script.description,
          }),
        });

        if (!response.ok) {
          console.error(`Failed to create script: ${script.name}`);
        }
      }

      await fetchScripts();
    } catch (error) {
      console.error('Error creating default scripts:', error);
    }
  };

  const handleSelectType = async (type: ScriptType) => {
    setSelectedType(type);
    const script = scripts.find((s) => mapScriptType(s.name) === type);
    if (script) {
      setSelectedScript(script);
      await fetchVersions(script.id);
    }
    setView('editor');
  };

  const handleSaveScript = async (content: string) => {
    if (!selectedScript) return;

    try {
      const res = await fetch(`/api/scripts/${selectedScript.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          description: `Actualización de ${selectedScript.name}`,
        }),
      });

      if (!res.ok) throw new Error('Error saving');

      await fetchScripts();
      await fetchVersions(selectedScript.id);
      toast.success('Cambios guardados exitosamente');
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  };

  const handleDeploy = async () => {
    if (!selectedScript) return;

    try {
      const confirmed = window.confirm(
        '¿Estás seguro de que quieres hacer deploy? Se realizará un backup automático.'
      );

      if (!confirmed) return;

      const res = await fetch('/api/tiendanube/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptId: selectedScript.id,
          storeId,
        }),
      });

      if (!res.ok) throw new Error('Deploy failed');

      toast.success('¡Deploy exitoso!');
    } catch (error) {
      console.error('Deploy error:', error);
      throw error;
    }
  };

  const handleRevertVersion = async (versionId: string) => {
    if (!selectedScript) return;

    try {
      const version = versions.find((v) => v.id === versionId);
      if (!version) return;

      const res = await fetch(`/api/scripts/${selectedScript.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: version.content,
          description: `Reversión a versión anterior`,
        }),
      });

      if (!res.ok) throw new Error('Revert failed');

      await fetchScripts();
      await fetchVersions(selectedScript.id);

      if (selectedScript) {
        const updatedScript = scripts.find((s) => s.id === selectedScript.id);
        if (updatedScript) {
          setSelectedScript(updatedScript);
        }
      }

      setView('editor');
      toast.success('Versión restaurada exitosamente');
    } catch (error) {
      console.error('Revert error:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      {view === 'selection' && (
        <EditorSelection
          onSelect={handleSelectType}
          onBack={() => {
            // Navigate back to dashboard
            window.location.href = `/dashboard/${storeId}`;
          }}
        />
      )}

      {view === 'editor' && selectedScript && selectedType && (
        <UnifiedScriptEditor
          scriptId={selectedScript.id}
          storeId={storeId}
          initialContent={selectedScript.content || ''}
          scriptName={selectedScript.name}
          scriptType={selectedType}
          onSave={handleSaveScript}
          onDeploy={handleDeploy}
          onBack={() => setView('selection')}
          onShowHistory={() => setView('history')}
        />
      )}

      {view === 'history' && selectedScript && (
        <EnhancedVersionHistory
          versions={versions}
          currentScriptName={selectedScript.name}
          onRevert={handleRevertVersion}
          onBack={() => setView('editor')}
        />
      )}
    </div>
  );
}
