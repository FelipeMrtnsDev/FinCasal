"use client"

import React, { useState } from "react"
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
  DollarSign,
  Wallet,
} from "lucide-react"
import type { Person } from "@/lib/types"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { PageSkeleton } from "@/components/skeleton-loader"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

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

export default function RendaPage() {
  const { incomes, removeIncome, personNames, viewMode, isLoaded } = useFinance()
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!isLoaded) return <PageSkeleton />

  const totalIncome = incomes.reduce((a, i) => a + i.amount, 0)
  const recurringIncome = incomes.filter((i) => i.recurring).reduce((a, i) => a + i.amount, 0)

  const stats = [
    { label: "Renda Total", value: totalIncome, icon: DollarSign },
    { label: "Recorrente", value: recurringIncome, icon: ArrowUpRight },
    ...(viewMode === "casal"
      ? [
          { label: personNames.eu, value: incomes.filter((i) => i.person === "eu").reduce((a, i) => a + i.amount, 0), icon: Wallet },
          { label: personNames.parceiro, value: incomes.filter((i) => i.person === "parceiro").reduce((a, i) => a + i.amount, 0), icon: Wallet },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">Renda</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie suas fontes de renda</p>
        </div>
        <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Nova Renda
        </Button>
      </div>

      {/* Stat Cards */}
      <div className={cn("grid gap-3", viewMode === "casal" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2")}>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-xs font-medium text-muted-foreground truncate">{stat.label}</span>
                  <span className="text-base sm:text-lg font-bold font-mono text-foreground">{formatCurrency(stat.value)}</span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Income List */}
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
              {incomes
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((income) => (
                  <div
                    key={income.id}
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
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <IncomeForm open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
