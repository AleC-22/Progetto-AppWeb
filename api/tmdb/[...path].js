import {proxyTmdbRequest, writeNodeResponse} from "../../server/tmdbProxy.js";

export default async function handler(request, response) {
    const result = await proxyTmdbRequest({
        url: request.url,
        apiKey: process.env.TMDB_API_KEY,
    });

    writeNodeResponse(response, result);
}
