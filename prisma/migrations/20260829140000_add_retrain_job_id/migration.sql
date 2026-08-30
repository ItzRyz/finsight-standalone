-- AlterTable ai_categorizations add retrainJobId
ALTER TABLE "ai_categorizations" ADD COLUMN "retrainJobId" TEXT;
CREATE INDEX "ai_categorizations_retrainJobId_idx" ON "ai_categorizations"("retrainJobId");
