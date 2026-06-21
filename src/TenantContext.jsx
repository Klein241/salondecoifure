import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getTenantBySlug, getTenantTheme } from "./supabase.js"

const TenantContext = createContext(null)

export const DEFAULT_THEME = {
  "--bg-color": "#0b0b0b",
  "--panel-bg": "rgba(18, 18, 18, 0.75)",
  "--panel-border": "rgba(212, 175, 55, 0.15)",
  "--primary-gold": "#D4AF37",
  "--light-gold": "#F7E7CE",
  "--dark-gold": "#AA771C",
  "--text-primary": "#f5f5f5",
  "--text-secondary": "#a0a0a0",
  "--accent-red": "#8B0000",
  "--gold-grad": "linear-gradient(135deg, #BF953F 0%, #FCF6BA 30%, #B38728 70%, #FBF5B7 85%, #AA771C 100%)",
  "--gold-text-grad": "linear-gradient(135deg, #e5c060 0%, #fef8cc 50%, #b88d2f 100%)",
  "--font-serif": "'Playfair Display', Georgia, serif",
  "--font-sans": "'Inter', system-ui, -apple-system, sans-serif",
  "--transition-smooth": "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
}

const DEFAULT_TENANT = {
  id: null, slug: "default", name: "Hosanne Platform",
  template: "beauty_salon", logo_url: null, favicon_url: null, active: true
}

export function resolveTenantSlug() {
  const path = window.location.pathname
  if (path.startsWith("/superadmin")) return null
  const segments = path.split("/").filter(Boolean)
  if (segments.length > 0 && segments[0] !== "superadmin") return segments[0]
  return null
}

export function resolveTenantInnerPath() {
  const path = window.location.pathname
  if (path.startsWith("/superadmin")) return path
  const segments = path.split("/").filter(Boolean)
  if (segments.length > 1) return "/" + segments.slice(1).join("/")
  if (segments.length === 1 && segments[0] !== "superadmin") return "/"
  return path
}

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null)
  const [theme, setTheme] = useState(DEFAULT_THEME)
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  const loadTenant = useCallback(async () => {
    const slug = resolveTenantSlug()
    if (slug === null && window.location.pathname.startsWith("/superadmin")) {
      setIsSuperAdmin(true); setTenant(null); setLoading(false); return
    }
    if (!slug) { setTenant(DEFAULT_TENANT); setLoading(false); return }
    try {
      const tenantData = await getTenantBySlug(slug)
      if (tenantData) {
        setTenant(tenantData)
        const themeData = await getTenantTheme(tenantData.id)
        if (themeData && themeData.theme_data) {
          setTheme(prev => ({ ...prev, ...themeData.theme_data }))
        }
      } else {
        setTenant({ ...DEFAULT_TENANT, slug, name: slug })
      }
    } catch (e) {
      console.warn("Tenant load fallback:", e)
      setTenant({ ...DEFAULT_TENANT, slug, name: slug })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTenant()
    const h = () => loadTenant()
    window.addEventListener("popstate", h)
    return () => window.removeEventListener("popstate", h)
  }, [loadTenant])

  const navigateTo = useCallback((innerPath) => {
    const slug = tenant?.slug
    if (!slug || slug === "default") {
      window.history.pushState({}, "", innerPath)
    } else {
      window.history.pushState({}, "", "/" + slug + (innerPath.startsWith("/") ? innerPath : "/" + innerPath))
    }
    window.dispatchEvent(new PopStateEvent("popstate"))
  }, [tenant])

  return (
    <TenantContext.Provider value={{
      tenant, tenantId: tenant?.id || null, tenantSlug: tenant?.slug || null,
      theme, setTheme, loading, isSuperAdmin, navigateTo, reloadTenant: loadTenant
    }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error("useTenant must be used within TenantProvider")
  return ctx
}

export default TenantContext
