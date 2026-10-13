ALTER TABLE "StoreSettings" ALTER COLUMN "storeName" SET DEFAULT 'Da-Liquorstore';

UPDATE "StoreSettings"
SET "storeName" = 'Da-Liquorstore'
WHERE "storeName" = 'Da liquor-store';
