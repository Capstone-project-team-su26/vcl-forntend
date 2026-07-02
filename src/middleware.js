import { NextResponse } from "next/server";
import {
  buildLoginUrl,
  canRoleAccessRoute,
  getForbiddenRedirect,
  getRequiredRoles,
  isPublicPath,
} from "@/utils/routeAccess";
import { ROUTES, ADMIN_PATH_PREFIX } from "@/utils/appRoutes";

/** Chuyển route staff cũ → sales (đồng bộ sau refactor). */
function resolveLegacyStaffRedirect(request) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/staff" || pathname === "/pages/staff") {
    if (searchParams.get("salesTab") === "consignments") {
      return new URL(ROUTES.sales.consignments, request.url);
    }
    return new URL(ROUTES.sales.home, request.url);
  }

  if (pathname.startsWith("/staff/")) {
    const next = pathname.replace(/^\/staff/, ROUTES.sales.home);
    return new URL(next, request.url);
  }

  if (pathname.startsWith("/pages/staff/")) {
    const next = pathname.replace(/^\/pages\/staff/, ROUTES.sales.home);
    return new URL(next, request.url);
  }

  return null;
}

/** Chuyển route admin cũ → /pages/admin (đồng bộ spec task). */
function resolveLegacyAdminRedirect(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin") {
    return new URL(ROUTES.admin.users, request.url);
  }

  if (pathname.startsWith("/admin/")) {
    const next = pathname.replace(/^\/admin/, ADMIN_PATH_PREFIX);
    return new URL(next, request.url);
  }

  return null;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const legacyRedirect = resolveLegacyStaffRedirect(request);
  if (legacyRedirect) {
    return NextResponse.redirect(legacyRedirect);
  }

  const legacyAdminRedirect = resolveLegacyAdminRedirect(request);
  if (legacyAdminRedirect) {
    return NextResponse.redirect(legacyAdminRedirect);
  }

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
