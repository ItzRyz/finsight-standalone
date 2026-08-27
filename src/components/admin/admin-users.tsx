"use client";

import { useTransition } from "react";
import { setUserActive, setUserRole } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: Date;
  _count: { expenses: number };
};

export function AdminUsers({ users }: { users: User[] }) {
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<void>) => startTransition(() => void fn());

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">Users</caption>
        <thead className="border-b text-left text-muted-foreground">
          <tr>
            <th scope="col" className="p-3 font-medium">User</th>
            <th scope="col" className="p-3 font-medium">Expenses</th>
            <th scope="col" className="p-3 font-medium">Role</th>
            <th scope="col" className="p-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-0">
              <td className="p-3">
                <p className="font-medium">{user.name ?? "—"}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </td>
              <td className="p-3">{user._count.expenses}</td>
              <td className="p-3">
                <Select
                  disabled={pending}
                  value={user.role}
                  onValueChange={(value) => run(() => setUserRole(user.id, value as "USER" | "ADMIN"))}
                >
                  <SelectTrigger className="h-8 w-[110px]" aria-label={`Role for ${user.email}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="p-3">
                <Button
                  size="sm"
                  variant={user.isActive ? "outline" : "destructive"}
                  disabled={pending}
                  onClick={() => run(() => setUserActive(user.id, !user.isActive))}
                  aria-label={`${user.isActive ? "Deactivate" : "Activate"} ${user.email}`}
                >
                  {user.isActive ? "Deactivate" : "Activate"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
