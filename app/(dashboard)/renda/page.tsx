"use client"

import React, { useState, useMemo } from "react"
import { useFinance } from "@/lib/finance-context"
import { motion, AnimatePresence } from "framer-motion"
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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Trash2,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  DollarSign,
  LineChart as LineChartIcon,
  ArrowDownRight,
} from "lucide-react"
import type { Person, InvestmentType } from "@/lib/types"
import { INVESTMENT_TYPES } from "@/lib/types"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
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

/* ─── INCOME FORM ─── */
function IncomeForm({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { addIncome, personNames } = useFinance()
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    person: "eu" as Person,
    recurring: false,
  })

  const resetForm = () =>
    setForm({ description: "", amount: "", date: format(new Date(), "yyyy-MM-dd"), person: "eu", recurring: false })

  const handleSubmit = () => {
    if (!form.description || !form.amount || parseFloat(form.amount) <= 0) return
    addIncome({
      description: form.description,
      amount: parseFloat(form.amount),
      date: form.date,
      person: form.person,
      recurring: form.recurring,
    })
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Renda</DialogTitle>
          <DialogDescription>Preencha os dados da nova fonte de renda.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Descricao</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Salario, Freelance, Bonus..."
            />
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
          <div className="grid grid-cols-2 gap-4">
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
            <div className="flex flex-col gap-2">
              <Label>Recorrente</Label>
              <div className="flex items-center gap-2 h-9">
                <Switch checked={form.recurring} onCheckedChange={(checked) => setForm({ ...form, recurring: checked })} />
                <span className="text-sm text-muted-foreground">{form.recurring ? "Sim" : "Nao"}</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!form.description || !form.amount}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─── INVESTMENT FORM ─── */
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

