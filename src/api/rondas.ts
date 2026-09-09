import type { Ronda, RondaInput } from "../types/api";
import { request } from "./client";

export const rondasApi = {
  list: (search = "", includeInactive = false) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (includeInactive) query.set("include_inactive", "true");
    const suffix = query.size ? `?${query.toString()}` : "";
    return request<Ronda[]>(`/rondas${suffix}`);
  },
  get: (id: number) => request<Ronda>(`/rondas/${id}`),
  create: (input: RondaInput) =>
    request<Ronda>("/rondas", { method: "POST", body: JSON.stringify(input) }),
  update: (id: number, input: Partial<RondaInput>) =>
    request<Ronda>(`/rondas/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  remove: (id: number) => request<void>(`/rondas/${id}`, { method: "DELETE" }),
};
