import {defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react";
import {VitePWA} from "vite-plugin-pwa";
import {tmdbProxyPlugin} from "./server/tmdbProxyPlugin.js";

// https://vite.dev/config/
export default defineConfig(({mode}) => {
    const env = loadEnv(mode, ".", "");

    return {
        plugins: [
            react(),
            tmdbProxyPlugin(env.TMDB_API_KEY),
            VitePWA({
                registerType: "autoUpdate",
                includeAssets: ["favicon.ico", "poster-placeholder.svg", "icons/*.png"],
                manifest: {
                    id: "/",
                    name: "Movie Matcher",
                    short_name: "MovieMatcher",
                    description: "Scegli il film giusto insieme ai tuoi amici.",
                    lang: "it",
                    theme_color: "#1b1b2f",
                    background_color: "#1b1b2f",
                    display: "standalone",
                    orientation: "portrait-primary",
                    start_url: "/",
                    scope: "/",
                    categories: ["entertainment", "social"],
                    icons: [
                        {
                            src: "icons/icon-192.png",
                            sizes: "192x192",
                            type: "image/png",
                        },
                        {
                            src: "icons/icon-512.png",
                            sizes: "512x512",
                            type: "image/png",
                        },
                        {
                            src: "icons/icon-maskable-512.png",
                            sizes: "512x512",
                            type: "image/png",
                            purpose: "maskable",
                        },
                    ],
                },
                workbox: {
                    globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg}"],
                },
            }),
        ],
    };
});
