import api from "@/lib/api";
import { format, subMonths } from "date-fns";
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

export const summaryService = {
  getSummary: async (month?: string): Promise<DashboardSummary> => {
    try {
      const params = month ? { month } : {};
      const response = await api.get<DashboardSummary>("/summary/", { params });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar resumo do dashboard", error);
      // Retorna objeto zerado padrão para exibir os cards vazios
      return {
        totalIncomes: 0,
        totalExpenses: 0,
        balance: 0,
        pixExpenses: 0,
        cardExpenses: 0,
        fixedExpenses: 0,
        variableExpenses: 0,
        byPerson: { eu: 0, parceiro: 0 },
      };
    }
  },

  getMonthlyEvolution: async (): Promise<MonthlyEvolution[]> => {
    try {
      // Endpoint: /api/summary/monthly-evolution
      const response = await api.get<MonthlyEvolution[]>(
        "/summary/monthly-evolution",
      );

      // Se a API retornar vazio ou incompleto, vamos preencher os últimos 6 meses
      const data = response.data;
      const filledData: MonthlyEvolution[] = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        // format(..., "MMM") retorna "jan", "fev" (minúsculo em pt-BR)
        const monthNameRaw = format(monthDate, "MMM", { locale: ptBR });
        const monthNameCapitalized =
          monthNameRaw.charAt(0).toUpperCase() + monthNameRaw.slice(1);

        const existing = data.find((item) =>
          item.month.toLowerCase().startsWith(monthNameRaw.toLowerCase()),
        );

        if (existing) {
          // Garante que o mês exibido siga o padrão "Jan", "Fev" mesmo se o banco vier diferente
          filledData.push({
            ...existing,
            month: monthNameCapitalized,
          });
        } else {
          filledData.push({
            month: monthNameCapitalized,
            despesas: 0,
            renda: 0,
            saldo: 0,
          });
        }
      }

      return filledData;
    } catch (error) {
      console.error("Erro ao buscar evolução mensal", error);
      // Retorna array zerado com meses corretos
      const filledData: MonthlyEvolution[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthNameRaw = format(monthDate, "MMM", { locale: ptBR });
        const monthNameCapitalized =
          monthNameRaw.charAt(0).toUpperCase() + monthNameRaw.slice(1);

        filledData.push({
          month: monthNameCapitalized,
          despesas: 0,
          renda: 0,
          saldo: 0,
        });
      }
      return filledData;
    }
  },

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
      const response = await api.get<PaymentMethodData[]>(
        "/summary/by-payment-method",
        { params },
      );
      return response.data;
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
