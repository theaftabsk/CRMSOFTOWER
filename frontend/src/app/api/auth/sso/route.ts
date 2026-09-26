import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API = process.env.BACKEND_API_URL || 'http://localhost:4000/api/v1';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const ticket = searchParams.get('ticket');

  if (!ticket) {
    return NextResponse.redirect(new URL('/login?error=Missing+SSO+ticket', req.url));
  }

  try {
    const res = await fetch(`${BACKEND_API}/public/auth/redeem-sso?ticket=${encodeURIComponent(ticket)}`, {
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok || !data.success || !data.data?.accessToken) {
      const errorMsg = data?.message || 'Invalid or expired SSO session';
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMsg)}`, req.url));
    }

    const payload = data.data;
    const token = payload.accessToken;
    const destination = payload.redirectPath || '/dashboard';

    const response = NextResponse.redirect(new URL(destination, req.url));

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    };

    response.cookies.set('crm_access_token', token, cookieOptions);
    response.cookies.set('crm_refresh_token', `refresh_${token}`, cookieOptions);

    return response;
  } catch (error) {
    return NextResponse.redirect(new URL('/login?error=SSO+service+unavailable', req.url));
  }
}
