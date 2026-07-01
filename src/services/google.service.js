import axios from "axios";
import { prismaClient } from "../application/database.js";
import { logger } from "../application/logging.js";
import { generateRefreshToken, generateToken } from "../utils/generate.token.js";

async function googleLoginService(token) {
    const { data: payload } = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${token}` } }
    );

    const googleId = payload.sub;
    const email = payload.email;
    const username = payload.name || email.split("@")[0];
    const avatar = payload.picture || null;
    logger.info(avatar);

    // 1. Cari user beserta profilnya jika sudah terdaftar
    let user = await prismaClient.user.findUnique({
        where: { email },
        include: {
            profil: true // Ambil relasi profil
        }
    });

    if (!user) {
        // 2. Jika user baru, buat user sekaligus buat profilnya (masukkan avatar dari Google)
        user = await prismaClient.user.create({
            data: {
                username,
                email,
                password: "",
                provider: "GOOGLE",
                googleId,
                profil: {
                    create: {
                        avatar: avatar, // Simpan foto profil dari Google ke tabel profil
                        bio: null,
                        cover: null
                    }
                }
            },
            include: {
                profil: true // Include profil agar langsung terisi ke dalam variabel user yang baru dibuat
            }
        });
    }

    const accessToken = await generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    // Antisipasi jika ada user lama yang belum memiliki profil di database
    const profilData = user.profil || {
        bio: null,
        avatar: null,
        cover: null
    };

    // 3. Kembalikan data user lengkap beserta profilnya
    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            provider: user.provider,
            profil: {
                bio: profilData.bio,
                avatar: profilData.avatar,
                cover: profilData.cover
            }
        },
        accessToken,
        refreshToken
    };
}

export default { googleLoginService };