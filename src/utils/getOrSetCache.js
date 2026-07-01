// getOrSetCache.js
import { logger } from "../application/logging.js";
import redisClient from "../application/redisClient.js";

const pendingFetches = new Map();

export async function getOrSetCache(key, ttlInSeconds, fetchIn) {
    try {
        const cached = await redisClient.get(key);

        if (cached) {
            console.log(`[CACHE] HIT "${key}"`);
            return JSON.parse(cached);
        }

        console.log(`[CACHE] MISS "${key}"`);

        if (pendingFetches.has(key)) {
            console.log(`[CACHE] "${key}" already in-flight, reusing pending fetch`);
            return await pendingFetches.get(key);
        }

        const fetchPromise = (async () => {
            try {
                const data = await fetchIn();
                const payload = JSON.stringify(data);

                console.log(`[CACHE] Attempting SETEX "${key}" | payload length: ${payload.length}`);
                const setResult = await redisClient.setex(key, ttlInSeconds, payload);
                console.log(`[CACHE] SETEX "${key}" result: ${setResult}`);

                // TEMPORARY DEBUG — remove after diagnosing
                console.log(`[CACHE DEBUG] connection status: ${redisClient.status}`);
                console.log(`[CACHE DEBUG] connector options:`, {
                    host: redisClient.options.host,
                    port: redisClient.options.port,
                    db: redisClient.options.db
                });
                const dbsizeResult = await redisClient.dbsize();
                console.log(`[CACHE DEBUG] DBSIZE right after SETEX: ${dbsizeResult}`);
                const keysResult = await redisClient.keys('*');
                console.log(`[CACHE DEBUG] KEYS * right after SETEX:`, keysResult);
                // END TEMPORARY DEBUG

                return data;
            } finally {
                pendingFetches.delete(key);
            }
        })();

        pendingFetches.set(key, fetchPromise);

        return await fetchPromise;
    } catch (error) {
        console.log(`[CACHE] ERROR for "${key}": ${error.message}`);
        logger.error(`Cache operation failed for key "${key}":`, error);
        throw error;
    }
}