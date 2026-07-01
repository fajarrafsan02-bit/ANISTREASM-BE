// src/mappers/episodeDetailMapper.js
export function mapEpisodeDetail(episode, qualities) {
    return {
        // Info dasar
        title:      episode.title,
        animeId:    episode.animeId,
        poster:     episode.poster,
        releasedOn: episode.releasedOn,

        // URL default langsung dari samehadaku (embed fallback)
        defaultStreamingUrl: episode.defaultStreamingUrl ?? null,

        // Semua server tersedia — FE pakai ini untuk tampilkan pilihan
        servers: qualities
            .filter(q => q.serverList.length > 0)
            .map(q => ({
                resolution: q.title,
                serverList: q.serverList.map(s => ({
                    title:    s.title,
                    serverId: s.serverId
                }))
            })),

        // Navigasi episode
        hasPrevEpisode: episode.hasPrevEpisode,
        prevEpisode:    episode.prevEpisode ?? null,
        hasNextEpisode: episode.hasNextEpisode,
        nextEpisode:    episode.nextEpisode ?? null,

        // ✅ Download — FE render sebagai link, klik langsung redirect
        downloadFormats: episode.downloadUrl?.formats ?? [],

        // Sidebar
        recommendedEpisodes: episode.recommendedEpisodeList ?? [],
        movies:              episode.movie?.animeList ?? [],

        // Metadata
        synopsis: episode.synopsis?.paragraphs?.join('\n\n') ?? '',
        genres:   episode.genreList?.map(g => g.title) ?? []
    };
}