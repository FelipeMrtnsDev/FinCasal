"use client"

import { format, parseISO } from "date-fns"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, FileText, ShoppingBag, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sale } from "./types"
import { formatCurrency } from "./utils"

type SaleDetailDialogProps = {
  sale: Sale | null
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

export function SaleDetailDialog({ sale, onClose, onDelete }: SaleDetailDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!sale || deleting) return
    setDeleting(true)
    try {
      await onDelete(sale.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={!!sale} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        {sale && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg">{sale.productName}</DialogTitle>
                  <DialogDescription>{sale.quantity} unidades</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="text-center py-3 rounded-xl bg-muted/50">
                <span className={cn("text-2xl font-bold font-mono text-foreground")}>
                  {formatCurrency(sale.unitPrice * sale.quantity)}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Categoria</span>
                  <span className="ml-auto font-medium text-foreground">{sale.category}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Data</span>
                  <span className="ml-auto font-medium text-foreground">
                    {(() => {
                      try {
                        return format(parseISO(sale.date), "dd/MM/yyyy")
                      } catch {
                        return sale.date
                      }
                    })()}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="flex-1" disabled={deleting}>Fechar</Button>
              </DialogClose>
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? "Excluindo..." : "Excluir"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
