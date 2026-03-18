"use client"

import { useEffect, useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { Category } from "@/lib/types"
import { categoryService, dashboardService } from "@/services/financeService"
import { CoupleNamesCard } from "./CoupleNamesCard"
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

export function ConfiguracoesClient() {
  const { personNames, setPersonNames } = useFinance()
  const [names, setNames] = useState(personNames)
  const [namesSaved, setNamesSaved] = useState(false)
  const [savingNames, setSavingNames] = useState(false)

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
      const [expenseCategoriesData, salesCategoriesData, dashboardData] = await Promise.all([
        categoryService.getAll("EXPENSE"),
        categoryService.getAll("SALE"),
        dashboardService.get(),
      ])
      setCategories(expenseCategoriesData || [])
      setSalesCategories(salesCategoriesData || [])

      const apiNames = getNamesFromDashboardResponse(dashboardData)
      if (apiNames) {
        setNames(apiNames)
        setPersonNames(apiNames)
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
    setSavingNames(true)
    try {
      await dashboardService.update({ personNames: names })
      setPersonNames(names)
      setNamesSaved(true)
      setTimeout(() => setNamesSaved(false), 2000)
    } finally {
      setSavingNames(false)
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

      <CoupleNamesCard
        names={names}
        onChange={setNames}
        onSave={handleSaveNames}
        saved={namesSaved}
        saving={savingNames}
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
