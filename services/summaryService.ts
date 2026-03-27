import api from "@/lib/api";
import {
  addMonths,
  differenceInCalendarMonths,
  format,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { DataScope, ViewMode } from "@/lib/types";

export interface DashboardSummary {
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
  pixExpenses: number;
  cardExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  byPerson: {
    eu: number;
    parceiro: number;
  };
}

export interface MonthlyEvolution {
  month: string;
  despesas: number;
  renda: number;
  saldo: number;
}

export interface CategoryData {
  categoryId?: string;
  name: string;
  value: number;
  color: string;
}

export interface PaymentMethodData {
  name: string;
  value: number;
  color: string;
}

export interface PersonData {
  name: string;
  value: number;
  color: string;
}

export interface DailySpending {
  dia: string;
  valor: number;
}

const toNumber = (value: unknown): number =>
  typeof value === "number"
    ? value
    : typeof value === "string"
      ? Number(value) || 0
      : 0;

const summaryZero: DashboardSummary = {
  totalIncomes: 0,
  totalExpenses: 0,
  balance: 0,
  pixExpenses: 0,
  cardExpenses: 0,
  fixedExpenses: 0,
  variableExpenses: 0,
  byPerson: { eu: 0, parceiro: 0 },
};

const monthLabel = (monthDate: Date): string => {
  const monthNameRaw = format(monthDate, "MMM", { locale: ptBR });
  return monthNameRaw.charAt(0).toUpperCase() + monthNameRaw.slice(1);
};

const monthToken = (monthDate: Date): string => format(monthDate, "yyyy-MM");

const parseMonthToken = (value?: string): Date | null => {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const [yearRaw, monthRaw] = value.split("-");
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  if (!Number.isInteger(year) || !Number.isInteger(monthIndex)) return null;
  return new Date(year, monthIndex, 1);
};

const toDataScope = (view?: DataScope | ViewMode): DataScope => {
  if (view === "COUPLE" || view === "casal") return "COUPLE";
  return "INDIVIDUAL";
};

async function getWithFallback<T>(
  paths: string[],
  params?: Record<string, string | number>,
): Promise<T> {
  let lastError: unknown;
  for (const path of paths) {
    try {
      const response = await api.get<T>(path, { params });
      return response.data;
    } catch (error) {
      lastError = error;
      if (params && Object.keys(params).length > 0) {
        try {
          const response = await api.get<T>(path);
          return response.data;
        } catch (retryError) {
          lastError = retryError;
        }
      }
    }
  }
  throw lastError;
}

function normalizeSummary(data: unknown): DashboardSummary {
  if (!data || typeof data !== "object") return summaryZero;
  const record = data as Record<string, unknown>;

  const byPersonRaw =
    typeof record.byPerson === "object" && record.byPerson !== null
      ? (record.byPerson as Record<string, unknown>)
      : null;

  const totalIncomes = toNumber(
    record.totalIncomes ??
      record.totalIncome ??
      record.incomes ??
      record.receitas,
  );
  const totalExpenses = toNumber(
    record.totalExpenses ??
      record.totalExpense ??
      record.expenses ??
      record.despesas,
  );
  const balance = toNumber(
    record.balance ?? record.saldo ?? totalIncomes - totalExpenses,
  );
  const pixExpenses = toNumber(
    record.pixExpenses ?? record.pixTotal ?? record.pix ?? record.totalPix,
  );
  const cardExpenses = toNumber(
    record.cardExpenses ??
      record.creditCardExpenses ??
      record.cartaoExpenses ??
      record.cardTotal ??
      record.totalCard,
  );
  const fixedExpenses = toNumber(
    record.fixedExpenses ??
      record.fixedTotal ??
      record.totalFixed ??
      record.fixas,
  );
  const variableExpenses = toNumber(
    record.variableExpenses ??
      record.variableTotal ??
      record.totalVariable ??
      record.variaveis,
  );

  return {
    totalIncomes,
    totalExpenses,
    balance,
    pixExpenses,
    cardExpenses,
    fixedExpenses,
    variableExpenses,
    byPerson: {
      eu: toNumber(byPersonRaw?.eu ?? byPersonRaw?.me),
      parceiro: toNumber(byPersonRaw?.parceiro ?? byPersonRaw?.partner),
    },
  };
}

function normalizeEvolutionRows(
  data: unknown,
  baseMonth?: string,
  startMonth?: string,
): MonthlyEvolution[] {
  const rows = Array.isArray(data) ? data : [];
  const reference = parseMonthToken(baseMonth) || new Date();
  const userStart = parseMonthToken(startMonth);
  const fallbackStart = subMonths(reference, 5);

  const windowStart = (() => {
    if (!userStart) return fallbackStart;
    const monthGap = differenceInCalendarMonths(reference, userStart);
    if (monthGap >= 5) return subMonths(reference, 5);
    return userStart;
  })();

  const months = Array.from({ length: 6 }, (_, i) => addMonths(windowStart, i));
  const labelTokenPairs = months.map((monthDate) => ({
    token: monthToken(monthDate),
    label: monthLabel(monthDate).toLowerCase(),
  }));

  const monthMap = new Map<string, MonthlyEvolution>();

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const record = row as Record<string, unknown>;
    const rawMonth =
      (typeof record.month === "string" && record.month) ||
      (typeof record.referenceMonth === "string" && record.referenceMonth) ||
      (typeof record.period === "string" && record.period) ||
      (typeof record.date === "string" && record.date) ||
      "";

    const tokenMatch = rawMonth.match(/\d{4}-\d{2}/);
    const textMonth = rawMonth.toLowerCase();
    const fallbackToken =
      labelTokenPairs.find((pair) => textMonth.startsWith(pair.label))?.token ||
      null;
    const token = tokenMatch ? tokenMatch[0] : fallbackToken;
    if (!token) continue;

    const renda = toNumber(
      record.renda ?? record.income ?? record.totalIncomes,
    );
    const despesas = toNumber(
      record.despesas ?? record.expenses ?? record.totalExpenses,
    );
    const saldo = toNumber(record.saldo ?? record.balance ?? renda - despesas);

    monthMap.set(token, {
      month: monthLabel(parseMonthToken(token) || new Date()),
      renda,
      despesas,
      saldo,
    });
  }

  return months.map((monthDate) => {
    const token = monthToken(monthDate);
    return (
      monthMap.get(token) || {
        month: monthLabel(monthDate),
        despesas: 0,
        renda: 0,
        saldo: 0,
      }
    );
  });
}

