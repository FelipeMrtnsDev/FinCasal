"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LineChart as LineChartIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AssetSummary } from "./types"
import { formatCurrency } from "./constants"

type InvestmentAssetDialogProps = {
  selectedAsset: AssetSummary | null
  onClose: () => void
}

export function InvestmentAssetDialog({ selectedAsset, onClose }: InvestmentAssetDialogProps) {
  return (
    <Dialog open={!!selectedAsset} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-w-sm">
        {selectedAsset && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <LineChartIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg">{selectedAsset.name}</DialogTitle>
                  <DialogDescription>Resumo do ativo</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
              <div className={cn("text-center py-4 rounded-xl", selectedAsset.lucro >= 0 ? "bg-primary/5" : "bg-amber-50")}>
                <span className="text-xs text-muted-foreground block mb-1">Resultado</span>
                <span className={cn("text-2xl font-bold font-mono", selectedAsset.lucro >= 0 ? "text-primary" : "text-amber-600")}>
                  {selectedAsset.lucro >= 0 ? "+" : ""}
                  {formatCurrency(selectedAsset.lucro)}
                </span>
                {selectedAsset.aportes > 0 && (
                  <span className={cn("text-sm font-mono block mt-0.5", selectedAsset.lucro >= 0 ? "text-primary/70" : "text-amber-500")}>
                    {selectedAsset.lucro >= 0 ? "+" : ""}
                    {((selectedAsset.lucro / selectedAsset.aportes) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total aportado</span>
                  <span className="font-mono font-medium text-amber-600">{formatCurrency(selectedAsset.aportes)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total retornado</span>
                  <span className="font-mono font-medium text-primary">{formatCurrency(selectedAsset.retornos)}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="w-full">
                  Fechar
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
