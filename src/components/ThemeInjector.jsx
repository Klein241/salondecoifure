import { useEffect } from "react"
import { useTenant } from "../TenantContext"

export default function ThemeInjector() {
  const { theme } = useTenant()

  useEffect(() => {
    if (!theme) return
    const root = document.documentElement
    Object.entries(theme).forEach(([key, value]) => {
      if (key.startsWith("--")) {
        root.style.setProperty(key, value)
      }
    })
  }, [theme])

  return null
}
