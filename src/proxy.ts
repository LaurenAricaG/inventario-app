import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const isLogin = pathname.startsWith("/login");
  const isApiAuth = pathname.startsWith("/api/auth");
  const isAdminRoute = pathname.startsWith("/admin");

  // Permitir acceso libre a las peticiones internas de autenticación
  if (isApiAuth) {
    return NextResponse.next();
  }

  // Si ya inició sesión y va a /login, redirigir a dashboard /admin
  if (isLogin) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    return NextResponse.next();
  }

  // Si intenta acceder a una ruta de admin y no está logueado, redirigir a /login
  if (isAdminRoute) {
    if (!isLoggedIn) {
      let callbackUrl = pathname;
      if (nextUrl.search) {
        callbackUrl += nextUrl.search;
      }
      const encodedCallbackUrl = encodeURIComponent(callbackUrl);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
    }

    // Validación de permisos dentro de la zona de admin
    const userPermissions = (req.auth?.user?.permissions as string[]) ?? [];

    // Mapeo de rutas a permisos requeridos
    const routePermissions = [
      { path: "/admin/usuarios", permission: "users:read" },
      { path: "/admin/roles", permission: "roles:read" },
      { path: "/admin/clientes", permission: "clients:read" },
      { path: "/admin/generos", permission: "genders:read" },
      { path: "/admin/empresas", permission: "companies:read" },
      { path: "/admin/marcas", permission: "brands:read" },
      { path: "/admin/categorias", permission: "categories:read" },
      { path: "/admin/productos", permission: "products:read" },

      { path: "/admin/pedidos", permission: "orders:read" },
      { path: "/admin/ventas", permission: "sales:read" },
      { path: "/admin/pagos", permission: "payments:read" },
      { path: "/admin/deudas", permission: "debts:read" },
      { path: "/admin/movimientos", permission: "transactions:read" },

      { path: "/admin/bitacora", permission: "audit:read" },
      { path: "/admin/configuracion", permission: "config:read" },
    ];

    // Special check for campaigns and catalogs route (either permission allows access)
    if (pathname.startsWith("/admin/campanias")) {
      if (!userPermissions.includes("campaigns:read") && !userPermissions.includes("catalogs:read")) {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
    }

    // Validar si la ruta actual está protegida por un permiso y si el usuario cuenta con él
    for (const route of routePermissions) {
      if (pathname.startsWith(route.path) && !userPermissions.includes(route.permission)) {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
    }
  }

  return NextResponse.next();
});

// Matcher para excluir archivos estáticos e imágenes del interceptor
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.pdf).*)"],
};
