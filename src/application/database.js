import {PrismaClient} from "@prisma/client";
import { logger } from "./logging.js";

export const prismaClient = new PrismaClient({
    log: [
        {
            emit: "event",
            "level": "error"
        },
        {
            emit: "event",
            "level": "info"
        },
        {
            emit: "event",
            "level": "query"
        },
        {
            emit: "event",
            "level": "warn"
        }
    ]
});

prismaClient.$on("error", (e) => {
    logger.error("Prisma error", { message: e.message });
});
prismaClient.$on("info", (e) => {
    logger.info("Prisma info", { message: e.message });
});
prismaClient.$on("query", (e) => {
    logger.info("Prisma query", {
        query: e.query,
        params: e.params,
        duration: e.duration
    });
});
prismaClient.$on("warn", (e) => {
    logger.warn("Prisma warning", { message: e.message });
});

