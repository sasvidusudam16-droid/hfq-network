import { useEffect, useState } from "react";
import { Check, Clock, ExternalLink, Heart, Trophy, Vote as VoteIcon } from "lucide-react";

type Site = { id: string; name: string; host: string; url: string };

const SITES: Site[] = [
  { id: "minerank", name: "MineRank", host: "minerank.com", url: "https://www.minerank.com/hfq-lifesteal/vote#vote-now" },
  { id: "topminecraftservers", name: "Top Minecraft Servers", host: "topminecraftservers.org", url: "https://topminecraftservers.org/vote/44827" },
  { id: "minecraftbuzz", name: "Minecraft Buzz", host: "minecraft.buzz", url: "https://minecraft.buzz/vote/hfqlifesteal" },
  { id: "minecraftservers", name: "Minecraft Servers", host: "minecraftservers.org", url: "https://minecraftservers.org/vote/695017" },
  { id: "minecraftmp", name: "Minecraft MP", host: "minecraft-mp.com", url: "https://minecraft-mp.com/server/365714/vote/" },
  { id: "voxelrank", name: "VoxelRank", host: "voxelrank.com", url: "https://voxelrank.com/vote/14690-hfq-lifesteal" },
  { id: "topmcservers", name: "Top MC Servers", host: "top-mc-servers.net", url: "https://top-mc-servers.net/server/869#vote" },
];

const STORAGE_KEY = "hfq-votes";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

type VoteMap = Record<string, number>;

function loadVotes(): VoteMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VoteMap) : {};
  } catch {
    return {};
  }
}

function saveVotes(votes: VoteMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  } catch {
    /* storage unavailable: the page still works, it just won't remember */
  }
}

function timeLeft(ms: number) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${Math.max(m, 1)}m`;
}

export default function Vote() {
  const [votes, setVotes] = useState<VoteMap>({});
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setVotes(loadVotes());
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const remaining = (id: string) => {
    const at = votes[id];
    if (!at) return 0;
    return Math.max(0, at + COOLDOWN_MS - now);
  };

  const markVoted = (id: string) => {
    const next = { ...votes, [id]: Date.now() };
    setVotes(next);
    setNow(Date.now());
    saveVotes(next);
  };

  const done = SITES.filter((s) => remaining(s.id) > 0).length;
  const pct = Math.round((done / SITES.length) * 100);

  return (
    <section className="vote">
      <div className="vote-container">
        <header className="vote-head vote-in">
          <span className="vote-kicker">
            <span className="pixel-line" />
            VOTE FOR HFQ
            <span className="pixel-line" />
          </span>
          <h1 className="vote-title">
            Vote <span className="text-red">Daily</span>
          </h1>
          <p className="vote-sub">
            Every vote pushes HFQ Lifesteal higher on the server lists and helps new players find us. You can vote on
            each site once every 24 hours.
          </p>
        </header>

        <div className="vote-progress vote-in" style={{ ["--sr-d" as string]: ".08s" }}>
          <div className="vote-progress-top">
            <span>
              <Trophy size={18} /> Today's votes
            </span>
            <b>
              {done} / {SITES.length}
            </b>
          </div>
          <div className="vote-bar" role="progressbar" aria-valuemin={0} aria-valuemax={SITES.length} aria-valuenow={done}>
            <i style={{ width: `${pct}%` }} />
          </div>
          <p className="vote-progress-note">
            {done === SITES.length
              ? "All done for today. Thank you for supporting HFQ!"
              : "Open each site below, complete the vote, and your progress is saved on this device."}
          </p>
        </div>

        <ul className="vote-grid">
          {SITES.map((site, i) => {
            const left = remaining(site.id);
            const voted = left > 0;
            return (
              <li
                key={site.id}
                className={`vote-card vote-in${voted ? " is-voted" : ""}`}
                style={{ ["--sr-d" as string]: `${0.05 * i}s` }}
              >
                <div className="vote-card-top">
                  <span className="vote-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`vote-state ${voted ? "is-done" : "is-ready"}`}>
                    {voted ? (
                      <>
                        <Check size={14} /> Voted
                      </>
                    ) : (
                      "Ready"
                    )}
                  </span>
                </div>

                <h3 className="vote-name">{site.name}</h3>
                <p className="vote-host">{site.host}</p>

                <a
                  className={`mc-btn vote-btn${voted ? " mc-btn-dark" : ""}`}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markVoted(site.id)}
                >
                  <VoteIcon size={18} />
                  {voted ? "Vote again" : "Vote now"}
                  <ExternalLink size={16} />
                </a>

                {voted && (
                  <p className="vote-timer">
                    <Clock size={14} /> Next vote in {timeLeft(left)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <h2 className="vote-steps-title vote-in">How it works</h2>
        <div className="vote-steps">
          {[
            { n: "1", t: "Pick a site", d: "Press Vote now on any card. The voting page opens in a new tab." },
            { n: "2", t: "Enter your name", d: "Type your exact Minecraft username and finish the quick captcha." },
            { n: "3", t: "Repeat daily", d: "Each site resets every 24 hours. Vote on all seven to help HFQ the most." },
          ].map((s, i) => (
            <div key={s.n} className="vote-step vote-in" style={{ ["--sr-d" as string]: `${0.08 * i}s` }}>
              <span className="vote-step-n">{s.n}</span>
              <div>
                <h4>{s.t}</h4>
                <p>{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="vote-thanks vote-in">
          <Heart size={16} /> Thank you for keeping HFQ alive.
        </p>
      </div>
    </section>
  );
}