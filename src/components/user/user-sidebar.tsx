/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import {
  Bell,
  ChartNoAxesCombined,
  LayoutDashboard,
  Receipt,
  Tags,
  WalletCards,
  ShieldCheck,
  Eye,
  History,
  Users,
  Bot,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { UserMenu } from "./user-menu";
import { SettingsDialog } from "./settings-dialog";

const mainNavigation = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Expenses", href: "/expenses", icon: Receipt },
  { title: "Budgets", href: "/budgets", icon: WalletCards },
  { title: "Categories", href: "/categories", icon: Tags },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Review", href: "/expenses/review", icon: Eye },
  { title: "Alerts", href: "/budgets/alerts", icon: History },
];

const adminNavigation = [
  { title: "Overview", href: "/admin", icon: ShieldCheck },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "System Categories", href: "/admin/categories", icon: Tags },
  { title: "All Expenses", href: "/admin/expenses", icon: Receipt },
  { title: "All Notifications", href: "/admin/notifications", icon: Bell },
  { title: "AI Categorizations", href: "/admin/ai-categorizations", icon: Bot },
];

type UserSidebarProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    locale?: "id" | "en" | null;
    currency?: "IDR" | "USD" | "EUR" | "JPY" | "SGD" | null;
  };
};

export function UserSidebar({ user }: UserSidebarProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const [adminOpen, setAdminOpen] = useState(isAdminRoute);

  useEffect(() => {
    if (isAdminRoute) setAdminOpen(true);
  }, [isAdminRoute]);

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Logo */}

      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="FinSight">
              <Link href="/dashboard">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ChartNoAxesCombined className="size-4" />
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">FinSight</span>

                  <span className="truncate text-xs text-muted-foreground">Financial command center</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main */}

        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <SettingsDialog
                name={user.name ?? ""}
                email={user.email ?? ""}
                locale={(user.locale as "id" | "en") ?? "id"}
                currency={(user.currency as "IDR" | "USD" | "EUR" | "JPY" | "SGD") ?? "IDR"}
                asMenuItem
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin — RBAC gated, transparent but easy to find, submenu child of /admin */}
        {user.role === "ADMIN" && (
          <SidebarGroup className="opacity-80 hover:opacity-100 transition-opacity">
            <SidebarGroupLabel className="flex items-center justify-between">
              <span>Admin</span>
              <button
                onClick={() => setAdminOpen((v) => !v)}
                className="rounded p-1 hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
                aria-label="Toggle admin menu"
              >
                <ChevronRight className={`size-3 transition-transform ${adminOpen ? "rotate-90" : ""}`} />
              </button>
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setAdminOpen((v) => !v)}
                    tooltip="Admin"
                    isActive={isAdminRoute}
                    className="justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck />
                      <span>Admin</span>
                    </span>
                    <ChevronRight className={`size-3 transition-transform group-data-[collapsible=icon]:hidden ${adminOpen ? "rotate-90" : ""}`} />
                  </SidebarMenuButton>
                  {adminOpen && (
                    <SidebarMenuSub>
                      {adminNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton asChild isActive={isActive}>
                              <Link href={item.href}>
                                <Icon />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* User */}

      <SidebarFooter>
        <UserMenu
          name={user.name}
          email={user.email}
          locale={(user.locale as "id" | "en") ?? "id"}
          currency={(user.currency as "IDR" | "USD" | "EUR" | "JPY" | "SGD") ?? "IDR"}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
