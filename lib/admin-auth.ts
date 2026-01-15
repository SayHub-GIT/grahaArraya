const ADMIN_EMAIL = "admin@raya.com"
const ADMIN_PASSWORD = "adm1ngr4h4#"

export function validateAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

export function getAdminSession(): { email: string; loginTime: Date } | null {
  if (typeof window === "undefined") return null

  const session = sessionStorage.getItem("admin_session")
  if (!session) return null

  try {
    const parsed = JSON.parse(session)
    // Check if session is still valid (24 hours)
    const loginTime = new Date(parsed.loginTime)
    const now = new Date()
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

    if (hoursDiff > 24) {
      sessionStorage.removeItem("admin_session")
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function setAdminSession(email: string): void {
  if (typeof window === "undefined") return

  sessionStorage.setItem(
    "admin_session",
    JSON.stringify({
      email,
      loginTime: new Date().toISOString(),
    }),
  )
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem("admin_session")
}

export function getAdminSessionServer(): { email: string; loginTime: Date } | null {
  // This is a placeholder for potential server-side validation
  // Currently, admin sessions are stored only on client-side via sessionStorage
  return null
}
