import { useEffect } from "react";

export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://gadgetsalalah.com").replace(/\/$/, "");
export const DEFAULT_TITLE = "Gadget Salalah — Dhofar's #1 Tech Store";
export const DEFAULT_DESCRIPTION =
  "Shop smartphones, laptops, tablets and accessories from Gadget Salalah with fast delivery across Salalah and Dhofar, Oman.";

type SeoOptions = {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  image?: string | null;
  type?: "website" | "product";
  jsonLd?: Record<string, unknown> | null;
};

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>("link[rel='canonical']");
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  element.href = url;
}

function replaceJsonLd(jsonLd: Record<string, unknown> | null | undefined) {
  document.head.querySelectorAll("[data-seo-jsonld]").forEach((node) => node.remove());
  if (!jsonLd) return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.seoJsonld = "true";
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);
}

export function setSeo({ title, description, path = "/", noindex = false, image, type = "website", jsonLd }: SeoOptions) {
  const canonicalPath = path.split("?")[0] || "/";
  const canonicalUrl = `${SITE_URL}${canonicalPath === "/" ? "/" : canonicalPath.replace(/\/$/, "")}`;
  const imageUrl = image || `${SITE_URL}/opengraph.jpg`;

  document.title = title;
  setMeta("name", "description", description);
  setMeta("name", "robots", noindex ? "noindex, follow" : "index, follow");
  setMeta("property", "og:type", type);
  setMeta("property", "og:url", canonicalUrl);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:image", imageUrl);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", imageUrl);
  setCanonical(canonicalUrl);
  replaceJsonLd(jsonLd);
}

export function useSeo(options: SeoOptions) {
  useEffect(() => {
    setSeo(options);
  }, [
    options.title,
    options.description,
    options.path,
    options.noindex,
    options.image,
    options.type,
    options.jsonLd,
  ]);
}
