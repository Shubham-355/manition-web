-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('PENDING', 'INVITED', 'UNSUBSCRIBED');

-- CreateTable
CREATE TABLE "WaitlistSignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'PENDING',
    "source" TEXT NOT NULL DEFAULT '/',
    "unsubscribeToken" TEXT NOT NULL,
    "welcomeEmailSentAt" TIMESTAMP(3),
    "invitedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaitlistSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistSignup_email_key" ON "WaitlistSignup"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistSignup_unsubscribeToken_key" ON "WaitlistSignup"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "WaitlistSignup_status_createdAt_idx" ON "WaitlistSignup"("status", "createdAt");
