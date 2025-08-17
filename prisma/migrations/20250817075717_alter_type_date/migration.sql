/*
  Warnings:

  - Changed the type of `uuid` on the `bookings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "public"."bookings_uuid_key";

-- AlterTable
ALTER TABLE "public"."bookings" DROP COLUMN "uuid",
ADD COLUMN     "uuid" UUID NOT NULL,
ALTER COLUMN "booking_date" SET DATA TYPE DATE,
ALTER COLUMN "start_time" SET DATA TYPE TIME,
ALTER COLUMN "end_time" SET DATA TYPE TIME;

-- CreateIndex
CREATE INDEX "bookings_uuid_booking_date_user_id_idx" ON "public"."bookings"("uuid", "booking_date", "user_id");
