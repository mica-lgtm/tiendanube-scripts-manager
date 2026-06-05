'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import toast from 'react-hot-toast';
import { LogOut, Settings } from 'lucide-react';
import type { Store } from '@/types';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      redirect('/auth/login');
    }
    fetchStores();
  }, [session]);

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores');
      if (!res.ok) throw new Error('Failed to fetch stores');
      const data = await res.json();
      setStores(data);
    } catch (error) {
      toast.error('Error cargando tiendas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                Bienvenido, {session?.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Mis Tiendas</h2>
          <p className="text-gray-600">
            Selecciona una tienda para comenzar a editar sus scripts
          </p>
        </div>

        {stores.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-gray-600 mb-6 text-lg">
              No tienes tiendas configuradas
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              Agregar Tienda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/dashboard/${store.id}/editor`}
              >
                <div className="group relative h-64 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 transition-transform duration-300 group-hover:scale-105" />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-between p-6 text-white">
                    {/* Top */}
                    <div>
                      <div className="text-4xl mb-3">🏪</div>
                      <h3 className="text-2xl font-bold text-white">
                        {store.name}
                      </h3>
                    </div>

                    {/* Bottom */}
                    <div className="space-y-3">
                      <p className="text-sm text-gray-100">
                        ID: {store.store_id}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            store.is_active
                              ? 'bg-green-400/20 text-green-100'
                              : 'bg-red-400/20 text-red-100'
                          }`}
                        >
                          {store.is_active ? '🟢 Activa' : '🔴 Inactiva'}
                        </span>
                        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
