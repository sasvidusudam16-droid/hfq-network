import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const pageMetadata: Record<string, { title: string; description: string }> = {
  "/": {
    title: "HFQ Network | Minecraft Lifesteal SMP",
    description:
      "Join HFQ Network, a Minecraft Lifesteal SMP. Fight for hearts, explore ranks and events, vote for rewards, and meet the community on Discord.",
  },
  "/store": {
    title: "Minecraft Ranks & Store | HFQ Network",
    description:
      "Explore ranks, upgrades, crate keys, and shards in the HFQ Network Minecraft Lifesteal store.",
  },
  "/vote": {
    title: "Vote for HFQ Network | Minecraft Server Rewards",
    description:
      "Vote for HFQ Network on Minecraft server lists and support the Lifesteal SMP community.",
  },
  "/jobs": {
    title: "Join the Team | HFQ Network",
    description:
      "See team roles and application information for joining the HFQ Network Minecraft community team.",
  },
  "/aurex": {
    title: "Aurex Hosting Partner | HFQ Network",
    description:
      "Learn about Aurex, the official hosting partner of HFQ Network.",
  },
};

const origin = "https://hfqmc.xyz";

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = pageMetadata[pathname] ?? {
      title: "Page Not Found | HFQ Network",
      description: "The page you requested could not be found on HFQ Network.",
    };
    const canonicalPath = pageMetadata[pathname] ? pathname : "/";
    const canonicalUrl = `${origin}${canonicalPath}`;
    const isIndexable = Boolean(pageMetadata[pathname]);

    document.title = metadata.title;
    setMeta("name", "description", metadata.description);
    setMeta("name", "robots", isIndexable ? "index, follow" : "noindex, follow");
    setMeta("property", "og:title", metadata.title);
    setMeta("property", "og:description", metadata.description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("name", "twitter:title", metadata.title);
    setMeta("name", "twitter:description", metadata.description);
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
  }, [pathname]);

  return null;
}
