"use client"

import type * as React from "react"
import { SettingsIcon, HelpCircleIcon, SearchIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary(props: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  // Define the items here instead of receiving them as props
  const items = [
    {
      title: "Configurações",
      url: "#",
      iconName: "settings",
    },
  ]

  // Function to render the appropriate icon based on iconName
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "settings":
        return <SettingsIcon />
      case "help":
        return <HelpCircleIcon />
      case "search":
        return <SearchIcon />
      default:
        return <SettingsIcon />
    }
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  {renderIcon(item.iconName)}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

