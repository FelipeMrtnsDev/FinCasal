import api from "@/lib/api";
import { AxiosError, AxiosProgressEvent } from "axios";
import {
  Expense,
  Income,
  Investment,
  Category,
  CategoryType,
  DataScope,
  SavingsGoal,
  ViewMode,
} from "@/lib/types";

export interface BudgetDTO {
  id: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  month: string;
}

export interface BudgetStatusDTO {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  percentage: number;
  status: string;
}

export interface CreateBudgetPayload {
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  month: string;
}

export interface UpdateBudgetPayload {
  limitAmount: number;
}

export interface SaleProductDTO {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
}

export interface CreateSaleProductPayload {
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
}

export interface UpdateSaleProductPayload {
  name?: string;
  category?: string;
  costPrice?: number;
  salePrice?: number;
}

export interface SaleDTO {
  id: string;
  productId: string;
  quantity: number;
  date: string;
  personId?: string;
  productName?: string;
  category?: string;
  unitPrice?: number;
  unitCost?: number;
}

export interface CreateSalePayload {
  productId: string;
  quantity: number;
  date: string;
  personId?: string;
  scope?: DataScope;
}

export interface ExpenseCsvImportPayload {
  file: File;
  dashboardId: string;
  scope?: DataScope;
  onUploadProgress?: (progress: number) => void;
}

export interface ExpenseCsvImportResult {
  importedCount: number;
  processedRows: number;
  chunks: number;
}

export interface SalesSummaryDTO {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalUnits: number;
}

export interface SalesByCategoryDTO {
  category: string;
  revenue: number;
  profit: number;
}

export interface SalesByProductDTO {
  productId: string;
  name: string;
  revenue: number;
  profitPerUnit: number;
}

const isBadRequest = (error: unknown): boolean =>
  error instanceof AxiosError
    ? error.response?.status === 400
    : typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 400;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string }
      | string
      | undefined;
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && typeof data.message === "string")
      return data.message;
    return error.message;
  }
  return String(error);
};

const isDashboardRequiredError = (error: unknown): boolean => {
  if (!isBadRequest(error)) return false;
  return getErrorMessage(error).toLowerCase().includes("dashboard");
};

const normalizeCategoryType = (value: unknown): CategoryType | undefined => {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("sale") || normalized.includes("venda"))
    return "SALE";
  if (normalized.includes("expense") || normalized.includes("desp"))
    return "EXPENSE";
  return undefined;
};

const toDataScope = (view?: DataScope | ViewMode): DataScope => {
  if (view === "COUPLE" || view === "casal") return "COUPLE";
  return "INDIVIDUAL";
};

const toBackendCategoryType = (type: CategoryType): "EXPENSE" | "SALE" =>
  type === "SALE" ? "SALE" : "EXPENSE";

const normalizeCategory = (
  value: unknown,
  fallbackType?: CategoryType,
): Category | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = record.id;
  const name = record.name;
  if (typeof id !== "string" || typeof name !== "string") return null;
  return {
    id,
    name,
    color:
      typeof record.color === "string" && record.color
        ? record.color
        : "#21C25E",
    type: normalizeCategoryType(record.type) || fallbackType,
  };
};

const normalizeCategoryList = (
  data: unknown,
  fallbackType?: CategoryType,
): Category[] => {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => normalizeCategory(item, fallbackType))
    .filter((item): item is Category => item !== null);
};

let dashboardCheckCache: { checkedAt: number; hasDashboard: boolean } | null =
  null;

const hasDashboardMembership = async (): Promise<boolean> => {
  const now = Date.now();
  if (dashboardCheckCache && now - dashboardCheckCache.checkedAt < 15000) {
    return dashboardCheckCache.hasDashboard;
  }
  try {
    await api.get("/dashboard");
    dashboardCheckCache = { checkedAt: now, hasDashboard: true };
    return true;
  } catch (error) {
    if (isDashboardRequiredError(error)) {
      dashboardCheckCache = { checkedAt: now, hasDashboard: false };
      return false;
    }
    dashboardCheckCache = { checkedAt: now, hasDashboard: true };
    return true;
  }
};

