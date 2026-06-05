import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase';
import { deployScriptToTiendanube } from '@/lib/tiendanube';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { scriptId, storeId } = body;

    // Obtener script
    const { data: script } = await supabaseServer
      .from('scripts')
      .select('*, stores(*)')
      .eq('id', scriptId)
      .single();

    if (!script || (script.stores as any).owner_id !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Deploy a TiendaNube API
    const response = await deployScriptToTiendanube(
      (script.stores as any).store_id,
      script.name,
      script.content,
      script.script_type,
      (script.stores as any).api_token
    );

    // Marcar como deployado
    await supabaseServer
      .from('scripts')
      .update({
        is_active: true,
        deployed_at: new Date(),
      })
      .eq('id', scriptId);

    // Auditoría
    await supabaseServer.from('audit_log').insert({
      store_id: storeId,
      user_id: session.user.id,
      action: 'deploy',
      details: { script_id: scriptId, tiendanube_response: response },
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error('Error deploying to TiendaNube:', error);

    // Auditoría de error
    try {
      const body = await req.json();
      await supabaseServer.from('audit_log').insert({
        user_id: session?.user?.id,
        action: 'deploy_error',
        details: { error: error.message },
      });
    } catch {}

    return NextResponse.json(
      { error: 'Error deploying script: ' + error.message },
      { status: 500 }
    );
  }
}
