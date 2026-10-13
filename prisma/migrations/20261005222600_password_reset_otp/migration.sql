-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "otpHash" TEXT,
ADD COLUMN "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN "otpPurpose" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "otpPurpose" TEXT;