export const expenseService = {
  getAll: async (params?: {
    view?: DataScope | ViewMode;
    [key: string]: any;
  }): Promise<Expense[]> => {
    if (!(await hasDashboardMembership())) return [];
    const { limit, view, ...rest } = params || {};
    const scopedParams = { ...rest, view: toDataScope(view) };
    let response;
    try {
      response = await api.get<Expense[]>("/expenses", {
        params: scopedParams,
      });
    } catch {
      try {
        response = await api.get<Expense[]>("/expenses", { params: rest });
      } catch (error) {
        if (!isBadRequest(error)) throw error;
        response = await api.get<Expense[]>("/expenses");
      }
    }

    if (limit && Array.isArray(response.data)) {
      return response.data.slice(0, limit);
    }

    return response.data;
  },
  create: async (data: any, view?: DataScope | ViewMode): Promise<Expense> => {
    const payload = { ...data, scope: toDataScope(view) };
    const response = await api.post<Expense>("/expenses", payload);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
  importCsv: async ({
    file,
    dashboardId,
    scope = "INDIVIDUAL",
    onUploadProgress,
  }: ExpenseCsvImportPayload): Promise<ExpenseCsvImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dashboardId", dashboardId);
    formData.append("scope", scope);

    const response = await api.post<ExpenseCsvImportResult>(
      "/expenses/import",
      formData,
      {
      headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event: AxiosProgressEvent) => {
          if (!onUploadProgress || !event.total) return;
          const progress = Math.round((event.loaded * 100) / event.total);
          onUploadProgress(progress);
        },
      },
    );
    return response.data;
  },
};

export const incomeService = {
  getAll: async (params?: {
    view?: DataScope | ViewMode;
    [key: string]: any;
  }): Promise<Income[]> => {
    if (!(await hasDashboardMembership())) return [];
    const { limit, view, ...rest } = params || {};
    const scopedParams = { ...rest, view: toDataScope(view) };
    let response;
    try {
      response = await api.get<Income[]>("/incomes", { params: scopedParams });
    } catch {
      try {
        response = await api.get<Income[]>("/incomes", { params: rest });
      } catch (error) {
        if (!isBadRequest(error)) throw error;
        response = await api.get<Income[]>("/incomes");
      }
    }

    if (limit && Array.isArray(response.data)) {
      return response.data.slice(0, limit);
    }
    return response.data;
  },
  create: async (data: any, view?: DataScope | ViewMode): Promise<Income> => {
    const payload = { ...data, scope: toDataScope(view) };
    const response = await api.post<Income>("/incomes", payload);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    // A rota base no app.ts é /api/incomes
    // O axios chama /incomes/${id}
    // Verificando se há barra extra no backend ou se o ID está vindo correto
    await api.delete(`/incomes/${id}`);
  },
};

export const investmentService = {
  getAll: async (params?: {
    view?: DataScope | ViewMode;
    [key: string]: any;
  }): Promise<Investment[]> => {
    if (!(await hasDashboardMembership())) return [];
    const { view, ...rest } = params || {};
    let response;
    try {
      response = await api.get<Investment[]>("/investments", {
        params: { ...rest, view: toDataScope(view) },
      });
    } catch {
      response = await api.get<Investment[]>("/investments", { params: rest });
    }
    return response.data;
  },
  create: async (
    data: any,
    view?: DataScope | ViewMode,
  ): Promise<Investment> => {
    const payload = { ...data, scope: toDataScope(view) };
    const response = await api.post<Investment>("/investments", payload);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/investments/${id}`);
  },
  getSummary: async (view?: DataScope | ViewMode): Promise<any> => {
    if (!(await hasDashboardMembership()))
      return { totalInvested: 0, totalReturns: 0 };
    let response;
    try {
      response = await api.get("/investments/summary", {
        params: { view: toDataScope(view) },
      });
    } catch {
      response = await api.get("/investments/summary");
    }
    return response.data;
  },
};

export const categoryService = {
  getAll: async (type: CategoryType = "EXPENSE"): Promise<Category[]> => {
    if (!(await hasDashboardMembership())) return [];
    const params = { type: toBackendCategoryType(type) };
    try {
      const response = await api.get<unknown>("/categories", { params });
      return normalizeCategoryList(response.data, type);
    } catch (error) {
      try {
        const response = await api.get<unknown>("/categories", {
          params: { type },
        });
        return normalizeCategoryList(response.data, type);
      } catch {
        try {
          const response = await api.get<unknown>(`/categories/${type}`);
          return normalizeCategoryList(response.data, type);
        } catch {
          if (!isBadRequest(error)) throw error;
          const response = await api.get<unknown>("/categories");
          const normalized = normalizeCategoryList(response.data);
          return normalized.filter((category) =>
            category.type ? category.type === type : true,
          );
        }
      }
    }
  },
  create: async (data: Omit<Category, "id">): Promise<Category> => {
    const payload = {
      ...data,
      type: data.type ? toBackendCategoryType(data.type) : undefined,
    };
    const response = await api.post<unknown>("/categories", payload);
    return (
      normalizeCategory(response.data, data.type || "EXPENSE") || {
        id: "",
        name: data.name,
        color: data.color,
        type: data.type || "EXPENSE",
      }
    );
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
  update: async (
    id: string,
    data: Partial<Omit<Category, "id">>,
  ): Promise<Category> => {
    const payload = {
      ...data,
      type: data.type ? toBackendCategoryType(data.type) : undefined,
    };
    const response = await api.patch<unknown>(`/categories/${id}`, payload);
    return (
      normalizeCategory(response.data, data.type) || {
        id,
        name: data.name || "",
        color: data.color || "#21C25E",
        type: data.type,
      }
    );
  },
};

export const savingsGoalService = {
  getAll: async (): Promise<SavingsGoal[]> => {
    if (!(await hasDashboardMembership())) return [];
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
  invite: async (email: string): Promise<any> => {
    const response = await api.post("/dashboard/invite", { email });
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

export const budgetService = {
  getAll: async (month?: string): Promise<BudgetDTO[]> => {
    if (!(await hasDashboardMembership())) return [];
    const response = await api.get<BudgetDTO[]>("/budgets", {
      params: month ? { month } : undefined,
    });
    return response.data;
  },
  create: async (data: CreateBudgetPayload): Promise<BudgetDTO> => {
    const response = await api.post<BudgetDTO>("/budgets", data);
    return response.data;
  },
  update: async (id: string, data: UpdateBudgetPayload): Promise<BudgetDTO> => {
    const response = await api.patch<BudgetDTO>(`/budgets/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },
  getStatus: async (month: string): Promise<BudgetStatusDTO[]> => {
    if (!(await hasDashboardMembership())) return [];
    const response = await api.get<BudgetStatusDTO[]>("/budgets/status", {
      params: { month },
    });
    return response.data;
  },
};

