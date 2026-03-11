"use client"

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

type DepositDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  depositAmount: string
  onDepositAmountChange: (value: string) => void
  onDeposit: () => Promise<void>
}

export function DepositDialog({
  open,
  onOpenChange,
  depositAmount,
  onDepositAmountChange,
  onDeposit,
}: DepositDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Depositar na Meta</DialogTitle>
          <DialogDescription>Adicione um valor guardado nesta meta.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={depositAmount}
              onChange={(e) => onDepositAmountChange(e.target.value)}
              placeholder="0,00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onDeposit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!depositAmount}
          >
            Depositar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
