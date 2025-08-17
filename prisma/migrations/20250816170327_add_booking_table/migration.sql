/*
  Warnings:

  - You are about to drop the column `created_by` on the `master_court_types` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `master_court_types` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `master_courts` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `master_courts` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `master_courts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `slug` on the `master_courts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `created_by` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."CreatedByType" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "public"."master_court_types" DROP COLUMN "created_by",
DROP COLUMN "updated_by";

-- AlterTable
ALTER TABLE "public"."master_courts" DROP COLUMN "created_by",
DROP COLUMN "updated_by",
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "public"."roles" ALTER COLUMN "name" SET DATA TYPE VARCHAR;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "created_by",
DROP COLUMN "updated_by";

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "created_by_type" "public"."CreatedByType" NOT NULL,
    "user_id" INTEGER NOT NULL,
    "court_id" INTEGER NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "booking_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "cancel_reason" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingDetail" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "name" VARCHAR(100),
    "total_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingHistory" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "status" "public"."BookingStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,

    CONSTRAINT "BookingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_uuid_key" ON "public"."Booking"("uuid");

-- CreateIndex
CREATE INDEX "Booking_uuid_booking_date_user_id_idx" ON "public"."Booking"("uuid", "booking_date", "user_id");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "public"."master_courts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingDetail" ADD CONSTRAINT "BookingDetail_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingHistory" ADD CONSTRAINT "BookingHistory_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
