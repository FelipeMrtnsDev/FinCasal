"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Category, Expense, ExpenseType, PaymentMethod } from "@/lib/types"

type ExpenseEditDialogProps = {
  open: boolean
  expense: Expense | null
  categories: Category[]
  onOpenChange: (open: boolean) => void
  onSave: (id: string, payload: {
    description?: string
    amount?: number
    date?: string
    categoryId?: string | null
    paymentMethod?: string
    type?: string
  }) => Promise<void>
}

const toBackendPaymentMethod = (value: PaymentMethod): string => ({
  pix: "PIX",
  cartao: "CREDIT_CARD",
  dinheiro: "CASH",
  transferencia: "DEBIT",
  outro: "DEBIT",
}[value] || "DEBIT")

const toBackendType = (value: ExpenseType): string => ({
  fixo: "FIXED",
  variavel: "VARIABLE",
}[value] || "VARIABLE")

const toFrontPaymentMethod = (value?: string): PaymentMethod => {
  const key = String(value || "").toUpperCase()
  if (key === "PIX") return "pix"
  if (key === "CREDIT_CARD" || key === "CARD") return "cartao"
  if (key === "CASH") return "dinheiro"
  if (key === "DEBIT") return "transferencia"
  return "outro"
}

const toFrontType = (value?: string): ExpenseType => {
  const key = String(value || "").toUpperCase()
  if (key === "FIXED") return "fixo"
  return "variavel"
}

export function ExpenseEditDialog({
  open,
  expense,
  categories,
  onOpenChange,
  onSave,
}: ExpenseEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: "",
    categoryId: "",
    paymentMethod: "pix" as PaymentMethod,
    type: "variavel" as ExpenseType,
  })

  useEffect(() => {
    if (!expense) return
    const categoryId =
      expense.categoryId ||
      (typeof expense.category === "string"
        ? expense.category
        : expense.category?.id) ||
      ""
    setForm({
      description: expense.description || "",
      amount: String(expense.amount || ""),
      date: (() => {
        try {
          return format(new Date(expense.date), "yyyy-MM-dd")
        } catch {
          return ""
        }
      })(),
      categoryId,
      paymentMethod: toFrontPaymentMethod(String(expense.paymentMethod || "")),
      type: toFrontType(String(expense.type || "")),
    })
  }, [expense])

  const canSubmit = useMemo(
    () => !!expense && !!form.description.trim() && !!form.amount && Number(form.amount) > 0,
    [expense, form.description, form.amount],
  )

  const handleSubmit = async () => {
    if (!expense || !canSubmit) return
    setLoading(true)
    try {
      const payload: {
        description?: string
        amount?: number
        date?: string
        categoryId?: string | null
        paymentMethod?: string
        type?: string
      } = {}

      if (form.description.trim() !== expense.description) payload.description = form.description.trim()
      if (Number(form.amount) !== Number(expense.amount)) payload.amount = Number(form.amount)

      const currentDate = (() => {
        try {
          return format(new Date(expense.date), "yyyy-MM-dd")
        } catch {
          return ""
        }
      })()
      if (form.date && form.date !== currentDate) {
        const dateObj = new Date(form.date)
        const now = new Date()
        dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds())
        payload.date = dateObj.toISOString()
      }

      const currentCategoryId =
        expense.categoryId ||
        (typeof expense.category === "string" ? expense.category : expense.category?.id) ||
        ""
      if ((form.categoryId || "") !== (currentCategoryId || "")) {
        payload.categoryId = form.categoryId || null
      }

      const nextPayment = toBackendPaymentMethod(form.paymentMethod)
      if (String(expense.paymentMethod || "") !== nextPayment) payload.paymentMethod = nextPayment

      const nextType = toBackendType(form.type)
      if (String(expense.type || "").toUpperCase() !== nextType) payload.type = nextType

      await onSave(expense.id, payload)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Despesa</DialogTitle>
          <DialogDescription>Atualize os dados da despesa</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Descrição</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Almoço no restaurante"
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
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Categoria</Label>
              <Select value={form.categoryId || "none"} onValueChange={(value) => setForm((prev) => ({ ...prev, categoryId: value === "none" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Pagamento</Label>
              <Select value={form.paymentMethod} onValueChange={(value) => setForm((prev) => ({ ...prev, paymentMethod: value as PaymentMethod }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="transferencia">Débito</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as ExpenseType }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixo">Fixo</SelectItem>
                <SelectItem value="variavel">Variável</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

