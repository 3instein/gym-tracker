import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow static files and API routes
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Check for session cookie (NextAuth v5)
    const sessionToken =
        request.cookies.get("gym-tracker.session-token") ||
        request.cookies.get("__Secure-gym-tracker.session-token");

    const isLoggedIn = !!sessionToken;
    const isOnLoginPage = pathname === "/login";
    const isPublicRoute = pathname.startsWith("/public");

    // Redirect logged-in users away from login page
    if (isOnLoginPage && isLoggedIn) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Redirect unauthenticated users to login
    if (!isLoggedIn && !isOnLoginPage && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
