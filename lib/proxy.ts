import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Check admin routes first
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Allow login page to be accessed without session
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next({ request })
    }

    // For other admin routes, check if admin is logged in
    // Note: Admin session is stored in sessionStorage (client-side only)
    // So we'll allow the request to proceed and let the client-side check handle it
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return supabaseResponse
}
