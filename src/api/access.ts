import type { Role, UserInput, UserRecord } from "../types/api";
import { request } from "./client";

export const accessApi = {
  users: () => request<UserRecord[]>("/users"),
  createUser: (input: UserInput) =>
    request<UserRecord>("/users", { method: "POST", body: JSON.stringify(input) }),
  updateUser: (id: number, input: Partial<UserInput>) =>
    request<UserRecord>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  removeUser: (id: number) => request<void>(`/users/${id}`, { method: "DELETE" }),
  roles: () => request<Role[]>("/roles"),
};
