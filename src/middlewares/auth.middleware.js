import jwt from "jsonwebtoken";
import redisClient from "../application/redisClient.js";


async function authMiddleware(req, res, next) {
    try {
        console.log("AUTH MIDDLEWARE TERPANGGIL");
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({
                success: false,
                errors: "Token not found"
            });
        }

        const decoded = await jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const session = await redisClient.get(
            `session:${decoded.id}:access`
        );

        if (!session || session !== token) {
            return res.status(401).json({
                success: false,
                errors: 'Session expired'
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            errors: "Unauthorized: " + error.message
        });
    }
}

export { authMiddleware };