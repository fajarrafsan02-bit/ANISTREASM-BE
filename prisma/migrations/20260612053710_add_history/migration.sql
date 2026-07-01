-- CreateTable
CREATE TABLE "search_histories" (
    "id" SERIAL NOT NULL,
    "keyword" VARCHAR(255) NOT NULL,
    "animeId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "poster" TEXT,
    "type" VARCHAR(50),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "search_histories_userId_idx" ON "search_histories"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "search_histories_userId_animeId_key" ON "search_histories"("userId", "animeId");

-- AddForeignKey
ALTER TABLE "search_histories" ADD CONSTRAINT "search_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
