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
  GraduationCap,
} from "lucide-react"

type NavChild = { name: string; href: string };

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Analytics",
    icon: TrendingUp,
    children: [
      { name: "Analytics Dashboard", href: "/admin/analytics" },
      { name: "Time Tracking", href: "/admin/analytics/time-tracking" },
      { name: "Activity Analytics", href: "/admin/analytics/activity" },
      { name: "Activity Timeline", href: "/admin/activity-timeline" },
      { name: "Activity List", href: "/admin/activity-list" },
    ] as NavChild[],
  },
  // {
  //   name: "Client Follow-ups",
  //   href: "/admin/client-follow-ups",
  //   icon: BarChart3,
  // },
  // {
  //   name: "Customer Success",
  //   href: "/admin/customer-success",
  //   icon: BarChart3,
  // },
  {
    name: "Clients",
    icon: Users,
    children: [
      { name: "All Clients", href: "/admin/clients" },
      { name: "Active Clients", href: "/admin/clients?status=active" },
      { name: "Pending Clients", href: "/admin/clients?status=pending" },
      { name: "Churned Clients", href: "/admin/clients?churned=true" },
      { name: "No Onboarding Call", href: "/admin/clients?no_onboarding_call=true" },
      { name: "Completed Clients", href: "/admin/clients?status=completed" },
      { name: "Vanessa Clients", href: "/admin/clients?implementation_manager=vanessa" },
      { name: "Vishal Clients", href: "/admin/clients?implementation_manager=vishal" },
      { name: "Add New Client", href: "/admin/clients/new" },
      { name: "Implementation Milestones", href: "/admin/clients/milestones" },
    ] as NavChild[],
  },
  {
    name: "Mobile App: White Label",
    href: "/admin/mobile-app-white-label",
    icon: Wrench,
  },
  // {
  //   name: "Project Management",
  //   href: "/admin/kanban",
  //   icon: Kanban,
  // },
  {
    name: "Feedback Board",
    href: "/admin/feedback-board",
    icon: Kanban,
  },
  {
    name: "Milestones",
    href: "/admin/milestones",
    icon: BarChart3,
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
    name: "University",
    href: "/admin/university",
    icon: GraduationCap,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["Clients", "Analytics"])

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-lg">
      <div className="flex h-16 items-center px-6 border-b border-gray-200 bg-white">
        <Building2 className="h-8 w-8 stroke-[1.5] text-brand-gold" />
        <span className="ml-2 text-xl font-bold" style={{color: '#060520'}}>Hubflo Admin</span>
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
                      "w-full justify-start px-3 py-2 text-left font-normal",
                      "hover:bg-brand-gold/10 hover:text-brand-gold",
                      "text-gray-700"
                    )}
                    onClick={() => toggleExpanded(item.name)}
                  >
                    <item.icon className="mr-3 h-4 w-4 stroke-[1.5] text-brand-gold" />
                    {item.name}
                    {isExpanded ? (
                      <ChevronDown className="ml-auto h-4 w-4 stroke-[1.5] text-gray-500" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4 stroke-[1.5] text-gray-500" />
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
                                ? "bg-brand-gold text-[#010124] font-semibold"
                                : "text-gray-600 hover:bg-brand-gold/10 hover:text-brand-gold",
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
                    ? "border-l-4 border-brand-gold bg-brand-gold/10 text-brand-gold font-semibold"
                    : "text-gray-700 hover:bg-brand-gold/10 hover:text-brand-gold",
                )}
                asChild
              >
                <Link href={item.href || "#"}>
                  <item.icon className="mr-3 h-4 w-4 stroke-[1.5] text-brand-gold" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-brand-gold flex items-center justify-center">
            <span className="text-sm font-medium text-[#010124]">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium" style={{color: '#060520'}}>Admin User</p>
            <p className="text-xs text-gray-500">admin@hubflo.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
