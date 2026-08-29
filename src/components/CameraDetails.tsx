import { Copy, KeyRound, MapPin, Volume2 } from "lucide-react";
import { useState } from "react";
import type { Camera } from "../types/api";
import { CameraStatusBadge } from "./Status";

export function CameraDetails({ camera }: { camera: Camera }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(camera.rtmp_url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="details-panel">
      <div className="details-title">
        <div>
          <p className="eyebrow">CÂMERA #{camera.id}</p>
          <h3>{camera.name}</h3>
        </div>
        <CameraStatusBadge status={camera.status} />
      </div>
      <dl className="detail-grid">
        <div>
          <dt>
            <MapPin size={14} /> Localização
          </dt>
          <dd>{camera.location || "Não informada"}</dd>
        </div>
        <div>
          <dt>
            <Volume2 size={14} /> Áudio
          </dt>
          <dd>{camera.audio_enabled ? "Habilitado" : "Desativado"}</dd>
        </div>
        <div>
          <dt>PRÉ-ALARME</dt>
          <dd>{camera.pre_alarm_seconds} segundos</dd>
        </div>
        <div>
          <dt>PÓS-ALARME</dt>
          <dd>{camera.post_alarm_seconds} segundos</dd>
        </div>
      </dl>
      <p className="detail-note">
        <KeyRound size={15} /> URL RTMP fornecida pelo servidor; configure o encoder em H.264 + AAC.
      </p>
      <div className="credential-value">
        <code>{camera.rtmp_url}</code>
        <button className="icon-button" onClick={copy} aria-label="Copiar URL RTMP">
          <Copy size={17} />
        </button>
      </div>
      {copied && <span className="copy-state">URL copiada</span>}
    </div>
  );
}
