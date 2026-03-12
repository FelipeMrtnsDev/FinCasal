"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format, parseISO, differenceInMonths } from "date-fns"
import { Trash2, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { SavingsGoal } from "@/lib/types"
import { formatCurrency } from "./utils"

type GoalsListProps = {
  savingsGoals: SavingsGoal[]
  onOpenDeposit: (goalId: string) => void
  onDeleteGoal: (goalId: string) => Promise<void>
  deletingGoalId?: string | null
}

export function GoalsList({ savingsGoals, onOpenDeposit, onDeleteGoal, deletingGoalId }: GoalsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Metas de Economia</CardTitle>
        <CardDescription>Acompanhe o progresso de cada meta</CardDescription>
      </CardHeader>
      <CardContent>
        {savingsGoals.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Nenhuma meta criada. Crie sua primeira meta de economia!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {savingsGoals.map((goal) => {
              const progress = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0
              const remaining = goal.targetAmount - goal.currentAmount
              const monthsLeft = goal.deadline ? differenceInMonths(parseISO(goal.deadline), new Date()) : null
              const monthlyNeeded = monthsLeft && monthsLeft > 0 ? remaining / monthsLeft : null

              return (
                <div key={goal.id} className="border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{goal.name}</h3>
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Prazo: {(() => { try { return format(parseISO(goal.deadline), "dd/MM/yyyy") } catch { return goal.deadline } })()}
                          {monthsLeft !== null && monthsLeft > 0 && ` (${monthsLeft} meses)`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary h-8 px-2"
                        onClick={() => onOpenDeposit(goal.id)}
                      >
                        + Depositar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteGoal(goal.id)}
                        disabled={deletingGoalId === goal.id}
                      >
                        {deletingGoalId === goal.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono text-primary font-medium">{formatCurrency(goal.currentAmount)}</span>
                      <span className="font-mono text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn("h-full rounded-full", progress >= 100 ? "bg-primary" : "bg-primary/80")}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-1">
                      <span>{progress.toFixed(1)}% concluido</span>
                      {monthlyNeeded && monthlyNeeded > 0 && (
                        <span>Guardar {formatCurrency(monthlyNeeded)}/mes</span>
                      )}
                      {remaining > 0 && <span>Faltam {formatCurrency(remaining)}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
