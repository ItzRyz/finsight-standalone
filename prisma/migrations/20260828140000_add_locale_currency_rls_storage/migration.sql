-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('id', 'en');
CREATE TYPE "Currency" AS ENUM ('IDR', 'USD', 'EUR', 'JPY', 'SGD');

-- AlterTable users: locale/currency
ALTER TABLE "users" ADD COLUMN "locale" "Locale" NOT NULL DEFAULT 'id';
ALTER TABLE "users" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'IDR';

-- AlterTable expenses/budgets: currency
ALTER TABLE "expenses" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'IDR';
ALTER TABLE "budgets" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'IDR';

-- Enable RLS (prisma bypass via service_role still works; anon via publishable is restricted)
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_categorizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "budgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "budget_alerts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

-- Users: own row
CREATE POLICY "users_select_own" ON "users" FOR SELECT USING (id = auth.uid()::text);
CREATE POLICY "users_update_own" ON "users" FOR UPDATE USING (id = auth.uid()::text) WITH CHECK (id = auth.uid()::text);

-- Categories: system public, custom owner
CREATE POLICY "categories_select" ON "categories" FOR SELECT USING (("userId" IS NULL AND "type" = 'SYSTEM') OR "userId" = auth.uid()::text);
CREATE POLICY "categories_insert_own" ON "categories" FOR INSERT WITH CHECK ("userId" = auth.uid()::text AND "type" = 'CUSTOM');
CREATE POLICY "categories_update_own" ON "categories" FOR UPDATE USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "categories_delete_own" ON "categories" FOR DELETE USING ("userId" = auth.uid()::text);

-- Expenses owner
CREATE POLICY "expenses_all_own" ON "expenses" FOR ALL USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- Ai categorizations owner
CREATE POLICY "ai_cat_all_own" ON "ai_categorizations" FOR ALL USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- Budgets owner
CREATE POLICY "budgets_all_own" ON "budgets" FOR ALL USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- Budget alerts owner
CREATE POLICY "budget_alerts_all_own" ON "budget_alerts" FOR ALL USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- Notifications owner
CREATE POLICY "notifications_all_own" ON "notifications" FOR ALL USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- Storage buckets (if storage schema exists — ignore if not on test DB)
-- Supabase buckets are created via storage API; for local test DB this is no-op. Real Supabase project: create via dashboard or SQL below if storage schema present.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('receipts','receipts', true) ON CONFLICT (id) DO NOTHING;
    INSERT INTO storage.buckets (id, name, public) VALUES ('avatars','avatars', true) ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Storage policies (only if storage schema exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    -- receipts public read
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'receipts public read') THEN
      CREATE POLICY "receipts public read" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'receipts owner write') THEN
      CREATE POLICY "receipts owner write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'receipts owner delete') THEN
      CREATE POLICY "receipts owner delete" ON storage.objects FOR DELETE USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'avatars public read') THEN
      CREATE POLICY "avatars public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'avatars owner write') THEN
      CREATE POLICY "avatars owner write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
    END IF;
  END IF;
END $$;
