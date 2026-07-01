import { logger } from "../../application/logging.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";

export async function getGenreList() {
    return getOrSetCache(
        "genre-list",
        86400, 
        async () => {
            try {
                logger.info("[getGenreList] Fetching genre list");

                const genres = await samehadakuRepository.getGenreList();

                return genres.map(g => ({
                    title: g.title,
                    genreId: g.genreId
                }));

            } catch (error) {
                if (error.isAxiosError) {
                    logger.error("[getGenreList] Upstream error", {
                        status: error.response?.status,
                        data: error.response?.data
                    });
                }
                throw error;
            }
        }
    );
}