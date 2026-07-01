import { prismaClient } from "../application/database.js";

export const watchHistoryRepository = {
    // Simpan / update history saat user nonton episode
    async upsert({ userId, animeId, episodeId, title, episodeTitle, poster }) {
        return prismaClient.watchHistory.upsert({
            where: {
                userId_episodeId: { userId, episodeId }
            },
            update: {
                watchedAt: new Date()
            },
            create: {
                userId,
                animeId,
                episodeId,
                title,
                episodeTitle: episodeTitle ?? null,
                poster: poster ?? null
            }
        });
    },

    // Ambil history tontonan user — terbaru duluan
    async getByUser(userId, limit = 20) {
        return prismaClient.watchHistory.findMany({
            where: { userId },
            orderBy: { watchedAt: "desc" },
            take: limit,
            select: {
                id: true,
                animeId: true,
                episodeId: true,
                title: true,
                episodeTitle: true,
                poster: true,
                watchedAt: true
            }
        });
    },

    // Hapus satu item history
    async deleteOne(id, userId) {
        return prismaClient.watchHistory.deleteMany({
            where: { id, userId }
        });
    },

    // Hapus semua history user
    async deleteAll(userId) {
        return prismaClient.watchHistory.deleteMany({
            where: { userId }
        });
    }
};
