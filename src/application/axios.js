import axios from "axios";

const AXIOS_TIMEOUT = parseInt(process.env.AXIOS_TIMEOUT) || 15000;

const animeApi = axios.create({
    baseURL: process.env.ANIME_API_URL,
    timeout: AXIOS_TIMEOUT,
    headers: {
        "Content-Type": "application/json"
    }
});

const AnilistApi = axios.create({
    baseURL: process.env.ANILIST_API,
    timeout: AXIOS_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});

export { animeApi, AnilistApi };