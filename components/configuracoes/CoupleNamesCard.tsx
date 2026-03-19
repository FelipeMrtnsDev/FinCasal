"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Loader2 } from "lucide-react"

type CoupleNamesCardProps = {
  names: { eu: string; parceiro: string }
  onChange: (names: { eu: string; parceiro: string }) => void
  onSave: () => Promise<void>
  saved: boolean
  saving: boolean
  hasPartnerJoined: boolean
  inviteEmail: string
  onChangeInviteEmail: (value: string) => void
  onInviteByEmail: () => Promise<void>
  inviting: boolean
  inviteCode: string
  inviteSent: boolean
}

export function CoupleNamesCard({
  names,
  onChange,
  onSave,
  saved,
  saving,
  hasPartnerJoined,
  inviteEmail,
  onChangeInviteEmail,
  onInviteByEmail,
  inviting,
  inviteCode,
  inviteSent,
}: CoupleNamesCardProps) {
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
            {hasPartnerJoined ? (
              <div className="flex flex-col gap-2">
                <Label>Parceiro(a)</Label>
                <Input value={names.parceiro} disabled />
              </div>
            ) : (
              <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  Convidar parceiro(a) por email
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => onChangeInviteEmail(e.target.value)}
                    placeholder="nome@exemplo.com"
                  />
                  <Button
                    onClick={onInviteByEmail}
                    disabled={!inviteEmail.trim() || inviting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar convite"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Codigo de convite: <span className="font-mono text-foreground">{inviteCode || "-"}</span>
                </p>
                {inviteSent && (
                  <span className="text-xs text-primary font-medium">
                    Convite preparado no email com sucesso!
                  </span>
                )}
              </div>
            )}
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
