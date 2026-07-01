import { logger } from "../../application/logging.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";

export async function getPopularAnimeList(page = 1) {
    return getOrSetCache(
        `popular-anime-list:page-${page}`,
        3600,
        async () => {
            try {
                logger.info(`[getPopularAnimeList] Fetching page ${page}`);

                const { animeList, pagination } = await samehadakuRepository.getPopularAnimeList(page);

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
                        currentPage:  pagination.currentPage,
                        totalPages:   pagination.totalPages,
                        hasNextPage:  pagination.hasNextPage,
                        hasPrevPage:  pagination.hasPrevPage,
                        nextPage:     pagination.nextPage,
                        prevPage:     pagination.prevPage
                    }
                };

            } catch (error) {
                if (error.isAxiosError) {
                    logger.error("[getPopularAnimeList] Upstream error", {
                        status: error.response?.status,
                        data:   error.response?.data
                    });
                }
                throw error;
            }
        }
    );
}