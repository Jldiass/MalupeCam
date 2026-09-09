import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Play, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { rondasApi } from "../api/rondas";
import { useAuth } from "../auth/useAuth";
import { apiMessage } from "../hooks/useApiError";

export function RondasPage() {
  const { can } = useAuth();
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const canManage = can("mosaics.manage");
  const rondas = useQuery({
    queryKey: ["rondas", search, canManage],
    queryFn: () => rondasApi.list(search, canManage),
  });
  const remove = useMutation({
    mutationFn: rondasApi.remove,
    onSuccess: () => client.invalidateQueries({ queryKey: ["rondas"] }),
    onError: (e) => setNotice(apiMessage(e)),
  });
  const destroy = (id: number, name: string) => {
    if (window.confirm(`Excluir a ronda “${name}”?`)) remove.mutate(id);
  };
  return (
    <>
      <header className="page-heading">
        <div>
          <p className="eyebrow">Postos de vídeo</p>
          <h1>Rondas</h1>
          <p>Sequências de mosaicos exibidas automaticamente em loop.</p>
        </div>
        {canManage && (
          <Link className="button primary" to="/rondas/new">
            <Plus size={17} aria-hidden="true" />
            Criar ronda
          </Link>
        )}
      </header>
      {notice && (
        <div className="alert error" role="alert">
          {notice}
          <button aria-label="Fechar aviso" onClick={() => setNotice(null)}>
            ×
          </button>
        </div>
      )}
      <section className="toolbar">
        <label className="search">
          <Search size={17} aria-hidden="true" />
          <span className="visually-hidden">Buscar rondas</span>
          <input
            name="search"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ex.: Noturna…"
          />
        </label>
        <span>{rondas.data?.length ?? 0} rondas</span>
      </section>
      {rondas.isError ? (
        <div className="alert error" role="alert">
          {apiMessage(rondas.error)}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Mosaicos</th>
                <th>Intervalo</th>
                <th>Estado</th>
                <th>
                  <span className="visually-hidden">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rondas.data?.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                  </td>
                  <td className="numeric">{r.mosaics.length}</td>
                  <td className="numeric">{r.interval_seconds}s</td>
                  <td>
                    <span className={`status ${r.active ? "status-online" : "status-offline"}`}>
                      <i />
                      {r.active ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="actions">
                    <Link className="icon-button" to={`/rondas/${r.id}`} aria-label={`Iniciar ${r.name}`}>
                      <Play size={16} aria-hidden="true" />
                    </Link>
                    {canManage && (
                      <>
                        <Link
                          className="icon-button"
                          to={`/rondas/${r.id}/edit`}
                          aria-label={`Editar ${r.name}`}
                        >
                          <Edit3 size={16} aria-hidden="true" />
                        </Link>
                        <button
                          className="icon-button danger"
                          onClick={() => destroy(r.id, r.name)}
                          aria-label={`Excluir ${r.name}`}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {rondas.isSuccess && !rondas.data.length && (
                <tr>
                  <td colSpan={5} className="empty">
                    Nenhuma ronda encontrada. Crie uma sequência de mosaicos para iniciar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
