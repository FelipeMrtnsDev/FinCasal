"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Calendar, FileText, CreditCard, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { Expense, Income } from "@/lib/types"
import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { Skeleton } from "@/components/ui/skeleton"
import { getCompanyByDescription } from "@/lib/companyRegistry"

interface RecentActivityProps {
  expenses: Expense[]
  incomes: Income[]
  categories: any[]
  loading?: boolean
}

function formatCurrency(value: number) {
  return (value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatPaymentMethod(value: string) {
  const key = value.toLowerCase()
  if (key.includes("credit") || key.includes("card") || key.includes("cart")) return "Cartao"
  if (key.includes("pix")) return "Pix"
  if (key.includes("cash") || key.includes("dinh")) return "Dinheiro"
  if (key.includes("transfer")) return "Transferencia"
  return "Outro"
}

function formatExpenseType(value: string) {
  const key = value.toLowerCase()
  if (key.includes("fix")) return "Fixo"
  if (key.includes("var")) return "Variavel"
  return value
}

export function RecentActivity({ expenses, incomes, categories, loading = false }: RecentActivityProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const activities = useMemo(
    () =>
      [...expenses, ...incomes]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10),
    [expenses, incomes]
  )

  const selectedItem = activities.find((item) => item.id === selectedId) || null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atividade Recente</CardTitle>
        <CardDescription>Ultimas transacoes</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 py-2.5 px-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : expenses.length === 0 && incomes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            Nenhuma transacao registrada. Comece adicionando suas despesas e renda.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {activities.map((item) => {
              const isExpense = "paymentMethod" in item
              const expense = item as Expense
              const categoryId = isExpense ? (expense.categoryId || (typeof expense.category === "string" ? expense.category : expense.category?.id)) : null
              const cat = isExpense ? categories.find((c) => c.id === categoryId) : null
              const amount = Math.abs(Number(item.amount) || 0)
              const matchedCompany = getCompanyByDescription(item.description);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedId(item.id)}
                >
                  {matchedCompany ? (
                    <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden bg-white border border-border shadow-sm">
                      <img src={matchedCompany.logo} alt={matchedCompany.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      isExpense ? "bg-destructive/10" : "bg-primary/10"
                    )}>
                      {isExpense ? (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-foreground truncate">{item.description}</span>
                    <span className="text-xs text-muted-foreground">
                      {cat?.name || "Renda"} {" - "}
                      {(() => { try { return format(parseISO(item.date), "dd/MM/yyyy") } catch { return item.date } })()}
                    </span>
                  </div>
                  <span className={cn(
                    "text-sm font-mono font-medium shrink-0",
                    isExpense ? "text-destructive" : "text-primary"
                  )}>
                    {isExpense ? "-" : "+"} {formatCurrency(amount)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-sm">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {getCompanyByDescription(selectedItem.description) ? (
                    <div className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center overflow-hidden bg-white border border-border shadow-sm">
                      <img src={getCompanyByDescription(selectedItem.description)!.logo} alt={getCompanyByDescription(selectedItem.description)!.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                      "paymentMethod" in selectedItem ? "bg-destructive/10" : "bg-primary/10"
                    )}>
                      {"paymentMethod" in selectedItem ? (
                        <ArrowDownRight className="w-5 h-5 text-destructive" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  )}
                  <div>
                    <DialogTitle className="text-lg">{selectedItem.description}</DialogTitle>
                    <DialogDescription>
                      {"paymentMethod" in selectedItem ? "Despesa registrada" : "Renda registrada"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="text-center py-3 rounded-xl bg-muted/50">
                  <span className={cn(
                    "text-2xl font-bold font-mono",
                    "paymentMethod" in selectedItem ? "text-destructive" : "text-primary"
                  )}>
                    {"paymentMethod" in selectedItem ? "- " : "+ "}
                    {formatCurrency(Math.abs(Number(selectedItem.amount) || 0))}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {"paymentMethod" in selectedItem && (
                    <>
                      <div className="flex items-center gap-3 text-sm">
                        <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Categoria</span>
                        <span className="ml-auto font-medium text-foreground">{(() => {
                          const expense = selectedItem as Expense
                          const categoryId = expense.categoryId || (typeof expense.category === "string" ? expense.category : expense.category?.id)
                          const cat = categories.find((c) => c.id === categoryId)
                          return cat?.name || (typeof expense.category === "object" ? expense.category?.name : expense.category) || "Sem categoria"
                        })()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Pagamento</span>
                        <span className="ml-auto font-medium text-foreground">{formatPaymentMethod(String((selectedItem as Expense).paymentMethod || "-"))}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Tipo</span>
                        <span className="ml-auto font-medium text-foreground">{formatExpenseType(String((selectedItem as Expense).type || "-"))}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Data</span>
                    <span className="ml-auto font-medium text-foreground">
                      {(() => { try { return format(parseISO(selectedItem.date), "dd/MM/yyyy HH:mm") } catch { return selectedItem.date } })()}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
