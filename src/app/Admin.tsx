import { useState, useEffect } from "react";
import {
  LayoutDashboard, PawPrint, Heart, Home, Users, AlertTriangle,
  Shield, DollarSign, Star, Loader2, RefreshCw, ChevronDown,
  ChevronUp, Check, X, Plus, Trash2, AlertCircle, Database
} from "lucide-react";
import { api } from "./api";
import { ANIMALS as SEED_ANIMALS } from "./data";
import NovoAnimalModal from "./NovoAnimalModal";

interface Props { showToast: (msg: string) => void; }

type AdminTab = "dashboard" | "animais" | "adocoes" | "abrigos" | "voluntarios" | "resgates" | "denuncias" | "doacoes" | "apadrinhamentos";

const STATUS_COLORS: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  analise: "bg-blue-100 text-blue-800",
  aprovado: "bg-green-100 text-green-800",
  recusado: "bg-red-100 text-red-800",
  ativo: "bg-green-100 text-green-800",
  recebido: "bg-blue-100 text-blue-800",
  equipe_enviada: "bg-purple-100 text-purple-800",
  finalizado: "bg-gray-100 text-gray-800",
  confirmado: "bg-green-100 text-green-800",
  encaminhado: "bg-orange-100 text-orange-800",
  resolvido: "bg-gray-100 text-gray-800",
};

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-['Playfair_Display',serif] font-bold text-gray-800">{value}</p>
        <p className="text-xs text-muted-foreground font-semibold">{label}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground font-semibold min-w-[140px] flex-shrink-0">{label}:</span>
      <span className="text-gray-800 break-all">{typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}</span>
    </div>
  );
}

