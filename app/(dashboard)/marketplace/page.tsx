"use client"

import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ADDONS } from "@/lib/addons-data"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MarketplacePage() {
  const [search, setSearch] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filtered = useMemo(() => {
    if (!search) return ADDONS
    return ADDONS.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.tagline.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Search */}
      <div 
        className={cn(
          "relative transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar addons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 text-base bg-card border-border rounded-2xl transition-shadow focus:shadow-lg"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          Nenhum addon encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((addon, index) => (
            <Link
              key={addon.id}
              href={`/marketplace/${addon.id}`}
              className={cn(
                "group flex flex-col rounded-2xl overflow-hidden bg-card border border-border",
                "hover:border-primary/30 hover:shadow-md transition-all duration-300",
                "hover:-translate-y-1",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{
                transitionDelay: mounted ? `${index * 50}ms` : "0ms"
              }}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={addon.image}
                  alt={addon.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Info */}
              <div className="flex flex-col p-3 gap-1">
                <h3 className="text-sm font-semibold text-foreground leading-snug truncate">
                  {addon.name}
                </h3>
                <span className="text-sm font-bold text-primary font-mono">
                  R$ {addon.price.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
