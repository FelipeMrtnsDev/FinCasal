"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Expense, Category } from "@/lib/types"
import { CreditCard, Smartphone, Banknote, ArrowLeftRight, HelpCircle, Calendar, User, Tag, FileText, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCompanyByDescription } from "@/lib/companyRegistry"

interface ExpenseDetailsDialogProps {
  expense: Expense | null
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  personNames: { eu: string; parceiro: string }
  onEditClick?: () => void
  onDeleteClick?: () => void
  isDeleting?: boolean
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
  cartao: "Cartão de Crédito",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  dinheiro: "Dinheiro",
  CASH: "Dinheiro",
  transferencia: "Transferência",
  TRANSFER: "Transferência",
  outro: "Outro",
  OTHER: "Outro",
}

function formatCurrency(value: number) {
  const formatted = (value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  if (!formatted.includes("R$")) {
    return `R$ ${formatted}`;
  }
  return formatted;
}

export function ExpenseDetailsDialog({ 
  expense, 
  open, 
  onOpenChange, 
  categories, 
  personNames,
  onEditClick,
  onDeleteClick,
  isDeleting
}: ExpenseDetailsDialogProps) {
  if (!expense) return null

  const categoryId = expense.categoryId || (typeof expense.category === 'string' ? expense.category : '');
  let catName = "Sem categoria";
  let catColor = undefined;

  if (expense.category && typeof expense.category === 'object' && 'name' in expense.category) {
    catName = (expense.category as any).name;
    catColor = (expense.category as any).color;
  } else {
    const foundCat = categories.find((c) => c.id === categoryId);
    if (foundCat) {
      catName = foundCat.name;
      catColor = foundCat.color;
    }
  }

  const paymentMethodKey = expense.paymentMethod as string;
  const PayIcon = paymentIcons[paymentMethodKey] || paymentIcons[paymentMethodKey.toLowerCase()] || HelpCircle;
  const paymentLabel = paymentLabels[paymentMethodKey] || paymentLabels[paymentMethodKey.toLowerCase()] || paymentMethodKey;

  const translateType = (type: string) => {
    const types: Record<string, string> = {
      VARIABLE: "Variável",
      FIXED: "Fixo",
      variavel: "Variável",
      fixo: "Fixo",
    };
    return types[type] || types[type.toUpperCase()] || type;
  };

  const matchedCompany = getCompanyByDescription(expense.description);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da Despesa</DialogTitle>
          <DialogDescription>Informações completas sobre o registro</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4">
          {/* Valor em destaque */}
          <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-border/50">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium mb-1">Valor Total</span>
            <span className="text-3xl font-bold text-foreground">{formatCurrency(expense.amount)}</span>
          </div>

          <div className="grid gap-4">
            {/* Descrição */}
            <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors">
              {matchedCompany ? (
                <div className="w-10 h-10 -ml-1 rounded-full shrink-0 flex items-center justify-center overflow-hidden bg-white border border-border shadow-sm">
                  <img src={matchedCompany.logo} alt={matchedCompany.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
              )}
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase">Descrição</span>
                <span className="text-base font-medium text-foreground">{expense.description}</span>
              </div>
            </div>

            {/* Categoria */}
            <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors">
              <div 
                className="w-5 h-5 rounded-full mt-0.5" 
                style={{ backgroundColor: catColor || "#6b7280" }}
              />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase">Categoria</span>
                <span className="text-base font-medium text-foreground">{catName}</span>
              </div>
            </div>

            {/* Pagamento */}
            <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors">
              <PayIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase">Pagamento</span>
                <span className="text-base font-medium text-foreground">{paymentLabel}</span>
              </div>
            </div>

            {/* Data */}
            <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase">Data</span>
                <span className="text-base font-medium text-foreground">
                  {(() => { 
                    try { 
                      return format(parseISO(expense.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) 
                    } catch { 
                      return expense.date 
                    } 
                  })()}
                </span>
              </div>
            </div>

            {/* Pessoa e Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium uppercase">Responsável</span>
                  <span className="text-base font-medium text-foreground">
                    {expense.user?.name || (expense.person === "eu" ? personNames.eu : personNames.parceiro)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors">
                <Tag className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium uppercase">Tipo</span>
                  <span className="text-base font-medium text-foreground capitalize">
                    {translateType(typeof expense.type === 'string' ? expense.type : String(expense.type))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/50 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                if (onEditClick) onEditClick();
              }}
              disabled={isDeleting}
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (onDeleteClick) onDeleteClick();
              }}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
