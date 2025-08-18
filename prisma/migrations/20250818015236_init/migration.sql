-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."CreatedByType" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "jti" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "token_expired" TIMESTAMP(3) NOT NULL,
    "refresh_token_expired" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."master_court_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_court_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."master_courts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "court_type_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_courts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookings" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "created_by_type" "public"."CreatedByType" NOT NULL,
    "user_id" INTEGER NOT NULL,
    "court_id" INTEGER NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "booking_date" DATE NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "cancel_reason" VARCHAR,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."booking_details" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "name" VARCHAR(100),
    "total_price" DECIMAL(10,2) NOT NULL,
    "total_hour" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

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
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_jti_key" ON "public"."user_sessions"("jti");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_refresh_token_key" ON "public"."user_sessions"("token", "refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "master_court_types_name_key" ON "public"."master_court_types"("name");

-- CreateIndex
CREATE INDEX "bookings_uuid_booking_date_user_id_idx" ON "public"."bookings"("uuid", "booking_date", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_uuid_key" ON "public"."bookings"("uuid");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."master_courts" ADD CONSTRAINT "master_courts_court_type_id_fkey" FOREIGN KEY ("court_type_id") REFERENCES "public"."master_court_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_court_id_fkey" FOREIGN KEY ("court_id") REFERENCES "public"."master_courts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_details" ADD CONSTRAINT "booking_details_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."booking_histories" ADD CONSTRAINT "booking_histories_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