export const saleProductService = {
  getAll: async (): Promise<SaleProductDTO[]> => {
    const response = await api.get<SaleProductDTO[]>("/sale-products");
    return response.data;
  },
  create: async (data: CreateSaleProductPayload): Promise<SaleProductDTO> => {
    const response = await api.post<SaleProductDTO>("/sale-products", data);
    return response.data;
  },
  update: async (
    id: string,
    data: UpdateSaleProductPayload,
  ): Promise<SaleProductDTO> => {
    const response = await api.patch<SaleProductDTO>(
      `/sale-products/${id}`,
      data,
    );
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/sale-products/${id}`);
  },
};

export const salesService = {
  getAll: async (params?: {
    month?: string;
    productId?: string;
    category?: string;
    view?: DataScope | ViewMode;
  }): Promise<SaleDTO[]> => {
    if (!(await hasDashboardMembership())) return [];
    const { view, ...rest } = params || {};
    let response;
    try {
      response = await api.get<SaleDTO[]>("/sales", {
        params: { ...rest, view: toDataScope(view) },
      });
    } catch {
      response = await api.get<SaleDTO[]>("/sales", { params: rest });
    }
    return response.data;
  },
  create: async (
    data: CreateSalePayload,
    view?: DataScope | ViewMode,
  ): Promise<SaleDTO> => {
    const payload = { ...data, scope: data.scope || toDataScope(view) };
    const response = await api.post<SaleDTO>("/sales", payload);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/sales/${id}`);
  },
  getSummary: async (
    month?: string,
    view?: DataScope | ViewMode,
  ): Promise<SalesSummaryDTO> => {
    if (!(await hasDashboardMembership())) {
      return { totalRevenue: 0, totalCost: 0, totalProfit: 0, totalUnits: 0 };
    }
    let response;
    try {
      response = await api.get<SalesSummaryDTO>("/sales/summary", {
        params: { ...(month ? { month } : {}), view: toDataScope(view) },
      });
    } catch {
      response = await api.get<SalesSummaryDTO>("/sales/summary", {
        params: month ? { month } : undefined,
      });
    }
    return response.data;
  },
  getByCategory: async (
    month?: string,
    view?: DataScope | ViewMode,
  ): Promise<SalesByCategoryDTO[]> => {
    if (!(await hasDashboardMembership())) return [];
    let response;
    try {
      response = await api.get<SalesByCategoryDTO[]>("/sales/by-category", {
        params: { ...(month ? { month } : {}), view: toDataScope(view) },
      });
    } catch {
      response = await api.get<SalesByCategoryDTO[]>("/sales/by-category", {
        params: month ? { month } : undefined,
      });
    }
    return response.data;
  },
  getByProduct: async (
    month?: string,
    view?: DataScope | ViewMode,
  ): Promise<SalesByProductDTO[]> => {
    if (!(await hasDashboardMembership())) return [];
    let response;
    try {
      response = await api.get<SalesByProductDTO[]>("/sales/by-product", {
        params: { ...(month ? { month } : {}), view: toDataScope(view) },
      });
    } catch {
      response = await api.get<SalesByProductDTO[]>("/sales/by-product", {
        params: month ? { month } : undefined,
      });
    }
    return response.data;
  },
};
