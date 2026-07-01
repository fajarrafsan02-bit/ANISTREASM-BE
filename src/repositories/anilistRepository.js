import { AnilistApi } from "../application/axios.js";
import { logger } from "../application/logging.js";

const AIRING_SCHEDULE_QUERY = `
            query($page: Int, $perPage: Int) {
                Page(page: $page, perPage: $perPage) {
                    airingSchedules(
                        notYetAired: false,
                        sort: TIME_DESC
                    ) {
                        episode
                        media {
                            title {
                                romaji,
                                english
                            }
                            genres
                            averageScore
                            episodes
                            coverImage {
                                large
                            }
                            status
                            seasonYear
                            season
                            studios(isMain: true) {
                                nodes {
                                    name
                                }
                            }
                            description
                            duration
                        }
                    }
                }   
            }
        `;

const SEARCH_MEDIA_QUERY = `
    query ($search: String) {
        Media(search: $search, type: ANIME) {
            title { romaji, english }
            synonyms
            coverImage { extraLarge }
            bannerImage
        }
    }
`;

const COMPLETE_QUERY = `
query($search: String) {
  Page(perPage: 1) {
    media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
      title {
        romaji
        english
      }
      synonyms
      genres
      averageScore
      episodes
      coverImage {
        large
      }
      status
      seasonYear
      season
      studios(isMain: true) {
        nodes {
          name
        }
      }
      description(asHtml: false)
      duration
    }
  }
}
`;

const BANNER_QUERY = `
    query ($search: String) {
        Media(search: $search, type: ANIME) {
            title { romaji, english }
            synonyms
            coverImage { extraLarge }
            bannerImage
        }
    }
`;

const ANIME_DETAIL_QUERY = `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    id

    title {
      romaji
      english
      native
    }

    description(asHtml: false)

    coverImage {
      extraLarge
      large
      medium
    }

    bannerImage

    format
    status

    episodes
    duration

    season
    seasonYear

    source

    averageScore
    meanScore

    popularity
    favourites

    genres
    synonyms

    studios(isMain: true) {
      nodes {
        id
        name
      }
    }

    trailer {
      id
      site
      thumbnail
    }

    nextAiringEpisode {
      episode
      timeUntilAiring
    }

    rankings {
      rank
      type
      context
      year
      season
      allTime
    }

    tags {
      name
      rank
      isMediaSpoiler
    }

    streamingEpisodes {
      title
      thumbnail
      url
      site
    }

    relations {
      edges {
        relationType

        node {
          id

          title {
            romaji
            english
          }

          format

          status

          coverImage {
            medium
          }
        }
      }
    }

    characters(sort: ROLE) {
      edges {
        role

        node {
          id

          name {
            full
            native
          }

          image {
            large
          }
        }

        voiceActors(language: JAPANESE) {
          id

          name {
            full
            native
          }

          image {
            large
          }
        }
      }
    }

    recommendations(sort: RATING_DESC) {
      nodes {
        rating

        mediaRecommendation {
          id

          title {
            romaji
            english
          }

          coverImage {
            large
          }

          averageScore
        }
      }
    }
  }
}`;


export const anilistRepository = {
  async getAiringSchedules(page = 1, perPage = 100) {
    const response = await AnilistApi.post("/", {
      query: AIRING_SCHEDULE_QUERY,
      variables: { page, perPage }
    });
    return response.data.data.Page.airingSchedules;
  },

  async searchAnime(title) {
    const response = await AnilistApi.post("/", {
      query: SEARCH_MEDIA_QUERY,
      variables: { search: title }
    });
    return response.data?.data?.Media;
  },

  async getCompleteAnime(search) {
    const response = await AnilistApi.post("/", {
      query: COMPLETE_QUERY,
      variables: { search: search }
    });
    return response.data.data.Page.media;
  },

  async getHeroAnime(search) {
    const response = await AnilistApi.post("/", {
      query: BANNER_QUERY,
      variables: { search: search }
    });
    return response.data.data.Media;
  },



  async getAnimeBySearch(title) {
    const ANILIST_TIMEOUT = parseInt(process.env.ANILIST_TIMEOUT) || 3000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ANILIST_TIMEOUT);

    try {
      const response = await AnilistApi.post("/", {
        query: ANIME_DETAIL_QUERY,
        variables: { search: title }
      }, { signal: controller.signal });

      clearTimeout(timeoutId);
      return response.data.data.Media;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        logger.warn(`[AniList] Search timeout for "${title}"`);
        return null;
      }
      throw err;
    }
  }
};