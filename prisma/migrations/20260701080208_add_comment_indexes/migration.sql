-- DropIndex
DROP INDEX "comments_animeId_idx";

-- CreateIndex
CREATE INDEX "comment_likes_userId_idx" ON "comment_likes"("userId");

-- CreateIndex
CREATE INDEX "comments_animeId_parentId_createdAt_idx" ON "comments"("animeId", "parentId", "createdAt");
