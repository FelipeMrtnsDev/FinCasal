"use client"

import { TrendingUp, ShoppingBag } from "lucide-react"
import { useFinance } from "@/lib/finance-context"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesTabContent } from "@/components/sales/SalesTabContent"
import { InvestmentsTabContent } from "./InvestmentsTabContent"

export function InvestimentosClient() {
  const { personNames } = useFinance()

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="vendas" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
            <TabsTrigger value="vendas" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="investimentos" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Investimentos
            </TabsTrigger>
          </TabsList>
        </div>

        <SalesTabContent />
        <InvestmentsTabContent personNames={personNames} />
      </Tabs>
    </div>
  )
}
