import jwt from "jsonwebtoken";
import redisClient from "../application/redisClient.js";
import { logger } from "../application/logging.js";

function parseExpiresIn(value) {
    if (!value) return 900;
    const match = value.match(/^(\d+)\s*(s|m|h|d)$/);
    if (!match) return 900;
    const num = parseInt(match[1]);
    const unit = match[2];
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return num * (multipliers[unit] || 60);
}

async function generateToken(user) {
    try {
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );

        await redisClient.set(
            `session:${user.id}:access`,
            token,
            "EX",
            parseExpiresIn(process.env.JWT_EXPIRES)
        );
        return token;
    } catch (error) {
        logger.error("Generate access token error:", error);
        throw error;
    }
}

async function generateRefreshToken(user) {
    try {
        const refreshToken = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_REFRESH }
        );

        await redisClient.set(
            `session:${user.id}:refresh`,
            refreshToken,
            "EX",
            parseExpiresIn(process.env.JWT_EXPIRES_REFRESH)
        );
        return refreshToken;
    } catch (error) {
        logger.error("Generate refresh token error:", error);
        throw error;
    }
}

export { generateToken, generateRefreshToken };