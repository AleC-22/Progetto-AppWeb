import {proxyTmdbRequest, writeNodeResponse} from "./tmdbProxy.js";

function proxyMiddleware(apiKey) {
    return async (request, response, next) => {
        if (!request.url?.startsWith("/api/tmdb/")) {
            next();
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
        name: "movie-matcher-tmdb-proxy",
        configureServer(server) {
            server.middlewares.use(proxyMiddleware(apiKey));
        },
        configurePreviewServer(server) {
            server.middlewares.use(proxyMiddleware(apiKey));
        },
    };
}
