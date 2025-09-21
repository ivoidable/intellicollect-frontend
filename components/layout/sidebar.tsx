"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bot,
  Bell,
  Search,
  User,
  Inbox,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText, badge: null },
  { name: "Customers", href: "/dashboard/customers", icon: Users, badge: null },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, badge: null },
]

const bottomNavigation = [
  { name: "Sign Out", href: "/auth/logout", icon: LogOut },
]

interface SidebarProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

export default function Sidebar({ collapsed: controlledCollapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname()
  const [internalCollapsed, setInternalCollapsed] = useState(false)

  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed
  const handleCollapse = (value: boolean) => {
    if (onCollapse) {
      onCollapse(value)
    } else {
      setInternalCollapsed(value)
    }
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-gray-900 text-gray-300 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo and Company */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-white font-semibold">IntelliCollect</span>
                <span className="text-xs text-gray-400">Smart Collections</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCollapse(!collapsed)}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Separator className="bg-gray-800" />



      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
                collapsed && "justify-center"
              )}
            >
              <item.icon className={cn(
                "flex-shrink-0",
                collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"
              )} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      <Separator className="bg-gray-800" />

      {/* Bottom Navigation */}
      <div className="px-2 py-4 space-y-1">
        {bottomNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors",
              collapsed && "justify-center"
            )}
          >
            <item.icon className={cn(
              "flex-shrink-0",
              collapsed ? "h-5 w-5" : "h-5 w-5 mr-3"
            )} />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </div>

    </div>
  )
}