import {proxyTmdbRequest, writeNodeResponse} from "../../server/tmdbProxy.js";
import {createRateLimiter, guardRequest} from "../../server/requestGuard.js";

const limiter = createRateLimiter();

export default async function handler(request, response) {
    const blocked = guardRequest({
        headers: request.headers,
        remoteAddress: request.socket?.remoteAddress,
        limiter,
    });
    if (blocked) {
        writeNodeResponse(response, blocked);
        return;
    }

    const result = await proxyTmdbRequest({
        url: request.url,
        apiKey: process.env.TMDB_API_KEY,
    });

    writeNodeResponse(response, result);
}
