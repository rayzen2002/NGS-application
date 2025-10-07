"use client"

import {
  LayoutDashboardIcon,
  ListIcon,
  BarChartIcon,
  FolderIcon,
  UsersIcon,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"


import Link from "next/link"

export function NavMain() {
  const items = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      iconName: "dashboard",
    },
    {
      title: "Métricas",
      url: "/admin/metrics",
      iconName: "list",
    },
    {
      title: "Fechamentos",
      url: "/admin/fechamentos",
      iconName: "chart",
    },
    {
      title: "Relatórios",
      url: "/admin/relatorios",
      iconName: "folder",
    },
    {
      title: "Dealers",
      url: "/admin/dealers",
      iconName: "users",
    },
       {
      title: "Vendedores",
      url: "/admin/sellers",
      iconName: "users",
    },
  ]

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "dashboard":
        return <LayoutDashboardIcon />
      case "list":
        return <ListIcon />
      case "chart":
        return <BarChartIcon />
      case "folder":
        return <FolderIcon />
      case "users":
        return <UsersIcon />
      default:
        return <LayoutDashboardIcon />
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url}>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <div className="flex items-center gap-2">
                    {renderIcon(item.iconName)}
                    <span>{item.title}</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}


