"use client"

import { useState, useEffect } from "react"
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
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { Category, Expense, ExpenseType, PaymentMethod, Person, PAYMENT_METHODS } from "@/lib/types"
import { useFinance } from "@/lib/finance-context"

interface ExpenseDialogProps {
  categories: Category[]
  onAdd: (expense: Omit<Expense, "id">) => Promise<void>
}

export function ExpenseDialog({ categories, onAdd }: ExpenseDialogProps) {
  const { personNames } = useFinance()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    category: "",
    paymentMethod: "pix" as PaymentMethod,
    type: "variavel" as ExpenseType,
    person: "eu" as Person,
  })

  // Update default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !form.category) {
      setForm(prev => ({ ...prev, category: categories[0].id }))
    }
  }, [categories])

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

  const handleSubmit = async () => {
    if (!form.description || !form.amount || parseFloat(form.amount) <= 0) return

    setLoading(true)
    try {
      // Mapeamento para o formato do backend
      const backendPaymentMethod = {
        pix: "PIX",
        cartao: "CREDIT_CARD",
        dinheiro: "CASH",
        transferencia: "TRANSFER",
        outro: "OTHER"
      }[form.paymentMethod] || "OTHER";

      const backendType = {
        fixo: "FIXED",
        variavel: "VARIABLE"
      }[form.type] || "VARIABLE";

      // Formatar data para ISO 8601 completo (com hora)
      // O backend espera algo como: 2026-03-10T15:30:00.000Z
      const dateObj = new Date(form.date);
      // Adiciona hora atual para não ficar sempre 00:00
      const now = new Date();
      dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      const isoDate = dateObj.toISOString();

      await onAdd({
        description: form.description,
        amount: parseFloat(form.amount),
        date: isoDate,
        category: form.category,
        paymentMethod: backendPaymentMethod as any,
        type: backendType as any,
        person: form.person,
      })
      resetForm()
      setOpen(false)
    } catch (error) {
      console.error("Error adding expense:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                  <SelectValue placeholder="Selecione" />
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
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!form.description || !form.amount || loading}
          >
            {loading ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
