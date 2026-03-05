"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter } from "lucide-react"
import { Category, PAYMENT_METHODS } from "@/lib/types"
import { useFinance } from "@/lib/finance-context"

interface ExpenseFiltersProps {
  categories: Category[]
  searchTerm: string
  setSearchTerm: (value: string) => void
  filterCategory: string
  setFilterCategory: (value: string) => void
  filterPayment: string
  setFilterPayment: (value: string) => void
  filterPerson: string
  setFilterPerson: (value: string) => void
}

export function ExpenseFilters({
  categories,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterPayment,
  setFilterPayment,
  filterPerson,
  setFilterPerson,
}: ExpenseFiltersProps) {
  const { viewMode, personNames } = useFinance()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar despesas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-35">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger className="w-35">
                <SelectValue placeholder="Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {PAYMENT_METHODS.map((pm) => (
                  <SelectItem key={pm.value} value={pm.value}>
                    {pm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {viewMode === "casal" && (
              <Select value={filterPerson} onValueChange={setFilterPerson}>
                <SelectTrigger className="w-35">
                  <SelectValue placeholder="Pessoa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="eu">{personNames.eu}</SelectItem>
                  <SelectItem value="parceiro">{personNames.parceiro}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
