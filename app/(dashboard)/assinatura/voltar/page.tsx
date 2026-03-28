"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AssinaturaVoltarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const query = searchParams.toString()
    router.replace(`/checkout/cancel${query ? `?${query}` : ""}`)
  }, [router, searchParams])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Redirecionando...
      </div>
    </div>
  )
}
