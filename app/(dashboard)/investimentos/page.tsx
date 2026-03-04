"use client"

import React, { useState, useMemo } from "react"
import { useFinance } from "@/lib/finance-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
} from "lucide-react"
import type { Person, InvestmentType, Investment } from "@/lib/types"
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

function InvestmentForm({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { addInvestment, personNames } = useFinance()
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    person: "eu" as Person,
    type: "aporte" as InvestmentType,
    asset: "",
  })

  const resetForm = () =>
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
    resetForm()
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
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Compra PETR4, Venda BTC..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Ativo / Origem</Label>
              <Input
                value={form.asset}
                onChange={(e) => setForm({ ...form, asset: e.target.value })}
                placeholder="Ex: Nubank CDB, PETR4..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as InvestmentType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0,00"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Data</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Pessoa</Label>
            <Select value={form.person} onValueChange={(v) => setForm({ ...form, person: v as Person })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eu">{personNames.eu}</SelectItem>
                <SelectItem value="parceiro">{personNames.parceiro}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!form.description || !form.amount}>
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const PIE_COLORS = ["#166534", "#21C25E", "#4ade80", "#0d9488", "#f59e0b"]

export default function InvestimentosPage() {
  const { investments, removeInvestment, personNames, isLoaded } = useFinance()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)

  const totalAportes = investments.filter((i) => i.type === "aporte").reduce((a, i) => a + i.amount, 0)
  const totalRetornos = investments
    .filter((i) => ["retorno", "dividendo", "venda", "resgate"].includes(i.type))
    .reduce((a, i) => a + i.amount, 0)
  const lucro = totalRetornos - totalAportes

  const byAsset = useMemo(() => {
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
  }, [investments])

  const byType = useMemo(() => {
    const map = new Map<string, number>()
    investments.forEach((inv) => {
      const label = INVESTMENT_TYPES.find((t) => t.value === inv.type)?.label || inv.type
      map.set(label, (map.get(label) || 0) + inv.amount)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [investments])

  if (!isLoaded) return <PageSkeleton />

  const stats = [
    { label: "Total Aportado", value: totalAportes, icon: ArrowDownRight, trend: "down" as const },
    { label: "Total Retornos", value: totalRetornos, icon: TrendingUp, trend: "up" as const },
    { label: lucro >= 0 ? "Lucro" : "Prejuizo", value: Math.abs(lucro), icon: lucro >= 0 ? TrendingUp : TrendingDown, trend: lucro >= 0 ? "up" as const : "down" as const },
    { label: "Operacoes", value: investments.length, icon: BarChart3, trend: "neutral" as const },
  ]

  return (
    <div className="flex flex-col gap-6">
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-xs font-medium text-muted-foreground truncate">{stat.label}</span>
                  <span className={cn(
                    "text-base sm:text-lg font-bold font-mono",
                    stat.trend === "down" ? "text-amber-600" : "text-foreground"
                  )}>
                    {stat.trend === "neutral" ? stat.value : formatCurrency(stat.value)}
                  </span>
                </div>
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  stat.trend === "down" ? "bg-amber-100" : "bg-primary/10"
                )}>
                  <stat.icon className={cn("w-4 h-4", stat.trend === "down" ? "text-amber-600" : "text-primary")} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* By Asset cards */}
      {byAsset.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Ativo</CardTitle>
            <CardDescription>Resumo de aportes e retornos por ativo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {byAsset.map((asset) => (
                <div key={asset.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <LineChartIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">{asset.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span>Aporte: {formatCurrency(asset.aportes)}</span>
                      <span>Retorno: {formatCurrency(asset.retornos)}</span>
                    </div>
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuicao por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {byType.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">Sem dados ainda</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={byType}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {byType.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
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
            <CardHeader>
              <CardTitle className="text-base">Performance por Ativo</CardTitle>
            </CardHeader>
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

      {/* Investment list - Simplified */}
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
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => setSelectedInvestment(inv)}
                      className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left cursor-pointer"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${INVEST_COLORS[inv.type]}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: INVEST_COLORS[inv.type] }} />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium text-foreground truncate">{inv.asset || inv.description}</span>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded w-fit"
                          style={{ backgroundColor: `${INVEST_COLORS[inv.type]}15`, color: INVEST_COLORS[inv.type] }}
                        >
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

      {/* Detail Modal */}
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
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${INVEST_COLORS[inv.type]}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: INVEST_COLORS[inv.type] }} />
                    </div>
                    <div>
                      <DialogTitle className="text-lg">{inv.asset || "Sem ativo"}</DialogTitle>
                      <DialogDescription>
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${INVEST_COLORS[inv.type]}15`, color: INVEST_COLORS[inv.type] }}
                        >
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
                    <div className="flex items-center gap-3 text-sm">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Descricao</span>
                      <span className="ml-auto font-medium text-foreground truncate max-w-[180px]">{inv.description}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Data</span>
                      <span className="ml-auto font-medium text-foreground">
                        {(() => { try { return format(parseISO(inv.date), "dd/MM/yyyy") } catch { return inv.date } })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Ativo</span>
                      <span className="ml-auto font-medium text-foreground">{inv.asset || "Nao informado"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <User className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Pessoa</span>
                      <span className="ml-auto font-medium text-foreground">
                        {inv.person === "eu" ? personNames.eu : personNames.parceiro}
                      </span>
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
                    onClick={() => {
                      removeInvestment(inv.id)
                      setSelectedInvestment(null)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      <InvestmentForm open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
