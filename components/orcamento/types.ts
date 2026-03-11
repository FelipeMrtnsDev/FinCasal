export type Budget = {
  id: string
  categoryId: string
  categoryName: string
  limitAmount: number
  month: string
}

export type BudgetStatus = Budget & {
  spent: number
  percent: number
  isOver: boolean
  isNear: boolean
}
