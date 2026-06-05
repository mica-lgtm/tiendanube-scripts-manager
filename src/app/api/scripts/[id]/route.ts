import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  console.log('PUT /api/scripts/[id] - User:', session?.user?.id, 'Script ID:', id);

  if (!session?.user?.id) {
    console.log('No session');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { content, description } = body;

    // Obtener script
    const { data: script, error: scriptError } = await supabaseServer
      .from('scripts')
      .select('*')
      .eq('id', id)
      .single();

    console.log('Script found:', !!script, 'Error:', scriptError);

    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }

    // Verify script exists (basic validation)
    console.log('Script owner (created_by):', script.created_by, 'User:', session.user.id);

    // Guardar versión anterior
    const { data: newVersion, error: versionError } = await supabaseServer
      .from('script_versions')
      .insert({
        script_id: id,
        version_number: script.version + 1,
        content: content,
        changes_description: description || 'Cambios realizados',
        created_by: session.user.id,
      })
      .select()
      .single();

    console.log('Version created:', !!newVersion, 'Error:', versionError);

    // Actualizar script
    const { data: updated, error: updateError } = await supabaseServer
      .from('scripts')
      .update({
        content,
        version: script.version + 1,
      })
      .eq('id', id)
      .select()
      .single();

    console.log('Script updated:', !!updated, 'Error:', updateError);

    if (updateError) throw updateError;

    // Auditoría
    await supabaseServer.from('audit_log').insert({
      store_id: script.store_id,
      user_id: session.user.id,
      action: 'update',
      details: { script_id: id, version: script.version + 1 },
    });

    return NextResponse.json({ script: updated, version: newVersion });
  } catch (error) {
    console.error('Error updating script:', error);
    return NextResponse.json(
      { error: 'Error updating script', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('[GET /api/scripts/:id] START - ID:', id);

  try {
    // Fetch script
    const { data: script, error: scriptError } = await supabaseServer
      .from('scripts')
      .select('id, name, content, store_id, created_at, updated_at')
      .eq('id', id)
      .single();

    console.log('[GET /api/scripts/:id] Script query:', { found: !!script, error: scriptError?.message });

    if (scriptError) {
      console.error('[GET /api/scripts/:id] Script error:', scriptError);
      return NextResponse.json({ script: null, versions: [] });
    }

    if (!script) {
      console.log('[GET /api/scripts/:id] Script not found');
      return NextResponse.json({ script: null, versions: [] });
    }

    // Fetch versions
    console.log('[GET /api/scripts/:id] Fetching versions for script:', id);
    const { data: versions, error: versionsError } = await supabaseServer
      .from('script_versions')
      .select('id, created_at, changes_description, content')
      .eq('script_id', id)
      .order('created_at', { ascending: false });

    console.log('[GET /api/scripts/:id] Versions query:', { count: versions?.length, error: versionsError?.message });

    return NextResponse.json({ ...script, versions: versions || [] });
  } catch (error) {
    console.error('[GET /api/scripts/:id] Exception:', error);
    return NextResponse.json({ script: null, versions: [], error: String(error) });
  }
}
