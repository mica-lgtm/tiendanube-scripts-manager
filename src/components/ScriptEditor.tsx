'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface ScriptEditorProps {
  scriptId: string;
  storeId: string;
  initialContent: {
    css?: string;
    html?: string;
    js?: string;
  };
  onSave: (type: string, content: string) => Promise<void>;
  onDeploy: () => Promise<void>;
}

export default function ScriptEditor({
  scriptId,
  storeId,
  initialContent,
  onSave,
  onDeploy,
}: ScriptEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<'css' | 'html' | 'js'>('css');
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(activeTab, content[activeTab] || '');
      toast.success('Script guardado');
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      await onDeploy();
      toast.success('¡Deploy exitoso!');
    } catch (error) {
      toast.error('Error en el deploy');
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-gray-50 p-4 flex gap-2">
        {(['css', 'html', 'js'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-medium transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border hover:bg-gray-100'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={activeTab === 'js' ? 'javascript' : activeTab}
          value={content[activeTab] || ''}
          onChange={(value) =>
            setContent((prev) => ({ ...prev, [activeTab]: value || '' }))
          }
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </div>

      <div className="border-t bg-white p-4 flex gap-2 justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          onClick={handleDeploy}
          disabled={deploying}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {deploying ? 'Deployando...' : 'Deploy'}
        </button>
      </div>
    </div>
  );
}
