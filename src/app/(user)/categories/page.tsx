import { getCustomCategories } from "@/actions/categories";
import { CategoryManager } from "@/components/categories/category-manager";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getCategoryBreakdown } from "@/lib/charts/aggregate";
import { CategoryDonut } from "@/components/charts/category-donut";
import { UserHeader } from "@/components/user/user-header";

export default async function CategoriesPage() {
  const [{ dbUser }, initialCategories] = await Promise.all([getCurrentUser(), getCustomCategories()]);
  const preferredCurrency = (dbUser.currency as "IDR" | "USD" | "EUR" | "JPY" | "SGD") ?? "IDR";
  const locale = (dbUser.locale as string) ?? "id";
  const categoryData = await getCategoryBreakdown(dbUser.id, preferredCurrency, "30d");
  return (
    <>
      <UserHeader title="Categories" />
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">Create categories for your own transactions.</p>
        </div>
        <section className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Spending allocation (30d)</h2>
          <p className="text-sm text-muted-foreground">Top categories in {preferredCurrency}.</p>
          <div className="mt-4">
            <CategoryDonut data={categoryData} currency={preferredCurrency} locale={locale} />
          </div>
        </section>
        <CategoryManager initialCategories={initialCategories} />
      </main>
    </>
  );
}
