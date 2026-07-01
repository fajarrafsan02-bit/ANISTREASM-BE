import { prismaClient } from "../application/database.js";

export const wishlistRepository = {

    // Cek apakah anime sudah ada di wishlist user
    async findOne(userId, animeId) {
        return prismaClient.wishlist.findUnique({
            where: { userId_animeId: { userId, animeId } }
        });
    },

    // Tambah ke wishlist
    async add(userId, { animeId, title, poster }) {
        return prismaClient.wishlist.create({
            data: { userId, animeId, title, poster: poster ?? null }
        });
    },

    // Hapus dari wishlist
    async remove(userId, animeId) {
        return prismaClient.wishlist.deleteMany({
            where: { userId, animeId }
        });
    },

    // Ambil semua wishlist user
    async getByUser(userId, limit) {
        return prismaClient.wishlist.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: limit,
            select: {
                id: true,
                animeId: true,
                title: true,
                poster: true,
                createdAt: true
            }
        });
    },

    // Ambil hanya animeId — untuk cek bulk (FE bisa tau mana yang sudah di-wishlist)
    async getAnimeIdsByUser(userId) {
        const rows = await prismaClient.wishlist.findMany({
            where: { userId },
            select: { animeId: true }
        });
        return rows.map((r) => r.animeId);
    }
};