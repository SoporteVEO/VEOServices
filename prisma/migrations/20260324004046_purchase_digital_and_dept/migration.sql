-- AlterTable
ALTER TABLE "digital_billboards" ADD COLUMN     "department_id" INTEGER,
ADD COLUMN     "department_name" TEXT;

-- AlterTable
ALTER TABLE "purchase_items" ADD COLUMN     "digitalBillboardId" TEXT,
ADD COLUMN     "spotCount" INTEGER,
ALTER COLUMN "billboardId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "purchase_items_digitalBillboardId_from_to_idx" ON "purchase_items"("digitalBillboardId", "from", "to");

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_digitalBillboardId_fkey" FOREIGN KEY ("digitalBillboardId") REFERENCES "digital_billboards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
