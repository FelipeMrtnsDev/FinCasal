"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, HelpCircle, CreditCard, Smartphone, Banknote, ArrowLeftRight } from "lucide-react"
import { Expense, Category, PaymentMethod } from "@/lib/types"
import { useFinance } from "@/lib/finance-context"
import { format, parseISO } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { ExpenseDetailsDialog } from "./ExpenseDetailsDialog"

interface ExpenseListProps {
  expenses: Expense[]
  categories: Category[]
  loading?: boolean
  onDelete: (id: string) => Promise<void>
}

const paymentIcons: Record<string, typeof CreditCard> = {
  pix: Smartphone,
  PIX: Smartphone,
  cartao: CreditCard,
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  dinheiro: Banknote,
  CASH: Banknote,
  transferencia: ArrowLeftRight,
  TRANSFER: ArrowLeftRight,
  outro: HelpCircle,
  OTHER: HelpCircle,
}

const paymentLabels: Record<string, string> = {
  pix: "Pix",
  PIX: "Pix",
  cartao: "Cartão",
  CREDIT_CARD: "Cartão",
  DEBIT_CARD: "Débito",
  dinheiro: "Dinheiro",
  CASH: "Dinheiro",
  transferencia: "Transf.",
  TRANSFER: "Transf.",
  outro: "Outro",
  OTHER: "Outro",
}

function formatCurrency(value: number) {
  // Garantir que sempre tenha o prefixo R$
  const formatted = (value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  // Se por algum motivo o navegador não colocar o símbolo (alguns ambientes headless), forçamos
  if (!formatted.includes("R$")) {
    return `R$ ${formatted}`;
  }
  return formatted;
}

export function ExpenseList({ expenses, categories, loading = false, onDelete }: ExpenseListProps) {
  const { viewMode, personNames } = useFinance()
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setDetailsOpen(true)
  }

  const translateType = (type: string) => {
    const types: Record<string, string> = {
      VARIABLE: "Variável",
      FIXED: "Fixo",
      variavel: "Variável",
      fixo: "Fixo",
    };
    return types[type] || types[type.toUpperCase()] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-3">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="flex flex-col flex-1 gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Nenhuma despesa encontrada. Adicione sua primeira despesa!
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {expenses.map((expense) => {
                // Tenta encontrar a categoria pelo ID (categoryId ou category string)
                // OU usa o objeto category aninhado se vier da API
                const categoryId =
                  expense.categoryId ||
                  (typeof expense.category === "string" ? expense.category : expense.category.id)

                let catName = "Sem categoria";
                let catColor = undefined;

                // Prioridade 1: Objeto category aninhado vindo da API
                if (typeof expense.category === "object") {
                  catName = expense.category.name
                  catColor = expense.category.color
                }
                // Prioridade 2: Buscar na lista de categorias pelo ID
                else {
                  const foundCat = categories.find((c) => c.id === categoryId);
                  if (foundCat) {
                    catName = foundCat.name;
                    catColor = foundCat.color;
                  }
                }

                const paymentMethodKey = expense.paymentMethod as string;
                const PayIcon = paymentIcons[paymentMethodKey] || paymentIcons[paymentMethodKey.toLowerCase()] || HelpCircle;
                const paymentLabel = paymentLabels[paymentMethodKey] || paymentLabels[paymentMethodKey.toLowerCase()] || paymentMethodKey;

                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                    onClick={() => handleExpenseClick(expense)}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: catColor ? `${catColor}20` : undefined }}
                    >
                      <PayIcon className="w-4 h-4" style={{ color: catColor }} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground truncate">{expense.description}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-primary/80">{catName}</span>
                        <span>•</span>
                        <span>{paymentLabel}</span>
                        <span>•</span>
                        <span className="capitalize">{translateType(typeof expense.type === 'string' ? expense.type : String(expense.type))}</span>
                        {viewMode === "casal" && (
                          <>
                            <span>•</span>
                            <span>{expense.user?.name || (expense.person === "eu" ? personNames.eu : personNames.parceiro)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-mono font-medium text-foreground">
                          {formatCurrency(expense.amount)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(() => { try { return format(parseISO(expense.date), "dd/MM/yyyy") } catch { return expense.date } })()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(expense.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ExpenseDetailsDialog
        expense={selectedExpense}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        categories={categories}
        personNames={personNames}
      />
    </>
  )
}