function normalizePaymentMethodRows(data: unknown): PaymentMethodData[] {
  const colorByName: Record<string, string> = {
    pix: "#21C25E",
    cartao: "#15803d",
    dinheiro: "#4ade80",
    transferencia: "#166534",
    outro: "#86efac",
  };

  const normalizeName = (raw: string): string => {
    const key = raw.toLowerCase();
    if (key.includes("pix")) return "Pix";
    if (
      key.includes("credit") ||
      key.includes("card") ||
      key.includes("cart")
    ) {
      return "Cartao";
    }
    if (key.includes("cash") || key.includes("dinhe")) return "Dinheiro";
    if (key.includes("transfer")) return "Transferencia";
    return "Outro";
  };

  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const rawName =
          (typeof record.name === "string" && record.name) ||
          (typeof record.method === "string" && record.method) ||
          (typeof record.paymentMethod === "string" && record.paymentMethod) ||
          "Outro";
        const normalizedName = normalizeName(rawName);
        const key = normalizedName.toLowerCase();
        return {
          name: normalizedName,
          value: toNumber(record.value ?? record.total ?? record.amount),
          color: colorByName[key] || colorByName.outro,
        };
      })
      .filter(
        (item): item is PaymentMethodData => item !== null && item.value > 0,
      );
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    return Object.entries(record)
      .map(([key, value]) => {
        const normalizedName = normalizeName(key);
        const nameKey = normalizedName.toLowerCase();
        return {
          name: normalizedName,
          value: toNumber(value),
          color: colorByName[nameKey] || colorByName.outro,
        };
      })
      .filter((item) => item.value > 0);
  }

  return [];
}

