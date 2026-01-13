-- CreateTable
CREATE TABLE "stock_receivings" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cost_per_item" BIGINT NOT NULL,
    "total_cost" BIGINT NOT NULL,
    "notes" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_receivings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_receivings_received_at_idx" ON "stock_receivings"("received_at");

-- CreateIndex
CREATE INDEX "stock_receivings_product_id_idx" ON "stock_receivings"("product_id");

-- AddForeignKey
ALTER TABLE "stock_receivings" ADD CONSTRAINT "stock_receivings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
