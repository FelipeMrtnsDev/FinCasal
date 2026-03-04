"use client"

import React, { useState, useMemo, useRef } from "react"
import { useFinance } from "@/lib/finance-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Plus,
  Upload,
  Trash2,
  Search,
  Filter,
  CreditCard,
  Smartphone,
  Banknote,
  ArrowLeftRight,
  HelpCircle,
} from "lucide-react"
import { PAYMENT_METHODS } from "@/lib/types"
import type { PaymentMethod, ExpenseType, Person } from "@/lib/types"
import { format, parseISO } from "date-fns"
import Papa from "papaparse"
import { cn } from "@/lib/utils"
import { PageSkeleton } from "@/components/skeleton-loader"

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const paymentIcons: Record<PaymentMethod, typeof CreditCard> = {
  pix: Smartphone,
  cartao: CreditCard,
  dinheiro: Banknote,
  transferencia: ArrowLeftRight,
  outro: HelpCircle,
}

export default function DespesasPage() {
  const {
    expenses,
    categories,
    addExpense,
    removeExpense,
    importCSV,
    viewMode,
    personNames,
    isLoaded,
  } = useFinance()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [csvDialogOpen, setCsvDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterPayment, setFilterPayment] = useState<string>("all")
  const [filterPerson, setFilterPerson] = useState<string>("all")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    category: categories[0]?.id || "",
    paymentMethod: "pix" as PaymentMethod,
    type: "variavel" as ExpenseType,
    person: "eu" as Person,
  })

  const resetForm = () => {
    setForm({
      description: "",
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      category: categories[0]?.id || "",
      paymentMethod: "pix",
      type: "variavel",
      person: "eu",
    })
  }

  const handleSubmit = () => {
    if (!form.description || !form.amount || parseFloat(form.amount) <= 0) return
    addExpense({
      description: form.description,
      amount: parseFloat(form.amount),
      date: form.date,
      category: form.category,
      paymentMethod: form.paymentMethod,
      type: form.type,
      person: form.person,
    })
    resetForm()
    setDialogOpen(false)
  }

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const imported = results.data
          .map((row: Record<string, string>) => {
            const description = row.descricao || row.description || row.Descricao || row.Description || row.DESCRICAO || ""
            const amountStr = row.valor || row.amount || row.Valor || row.Amount || row.VALOR || "0"
            const amount = Math.abs(parseFloat(amountStr.replace(",", ".").replace(/[^\d.-]/g, "")) || 0)
            const date = row.data || row.date || row.Data || row.Date || row.DATA || format(new Date(), "yyyy-MM-dd")

            if (!description || amount === 0) return null

            return {
              description,
              amount,
              date,
              category: "outros",
              paymentMethod: "outro" as PaymentMethod,
              type: "variavel" as ExpenseType,
              person: "eu" as Person,
            }
          })
          .filter(Boolean) as Exclude<ReturnType<typeof Array.prototype.map>[number], null>[]

        if (imported.length > 0) {
          importCSV(imported)
          setCsvDialogOpen(false)
        }
      },
    })

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (searchTerm && !e.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
        if (filterCategory !== "all" && e.category !== filterCategory) return false
        if (filterPayment !== "all" && e.paymentMethod !== filterPayment) return false
        if (filterPerson !== "all" && e.person !== filterPerson) return false
        return true
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [expenses, searchTerm, filterCategory, filterPayment, filterPerson])

  if (!isLoaded) return <PageSkeleton />

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Despesas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filteredExpenses.length} despesas registradas
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Add Expense */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Despesa</DialogTitle>
                <DialogDescription>Preencha os dados da nova despesa abaixo.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label>Descricao</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Ex: Almoco no restaurante"
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
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Categoria</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Pagamento</Label>
                    <Select
                      value={form.paymentMethod}
                      onValueChange={(v) => setForm({ ...form, paymentMethod: v as PaymentMethod })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((pm) => (
                          <SelectItem key={pm.value} value={pm.value}>
                            {pm.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Tipo</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => setForm({ ...form, type: v as ExpenseType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixo">Fixo</SelectItem>
                        <SelectItem value="variavel">Variavel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Pessoa</Label>
                    <Select
                      value={form.person}
                      onValueChange={(v) => setForm({ ...form, person: v as Person })}
                    >
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
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!form.description || !form.amount}
                >
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* CSV Import - Prominent Section */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-4 sm:p-6">
          <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col flex-1 text-center sm:text-left">
                <span className="text-sm font-semibold text-foreground">Importar Extrato Bancario</span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  Envie o CSV do seu banco e todas as transacoes serao adicionadas automaticamente
                </span>
              </div>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                  <Upload className="w-4 h-4" />
                  Importar CSV
                </Button>
              </DialogTrigger>
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Extrato CSV</DialogTitle>
                <DialogDescription>
                  Selecione um arquivo CSV do seu extrato bancario. O arquivo deve conter colunas como descricao/description e valor/amount.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Arraste o arquivo aqui ou clique para selecionar</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Colunas aceitas: descricao, valor, data (ou em ingles)
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="cursor-pointer max-w-xs mx-auto"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar despesas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPayment} onValueChange={setFilterPayment}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {PAYMENT_METHODS.map((pm) => (
                    <SelectItem key={pm.value} value={pm.value}>
                      {pm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {viewMode === "casal" && (
                <Select value={filterPerson} onValueChange={setFilterPerson}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Pessoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="eu">{personNames.eu}</SelectItem>
                    <SelectItem value="parceiro">{personNames.parceiro}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Nenhuma despesa encontrada. Adicione sua primeira despesa!
            </div>
          ) : (
            <div className="flex flex-col gap-1">
                {filteredExpenses.map((expense) => {
                  const cat = categories.find((c) => c.id === expense.category)
                  const PayIcon = paymentIcons[expense.paymentMethod] || HelpCircle
                    return (
                    <div
                      key={expense.id}
                      className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cat?.color ? `${cat.color}20` : undefined }}
                      >
                        <PayIcon className="w-4 h-4" style={{ color: cat?.color }} />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium text-foreground truncate">{expense.description}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{cat?.name || "Sem categoria"}</span>
                          <span>{"/"}</span>
                          <span className="capitalize">{expense.type}</span>
                          {viewMode === "casal" && (
                            <>
                              <span>{"/"}</span>
                              <span>{expense.person === "eu" ? personNames.eu : personNames.parceiro}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-mono font-medium text-foreground">
                            {formatCurrency(expense.amount)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(() => { try { return format(parseISO(expense.date), "dd/MM/yyyy") } catch { return expense.date } })()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeExpense(expense.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
