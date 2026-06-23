import { NextResponse } from "next/server";
import {
  buildLoginUrl,
  canRoleAccessRoute,
  getForbiddenRedirect,
  getRequiredRoles,
  isPublicPath,
} from "@/utils/routeAccess";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const requiredRoles = getRequiredRoles(pathname);
  if (!requiredRoles) {
    return NextResponse.next();
  }

  const role = request.cookies.get("vcl_role")?.value;
  const isAuthed = request.cookies.get("vcl_auth")?.value === "1";

  if (!isAuthed || !role) {
    const loginUrl = new URL(buildLoginUrl(pathname), request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!canRoleAccessRoute(role, pathname)) {
    const dest = new URL(`${getForbiddenRedirect(role)}?error=forbidden`, request.url);
    return NextResponse.redirect(dest);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
