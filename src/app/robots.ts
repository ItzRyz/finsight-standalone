import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/expenses", "/budgets", "/categories", "/notifications", "/settings", "/profile", "/admin", "/api/", "/auth/callback"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
