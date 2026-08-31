"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { SettingsForm } from "./settings-form";

type Props = {
  name: string;
  email: string;
  locale: "id" | "en";
  currency: "IDR" | "USD" | "EUR" | "JPY" | "SGD";
  trigger?: React.ReactNode;
  asMenuItem?: boolean;
};

export function SettingsDialog({ name, email, locale, currency, trigger, asMenuItem = false }: Props) {
  const [open, setOpen] = useState(false);

  const content = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : asMenuItem ? (
          <SidebarMenuButton tooltip="Settings" onClick={() => setOpen(true)}>
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        ) : (
          <button className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
            <Settings className="size-4" /> Settings
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <SettingsForm name={name} email={email} locale={locale} currency={currency} />
      </DialogContent>
    </Dialog>
  );

  if (asMenuItem) {
    return <SidebarMenuItem>{content}</SidebarMenuItem>;
  }
  return content;
}
