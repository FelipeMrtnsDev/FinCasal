import { Budget, BudgetStatus } from "./types";
import { BudgetStatusDTO } from "@/services/financeService";
import { getMonthOptionsFromStart as getMonthOptionsFromStartBase } from "@/lib/month-options";

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
  return getMonthOptionsFromStartBase(new Date().toISOString().slice(0, 7));
}

export function getMonthOptionsFromStart(startMonth: string) {
  return getMonthOptionsFromStartBase(startMonth);
}
