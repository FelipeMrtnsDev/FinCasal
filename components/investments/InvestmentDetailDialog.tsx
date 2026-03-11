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
import { cn } from "@/lib/utils"
import { INVESTMENT_TYPES, type Investment } from "@/lib/types"
import { format, parseISO } from "date-fns"
import { Calendar, FileText, Tag, Trash2, User } from "lucide-react"
import { INVEST_COLORS, INVEST_ICONS, formatCurrency } from "./constants"

type InvestmentDetailDialogProps = {
  investment: Investment | null
  personNames: { eu: string; parceiro: string }
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

export function InvestmentDetailDialog({ investment, personNames, onClose, onDelete }: InvestmentDetailDialogProps) {
  return (
    <Dialog open={!!investment} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-w-sm">
        {investment && (() => {
          const inv = investment
          const Icon = INVEST_ICONS[inv.type]
          const isInflow = inv.type !== "aporte"
          const typeLabel = INVESTMENT_TYPES.find((t) => t.value === inv.type)?.label || inv.type
          return (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${INVEST_COLORS[inv.type]}20` }}>
                    <Icon className="w-5 h-5" style={{ color: INVEST_COLORS[inv.type] }} />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">{inv.asset || "Sem ativo"}</DialogTitle>
                    <DialogDescription>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${INVEST_COLORS[inv.type]}15`, color: INVEST_COLORS[inv.type] }}>
                        {typeLabel}
                      </span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="text-center py-3 rounded-xl bg-muted/50">
                  <span className={cn("text-2xl font-bold font-mono", isInflow ? "text-primary" : "text-amber-600")}>
                    {isInflow ? "+" : "-"}
                    {formatCurrency(inv.amount)}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Descricao</span>
                    <span className="ml-auto font-medium text-foreground truncate max-w-45">{inv.description}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Data</span>
                    <span className="ml-auto font-medium text-foreground">
                      {(() => {
                        try {
                          return format(parseISO(inv.date), "dd/MM/yyyy")
                        } catch {
                          return inv.date
                        }
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Ativo</span>
                    <span className="ml-auto font-medium text-foreground">{inv.asset || "Nao informado"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Pessoa</span>
                    <span className="ml-auto font-medium text-foreground">{inv.person === "eu" ? personNames.eu : personNames.parceiro}</span>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-row gap-2">
                <DialogClose asChild>
                  <Button variant="outline" className="flex-1">
                    Fechar
                  </Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => {
                    onDelete(inv.id)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </DialogFooter>
            </>
          )
        })()}
      </DialogContent>
    </Dialog>
  )
}
