import { getBudgetAlerts } from "@/actions/budget-alerts";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { formatCurrency } from "@/lib/format/currency";
import { formatDateTime } from "@/lib/format/date";
import { UserHeader } from "@/components/user/user-header";
import { AlertsTimeline } from "@/components/charts/alerts-timeline";

export default async function BudgetAlertsPage({ searchParams }: { searchParams: Promise<{ type?: string; resolved?: string }> }) {
  const params = await searchParams;
  const type = params.type === "WARNING" || params.type === "EXCEEDED" ? (params.type as "WARNING" | "EXCEEDED") : undefined;
  const resolved = params.resolved === "active" || params.resolved === "resolved" ? (params.resolved as "active" | "resolved") : "all";
  const [alerts, { dbUser }] = await Promise.all([getBudgetAlerts({ type, resolved }), getCurrentUser()]);
  const locale = (dbUser.locale as string) ?? "id";

  const timeline = alerts
    .slice(0, 20)
    .reverse()
    .map((a) => ({ label: new Date(a.createdAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { month: "short", day: "numeric" }), percentage: Number(a.percentage) }));

  return (
    <>
      <UserHeader title="Budget Alerts" />
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget Alerts History</h1>
          <p className="text-sm text-muted-foreground">{alerts.length} alerts • type={type ?? "all"} resolved={resolved}</p>
        </div>
        {alerts.length > 1 && (
          <section className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold">Alert trend</h2>
            <p className="text-sm text-muted-foreground">% of budget used at alert time.</p>
            <div className="mt-4">
              <AlertsTimeline data={timeline} />
            </div>
          </section>
        )}
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="p-3">Budget</th>
                <th className="p-3">Type</th>
                <th className="p-3">Spent / Budget</th>
                <th className="p-3">%</th>
                <th className="p-3">Message</th>
                <th className="p-3">When</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No alerts yet — budgets under threshold.
                  </td>
                </tr>
              ) : (
                alerts.map((a) => {
                  const cur = (a.budget as unknown as { currency: string }).currency ?? "IDR";
                  return (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="p-3">
                        {a.budget.name ?? a.budget.category?.name ?? "Budget"} <span className="text-xs text-muted-foreground">{a.budget.category?.icon}</span>
                      </td>
                      <td className="p-3">
                        <span className={a.type === "EXCEEDED" ? "font-semibold text-destructive" : "font-medium text-amber-600"}>{a.type}</span>
                        {a.resolvedAt ? <span className="ml-2 text-xs text-muted-foreground">(resolved)</span> : <span className="ml-2 text-xs text-primary">active</span>}
                      </td>
                      <td className="p-3">
                        {formatCurrency(Number(a.spentAmount), cur as never, locale)} / {formatCurrency(Number(a.budgetAmount), cur as never, locale)}
                      </td>
                      <td className="p-3">{Number(a.percentage).toFixed(1)}%</td>
                      <td className="p-3 max-w-xs truncate">{a.message}</td>
                      <td className="p-3 text-xs text-muted-foreground">{formatDateTime(a.createdAt, locale)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
