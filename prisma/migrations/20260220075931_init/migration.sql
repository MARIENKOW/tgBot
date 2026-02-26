-- CreateTable
CREATE TABLE "access" (
    "id" SERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "accessUntil" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "access_userId_key" ON "access"("userId");

-- CreateIndex
CREATE INDEX "access_accessUntil_idx" ON "access"("accessUntil");
