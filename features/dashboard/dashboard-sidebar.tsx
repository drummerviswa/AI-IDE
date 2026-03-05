"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Code2,
  Compass,
  FolderPlus,
  History,
  Home,
  LayoutDashboard,
  Lightbulb,
  LucideIcon,
  Plus,
  Settings,
  Sparkles,
  Star,
  Terminal,
  Zap,
  Database,
  FlameIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Updated interface with type field
interface PlaygroundData {
  id: string
  name: string
  icon: string
  starred: boolean
  type?: "file" | "folder" // optional, defaults to file
}

// Icon map
const lucideIconMap: Record<string, LucideIcon> = {
  Zap,
  Lightbulb,
  Database,
  Compass,
  FlameIcon,
  Terminal,
  Code2,
}

function sortVSCodeStyle(items: PlaygroundData[]) {
  return items
    .map(i => ({ ...i, type: i.type ?? "file" }))
    .sort((a, b) => {
      // folders first
      if (a.type === "folder" && b.type === "file") return -1
      if (a.type === "file" && b.type === "folder") return 1

      // then alphabetical
      return a.name.localeCompare(b.name)
    })
}

export function DashboardSidebar({ initialPlaygroundData }: { initialPlaygroundData: PlaygroundData[] }) {
  const pathname = usePathname()

  // Pre-sorted lists
  const starredPlaygrounds = useMemo(
    () => sortVSCodeStyle(initialPlaygroundData.filter(p => p.starred)),
    [initialPlaygroundData]
  )

  const recentPlaygrounds = useMemo(
    () => sortVSCodeStyle(initialPlaygroundData),
    [initialPlaygroundData]
  )

  return (
    <Sidebar variant="inset" collapsible="icon" className="border border-r">
      <SidebarHeader>
        <div className="flex items-center justify-center gap-2 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="group-data-[collapsible=icon]:hidden text-sm font-semibold">ViswaCode Studio</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* MAIN NAV */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Home">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Dashboard">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* STARRED */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <Star className="h-4 w-4 mr-2" />
            Starred
          </SidebarGroupLabel>
          <SidebarGroupAction title="Add starred playground">
            <Plus className="h-4 w-4" />
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu>
              {starredPlaygrounds.length === 0 ? (
                <div className="text-center text-muted-foreground py-4 w-full">
                  No starred playgrounds
                </div>
              ) : (
                starredPlaygrounds.map(playground => {
                  const Icon = lucideIconMap[playground.icon] || Code2
                  return (
                    <SidebarMenuItem key={playground.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `/playground/${playground.id}`}
                        tooltip={playground.name}
                      >
                        <Link href={`/playground/${playground.id}`}>
                          <Icon className="h-4 w-4" />
                          <span>{playground.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* RECENT */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <History className="h-4 w-4 mr-2" />
            Recent
          </SidebarGroupLabel>
          <SidebarGroupAction title="Create new playground">
            <FolderPlus className="h-4 w-4" />
          </SidebarGroupAction>

          <SidebarGroupContent>
            <SidebarMenu>
              {recentPlaygrounds.map(playground => {
                const Icon = lucideIconMap[playground.icon] || Code2
                return (
                  <SidebarMenuItem key={playground.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/playground/${playground.id}`}
                      tooltip={playground.name}
                    >
                      <Link href={`/playground/${playground.id}`}>
                        <Icon className="h-4 w-4" />
                        <span>{playground.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="View all">
                  <Link href="/playgrounds">
                    <span className="text-sm text-muted-foreground">View all playgrounds</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
