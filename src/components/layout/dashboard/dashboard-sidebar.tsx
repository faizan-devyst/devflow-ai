"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "@/lib/auth-client"
import { markSigningOut } from "@/components/providers/auth-provider"
import {
  PiNotebook,
  PiUserPlus,
  PiUsersThree,
  PiGear,
  PiSignOut
} from "react-icons/pi"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { TeamSelect } from "@/components/shared/team-select"
import { ThemeToggle } from "@/components/layout/theme/theme-toggle"
import { useAppSelector } from "@/store/hooks"
import { AppRole, Role } from "@/types"

function UserAvatar({ initials }: { initials: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-primary-bg text-primary-text text-xs font-semibold flex items-center justify-center select-none cursor-pointer border border-canvas-border/50">
      {initials}
    </div>
  );
}

const baseNavItems = [
  {
    title: "Standups",
    url: "/dashboard/standup",
    icon: PiNotebook,
  },
  {
    title: "Onboarding",
    url: "/dashboard/onboarding",
    icon: PiUserPlus,
  },
]

const teamNavItem = {
  title: "Team",
  url: "/dashboard/team",
  icon: PiUsersThree,
}

const bottomNavItems = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: PiGear,
  },
]

export function DashboardSidebar() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const user = session?.user

  // The Team page is for people-management — visible to the Owner and Team Leads only.
  const { teams, currentTeamId } = useAppSelector((state) => state.teams)
  const currentTeam = teams.find((team) => team.id === currentTeamId) ?? null
  const canManageTeam =
    session?.user?.appRole === AppRole.OWNER || currentTeam?.role === Role.TEAM_LEAD
  const topNavItems = canManageTeam ? [...baseNavItems, teamNavItem] : baseNavItems

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  const handleSignOut = () => {
    markSigningOut()
    signOut({ fetchOptions: { onSuccess: () => router.push("/") } })
  }

  return (
    <Sidebar>
      <SidebarHeader className="h-12 flex items-center justify-center px-4 border-b border-canvas-border/50">
        <Link href="/dashboard" className="flex items-center gap-1">
          <span className="text-canvas-text-contrast font-semibold text-lg tracking-tight">
            DevFlow
          </span>
          <span className="text-primary-solid font-semibold text-lg tracking-tight">
            AI
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-2 pt-2 group-data-[collapsible=icon]:hidden">
          <TeamSelect />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {topNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className={cn(
                        "size-5 transition-colors",
                        pathname === item.url ? "text-primary-solid" : "text-canvas-text group-hover/menu-button:text-primary-solid"
                      )} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-canvas-border/50">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {bottomNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className={cn(
                        "size-5 transition-colors",
                        pathname === item.url ? "text-primary-solid" : "text-canvas-text group-hover/menu-button:text-primary-solid"
                      )} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip="Sign out" className="cursor-pointer">
                  <div className="flex items-center gap-3">
                    <PiSignOut className="size-5 text-canvas-text group-hover/menu-button:text-destructive transition-colors" />
                    <span className="font-medium">Sign out</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="flex items-center gap-3 px-4 border-t border-canvas-border/50 min-h-16">
          {isPending ? (
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          ) : (
            <UserAvatar initials={initials} />
          )}
          <div className="flex flex-col min-w-0 flex-1 gap-1.5">
            {isPending ? (
              <>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-canvas-text-contrast truncate leading-none">
                  {user?.name}
                </span>
                <span className="text-xs text-canvas-text truncate leading-none">
                  {user?.email}
                </span>
              </>
            )}
          </div>
          <ThemeToggle className="shrink-0" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
