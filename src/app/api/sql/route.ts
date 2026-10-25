import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'supabase', 'schema.sql');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'schema.sql not found' }, { status: 404 });
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
