"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { authSession } from "@/lib/authSession"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const publicRoutes = ['/login', '/registro', '/auth/callback']
    const onboardingRoutes = ['/plans', '/checkout', '/assinatura']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
    const isOnboardingRoute = onboardingRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/registro')

    if (isPublicRoute) {
      setAuthorized(true)
      return
    }

    const finalToken = authSession.getFinalToken()
    const onboardingToken = authSession.getOnboardingToken()

    if (finalToken) {
      if (isAuthRoute || isOnboardingRoute) {
        router.replace('/')
        return
      }
      setAuthorized(true)
      return
    }

    if (onboardingToken) {
      if (isOnboardingRoute) {
        setAuthorized(true)
        return
      }
      router.replace('/plans')
      return
    }

    if (isOnboardingRoute) {
      router.replace('/login')
      return
    }

    if (!isPublicRoute) {
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
