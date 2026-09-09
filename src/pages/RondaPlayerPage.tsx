import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit3, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mosaicsApi } from "../api/mosaics";
import { rondasApi } from "../api/rondas";
import { useAuth } from "../auth/useAuth";
import { MosaicGrid } from "../components/MosaicGrid";
import { apiMessage } from "../hooks/useApiError";

export function RondaPlayerPage() {
  const { id } = useParams();
  const { can } = useAuth();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const ronda = useQuery({
    queryKey: ["ronda", id, "play"],
    queryFn: () => rondasApi.get(Number(id)),
    enabled: Boolean(id),
  });

  useEffect(() => {
    setIndex(0);
  }, [id]);

  const total = ronda.data?.mosaics.length ?? 0;
  useEffect(() => {
    if (paused || total < 2 || !ronda.data) return;
    const timer = setTimeout(() => {
      setIndex((current) => (current + 1) % total);
    }, ronda.data.interval_seconds * 1000);
    return () => clearTimeout(timer);
  }, [paused, ronda.data, total, index]);

  const currentRef = ronda.data?.mosaics[index];
  const mosaic = useQuery({
    queryKey: ["mosaic", currentRef?.mosaic_id, "view"],
    queryFn: () => mosaicsApi.view(currentRef?.mosaic_id ?? 0),
    enabled: Boolean(currentRef),
    refetchInterval: 15_000,
  });

  if (ronda.isError)
    return (
      <div className="alert error" role="alert">
        {apiMessage(ronda.error)}
      </div>
    );
  if (!ronda.data)
    return (
      <div className="empty" aria-live="polite">
        Carregando ronda…
      </div>
    );

  return (
    <div className="mosaic-station">
      <header className="page-heading mosaic-heading">
        <div>
          <Link className="back-link" to="/rondas">
            <ArrowLeft size={16} aria-hidden="true" />
            Rondas
          </Link>
          <h1>{ronda.data.name}</h1>
          <p>
            {currentRef ? `${index + 1} de ${total} — ${currentRef.name}` : "Sem mosaicos na ronda"}
            {total > 1 ? ` · troca a cada ${ronda.data.interval_seconds}s` : ""}
          </p>
        </div>
        <div className="heading-actions">
          {total > 1 && (
            <button className="button ghost" onClick={() => setPaused((value) => !value)}>
              {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
              {paused ? "Retomar" : "Pausar"}
            </button>
          )}
          {can("mosaics.manage") && (
            <Link className="button" to={`/rondas/${ronda.data.id}/edit`}>
              <Edit3 size={16} aria-hidden="true" />
              Editar
            </Link>
          )}
        </div>
      </header>
      {mosaic.isError ? (
        <div className="alert error" role="alert">
          {apiMessage(mosaic.error)}
        </div>
      ) : mosaic.data ? (
        <MosaicGrid mosaic={mosaic.data} />
      ) : (
        <div className="empty" aria-live="polite">
          Carregando mosaico…
        </div>
      )}
    </div>
  );
}
