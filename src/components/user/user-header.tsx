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
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />

        <Separator orientation="vertical" className="mr-2 h-4" />

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              FinSight
            </BreadcrumbItem>

            <BreadcrumbSeparator className="hidden md:block">
              <ChevronRight />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-1 px-4">
        <NotificationMenu />

        <ThemeToggle />
      </div>
    </header>
  );
}
