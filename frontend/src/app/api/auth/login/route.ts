import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API = process.env.BACKEND_API_URL || 'http://localhost:4000/api/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: data?.error?.message || data?.message || 'Invalid credentials' 
        },
        { status: response.status || 401 }
      );
    }

    const payload = data.data;
    const token = payload.accessToken;

    const res = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: payload.user,
    });

    // Set HttpOnly Cookies on Next.js origin for Middleware & SSR validation
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    };

    res.cookies.set('crm_access_token', token, cookieOptions);
    res.cookies.set('crm_refresh_token', `refresh_${token}`, cookieOptions);

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to connect to authentication server' },
      { status: 500 }
    );
  }
}