function normalizeCategoryRows(data: unknown): CategoryData[] {
  if (!Array.isArray(data)) return [];
  const palette = ["#21C25E", "#15803d", "#4ade80", "#166534", "#86efac"];
  const grouped = new Map<
    string,
    { categoryId?: string; name: string; value: number; color?: string }
  >();

  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const categoryField =
      record.category && typeof record.category === "object"
        ? (record.category as Record<string, unknown>)
        : null;

    const name =
      (typeof record.name === "string" && record.name.trim()) ||
      (typeof record.categoryName === "string" && record.categoryName.trim()) ||
      (typeof record.label === "string" && record.label.trim()) ||
      (typeof record.category === "string" && record.category.trim()) ||
      (typeof categoryField?.name === "string" && categoryField.name.trim()) ||
      (typeof categoryField?.label === "string" &&
        categoryField.label.trim()) ||
      "Outros";
    const categoryId =
      (typeof record.categoryId === "string" && record.categoryId.trim()) ||
      (typeof categoryField?.id === "string" && categoryField.id.trim()) ||
      undefined;

    const value = toNumber(
      record.value ??
        record.amount ??
        record.total ??
        record.totalAmount ??
        record.expenseTotal,
    );
    if (!Number.isFinite(value) || value <= 0) continue;

    const color =
      (typeof record.color === "string" && record.color) ||
      (typeof categoryField?.color === "string" && categoryField.color) ||
      undefined;

    const key = categoryId || name.toLowerCase();
    const previous = grouped.get(key);
    grouped.set(key, {
      categoryId: previous?.categoryId || categoryId,
      name,
      value: (previous?.value || 0) + value,
      color: previous?.color || color,
    });
  }

  return Array.from(grouped.values()).map((dataRow, index) => ({
    categoryId: dataRow.categoryId,
    name: dataRow.name,
    value: dataRow.value,
    color: dataRow.color || palette[index % palette.length],
  }));
}

type CategoryColorEntry = {
  id?: string;
  name: string;
  color?: string;
};

async function getExpenseCategories(): Promise<CategoryColorEntry[]> {
  try {
    const data = await getWithFallback<unknown>(["/categories"], {
      type: "EXPENSE",
    });
    const list = Array.isArray(data)
      ? data
      : data && typeof data === "object"
        ? ((data as Record<string, unknown>).items as unknown)
        : [];
    if (!Array.isArray(list)) return [];
    const parsed: CategoryColorEntry[] = [];
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const record = item as Record<string, unknown>;
      const id =
        (typeof record.id === "string" && record.id.trim()) || undefined;
      const name =
        (typeof record.name === "string" && record.name.trim()) || "";
      const color =
        (typeof record.color === "string" && record.color.trim()) || undefined;
      if (!name) continue;
      parsed.push({ id, name, color });
    }
    return parsed;
  } catch {
    return [];
  }
}

function normalizePersonRows(data: unknown): PersonData[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const rawName =
        (typeof record.name === "string" && record.name) ||
        (typeof record.person === "string" && record.person) ||
        (index === 0 ? "Eu" : "Parceiro");
      const name =
        rawName.toLowerCase() === "eu"
          ? "Eu"
          : rawName.toLowerCase() === "parceiro"
            ? "Parceiro"
            : rawName;
      const value = toNumber(record.value ?? record.amount ?? record.total);
      const color =
        (typeof record.color === "string" && record.color) ||
        (name === "Eu" ? "#21C25E" : "#15803d");
      return { name, value, color };
    })
    .filter(
      (row): row is PersonData =>
        row !== null && Number.isFinite(row.value) && row.value > 0,
    );
}

type RawExpense = {
  amount: number | string;
  date: string;
  paymentMethod?: string;
  type?: string;
  person?: string;
  category?: string | { id?: string; name?: string; color?: string };
  categoryData?: { name?: string; color?: string };
};

