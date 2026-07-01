import {prismaClient } from "../application/database.js";

export const searchHistoryRepository = {

    // Simpan / update history saat user klik anime
    async upsert({ userId, keyword, animeId, title, poster, type }) {
        return prismaClient.searchHistory.upsert({
            where: {
                userId_animeId: { userId, animeId } // pakai @@unique
            },
            update: {
                keyword,   
                createdAt: new Date()
            },
            create: {
                userId,
                keyword,
                animeId,
                title,
                poster,
                type
            }
        });
    },

    // Ambil history user — terbaru duluan
    async getByUser(userId, limit = 20) {
        return prismaClient.searchHistory.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: limit,
            select: {
                id: true,
                animeId: true,
                title: true,
                poster: true,
                type: true,
                keyword: true,
                createdAt: true
            }
        });
    },

    // Hapus satu item history
    async deleteOne(id, userId) {
        return prismaClient.searchHistory.deleteMany({
            where: { id, userId }// pastikan milik user sendiri
        });
    },

    // Hapus semua history user
    async deleteAll(userId) {
        return prismaClient.searchHistory.deleteMany({
            where: { userId }
        });
    }
};