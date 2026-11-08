-- AlterTable
ALTER TABLE "Order" ADD COLUMN "statusChangedAt" TIMESTAMP(3);

-- Backfill so 3-hour display windows work for existing rows
UPDATE "Order"
SET "statusChangedAt" = COALESCE("pickedUpAt", "updatedAt")
WHERE "status" IN ('picked_up', 'cancelled', 'expired', 'ready')
  AND "statusChangedAt" IS NULL;

UPDATE "Order"
SET "statusChangedAt" = "createdAt"
WHERE "statusChangedAt" IS NULL;

-- CreateIndex
CREATE INDEX "Order_status_statusChangedAt_idx" ON "Order"("status", "statusChangedAt");
