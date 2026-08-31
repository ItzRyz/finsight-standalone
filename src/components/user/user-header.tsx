"use client";

import { ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "../theme-toggle";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NotificationMenu } from "../notifications/notification-menu";

type AppHeaderProps = {
  title: string;
};

export function UserHeader({ title }: AppHeaderProps) {
  const parts = title.includes(" — ") ? title.split(" — ") : title.includes(" - ") ? title.split(" - ") : [title];
  const isHierarchical = parts.length > 1;
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background overflow-hidden">
      <div className="flex min-w-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 shrink-0" />

        <Separator orientation="vertical" className="mr-2 h-4 shrink-0" />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              FinSight
            </BreadcrumbItem>

            <BreadcrumbSeparator className="hidden md:block">
              <ChevronRight />
            </BreadcrumbSeparator>

            {isHierarchical ? (
              <>
                <BreadcrumbItem className="hidden sm:block">
                  <span className="text-muted-foreground">{parts[0]}</span>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block">
                  <ChevronRight />
                </BreadcrumbSeparator>
                <BreadcrumbItem className="min-w-0">
                  <BreadcrumbPage className="truncate max-w-[150px] sm:max-w-none">{parts.slice(1).join(" — ")}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate max-w-[150px] sm:max-w-none">{title}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex shrink-0 items-center gap-1 px-4">
        <NotificationMenu />

        <ThemeToggle />
      </div>
    </header>
  );
}
