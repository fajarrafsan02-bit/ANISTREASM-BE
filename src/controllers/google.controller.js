import { logger } from "../application/logging.js";
import googleService from "../services/google.service.js";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../utils/cookieHelper.js";

export async function googleLogin(req, res, next) {
    try {
        const result = await googleService.googleLoginService(req.body.token);
        logger.info(result);
        setAccessTokenCookie(res, result.accessToken);
        setRefreshTokenCookie(res, result.refreshToken);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

export default { googleLogin };