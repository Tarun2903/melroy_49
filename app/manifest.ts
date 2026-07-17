import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "5-Day 1-on-1 AI Digital Product Challenge — Melroy",
    short_name: "AI Product Challenge",
    description:
      "A private 1-on-1 challenge where Melroy personally guides you from idea to a launched AI digital product in 5 days.",
    icons: [{ src: "/images/favicon.svg", sizes: "any", type: "image/svg+xml" }],
    theme_color: "#0B1020",
    background_color: "#0B1020",
    display: "standalone",
    start_url: "/",
  };
}
