'use client';

import { ChevronLeft } from 'lucide-react';

interface EditorSelectionProps {
  onSelect: (type: 'home' | 'product-list' | 'product-page') => void;
  onBack: () => void;
}

const SCRIPT_OPTIONS = [
  {
    id: 'home',
    icon: '🏠',
    title: 'Página de Inicio',
    description: 'Haz cambios en la página principal de tu tienda',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'product-list',
    icon: '📋',
    title: 'Listado de Productos',
    description: 'Personaliza la página donde se muestran los productos',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'product-page',
    icon: '🛍️',
    title: 'Página de Producto',
    description: 'Edita el diseño individual de cada producto',
    color: 'from-pink-500 to-pink-600',
  },
];

export default function EditorSelection({ onSelect, onBack }: EditorSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Volver a Dashboard</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¿Dónde quieres hacer cambios?
            </h1>
            <p className="text-gray-600">
              Selecciona la sección que deseas personalizar
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SCRIPT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id as 'home' | 'product-list' | 'product-page')}
              className="group relative h-80 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${option.color} transition-transform duration-300 group-hover:scale-105`}
              />

              {/* Overlay with gradient fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-8 text-white">
                {/* Icon and Top Content */}
                <div>
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {option.icon}
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">{option.title}</h2>
                  <p className="text-gray-100 text-sm leading-relaxed">
                    {option.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white">→</span>
                  </div>
                </div>
              </div>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 mt-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Consejos</h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <li className="flex gap-3">
              <span>✏️</span>
              <span>Puedes pegar cualquier código (HTML, CSS o JavaScript)</span>
            </li>
            <li className="flex gap-3">
              <span>👀</span>
              <span>Usa la vista previa para ver los cambios en tiempo real</span>
            </li>
            <li className="flex gap-3">
              <span>↩️</span>
              <span>Todos tus cambios quedan guardados con historial</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
