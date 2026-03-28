"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AssinaturaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const query = searchParams.toString()
    router.replace(`/plans${query ? `?${query}` : ""}`)
  }, [router, searchParams])

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Redirecionando...
      </div>
    </div>
  )
}
