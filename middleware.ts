import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "secret123");

const roleAccessMap: Record<string, string[]> = {
  admin: ["/admin", "/api/v1"],
  backofficer: ["/backofficer"],
};

function hasAccess(path: string, role: string): boolean {
  const allowedPaths = roleAccessMap[role] || [];
  return allowedPaths.some((allowed) => path.startsWith(allowed));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Se não estiver logado e tentar acessar rota protegida
  const allProtectedPaths = Object.values(roleAccessMap).flat();
  const isProtected = allProtectedPaths.some((protectedPath) =>
    pathname.startsWith(protectedPath)
  );

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    if (token) {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const userRole = payload.role as string;

      // Se estiver na home ("/"), redireciona com base na role
      if (pathname === "/") {
        if (userRole === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        } else if (userRole === "backofficer") {
          return NextResponse.redirect(new URL("/backofficer", request.url));
        } else {
          return NextResponse.redirect(new URL("/user/dashboard", request.url));
        }
      }

      // Se a role não tem acesso à página atual
      if (isProtected && !hasAccess(pathname, userRole)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch (err) {
    console.error("Erro ao verificar o token:", err);
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/backofficer/:path*", "/user/dashboard"],
};
