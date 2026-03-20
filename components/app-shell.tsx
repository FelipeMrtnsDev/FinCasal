"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Tag,
  PiggyBank,
  Settings,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useFinance } from "@/lib/finance-context"
import { Button } from "@/components/ui/button"
import { dashboardService } from "@/services/financeService"

const navItems = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/despesas", label: "Despesas", icon: Receipt },
  { href: "/renda", label: "Renda", icon: Wallet },
  { href: "/investimentos", label: "Vendas", icon: Tag },
  { href: "/projecao", label: "Projecao", icon: PiggyBank },
]

const mobileNavItems = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/despesas", label: "Despesas", icon: Receipt },
  { href: "/renda", label: "Renda", icon: Wallet },
  { href: "/investimentos", label: "Vendas", icon: Tag },
  { href: "/projecao", label: "Metas", icon: PiggyBank },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { viewMode, setViewMode, personNames } = useFinance()
  const [canUseCoupleMode, setCanUseCoupleMode] = useState(false)

  useEffect(() => {
    let mounted = true
    const checkDashboardMembers = async () => {
      try {
        const dashboardData = await dashboardService.get()
        const record = (dashboardData || {}) as Record<string, unknown>
        const users =
          (Array.isArray(record.users) && record.users) ||
          (Array.isArray(record.members) && record.members) ||
          (Array.isArray(record.dashboardMembers) && record.dashboardMembers) ||
          []
        const hasPartner =
          users.length >= 2 ||
          (typeof record.partnerId === "string" && record.partnerId.trim().length > 0) ||
          (typeof record.partnerEmail === "string" && record.partnerEmail.trim().length > 0)
        if (mounted) {
          setCanUseCoupleMode(hasPartner)
          if (!hasPartner && viewMode === "casal") {
            setViewMode("individual")
          }
        }
      } catch {
        if (mounted) {
          setCanUseCoupleMode(false)
          if (viewMode === "casal") {
            setViewMode("individual")
          }
        }
      }
    }
    checkDashboardMembers()
    return () => {
      mounted = false
    }
  }, [setViewMode, viewMode])

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border relative z-20 shrink-0 transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <div className="flex items-center justify-between p-4 h-16">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <Wallet className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">FinCasal</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* View Mode Toggle */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="flex rounded-lg bg-sidebar-accent p-1">
              <button
                onClick={() => canUseCoupleMode && setViewMode("casal")}
                disabled={!canUseCoupleMode}
                className={cn(
                  "flex-1 text-xs py-1.5 px-2 rounded-md transition-all font-medium inline-flex items-center justify-center gap-1",
                  viewMode === "casal"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:text-sidebar-primary-foreground",
                  !canUseCoupleMode && "opacity-60 cursor-not-allowed"
                )}
              >
                {!canUseCoupleMode && <Lock className="w-3 h-3" />}
                Casal
              </button>
              <button
                onClick={() => setViewMode("individual")}
                className={cn(
                  "flex-1 text-xs py-1.5 px-2 rounded-md transition-all font-medium",
                  viewMode === "individual"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:text-sidebar-primary-foreground"
                )}
              >
                Individual
              </button>
            </div>
          </div>
        )}

        <nav className="flex-1 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                )}
              </Link>
            )
          })}

          {/* Settings link - separated at the bottom of nav */}
          <div className="mt-auto">
            <Link
              href="/configuracoes"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === "/configuracoes"
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Settings className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Configuracoes</span>}
            </Link>
          </div>
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/50">
              {personNames.eu} & {personNames.parceiro}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">FinCasal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-secondary p-0.5">
              <button
                onClick={() => canUseCoupleMode && setViewMode("casal")}
                disabled={!canUseCoupleMode}
                className={cn(
                  "text-xs py-1 px-2.5 rounded-md transition-all font-medium inline-flex items-center gap-1",
                  viewMode === "casal"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                  !canUseCoupleMode && "opacity-60 cursor-not-allowed"
                )}
              >
                {!canUseCoupleMode && <Lock className="w-3 h-3" />}
                Casal
              </button>
              <button
                onClick={() => setViewMode("individual")}
                className={cn(
                  "text-xs py-1 px-2.5 rounded-md transition-all font-medium",
                  viewMode === "individual"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                Individual
              </button>
            </div>
            <Link href="/configuracoes">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Settings className="w-5 h-5" />
                <span className="sr-only">Configuracoes</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30">
          <div className="flex items-center justify-around h-16 px-1">
            {mobileNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-0.5 py-1 px-2 min-w-0"
                >
                  <div
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
                      isActive ? "bg-primary/10" : ""
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors truncate",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
