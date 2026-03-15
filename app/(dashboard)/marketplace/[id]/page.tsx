"use client"

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ADDONS } from "@/lib/addons-data"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AddonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""
  const addon = ADDONS.find((a) => a.id === id)
  
  const [purchased, setPurchased] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Pre-load the success sound
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onq2xr6WVg3FjW2Bth5aqt76+tKiYh3VoYGBsf5Sms7u9uK2fj31tYmBkcH+UpLC4u7auoZKCcmZhYmx5jaGwuLq1rJ6QgXFmYWNseY2hr7i5tKudj4BwZWFja3mNoK+3ubOqnI5/b2RgYmp4jJ+ut7izo5uNfm5jX2FpdYudr7a4sKKZi3xtYl9ganSKm622trChl4l6bGFdX2dzipm0trOel4d4a2BcXmVyh5iqtbKrmY6Ed2lfXF1jcYWXprOyqZeMgnZoXVtcYm+Dk6SysamXioF0Zl1aW2BugJCjr6+mkYd+cmVbWVteb36Poq2spZCFe3BkWlhaXWx8jaGrq6SPg3hvY1pYWVxqeoyjqaihi4B3bWJZV1hbZ3mLoqimnomAdWxgWFZXWWV2iZ+mpJyHfXNqX1hVVldjdIacoqObhXtxaF5WVFVWYHKEmp+fmIJ4b2ZdVlNUVV5wgZienpWAd21kXFVTU1RdbX+VnJuSfnVrYltUUlJTW2t9k5qYj3tybGFaU1FRUlppeZCYlouAdWtiWlRSUVFYZ3aOlpSIf3RqYVlTUVBQVmV0jJSShn1yaV9YUlBPT1RjcoqQj4N6cGdfV1FPT09TYXCIjo2Be29mXldRT09OUV9uho2KfnlvZV5WUU9OTlBdbISKiXx2bmRcVVBOTU1OW2qChod5dG1jXFVQTk1MTVlne4OFd3JsYltUUE1MTExXZXmBgnVwamFaU09NTEtLVWN2f39zcWlgWVJOTEtLS1NhdHx9cW9oX1hRTUtKSkpRX3J6em9tZ15XUEBLE0lKT11wenpubWZdVk9MSkpJSU5cb3d3bWxmXVZPS0lJSElMWmp0dGtqZFxVTktJSEhISldobXJraWNbVE5LSUhHR0lXZGxwamhjW1ROS0lIR0dIVWJqbmlnYltTTktJR0dGSFNgaGtoZmBaUk5KSEdGRkdSXmZoZ2VfWVFNSUdGRkZHUFxkZmVjXlhQTElHRkVFR09aYmRjYV1XUExIRkVFRUZOWWBiYV9cVk9MR0ZFRERFTVdeYF9dW1VOSkdFREREREtVXF5dW1lUTklHRURERENKU1pbWllXUk1IRURDRENCSVFYW1lYVVFMSEVEQ0JCQkhPVldXVlNPTEdEQ0JCQUJHTlRWVVRST0tGQ0JBQUFBRkxSVFNSUU5KRkNCQUBAAA==")
  }, [])

  if (!addon) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground text-sm">Addon nao encontrado.</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/marketplace")}>
          Voltar
        </Button>
      </div>
    )
  }

  const handleBuy = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setPurchased(true)
    setShowConfetti(true)
    
    // Play success sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }

    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ["#21C25E", "#fbbf24", "#8b5cf6", "#ec4899", "#3b82f6"][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Back */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      {/* Image */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted">
        <Image
          src={addon.image}
          alt={addon.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-foreground">{addon.name}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{addon.tagline}</p>
      </div>

      {/* Features - minimal */}
      <div className="flex flex-wrap gap-2">
        {addon.features.slice(0, 3).map((feature, i) => (
          <span
            key={i}
            className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full"
          >
            {feature}
          </span>
        ))}
      </div>

      {/* Price & Buy */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <div className="flex flex-col flex-1">
          <span className="text-2xl font-bold font-mono text-foreground">
            R$ {addon.price.toFixed(2).replace(".", ",")}
          </span>
          <span className="text-xs text-muted-foreground">por mes</span>
        </div>

        {purchased ? (
          <div className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm",
            "animate-in zoom-in-95 duration-300"
          )}>
            <Check className="w-4 h-4" />
            Instalado
          </div>
        ) : (
          <Button
            className={cn(
              "px-6 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm",
              "transition-all duration-300 hover:scale-105 active:scale-95"
            )}
            onClick={handleBuy}
            disabled={loading}
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              "Comprar"
            )}
          </Button>
        )}
      </div>

    </div>
  )
}
