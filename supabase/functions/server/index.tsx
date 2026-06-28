import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();
app.use("*", logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

const PREFIX = "/make-server-1db0c6b9";

function supabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// getByPrefix returns values directly (JSONB), NOT {key,value} pairs.
// Values may be stored as objects (new) or as JSON strings (old). Handle both.
function parseItem(i: any): any | null {
  if (i === null || i === undefined) return null;
  if (typeof i === "string") {
    try { return JSON.parse(i); } catch { return null; }
  }
  return i; // already an object (JSONB)
}

function parseList(items: any[]): any[] {
  return items.map(parseItem).filter(Boolean)
    .sort((a: any, b: any) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
}

// ── STORAGE ──────────────────────────────────────────────────
async function ensureBuckets() {
  const sb = supabase();
  for (const name of ["make-1db0c6b9-docs", "make-1db0c6b9-animais"]) {
    const { data: list } = await sb.storage.listBuckets();
    if (!list?.some((b) => b.name === name)) {
      await sb.storage.createBucket(name, { public: false });
    }
  }
}
ensureBuckets().catch(console.error);

// ── HEALTH ────────────────────────────────────────────────────
app.get(`${PREFIX}/health`, (c) => c.json({ status: "ok" }));

// ══════════════════════════════════════════════════════════════
//  ANIMAIS
// ══════════════════════════════════════════════════════════════
app.get(`${PREFIX}/animais`, async (c) => {
  try {
    const items = await kv.getByPrefix("animal:");
    return c.json({ data: parseList(items) });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.get(`${PREFIX}/animais/:id`, async (c) => {
  try {
    const raw = await kv.get(`animal:${c.req.param("id")}`);
    if (!raw) return c.json({ error: "Não encontrado" }, 404);
    return c.json({ data: parseItem(raw) });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${PREFIX}/animais`, async (c) => {
  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    const record = { id, ...body, createdAt: new Date().toISOString() };
    await kv.set(`animal:${id}`, record); // store object directly — no JSON.stringify
    return c.json({ data: record }, 201);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.put(`${PREFIX}/animais/:id`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const raw = await kv.get(`animal:${id}`);
    if (!raw) return c.json({ error: "Não encontrado" }, 404);
    const existing = parseItem(raw) ?? {};
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kv.set(`animal:${id}`, updated);
    return c.json({ data: updated });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.delete(`${PREFIX}/animais/:id`, async (c) => {
  try {
    await kv.del(`animal:${c.req.param("id")}`);
    return c.json({ success: true });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${PREFIX}/animais/upload-foto`, async (c) => {
  try {
    const form = await c.req.formData();
    const file = form.get("file") as File;
    if (!file) return c.json({ error: "Nenhum arquivo" }, 400);
    const ext = file.name.split(".").pop();
    const path = `animais/${Date.now()}.${ext}`;
    const sb = supabase();
    const { error } = await sb.storage.from("make-1db0c6b9-animais").upload(path, file, { contentType: file.type });
    if (error) throw error;
    const { data: signed } = await sb.storage.from("make-1db0c6b9-animais").createSignedUrl(path, 60 * 60 * 24 * 365);
    return c.json({ url: signed?.signedUrl, path });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// ══════════════════════════════════════════════════════════════
//  ADOÇÕES
// ══════════════════════════════════════════════════════════════
app.get(`${PREFIX}/adocoes`, async (c) => {
  try {
    return c.json({ data: parseList(await kv.getByPrefix("adocao:")) });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${PREFIX}/adocoes`, async (c) => {
  try {
    const id = crypto.randomUUID();
    const record = { id, ...await c.req.json(), status: "pendente", createdAt: new Date().toISOString() };
    await kv.set(`adocao:${id}`, record);
    return c.json({ data: record }, 201);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.put(`${PREFIX}/adocoes/:id/status`, async (c) => {
  try {
    const id = c.req.param("id");
    const { status, observacao } = await c.req.json();
    const raw = await kv.get(`adocao:${id}`);
    if (!raw) return c.json({ error: "Não encontrado" }, 404);
    const updated = { ...parseItem(raw), status, observacao, updatedAt: new Date().toISOString() };
    await kv.set(`adocao:${id}`, updated);
    return c.json({ data: updated });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// ══════════════════════════════════════════════════════════════
//  ABRIGOS TEMPORÁRIOS
// ══════════════════════════════════════════════════════════════
app.get(`${PREFIX}/abrigos`, async (c) => {
  try {
    return c.json({ data: parseList(await kv.getByPrefix("abrigo:")) });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${PREFIX}/abrigos`, async (c) => {
  try {
    const id = crypto.randomUUID();
    const record = { id, ...await c.req.json(), status: "pendente", createdAt: new Date().toISOString() };
    await kv.set(`abrigo:${id}`, record);
    return c.json({ data: record }, 201);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.put(`${PREFIX}/abrigos/:id/status`, async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();
    const raw = await kv.get(`abrigo:${id}`);
    if (!raw) return c.json({ error: "Não encontrado" }, 404);
    const updated = { ...parseItem(raw), status, updatedAt: new Date().toISOString() };
    await kv.set(`abrigo:${id}`, updated);
    return c.json({ data: updated });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// ══════════════════════════════════════════════════════════════
//  VOLUNTÁRIOS
// ══════════════════════════════════════════════════════════════
app.get(`${PREFIX}/voluntarios`, async (c) => {
  try {
    return c.json({ data: parseList(await kv.getByPrefix("voluntario:")) });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${PREFIX}/voluntarios`, async (c) => {
  try {
    const id = crypto.randomUUID();
    const record = { id, ...await c.req.json(), status: "analise", createdAt: new Date().toISOString() };
    await kv.set(`voluntario:${id}`, record);
    return c.json({ data: record }, 201);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.put(`${PREFIX}/voluntarios/:id/status`, async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();
    const raw = await kv.get(`voluntario:${id}`);
    if (!raw) return c.json({ error: "Não encontrado" }, 404);
    const updated = { ...parseItem(raw), status, updatedAt: new Date().toISOString() };
    await kv.set(`voluntario:${id}`, updated);
    return c.json({ data: updated });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// ══════════════════════════════════════════════════════════════
//  RESGATES
// ══════════════════════════════════════════════════════════════
app.get(`${PREFIX}/resgates`, async (c) => {
  try {
    return c.json({ data: parseList(await kv.getByPrefix("resgate:")) });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${PREFIX}/resgates`, async (c) => {
  try {
    const id = crypto.randomUUID();
    const record = { id, ...await c.req.json(), status: "recebido", createdAt: new Date().toISOString() };
    await kv.set(`resgate:${id}`, record);
    return c.json({ data: record }, 201);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.put(`${PREFIX}/resgates/:id/status`, async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();
    const raw = await kv.get(`resgate:${id}`);
    if (!raw) return c.json({ error: "Não encontrado" }, 404);
    const updated = { ...parseItem(raw), status, updatedAt: new Date().toISOString() };
    await kv.set(`resgate:${id}`, updated);
    return c.json({ data: updated });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// ══════════════════════════════════════════════════════════════
//  DENÚNCIAS
// ══════════════════════════════════════════════════════════════
app.get(`${PREFIX}/denuncias`, async (c) => {
  try {
    return c.json({ data: parseList(await kv.getByPrefix("denuncia:")) });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${PREFIX}/denuncias`, async (c) => {
  try {
    const id = crypto.randomUUID();
    const record = { id, ...await c.req.json(), status: "analise", createdAt: new Date().toISOString() };
    await kv.set(`denuncia:${id}`, record);
    return c.json({ data: record }, 201);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.put(`${PREFIX}/denuncias/:id/status`, async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();
    const raw = await kv.get(`denuncia:${id}`);
    if (!raw) return c.json({ error: "Não encontrado" }, 404);
    const updated = { ...parseItem(raw), status, updatedAt: new Date().toISOString() };
    await kv.set(`denuncia:${id}`, updated);
    return c.json({ data: updated });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// ══════════════════════════════════════════════════════════════
//  DOAÇÕES
// ══════════════════════════════════════════════════════════════
app.get(`${PREFIX}/doacoes`, async (c) => {
  try {
    return c.json({ data: parseList(await kv.getByPrefix("doacao:")) });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${PREFIX}/doacoes`, async (c) => {
  try {
    const id = crypto.randomUUID();
    const record = { id, ...await c.req.json(), status: "confirmado", createdAt: new Date().toISOString() };
    await kv.set(`doacao:${id}`, record);
    return c.json({ data: record }, 201);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// ══════════════════════════════════════════════════════════════
//  APADRINHAMENTOS
// ══════════════════════════════════════════════════════════════
app.get(`${PREFIX}/apadrinhamentos`, async (c) => {
  try {
    return c.json({ data: parseList(await kv.getByPrefix("apadrinhamento:")) });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

app.post(`${PREFIX}/apadrinhamentos`, async (c) => {
  try {
    const id = crypto.randomUUID();
    const record = { id, ...await c.req.json(), status: "ativo", createdAt: new Date().toISOString() };
    await kv.set(`apadrinhamento:${id}`, record);
    return c.json({ data: record }, 201);
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// ══════════════════════════════════════════════════════════════
//  UPLOAD DOCS
// ══════════════════════════════════════════════════════════════
app.post(`${PREFIX}/upload-doc`, async (c) => {
  try {
    const form = await c.req.formData();
    const file = form.get("file") as File;
    const folder = (form.get("folder") as string) || "docs";
    if (!file) return c.json({ error: "Nenhum arquivo" }, 400);
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const sb = supabase();
    const { error } = await sb.storage.from("make-1db0c6b9-docs").upload(path, file, { contentType: file.type });
    if (error) throw error;
    const { data: signed } = await sb.storage.from("make-1db0c6b9-docs").createSignedUrl(path, 60 * 60 * 24 * 30);
    return c.json({ url: signed?.signedUrl, path });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

// ══════════════════════════════════════════════════════════════
//  STATS
// ══════════════════════════════════════════════════════════════
app.get(`${PREFIX}/stats`, async (c) => {
  try {
    const [animais, adocoes, abrigos, voluntarios, resgates, denuncias, doacoes, apadrinhamentos] = await Promise.all([
      kv.getByPrefix("animal:"),
      kv.getByPrefix("adocao:"),
      kv.getByPrefix("abrigo:"),
      kv.getByPrefix("voluntario:"),
      kv.getByPrefix("resgate:"),
      kv.getByPrefix("denuncia:"),
      kv.getByPrefix("doacao:"),
      kv.getByPrefix("apadrinhamento:"),
    ]);
    const totalDoacoes = doacoes
      .map(parseItem).filter(Boolean)
      .reduce((sum: number, d: any) => sum + Number(d?.valor ?? 0), 0);
    return c.json({
      animais: animais.length,
      adocoes: adocoes.length,
      abrigos: abrigos.length,
      voluntarios: voluntarios.length,
      resgates: resgates.length,
      denuncias: denuncias.length,
      doacoes: doacoes.length,
      apadrinhamentos: apadrinhamentos.length,
      totalDoacoes,
    });
  } catch (e) { return c.json({ error: String(e) }, 500); }
});

Deno.serve(app.fetch);
