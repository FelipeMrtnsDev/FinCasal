"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AssinaturaSucessoPage() {
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan")
  const planLabel = plan === "casal" ? "Casal" : "Individual"

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Pagamento confirmado</CardTitle>
          <CardDescription>
            Seu plano {planLabel} foi ativado com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Link href="/" className="w-full">
            <Button className="w-full">Ir para o painel</Button>
          </Link>
          <Link href="/configuracoes" className="w-full">
            <Button variant="outline" className="w-full">Ver configurações</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
