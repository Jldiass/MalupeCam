import { useEffect, useRef, useState } from "react";
import { Radio, Volume2, VolumeX } from "lucide-react";
import type { Camera } from "../types/api";
import { CameraStatusBadge } from "./Status";

export function HlsPlayer({
  camera,
  compact = false,
  position,
}: {
  camera: Camera;
  compact?: boolean;
  position?: number;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const element = video.current;
    if (!element || camera.status === "offline") return;
    setError(false);
    setLoading(true);
    if (element.canPlayType("application/vnd.apple.mpegurl")) {
      element.src = camera.hls_url;
      return () => {
        element.removeAttribute("src");
        element.load();
      };
    }
    let disposed = false;
    let destroy: (() => void) | undefined;
    void import("hls.js")
      .then(({ default: Hls }) => {
        if (disposed) return;
        if (!Hls.isSupported()) {
          setError(true);
          return;
        }
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          // Without this, hls.js only avoids falling further behind the
          // live edge — it never recovers seconds already lost to network
          // jitter or a stalled segment. A slight speed-up (imperceptible
          // to the ear/eye) lets it catch back up instead of drifting.
          maxLiveSyncPlaybackRate: 1.5,
        });
        destroy = () => hls.destroy();
        hls.loadSource(camera.hls_url);
        hls.attachMedia(element);
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) setError(true);
        });
      })
      .catch(() => setError(true));
    return () => {
      disposed = true;
      destroy?.();
    };
  }, [camera.hls_url, camera.status]);
  return (
    <article className={`video-panel ${compact ? "video-compact" : ""}`}>
      <header>
        <div>
          <strong>{position ? `${position}. ${camera.name}` : camera.name}</strong>
          <small>{camera.location || "Local não informado"}</small>
        </div>
        <CameraStatusBadge status={camera.status} />
      </header>
      {camera.status === "offline" || error ? (
        <div className="video-offline">
          <Radio size={28} />
          <span>{error ? "Sinal indisponível" : "Câmera offline"}</span>
        </div>
      ) : (
        <>
          <video
            ref={video}
            className={loading ? "video-loading" : ""}
            muted={muted}
            autoPlay
            playsInline
            controls={false}
            aria-label={`Vídeo ao vivo: ${camera.name}`}
            onLoadedData={() => setLoading(false)}
          />
          {loading && <div className="video-skeleton" aria-hidden="true" />}
        </>
      )}
      {camera.status !== "offline" && !error && camera.audio_enabled && (
        <button
          className="video-audio"
          onClick={() => setMuted((value) => !value)}
          aria-label={muted ? `Ativar áudio de ${camera.name}` : `Desativar áudio de ${camera.name}`}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {muted ? "Ativar áudio" : "Silenciar"}
        </button>
      )}
    </article>
  );
}
