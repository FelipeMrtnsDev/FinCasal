"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PackagePlus, Plus, Receipt, ShoppingBag, TrendingDown, TrendingUp, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFinance } from "@/lib/finance-context"
import { Sale, SaleProduct, SalesStat } from "./types"
import { saleProductService, salesService, SalesSummaryDTO } from "@/services/financeService"
import { SalesStatsCards } from "./SalesStatsCards"
import { SalesProductsCard } from "./SalesProductsCard"
import { SalesCharts } from "./SalesCharts"
import { SalesCategoryCard } from "./SalesCategoryCard"
import { SalesHistoryCard } from "./SalesHistoryCard"
import { SaleDialog } from "./SaleDialog"
import { SaleProductDialog } from "./SaleProductDialog"
import { SaleDetailDialog } from "./SaleDetailDialog"

export function SalesTabContent() {
  const { viewMode } = useFinance()
  const [sales, setSales] = useState<Sale[]>([])
  const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([])
  const [summary, setSummary] = useState<SalesSummaryDTO>({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalUnits: 0,
  })
  const [categoryRows, setCategoryRows] = useState<Array<{ category: string; revenue: number; profit: number }>>([])
  const [productRows, setProductRows] = useState<Array<{ productId: string; name: string; revenue: number; profitPerUnit: number }>>([])
  const [loading, setLoading] = useState(true)
  const [saleDialogOpen, setSaleDialogOpen] = useState(false)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<SaleProduct | null>(null)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [productsData, salesData, summaryData, byCategoryData, byProductData] = await Promise.all([
        saleProductService.getAll(),
        salesService.getAll({ view: viewMode }),
        salesService.getSummary(undefined, viewMode),
        salesService.getByCategory(undefined, viewMode),
        salesService.getByProduct(undefined, viewMode),
      ])

      const normalizedProducts: SaleProduct[] = productsData.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        costPrice: Number(product.costPrice) || 0,
        salePrice: Number(product.salePrice) || 0,
      }))
      const productMap = new Map(normalizedProducts.map((product) => [product.id, product]))

      const normalizedSales: Sale[] = salesData.map((sale) => {
        const product = productMap.get(sale.productId)
        return {
          id: sale.id,
          productId: sale.productId,
          productName: sale.productName ?? product?.name ?? "Produto",
          category: sale.category ?? product?.category ?? "Geral",
          quantity: Number(sale.quantity) || 0,
          unitPrice: Number(sale.unitPrice ?? product?.salePrice ?? 0),
          unitCost: Number(sale.unitCost ?? product?.costPrice ?? 0),
          date: sale.date,
        }
      })

      setSaleProducts(normalizedProducts)
      setSales(normalizedSales)
      setSummary({
        totalRevenue: Number(summaryData.totalRevenue) || 0,
        totalCost: Number(summaryData.totalCost) || 0,
        totalProfit: Number(summaryData.totalProfit) || 0,
        totalUnits: Number(summaryData.totalUnits) || 0,
      })
      setCategoryRows(byCategoryData)
      setProductRows(byProductData)
    } catch (error) {
      console.error("Erro ao carregar vendas:", error)
      setSaleProducts([])
      setSales([])
      setSummary({ totalRevenue: 0, totalCost: 0, totalProfit: 0, totalUnits: 0 })
      setCategoryRows([])
      setProductRows([])
    } finally {
      setLoading(false)
    }
  }, [viewMode])

  useEffect(() => {
    loadData()
  }, [loadData])

  const unitsByCategory = useMemo(() => {
    return sales.reduce<Record<string, number>>((acc, sale) => {
      acc[sale.category] = (acc[sale.category] || 0) + sale.quantity
      return acc
    }, {})
  }, [sales])

  const unitsByProduct = useMemo(() => {
    return sales.reduce<Record<string, number>>((acc, sale) => {
      acc[sale.productId] = (acc[sale.productId] || 0) + sale.quantity
      return acc
    }, {})
  }, [sales])

  const byCategory = useMemo(
    () =>
      categoryRows.map((row) => ({
        name: row.category || "Geral",
        faturamento: Number(row.revenue) || 0,
        lucro: Number(row.profit) || 0,
        unidades: unitsByCategory[row.category || "Geral"] || 0,
      })),
    [categoryRows, unitsByCategory]
  )

  const byProduct = useMemo(
    () =>
      productRows.map((row) => {
        const units = unitsByProduct[row.productId] || 0
        const faturamento = Number(row.revenue) || 0
        const profitPerUnit = Number(row.profitPerUnit) || 0
        const lucroTotal = profitPerUnit * units
        const custo = faturamento - lucroTotal
        return {
          name: row.name || "Produto",
          faturamento,
          custo: Number.isFinite(custo) ? Math.max(0, custo) : 0,
        }
      }),
    [productRows, unitsByProduct]
  )

  const salesStats: SalesStat[] = [
    { label: "Faturamento", value: summary.totalRevenue, icon: Receipt, color: "green" },
    { label: "Custo Total", value: summary.totalCost, icon: Package, color: "amber" },
    { label: summary.totalProfit >= 0 ? "Lucro" : "Prejuizo", value: Math.abs(summary.totalProfit), icon: summary.totalProfit >= 0 ? TrendingUp : TrendingDown, color: summary.totalProfit >= 0 ? "green" : "amber" },
    { label: "Unidades Vendidas", value: summary.totalUnits, icon: ShoppingBag, color: "neutral" },
  ]

  const addOrUpdateProduct = async (payload: Omit<SaleProduct, "id">, id?: string) => {
    if (id) {
      await saleProductService.update(id, payload)
      await loadData()
      return
    }
    await saleProductService.create(payload)
    await loadData()
  }

  const removeSaleProduct = async (id: string) => {
    await saleProductService.delete(id)
    await loadData()
  }

  const addSale = async (payload: { productId: string; quantity: number; date: string }) => {
    await salesService.create({
      productId: payload.productId,
      quantity: payload.quantity,
      date: payload.date,
    }, viewMode)
    await loadData()
  }

  const removeSale = async (id: string) => {
    await salesService.delete(id)
    await loadData()
    setSelectedSale(null)
  }

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">Vendas</h1>
          <p className="text-muted-foreground text-sm mt-1">Controle faturamento, custo e lucro por produto</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { setEditingProduct(null); setProductDialogOpen(true) }}>
            <PackagePlus className="w-4 h-4" />
            Novo Produto
          </Button>
          <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setSaleDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Registrar Venda
          </Button>
        </div>
      </div>

      <SalesStatsCards stats={salesStats} loading={loading} />

      {!loading && (
        <SalesProductsCard
          products={saleProducts}
          onNewProduct={() => { setEditingProduct(null); setProductDialogOpen(true) }}
          onEditProduct={(product) => { setEditingProduct(product); setProductDialogOpen(true) }}
          onDeleteProduct={removeSaleProduct}
        />
      )}

      {!loading && <SalesCharts byCategory={byCategory} byProduct={byProduct} />}

      {!loading && <SalesCategoryCard byCategory={byCategory} />}

      {!loading && <SalesHistoryCard sales={sales} onSelectSale={setSelectedSale} />}

      {!loading && <SaleDialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen} products={saleProducts} onSave={addSale} />}
      {!loading && (
        <SaleProductDialog
          open={productDialogOpen}
          onOpenChange={setProductDialogOpen}
          editingProduct={editingProduct}
          onSave={addOrUpdateProduct}
        />
      )}
      {!loading && <SaleDetailDialog sale={selectedSale} onClose={() => setSelectedSale(null)} onDelete={removeSale} />}
    </div>
  )
}
