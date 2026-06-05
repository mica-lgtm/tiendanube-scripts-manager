'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { redirect } from 'next/navigation';

export default function StorePage() {
  const { storeId } = useParams();

  useEffect(() => {
    // Redirect directly to editor
    if (storeId) {
      redirect(`/dashboard/${storeId}/editor`);
    }
  }, [storeId]);

  return null;
}
