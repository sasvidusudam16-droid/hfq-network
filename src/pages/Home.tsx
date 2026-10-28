import Hero from "../components/hero/Hero";
import News from "../components/sections/News";
import GetRank from "../components/sections/GetRank";
import DiscordCard from "../components/DiscordCard";
export default function Home() {
  return (
    <>
      <Hero />
      <News />
      <GetRank />
      <DiscordCard />
    </>
  );
}