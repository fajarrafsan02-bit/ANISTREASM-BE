import { logger } from "../../application/logging.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";

export async function getRecentAnimeList(page = 1) {
    return getOrSetCache(
        `recent-anime-list:page-${page}`,
        300, // 5 menit — recent update sangat sering
        async () => {
            try {
                logger.info(`[getRecentAnimeList] Fetching page ${page}`);

                const { animeList, pagination } = await samehadakuRepository.getRecentAnimeList(page);

                return {
                    data: animeList.map(anime => ({
                        title: anime.title,
                        poster: anime.poster,
                        animeId: anime.animeId,
                        episodes: anime.episodes ?? null,
                        releasedOn: anime.releasedOn ?? null
                    })),
                    pagination: {
                        currentPage: pagination.currentPage,
                        totalPages: pagination.totalPages,
                        hasNextPage: pagination.hasNextPage,
                        hasPrevPage: pagination.hasPrevPage,
                        nextPage: pagination.nextPage,
                        prevPage: pagination.prevPage
                    }
                };

            } catch (error) {
                if (error.isAxiosError) {
                    logger.error("[getRecentAnimeList] Upstream error", {
                        status: error.response?.status,
                        data: error.response?.data
                    });
                }
                throw error;
            }
        }
    );
}