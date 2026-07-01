import "dotenv/config";
import { logger } from "./application/logging.js";
import { web } from "./application/web.js";

const PORT = process.env.PORT;

web.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});







