"use client"

import { useEffect, useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { Category } from "@/lib/types"
import { categoryService, dashboardService } from "@/services/financeService"
import { authService } from "@/services/authService"
import { OwnNameCard } from "./OwnNameCard"
import { InvitePartnerCard } from "./InvitePartnerCard"
import { CategoriesCard } from "./CategoriesCard"
import { DataManagementCard } from "./DataManagementCard"

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

export function ConfiguracoesClient() {
  const { personNames, setPersonNames } = useFinance()
  const [ownName, setOwnName] = useState(personNames.eu)
  const [partnerName, setPartnerName] = useState(personNames.parceiro)
  const [namesSaved, setNamesSaved] = useState(false)
  const [savingNames, setSavingNames] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [hasPartnerJoined, setHasPartnerJoined] = useState(false)
  const [invitingByEmail, setInvitingByEmail] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)

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
      setHasPartnerJoined(hasPartnerFromDashboardResponse(dashboardData))
      if (userData?.name) {
        setOwnName(userData.name)
      }

      const apiNames = getNamesFromDashboardResponse(dashboardData)
      if (apiNames) {
        const nextPartnerName = apiNames.parceiro || personNames.parceiro
        setPartnerName(nextPartnerName)
        setPersonNames({ eu: userData?.name || apiNames.eu, parceiro: nextPartnerName })
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
    try {
      const updatedUser = await authService.updateName(ownName.trim())
      const nextOwnName = updatedUser?.name || ownName.trim()
      setOwnName(nextOwnName)
      setPersonNames({ eu: nextOwnName, parceiro: partnerName })
      setNamesSaved(true)
      setTimeout(() => setNamesSaved(false), 2000)
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
      setHasPartnerJoined(hasPartnerFromDashboardResponse(dashboard))
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

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configuracoes</h1>
        <p className="text-muted-foreground text-sm mt-1">Personalize os nomes e categorias</p>
      </div>

      <OwnNameCard
        ownName={ownName}
        onChangeOwnName={setOwnName}
        onSaveOwnName={handleSaveNames}
        saved={namesSaved}
        saving={savingNames}
      />

      <InvitePartnerCard
        partnerName={partnerName}
        hasPartnerJoined={hasPartnerJoined}
        inviteEmail={inviteEmail}
        onChangeInviteEmail={setInviteEmail}
        onInviteByEmail={handleInviteByEmail}
        inviting={invitingByEmail}
        inviteSent={inviteSent}
      />

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
    </div>
  )
}
