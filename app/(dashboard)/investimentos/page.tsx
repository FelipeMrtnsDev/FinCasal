"use client"

import React, { useState, useMemo } from "react"
import { useFinance } from "@/lib/finance-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  DollarSign,
  LineChart as LineChartIcon,
  ArrowDownRight,
  Calendar,
  User,
  Tag,
  FileText,
  ShoppingBag,
  Package,
  PackagePlus,
  Pencil,
  Receipt,
  ChevronRight,
} from "lucide-react"
import type { Person, InvestmentType, Investment, SaleProduct, Sale } from "@/lib/types"
import { INVESTMENT_TYPES } from "@/lib/types"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { PageSkeleton } from "@/components/skeleton-loader"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

// ─── Investment helpers ──────────────────────────────────────────────────────

const INVEST_COLORS: Record<InvestmentType, string> = {
  aporte: "#166534",
  retorno: "#21C25E",
  dividendo: "#4ade80",
  venda: "#0d9488",
  resgate: "#f59e0b",
}

const INVEST_ICONS: Record<InvestmentType, typeof TrendingUp> = {
  aporte: ArrowDownRight,
  retorno: TrendingUp,
  dividendo: DollarSign,
  venda: BarChart3,
  resgate: Wallet,
}

const PIE_COLORS = ["#166534", "#21C25E", "#4ade80", "#0d9488", "#f59e0b", "#6366f1", "#ec4899"]

// ─── Investment Form ─────────────────────────────────────────────────────────

function InvestmentForm({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addInvestment, personNames } = useFinance()
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    person: "eu" as Person,
    type: "aporte" as InvestmentType,
    asset: "",
  })

  const reset = () =>
    setForm({ description: "", amount: "", date: format(new Date(), "yyyy-MM-dd"), person: "eu", type: "aporte", asset: "" })

  const handleSubmit = () => {
    if (!form.description || !form.amount || parseFloat(form.amount) <= 0) return
    addInvestment({
      description: form.description,
      amount: parseFloat(form.amount),
      date: form.date,
      person: form.person,
      type: form.type,
      asset: form.asset,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Investimento</DialogTitle>
          <DialogDescription>Adicione um aporte, retorno, venda, dividendo ou resgate.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Descricao</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Compra PETR4, Venda BTC..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Ativo / Origem</Label>
              <Input value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })} placeholder="Ex: Nubank CDB, PETR4..." />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as InvestmentType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Data</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Pessoa</Label>
            <Select value={form.person} onValueChange={(v) => setForm({ ...form, person: v as Person })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="eu">{personNames.eu}</SelectItem>
                <SelectItem value="parceiro">{personNames.parceiro}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!form.description || !form.amount}>
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Sale Product Form ───────────────────────────────────────────────────────

