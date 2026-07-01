// src/services/anime/getEpisodeDetail.js
import { logger } from "../../application/logging.js";
import { samehadakuRepository } from "../../repositories/samehadakuRepository.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";
import { mapEpisodeDetail } from "../../mappers/mapEpisodeDetail.js";
import { ResponseError } from "../../error/response.error.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function getEpisodeDetail(episodeId) {
    return getOrSetCache(
        `episode-detail:${episodeId}`,
        1800,
        async () => {
            try {
                logger.info(`[getEpisodeDetail] Fetching episode: ${episodeId}`);

                const episode = await samehadakuRepository.getEpisodeDetail(episodeId);
                const qualities = episode.server?.qualities ?? [];

                return mapEpisodeDetail(episode, qualities);

            } catch (error) {
                if (error.isAxiosError) {
                    logger.error(`[getEpisodeDetail] Upstream error for "${episodeId}"`, {
                        status: error.response?.status,
                        data: error.response?.data
                    });
                }
                throw error;
            }
        }
    );
}


// ✅ Transform berbagai format URL → embed URL yang bisa di-iframe
function transformToEmbedUrl(url) {
    if (!url) return null;

    try {
        // ── Wibufile ──────────────────────────────────────────────────
        // api.wibufile.com/embed/xxx → wibufile.com/embed/xxx
        if (url.includes('wibufile.com')) {
            return url
                .replace('api.wibufile.com', 'wibufile.com')
                .replace('http://', 'https://');
        }

        // ── Filedon ───────────────────────────────────────────────────
        // filedon.co/view/xxx → filedon.co/embed/xxx
        if (url.includes('filedon.co')) {
            return url
                .replace('/view/', '/embed/')
                .replace('http://', 'https://');
        }

        // ── Pucuk / lainnya ───────────────────────────────────────────
        // Kembalikan apa adanya, FE yang handle apakah bisa di-embed
        return url;

    } catch (err) {
        logger.warn(`[transformToEmbedUrl] Gagal transform: ${url}`, err.message);
        return url;
    }
}

export async function getServerUrl(serverId) {
    return getOrSetCache(
        `server-url:${serverId}`,
        1800,
        async () => {
            try {
                logger.info(`[getServerUrl] Fetching server: ${serverId}`);
                await delay(500);

                const rawUrl = await samehadakuRepository.getServerUrl(serverId);

                if (!rawUrl) throw new ResponseError(404, "URL kosong dari upstream");

                // ✅ TAMBAHKAN VALIDASI INI:
                // Mengecek jika upstream mengembalikan objek error (seperti log data error Samehadaku Anda)
                if (
                    typeof rawUrl === 'object' &&
                    (rawUrl.error || rawUrl.message?.toLowerCase().includes('error'))
                ) {
                    console.log("Masuk");
                    throw new ResponseError(500, rawUrl.message || rawUrl.error || "Scraper upstream returned an error payload");
                }

                const url = transformToEmbedUrl(rawUrl);

                logger.info(`[getServerUrl] OK — raw: ${rawUrl} → embed: ${url}`);

                return { url, rawUrl };

            } catch (error) {
                logger.error(`[getServerUrl] Failed for serverId: ${serverId}`, {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                    upstreamUrl: error.config?.url
                });
                throw error;
            }
        }
    );
}