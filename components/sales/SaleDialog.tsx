"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SaleProduct } from "./types"
import { Loader2 } from "lucide-react"

type SaleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: SaleProduct[]
  onSave: (payload: { productId: string; quantity: number; date: string }) => Promise<void>
}

export function SaleDialog({ open, onOpenChange, products, onSave }: SaleDialogProps) {
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (!productId && products.length > 0) {
      setProductId(products[0].id)
    }
  }, [open, products, productId])

  const selectedProduct = useMemo(() => products.find((p) => p.id === productId), [products, productId])

  const handleSave = async () => {
    if (!selectedProduct || !quantity || Number(quantity) <= 0 || saving) return
    const dateObj = new Date(date)
    const now = new Date()
    dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds())
    setSaving(true)
    try {
      await onSave({
        productId: selectedProduct.id,
        quantity: Number(quantity),
        date: dateObj.toISOString(),
      })
      setQuantity("1")
      setDate(format(new Date(), "yyyy-MM-dd"))
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Venda</DialogTitle>
          <DialogDescription>Selecione um produto e informe a quantidade vendida.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Produto</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Quantidade</Label>
              <Input type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Ex: 2" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={!selectedProduct || !quantity || Number(quantity) <= 0 || saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
