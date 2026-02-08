-- CreateTable
CREATE TABLE "tilelayout" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "schema" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "is_editable" BOOLEAN NOT NULL DEFAULT true,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tilelayout_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tilelayout" ADD CONSTRAINT "tilelayout_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