function ProductForm({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing?: SaleProduct | null
}) {
  const { addSaleProduct, updateSaleProduct } = useFinance()
  const [form, setForm] = useState({
    name: editing?.name ?? "",
    category: editing?.category ?? "",
    costPrice: editing?.costPrice?.toString() ?? "",
    salePrice: editing?.salePrice?.toString() ?? "",
  })

  React.useEffect(() => {
    if (open) {
      setForm({
        name: editing?.name ?? "",
        category: editing?.category ?? "",
        costPrice: editing?.costPrice?.toString() ?? "",
        salePrice: editing?.salePrice?.toString() ?? "",
      })
    }
  }, [open, editing])

  const handleSubmit = () => {
    if (!form.name || !form.salePrice) return
    const data = {
      name: form.name,
      category: form.category || "Geral",
      costPrice: parseFloat(form.costPrice) || 0,
      salePrice: parseFloat(form.salePrice),
    }
    if (editing) {
      updateSaleProduct(editing.id, data)
    } else {
      addSaleProduct(data)
    }
    onOpenChange(false)
  }

  const margin = form.salePrice && form.costPrice
    ? ((parseFloat(form.salePrice) - parseFloat(form.costPrice)) / parseFloat(form.salePrice)) * 100
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription>Cadastre um produto com preco de custo e venda.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Nome do produto</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Refrigerante, Coxinha..." />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Categoria</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Bebidas, Salgados..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Custo unitario (R$)</Label>
              <Input type="number" step="0.01" min="0" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} placeholder="0,00" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Preco de venda (R$)</Label>
              <Input type="number" step="0.01" min="0" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} placeholder="0,00" />
            </div>
          </div>
          {margin !== null && (
            <div className={cn("text-center py-2 rounded-lg text-sm font-medium", margin >= 0 ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-700")}>
              Margem: {margin.toFixed(1)}% &nbsp;|&nbsp; Lucro por unidade: {formatCurrency(parseFloat(form.salePrice) - parseFloat(form.costPrice))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!form.name || !form.salePrice}>
            {editing ? "Salvar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Sale Record Form ─────────────────────────────────────────────────────────

function SaleForm({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addSale, saleProducts, personNames } = useFinance()
  const [form, setForm] = useState({
    productId: "",
    quantity: "1",
    date: format(new Date(), "yyyy-MM-dd"),
    person: "parceiro" as Person,
  })

  const product = saleProducts.find((p) => p.id === form.productId)
  const qty = parseInt(form.quantity) || 0
  const total = product ? product.salePrice * qty : 0
  const lucro = product ? (product.salePrice - product.costPrice) * qty : 0

  const handleSubmit = () => {
    if (!form.productId || qty <= 0 || !product) return
    addSale({
      productId: product.id,
      productName: product.name,
      category: product.category,
      quantity: qty,
      unitCost: product.costPrice,
      unitPrice: product.salePrice,
      date: form.date,
      person: form.person,
    })
    setForm({ productId: "", quantity: "1", date: format(new Date(), "yyyy-MM-dd"), person: "parceiro" })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar Venda</DialogTitle>
          <DialogDescription>Registre uma venda a partir de um produto cadastrado.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Produto</Label>
            <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione um produto..." /></SelectTrigger>
              <SelectContent>
                {saleProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.salePrice)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Quantidade</Label>
              <Input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Data</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Quem vendeu</Label>
            <Select value={form.person} onValueChange={(v) => setForm({ ...form, person: v as Person })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="eu">{personNames.eu}</SelectItem>
                <SelectItem value="parceiro">{personNames.parceiro}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {product && qty > 0 && (
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Faturamento</span>
                <span className="font-mono font-semibold text-foreground">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lucro estimado</span>
                <span className={cn("font-mono font-semibold", lucro >= 0 ? "text-primary" : "text-amber-600")}>{formatCurrency(lucro)}</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!form.productId || qty <= 0}>
            Registrar Venda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvestimentosPage() {
  const { investments, removeInvestment, sales, removeSale, saleProducts, removeSaleProduct, personNames, isLoaded } = useFinance()

  // Investment state
  const [investDialogOpen, setInvestDialogOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<{ name: string; aportes: number; retornos: number; lucro: number } | null>(null)

  // Sales state
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [saleDialogOpen, setSaleDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<SaleProduct | null>(null)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  // ── Investment computations ──────────────────────────────────────────────
  const totalAportes = investments.filter((i) => i.type === "aporte").reduce((a, i) => a + i.amount, 0)
  const totalRetornos = investments.filter((i) => i.type !== "aporte").reduce((a, i) => a + i.amount, 0)
  const lucroInvest = totalRetornos - totalAportes

  const byAsset = useMemo(() => {
    const map = new Map<string, { aportes: number; retornos: number }>()
    investments.forEach((inv) => {
      const key = inv.asset || "Sem ativo"
      const curr = map.get(key) || { aportes: 0, retornos: 0 }
      if (inv.type === "aporte") curr.aportes += inv.amount
      else curr.retornos += inv.amount
      map.set(key, curr)
    })
    return Array.from(map.entries()).map(([name, d]) => ({ name, aportes: d.aportes, retornos: d.retornos, lucro: d.retornos - d.aportes }))
  }, [investments])

  const byType = useMemo(() => {
    const map = new Map<string, number>()
    investments.forEach((inv) => {
      const label = INVESTMENT_TYPES.find((t) => t.value === inv.type)?.label || inv.type
      map.set(label, (map.get(label) || 0) + inv.amount)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [investments])

  // ── Sales computations ───────────────────────────────────────────────────
  const totalFaturamento = sales.reduce((a, s) => a + s.unitPrice * s.quantity, 0)
  const totalCusto = sales.reduce((a, s) => a + s.unitCost * s.quantity, 0)
  const lucroVendas = totalFaturamento - totalCusto
  const totalUnidades = sales.reduce((a, s) => a + s.quantity, 0)

  const byCategory = useMemo(() => {
    const map = new Map<string, { faturamento: number; custo: number; unidades: number }>()
    sales.forEach((s) => {
      const key = s.category || "Geral"
      const curr = map.get(key) || { faturamento: 0, custo: 0, unidades: 0 }
      curr.faturamento += s.unitPrice * s.quantity
      curr.custo += s.unitCost * s.quantity
      curr.unidades += s.quantity
      map.set(key, curr)
    })
    return Array.from(map.entries()).map(([name, d]) => ({ name, faturamento: d.faturamento, custo: d.custo, unidades: d.unidades, lucro: d.faturamento - d.custo }))
  }, [sales])

  const byProduct = useMemo(() => {
    const map = new Map<string, { faturamento: number; custo: number; unidades: number }>()
    sales.forEach((s) => {
      const curr = map.get(s.productName) || { faturamento: 0, custo: 0, unidades: 0 }
      curr.faturamento += s.unitPrice * s.quantity
      curr.custo += s.unitCost * s.quantity
      curr.unidades += s.quantity
      map.set(s.productName, curr)
    })
    return Array.from(map.entries()).map(([name, d]) => ({ name, faturamento: d.faturamento, custo: d.custo, unidades: d.unidades, lucro: d.faturamento - d.custo }))
  }, [sales])

  const investStats = [
    { label: "Total Aportado", value: totalAportes, icon: ArrowDownRight, color: "amber" },
    { label: "Total Retornos", value: totalRetornos, icon: TrendingUp, color: "green" },
    { label: lucroInvest >= 0 ? "Lucro" : "Prejuizo", value: Math.abs(lucroInvest), icon: lucroInvest >= 0 ? TrendingUp : TrendingDown, color: lucroInvest >= 0 ? "green" : "amber" },
    { label: "Operacoes", value: investments.length, icon: BarChart3, color: "neutral" as const },
  ]

  if (!isLoaded) return <PageSkeleton />

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="vendas" className="w-full">
        {/* Tab header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
            <TabsTrigger value="vendas" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="investimentos" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Investimentos
            </TabsTrigger>
          </TabsList>

          {/* Tab-scoped action buttons rendered inside each tab below */}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAB: VENDAS
        ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="vendas" className="flex flex-col gap-6 mt-4">
          {/* Header */}
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

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Faturamento", value: totalFaturamento, icon: Receipt, color: "green" },
              { label: "Custo Total", value: totalCusto, icon: Package, color: "amber" },
              { label: lucroVendas >= 0 ? "Lucro" : "Prejuizo", value: Math.abs(lucroVendas), icon: lucroVendas >= 0 ? TrendingUp : TrendingDown, color: lucroVendas >= 0 ? "green" : "amber" },
              { label: "Unidades Vendidas", value: totalUnidades, icon: ShoppingBag, color: "neutral" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", stat.color === "amber" ? "bg-amber-100" : stat.color === "neutral" ? "bg-muted" : "bg-primary/10")}>
                      <stat.icon className={cn("w-4 h-4", stat.color === "amber" ? "text-amber-600" : stat.color === "neutral" ? "text-muted-foreground" : "text-primary")} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-muted-foreground leading-tight">{stat.label}</span>
                      <span className={cn("text-base font-bold font-mono", stat.color === "amber" ? "text-amber-600" : "text-foreground")}>
                        {stat.color === "neutral" ? stat.value : formatCurrency(stat.value)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Products catalog */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Catalogo de Produtos</CardTitle>
              <CardDescription>{saleProducts.length} produtos cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              {saleProducts.length === 0 ? (
                <div className="py-10 text-center">
                  <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
                  <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => { setEditingProduct(null); setProductDialogOpen(true) }}>
                    <PackagePlus className="w-4 h-4" />
                    Cadastrar primeiro produto
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {saleProducts.map((product) => {
                    const margin = product.salePrice > 0
                      ? ((product.salePrice - product.costPrice) / product.salePrice) * 100
                      : 0
                    return (
                      <div key={product.id} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors group">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">{product.name}</span>
                          <span className="text-xs text-muted-foreground">{product.category}</span>
                        </div>
                        <div className="flex flex-col items-end shrink-0 mr-2">
                          <span className="text-sm font-mono font-semibold text-foreground">{formatCurrency(product.salePrice)}</span>
                          <span className={cn("text-xs font-mono", margin >= 0 ? "text-primary" : "text-amber-600")}>
                            margem {margin.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setEditingProduct(product); setProductDialogOpen(true) }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeSaleProduct(product.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charts: by category */}
          {byCategory.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Faturamento por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={byCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="faturamento" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {byCategory.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value), "Faturamento"]} />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Faturamento vs Custo por Produto</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byProduct}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
                      <Legend iconType="circle" iconSize={8} />
                      <Bar dataKey="custo" name="Custo" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="faturamento" name="Faturamento" fill="#21C25E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* By category list — clickable */}
          {byCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Por Categoria</CardTitle>
                <CardDescription>Toque para ver detalhes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  {byCategory.map((cat, idx) => (
                    <button
                      key={cat.name}
                      type="button"
                      className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left"
                      onClick={() => {}}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${PIE_COLORS[idx % PIE_COLORS.length]}20` }}>
                        <ShoppingBag className="w-4 h-4" style={{ color: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">{cat.name}</span>
                        <span className="text-xs text-muted-foreground">{cat.unidades} unidades</span>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-sm font-mono font-semibold text-foreground">{formatCurrency(cat.faturamento)}</span>
                        <span className={cn("text-xs font-mono", cat.lucro >= 0 ? "text-primary" : "text-amber-600")}>
                          lucro {formatCurrency(cat.lucro)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sales history */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historico de Vendas</CardTitle>
              <CardDescription>{sales.length} registros</CardDescription>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <div className="py-10 text-center">
                  <Receipt className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {sales
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((sale) => (
                      <button
                        key={sale.id}
                        type="button"
                        onClick={() => setSelectedSale(sale)}
                        className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">{sale.productName}</span>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded w-fit bg-primary/10 text-primary">
                            {sale.quantity}x
                          </span>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-sm font-mono font-medium text-foreground">
                            {formatCurrency(sale.unitPrice * sale.quantity)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(() => { try { return format(parseISO(sale.date), "dd/MM") } catch { return sale.date } })()}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════
            TAB: INVESTIMENTOS
        ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="investimentos" className="flex flex-col gap-6 mt-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">Investimentos</h1>
              <p className="text-muted-foreground text-sm mt-1">Gerencie aportes, retornos, vendas e dividendos</p>
            </div>
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto" onClick={() => setInvestDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Novo Registro
            </Button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {investStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", stat.color === "amber" ? "bg-amber-100" : stat.color === "neutral" ? "bg-muted" : "bg-primary/10")}>
                      <stat.icon className={cn("w-4 h-4", stat.color === "amber" ? "text-amber-600" : stat.color === "neutral" ? "text-muted-foreground" : "text-primary")} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-muted-foreground leading-tight">{stat.label}</span>
                      <span className={cn("text-base font-bold font-mono", stat.color === "amber" ? "text-amber-600" : "text-foreground")}>
                        {stat.color === "neutral" ? stat.value : formatCurrency(stat.value)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* By Asset list */}
          {byAsset.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Por Ativo</CardTitle>
                <CardDescription>Toque para ver detalhes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  {byAsset.map((asset) => (
                    <button key={asset.name} type="button" onClick={() => setSelectedAsset(asset)} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left cursor-pointer">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <LineChartIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">{asset.name}</span>
                        <span className="text-xs text-muted-foreground">{formatCurrency(asset.aportes)} aportado</span>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className={cn("text-sm font-mono font-bold", asset.lucro >= 0 ? "text-primary" : "text-amber-600")}>
                          {asset.lucro >= 0 ? "+" : ""}{formatCurrency(asset.lucro)}
                        </span>
                        {asset.aportes > 0 && (
                          <span className={cn("text-xs font-mono", asset.lucro >= 0 ? "text-primary/70" : "text-amber-500")}>
                            {asset.lucro >= 0 ? "+" : ""}{((asset.lucro / asset.aportes) * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Distribuicao por Tipo</CardTitle></CardHeader>
              <CardContent>
                {byType.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">Sem dados ainda</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={byType} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {byType.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value), "Valor"]} />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {byAsset.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Performance por Ativo</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byAsset}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
                      <Legend iconType="circle" iconSize={8} />
                      <Bar dataKey="aportes" name="Aportes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="retornos" name="Retornos" fill="#21C25E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Investment history */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historico de Operacoes</CardTitle>
              <CardDescription>{investments.length} registros</CardDescription>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">Nenhum investimento registrado. Adicione seu primeiro registro!</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {investments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((inv) => {
                      const Icon = INVEST_ICONS[inv.type]
                      const isInflow = inv.type !== "aporte"
                      const typeLabel = INVESTMENT_TYPES.find((t) => t.value === inv.type)?.label || inv.type
                      return (
                        <button key={inv.id} type="button" onClick={() => setSelectedInvestment(inv)} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left cursor-pointer">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${INVEST_COLORS[inv.type]}20` }}>
                            <Icon className="w-4 h-4" style={{ color: INVEST_COLORS[inv.type] }} />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium text-foreground truncate">{inv.asset || inv.description}</span>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded w-fit" style={{ backgroundColor: `${INVEST_COLORS[inv.type]}15`, color: INVEST_COLORS[inv.type] }}>
                              {typeLabel}
                            </span>
                          </div>
                          <div className="flex flex-col items-end shrink-0">
                            <span className={cn("text-sm font-mono font-medium", isInflow ? "text-primary" : "text-amber-600")}>
                              {isInflow ? "+" : "-"}{formatCurrency(inv.amount)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {(() => { try { return format(parseISO(inv.date), "dd/MM") } catch { return inv.date } })()}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}

      {/* Investment detail modal */}
      <Dialog open={!!selectedInvestment} onOpenChange={(open) => { if (!open) setSelectedInvestment(null) }}>
        <DialogContent className="max-w-sm">
          {selectedInvestment && (() => {
            const inv = selectedInvestment
            const Icon = INVEST_ICONS[inv.type]
            const isInflow = inv.type !== "aporte"
            const typeLabel = INVESTMENT_TYPES.find((t) => t.value === inv.type)?.label || inv.type
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${INVEST_COLORS[inv.type]}20` }}>
                      <Icon className="w-5 h-5" style={{ color: INVEST_COLORS[inv.type] }} />
                    </div>
                    <div>
                      <DialogTitle className="text-lg">{inv.asset || "Sem ativo"}</DialogTitle>
                      <DialogDescription>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${INVEST_COLORS[inv.type]}15`, color: INVEST_COLORS[inv.type] }}>
                          {typeLabel}
                        </span>
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="text-center py-3 rounded-xl bg-muted/50">
                    <span className={cn("text-2xl font-bold font-mono", isInflow ? "text-primary" : "text-amber-600")}>
                      {isInflow ? "+" : "-"}{formatCurrency(inv.amount)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      { Icon: FileText, label: "Descricao", value: inv.description },
                      { Icon: Calendar, label: "Data", value: (() => { try { return format(parseISO(inv.date), "dd/MM/yyyy") } catch { return inv.date } })() },
                      { Icon: Tag, label: "Ativo", value: inv.asset || "Nao informado" },
                      { Icon: User, label: "Pessoa", value: inv.person === "eu" ? personNames.eu : personNames.parceiro },
                    ].map(({ Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 text-sm">
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">{label}</span>
                        <span className="ml-auto font-medium text-foreground truncate max-w-[180px]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter className="flex-row gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="flex-1">Fechar</Button>
                  </DialogClose>
                  <Button variant="destructive" className="flex-1 gap-2" onClick={() => { removeInvestment(inv.id); setSelectedInvestment(null) }}>
                    <Trash2 className="w-4 h-4" />Excluir
                  </Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Asset detail modal */}
      <Dialog open={!!selectedAsset} onOpenChange={(open) => { if (!open) setSelectedAsset(null) }}>
        <DialogContent className="max-w-sm">
          {selectedAsset && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <LineChartIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">{selectedAsset.name}</DialogTitle>
                    <DialogDescription>Resumo do ativo</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className={cn("text-center py-4 rounded-xl", selectedAsset.lucro >= 0 ? "bg-primary/5" : "bg-amber-50")}>
                  <span className="text-xs text-muted-foreground block mb-1">Resultado</span>
                  <span className={cn("text-2xl font-bold font-mono", selectedAsset.lucro >= 0 ? "text-primary" : "text-amber-600")}>
                    {selectedAsset.lucro >= 0 ? "+" : ""}{formatCurrency(selectedAsset.lucro)}
                  </span>
                  {selectedAsset.aportes > 0 && (
                    <span className={cn("text-sm font-mono block mt-0.5", selectedAsset.lucro >= 0 ? "text-primary/70" : "text-amber-500")}>
                      {selectedAsset.lucro >= 0 ? "+" : ""}{((selectedAsset.lucro / selectedAsset.aportes) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total aportado</span>
                    <span className="font-mono font-medium text-amber-600">{formatCurrency(selectedAsset.aportes)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total retornado</span>
                    <span className="font-mono font-medium text-primary">{formatCurrency(selectedAsset.retornos)}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="w-full">Fechar</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Sale detail modal */}
      <Dialog open={!!selectedSale} onOpenChange={(open) => { if (!open) setSelectedSale(null) }}>
        <DialogContent className="max-w-sm">
          {selectedSale && (() => {
            const s = selectedSale
            const total = s.unitPrice * s.quantity
            const lucro = (s.unitPrice - s.unitCost) * s.quantity
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg">{s.productName}</DialogTitle>
                      <DialogDescription>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">{s.category}</span>
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center py-3 rounded-xl bg-primary/5">
                      <span className="text-xs text-muted-foreground block mb-1">Faturamento</span>
                      <span className="text-lg font-bold font-mono text-foreground">{formatCurrency(total)}</span>
                    </div>
                    <div className={cn("text-center py-3 rounded-xl", lucro >= 0 ? "bg-primary/5" : "bg-amber-50")}>
                      <span className="text-xs text-muted-foreground block mb-1">Lucro</span>
                      <span className={cn("text-lg font-bold font-mono", lucro >= 0 ? "text-primary" : "text-amber-600")}>{formatCurrency(lucro)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      { Icon: Package, label: "Quantidade", value: `${s.quantity} unidades` },
                      { Icon: Tag, label: "Preco unitario", value: formatCurrency(s.unitPrice) },
                      { Icon: Receipt, label: "Custo unitario", value: formatCurrency(s.unitCost) },
                      { Icon: Calendar, label: "Data", value: (() => { try { return format(parseISO(s.date), "dd/MM/yyyy") } catch { return s.date } })() },
                      { Icon: User, label: "Vendedor(a)", value: s.person === "eu" ? personNames.eu : personNames.parceiro },
                    ].map(({ Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3 text-sm">
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">{label}</span>
                        <span className="ml-auto font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter className="flex-row gap-2">
                  <DialogClose asChild>
                    <Button variant="outline" className="flex-1">Fechar</Button>
                  </DialogClose>
                  <Button variant="destructive" className="flex-1 gap-2" onClick={() => { removeSale(s.id); setSelectedSale(null) }}>
                    <Trash2 className="w-4 h-4" />Excluir
                  </Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      <ProductForm open={productDialogOpen} onOpenChange={setProductDialogOpen} editing={editingProduct} />
      <SaleForm open={saleDialogOpen} onOpenChange={setSaleDialogOpen} />
      <InvestmentForm open={investDialogOpen} onOpenChange={setInvestDialogOpen} />
    </div>
  )
}
