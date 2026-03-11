export type PaymentMethod =
  | "pix"
  | "cartao"
  | "dinheiro"
  | "transferencia"
  | "outro";
export type ExpenseType = "fixo" | "variavel";
export type ViewMode = "individual" | "casal";
export type Person = "eu" | "parceiro";

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string | { id: string; name: string; color: string };
  categoryId?: string; // Campo vindo do backend
  paymentMethod: PaymentMethod | string; // Backend pode retornar string como "CREDIT_CARD"
  type: ExpenseType | string; // Backend pode retornar string como "VARIABLE"
  person: Person;
  user?: {
    name: string;
    avatarUrl?: string | null;
  };
  categoryData?: {
    // Objeto category vindo do backend (renomeado para evitar conflito com category string)
    name: string;
    color: string;
  };
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  person: Person;
  recurring: boolean;
}

export type InvestmentType =
  | "aporte"
  | "retorno"
  | "dividendo"
  | "venda"
  | "resgate";

export interface Investment {
  id: string;
  description: string;
  amount: number;
  date: string;
  person: Person;
  type: InvestmentType;
  asset: string;
}

export const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: "aporte", label: "Aporte" },
  { value: "retorno", label: "Retorno" },
  { value: "dividendo", label: "Dividendo" },
  { value: "venda", label: "Venda" },
  { value: "resgate", label: "Resgate" },
];

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface FinanceState {
  expenses: Expense[];
  incomes: Income[];
  investments: Investment[];
  categories: Category[];
  savingsGoals: SavingsGoal[];
  viewMode: ViewMode;
  personNames: { eu: string; parceiro: string };
  currentMonth: string;
  startMonth: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "alimentacao", name: "Alimentacao", color: "#21C25E" },
  { id: "transporte", name: "Transporte", color: "#1a9e4b" },
  { id: "moradia", name: "Moradia", color: "#15803d" },
  { id: "lazer", name: "Lazer", color: "#4ade80" },
  { id: "saude", name: "Saude", color: "#86efac" },
  { id: "educacao", name: "Educacao", color: "#166534" },
  { id: "roupas", name: "Roupas", color: "#bbf7d0" },
  { id: "assinaturas", name: "Assinaturas", color: "#0d9488" },
  { id: "outros", name: "Outros", color: "#6b7280" },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "pix", label: "Pix" },
  { value: "cartao", label: "Cartao" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "transferencia", label: "Transferencia" },
  { value: "outro", label: "Outro" },
];

export interface User {
  id: string;
  name: string;
  email: string;
  dashboardId?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
