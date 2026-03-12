"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categoryService } from "@/services/financeService"
import { Category } from "@/lib/types"
import { SaleProduct } from "./types"
import { Loader2 } from "lucide-react"

type SaleProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingProduct: SaleProduct | null
  onSave: (payload: Omit<SaleProduct, "id">, id?: string) => Promise<void>
}

export function SaleProductDialog({ open, onOpenChange, editingProduct, onSave }: SaleProductDialogProps) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    costPrice: "",
    salePrice: "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        category: editingProduct.category,
        costPrice: String(editingProduct.costPrice),
        salePrice: String(editingProduct.salePrice),
      })
      return
    }
    setForm({ name: "", category: "", costPrice: "", salePrice: "" })
  }, [editingProduct, open])

  useEffect(() => {
    if (!open) return
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const data = await categoryService.getAll()
        setCategories(data || [])
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [open])

  const handleSave = async () => {
    if (!form.name || !form.category || !form.costPrice || !form.salePrice || saving) return
    setSaving(true)
    try {
      await onSave(
        {
          name: form.name,
          category: form.category,
          costPrice: Number(form.costPrice),
          salePrice: Number(form.salePrice),
        },
        editingProduct?.id
      )
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription>Cadastre produto para agilizar o registro de vendas.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Bolo de pote"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder={loadingCategories ? "Carregando categorias..." : "Selecione uma categoria"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Custo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                placeholder="Ex: 10.00"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Venda (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                placeholder="Ex: 18.00"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!form.name || !form.category || !form.costPrice || !form.salePrice || saving || loadingCategories}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingProduct ? "Salvar" : "Criar Produto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
