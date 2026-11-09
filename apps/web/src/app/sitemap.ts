import type { MetadataRoute } from "next";

const baseUrl = "https://khattat.krzgn.xyz";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, changeFrequency: "monthly", priority: 1 },
    {
      url: `${baseUrl}/updates`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
