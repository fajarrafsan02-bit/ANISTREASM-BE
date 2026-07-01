import { logger } from "../../application/logging.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";

export async function getOngoingAnimeList(page = 1, order = 'popular') {
    return getOrSetCache(
        `ongoing-anime-list:page-${page}:order-${order}`,
        1800, // 30 menit — ongoing lebih sering update
        async () => {
            try {
                logger.info(`[getOngoingAnimeList] Fetching page ${page} order ${order}`);

                const { animeList, pagination } = await samehadakuRepository.getOngoingAnimeList(page, order);

                return {
                    data: animeList.map(anime => ({
                        title:   anime.title,
                        poster:  anime.poster,
                        type:    anime.type,
                        score:   anime.score,
                        status:  anime.status,
                        animeId: anime.animeId,
                        genres:  anime.genreList?.map(g => g.title) ?? []
                    })),
                    pagination: {
                        currentPage: pagination.currentPage,
                        totalPages:  pagination.totalPages,
                        hasNextPage: pagination.hasNextPage,
                        hasPrevPage: pagination.hasPrevPage,
                        nextPage:    pagination.nextPage,
                        prevPage:    pagination.prevPage
                    }
                };

            } catch (error) {
                if (error.isAxiosError) {
                    logger.error("[getOngoingAnimeList] Upstream error", {
                        status: error.response?.status,
                        errors:   error.response?.data
                    });
                }
                throw error;
            }
        }
    );
}