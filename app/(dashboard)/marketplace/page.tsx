"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ADDONS } from "@/lib/addons-data"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function MarketplacePage() {
  const [search, setSearch] = useState("")

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
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar addons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 text-base bg-card border-border rounded-2xl"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          Nenhum addon encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((addon) => (
            <Link
              key={addon.id}
              href={`/marketplace/${addon.id}`}
              className="group flex flex-col rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={addon.image}
                  alt={addon.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
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
