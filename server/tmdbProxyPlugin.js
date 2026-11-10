import {proxyTmdbRequest, writeNodeResponse} from "./tmdbProxy.js";
import {createRateLimiter, guardRequest} from "./requestGuard.js";

function proxyMiddleware(apiKey) {
    const limiter = createRateLimiter();

    return async (request, response, next) => {
        if (!request.url?.startsWith("/api/tmdb/")) {
            next();
            return;
        }

        const blocked = guardRequest({
            headers: request.headers,
            remoteAddress: request.socket?.remoteAddress,
            limiter,
        });
        if (blocked) {
            writeNodeResponse(response, blocked);
            return;
        }

        try {
            const result = await proxyTmdbRequest({url: request.url, apiKey});
            writeNodeResponse(response, result);
        } catch {
            writeNodeResponse(response, {
                status: 500,
                body: {error: "proxy-failed"},
                headers: {"content-type": "application/json; charset=utf-8"},
            });
        }
    };
}

/**
 * Serves the TMDb proxy during `vite` and `vite preview`, mirroring the
 * Vercel function in `api/tmdb/[...path].js`.
 */
export function tmdbProxyPlugin(apiKey) {
    return {
        name: "flixsort-tmdb-proxy",
        configureServer(server) {
            server.middlewares.use(proxyMiddleware(apiKey));
        },
        configurePreviewServer(server) {
            server.middlewares.use(proxyMiddleware(apiKey));
        },
    };
}
