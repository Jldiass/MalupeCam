import { useMutation, useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { camerasApi } from "../api/cameras";
import { cameraStatusApi } from "../api/cameraStatus";
import { useAuth } from "../auth/useAuth";
import { apiMessage } from "../hooks/useApiError";
import type { CameraStatus } from "../types/api";

export function OverviewPage() {
  const { can } = useAuth();
  const canReport = can("reports.read");
  const [params, setParams] = useSearchParams();
  const cameraId = Number(params.get("camera") || 0);
  const status = (params.get("status") || "") as CameraStatus | "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const validRange = !from || !to || new Date(from) < new Date(to);
  const summary = useQuery({
    queryKey: ["camera-status", "summary"],
    queryFn: cameraStatusApi.summary,
    refetchInterval: 15_000,
  });
  const cameras = useQuery({
    queryKey: ["cameras"],
    queryFn: () => camerasApi.list(false),
    enabled: canReport && can("cameras.read"),
  });
  const report = useMutation({
    mutationFn: () => cameraStatusApi.report({ cameraId, status, from, to }),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "conectividade.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    },
  });
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  return (
    <>
      <header className="page-heading">
        <div>
          <p className="eyebrow">Conectividade</p>
          <h1>Visão geral</h1>
          <p>Estado atual dos canais.</p>
        </div>
      </header>
      <section className="signal-summary" aria-label="Resumo de conectividade">
        <article className="signal-count online">
          <span>Online</span>
          <strong>{summary.data?.online ?? "--"}</strong>
          <small>câmeras transmitindo</small>
        </article>
        <article className="signal-count unstable">
          <span>Instáveis</span>
          <strong>{summary.data?.unstable ?? "--"}</strong>
          <small>câmeras oscilando</small>
        </article>
        <article className="signal-count offline">
          <span>Offline</span>
          <strong>{summary.data?.offline ?? "--"}</strong>
          <small>câmeras sem sinal</small>
        </article>
      </section>
      {(summary.isError || report.isError) && (
        <div className="alert error" role="alert">
          {apiMessage(summary.error || report.error)}
        </div>
      )}
      {canReport && (
        <>
          <section className="section-head">
            <div>
              <h2>Relatório de conectividade</h2>
              <p>Gere um CSV com as mudanças de estado por câmera no período.</p>
            </div>
            <button
              className="button ghost"
              disabled={report.isPending || !validRange}
              onClick={() => report.mutate()}
            >
              <Download size={16} aria-hidden="true" />
              {report.isPending ? "Gerando…" : "Baixar CSV"}
            </button>
          </section>
          {!validRange && (
            <div className="alert error" role="alert">
              O início deve ser anterior ao fim.
            </div>
          )}
          <section className="filter-panel">
            <label>
              Câmera
              <select value={cameraId || ""} onChange={(e) => update("camera", e.target.value)}>
                <option value="">Todas</option>
                {cameras.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Estado
              <select value={status} onChange={(e) => update("status", e.target.value)}>
                <option value="">Todos</option>
                <option value="online">Online</option>
                <option value="unstable">Instável</option>
                <option value="offline">Offline</option>
              </select>
            </label>
            <label>
              Início
              <input type="datetime-local" value={from} onChange={(e) => update("from", e.target.value)} />
            </label>
            <label>
              Fim
              <input type="datetime-local" value={to} onChange={(e) => update("to", e.target.value)} />
            </label>
          </section>
        </>
      )}
    </>
  );
}
