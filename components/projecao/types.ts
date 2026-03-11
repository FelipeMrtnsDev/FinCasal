import { LucideIcon } from "lucide-react"

export type GoalFormState = {
  name: string
  targetAmount: string
  currentAmount: string
  deadline: string
}

export type ProjectionStat = {
  label: string
  value: number
  icon: LucideIcon
  isCurrency?: boolean
}
