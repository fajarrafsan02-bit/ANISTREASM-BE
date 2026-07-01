/**
 * Normalisasi standar: lowercase, hapus simbol, pertahankan angka & spasi
 */
export const normalize = (title) => {
    if (!title) return "";
    return title
        .toLowerCase()
        .replace(/(\d)(st|nd|rd|th)/gi, "$1")   // "2nd" → "2"
        .replace(/[^\w\s]/g, " ")               // simbol → spasi
        .replace(/\s+/g, " ")
        .trim();
};

/**
 * Normalisasi longgar: hanya huruf (hapus angka, spasi, simbol)
 */
export const looseNormalize = (title) => {
    if (!title) return "";
    return title.toLowerCase().replace(/[^a-z]/g, "");
};

/**
 * Hitung similarity dengan Dice coefficient (lebih adil untuk length mismatch)
 */
export const calculateSimilarity = (str1, str2) => {
    const s1 = normalize(str1);
    const s2 = normalize(str2);

    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;

    // Angka juga dihitung (penting untuk "Season 2")
    const words1 = new Set(s1.split(" ").filter((w) => w.length > 0));
    const words2 = new Set(s2.split(" ").filter((w) => w.length > 0));

    if (words1.size === 0 || words2.size === 0) return 0.0;

    const intersection = [...words1].filter((w) => words2.has(w));
    
    // Dice coefficient: (2 * |A ∩ B|) / (|A| + |B|)
    // Lebih adil daripada max(|A|,|B|) untuk judul panjang vs pendek
    return (2 * intersection.length) / (words1.size + words2.size);
};

/**
 * Cek apakah query muncul sebagai whole-word di target
 */
export const isWholeWordMatch = (query, target) => {
    const q = normalize(query);
    const t = normalize(target);

    if (!q || !t || q.length < 4) return false;

    const regex = new RegExp(`(^|\\s)${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`);
    return regex.test(t);
};

/**
 * Cari match terbaik dari airingData untuk judul Samehadaku
 */
export const findBestMatch = (samehadakuTitle, airingData) => {
    if (!samehadakuTitle) return null;

    const normalizedSH = normalize(samehadakuTitle);
    const looseSH = looseNormalize(samehadakuTitle);
    const tokensSH = normalizedSH.split(" ").filter(w => w.length > 0);

    let bestMatch = null;
    let bestScore = 0;
    const SIMILARITY_THRESHOLD = 0.45; // Dice coefficient threshold

    for (const item of airingData) {
        const media = item.media;
        if (!media) continue;
        const titles = [
            media.title.romaji,
            media.title.english,
            ...(media.synonyms || [])
        ].filter(Boolean);

        for (const title of titles) {
            const normalizedAL = normalize(title);
            const looseAL = looseNormalize(title);
            const tokensAL = normalizedAL.split(" ").filter(w => w.length > 0);

            // 1. Exact match
            if (normalizedAL === normalizedSH) return item;
            if (looseSH.length >= 4 && looseAL === looseSH) return item;

            // ⬇️ BARU: 2. Substring containment
            // Samehadaku (pendek) ada di dalam Anilist (panjang)?
            if (normalizedSH.length >= 8 && normalizedAL.includes(normalizedSH)) return item;
            // Atau sebaliknya
            if (normalizedAL.length >= 8 && normalizedSH.includes(normalizedAL)) return item;

            // 3. Whole-word match
            if (isWholeWordMatch(samehadakuTitle, title)) return item;
            if (isWholeWordMatch(title, samehadakuTitle)) return item;

            // ⬇️ BARU: 4. Token containment (>70% kata Samehadaku ada di Anilist)
            // Contoh: 8 dari 9 kata "Higeki no Genkyou to Naru Saikyou Season 2" 
            //         ditemukan di judul Anilist panjang → match!
            if (tokensSH.length >= 3 && tokensAL.length > 0) {
                const matchedTokens = tokensSH.filter(t => tokensAL.includes(t));
                const tokenRatio = matchedTokens.length / tokensSH.length;
                if (tokenRatio >= 0.7) return item;
            }

            // 5. Similarity score dengan Dice coefficient (fallback)
            const score = calculateSimilarity(samehadakuTitle, title);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        }
    }

    return bestScore >= SIMILARITY_THRESHOLD ? bestMatch : null;
};