import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    console.log('Fetching scripts for storeId:', storeId);

    let query = supabase.from('scripts').select('*');

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data: scripts, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json([]);
    }

    console.log('Scripts found:', scripts?.length);
    return NextResponse.json(scripts || []);
  } catch (error) {
    console.error('Error fetching scripts:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, script_type, content, storeId, description } = body;

    // Create script
    const { data: script, error } = await supabase
      .from('scripts')
      .insert({
        store_id: storeId,
        name,
        script_type: script_type || 'html',
        content: content || '',
        description: description || '',
        created_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create script' }, { status: 500 });
    }

    return NextResponse.json(script);
  } catch (error) {
    console.error('Error creating script:', error);
    return NextResponse.json({ error: 'Error creating script' }, { status: 500 });
  }
}
