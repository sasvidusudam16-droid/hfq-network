import type { LucideIcon } from "lucide-react";
import { ShieldCheck, Users, Video, Palette, Image } from "lucide-react";

export type Job = {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  open: boolean;
  desc: string;
  requirements: string[];
};

export const jobs: Job[] = [
  {
    id: "admin",
    title: "Admin",
    icon: ShieldCheck,
    color: "#ff2d46",
    open: true,
    desc: "Lead the staff team, handle serious reports and appeals, and help shape how HFQ runs day to day.",
    requirements: ["Previous admin experience", "Active daily", "Mature & fair decisions"],
  },
  {
    id: "staff",
    title: "Staff",
    icon: Users,
    color: "#38bdf8",
    open: true,
    desc: "Moderate chat, help new players, catch cheaters and keep the lifesteal battles fair for everyone.",
    requirements: ["14+ years old", "Good communication", "Know the server well"],
  },
  {
    id: "media",
    title: "Media Rank",
    icon: Video,
    color: "#a78bfa",
    open: true,
    desc: "Create YouTube, TikTok or stream content on HFQ and get an exclusive Media rank with perks.",
    requirements: ["Active channel", "Regular uploads on HFQ", "Content follows server rules"],
  },
  {
    id: "graphic",
    title: "Graphic Designer",
    icon: Palette,
    color: "#fbbf24",
    open: true,
    desc: "Design banners, logos, Discord art and promo graphics that give HFQ its look.",
    requirements: ["Portfolio of past work", "Photoshop / Figma / similar", "Can meet deadlines"],
  },
  {
    id: "thumbnail",
    title: "Thumbnail Maker",
    icon: Image,
    color: "#34d399",
    open: true,
    desc: "Make eye-catching thumbnails for HFQ videos, events and announcements.",
    requirements: ["Thumbnail portfolio", "Minecraft render skills", "Fast turnaround"],
  },
];
