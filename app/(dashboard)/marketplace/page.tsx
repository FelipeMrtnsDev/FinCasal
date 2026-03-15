"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ADDONS, ADDON_CATEGORIES } from "@/lib/addons-data"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Store, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

const BADGE_STYLES: Record<string, string> = {
  Novo: "bg-violet-100 text-violet-700 border-violet-200",
  Popular: "bg-amber-100 text-amber-700 border-amber-200",
  Destaque: "bg-primary/10 text-primary border-primary/20",
}

export default function MarketplacePage() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [purchased, setPurchased] = useState<string[]>([])

  const filtered = useMemo(() => {
    return ADDONS.filter((a) => {
      const matchCat = activeCategory === "Todos" || a.category === activeCategory
      const matchSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.tagline.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [search, activeCategory])

  const featured = ADDONS.filter((a) => a.badge === "Popular" || a.badge === "Destaque").slice(0, 2)

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">Marketplace</h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Expanda o FinCasal com recursos extras para o seu casal
        </p>
      </div>

      {/* Featured Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {featured.map((addon) => (
          <Link key={addon.id} href={`/marketplace/${addon.id}`} className="group block rounded-2xl overflow-hidden relative h-44 shadow-sm hover:shadow-md transition-shadow">
            <Image
              src={addon.image}
              alt={addon.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {addon.badge && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-white/80 mb-1 block">
                  {addon.badge}
                </span>
              )}
              <h3 className="text-white font-bold text-base leading-tight">{addon.name}</h3>
              <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{addon.tagline}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar addons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {ADDON_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border shrink-0",
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Nenhum addon encontrado para sua busca.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((addon) => {
            const isPurchased = purchased.includes(addon.id)
            return (
              <Link
                key={addon.id}
                href={`/marketplace/${addon.id}`}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all flex flex-col"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-muted">
                  <Image
                    src={addon.image}
                    alt={addon.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {addon.badge && (
                    <div className="absolute top-3 left-3">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border backdrop-blur-sm", BADGE_STYLES[addon.badge])}>
                        {addon.badge}
                      </span>
                    </div>
                  )}
                  {isPurchased && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-primary text-primary-foreground">
                        Instalado
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{addon.category}</span>
                    <h3 className="text-sm font-bold text-foreground leading-snug">{addon.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{addon.tagline}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-base font-bold text-foreground font-mono">
                      R$ {addon.price.toFixed(2).replace(".", ",")}
                      <span className="text-xs font-normal text-muted-foreground">/mes</span>
                    </span>
                    <span className="text-xs font-semibold text-primary group-hover:underline">
                      Ver detalhes
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Footer note */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
        <ShoppingBag className="w-5 h-5 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Todos os addons sao cobrados mensalmente e podem ser cancelados a qualquer momento. O acesso e ativado imediatamente apos a compra.
        </p>
      </div>
    </div>
  )
}
