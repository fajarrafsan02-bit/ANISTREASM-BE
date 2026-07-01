import cookieConfig from "../config/cookieConfig.js";

export function setAccessTokenCookie(res, token) {
    res.cookie("accessToken", token, cookieConfig.accessToken);
}

export function setRefreshTokenCookie(res, token) {
    res.cookie("refreshToken", token, cookieConfig.refreshToken);
}

export function clearTokenCookies(res) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
}