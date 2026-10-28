import { useEffect, useState } from "react";

type Status = { online: boolean | null; players: number };

export function useServerStatus(ip: string, refreshMs = 60000) {
  const [status, setStatus] = useState<Status>({ online: null, players: 0 });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`https://api.mcsrvstat.us/3/${ip}`);
        const data = await res.json();
        if (alive) setStatus({ online: !!data.online, players: data.players?.online ?? 0 });
      } catch {
        if (alive) setStatus({ online: false, players: 0 });
      }
    };
    load();
    const id = setInterval(load, refreshMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [ip, refreshMs]);

  return status;
}