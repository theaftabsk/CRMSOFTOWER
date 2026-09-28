import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const endpoint = path.join('/');
    const body = await req.json();

    const response = await fetch(`${BACKEND_API}/mail/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Mail proxy error:', error?.message || error);
    return NextResponse.json(
      { success: false, message: 'Failed to communicate with mail server' },
      { status: 500 }
    );
  }
}
