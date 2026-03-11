"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SaleProduct } from "./types"

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

  const handleSave = async () => {
    if (!form.name || !form.category || !form.costPrice || !form.salePrice) return
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
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Categoria</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Custo (R$)</Label>
              <Input type="number" step="0.01" min="0" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Venda (R$)</Label>
              <Input type="number" step="0.01" min="0" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!form.name || !form.category || !form.costPrice || !form.salePrice}>
            {editingProduct ? "Salvar" : "Criar Produto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
