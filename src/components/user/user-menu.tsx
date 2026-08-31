"use client";

import { useState } from "react";
import { LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { signOut } from "@/actions/auth";
import { SettingsDialog } from "./settings-dialog";

type UserMenuProps = {
  name?: string | null;
  email?: string | null;
  locale?: "id" | "en" | null;
  currency?: "IDR" | "USD" | "EUR" | "JPY" | "SGD" | null;
};

export function UserMenu({ name, email, locale, currency }: UserMenuProps) {
  const [loading, setLoading] = useState(false);

  const displayName = name || email?.split("@")[0] || "User";

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleLogout() {
    try {
      setLoading(true);

      await signOut();
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" tooltip="Account">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>

                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} asChild>
              <SettingsDialog
                name={name ?? ""}
                email={email ?? ""}
                locale={locale ?? "id"}
                currency={currency ?? "IDR"}
                trigger={
                  <button className="flex w-full items-center gap-2 px-2 py-1.5 text-sm">
                    <Settings className="size-4" /> Settings
                  </button>
                }
              />
            </DropdownMenuItem>

            <DropdownMenuItem>
              <User className="size-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem disabled={loading} onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="size-4" />

              {loading ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
