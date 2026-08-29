import { Copy, KeyRound, RotateCw } from "lucide-react";
import { useState } from "react";
import type { StreamCredentials } from "../types/api";
export function Credentials({
  credentials,
  onRotate,
  rotating,
}: {
  credentials: StreamCredentials;
  onRotate: () => void;
  rotating: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(credentials.rtmp_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="credentials">
      <p>
        <KeyRound size={16} />
        Configure o encoder com H.264 + AAC usando esta URL RTMP.
      </p>
      <div className="credential-value">
        <code>{credentials.rtmp_url}</code>
        <button className="icon-button" onClick={copy} title="Copiar URL RTMP">
          <Copy size={17} />
        </button>
      </div>
      <div className="modal-actions">
        <span className="copy-state">{copied ? "URL copiada" : ""}</span>
        <button className="button warning" onClick={onRotate} disabled={rotating}>
          <RotateCw size={16} />
          {rotating ? "Trocando..." : "Trocar chave"}
        </button>
      </div>
    </div>
  );
}
