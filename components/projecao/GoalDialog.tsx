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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { GoalFormState } from "./types"

type GoalDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  goalForm: GoalFormState
  onGoalFormChange: (form: GoalFormState) => void
  onCreate: () => Promise<void>
}

export function GoalDialog({
  open,
  onOpenChange,
  goalForm,
  onGoalFormChange,
  onCreate,
}: GoalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Nova Meta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Meta de Economia</DialogTitle>
          <DialogDescription>Defina uma meta de economia para voces.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Nome da Meta</Label>
            <Input
              value={goalForm.name}
              onChange={(e) => onGoalFormChange({ ...goalForm, name: e.target.value })}
              placeholder="Ex: Viagem, Reserva de emergencia"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Valor da Meta (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={goalForm.targetAmount}
                onChange={(e) => onGoalFormChange({ ...goalForm, targetAmount: e.target.value })}
                placeholder="10.000"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Ja guardado (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={goalForm.currentAmount}
                onChange={(e) => onGoalFormChange({ ...goalForm, currentAmount: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Prazo (opcional)</Label>
            <Input
              type="date"
              value={goalForm.deadline}
              onChange={(e) => onGoalFormChange({ ...goalForm, deadline: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onCreate}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!goalForm.name || !goalForm.targetAmount}
          >
            Criar Meta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
