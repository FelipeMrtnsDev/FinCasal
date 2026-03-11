import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Budget, BudgetStatus } from "./types";
import { BudgetStatusDTO } from "@/services/financeService";

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function getBudgetStatus(
  statusRows: BudgetStatusDTO[],
  month: string,
): BudgetStatus[] {
  return statusRows.map((row) => {
    const normalizedStatus = row.status.toUpperCase();
    const isOver = normalizedStatus.includes("OVER");
    const isNear =
      !isOver && (normalizedStatus.includes("NEAR") || row.percentage >= 80);

    return {
      id: row.budgetId,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      limitAmount: row.limitAmount,
      month,
      spent: row.spentAmount,
      percent: row.percentage,
      isOver,
      isNear,
    };
  });
}

export function getMonthOptions() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    return {
      value: format(d, "yyyy-MM"),
      label: format(d, "MMMM yyyy", { locale: ptBR }),
    };
  });
}
