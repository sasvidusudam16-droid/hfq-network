import { Copy, Check } from "lucide-react";
import { site } from "../../data/site";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

export default function ServerIPCopy() {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button onClick={() => copy(site.ip)} className="btn-solid">
      {copied ? <Check size={18} /> : <Copy size={18} />}
      {copied ? "IP Copied!" : site.ip}
    </button>
  );
}