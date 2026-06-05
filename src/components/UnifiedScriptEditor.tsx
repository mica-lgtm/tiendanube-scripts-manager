'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ChevronLeft, Save, Zap, Eye, Code } from 'lucide-react';
import toast from 'react-hot-toast';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface UnifiedScriptEditorProps {
  scriptId: string;
  storeId: string;
  initialContent: string;
  scriptName: string;
  scriptType: 'home' | 'product-list' | 'product-page';
  onSave: (content: string) => Promise<void>;
  onDeploy: () => Promise<void>;
  onBack: () => void;
  onShowHistory: () => void;
}

const SCRIPT_TYPE_ICONS = {
  'home': '🏠',
  'product-list': '📋',
  'product-page': '🛍️',
};

const SCRIPT_TYPE_LABELS = {
  'home': 'Página de Inicio',
  'product-list': 'Listado de Productos',
  'product-page': 'Página de Producto',
};

export default function UnifiedScriptEditor({
  scriptId,
  storeId,
  initialContent,
  scriptName,
  scriptType,
  onSave,
  onDeploy,
  onBack,
  onShowHistory,
}: UnifiedScriptEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(content);
      toast.success('Cambios guardados');
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
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white p-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Volver"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{SCRIPT_TYPE_ICONS[scriptType]}</span>
              <h1 className="text-xl font-bold text-gray-900">
                {SCRIPT_TYPE_LABELS[scriptType]}
              </h1>
            </div>
            <p className="text-sm text-gray-500">Edita el código para tu tienda</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex gap-4 p-4 bg-gray-50">
        {/* Editor Section */}
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-2">
            <Code className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Editor de Código</span>
            <span className="ml-auto text-xs text-gray-500">
              {content.split('\n').length} líneas
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language="html"
              value={content}
              onChange={(value) => setContent(value || '')}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="w-1/2 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Vista Previa</span>
            </div>
            <div className="flex-1 min-h-0 overflow-auto bg-gray-100">
              <iframe
                srcDoc={content}
                className="w-full h-full border-0"
                title="Preview"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onShowHistory}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
          >
            📜 Ver Historial
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 ${
                showPreview
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              Vista Previa
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>

            <button
              onClick={handleDeploy}
              disabled={deploying}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition text-sm font-medium flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {deploying ? 'Deployando...' : 'Deploy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
