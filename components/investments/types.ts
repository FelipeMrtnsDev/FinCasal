import type { InvestmentType } from "@/lib/types"

export type AssetSummary = {
  name: string
  aportes: number
  retornos: number
  lucro: number
}

export type InvestmentsSummaryResponse = {
  totalInvested?: number
  totalReturns?: number
  byAsset?: Array<{
    name?: string
    asset?: string
    aportes?: number
    retornos?: number
    totalInvested?: number
    totalReturns?: number
    lucro?: number
  }>
}

export type InvestmentStat = {
  label: string
  value: number
  icon: any
  trend: "up" | "down" | "neutral"
}

export const BACKEND_TYPE_MAP: Record<InvestmentType, "CONTRIBUTION" | "WITHDRAWAL" | "RETURN"> = {
  aporte: "CONTRIBUTION",
  retorno: "RETURN",
  dividendo: "RETURN",
  venda: "WITHDRAWAL",
  resgate: "WITHDRAWAL",
}
