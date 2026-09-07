import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API = process.env.BACKEND_API_URL || 'http://localhost:4000/api/v1';

export async function POST(req: NextRequest) {
  try {
    // Notify backend
    await fetch(`${BACKEND_API}/auth/logout`, {
      method: 'POST',
    }).catch(() => null);

    const res = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear HttpOnly cookies on Next.js
    res.cookies.set('crm_access_token', '', { path: '/', maxAge: 0 });
    res.cookies.set('crm_refresh_token', '', { path: '/', maxAge: 0 });

    return res;
  } catch (error) {
    const res = NextResponse.json({ success: true, message: 'Logged out' });
    res.cookies.set('crm_access_token', '', { path: '/', maxAge: 0 });
    res.cookies.set('crm_refresh_token', '', { path: '/', maxAge: 0 });
    return res;
  }
}
