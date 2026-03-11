"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function DataManagementCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gerenciar Dados</CardTitle>
        <CardDescription>Exporte ou limpe seus dados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const data = localStorage.getItem("finance-app-data")
              if (!data) return
              const blob = new Blob([data], { type: "application/json" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `fincasal-backup-${new Date().toISOString().split("T")[0]}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            Exportar Dados (JSON)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = ".json"
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = (ev) => {
                  try {
                    const data = ev.target?.result as string
                    localStorage.setItem("finance-app-data", data)
                    window.location.reload()
                  } catch {
                  }
                }
                reader.readAsText(file)
              }
              input.click()
            }}
          >
            Importar Dados (JSON)
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Tem certeza que deseja apagar todos os dados? Esta acao nao pode ser desfeita.")) {
                localStorage.removeItem("finance-app-data")
                window.location.reload()
              }
            }}
          >
            Limpar Todos os Dados
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

