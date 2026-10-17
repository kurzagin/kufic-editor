import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Khattat: Geometric Kufic Design Tool",
    short_name: "Khattat",
    description:
      "A purpose-built grid-based editor for geometric Kufic typography.",
    start_url: "/",
    display: "standalone",
    background_color: "#F3EFE7",
    theme_color: "#18355B",
    icons: [
      {
        src: "/logo.svg",
        sizes: "672x320",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