type RawIncome = {
  amount: number | string;
  date: string;
};

const paymentMethodColor: Record<string, string> = {
  Pix: "#21C25E",
  Cartao: "#15803d",
  Dinheiro: "#4ade80",
  Transferencia: "#166534",
  Outro: "#86efac",
};

const normalizePaymentLabel = (value?: string): string => {
  const key = String(value || "").toLowerCase();
  if (key.includes("pix")) return "Pix";
  if (key.includes("credit") || key.includes("card") || key.includes("cart"))
    return "Cartao";
  if (key.includes("cash") || key.includes("dinhe")) return "Dinheiro";
  if (key.includes("transfer")) return "Transferencia";
  return "Outro";
};

const monthKey = (dateValue?: string): string =>
  String(dateValue || "").slice(0, 7);
const isFromMonth = (dateValue: string | undefined, month?: string): boolean =>
  !month || monthKey(dateValue) === month;

const buildWindowMonths = (baseMonth?: string, startMonth?: string): Date[] => {
  const reference = parseMonthToken(baseMonth) || new Date();
  const userStart = parseMonthToken(startMonth);
  const fallbackStart = subMonths(reference, 5);
  const windowStart = (() => {
    if (!userStart) return fallbackStart;
    const monthGap = differenceInCalendarMonths(reference, userStart);
    if (monthGap >= 5) return subMonths(reference, 5);
    return userStart;
  })();
  return Array.from({ length: 6 }, (_, i) => addMonths(windowStart, i));
};

async function getExpensesRaw(
  view?: DataScope | ViewMode,
): Promise<RawExpense[]> {
  const data = await getWithFallback<unknown>(["/expenses"], {
    view: toDataScope(view),
  });
  if (Array.isArray(data)) return data as RawExpense[];
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  return Array.isArray(record.items) ? (record.items as RawExpense[]) : [];
}

async function getIncomesRaw(
  view?: DataScope | ViewMode,
): Promise<RawIncome[]> {
  const data = await getWithFallback<RawIncome[]>(["/incomes"], {
    view: toDataScope(view),
  });
  return Array.isArray(data) ? data : [];
}

