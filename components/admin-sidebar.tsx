"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  Settings,
  Puzzle,
  ChevronDown,
  ChevronRight,
  Building2,
  Wrench,
  Rocket,
  Kanban,
  BarChart3,
  TrendingUp,
} from "lucide-react"

type NavChild = { name: string; href: string };

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Client Follow-ups",
    href: "/admin/client-follow-ups",
    icon: BarChart3,
  },
  {
    name: "Clients",
    icon: Users,
    children: [
      { name: "All Clients", href: "/admin/clients" },
      { name: "Active Clients", href: "/admin/clients?status=active" },
      { name: "Completed Clients", href: "/admin/clients?status=completed" },
      { name: "Vanessa Clients", href: "/admin/clients?implementation_manager=vanessa" },
      { name: "Vishal Clients", href: "/admin/clients?implementation_manager=vishal" },
      { name: "Add New Client", href: "/admin/clients/new" },
    ] as NavChild[],
  },
  {
    name: "Mobile App: White Label",
    href: "/admin/mobile-app-white-label",
    icon: Wrench,
  },
  {
    name: "Project Management",
    href: "/admin/kanban",
    icon: Kanban,
  },
  {
    name: "Feedback Board",
    href: "/admin/feedback-board",
    icon: Kanban,
  },
  {
    name: "Features",
    href: "/admin/features",
    icon: Rocket,
  },
  {
    name: "Integrations",
    href: "/admin/integrations",
    icon: Puzzle,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["Clients"])

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-[#010124] via-[#0a0a2a] to-[#1a1a40] border-r border-[#F2C94C] shadow-xl backdrop-blur-md">
      <div className="flex h-16 items-center px-6 border-b border-[#F2C94C]">
        <Building2 className="h-8 w-8 stroke-[1.5] text-[#F2C94C]" />
        <span className="ml-2 text-xl font-bold text-white">Hubflo Admin</span>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isExpanded = expandedItems.includes(item.name)
            const hasChildren = item.children && item.children.length > 0

            if (hasChildren) {
              return (
                <div key={item.name}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start px-3 py-2 text-left font-normal text-white",
                      "hover:bg-[#F2C94C] hover:text-[#010124]",
                    )}
                    onClick={() => toggleExpanded(item.name)}
                  >
                    <item.icon className="mr-3 h-4 w-4 stroke-[1.5] text-[#F2C94C]" />
                    {item.name}
                    {isExpanded ? (
                      <ChevronDown className="ml-auto h-4 w-4 stroke-[1.5] text-[#F2C94C]" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4 stroke-[1.5] text-[#F2C94C]" />
                    )}
                  </Button>

                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child: NavChild) =>
                        child.href ? (
                          <Button
                            key={child.href}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start px-3 py-2 text-left font-normal text-sm",
                              pathname === child.href
                                ? "bg-[#F2C94C] text-[#010124]"
                                : "text-gray-300 hover:bg-[#F2C94C] hover:text-[#010124]",
                            )}
                            asChild
                          >
                            <Link href={child.href as string}>{child.name}</Link>
                          </Button>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start px-3 py-2 text-left font-normal",
                  pathname === item.href
                    ? "border-l-4 border-[#F2C94C] bg-transparent text-[#F2C94C]"
                    : "text-white hover:bg-[#F2C94C]/10 hover:text-[#F2C94C]",
                )}
                asChild
              >
                <Link href={item.href || "#"}>
                  <item.icon className="mr-3 h-4 w-4 stroke-[1.5] text-[#F2C94C]" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-[#F2C94C] p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-[#F2C94C] flex items-center justify-center">
            <span className="text-sm font-medium text-[#010124]">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-300">admin@hubflo.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
