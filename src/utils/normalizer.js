export function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ") // hapus !! dan simbol
        .replace(/\s+/g, " ")
        .trim();
}

export function shortenTitle(title) {
    return title
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .split(" ")
        .slice(0, 3) // ambil 3–4 kata pertama
        .join(" ");
}