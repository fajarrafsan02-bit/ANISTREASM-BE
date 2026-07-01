import cloudinary from "../config/cloudinaryClient.js";
import { ResponseError } from "../error/response.error.js";
import { logger } from "../application/logging.js";

const ROOT_FOLDER = process.env.CLOUDINARY_ROOT_FOLDER || "anistream";

/**
 * Upload buffer gambar ke Cloudinary
 * @param {Buffer} buffer
 * @param {string} folder - "avatars" | "covers"
 * @param {string} userId
 * @returns {string} secure URL
 */
export async function uploadImage(buffer, folder, userId) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `${ROOT_FOLDER}/${folder}`,
                public_id: String(userId),
                overwrite: true,
                resource_type: "image",
                transformation: [
                    { quality: "auto", fetch_format: "auto" },
                    ...(folder === "avatars"
                        ? [{ width: 400, height: 400, crop: "fill", gravity: "face" }]
                        : [{ width: 1200, height: 400, crop: "fill" }]
                    )
                ]
            },
            (error, result) => {
                if (error) {
                    logger.error(`[storageService] Upload ${folder} gagal untuk userId ${userId}:`, error);
                    return reject(
                        new ResponseError(500, `Gagal mengupload ${folder === "avatars" ? "foto profil" : "foto sampul"}. Coba lagi.`)
                    );
                }
                resolve(result.secure_url);
            }
        );

        uploadStream.end(buffer);
    });
}

/**
 * Hapus gambar dari Cloudinary — tidak throw, hanya log
 * Delete gagal tidak boleh block operasi update profil
 */
export async function deleteImage(folder, userId) {
    try {
        const publicId = `${ROOT_FOLDER}/${folder}/${userId}`;
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (err) {
        logger.error(`[storageService] deleteImage ${folder} gagal untuk userId ${userId}:`, err.message);
    }
}