"use client"
import {  DatabaseIcon, ClipboardListIcon, FileIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Define the items inside the component instead of receiving them as props
export function NavDocuments() {

  // Define the items here instead of receiving them as props
  const items = [
    {
      name: "Dados",
      url: "#",
      iconName: "database",
    },
    {
      name: "Relatórios",
      url: "#",
      iconName: "clipboard",
    },
  ]

  // Function to render the appropriate icon based on iconName
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "database":
        return <DatabaseIcon />
      case "clipboard":
        return <ClipboardListIcon />
      case "file":
        return <FileIcon />
      default:
        return <FileIcon />
    }
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                {renderIcon(item.iconName)}
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

