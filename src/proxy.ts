import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 简化版 proxy：只做基本的公开/私有路由判断
// 各页面内部通过 auth() 做精确鉴权
export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 全部放行：API（内部鉴权）、静态资源、公开页面
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return NextResponse.next();
  }

  // 检查是否有 NextAuth session cookie
  const hasSession = req.cookies.has("authjs.session-token");

  if (!hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
