import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API = process.env.BACKEND_API_URL || 'http://localhost:4000/api/v1';

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

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: 'Session expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data.data.user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
