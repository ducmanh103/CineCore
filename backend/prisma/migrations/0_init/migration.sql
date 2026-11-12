-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'LOCKED', 'INACTIVE', 'DELETED');
CREATE TYPE "MovieStatus" AS ENUM ('NOW_SHOWING', 'COMING_SOON', 'ENDED');
CREATE TYPE "SeatType" AS ENUM ('STANDARD', 'VIP', 'COUPLE');
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'BOOKED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'VNPAY');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" "RoleName" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_hash" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "security_stamp" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movies" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "release_date" TIMESTAMP(3) NOT NULL,
    "age_rating" TEXT NOT NULL DEFAULT 'P',
    "director" TEXT,
    "cast" TEXT,
    "poster_url" TEXT,
    "banner_url" TEXT,
    "trailer_url" TEXT,
    "status" "MovieStatus" NOT NULL DEFAULT 'NOW_SHOWING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_genres" (
    "movie_id" INTEGER NOT NULL,
    "genre_id" INTEGER NOT NULL,
    CONSTRAINT "movie_genres_pkey" PRIMARY KEY ("movie_id","genre_id")
);

-- CreateTable
CREATE TABLE "theaters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "theaters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" SERIAL NOT NULL,
    "theater_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "screen_type" TEXT NOT NULL DEFAULT '2D Digital',
    "total_seats" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "seat_row" TEXT NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "seat_type" "SeatType" NOT NULL DEFAULT 'STANDARD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "showtimes" (
    "id" SERIAL NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "showtimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "showtime_id" INTEGER NOT NULL,
    "seat_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "payment_id" INTEGER,
    "booking_code" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "held_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "booking_code" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'VNPAY',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transaction_id" TEXT,
    "vnp_response_code" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "target_table" TEXT NOT NULL,
    "target_id" INTEGER,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_hash_key" ON "users"("email_hash");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE INDEX "users_role_id_idx" ON "users"("role_id");
CREATE UNIQUE INDEX "movies_slug_key" ON "movies"("slug");
CREATE INDEX "movies_status_idx" ON "movies"("status");
CREATE INDEX "movies_release_date_idx" ON "movies"("release_date");
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");
CREATE UNIQUE INDEX "genres_slug_key" ON "genres"("slug");
CREATE UNIQUE INDEX "theaters_slug_key" ON "theaters"("slug");
CREATE INDEX "theaters_city_idx" ON "theaters"("city");
CREATE INDEX "rooms_theater_id_idx" ON "rooms"("theater_id");
CREATE INDEX "seats_room_id_idx" ON "seats"("room_id");
CREATE UNIQUE INDEX "seats_room_id_seat_row_seat_number_key" ON "seats"("room_id", "seat_row", "seat_number");
CREATE INDEX "showtimes_movie_id_idx" ON "showtimes"("movie_id");
CREATE INDEX "showtimes_room_id_idx" ON "showtimes"("room_id");
CREATE INDEX "showtimes_start_time_idx" ON "showtimes"("start_time");
CREATE INDEX "tickets_showtime_id_idx" ON "tickets"("showtime_id");
CREATE INDEX "tickets_seat_id_idx" ON "tickets"("seat_id");
CREATE INDEX "tickets_user_id_idx" ON "tickets"("user_id");
CREATE INDEX "tickets_booking_code_idx" ON "tickets"("booking_code");
CREATE INDEX "tickets_status_idx" ON "tickets"("status");
CREATE UNIQUE INDEX "payments_booking_code_key" ON "payments"("booking_code");
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");
CREATE INDEX "payments_booking_code_idx" ON "payments"("booking_code");
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- Partial Unique Index (Chống trùng ghế thời gian thực Zero Overbooking)
CREATE UNIQUE INDEX "UQ_Ticket_Showtime_Seat" ON "tickets" ("showtime_id", "seat_id") WHERE "status" IN ('PENDING', 'BOOKED');

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_theater_id_fkey" FOREIGN KEY ("theater_id") REFERENCES "theaters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seats" ADD CONSTRAINT "seats_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "showtimes" ADD CONSTRAINT "showtimes_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "showtimes" ADD CONSTRAINT "showtimes_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_showtime_id_fkey" FOREIGN KEY ("showtime_id") REFERENCES "showtimes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

