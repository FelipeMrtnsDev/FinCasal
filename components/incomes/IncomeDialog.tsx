"use client"

import { useState } from "react"
import { useFinance } from "@/lib/finance-context"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { Person, Income } from "@/lib/types"

interface IncomeDialogProps {
  onAdd: (income: Omit<Income, "id">) => Promise<void>
}

export function IncomeDialog({ onAdd }: IncomeDialogProps) {
  const { personNames, viewMode } = useFinance()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    person: "eu" as Person,
    recurring: false,
  })

  const resetForm = () =>
    setForm({
      description: "",
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      person: "eu",
      recurring: false,
    })

  const handleSubmit = async () => {
    if (!form.description || !form.amount || parseFloat(form.amount) <= 0) return

    setLoading(true)
    try {
      const isoDate = `${form.date}T12:00:00.000Z`

      await onAdd({
        description: form.description,
        amount: Number(parseFloat(form.amount).toFixed(2)), // Garante que seja um número com 2 casas decimais
        date: isoDate,
        person: form.person,
        recurring: form.recurring,
      })
      resetForm()
      setOpen(false)
    } catch (error) {
      console.error("Error adding income:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Nova Renda
        </Button>
      </DialogTrigger>
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
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <div className={`grid ${viewMode === "casal" ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
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
