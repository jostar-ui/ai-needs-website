import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_session';
const LOGIN_PATH = '/admin/login';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/* 경로만 보호 (로그인 페이지 제외)
  if (!pathname.startsWith('/admin') || pathname.startsWith(LOGIN_PATH)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(COOKIE_NAME);
  if (session?.value === 'authenticated') {
    return NextResponse.next();
  }

  // 쿠키 없으면 로그인 페이지로 리다이렉트
  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
