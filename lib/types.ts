export type PaymentMethod = "pix" | "cartao" | "dinheiro" | "transferencia" | "outro"
export type ExpenseType = "fixo" | "variavel"
export type ViewMode = "individual" | "casal"
export type Person = "eu" | "parceiro"

export interface Category {
  id: string
  name: string
  color: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  date: string
  category: string
  paymentMethod: PaymentMethod
  type: ExpenseType
  person: Person
}

export interface Income {
  id: string
  description: string
  amount: number
  date: string
  person: Person
  recurring: boolean
}

export type InvestmentType = "aporte" | "retorno" | "dividendo" | "venda" | "resgate"

export interface SaleProduct {
  id: string
  name: string
  category: string
  costPrice: number
  salePrice: number
}

export interface Sale {
  id: string
  productId: string
  productName: string
  category: string
  quantity: number
  unitCost: number
  unitPrice: number
  date: string
  person: Person
}

export interface Investment {
  id: string
  description: string
  amount: number
  date: string
  person: Person
  type: InvestmentType
  asset: string
}

export const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: "aporte", label: "Aporte" },
  { value: "retorno", label: "Retorno" },
  { value: "dividendo", label: "Dividendo" },
  { value: "venda", label: "Venda" },
  { value: "resgate", label: "Resgate" },
]

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
}

export interface FinanceState {
  expenses: Expense[]
  incomes: Income[]
  investments: Investment[]
  saleProducts: SaleProduct[]
  sales: Sale[]
  categories: Category[]
  savingsGoals: SavingsGoal[]
  viewMode: ViewMode
  personNames: { eu: string; parceiro: string }
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
]

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "pix", label: "Pix" },
  { value: "cartao", label: "Cartao" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "transferencia", label: "Transferencia" },
  { value: "outro", label: "Outro" },
]

export interface User {
  id: string
  name: string
  email: string
  dashboardId?: string
}

export interface AuthResponse {
  user: User
  token: string
}
