import api from "@/lib/api";
import {
  Expense,
  Income,
  Investment,
  Category,
  SavingsGoal,
} from "@/lib/types";

export const expenseService = {
  getAll: async (params?: any): Promise<Expense[]> => {
    // Remove limit se o backend não suportar ou se estiver dando erro 400
    // O backend parece ser Node/Express. Se estiver usando mongoose-paginate ou similar, limit deve funcionar.
    // Mas se o erro é 400, pode ser validação.
    // Vamos assumir que o backend não espera 'limit' na query string ou espera outro formato.
    // Se o backend for simples (find()), ele ignora params extras, não dá 400.
    // 400 geralmente é validação (zod/joi/class-validator) falhando.
    // Se o DTO de filtro não permite 'limit', dá erro.

    // Vou tentar remover 'limit' por enquanto para ver se funciona a listagem básica.
    // Ou melhor, vou passar apenas os params de filtro (month, etc) se existirem.

    const { limit, ...rest } = params || {};
    // Se o backend suportar paginação, deve ser ?page=1&limit=5 ou similar.

    const response = await api.get<Expense[]>("/expenses", { params: rest });

    // Se precisarmos limitar no frontend:
    if (limit && Array.isArray(response.data)) {
      return response.data.slice(0, limit);
    }

    return response.data;
  },
  create: async (data: any): Promise<Expense> => {
    const response = await api.post<Expense>("/expenses", data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
  importCsv: async (formData: FormData): Promise<any> => {
    const response = await api.post("/expenses/import-csv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export const incomeService = {
  getAll: async (params?: any): Promise<Income[]> => {
    const { limit, ...rest } = params || {};
    const response = await api.get<Income[]>("/incomes", { params: rest });

    if (limit && Array.isArray(response.data)) {
      return response.data.slice(0, limit);
    }
    return response.data;
  },
  create: async (data: any): Promise<Income> => {
    const response = await api.post<Income>("/incomes", data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/incomes/${id}`);
  },
};

export const investmentService = {
  getAll: async (params?: any): Promise<Investment[]> => {
    const response = await api.get<Investment[]>("/investments", { params });
    return response.data;
  },
  create: async (data: any): Promise<Investment> => {
    const response = await api.post<Investment>("/investments", data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/investments/${id}`);
  },
  getSummary: async (): Promise<any> => {
    const response = await api.get("/investments/summary");
    return response.data;
  },
};

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>("/categories");
    return response.data;
  },
  create: async (data: any): Promise<Category> => {
    const response = await api.post<Category>("/categories", data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export const savingsGoalService = {
  getAll: async (): Promise<SavingsGoal[]> => {
    const response = await api.get<SavingsGoal[]>("/savings-goals");
    return response.data;
  },
  create: async (data: any): Promise<SavingsGoal> => {
    const response = await api.post<SavingsGoal>("/savings-goals", data);
    return response.data;
  },
  update: async (id: string, data: any): Promise<SavingsGoal> => {
    const response = await api.patch<SavingsGoal>(`/savings-goals/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/savings-goals/${id}`);
  },
};

export const dashboardService = {
  create: async (data: any): Promise<any> => {
    const response = await api.post("/dashboard/create", data);
    return response.data;
  },
  join: async (inviteCode: string): Promise<any> => {
    const response = await api.post("/dashboard/join", { inviteCode });
    return response.data;
  },
  get: async (): Promise<any> => {
    const response = await api.get("/dashboard");
    return response.data;
  },
  update: async (data: any): Promise<any> => {
    const response = await api.patch("/dashboard", data);
    return response.data;
  },
};