/* ─── STAT CARD ─── */
function StatCard({ label, value, icon: Icon, trend }: { label: string; value: number; icon: typeof TrendingUp; trend?: "up" | "down" | "neutral" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", trend === "down" ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary")}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className={cn("text-lg font-bold font-mono", trend === "down" ? "text-amber-600" : "text-foreground")}>{formatCurrency(value)}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ─── MAIN PAGE ─── */
export default function RendaPage() {
  const { incomes, investments, removeIncome, removeInvestment, personNames, viewMode } = useFinance()
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)
  const [investDialogOpen, setInvestDialogOpen] = useState(false)

  // Income stats
  const totalIncome = incomes.reduce((a, i) => a + i.amount, 0)
  const recurringIncome = incomes.filter((i) => i.recurring).reduce((a, i) => a + i.amount, 0)

  // Investment stats
  const totalAportes = investments.filter((i) => i.type === "aporte").reduce((a, i) => a + i.amount, 0)
  const totalRetornos = investments
    .filter((i) => ["retorno", "dividendo", "venda", "resgate"].includes(i.type))
    .reduce((a, i) => a + i.amount, 0)
  const lucroInvestimentos = totalRetornos - totalAportes

  // Group investments by asset
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

  // Group by type for pie chart
  const byType = useMemo(() => {
    const map = new Map<string, number>()
    investments.forEach((inv) => {
      const label = INVESTMENT_TYPES.find((t) => t.value === inv.type)?.label || inv.type
      map.set(label, (map.get(label) || 0) + inv.amount)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [investments])

  const PIE_COLORS = ["#166534", "#21C25E", "#4ade80", "#0d9488", "#f59e0b"]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">Renda & Investimentos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie fontes de renda, vendas e retornos de investimentos</p>
        </div>
      </div>

      <Tabs defaultValue="renda" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="renda">Renda</TabsTrigger>
          <TabsTrigger value="investimentos">Investimentos</TabsTrigger>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
        </TabsList>

        {/* ─── TAB: RENDA ─── */}
        <TabsContent value="renda" className="mt-6 flex flex-col gap-6">
          <div className="flex justify-end">
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIncomeDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Renda</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Renda Total" value={totalIncome} icon={DollarSign} />
            <StatCard label="Recorrente" value={recurringIncome} icon={ArrowUpRight} />
            {viewMode === "casal" && (
              <>
                <StatCard label={personNames.eu} value={incomes.filter((i) => i.person === "eu").reduce((a, i) => a + i.amount, 0)} icon={Wallet} />
                <StatCard label={personNames.parceiro} value={incomes.filter((i) => i.person === "parceiro").reduce((a, i) => a + i.amount, 0)} icon={Wallet} />
              </>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fontes de Renda</CardTitle>
              <CardDescription>{incomes.length} registros</CardDescription>
            </CardHeader>
            <CardContent>
              {incomes.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">Nenhuma renda registrada. Adicione sua primeira fonte de renda!</div>
              ) : (
                <div className="flex flex-col gap-1">
                  <AnimatePresence mode="popLayout">
                    {incomes
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((income) => (
                        <motion.div
                          key={income.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, x: -20 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                            <ArrowUpRight className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium text-foreground truncate">{income.description}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{income.person === "eu" ? personNames.eu : personNames.parceiro}</span>
                              {income.recurring && (
                                <>
                                  <span>{"/"}</span>
                                  <span className="text-primary font-medium">Recorrente</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-mono font-medium text-primary">+{formatCurrency(income.amount)}</span>
                              <span className="text-xs text-muted-foreground">
                                {(() => { try { return format(parseISO(income.date), "dd/MM/yyyy") } catch { return income.date } })()}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeIncome(income.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB: INVESTIMENTOS ─── */}
        <TabsContent value="investimentos" className="mt-6 flex flex-col gap-6">
          <div className="flex justify-end">
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setInvestDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Registro</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Aportado" value={totalAportes} icon={ArrowDownRight} trend="down" />
            <StatCard label="Total Retornos" value={totalRetornos} icon={TrendingUp} />
            <StatCard label={lucroInvestimentos >= 0 ? "Lucro" : "Prejuizo"} value={Math.abs(lucroInvestimentos)} icon={lucroInvestimentos >= 0 ? TrendingUp : TrendingDown} trend={lucroInvestimentos >= 0 ? "up" : "down"} />
            <StatCard label="Operacoes" value={investments.length} icon={BarChart3} />
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
                    <motion.div
                      key={asset.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <LineChartIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">{asset.name}</span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
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
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Investment list */}
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
                  <AnimatePresence mode="popLayout">
                    {investments
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((inv) => {
                        const Icon = INVEST_ICONS[inv.type]
                        const isInflow = inv.type !== "aporte"
                        return (
                          <motion.div
                            key={inv.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, x: -20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${INVEST_COLORS[inv.type]}20` }}>
                              <Icon className="w-4 h-4" style={{ color: INVEST_COLORS[inv.type] }} />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-medium text-foreground truncate">{inv.description}</span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: `${INVEST_COLORS[inv.type]}15`, color: INVEST_COLORS[inv.type] }}>
                                  {INVESTMENT_TYPES.find((t) => t.value === inv.type)?.label}
                                </span>
                                {inv.asset && <span className="truncate">{inv.asset}</span>}
                                <span>{inv.person === "eu" ? personNames.eu : personNames.parceiro}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex flex-col items-end">
                                <span className={cn("text-sm font-mono font-medium", isInflow ? "text-primary" : "text-amber-600")}>
                                  {isInflow ? "+" : "-"}{formatCurrency(inv.amount)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {(() => { try { return format(parseISO(inv.date), "dd/MM/yyyy") } catch { return inv.date } })()}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeInvestment(inv.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        )
                      })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB: RESUMO ─── */}
        <TabsContent value="resumo" className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Renda vs Investimentos bar chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Renda vs Investimentos</CardTitle>
                <CardDescription>Comparacao entre renda direta e retornos de investimentos</CardDescription>
              </CardHeader>
              <CardContent>
                {totalIncome === 0 && totalRetornos === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">Adicione renda ou investimentos para ver o grafico</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={[
                        { name: "Renda", valor: totalIncome },
                        { name: "Retornos", valor: totalRetornos },
                        { name: "Aportes", valor: totalAportes },
                      ]}
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), "Valor"]}
                        contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}
                      />
                      <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                        <Cell fill="#21C25E" />
                        <Cell fill="#4ade80" />
                        <Cell fill="#f59e0b" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Distribution by investment type - Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuicao por Tipo</CardTitle>
                <CardDescription>Como seus investimentos se dividem</CardDescription>
              </CardHeader>
              <CardContent>
                {byType.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">Sem dados de investimentos ainda</div>
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
                      <Tooltip formatter={(value: number) => [formatCurrency(value), "Valor"]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }} />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance by asset bar chart */}
          {byAsset.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance por Ativo</CardTitle>
                <CardDescription>Aportes vs retornos de cada ativo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={byAsset} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value)]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }} />
                    <Legend iconType="circle" iconSize={8} />
                    <Bar dataKey="aportes" name="Aportes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="retornos" name="Retornos" fill="#21C25E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Entrada total (renda + retorno investimentos) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Entrada Total</CardTitle>
              <CardDescription>Soma da renda direta com retornos dos investimentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-primary/5 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Renda Direta</span>
                  <span className="text-xl font-bold font-mono text-foreground">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Retorno Investimentos</span>
                  <span className="text-xl font-bold font-mono text-foreground">{formatCurrency(totalRetornos)}</span>
                </div>
                <div className="p-4 rounded-xl bg-primary/10 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-primary">Total Geral</span>
                  <span className="text-xl font-bold font-mono text-primary">{formatCurrency(totalIncome + totalRetornos)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <IncomeForm open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen} />
      <InvestmentForm open={investDialogOpen} onOpenChange={setInvestDialogOpen} />
    </motion.div>
  )
}
