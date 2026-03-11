"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"

type CoupleNamesCardProps = {
  names: { eu: string; parceiro: string }
  onChange: (names: { eu: string; parceiro: string }) => void
  onSave: () => Promise<void>
  saved: boolean
  saving: boolean
}

export function CoupleNamesCard({ names, onChange, onSave, saved, saving }: CoupleNamesCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Nomes do Casal</CardTitle>
            <CardDescription>Configure os nomes que aparecem no app</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Seu nome</Label>
              <Input
                value={names.eu}
                onChange={(e) => onChange({ ...names, eu: e.target.value })}
                placeholder="Eu"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Nome do(a) parceiro(a)</Label>
              <Input
                value={names.parceiro}
                onChange={(e) => onChange({ ...names, parceiro: e.target.value })}
                placeholder="Parceiro(a)"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={onSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar Nomes"}
            </Button>
            {saved && (
              <span className="text-sm text-primary font-medium">Salvo com sucesso!</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

