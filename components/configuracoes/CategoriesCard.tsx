"use client"

import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Category } from "@/lib/types"
import { Tag, Palette, Trash2, Loader2, Receipt } from "lucide-react"

type CategoriesCardProps = {
  variant: "expenses" | "sales"
  title: string
  description: string
  accordionValue: string
  categories: Category[]
  newCatName: string
  newCatColor: string
  onChangeName: (value: string) => void
  onChangeColor: (value: string) => void
  onAddCategory: () => Promise<void>
  onDeleteCategory: (id: string) => Promise<void>
  adding: boolean
  deletingId: string | null
  loading?: boolean
  id?: string
}

export function CategoriesCard({
  variant,
  title,
  description,
  accordionValue,
  categories,
  newCatName,
  newCatColor,
  onChangeName,
  onChangeColor,
  onAddCategory,
  onDeleteCategory,
  adding,
  deletingId,
  loading = false,
  id,
}: CategoriesCardProps) {
  const Icon = variant === "expenses" ? Receipt : Tag

  return (
    <Card id={id}>
      <CardContent className="p-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={accordionValue} className="border-b-0">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-end gap-3">
                  <div className="flex flex-col gap-2 flex-1">
                    <Label>Nome</Label>
                    <Input
                      value={newCatName}
                      onChange={(e) => onChangeName(e.target.value)}
                      placeholder="Nova categoria"
                      onKeyDown={(e) => e.key === "Enter" && onAddCategory()}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="flex items-center gap-1">
                      <Palette className="w-3 h-3" /> Cor
                    </Label>
                    <Input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => onChangeColor(e.target.value)}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                  </div>
                  <Button
                    onClick={onAddCategory}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 shrink-0 px-4"
                    disabled={!newCatName.trim() || adding}
                  >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar"}
                  </Button>
                </div>

                <div className="flex flex-col gap-1">
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg">
                        <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="w-7 h-7 rounded-md shrink-0" />
                      </div>
                    ))
                    : categories.map((cat) => (
                      <div
                        key={cat.id}
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
                          onClick={() => onDeleteCategory(cat.id)}
                          disabled={deletingId === cat.id}
                        >
                          {deletingId === cat.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
