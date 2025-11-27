import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const res = NextResponse.json({ success: true });

    // Delete auth cookies
    res.cookies.set('access_token', '', { path: '/', maxAge: 0 });
    res.cookies.set('user_data', '', { path: '/', maxAge: 0 });

    return res;
  } catch (error) {
    console.error('API logout error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
