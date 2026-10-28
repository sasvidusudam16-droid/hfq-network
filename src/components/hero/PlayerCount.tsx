import { site } from "../../data/site";
import { useServerStatus } from "../../hooks/useServerStatus";

export default function PlayerCount() {
  const { online, players } = useServerStatus(site.ip);

  const label =
    online === null ? "CHECKING SERVER..." : online ? `${players.toLocaleString()} PLAYERS ONLINE` : "SERVER OFFLINE";

  return (
    <div className="status-pill">
      <span className={`status-dot ${online ? "is-on" : online === false ? "is-off" : ""}`} />
      {label}
    </div>
  );
}