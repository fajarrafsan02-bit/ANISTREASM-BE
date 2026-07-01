-- CreateTable
CREATE TABLE "watch_histories" (
    "id" SERIAL NOT NULL,
    "animeId" VARCHAR(255) NOT NULL,
    "episodeId" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "episodeTitle" VARCHAR(255),
    "poster" TEXT,
    "userId" INTEGER NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watch_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "watch_histories_userId_idx" ON "watch_histories"("userId");

-- CreateIndex
CREATE INDEX "watch_histories_watchedAt_idx" ON "watch_histories"("watchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "watch_histories_userId_episodeId_key" ON "watch_histories"("userId", "episodeId");

-- AddForeignKey
ALTER TABLE "watch_histories" ADD CONSTRAINT "watch_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
