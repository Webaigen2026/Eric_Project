-- AlterTable
ALTER TABLE "Order" ADD COLUMN "pickedUpAt" TIMESTAMP(3);

-- Backfill existing picked-up orders so the 3-hour display window can apply
UPDATE "Order"
SET "pickedUpAt" = "updatedAt"
WHERE "status" = 'picked_up' AND "pickedUpAt" IS NULL;

-- CreateIndex
CREATE INDEX "Order_status_pickedUpAt_idx" ON "Order"("status", "pickedUpAt");
