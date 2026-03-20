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
  ShoppingBag,
  Package,
  PackagePlus,
  Pencil,
  DollarSign,
  TrendingUp,
  BarChart3,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  Calendar,
  Tag,
} from "lucide-react"
import type { Person, SaleProduct, Sale, StockMovementType } from "@/lib/types"
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
  AreaChart,
  Area,
} from "recharts"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const PIE_COLORS = ["#166534", "#21C25E", "#4ade80", "#0d9488", "#f59e0b", "#6366f1", "#ec4899"]

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
    stock: editing?.stock?.toString() ?? "0",
  })

  React.useEffect(() => {
    if (open) {
      setForm({
        name: editing?.name ?? "",
        category: editing?.category ?? "",
        costPrice: editing?.costPrice?.toString() ?? "",
        salePrice: editing?.salePrice?.toString() ?? "",
        stock: editing?.stock?.toString() ?? "0",
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
      stock: parseInt(form.stock) || 0,
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
          <div className="flex flex-col gap-2">
            <Label>Estoque inicial</Label>
            <Input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
          </div>
          {margin !== null && (
            <div className={cn("text-center py-2 rounded-lg text-sm font-medium", margin >= 0 ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-700")}>
              Margem: {margin.toFixed(1)}% | Lucro/un: {formatCurrency(parseFloat(form.salePrice) - parseFloat(form.costPrice))}
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
  const { addSale, saleProducts, personNames, updateProductStock, addStockMovement } = useFinance()
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
    
    // Registrar venda
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
    
    // Atualizar estoque
    updateProductStock(product.id, Math.max(0, product.stock - qty))
    
    // Registrar movimentacao
    addStockMovement({
      productId: product.id,
      productName: product.name,
      type: "saida",
      quantity: qty,
      date: form.date,
      note: "Venda registrada",
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
                    {p.name} — {formatCurrency(p.salePrice)} (estoque: {p.stock})
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
            <>
              {product.stock < qty && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 text-amber-700 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Estoque insuficiente ({product.stock} disponivel)
                </div>
              )}
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
            </>
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

// ─── Stock Movement Form ──────────────────────────────────────────────────────

function StockForm({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { saleProducts, updateProductStock, addStockMovement } = useFinance()
  const [form, setForm] = useState({
    productId: "",
    type: "entrada" as StockMovementType,
    quantity: "1",
    note: "",
  })

  const product = saleProducts.find((p) => p.id === form.productId)

  const handleSubmit = () => {
    if (!form.productId || !product) return
    const qty = parseInt(form.quantity) || 0
    if (qty <= 0) return

    const newStock = form.type === "entrada" 
      ? product.stock + qty 
      : form.type === "saida" 
        ? Math.max(0, product.stock - qty) 
        : qty

    updateProductStock(product.id, newStock)
    addStockMovement({
      productId: product.id,
      productName: product.name,
      type: form.type,
      quantity: form.type === "ajuste" ? newStock : qty,
      date: format(new Date(), "yyyy-MM-dd"),
      note: form.note || (form.type === "entrada" ? "Entrada de estoque" : form.type === "saida" ? "Saida de estoque" : "Ajuste de estoque"),
    })

    setForm({ productId: "", type: "entrada", quantity: "1", note: "" })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Movimentar Estoque</DialogTitle>
          <DialogDescription>Adicione, remova ou ajuste o estoque de um produto.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Produto</Label>
            <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione um produto..." /></SelectTrigger>
              <SelectContent>
                {saleProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} (atual: {p.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tipo de movimentacao</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as StockMovementType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Entrada (+)</SelectItem>
                <SelectItem value="saida">Saida (-)</SelectItem>
                <SelectItem value="ajuste">Ajuste (definir valor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{form.type === "ajuste" ? "Novo estoque" : "Quantidade"}</Label>
            <Input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Observacao (opcional)</Label>
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Ex: Compra de fornecedor..." />
          </div>
          {product && (
            <div className="text-center py-2 rounded-lg bg-muted/50 text-sm">
              Estoque atual: <span className="font-semibold">{product.stock}</span>
              {form.type !== "ajuste" && parseInt(form.quantity) > 0 && (
                <span className="text-muted-foreground">
                  {" "}→ {form.type === "entrada" ? product.stock + parseInt(form.quantity) : Math.max(0, product.stock - parseInt(form.quantity))}
                </span>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!form.productId}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VendasPage() {
  const { sales, removeSale, saleProducts, removeSaleProduct, stockMovements, personNames, isLoaded } = useFinance()

  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [saleDialogOpen, setSaleDialogOpen] = useState(false)
  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<SaleProduct | null>(null)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

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

  const marginByProduct = useMemo(() => {
    return saleProducts.map((p) => {
      const margin = p.salePrice > 0 ? ((p.salePrice - p.costPrice) / p.salePrice) * 100 : 0
      return { name: p.name, margem: parseFloat(margin.toFixed(1)), lucroUnit: p.salePrice - p.costPrice }
    }).sort((a, b) => b.margem - a.margem)
  }, [saleProducts])

  const dailySales = useMemo(() => {
    const today = new Date()
    const days: { date: string; faturamento: number; lucro: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = format(d, "yyyy-MM-dd")
      const label = format(d, "dd/MM")
      const daySales = sales.filter((s) => s.date === dateStr)
      const faturamento = daySales.reduce((a, s) => a + s.unitPrice * s.quantity, 0)
      const lucro = daySales.reduce((a, s) => a + (s.unitPrice - s.unitCost) * s.quantity, 0)
      days.push({ date: label, faturamento, lucro })
    }
    return days
  }, [sales])

  // ── Stock computations ───────────────────────────────────────────────────
  const totalStock = saleProducts.reduce((a, p) => a + p.stock, 0)
  const stockValue = saleProducts.reduce((a, p) => a + p.stock * p.costPrice, 0)
  const potentialRevenue = saleProducts.reduce((a, p) => a + p.stock * p.salePrice, 0)
  const lowStockProducts = saleProducts.filter((p) => p.stock <= 5)

  const stockByCategory = useMemo(() => {
    const map = new Map<string, number>()
    saleProducts.forEach((p) => {
      map.set(p.category, (map.get(p.category) || 0) + p.stock)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [saleProducts])

  const recentMovements = useMemo(() => {
    return [...stockMovements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
  }, [stockMovements])

  const salesStats = [
    { label: "Faturamento", value: totalFaturamento, icon: DollarSign, color: "green" },
    { label: "Lucro", value: lucroVendas, icon: TrendingUp, color: lucroVendas >= 0 ? "green" : "amber" },
    { label: "Custo", value: totalCusto, icon: BarChart3, color: "amber" },
    { label: "Unidades", value: totalUnidades, icon: Package, color: "neutral" as const },
  ]

  const stockStats = [
    { label: "Total Estoque", value: totalStock, icon: Package, color: "neutral" as const },
    { label: "Valor Estoque", value: stockValue, icon: DollarSign, color: "green" },
    { label: "Receita Potencial", value: potentialRevenue, icon: TrendingUp, color: "green" },
    { label: "Estoque Baixo", value: lowStockProducts.length, icon: AlertTriangle, color: lowStockProducts.length > 0 ? "amber" : "neutral" as const },
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
            <TabsTrigger value="estoque" className="gap-2">
              <Package className="w-4 h-4" />
              Estoque
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            VENDAS TAB
            ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="vendas" className="mt-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Vendas</h1>
              <p className="text-muted-foreground text-sm mt-1">{sales.length} vendas registradas</p>
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

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {salesStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      stat.color === "amber" ? "bg-amber-100" : stat.color === "green" ? "bg-primary/10" : "bg-muted"
                    )}>
                      <stat.icon className={cn("w-4 h-4", stat.color === "amber" ? "text-amber-600" : stat.color === "green" ? "text-primary" : "text-muted-foreground")} />
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

          {/* Charts */}
          {(byCategory.length > 0 || marginByProduct.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {byCategory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Faturamento por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={byCategory} dataKey="faturamento" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => [formatCurrency(value), "Faturamento"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {marginByProduct.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Margem por Produto</CardTitle>
                    <CardDescription>% de lucro sobre o preco de venda</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={Math.max(200, marginByProduct.length * 45)}>
                      <BarChart data={marginByProduct} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                        <Tooltip formatter={(value: number) => [`${value}%`, "Margem"]} />
                        <Bar dataKey="margem" name="Margem" fill="#21C25E" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Daily evolution chart */}
          {dailySales.some((d) => d.faturamento > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evolucao de Vendas (14 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={dailySales}>
                    <defs>
                      <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#21C25E" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#21C25E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value)]} />
                    <Area type="monotone" dataKey="faturamento" name="Faturamento" stroke="#21C25E" fill="url(#gradFat)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Products catalog */}
          {saleProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Catalogo de Produtos</CardTitle>
                <CardDescription>{saleProducts.length} produtos cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  {saleProducts.map((p) => {
                    const margin = p.salePrice > 0 ? ((p.salePrice - p.costPrice) / p.salePrice) * 100 : 0
                    return (
                      <div key={p.id} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors group">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="px-1.5 py-0.5 rounded bg-muted text-[10px]">{p.category}</span>
                            <span>Estoque: {p.stock}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-mono font-semibold text-foreground">{formatCurrency(p.salePrice)}</span>
                            <span className="text-xs font-mono text-primary">{margin.toFixed(0)}% margem</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => { setEditingProduct(p); setProductDialogOpen(true) }}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => removeSaleProduct(p.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sales history */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historico de Vendas</CardTitle>
              <CardDescription>Toque para ver detalhes</CardDescription>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">Nenhuma venda registrada ainda.</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale) => (
                    <button
                      key={sale.id}
                      type="button"
                      onClick={() => setSelectedSale(sale)}
                      className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">{sale.productName}</span>
                        <span className="text-xs text-muted-foreground">{sale.quantity}x</span>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-sm font-mono font-semibold text-primary">{formatCurrency(sale.unitPrice * sale.quantity)}</span>
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

        {/* ════════════════════════════════════════════════════════════════════════
            ESTOQUE TAB
            ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="estoque" className="mt-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Estoque</h1>
              <p className="text-muted-foreground text-sm mt-1">{saleProducts.length} produtos no catalogo</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setStockDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Movimentar Estoque
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stockStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      stat.color === "amber" ? "bg-amber-100" : stat.color === "green" ? "bg-primary/10" : "bg-muted"
                    )}>
                      <stat.icon className={cn("w-4 h-4", stat.color === "amber" ? "text-amber-600" : stat.color === "green" ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-muted-foreground leading-tight">{stat.label}</span>
                      <span className={cn("text-base font-bold font-mono", stat.color === "amber" ? "text-amber-600" : "text-foreground")}>
                        {stat.label === "Total Estoque" || stat.label === "Estoque Baixo" ? stat.value : formatCurrency(stat.value)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock by category */}
            {stockByCategory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Estoque por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={stockByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                        {stockByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, "Unidades"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Stock value by product */}
            {saleProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Valor do Estoque por Produto</CardTitle>
                  <CardDescription>Custo total investido em cada produto</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={Math.max(200, saleProducts.length * 45)}>
                    <BarChart data={saleProducts.map(p => ({ name: p.name, valor: p.stock * p.costPrice })).sort((a, b) => b.valor - a.valor)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), "Valor"]} />
                      <Bar dataKey="valor" name="Valor" fill="#166534" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Low stock alert */}
          {lowStockProducts.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-4 h-4" />
                  Produtos com Estoque Baixo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {lowStockProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white">
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-sm font-mono text-amber-600">{p.stock} unidades</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products with stock */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Niveis de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              {saleProducts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">Nenhum produto cadastrado.</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {saleProducts.sort((a, b) => a.stock - b.stock).map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        p.stock <= 5 ? "bg-amber-100" : "bg-primary/10"
                      )}>
                        <Package className={cn("w-4 h-4", p.stock <= 5 ? "text-amber-600" : "text-primary")} />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                        <span className="text-xs text-muted-foreground">{p.category}</span>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className={cn("text-lg font-bold font-mono", p.stock <= 5 ? "text-amber-600" : "text-foreground")}>{p.stock}</span>
                        <span className="text-xs text-muted-foreground">unidades</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent movements */}
          {recentMovements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Movimentacoes Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  {recentMovements.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        m.type === "entrada" ? "bg-primary/10" : m.type === "saida" ? "bg-amber-100" : "bg-muted"
                      )}>
                        {m.type === "entrada" ? <ArrowDown className="w-4 h-4 text-primary" /> : m.type === "saida" ? <ArrowUp className="w-4 h-4 text-amber-600" /> : <Tag className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">{m.productName}</span>
                        <span className="text-xs text-muted-foreground">{m.note}</span>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className={cn(
                          "text-sm font-mono font-semibold",
                          m.type === "entrada" ? "text-primary" : m.type === "saida" ? "text-amber-600" : "text-foreground"
                        )}>
                          {m.type === "entrada" ? "+" : m.type === "saida" ? "-" : ""}{m.quantity}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(() => { try { return format(parseISO(m.date), "dd/MM") } catch { return m.date } })()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Sale detail modal */}
      <Dialog open={!!selectedSale} onOpenChange={(open) => { if (!open) setSelectedSale(null) }}>
        <DialogContent className="max-w-sm">
          {selectedSale && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">{selectedSale.productName}</DialogTitle>
                    <DialogDescription>{selectedSale.category}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="text-center py-3 rounded-xl bg-primary/5">
                  <span className="text-2xl font-bold font-mono text-primary">{formatCurrency(selectedSale.unitPrice * selectedSale.quantity)}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantidade</span>
                    <span className="font-medium">{selectedSale.quantity}x {formatCurrency(selectedSale.unitPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lucro</span>
                    <span className="font-mono font-medium text-primary">{formatCurrency((selectedSale.unitPrice - selectedSale.unitCost) * selectedSale.quantity)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Data</span>
                    <span className="font-medium">{(() => { try { return format(parseISO(selectedSale.date), "dd/MM/yyyy") } catch { return selectedSale.date } })()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Vendedor</span>
                    <span className="font-medium">{selectedSale.person === "eu" ? personNames.eu : personNames.parceiro}</span>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-row gap-2">
                <DialogClose asChild>
                  <Button variant="outline" className="flex-1">Fechar</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => { removeSale(selectedSale.id); setSelectedSale(null) }}
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ProductForm open={productDialogOpen} onOpenChange={setProductDialogOpen} editing={editingProduct} />
      <SaleForm open={saleDialogOpen} onOpenChange={setSaleDialogOpen} />
      <StockForm open={stockDialogOpen} onOpenChange={setStockDialogOpen} />
    </div>
  )
}
