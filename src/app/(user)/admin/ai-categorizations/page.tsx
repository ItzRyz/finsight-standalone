import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

export default async function AiCategorizationAdminPage() {
  await requireAdmin();
  const items = await prisma.aiCategorization.findMany({
    take: 100,
    include: { user: { select: { email: true } }, category: { select: { name: true, icon: true } }, expense: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Categorizations</h1>
        <p className="text-sm text-muted-foreground">Last 100 • {items.length} rows</p>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>
              <th className="p-3">Expense</th>
              <th className="p-3">Category</th>
              <th className="p-3">Confidence</th>
              <th className="p-3">Status</th>
              <th className="p-3">User</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b last:border-0">
                <td className="p-3">{it.expense.title}</td>
                <td className="p-3">
                  {it.category?.icon} {it.category?.name ?? "—"} <span className="text-xs text-muted-foreground">({it.provider}:{it.model})</span>
                </td>
                <td className="p-3">{it.confidence != null ? Number(it.confidence).toFixed(4) : "—"}</td>
                <td className="p-3">
                  {it.status} {it.wasAccepted ? "✓ accepted" : ""} {it.wasCorrected ? "↻ corrected" : ""}
                </td>
                <td className="p-3 text-xs">{it.user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
