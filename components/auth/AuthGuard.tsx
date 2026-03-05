"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Rotas públicas que não precisam de verificação
    const publicRoutes = ['/login', '/registro', '/auth/callback']
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      setAuthorized(true)
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      setAuthorized(true)
    }
  }, [pathname, router])

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
