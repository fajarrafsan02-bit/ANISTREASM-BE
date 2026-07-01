import { prismaClient } from "../application/database.js";

// Field user yang di-include agar FE bisa tampilkan nama + avatar penulis komentar
const userSelect = {
    id: true,
    username: true,
    profil: { select: { avatar: true } }
};

// Tentukan orderBy berdasarkan parameter sort dari FE
function resolveOrderBy(sort) {
    switch (sort) {
        case "oldest":
            return { createdAt: "asc" };
        case "popular":
            return [{ likes: { _count: "desc" } }, { createdAt: "desc" }];
        case "newest":
        default:
            return { createdAt: "desc" };
    }
}

export const commentRepository = {

    // Ambil komentar UTAMA (parentId null) untuk sebuah anime, dgn sort + pagination
    // `extraForHasMore`: ambil take+1 untuk deteksi hasMore tanpa query count terpisah
    async getByAnime(animeId, { sort, skip, take, extraForHasMore = false }) {
        const actualTake = extraForHasMore ? take + 1 : take;
        return prismaClient.comment.findMany({
            where: { animeId, parentId: null },
            orderBy: resolveOrderBy(sort),
            skip,
            take: actualTake,
            include: {
                user: { select: userSelect },
                _count: { select: { replies: true, likes: true } }
            }
        });
    },

    // Total komentar utama untuk anime (dipakai untuk pagination "load more")
    async countByAnime(animeId) {
        return prismaClient.comment.count({
            where: { animeId, parentId: null }
        });
    },

    // Semua balasan dari satu komentar induk
    async getReplies(parentId) {
        return prismaClient.comment.findMany({
            where: { parentId },
            orderBy: { createdAt: "asc" },
            include: {
                user: { select: userSelect },
                _count: { select: { likes: true } }
            }
        });
    },

    async create({ userId, animeId, content, parentId }) {
        return prismaClient.comment.create({
            data: { userId, animeId, content, parentId: parentId ?? null },
            include: {
                user: { select: userSelect },
                _count: { select: { replies: true, likes: true } }
            }
        });
    },

    async findById(id) {
        return prismaClient.comment.findUnique({ where: { id } });
    },

    async update(id, content) {
        return prismaClient.comment.update({
            where: { id },
            data: { content },
            include: {
                user: { select: userSelect },
                _count: { select: { replies: true, likes: true } }
            }
        });
    },

    async remove(id) {
        // Balasan & like ikut terhapus otomatis via onDelete: Cascade
        return prismaClient.comment.delete({ where: { id } });
    },

    // Toggle like: kembalikan status akhir + jumlah like terkini
    async toggleLike(commentId, userId) {
        const existing = await prismaClient.commentLike.findUnique({
            where: { commentId_userId: { commentId, userId } }
        });

        if (existing) {
            await prismaClient.commentLike.delete({
                where: { commentId_userId: { commentId, userId } }
            });
        } else {
            await prismaClient.commentLike.create({
                data: { commentId, userId }
            });
        }

        const likeCount = await prismaClient.commentLike.count({
            where: { commentId }
        });

        return { liked: !existing, likeCount };
    },

    // Daftar commentId yang sudah di-like user pada satu anime
    // (mencakup komentar utama & balasannya) — untuk set state awal di FE
    async getLikedIds(userId, animeId) {
        const rows = await prismaClient.commentLike.findMany({
            where: {
                userId,
                comment: { animeId }
            },
            select: { commentId: true }
        });
        return rows.map((r) => r.commentId);
    }
};
