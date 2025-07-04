import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

interface JwtPayload {
  roles: string[];
}

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.redirect(new URL("/auths/login", req.url));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JwtPayload;
    const allowedRoles = ["Admin", "HR"];
    if (!decoded.roles.some((role) => allowedRoles.includes(role))) {
      return NextResponse.redirect(new URL("/error/forbidden", req.url));
    }
    return NextResponse.next();
  } catch (error: unknown) {
    console.error("Lỗi middleware:", {
      error: error instanceof Error ? error.message : String(error),
      path: req.nextUrl.pathname,
    });
    return NextResponse.redirect(new URL("/auths/login", req.url));
  }
}

export const config = {
  matcher: ["/contract", "/contract/:path*", "/api/contracts", "/api/contracts/:path*"],
};