function RecordCard({ record, statusOptions, onStatusChange, onDelete, expandedFields }: {
  record: any;
  statusOptions: string[];
  onStatusChange: (id: string, status: string) => void;
  onDelete?: (id: string) => void;
  expandedFields?: { label: string; key: string }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [changing, setChanging] = useState(false);

  const handleStatus = async (status: string) => {
    setChanging(true);
    await onStatusChange(record.id, status);
    setChanging(false);
  };

  const date = record.createdAt ? new Date(record.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between p-5 gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-gray-800 truncate">{record.dadosPessoais?.nome || record.tutor?.nome || record.padrinho?.nome || record.nome || record.animalNome || `#${record.id?.slice(0, 8)}`}</span>
            <Badge status={record.status} />
          </div>
          <p className="text-xs text-muted-foreground">{date}</p>
          {record.animalNome && <p className="text-xs text-green-700 font-semibold mt-0.5">🐾 {record.animalNome}</p>}
          {record.valor && <p className="text-xs text-green-700 font-semibold mt-0.5">💰 R$ {record.valor}</p>}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-700 flex-shrink-0 p-1">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
          {/* Fields */}
          {expandedFields?.map(f => {
            const val = f.key.split(".").reduce((o: any, k) => o?.[k], record);
            return <DetailRow key={f.key} label={f.label} value={typeof val === "object" && val !== null ? Object.entries(val).map(([k, v]) => `${k}: ${v}`).join(" · ") : val} />;
          })}
          <DetailRow label="ID" value={record.id} />
          {record.documentosEnviados?.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground font-semibold">Documentos:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {record.documentosEnviados.map((d: string) => (
                  <span key={d} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Status change */}
          <div>
            <p className="text-xs font-bold text-gray-600 mb-2">Alterar status:</p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(s => (
                <button key={s} onClick={() => handleStatus(s)} disabled={record.status === s || changing}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${record.status === s ? "bg-green-600 text-white border-green-600" : "border-border text-gray-600 hover:border-green-400 hover:text-green-700"}`}>
                  {changing && record.status !== s ? "..." : s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {onDelete && (
            <button onClick={() => onDelete(record.id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold mt-1">
              <Trash2 size={13} /> Remover registro
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Admin({ showToast }: Props) {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [showNewAnimal, setShowNewAnimal] = useState(false);

  const loadStats = async () => {
    try {
      setApiError(null);
      const s = await api.stats.get();
      setStats(s);
    } catch (e: any) {
      console.error("stats error:", e);
      setApiError(e?.message ?? "Erro ao conectar com o servidor.");
    }
  };

  const loadTab = async (t: AdminTab) => {
    if (t === "dashboard") { await loadStats(); return; }
    setLoading(true);
    setData([]);
    setApiError(null);
    try {
      const fetchers: Partial<Record<AdminTab, () => Promise<{ data: any[] }>>> = {
        animais: api.animais.list,
        adocoes: api.adocoes.list,
        abrigos: api.abrigos.list,
        voluntarios: api.voluntarios.list,
        resgates: api.resgates.list,
        denuncias: api.denuncias.list,
        doacoes: api.doacoes.list,
        apadrinhamentos: api.apadrinhamentos.list,
      };
      const fn = fetchers[t];
      if (!fn) return;

      const result = await fn();
      console.log(`[Admin] ${t} raw:`, JSON.stringify(result).slice(0, 300));

      // Aceita { data: [...] } ou array direto
      const list: any[] = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      console.log(`[Admin] ${t} list length:`, list.length);
      setData(list);
    } catch (e: any) {
      console.error(`[Admin] ${t} error:`, e);
      setApiError(e?.message ?? "Erro ao carregar. Verifique se o servidor foi deployado no Make (Settings → Deploy).");
    } finally {
      setLoading(false);
    }
  };

  const seedAnimals = async () => {
    setSeeding(true);
    try {
      for (const animal of SEED_ANIMALS) {
        await api.animais.create(animal);
      }
      showToast(`${SEED_ANIMALS.length} animais cadastrados no banco com sucesso! 🐾`);
      loadTab("animais");
    } catch (e: any) {
      showToast("Erro ao popular banco: " + (e?.message ?? ""));
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadTab(tab); }, [tab]);

  const refresh = () => loadTab(tab);

  const TABS: { key: AdminTab; label: string; icon: any; color: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-gray-600" },
    { key: "animais", label: "Animais", icon: PawPrint, color: "text-green-600" },
    { key: "adocoes", label: "Adoções", icon: Heart, color: "text-red-500" },
    { key: "abrigos", label: "Abrigos Temp.", icon: Home, color: "text-orange-500" },
    { key: "voluntarios", label: "Voluntários", icon: Users, color: "text-purple-600" },
    { key: "resgates", label: "Resgates", icon: AlertTriangle, color: "text-amber-600" },
    { key: "denuncias", label: "Denúncias", icon: Shield, color: "text-red-700" },
    { key: "doacoes", label: "Doações", icon: DollarSign, color: "text-green-700" },
    { key: "apadrinhamentos", label: "Apadrinhamentos", icon: Star, color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {showNewAnimal && (
        <NovoAnimalModal
          onClose={() => setShowNewAnimal(false)}
          onSuccess={() => { showToast("Animal cadastrado! 🐾"); setShowNewAnimal(false); if (tab === "animais") refresh(); }}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-950 text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-green-300 text-sm font-semibold uppercase tracking-widest mb-1">Área restrita</p>
          <h1 className="font-['Playfair_Display',serif] font-bold text-4xl mb-1">Painel Administrativo</h1>
          <p className="text-green-200 text-sm">SOS Vida · Gerencie animais, adoções e todas as solicitações</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${tab === t.key ? "bg-white shadow-md text-green-800 border border-border" : "text-gray-600 hover:bg-white/70 hover:text-gray-800"}`}>
              <t.icon size={15} className={t.color} />{t.label}
              {tab === t.key && data.length > 0 && <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">{data.length}</span>}
            </button>
          ))}
        </div>

        {/* BANNER DE ERRO GLOBAL */}
        {apiError && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-800 text-sm">Erro de conexão com o servidor</p>
              <p className="text-red-700 text-xs mt-1">{apiError}</p>
              <p className="text-red-600 text-xs mt-2 font-semibold">
                Solução: No Make, clique em <strong>Settings ⚙️ → Deploy</strong> para ativar o servidor Supabase.
              </p>
            </div>
            <button onClick={refresh} className="text-red-500 hover:text-red-700 flex-shrink-0"><RefreshCw size={16} /></button>
          </div>
        )}

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl text-gray-800">Resumo Geral</h2>
              <button onClick={loadStats} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gray-700 font-semibold">
                <RefreshCw size={15} /> Atualizar
              </button>
            </div>
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Animais Cadastrados" value={stats.animais} icon={PawPrint} color="bg-green-100 text-green-700" />
                <StatCard label="Solicitações de Adoção" value={stats.adocoes} icon={Heart} color="bg-red-100 text-red-600" />
                <StatCard label="Abrigos Temporários" value={stats.abrigos} icon={Home} color="bg-orange-100 text-orange-600" />
                <StatCard label="Voluntários" value={stats.voluntarios} icon={Users} color="bg-purple-100 text-purple-600" />
                <StatCard label="Resgates" value={stats.resgates} icon={AlertTriangle} color="bg-amber-100 text-amber-700" />
                <StatCard label="Denúncias" value={stats.denuncias} icon={Shield} color="bg-red-100 text-red-700" />
                <StatCard label="Doações" value={stats.doacoes} icon={DollarSign} color="bg-green-100 text-green-700" />
                <StatCard label="Apadrinhamentos" value={stats.apadrinhamentos} icon={Star} color="bg-purple-100 text-purple-500" />
              </div>
            ) : (
              <div className="flex items-center gap-3 py-10 justify-center text-muted-foreground">
                <Loader2 size={24} className="animate-spin text-green-500" /> Carregando estatísticas...
              </div>
            )}
            {stats?.totalDoacoes > 0 && (
              <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-3xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm font-semibold">Total arrecadado em doações</p>
                  <p className="font-['Playfair_Display',serif] font-bold text-4xl mt-1">
                    R$ {Number(stats.totalDoacoes).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign size={48} className="opacity-30" />
              </div>
            )}
            <div className="mt-6 bg-white rounded-2xl border border-border p-6">
              <h3 className="font-bold text-gray-800 mb-4">Ações Rápidas</h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => { setTab("animais"); setShowNewAnimal(true); }} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-green-200">
                  <Plus size={16} /> Cadastrar Animal
                </button>
                <button onClick={seedAnimals} disabled={seeding} className="flex items-center gap-2 border-2 border-green-300 hover:border-green-600 text-green-700 hover:bg-green-50 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
                  {seeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                  {seeding ? "Populando..." : "Popular banco com animais padrão"}
                </button>
                <button onClick={() => setTab("adocoes")} className="flex items-center gap-2 border-2 border-border hover:border-red-400 text-gray-700 hover:text-red-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all">
                  <Heart size={16} /> Ver Adoções
                </button>
                <button onClick={() => setTab("voluntarios")} className="flex items-center gap-2 border-2 border-border hover:border-purple-400 text-gray-700 hover:text-purple-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all">
                  <Users size={16} /> Ver Voluntários
                </button>
                <button onClick={() => setTab("denuncias")} className="flex items-center gap-2 border-2 border-border hover:border-red-400 text-gray-700 hover:text-red-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all">
                  <Shield size={16} /> Ver Denúncias
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ANIMAIS */}
        {tab === "animais" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl text-gray-800">Animais Cadastrados</h2>
              <div className="flex gap-2">
                <button onClick={refresh} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-700 font-semibold px-3 py-2 rounded-xl hover:bg-white border border-border"><RefreshCw size={14} /></button>
                <button onClick={() => setShowNewAnimal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-md shadow-green-200">
                  <Plus size={16} /> Novo Animal
                </button>
              </div>
            </div>
            {loading ? <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-green-500" /></div> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map(a => (
                  <div key={a.id} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="h-36 overflow-hidden bg-gray-100">
                      <img src={a.image} alt={a.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-gray-800">{a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.species} · {a.age} · {a.sex}</p>
                        </div>
                        <Badge status={a.status} />
                      </div>
                      <div className="flex gap-1 mb-3">
                        {a.castrated && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">Castrado</span>}
                        {a.vaccinated && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">Vacinado</span>}
                      </div>
                      <div className="flex gap-2">
                        <select defaultValue={a.status} onChange={async e => {
                          try { await api.animais.update(a.id, { status: e.target.value }); showToast("Status atualizado!"); refresh(); }
                          catch { showToast("Erro ao atualizar."); }
                        }} className="flex-1 border border-border rounded-lg px-2 py-1.5 text-xs bg-input-background focus:outline-none focus:ring-1 focus:ring-green-500">
                          <option value="disponivel">Disponível</option>
                          <option value="tratamento">Em Tratamento</option>
                          <option value="adotado">Adotado</option>
                        </select>
                        <button onClick={async () => {
                          if (!confirm(`Remover ${a.name}?`)) return;
                          try { await api.animais.delete(a.id); showToast("Animal removido."); refresh(); }
                          catch { showToast("Erro ao remover."); }
                        }} className="bg-red-50 hover:bg-red-100 text-red-500 p-1.5 rounded-lg transition-all">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {data.length === 0 && !loading && !apiError && (
                  <div className="col-span-3 text-center py-16 text-muted-foreground">
                    <PawPrint size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="mb-4">Nenhum animal no banco ainda.</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button onClick={() => setShowNewAnimal(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-green-200">
                        <Plus size={16} /> Cadastrar manualmente
                      </button>
                      <button onClick={seedAnimals} disabled={seeding} className="flex items-center gap-2 border-2 border-green-400 text-green-700 hover:bg-green-50 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
                        {seeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                        {seeding ? "Populando..." : "Popular com animais padrão"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ADOÇÕES */}
        {tab === "adocoes" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl text-gray-800">Solicitações de Adoção ({data.length})</h2>
              <button onClick={refresh} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-700 font-semibold px-3 py-2 rounded-xl hover:bg-white border border-border"><RefreshCw size={14} /> Atualizar</button>
            </div>
            {loading ? <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-green-500" /></div> : (
              <div className="space-y-3">
                {data.map(r => (
                  <RecordCard key={r.id} record={r}
                    statusOptions={["pendente", "analise", "aprovado", "recusado"]}
                    onStatusChange={async (id, status) => { try { await api.adocoes.setStatus(id, status); showToast("Status atualizado!"); refresh(); } catch { showToast("Erro."); } }}
                    expandedFields={[
                      { label: "Nome", key: "dadosPessoais.nome" },
                      { label: "CPF", key: "dadosPessoais.cpf" },
                      { label: "Telefone", key: "dadosPessoais.telefone" },
                      { label: "Email", key: "dadosPessoais.email" },
                      { label: "Profissão", key: "dadosPessoais.profissao" },
                      { label: "Renda", key: "dadosPessoais.renda" },
                      { label: "Endereço", key: "dadosPessoais.endereco" },
                      { label: "Moradia", key: "moradia" },
                      { label: "Experiência", key: "experiencia" },
                    ]}
                  />
                ))}
                {data.length === 0 && <div className="text-center py-16 text-muted-foreground"><Heart size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhuma solicitação de adoção ainda.</p></div>}
              </div>
            )}
          </div>
        )}

        {/* ABRIGOS */}
        {tab === "abrigos" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl text-gray-800">Abrigos Temporários ({data.length})</h2>
              <button onClick={refresh} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-700 font-semibold px-3 py-2 rounded-xl hover:bg-white border border-border"><RefreshCw size={14} /></button>
            </div>
            {loading ? <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-green-500" /></div> : (
              <div className="space-y-3">
                {data.map(r => (
                  <RecordCard key={r.id} record={r}
                    statusOptions={["pendente", "analise", "aprovado", "recusado", "finalizado"]}
                    onStatusChange={async (id, status) => { try { await api.abrigos.setStatus(id, status); showToast("Status atualizado!"); refresh(); } catch { showToast("Erro."); } }}
                    expandedFields={[
                      { label: "Nome", key: "tutor.nome" },
                      { label: "CPF", key: "tutor.cpf" },
                      { label: "Telefone", key: "tutor.telefone" },
                      { label: "Email", key: "tutor.email" },
                      { label: "Disponibilidade", key: "tutor.disponibilidade" },
                      { label: "Moradia", key: "moradia" },
                    ]}
                  />
                ))}
                {data.length === 0 && <div className="text-center py-16 text-muted-foreground"><Home size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhum abrigo temporário registrado.</p></div>}
              </div>
            )}
          </div>
        )}

        {/* VOLUNTÁRIOS */}
        {tab === "voluntarios" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl text-gray-800">Voluntários ({data.length})</h2>
              <button onClick={refresh} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-700 font-semibold px-3 py-2 rounded-xl hover:bg-white border border-border"><RefreshCw size={14} /></button>
            </div>
            {loading ? <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-purple-500" /></div> : (
              <div className="space-y-3">
                {data.map(r => (
                  <RecordCard key={r.id} record={r}
                    statusOptions={["analise", "aprovado", "recusado", "ativo"]}
                    onStatusChange={async (id, status) => { try { await api.voluntarios.setStatus(id, status); showToast("Status atualizado!"); refresh(); } catch { showToast("Erro."); } }}
                    expandedFields={[
                      { label: "Nome", key: "nome" },
                      { label: "CPF", key: "cpf" },
                      { label: "Telefone", key: "telefone" },
                      { label: "Email", key: "email" },
                      { label: "Cidade", key: "cidade" },
                      { label: "Profissão", key: "profissao" },
                      { label: "Motivação", key: "motivacao" },
                      { label: "Áreas", key: "areas" },
                      { label: "Disponibilidade", key: "disponibilidade" },
                      { label: "Horas/mês", key: "horas" },
                      { label: "Veículo", key: "veiculo" },
                      { label: "Contato Emergência", key: "emergenciaNome" },
                    ]}
                  />
                ))}
                {data.length === 0 && <div className="text-center py-16 text-muted-foreground"><Users size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhum voluntário cadastrado ainda.</p></div>}
              </div>
            )}
          </div>
        )}

        {/* RESGATES */}
        {tab === "resgates" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl text-gray-800">Resgates ({data.length})</h2>
              <button onClick={refresh} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-700 font-semibold px-3 py-2 rounded-xl hover:bg-white border border-border"><RefreshCw size={14} /> Atualizar</button>
            </div>
            {loading ? <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-amber-500" /></div> : (
              <div className="space-y-3">
                {data.map((r, i) => (
                  <RecordCard key={r.id ?? i} record={r}
                    statusOptions={["recebido", "equipe_enviada", "em_resgate", "finalizado"]}
                    onStatusChange={async (id, status) => { try { await api.resgates.setStatus(id, status); showToast("Status atualizado!"); refresh(); } catch { showToast("Erro."); } }}
                    expandedFields={[
                      { label: "Tipo Animal", key: "tipoAnimal" },
                      { label: "Localização", key: "localizacao" },
                      { label: "Estado", key: "estadoAnimal" },
                      { label: "Urgência", key: "urgencia" },
                      { label: "Descrição", key: "descricao" },
                      { label: "Contato", key: "contato" },
                    ]}
                  />
                ))}
                {data.length === 0 && !apiError && (
                  <div className="text-center py-16 text-muted-foreground">
                    <AlertTriangle size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Nenhum resgate registrado ainda.</p>
                    <p className="text-xs mt-2">Se o dashboard mostra resgates, abra o console do navegador (F12) e veja o log <strong>[Admin] resgates response</strong> para diagnóstico.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* DENÚNCIAS */}
        {tab === "denuncias" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl text-gray-800">Denúncias ({data.length})</h2>
              <button onClick={refresh} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-700 font-semibold px-3 py-2 rounded-xl hover:bg-white border border-border"><RefreshCw size={14} /></button>
            </div>
            {loading ? <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-red-500" /></div> : (
              <div className="space-y-3">
                {data.map(r => (
                  <RecordCard key={r.id} record={r}
                    statusOptions={["analise", "encaminhado", "resolvido"]}
                    onStatusChange={async (id, status) => { try { await api.denuncias.setStatus(id, status); showToast("Status atualizado!"); refresh(); } catch { showToast("Erro."); } }}
                    expandedFields={[
                      { label: "Endereço", key: "endereco" },
                      { label: "Tipo", key: "tipoMausTratos" },
                      { label: "Descrição", key: "descricao" },
                      { label: "Anônima", key: "anonima" },
                    ]}
                  />
                ))}
                {data.length === 0 && <div className="text-center py-16 text-muted-foreground"><Shield size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhuma denúncia registrada.</p></div>}
              </div>
            )}
          </div>
        )}

        {/* DOAÇÕES */}
        {tab === "doacoes" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl text-gray-800">Doações ({data.length})</h2>
              <button onClick={refresh} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-700 font-semibold px-3 py-2 rounded-xl hover:bg-white border border-border"><RefreshCw size={14} /></button>
            </div>
            {loading ? <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-green-500" /></div> : (
              <div>
                {data.length > 0 && (
                  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-5 mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-sm">Total arrecadado</p>
                      <p className="font-['Playfair_Display',serif] font-bold text-3xl">
                        R$ {data.reduce((s: number, d: any) => s + Number(d.valor || 0), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <DollarSign size={40} className="opacity-40" />
                  </div>
                )}
                <div className="space-y-3">
                  {data.map(r => (
                    <div key={r.id} className="bg-white border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-800">R$ {r.valor} <span className="text-muted-foreground font-normal text-sm">via {r.metodo}</span></p>
                        <p className="text-xs text-muted-foreground">{r.causa} · {new Date(r.createdAt).toLocaleDateString("pt-BR")}</p>
                        {r.doador && <p className="text-xs text-green-700 font-semibold mt-0.5">{r.doador}</p>}
                      </div>
                      <Badge status={r.status} />
                    </div>
                  ))}
                  {data.length === 0 && <div className="text-center py-16 text-muted-foreground"><DollarSign size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhuma doação registrada ainda.</p></div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* APADRINHAMENTOS */}
        {tab === "apadrinhamentos" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl text-gray-800">Apadrinhamentos ({data.length})</h2>
              <button onClick={refresh} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-700 font-semibold px-3 py-2 rounded-xl hover:bg-white border border-border"><RefreshCw size={14} /></button>
            </div>
            {loading ? <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-purple-500" /></div> : (
              <div className="space-y-3">
                {data.map(r => (
                  <div key={r.id} className="bg-white border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-800">{r.padrinho?.nome || "Anônimo"}</p>
                      <p className="text-sm text-muted-foreground">{r.animalNome} · {r.plano} · <span className="text-green-700 font-semibold">R${r.valorMensal}/mês</span></p>
                      <p className="text-xs text-muted-foreground">{r.padrinho?.email} · {new Date(r.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <Badge status={r.status} />
                  </div>
                ))}
                {data.length === 0 && <div className="text-center py-16 text-muted-foreground"><Star size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhum apadrinhamento registrado.</p></div>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
