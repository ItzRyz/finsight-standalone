-- AlterTable
ALTER TABLE "budget_alerts" ADD COLUMN     "resolvedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "budget_alerts_resolvedAt_idx" ON "budget_alerts"("resolvedAt");
