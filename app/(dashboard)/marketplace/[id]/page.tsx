"use client"

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ADDONS } from "@/lib/addons-data"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Play } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AddonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""
  const addon = ADDONS.find((a) => a.id === id)
  
  const [purchased, setPurchased] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mounted, setMounted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    setMounted(true)
    // Satisfying success sound - coin/ding sound
    audioRef.current = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYNkwsAAAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYNkwsAAAAAAAAAAAAAAAAA//tQxAAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UMQpA8AAADSAAAAAMQUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=")
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

  const media = addon.media

  const handleBuy = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    setPurchased(true)
    
    // Play success sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.volume = 0.5
      audioRef.current.play().catch(() => {})
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % media.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + media.length) % media.length)
  }

  return (
    <div 
      className={cn(
        "flex flex-col gap-6 max-w-lg mx-auto transition-all duration-500",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Back */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Voltar
      </Link>

      {/* Media Carousel */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted">
        {media.map((item, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-all duration-500 ease-out",
              index === currentSlide 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-95 pointer-events-none"
            )}
          >
            {item.type === "video" ? (
              <video
                src={item.url}
                className="w-full h-full object-cover"
                controls
                playsInline
              />
            ) : (
              <Image
                src={item.url}
                alt={`${addon.name} - ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            )}
          </div>
        ))}

        {/* Carousel Controls */}
        {media.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-foreground hover:bg-white transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-foreground hover:bg-white transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    index === currentSlide 
                      ? "bg-white w-4" 
                      : "bg-white/50 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-foreground">{addon.name}</h1>
        <p className="text-sm text-muted-foreground">{addon.tagline}</p>
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
          <div 
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm animate-in zoom-in-90 duration-300"
          >
            <Check className="w-4 h-4" />
            Instalado
          </div>
        ) : (
          <Button
            className={cn(
              "px-8 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium",
              "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
