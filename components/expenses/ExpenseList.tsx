"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, HelpCircle, CreditCard, Smartphone, Banknote, ArrowLeftRight } from "lucide-react"
import { Expense, Category, PaymentMethod } from "@/lib/types"
import { useFinance } from "@/lib/finance-context"
import { format, parseISO } from "date-fns"

interface ExpenseListProps {
  expenses: Expense[]
  categories: Category[]
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

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function ExpenseList({ expenses, categories, onDelete }: ExpenseListProps) {
  const { viewMode, personNames } = useFinance()

  return (
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
              const categoryId = expense.categoryId || (typeof expense.category === 'string' ? expense.category : '');

              let catName = "Sem categoria";
              let catColor = undefined;

              // Prioridade 1: Objeto category aninhado vindo da API
              if (expense.category && typeof expense.category === 'object' && 'name' in expense.category) {
                catName = (expense.category as any).name;
                catColor = (expense.category as any).color;
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

              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
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
                      <span>{catName}</span>
                      <span>{"/"}</span>
                      <span className="capitalize">{typeof expense.type === 'string' ? expense.type.toLowerCase() : expense.type}</span>
                      {viewMode === "casal" && (
                        <>
                          <span>{"/"}</span>
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
                      onClick={() => onDelete(expense.id)}
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
  )
}
