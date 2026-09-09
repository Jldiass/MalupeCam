import { useEffect, useRef, useState } from "react";
import { Camera as CameraIcon, Maximize2, Minimize2, Radio, Volume2, VolumeX } from "lucide-react";
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
  const panel = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [captured, setCaptured] = useState(false);
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
  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === panel.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement === panel.current) void document.exitFullscreen();
    else void panel.current?.requestFullscreen();
  };
  const captureFrame = () => {
    const element = video.current;
    if (!element || !element.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = element.videoWidth;
    canvas.height = element.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(element, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      anchor.href = url;
      anchor.download = `${camera.name.trim().toLowerCase().replace(/\s+/g, "-")}-${stamp}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      setCaptured(true);
      setTimeout(() => setCaptured(false), 1500);
    }, "image/png");
  };
  const live = camera.status !== "offline" && !error;
  return (
    <article ref={panel} className={`video-panel ${compact ? "video-compact" : ""}`}>
      {!live ? (
        <div className="video-offline">
          <Radio size={28} aria-hidden="true" />
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
          {loading && (
            <div className="video-skeleton" aria-hidden="true">
              <span className="loader" />
            </div>
          )}
        </>
      )}
      <div className="video-overlay-top">
        <CameraStatusBadge status={camera.status} />
      </div>
      <div className="video-overlay-bottom">
        <span className="video-name">{position ? `${position}. ${camera.name}` : camera.name}</span>
        <div className="video-controls">
          {live && camera.audio_enabled && (
            <button
              className="video-icon-btn"
              onClick={() => setMuted((value) => !value)}
              aria-label={muted ? `Ativar áudio de ${camera.name}` : `Silenciar ${camera.name}`}
            >
              {muted ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
            </button>
          )}
          {live && (
            <button
              className={`video-icon-btn ${captured ? "video-icon-flash" : ""}`}
              onClick={captureFrame}
              aria-label={`Capturar imagem de ${camera.name}`}
            >
              <CameraIcon size={14} aria-hidden="true" />
            </button>
          )}
          <button
            className="video-icon-btn"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Sair da tela cheia" : `Tela cheia: ${camera.name}`}
          >
            {fullscreen ? (
              <Minimize2 size={14} aria-hidden="true" />
            ) : (
              <Maximize2 size={14} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
