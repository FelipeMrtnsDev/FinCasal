"use client"

import { useEffect, useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { Category } from "@/lib/types"
import { billingService, categoryService, dashboardService } from "@/services/financeService"
import { authService } from "@/services/authService"
import { OwnNameCard } from "./OwnNameCard"
import { InvitePartnerCard } from "./InvitePartnerCard"
import { CategoriesCard } from "./CategoriesCard"
import { DataManagementCard } from "./DataManagementCard"
import { Skeleton } from "@/components/ui/skeleton"
import { AxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

function getNamesFromDashboardResponse(
  data: unknown
): { eu: string; parceiro: string } | null {
  if (!data || typeof data !== "object") return null
  const record = data as Record<string, unknown>

  const personNamesRaw = record.personNames
  if (
    personNamesRaw &&
    typeof personNamesRaw === "object" &&
    typeof (personNamesRaw as Record<string, unknown>).eu === "string" &&
    typeof (personNamesRaw as Record<string, unknown>).parceiro === "string"
  ) {
    return {
      eu: (personNamesRaw as Record<string, string>).eu,
      parceiro: (personNamesRaw as Record<string, string>).parceiro,
    }
  }

  if (typeof record.euName === "string" && typeof record.partnerName === "string") {
    return { eu: record.euName, parceiro: record.partnerName }
  }

  return null
}

function hasPartnerFromDashboardResponse(data: unknown): boolean {
  if (!data || typeof data !== "object") return false
  const record = data as Record<string, unknown>
  const users = record.users
  if (Array.isArray(users) && users.length > 1) return true
  if (typeof record.partnerId === "string" && record.partnerId.trim().length > 0) return true
  if (typeof record.partnerEmail === "string" && record.partnerEmail.trim().length > 0) return true
  return false
}

type DashboardMember = {
  id?: string
  userId?: string
  name: string
  email?: string
}

function getMembersFromDashboardResponse(data: unknown): DashboardMember[] {
  if (!data || typeof data !== "object") return []
  const record = data as Record<string, unknown>
  const users =
    (Array.isArray(record.users) && record.users) ||
    (Array.isArray(record.members) && record.members) ||
    (Array.isArray(record.dashboardMembers) && record.dashboardMembers) ||
    []
  if (!Array.isArray(users) || users.length === 0) return []
  const members: DashboardMember[] = []
  for (const user of users) {
    if (!user || typeof user !== "object") continue
    const userRecord = user as Record<string, unknown>
    const nestedUser = userRecord.user && typeof userRecord.user === "object"
      ? (userRecord.user as Record<string, unknown>)
      : null
    const id =
      (typeof userRecord.id === "string" && userRecord.id) ||
      (typeof nestedUser?.id === "string" && nestedUser.id) ||
      undefined
    const userId =
      (typeof userRecord.userId === "string" && userRecord.userId) ||
      (typeof nestedUser?.userId === "string" && nestedUser.userId) ||
      (typeof nestedUser?.id === "string" && nestedUser.id) ||
      undefined
    const name =
      (typeof userRecord.name === "string" && userRecord.name) ||
      (typeof userRecord.displayName === "string" && userRecord.displayName) ||
      (typeof userRecord.fullName === "string" && userRecord.fullName) ||
      (typeof nestedUser?.name === "string" && nestedUser.name) ||
      ""
    if (!name) continue
    const email =
      (typeof userRecord.email === "string" && userRecord.email) ||
      (typeof nestedUser?.email === "string" && nestedUser.email) ||
      undefined
    members.push({ id, userId, name, email })
  }
  return members
}

export function ConfiguracoesClient() {
  const { personNames, setPersonNames } = useFinance()
  const [ownName, setOwnName] = useState(personNames.eu)
  const [partnerName, setPartnerName] = useState(personNames.parceiro)
  const [currentUserId, setCurrentUserId] = useState("")
  const [currentUserEmail, setCurrentUserEmail] = useState("")
  const [namesSaved, setNamesSaved] = useState(false)
  const [savingNames, setSavingNames] = useState(false)
  const [nameSaveError, setNameSaveError] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [hasPartnerJoined, setHasPartnerJoined] = useState(false)
  const [dashboardMembers, setDashboardMembers] = useState<DashboardMember[]>([])
  const [invitingByEmail, setInvitingByEmail] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [isIndividualPlan, setIsIndividualPlan] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [salesCategories, setSalesCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [newCatName, setNewCatName] = useState("")
  const [newCatColor, setNewCatColor] = useState("#21C25E")
  const [newSaleCatName, setNewSaleCatName] = useState("")
  const [newSaleCatColor, setNewSaleCatColor] = useState("#21C25E")
  const [addingCategory, setAddingCategory] = useState(false)
  const [addingSalesCategory, setAddingSalesCategory] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [deletingSalesCategoryId, setDeletingSalesCategoryId] = useState<string | null>(null)

  const fetchSettings = async () => {
    setLoadingCategories(true)
    try {
      const [expenseCategoriesData, salesCategoriesData, dashboardData, userData] = await Promise.all([
        categoryService.getAll("EXPENSE"),
        categoryService.getAll("SALE"),
        dashboardService.get(),
        authService.me(),
      ])
      setCategories(expenseCategoriesData || [])
      setSalesCategories(salesCategoriesData || [])
      const members = getMembersFromDashboardResponse(dashboardData)
      setDashboardMembers(members)
      setHasPartnerJoined(hasPartnerFromDashboardResponse(dashboardData) || members.length >= 2)
      if (userData?.name) {
        setOwnName(userData.name)
      }
      if (userData?.id) {
        setCurrentUserId(userData.id)
      }
      if (userData?.email) {
        setCurrentUserEmail(userData.email)
      }
      const dashboardId = typeof userData?.dashboardId === "string" ? userData.dashboardId : ""
      if (dashboardId) {
        try {
          const subscription = await billingService.getSubscription(dashboardId)
          console.log("subscription", subscription)
          const resolvedPlanId = String(subscription?.plan || "").toUpperCase()
          console.log("resolvedPlanId", resolvedPlanId)
          setIsIndividualPlan(resolvedPlanId.includes("INDIVIDUAL"))
        } catch {
          setIsIndividualPlan(false)
        }
      } else {
        setIsIndividualPlan(false)
      }

      const apiNames = getNamesFromDashboardResponse(dashboardData)
      if (apiNames) {
        const nextPartnerName = apiNames.parceiro || personNames.parceiro
        setPartnerName(nextPartnerName)
        setPersonNames({ eu: userData?.name || apiNames.eu, parceiro: nextPartnerName })
      } else if (members.length > 0) {
        const selfMember =
          members.find((member) => member.userId === userData?.id) ||
          members.find((member) => member.email?.toLowerCase() === String(userData?.email || "").toLowerCase()) ||
          members[0]
        const otherMember =
          members.find((member) => member !== selfMember) ||
          null
        const nextOwnName = selfMember?.name || ownName
        const nextPartnerName = otherMember?.name || partnerName
        setOwnName(nextOwnName)
        setPartnerName(nextPartnerName)
        setPersonNames({ eu: nextOwnName, parceiro: nextPartnerName })
      }
    } catch (error) {
      console.error("Erro ao carregar configuracoes:", error)
      setCategories([])
      setSalesCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSaveNames = async () => {
    if (!ownName.trim()) return
    setSavingNames(true)
    setNameSaveError("")
    try {
      const selfMember =
        dashboardMembers.find((member) => member.userId === currentUserId) ||
        dashboardMembers.find((member) => member.email?.toLowerCase() === currentUserEmail.toLowerCase()) ||
        null
      const payload = {
        personNames: [
          {
            userId: selfMember?.userId || selfMember?.id || currentUserId || "self",
            name: ownName.trim(),
          },
        ],
      }
      const updatedDashboard = await dashboardService.update(payload)
      const apiNames = getNamesFromDashboardResponse(updatedDashboard)
      const updatedMembers = getMembersFromDashboardResponse(updatedDashboard)
      const updatedSelfMember =
        updatedMembers.find((member) => member.userId === currentUserId) ||
        updatedMembers.find((member) => member.email?.toLowerCase() === currentUserEmail.toLowerCase()) ||
        null
      const updatedPartnerMember =
        updatedMembers.find((member) => member !== updatedSelfMember) ||
        null
      const nextOwnName = apiNames?.eu || updatedSelfMember?.name || ownName.trim()
      const nextPartnerName = apiNames?.parceiro || updatedPartnerMember?.name || partnerName
      setDashboardMembers(updatedMembers)
      setOwnName(nextOwnName)
      setPartnerName(nextPartnerName)
      setPersonNames({ eu: nextOwnName, parceiro: nextPartnerName })
      setNamesSaved(true)
      setTimeout(() => setNamesSaved(false), 2000)
    } catch (error) {
      const status = (error as AxiosError)?.response?.status
      if (status === 429) {
        setNameSaveError("Você já alterou este nome nesta semana. Tente novamente em alguns dias.")
      } else {
        setNameSaveError("Não foi possível salvar o nome agora. Tente novamente.")
      }
    } finally {
      setSavingNames(false)
    }
  }

  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim() || invitingByEmail) return
    setInvitingByEmail(true)
    setInviteSent(false)
    try {
      const dashboard = await dashboardService.invite(inviteEmail.trim())
      const members = getMembersFromDashboardResponse(dashboard)
      setDashboardMembers(members)
      setHasPartnerJoined(hasPartnerFromDashboardResponse(dashboard) || members.length >= 2)
      const namesFromDashboard = getNamesFromDashboardResponse(dashboard)
      if (namesFromDashboard?.parceiro) {
        setPartnerName(namesFromDashboard.parceiro)
        setPersonNames({ eu: ownName, parceiro: namesFromDashboard.parceiro })
      }
      setInviteEmail("")
      setInviteSent(true)
      setTimeout(() => setInviteSent(false), 2500)
    } finally {
      setInvitingByEmail(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCatName.trim() || addingCategory) return
    setAddingCategory(true)
    try {
      await categoryService.create({ name: newCatName.trim(), color: newCatColor, type: "EXPENSE" })
      setNewCatName("")
      setNewCatColor("#21C25E")
      await fetchSettings()
    } finally {
      setAddingCategory(false)
    }
  }

  const handleAddSalesCategory = async () => {
    if (!newSaleCatName.trim() || addingSalesCategory) return
    setAddingSalesCategory(true)
    try {
      await categoryService.create({ name: newSaleCatName.trim(), color: newSaleCatColor, type: "SALE" })
      setNewSaleCatName("")
      setNewSaleCatColor("#21C25E")
      await fetchSettings()
    } finally {
      setAddingSalesCategory(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (deletingCategoryId) return
    setDeletingCategoryId(id)
    try {
      await categoryService.delete(id)
      await fetchSettings()
    } finally {
      setDeletingCategoryId(null)
    }
  }

  const handleDeleteSalesCategory = async (id: string) => {
    if (deletingSalesCategoryId) return
    setDeletingSalesCategoryId(id)
    try {
      await categoryService.delete(id)
      await fetchSettings()
    } finally {
      setDeletingSalesCategoryId(null)
    }
  }

  const handleLogout = async () => {
    await authService.logout()
    window.location.href = "/login"
  }

  if (loadingCategories) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <div>
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="rounded-xl border border-border p-6">
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="rounded-xl border border-border p-6">
          <Skeleton className="h-4 w-44 mb-4" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="rounded-xl border border-border p-6">
          <Skeleton className="h-4 w-56 mb-4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configuracoes</h1>
        <p className="text-muted-foreground text-sm mt-1">Personalize os nomes e categorias</p>
      </div>

      {isIndividualPlan && (
        <div className="rounded-xl border border-primary/20 bg-linear-to-r from-primary/5 to-transparent p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
          <div className="pl-1 md:pl-2">
            <h3 className="font-semibold text-foreground text-lg">
              Plano Casal
            </h3>
            <p className="text-sm mt-1">
              Faça upgrade para liberar o convite e organizar as finanças junto com seu parceiro(a).
            </p>
          </div>
          <Button 
            className="w-full sm:w-auto shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium shadow-sm"
            onClick={() => window.location.href = "/plans"}
          >
            Fazer Upgrade
          </Button>
        </div>
      )}

      <OwnNameCard
        ownName={ownName}
        onChangeOwnName={(value) => {
          setOwnName(value)
          if (nameSaveError) setNameSaveError("")
        }}
        onSaveOwnName={handleSaveNames}
        saved={namesSaved}
        saving={savingNames}
        error={nameSaveError}
      />

      {!isIndividualPlan && (
        <InvitePartnerCard
          partnerName={partnerName}
          hasPartnerJoined={hasPartnerJoined}
          members={dashboardMembers}
          inviteEmail={inviteEmail}
          onChangeInviteEmail={setInviteEmail}
          onInviteByEmail={handleInviteByEmail}
          inviting={invitingByEmail}
          inviteSent={inviteSent}
        />
      )}

      <CategoriesCard
        variant="expenses"
        title="Categorias de Despesas"
        description="Esta seção é para categorias de despesas."
        accordionValue="categorias-despesas"
        categories={categories}
        newCatName={newCatName}
        newCatColor={newCatColor}
        onChangeName={setNewCatName}
        onChangeColor={setNewCatColor}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        adding={addingCategory}
        deletingId={deletingCategoryId}
        loading={loadingCategories}
        id="categorias"
      />

      <CategoriesCard
        variant="sales"
        title="Categorias de Vendas"
        description="Esta seção é para categorias de vendas."
        accordionValue="categorias-vendas"
        categories={salesCategories}
        newCatName={newSaleCatName}
        newCatColor={newSaleCatColor}
        onChangeName={setNewSaleCatName}
        onChangeColor={setNewSaleCatColor}
        onAddCategory={handleAddSalesCategory}
        onDeleteCategory={handleDeleteSalesCategory}
        adding={addingSalesCategory}
        deletingId={deletingSalesCategoryId}
        loading={loadingCategories}
      />

      <DataManagementCard />

      <div className="md:hidden mt-4 mb-8">
        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </Button>
      </div>
    </div>
  )
}
