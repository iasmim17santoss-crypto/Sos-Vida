import { projectId, publicAnonKey } from "/utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-1db0c6b9`;

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
      ...(options?.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

// ── Animais ────────────────────────────────────────────────────
export const api = {
  animais: {
    list: () => req<{ data: any[] }>("/animais"),
    get: (id: string) => req<{ data: any }>(`/animais/${id}`),
    create: (body: any) => req<{ data: any }>("/animais", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) => req<{ data: any }>(`/animais/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => req<{ success: boolean }>(`/animais/${id}`, { method: "DELETE" }),
    uploadFoto: async (file: File): Promise<string> => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${BASE}/animais/upload-foto`, {
        method: "POST",
        headers: { Authorization: `Bearer ${publicAnonKey}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.url as string;
    },
  },

  adocoes: {
    list: () => req<{ data: any[] }>("/adocoes"),
    create: (body: any) => req<{ data: any }>("/adocoes", { method: "POST", body: JSON.stringify(body) }),
    setStatus: (id: string, status: string, observacao?: string) =>
      req<{ data: any }>(`/adocoes/${id}/status`, { method: "PUT", body: JSON.stringify({ status, observacao }) }),
  },

  abrigos: {
    list: () => req<{ data: any[] }>("/abrigos"),
    create: (body: any) => req<{ data: any }>("/abrigos", { method: "POST", body: JSON.stringify(body) }),
    setStatus: (id: string, status: string) =>
      req<{ data: any }>(`/abrigos/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  },

  voluntarios: {
    list: () => req<{ data: any[] }>("/voluntarios"),
    create: (body: any) => req<{ data: any }>("/voluntarios", { method: "POST", body: JSON.stringify(body) }),
    setStatus: (id: string, status: string) =>
      req<{ data: any }>(`/voluntarios/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  },

  resgates: {
    list: () => req<{ data: any[] }>("/resgates"),
    create: (body: any) => req<{ data: any }>("/resgates", { method: "POST", body: JSON.stringify(body) }),
    setStatus: (id: string, status: string) =>
      req<{ data: any }>(`/resgates/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  },

  denuncias: {
    list: () => req<{ data: any[] }>("/denuncias"),
    create: (body: any) => req<{ data: any }>("/denuncias", { method: "POST", body: JSON.stringify(body) }),
    setStatus: (id: string, status: string) =>
      req<{ data: any }>(`/denuncias/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  },

  doacoes: {
    list: () => req<{ data: any[] }>("/doacoes"),
    create: (body: any) => req<{ data: any }>("/doacoes", { method: "POST", body: JSON.stringify(body) }),
  },

  apadrinhamentos: {
    list: () => req<{ data: any[] }>("/apadrinhamentos"),
    create: (body: any) => req<{ data: any }>("/apadrinhamentos", { method: "POST", body: JSON.stringify(body) }),
  },

  stats: {
    get: () => req<any>("/stats"),
  },

  uploadDoc: async (file: File, folder: string): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const res = await fetch(`${BASE}/upload-doc`, {
      method: "POST",
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      body: form,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    return json.url as string;
  },
};
