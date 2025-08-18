/*
  Warnings:

  - A unique constraint covering the columns `[booking_id]` on the table `booking_details` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "booking_details_booking_id_key" ON "public"."booking_details"("booking_id");
