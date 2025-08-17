/*
  Warnings:

  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookingDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookingHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_court_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingDetail" DROP CONSTRAINT "BookingDetail_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."BookingHistory" DROP CONSTRAINT "BookingHistory_booking_id_fkey";

-- DropTable
DROP TABLE "public"."Booking";

-- DropTable
DROP TABLE "public"."BookingDetail";

-- DropTable
DROP TABLE "public"."BookingHistory";

-- CreateTable
CREATE TABLE "public"."bookings" (
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

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."booking_details" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "name" VARCHAR(100),
    "total_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."booking_histories" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "status" "public"."BookingStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR,

    CONSTRAINT "booking_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_uuid_key" ON "public"."bookings"("uuid");

-- CreateIndex
CREATE INDEX "bookings_uuid_booking_date_user_id_idx" ON "public"."bookings"("uuid", "booking_date", "user_id");

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "public"."master_courts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_details" ADD CONSTRAINT "booking_details_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_histories" ADD CONSTRAINT "booking_histories_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
