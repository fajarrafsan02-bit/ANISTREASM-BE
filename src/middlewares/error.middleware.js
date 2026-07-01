import Joi from "joi";
import { ResponseError } from "../error/response.error.js";
import { logger } from "../application/logging.js";

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
    if (err instanceof ResponseError) {
        logger.info("MASUK ERROR ResponseError: ", err);
        return res.status(err.status).json({
            success: false,
            errors: err.message
        });

    } else if (err instanceof Joi.ValidationError) {
        return res.status(400).json({
            success: false,
            errors: err.message
        });

    } else if (err.isAxiosError) {
        const status = err.response?.status ?? 500;
        const message = err.response?.data?.message ?? err.message;

        logger.error("MASUK ERROR AxiosError: ", { status, message });

        return res.status(status).json({
            success: false,
            errors: message
        });

    } else if (err.code === 'ECONNREFUSED') {
        logger.error("MASUK ERROR ECONNREFUSED: ", err);
        return res.status(503).json({
            success: false,
            errors: "Service tidak tersedia, coba lagi nanti"
        });

    } else {
        logger.error("MASUK ERROR Unknown: ", err); // ✅ fix dari console()
        return res.status(500).json({
            success: false,
            errors: err.message ?? "Internal Server Error"
        });
    }
}

export { errorMiddleware };