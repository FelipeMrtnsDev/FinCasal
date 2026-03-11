"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Package, PackagePlus, Pencil, Trash2 } from "lucide-react"
import { SaleProduct } from "./types"
import { formatCurrency } from "./utils"

type SalesProductsCardProps = {
  products: SaleProduct[]
  onNewProduct: () => void
  onEditProduct: (product: SaleProduct) => void
  onDeleteProduct: (productId: string) => void
}

export function SalesProductsCard({ products, onNewProduct, onEditProduct, onDeleteProduct }: SalesProductsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Catalogo de Produtos</CardTitle>
        <CardDescription>{products.length} produtos cadastrados</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="py-10 text-center">
            <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum produto cadastrado ainda.</p>
            <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={onNewProduct}>
              <PackagePlus className="w-4 h-4" />
              Cadastrar primeiro produto
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {products.map((product) => {
              const margin = product.salePrice > 0 ? ((product.salePrice - product.costPrice) / product.salePrice) * 100 : 0
              return (
                <div key={product.id} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">{product.name}</span>
                    <span className="text-xs text-muted-foreground">{product.category}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 mr-2">
                    <span className="text-sm font-mono font-semibold text-foreground">{formatCurrency(product.salePrice)}</span>
                    <span className={cn("text-xs font-mono", margin >= 0 ? "text-primary" : "text-amber-600")}>
                      margem {margin.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onEditProduct(product)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDeleteProduct(product.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
