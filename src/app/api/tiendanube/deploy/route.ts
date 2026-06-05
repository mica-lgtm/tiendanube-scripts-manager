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

  // Parse body once — reading req.json() twice throws on the second call
  let scriptId: string;
  let storeId: string;
  try {
    const body = await req.json();
    scriptId = body.scriptId;
    storeId = body.storeId;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!scriptId || !storeId) {
    return NextResponse.json({ error: 'scriptId y storeId son requeridos' }, { status: 400 });
  }

  try {
    const { data: script } = await supabaseServer
      .from('scripts')
      .select('*, stores(*)')
      .eq('id', scriptId)
      .single();

    if (!script || (script.stores as any).owner_id !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const store = script.stores as any;

    const response = await deployScriptToTiendanube(
      store.store_id,
      scriptId,
      store.api_token
    );

    await supabaseServer
      .from('scripts')
      .update({
        is_active: true,
        deployed_at: new Date().toISOString(),
      })
      .eq('id', scriptId);

    await supabaseServer.from('audit_log').insert({
      store_id: storeId,
      user_id: session.user.id,
      action: 'deploy',
      details: { script_id: scriptId, tiendanube_response: response },
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error('Error deploying to TiendaNube:', error);

    await supabaseServer.from('audit_log').insert({
      user_id: session.user.id,
      action: 'deploy_error',
      details: { script_id: scriptId, error: error.message },
    });

    return NextResponse.json(
      { error: 'Error deploying script: ' + error.message },
      { status: 500 }
    );
  }
}
