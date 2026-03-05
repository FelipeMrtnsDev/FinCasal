"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Upload } from "lucide-react"
import Papa from "papaparse"
import { format } from "date-fns"
import { ExpenseType, PaymentMethod, Person, Expense } from "@/lib/types"

interface CsvImportProps {
  onImport: (expenses: Omit<Expense, "id">[]) => Promise<void>
}

export function CsvImport({ onImport }: CsvImportProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const imported = results.data
          .map((row: any) => {
            const description = row.descricao || row.description || row.Descricao || row.Description || row.DESCRICAO || ""
            const amountStr = row.valor || row.amount || row.Valor || row.Amount || row.VALOR || "0"
            const amount = Math.abs(parseFloat(amountStr.toString().replace(",", ".").replace(/[^\d.-]/g, "")) || 0)
            const date = row.data || row.date || row.Data || row.Date || row.DATA || format(new Date(), "yyyy-MM-dd")

            if (!description || amount === 0) return null

            return {
              description,
              amount,
              date,
              category: "outros", // Default category ID, should be handled by backend or user selection ideally
              paymentMethod: "outro" as PaymentMethod,
              type: "variavel" as ExpenseType,
              person: "eu" as Person,
            }
          })
          .filter(Boolean) as Omit<Expense, "id">[]

        if (imported.length > 0) {
          try {
            await onImport(imported)
            setOpen(false)
          } catch (error) {
            console.error("Failed to import CSV", error)
          }
        }
        setLoading(false)
      },
      error: () => {
        setLoading(false)
      }
    })

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
      <CardContent className="p-4 sm:p-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col flex-1 text-center sm:text-left">
              <span className="text-sm font-semibold text-foreground">Importar Extrato Bancario</span>
              <span className="text-xs text-muted-foreground mt-0.5">
                Envie o CSV do seu banco e todas as transacoes serao adicionadas automaticamente
              </span>
            </div>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto" disabled={loading}>
                <Upload className="w-4 h-4" />
                {loading ? "Importando..." : "Importar CSV"}
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importar Extrato CSV</DialogTitle>
              <DialogDescription>
                Selecione um arquivo CSV do seu extrato bancario. O arquivo deve conter colunas como descricao/description e valor/amount.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Arraste o arquivo aqui ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Colunas aceitas: descricao, valor, data (ou em ingles)
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCSVImport}
                  disabled={loading}
                  className="cursor-pointer max-w-xs mx-auto"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
