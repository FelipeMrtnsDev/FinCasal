import type { Investment, InvestmentType } from "@/lib/types"
import { INVESTMENT_TYPES } from "@/lib/types"
import type { AssetSummary, InvestmentsSummaryResponse } from "./types"

export function normalizeInvestmentType(type: string): InvestmentType {
  const value = (type || "").toLowerCase()
  if (value === "contribution") return "aporte"
  if (value === "return") return "retorno"
  if (value === "withdrawal") return "resgate"
  if (value === "aporte") return "aporte"
  if (value === "retorno") return "retorno"
  if (value === "dividendo") return "dividendo"
  if (value === "venda") return "venda"
  if (value === "resgate") return "resgate"
  return "aporte"
}

export function normalizeInvestment(raw: any): Investment {
  return {
    id: String(raw?.id ?? ""),
    description: String(raw?.description ?? ""),
    amount: typeof raw?.amount === "number" ? raw.amount : Number.parseFloat(String(raw?.amount ?? 0)) || 0,
    date: String(raw?.date ?? new Date().toISOString()),
    person: raw?.person === "parceiro" ? "parceiro" : "eu",
    type: normalizeInvestmentType(String(raw?.type ?? "")),
    asset: String(raw?.asset ?? ""),
  }
}

export function getByAssetFromInvestments(investments: Investment[]): AssetSummary[] {
  const map = new Map<string, { aportes: number; retornos: number }>()
  investments.forEach((inv) => {
    const key = inv.asset || "Sem ativo"
    const curr = map.get(key) || { aportes: 0, retornos: 0 }
    if (inv.type === "aporte") curr.aportes += inv.amount
    else curr.retornos += inv.amount
    map.set(key, curr)
  })
  return Array.from(map.entries()).map(([name, data]) => ({
    name,
    aportes: data.aportes,
    retornos: data.retornos,
    lucro: data.retornos - data.aportes,
  }))
}

export function getByAsset(summary: InvestmentsSummaryResponse | null, fallback: AssetSummary[]): AssetSummary[] {
  if (summary?.byAsset?.length) {
    return summary.byAsset.map((item) => {
      const name = item.name || item.asset || "Sem ativo"
      const aportes = Number(item.aportes ?? item.totalInvested ?? 0)
      const retornos = Number(item.retornos ?? item.totalReturns ?? 0)
      const lucro = Number(item.lucro ?? retornos - aportes)
      return { name, aportes, retornos, lucro }
    })
  }
  return fallback
}

export function getByType(investments: Investment[]) {
  const map = new Map<string, number>()
  investments.forEach((inv) => {
    const label = INVESTMENT_TYPES.find((t) => t.value === inv.type)?.label || inv.type
    map.set(label, (map.get(label) || 0) + inv.amount)
  })
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
}
