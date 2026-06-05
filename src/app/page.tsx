'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  store_id: number;
  is_active: boolean;
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
    if (status === 'authenticated') {
      fetchStores();
    }
  }, [status, router]);

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores');
      const data = await res.json();
      setStores(data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Tiendas</h1>
        <p className="text-gray-600">Selecciona una tienda para editar sus scripts</p>
      </div>

      {stores.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No hay tiendas configuradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Link key={store.id} href={`/dashboard/${store.id}`}>
              <div className="border rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏪</span>
                  <h3 className="text-xl font-bold">{store.name}</h3>
                </div>
                <p className="text-sm text-gray-600">ID: {store.store_id}</p>
                <p className="mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    store.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {store.is_active ? '🟢 Activa' : '🔴 Inactiva'}
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