export const summaryService = {
  getSummary: async (
    month?: string,
    view?: DataScope | ViewMode,
  ): Promise<DashboardSummary> => {
    try {
      const params = { ...(month ? { month } : {}), view: toDataScope(view) };
      const data = await getWithFallback<unknown>(
        ["/summary", "/summary/", "/dashboard/summary"],
        params,
      );
      return normalizeSummary(data);
    } catch (error) {
      console.error("Erro ao buscar resumo do dashboard", error);
      try {
        const [expenses, incomes] = await Promise.all([
          getExpensesRaw(view),
          getIncomesRaw(view),
        ]);
        const monthExpenses = expenses.filter((expense) =>
          isFromMonth(expense.date, month),
        );
        const monthIncomes = incomes.filter((income) =>
          isFromMonth(income.date, month),
        );

        const totalExpenses = monthExpenses.reduce(
          (acc, item) => acc + toNumber(item.amount),
          0,
        );
        const totalIncomes = monthIncomes.reduce(
          (acc, item) => acc + toNumber(item.amount),
          0,
        );
        const pixExpenses = monthExpenses
          .filter((item) => normalizePaymentLabel(item.paymentMethod) === "Pix")
          .reduce((acc, item) => acc + toNumber(item.amount), 0);
        const cardExpenses = monthExpenses
          .filter(
            (item) => normalizePaymentLabel(item.paymentMethod) === "Cartao",
          )
          .reduce((acc, item) => acc + toNumber(item.amount), 0);
        const fixedExpenses = monthExpenses
          .filter((item) =>
            String(item.type || "")
              .toLowerCase()
              .includes("fix"),
          )
          .reduce((acc, item) => acc + toNumber(item.amount), 0);
        const variableExpenses = totalExpenses - fixedExpenses;

        return {
          totalIncomes,
          totalExpenses,
          balance: totalIncomes - totalExpenses,
          pixExpenses,
          cardExpenses,
          fixedExpenses,
          variableExpenses,
          byPerson: {
            eu: monthExpenses
              .filter(
                (item) => String(item.person || "").toLowerCase() === "eu",
              )
              .reduce((acc, item) => acc + toNumber(item.amount), 0),
            parceiro: monthExpenses
              .filter(
                (item) => String(item.person || "").toLowerCase() !== "eu",
              )
              .reduce((acc, item) => acc + toNumber(item.amount), 0),
          },
        };
      } catch {
        return summaryZero;
      }
    }
  },

  getMonthlyEvolution: async (
    month?: string,
    startMonth?: string,
    view?: DataScope | ViewMode,
  ): Promise<MonthlyEvolution[]> => {
    try {
      const params = { ...(month ? { month } : {}), view: toDataScope(view) };
      const data = await getWithFallback<unknown>(
        [
          "/summary/monthly-evolution",
          "/dashboard/monthly-evolution",
          "/dashboard/evolution",
        ],
        params,
      );
      return normalizeEvolutionRows(data, month, startMonth);
    } catch (error) {
      console.error("Erro ao buscar evolução mensal", error);
      try {
        const [expenses, incomes] = await Promise.all([
          getExpensesRaw(view),
          getIncomesRaw(view),
        ]);
        const months = buildWindowMonths(month, startMonth);
        return months.map((monthDate) => {
          const token = monthToken(monthDate);
          const despesas = expenses
            .filter((item) => monthKey(item.date) === token)
            .reduce((acc, item) => acc + toNumber(item.amount), 0);
          const renda = incomes
            .filter((item) => monthKey(item.date) === token)
            .reduce((acc, item) => acc + toNumber(item.amount), 0);
          return {
            month: monthLabel(monthDate),
            despesas,
            renda,
            saldo: renda - despesas,
          };
        });
      } catch {
        return normalizeEvolutionRows([], month, startMonth);
      }
    }
  },

  getByCategory: async (
    month?: string,
    view?: DataScope | ViewMode,
  ): Promise<CategoryData[]> => {
    try {
      const params = { ...(month ? { month } : {}), view: toDataScope(view) };
      const data = await getWithFallback<unknown>(
        ["/summary/by-category", "/dashboard/by-category"],
        params,
      );
      const normalized = normalizeCategoryRows(data);
      if (normalized.length === 0) return normalized;
      const categories = await getExpenseCategories();
      if (categories.length === 0) return normalized;

      const byId = new Map<string, string>();
      const byName = new Map<string, string>();
      for (const category of categories) {
        if (category.id && category.color)
          byId.set(category.id, category.color);
        if (category.name && category.color) {
          byName.set(category.name.trim().toLowerCase(), category.color);
        }
      }

      return normalized.map((row) => ({
        ...row,
        color:
          (row.categoryId ? byId.get(row.categoryId) : undefined) ||
          byName.get(row.name.trim().toLowerCase()) ||
          row.color,
      }));
    } catch (error) {
      console.error("Erro ao buscar categorias", error);
      try {
        const expenses = await getExpensesRaw(view);
        const monthExpenses = expenses.filter((expense) =>
          isFromMonth(expense.date, month),
        );
        const grouped = new Map<
          string,
          { name: string; value: number; color?: string }
        >();
        for (const item of monthExpenses) {
          const categoryObject =
            item.category && typeof item.category === "object"
              ? item.category
              : null;
          const nameFromCategoryData = item.categoryData?.name;
          const nameFromCategoryObject = categoryObject?.name;
          const nameFromCategoryString =
            typeof item.category === "string" ? item.category : undefined;
          const name =
            nameFromCategoryData ||
            nameFromCategoryObject ||
            nameFromCategoryString ||
            "Outros";
          const color =
            item.categoryData?.color ||
            (categoryObject ? categoryObject.color : undefined);
          const key = name.toLowerCase();
          const previous = grouped.get(key);
          grouped.set(key, {
            name,
            value: (previous?.value || 0) + toNumber(item.amount),
            color: previous?.color || color,
          });
        }
        const categories = await getExpenseCategories();
        const byName = new Map(
          categories
            .filter((category) => category.color)
            .map((category) => [
              category.name.trim().toLowerCase(),
              category.color as string,
            ]),
        );
        return Array.from(grouped.values()).map((item, index) => ({
          name: item.name,
          value: item.value,
          color:
            item.color ||
            byName.get(item.name.trim().toLowerCase()) ||
            ["#21C25E", "#15803d", "#4ade80", "#166534", "#86efac"][index % 5],
        }));
      } catch {
        return [];
      }
    }
  },

  getByPaymentMethod: async (
    month?: string,
    view?: DataScope | ViewMode,
  ): Promise<PaymentMethodData[]> => {
    try {
      const params = { ...(month ? { month } : {}), view: toDataScope(view) };
      const data = await getWithFallback<unknown>(
        ["/summary/by-payment-method", "/dashboard/by-payment-method"],
        params,
      );
      return normalizePaymentMethodRows(data);
    } catch (error) {
      console.error("Erro ao buscar métodos de pagamento", error);
      try {
        const expenses = await getExpensesRaw(view);
        const monthExpenses = expenses.filter((expense) =>
          isFromMonth(expense.date, month),
        );
        const grouped = new Map<string, number>();
        for (const item of monthExpenses) {
          const label = normalizePaymentLabel(item.paymentMethod);
          grouped.set(label, (grouped.get(label) || 0) + toNumber(item.amount));
        }
        return Array.from(grouped.entries())
          .map(([name, value]) => ({
            name,
            value,
            color: paymentMethodColor[name] || paymentMethodColor.Outro,
          }))
          .filter((row) => row.value > 0);
      } catch {
        return [];
      }
    }
  },

  getByPerson: async (
    month?: string,
    view?: DataScope | ViewMode,
  ): Promise<PersonData[]> => {
    try {
      const params = { ...(month ? { month } : {}), view: toDataScope(view) };
      const data = await getWithFallback<unknown>(
        ["/summary/by-person", "/dashboard/by-person"],
        params,
      );
      return normalizePersonRows(data);
    } catch (error) {
      console.error("Erro ao buscar dados por pessoa", error);
      try {
        const expenses = await getExpensesRaw(view);
        const monthExpenses = expenses.filter((expense) =>
          isFromMonth(expense.date, month),
        );
        const eu = monthExpenses
          .filter((item) => String(item.person || "").toLowerCase() === "eu")
          .reduce((acc, item) => acc + toNumber(item.amount), 0);
        const parceiro = monthExpenses
          .filter((item) => String(item.person || "").toLowerCase() !== "eu")
          .reduce((acc, item) => acc + toNumber(item.amount), 0);
        return [
          { name: "Eu", value: eu, color: "#21C25E" },
          { name: "Parceiro", value: parceiro, color: "#15803d" },
        ].filter((row) => row.value > 0);
      } catch {
        return [];
      }
    }
  },

  getDailySpending: async (
    month?: string,
    view?: DataScope | ViewMode,
  ): Promise<DailySpending[]> => {
    try {
      const params = { ...(month ? { month } : {}), view: toDataScope(view) };
      return await getWithFallback<DailySpending[]>(
        ["/summary/daily-spending", "/dashboard/daily-spending"],
        params,
      );
    } catch (error) {
      console.error("Erro ao buscar gastos diários", error);
      try {
        const expenses = await getExpensesRaw(view);
        const monthExpenses = expenses.filter((expense) =>
          isFromMonth(expense.date, month),
        );
        const grouped = new Map<string, number>();
        for (const item of monthExpenses) {
          const day = String(item.date || "").slice(8, 10);
          grouped.set(day, (grouped.get(day) || 0) + toNumber(item.amount));
        }
        return Array.from(grouped.entries())
          .map(([dia, valor]) => ({ dia, valor }))
          .sort((a, b) => Number(a.dia) - Number(b.dia));
      } catch {
        return [];
      }
    }
  },
};
