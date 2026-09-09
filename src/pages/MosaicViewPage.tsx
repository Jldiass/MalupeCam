import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit3, Maximize2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { mosaicsApi } from "../api/mosaics";
import { useAuth } from "../auth/useAuth";
import { MosaicGrid } from "../components/MosaicGrid";
import { apiMessage } from "../hooks/useApiError";
export function MosaicViewPage() {
  const { id } = useParams();
  const { can } = useAuth();
  const mosaic = useQuery({
    queryKey: ["mosaic", id, "view"],
    queryFn: () => mosaicsApi.view(Number(id)),
    refetchInterval: 15_000,
    enabled: Boolean(id),
  });
  const enterFullscreen = () => void document.documentElement.requestFullscreen?.();
  if (mosaic.isError)
    return (
      <div className="alert error" role="alert">
        {apiMessage(mosaic.error)}
      </div>
    );
  if (!mosaic.data)
    return (
      <div className="empty" aria-live="polite">
        Carregando mosaico…
      </div>
    );
  const data = mosaic.data;
  return (
    <div className="mosaic-station">
      <header className="page-heading mosaic-heading">
        <div>
          <Link className="back-link" to="/mosaics">
            <ArrowLeft size={16} aria-hidden="true" />
            Mosaicos
          </Link>
          <h1>{data.name}</h1>
          <p>
            {data.camera_count} de {data.capacity} posições ocupadas
          </p>
        </div>
        <div className="heading-actions">
          <button className="button ghost" onClick={enterFullscreen}>
            <Maximize2 size={16} aria-hidden="true" />
            Tela cheia
          </button>
          {can("mosaics.manage") && (
            <Link className="button" to={`/mosaics/${data.id}/edit`}>
              <Edit3 size={16} aria-hidden="true" />
              Editar
            </Link>
          )}
        </div>
      </header>
      <MosaicGrid mosaic={data} />
    </div>
  );
}
