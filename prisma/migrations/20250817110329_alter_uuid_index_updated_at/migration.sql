/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `total_hour` to the `booking_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."booking_details" ADD COLUMN     "total_hour" INTEGER NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."bookings" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."master_court_types" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."master_courts" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_uuid_key" ON "public"."bookings"("uuid");
