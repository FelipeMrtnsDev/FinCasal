import api from "@/lib/api";
import { addMonths, differenceInCalendarMonths, format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  return new Date(`${value}-01`);
};

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
  startMonth?: string
): MonthlyEvolution[] {
  data: unknown,
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
      month: monthLabel(new Date(`${token}-01`)),
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
    if (key.includes("credit") || key.includes("card") || key.includes("cart")) return "Cartao";
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
      .filter((item): item is PaymentMethodData => Boolean(item) && item.value > 0);
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

export const summaryService = {
  getSummary: async (month?: string): Promise<DashboardSummary> => {
    try {
      const params = month ? { month } : {};
      const response = await api.get<unknown>("/summary/", { params });
      return normalizeSummary(response.data);
    } catch (error) {
      console.error("Erro ao buscar resumo do dashboard", error);
      return summaryZero;
    }
  },

  getMonthlyEvolution: async (month?: string, startMonth?: string): Promise<MonthlyEvolution[]> => {
    try {
      const params = month ? { month } : {};
      const response = await api.get<unknown>("/summary/monthly-evolution", {
      return normalizeEvolutionRows(response.data, month, startMonth);
      });
      return normalizeEvolutionRows(response.data, month);
      return normalizeEvolutionRows([], month, startMonth);
      console.error("Erro ao buscar evolução mensal", error);
      return normalizeEvolutionRows([], month);

  getByCategory: async (month?: string): Promise<CategoryData[]> => {
    try {
      const params = month ? { month } : {};
      const response = await api.get<CategoryData[]>("/summary/by-category", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar categorias", error);
      return [];
    }
  },

  getByPaymentMethod: async (month?: string): Promise<PaymentMethodData[]> => {
    try {
      const params = month ? { month } : {};
      const response = await api.get<unknown>(
        "/summary/by-payment-method",
        { params },
      );
      return normalizePaymentMethodRows(response.data);
    } catch (error) {
      console.error("Erro ao buscar métodos de pagamento", error);
      return [];
    }
  },

  getByPerson: async (month?: string): Promise<PersonData[]> => {
    try {
      const params = month ? { month } : {};
      const response = await api.get<PersonData[]>("/summary/by-person", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dados por pessoa", error);
      return [];
    }
  },

  getDailySpending: async (month?: string): Promise<DailySpending[]> => {
    try {
      const params = month ? { month } : {};
      const response = await api.get<DailySpending[]>(
        "/summary/daily-spending",
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar gastos diários", error);
      return [];
    }
  },
};
