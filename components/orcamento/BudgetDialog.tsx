"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Category } from "@/lib/types"
import { Plus } from "lucide-react"

type BudgetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  categoryId: string
  limitAmount: string
  onChangeCategoryId: (value: string) => void
  onChangeLimitAmount: (value: string) => void
  onSave: () => void
  onCancel: () => void
}

export function BudgetDialog({
  open,
  onOpenChange,
  categories,
  categoryId,
  limitAmount,
  onChangeCategoryId,
  onChangeLimitAmount,
  onSave,
  onCancel,
}: BudgetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:ml-auto">
          <Plus className="w-4 h-4" />
          Novo Orcamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Definir Orcamento</DialogTitle>
          <DialogDescription>Defina o limite de gasto para uma categoria neste mes.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={onChangeCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Limite (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={limitAmount}
              onChange={(e) => onChangeLimitAmount(e.target.value)}
              placeholder="Ex: 500,00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button
            onClick={onSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!categoryId || !limitAmount}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
