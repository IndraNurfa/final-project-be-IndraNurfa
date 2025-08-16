-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "created_by" DROP NOT NULL,
ALTER COLUMN "created_by" SET DATA TYPE VARCHAR,
ALTER COLUMN "updated_by" DROP NOT NULL,
ALTER COLUMN "updated_by" SET DATA TYPE VARCHAR;

-- CreateTable
CREATE TABLE "public"."master_court_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_by" VARCHAR,

    CONSTRAINT "master_court_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."master_courts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "court_type_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,
    "updated_by" VARCHAR,

    CONSTRAINT "master_courts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_court_types_name_key" ON "public"."master_court_types"("name");

-- AddForeignKey
ALTER TABLE "public"."master_courts" ADD CONSTRAINT "master_courts_court_type_id_fkey" FOREIGN KEY ("court_type_id") REFERENCES "public"."master_court_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
