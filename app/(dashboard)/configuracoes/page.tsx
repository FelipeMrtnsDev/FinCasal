"use client"

import React, { useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, User, Tag, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ConfiguracoesPage() {
  const { personNames, setPersonNames, categories, addCategory, removeCategory } = useFinance()

  const [names, setNames] = useState(personNames)
  const [namesSaved, setNamesSaved] = useState(false)

  const [newCatName, setNewCatName] = useState("")
  const [newCatColor, setNewCatColor] = useState("#21C25E")

  const handleSaveNames = () => {
    setPersonNames(names)
    setNamesSaved(true)
    setTimeout(() => setNamesSaved(false), 2000)
  }

  const handleAddCategory = () => {
    if (!newCatName.trim()) return
    addCategory({ name: newCatName.trim(), color: newCatColor })
    setNewCatName("")
    setNewCatColor("#21C25E")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 max-w-2xl"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configuracoes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Personalize os nomes e categorias
        </p>
      </div>

      {/* Person Names */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-2 bg-primary/10">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Seu nome</Label>
                  <Input
                    value={names.eu}
                    onChange={(e) => setNames({ ...names, eu: e.target.value })}
                    placeholder="Eu"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Nome do(a) parceiro(a)</Label>
                  <Input
                    value={names.parceiro}
                    onChange={(e) => setNames({ ...names, parceiro: e.target.value })}
                    placeholder="Parceiro(a)"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSaveNames}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Salvar Nomes
                </Button>
                <AnimatePresence>
                  {namesSaved && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm text-primary font-medium"
                    >
                      Salvo com sucesso!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="rounded-lg p-2 bg-primary/10">
                <Tag className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Categorias de Despesas</CardTitle>
                <CardDescription>Adicione e gerencie categorias</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Add new category */}
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-2 flex-1">
                  <Label>Nome</Label>
                  <Input
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nova categoria"
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="flex items-center gap-1">
                    <Palette className="w-3 h-3" /> Cor
                  </Label>
                  <Input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                </div>
                <Button
                  onClick={handleAddCategory}
                  size="icon"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-9 shrink-0"
                  disabled={!newCatName.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Category list */}
              <div className="flex flex-col gap-1">
                <AnimatePresence mode="popLayout">
                  {categories.map((cat) => (
                    <motion.div
                      key={cat.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, x: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div
                        className="w-4 h-4 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-card"
                        style={{ backgroundColor: cat.color, borderColor: cat.color }}
                      />
                      <span className="text-sm font-medium text-foreground flex-1">{cat.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeCategory(cat.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.2 }}
      >
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
                        // ignore
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
      </motion.div>
    </motion.div>
  )
}
