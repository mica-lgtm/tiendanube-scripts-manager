import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

// Public endpoint — no auth required. TiendaNube fetches this URL as a <script>.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: script } = await supabaseServer
    .from('scripts')
    .select('content, script_type')
    .eq('id', id)
    .single();

  if (!script) {
    return new NextResponse('// Script not found', {
      status: 404,
      headers: { 'Content-Type': 'text/javascript' },
    });
  }

  const js = buildJsPayload(script.content, script.script_type);

  return new NextResponse(js, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function buildJsPayload(content: string, type: string): string {
  const escaped = JSON.stringify(content);

  if (type === 'css') {
    return `(function(){var s=document.createElement('style');s.textContent=${escaped};document.head.appendChild(s);})();`;
  }

  if (type === 'html') {
    return `(function(){document.addEventListener('DOMContentLoaded',function(){var d=document.createElement('div');d.innerHTML=${escaped};document.body.appendChild(d);});})();`;
  }

  // js — serve as-is
  return content;
}
