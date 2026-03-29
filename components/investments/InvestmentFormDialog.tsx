"use client"

import { useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import type { Investment, InvestmentType, Person } from "@/lib/types"
import { INVESTMENT_TYPES } from "@/lib/types"

type InvestmentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: Omit<Investment, "id">) => Promise<void>
}

export function InvestmentFormDialog({ open, onOpenChange, onSubmit }: InvestmentFormDialogProps) {
  const { personNames, viewMode } = useFinance()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    person: "eu" as Person,
    type: "aporte" as InvestmentType,
    asset: "",
  })

  const resetForm = () => {
    setForm({
      description: "",
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      person: "eu",
      type: "aporte",
      asset: "",
    })
  }

  const handleSubmit = async () => {
    const asset = form.asset.trim()
    if (!form.description || !form.amount || parseFloat(form.amount) <= 0) return
    setSubmitting(true)
    try {
      const dateObj = new Date(form.date)
      const now = new Date()
      dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds())
      const isoDate = dateObj.toISOString()
      await onSubmit({
        description: form.description,
        amount: Number(parseFloat(form.amount).toFixed(2)),
        date: isoDate,
        person: form.person,
        type: form.type,
        asset,
      })
      resetForm()
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
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
              <Label>Ativo / Origem (Opcional)</Label>
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
          {viewMode === "casal" && (
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
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!form.description || !form.amount || submitting}
          >
            {submitting ? "Registrando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
