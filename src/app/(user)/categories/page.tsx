import { getCustomCategories } from "@/actions/categories";
import { CategoryManager } from "@/components/categories/category-manager";

export default async function CategoriesPage() {
  return <main className="flex flex-1 flex-col gap-6 p-6"><div><h1 className="text-2xl font-bold tracking-tight">Categories</h1><p className="text-sm text-muted-foreground">Create categories for your own transactions.</p></div><CategoryManager initialCategories={await getCustomCategories()} /></main>;
}
