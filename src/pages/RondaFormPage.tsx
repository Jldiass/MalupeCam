import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mosaicsApi } from "../api/mosaics";
import { rondasApi } from "../api/rondas";
import { apiMessage } from "../hooks/useApiError";
import type { RondaInput } from "../types/api";

export function RondaFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [intervalSeconds, setIntervalSeconds] = useState(15);
  const [active, setActive] = useState(true);
  const [mosaicIds, setMosaicIds] = useState<number[]>([]);
  const [mosaicSearch, setMosaicSearch] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const existing = useQuery({
    queryKey: ["ronda", id],
    queryFn: () => rondasApi.get(Number(id)),
    enabled: Boolean(id),
  });
  const mosaics = useQuery({ queryKey: ["mosaics"], queryFn: () => mosaicsApi.list() });

  useEffect(() => {
    if (!existing.data || initialized) return;
    setName(existing.data.name);
    setIntervalSeconds(existing.data.interval_seconds);
    setActive(existing.data.active);
    setMosaicIds(
      [...existing.data.mosaics].sort((a, b) => a.position - b.position).map((item) => item.mosaic_id),
    );
    setInitialized(true);
  }, [existing.data, initialized]);

  const filteredMosaics = useMemo(
    () => mosaics.data?.filter((m) => m.name.toLowerCase().includes(mosaicSearch.toLowerCase())) ?? [],
    [mosaics.data, mosaicSearch],
  );

  const save = useMutation({
    mutationFn: (input: RondaInput) =>
      id ? rondasApi.update(Number(id), input) : rondasApi.create(input),
    onSuccess: (ronda) => navigate(`/rondas/${ronda.id}`),
    onError: (error) => setNotice(apiMessage(error)),
  });

  const move = (index: number, direction: -1 | 1) => {
    const next = [...mosaicIds];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setMosaicIds(next);
  };

  const validName = name.trim().length >= 2;
  const validInterval = intervalSeconds >= 3 && intervalSeconds <= 3600;
  const canSubmit = validName && validInterval && mosaicIds.length > 0 && !save.isPending;

  const submit = () =>
    save.mutate({
      name: name.trim(),
      interval_seconds: intervalSeconds,
      active,
      mosaics: mosaicIds.map((mosaic_id, index) => ({ mosaic_id, position: index + 1 })),
    });

  return (
    <>
      <header className="page-heading">
        <div>
          <Link className="back-link" to="/rondas">
            <ArrowLeft size={16} />
            Rondas
          </Link>
          <h1>{id ? "Editar ronda" : "Criar ronda"}</h1>
          <p>Escolha os mosaicos e o tempo de permanência de cada um antes de salvar.</p>
        </div>
      </header>
      {notice && (
        <div className="alert error" role="alert">
          {notice}
        </div>
      )}
      <section className="wizard-panel">
        <div className="basic-grid">
          <label className="field">
            Nome da ronda
            <input value={name} maxLength={120} onChange={(event) => setName(event.target.value)} required />
            <em>{name.length > 0 && !validName ? "Informe ao menos 2 caracteres" : ""}</em>
          </label>
          <label className="field">
            Permanência por mosaico (segundos)
            <input
              type="number"
              min={3}
              max={3600}
              value={intervalSeconds}
              onChange={(event) => setIntervalSeconds(Number(event.target.value))}
            />
            <span>Entre 3 e 3600 segundos.</span>
          </label>
          <label className="toggle">
            <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
            Ronda ativa
          </label>
        </div>
        <div className="selection-grid" style={{ marginTop: 22 }}>
          <section>
            <h2>Mosaicos disponíveis</h2>
            <label className="search">
              <Search size={16} />
              <input
                value={mosaicSearch}
                onChange={(event) => setMosaicSearch(event.target.value)}
                placeholder="Nome do mosaico…"
                aria-label="Buscar mosaicos"
              />
            </label>
            <div className="pick-list">
              {filteredMosaics.map((mosaic) => (
                <article key={mosaic.id}>
                  <div>
                    <strong>{mosaic.name}</strong>
                    <small>{mosaic.camera_count} câmeras</small>
                  </div>
                  <button
                    className="icon-button"
                    disabled={mosaicIds.includes(mosaic.id)}
                    onClick={() => setMosaicIds([...mosaicIds, mosaic.id])}
                    aria-label={`Adicionar ${mosaic.name}`}
                  >
                    <Plus size={18} />
                  </button>
                </article>
              ))}
              {mosaics.isSuccess && !filteredMosaics.length && (
                <div className="empty">Nenhum mosaico encontrado.</div>
              )}
            </div>
          </section>
          <section>
            <h2>
              Sequência da ronda <span>{mosaicIds.length}</span>
            </h2>
            <div className="pick-list selected">
              {mosaicIds.map((value, index) => {
                const mosaic = mosaics.data?.find((item) => item.id === value);
                return (
                  <article key={value}>
                    <b>{index + 1}</b>
                    <div>
                      <strong>{mosaic?.name ?? `Mosaico #${value}`}</strong>
                      <small>{intervalSeconds}s de permanência</small>
                    </div>
                    <button
                      className="icon-button"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      aria-label="Mover para cima"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      className="icon-button"
                      disabled={index === mosaicIds.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label="Mover para baixo"
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => setMosaicIds(mosaicIds.filter((item) => item !== value))}
                      aria-label={`Remover ${mosaic?.name ?? "mosaico"}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                );
              })}
              {!mosaicIds.length && <div className="empty">Adicione ao menos um mosaico.</div>}
            </div>
          </section>
        </div>
      </section>
      <footer className="wizard-actions">
        <Link className="button ghost" to="/rondas">
          Cancelar
        </Link>
        <button className="button primary" disabled={!canSubmit} onClick={submit}>
          {save.isPending ? "Salvando…" : id ? "Salvar alterações" : "Criar ronda"}
        </button>
      </footer>
    </>
  );
}
