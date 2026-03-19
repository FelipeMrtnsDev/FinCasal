"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, ArrowDownRight, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import type { Investment } from "@/lib/types"
import { useFinance } from "@/lib/finance-context"
import { investmentService } from "@/services/financeService"
import { InvestmentFormDialog } from "./InvestmentFormDialog"
import { InvestmentStatsCards } from "./InvestmentStatsCards"
import { InvestmentAssetCards } from "./InvestmentAssetCards"
import { InvestmentAssetDialog } from "./InvestmentAssetDialog"
import { InvestmentCharts } from "./InvestmentCharts"
import { InvestmentOperationsList } from "./InvestmentOperationsList"
import { InvestmentDetailDialog } from "./InvestmentDetailDialog"
import { BACKEND_TYPE_MAP, type AssetSummary, type InvestmentStat, type InvestmentsSummaryResponse } from "./types"
import { getByAsset, getByAssetFromInvestments, getByType, normalizeInvestment } from "./utils"

type InvestmentsTabContentProps = {
  personNames: { eu: string; parceiro: string }
}

export function InvestmentsTabContent({ personNames }: InvestmentsTabContentProps) {
  const { viewMode } = useFinance()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [summary, setSummary] = useState<InvestmentsSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<AssetSummary | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [investmentsResponse, summaryResponse] = await Promise.all([
        investmentService.getAll({ view: viewMode }),
        investmentService.getSummary(viewMode),
      ])
      setInvestments((investmentsResponse || []).map(normalizeInvestment))
      setSummary(summaryResponse || null)
    } catch (error) {
      console.error("Erro ao buscar investimentos:", error)
      setInvestments([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [viewMode])

  const handleAddInvestment = async (payload: Omit<Investment, "id">) => {
    const asset = payload.asset.trim()
    const requestBody = {
      description: payload.description,
      amount: payload.amount,
      date: payload.date,
      type: BACKEND_TYPE_MAP[payload.type],
      ...(asset ? { asset } : {}),
    }
    await investmentService.create(requestBody, viewMode)
    await fetchData()
  }

  const handleDeleteInvestment = async (id: string) => {
    await investmentService.delete(id)
    setSelectedInvestment(null)
    await fetchData()
  }

  const computedByAsset = useMemo(() => getByAssetFromInvestments(investments), [investments])
  const byAsset = useMemo(() => getByAsset(summary, computedByAsset), [summary, computedByAsset])
  const byType = useMemo(() => getByType(investments), [investments])

  const totalAportes =
    typeof summary?.totalInvested === "number"
      ? Number(summary.totalInvested)
      : investments.filter((i) => i.type === "aporte").reduce((a, i) => a + i.amount, 0)

  const totalRetornos =
    typeof summary?.totalReturns === "number"
      ? Number(summary.totalReturns)
      : investments
        .filter((i) => ["retorno", "dividendo", "venda", "resgate"].includes(i.type))
        .reduce((a, i) => a + i.amount, 0)

  const lucro = totalRetornos - totalAportes

  const stats: InvestmentStat[] = [
    { label: "Total Aportado", value: totalAportes, icon: ArrowDownRight, trend: "down" },
    { label: "Total Retornos", value: totalRetornos, icon: TrendingUp, trend: "up" },
    { label: lucro >= 0 ? "Lucro" : "Prejuizo", value: Math.abs(lucro), icon: lucro >= 0 ? TrendingUp : TrendingDown, trend: lucro >= 0 ? "up" : "down" },
    { label: "Operacoes", value: investments.length, icon: BarChart3, trend: "neutral" },
  ]

  return (
    <TabsContent value="investimentos" className="flex flex-col gap-6 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">Investimentos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie aportes, retornos, vendas e dividendos</p>
        </div>
        <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Novo Registro
        </Button>
      </div>

      <InvestmentStatsCards stats={stats} loading={loading} />

      {!loading && <InvestmentAssetCards byAsset={byAsset} onSelect={setSelectedAsset} />}

      {!loading && <InvestmentCharts byType={byType} byAsset={byAsset} />}

      {!loading && <InvestmentOperationsList investments={investments} onSelect={setSelectedInvestment} />}

      {!loading && <InvestmentAssetDialog selectedAsset={selectedAsset} onClose={() => setSelectedAsset(null)} />}

      {!loading && (
        <InvestmentDetailDialog
          investment={selectedInvestment}
          personNames={personNames}
          onClose={() => setSelectedInvestment(null)}
          onDelete={handleDeleteInvestment}
        />
      )}

      {!loading && <InvestmentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleAddInvestment} />}
    </TabsContent>
  )
}
