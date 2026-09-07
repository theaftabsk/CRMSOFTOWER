import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API = process.env.BACKEND_API_URL || 'http://localhost:4000/api/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: data?.error?.message || data?.message || 'Registration failed' 
        },
        { status: response.status || 400 }
      );
    }

    const payload = data.data;
    const token = payload.accessToken;

    const res = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: payload.user,
    });

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    };

    res.cookies.set('crm_access_token', token, cookieOptions);
    res.cookies.set('crm_refresh_token', `refresh_${token}`, cookieOptions);

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to connect to backend server' },
      { status: 500 }
    );
  }
}
