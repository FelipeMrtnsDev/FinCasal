"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ADDONS } from "@/lib/addons-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  CheckCircle2,
  ShoppingCart,
  Zap,
  Shield,
  RefreshCcw,
  Store,
} from "lucide-react"
import { cn } from "@/lib/utils"

const BADGE_STYLES: Record<string, string> = {
  Novo: "bg-violet-100 text-violet-700 border-violet-200",
  Popular: "bg-amber-100 text-amber-700 border-amber-200",
  Destaque: "bg-primary/10 text-primary border-primary/20",
}

export default function AddonDetailPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""
  const addon = ADDONS.find((a) => a.id === id)
  const [purchased, setPurchased] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!addon) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Store className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Addon nao encontrado.</p>
        <Link href="/marketplace">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Marketplace
          </Button>
        </Link>
      </div>
    )
  }

  const related = ADDONS.filter((a) => a.id !== addon.id && a.category === addon.category).slice(0, 2)

  const handleBuy = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setPurchased(true)
  }

  return (
    <div className="flex flex-col gap-0 max-w-3xl mx-auto">
      {/* Back */}
      <div className="mb-6">
        <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Marketplace
        </Link>
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden bg-muted mb-6">
        <Image
          src={addon.image}
          alt={addon.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {addon.badge && (
          <div className="absolute top-4 left-4">
            <span className={cn("text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border backdrop-blur-sm", BADGE_STYLES[addon.badge])}>
              {addon.badge}
            </span>
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <span className="text-white/60 text-xs uppercase tracking-widest font-semibold">{addon.category}</span>
          <h1 className="text-white font-bold text-2xl sm:text-3xl mt-0.5 text-balance">{addon.name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Left: description + features */}
        <div className="sm:col-span-2 flex flex-col gap-6">
          {/* Description */}
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-foreground">Sobre este addon</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{addon.description}</p>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-foreground">O que esta incluido</h2>
            <div className="flex flex-col gap-2">
              {addon.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Zap, label: "Ativacao imediata" },
              { icon: Shield, label: "Pagamento seguro" },
              { icon: RefreshCcw, label: "Cancele quando quiser" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 text-center">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-medium text-muted-foreground leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Purchase card */}
        <div className="flex flex-col gap-4">
          <div className="sticky top-6 bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-3xl font-bold font-mono text-foreground">
                R$ {addon.price.toFixed(2).replace(".", ",")}
              </span>
              <span className="text-xs text-muted-foreground">por mes, cobrado mensalmente</span>
            </div>

            {purchased ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-semibold text-primary">Addon instalado!</span>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/marketplace">Ver outros addons</Link>
                </Button>
              </div>
            ) : (
              <Button
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11"
                onClick={handleBuy}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Processando...
                  </span>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Assinar por R$ {addon.price.toFixed(2).replace(".", ",")}
                  </>
                )}
              </Button>
            )}

            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              Cancele a qualquer momento sem multa. Acesso disponivel imediatamente.
            </p>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="flex flex-col gap-4 mt-10 pt-8 border-t border-border">
          <h2 className="text-base font-semibold text-foreground">Outros da mesma categoria</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/marketplace/${rel.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <Image src={rel.image} alt={rel.name} fill className="object-cover" />
                </div>
                <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                  <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{rel.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{rel.tagline}</span>
                  <span className="text-xs font-mono font-bold text-foreground">R$ {rel.price.toFixed(2).replace(".", ",")}/mes</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
