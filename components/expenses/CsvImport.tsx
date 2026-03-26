"use client"

import React, { useEffect, useRef, useState } from "react"
import { AxiosError } from "axios"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useFinance } from "@/lib/finance-context"
import { dashboardService, expenseService, ExpenseCsvImportResult } from "@/services/financeService"
import { FileSpreadsheet, Loader2, Upload } from "lucide-react"

interface CsvImportProps {
  onImported: () => Promise<void>
}

const getDashboardId = (value: unknown): string => {
  if (!value || typeof value !== "object") return ""
  const record = value as Record<string, unknown>
  const nestedDashboard =
    record.dashboard && typeof record.dashboard === "object"
      ? (record.dashboard as Record<string, unknown>)
      : null
  return (
    (typeof record.dashboardId === "string" && record.dashboardId) ||
    (typeof record.id === "string" && record.id) ||
    (typeof nestedDashboard?.id === "string" && nestedDashboard.id) ||
    ""
  )
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (typeof data === "string" && data.trim()) return data
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message
      if (typeof message === "string" && message.trim()) return message
    }
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return "Não foi possível importar o arquivo CSV."
}

export function CsvImport({ onImported }: CsvImportProps) {
  const { viewMode } = useFinance()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scope = viewMode === "casal" ? "COUPLE" : "INDIVIDUAL"
  const scopeLabel = scope === "COUPLE" ? "Casal" : "Individual"

  const clearProgressTimer = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  useEffect(() => {
    return () => clearProgressTimer()
  }, [])

  const resetState = () => {
    clearProgressTimer()
    setLoading(false)
    setProgress(0)
    setSelectedFile(null)
    setConfirmOpen(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (loading) return
    setOpen(nextOpen)
    if (!nextOpen) resetState()
  }

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
  }

  const startProcessingAnimation = () => {
    clearProgressTimer()
    progressIntervalRef.current = setInterval(() => {
      setProgress((current) => (current >= 92 ? current : current + 1))
    }, 180)
  }

  const handleConfirmImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Selecione um arquivo",
        description: "Escolha um CSV antes de iniciar a importação.",
        variant: "destructive",
      })
      return
    }

    setConfirmOpen(false)
    setLoading(true)
    setProgress(8)
    startProcessingAnimation()

    try {
      const dashboard = await dashboardService.get()
      const dashboardId = getDashboardId(dashboard)

      if (!dashboardId) {
        throw new Error("Não foi possível identificar o dashboard atual para importar o extrato.")
      }

      const result: ExpenseCsvImportResult = await expenseService.importCsv({
        file: selectedFile,
        dashboardId,
        scope,
        onUploadProgress: (uploadProgress) => {
          const mappedProgress = Math.min(70, Math.max(12, Math.round(uploadProgress * 0.7)))
          setProgress((current) => (mappedProgress > current ? mappedProgress : current))
        },
      })

      clearProgressTimer()
      setProgress(100)
      await onImported()

      toast({
        title: `${result.importedCount} despesas importadas com sucesso`,
        description: `${result.processedRows} linhas processadas em ${result.chunks} lote(s).`,
      })

      window.setTimeout(() => {
        setOpen(false)
        resetState()
      }, 500)
    } catch (error) {
      clearProgressTimer()
      setLoading(false)
      setProgress(0)
      toast({
        title: "Falha ao importar CSV",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
      <CardContent className="p-4 sm:p-6">
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
          <DialogContent showCloseButton={!loading}>
            <DialogHeader>
              <DialogTitle>Importar Extrato CSV</DialogTitle>
              <DialogDescription>
                Envie o arquivo CSV do seu extrato bancário para análise automática e criação das despesas.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-border bg-muted/20 px-6 py-10 text-center">
                  <div className="relative flex items-center justify-center">
                    <Loader2 className="w-20 h-20 animate-spin text-primary/20" />
                    <span className="absolute text-2xl font-bold text-foreground">{progress}%</span>
                  </div>
                  <div className="w-full max-w-sm space-y-2">
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm font-medium text-foreground">Analisando o extrato e importando despesas</p>
                    <p className="text-xs text-muted-foreground">
                      Isso pode levar alguns instantes, dependendo do tamanho do CSV.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-dashed border-border p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">Escolha o arquivo CSV do extrato</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      O backend fará a análise com IA e criará automaticamente as despesas encontradas.
                    </p>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleSelectFile}
                      disabled={loading}
                      className="cursor-pointer max-w-xs mx-auto"
                    />
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <FileSpreadsheet className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {selectedFile ? selectedFile.name : "Nenhum arquivo selecionado"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Contexto atual da importação: <span className="font-medium text-foreground">{scopeLabel}</span>
                        </p>
                        {selectedFile && (
                          <p className="text-xs text-muted-foreground">
                            Tamanho do arquivo: {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!selectedFile}
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Upload className="w-4 h-4" />
                    Analisar e importar
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar importação do extrato?</AlertDialogTitle>
              <AlertDialogDescription>
                Os dados lidos do CSV serão analisados e as despesas identificadas serão adicionadas automaticamente
                aos seus registros de despesas no contexto {scopeLabel.toLowerCase()}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmImport}>Confirmar importação</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
