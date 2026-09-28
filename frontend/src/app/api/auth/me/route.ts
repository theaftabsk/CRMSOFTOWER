import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API = process.env.BACKEND_API_URL || 'http://127.0.0.1:4000/api/v1';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('crm_access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_API}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `crm_access_token=${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Session expired' },
        { status: 401 }
      );
    }

    const data = await response.json();
    const userData = data?.data?.user || data?.user;

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'Session expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error: any) {
    console.warn('/api/auth/me proxy caught error:', error?.message || error);
    return NextResponse.json(
      { success: false, message: 'Authentication service unavailable' },
      { status: 401 }
    );
  }
}
