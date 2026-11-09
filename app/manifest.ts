import type { MetadataRoute } from "next";

// Installable PWA: "Add to Home Screen" opens full-screen like a native app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Scam Shield — 가족 보이스피싱 방패",
    short_name: "Scam Shield",
    description: "Family-confirmed protection against voice phishing",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0f2a4a",
    lang: "ko",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
