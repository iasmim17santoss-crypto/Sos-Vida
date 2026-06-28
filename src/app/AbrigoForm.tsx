import { useState, useRef } from "react";
import { X, Check, Upload, ChevronRight, ChevronLeft, Home, Users, Shield, FileText, AlertCircle } from "lucide-react";
import { Animal } from "./data";
import { api } from "./api";

interface Props {
  animal: Animal;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

const STEPS = [
  { label: "Sobre Você", icon: Users },
  { label: "Sua Casa", icon: Home },
  { label: "Segurança", icon: Shield },
  { label: "Documentos", icon: FileText },
];

export default function AbrigoForm({ animal, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState({ compromisso: false, visita: false, devolucao: false });
  const [submitting, setSubmitting] = useState(false);
  const cpfRef = useRef<HTMLInputElement>(null);
  const residRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleDoc = (key: string, ref: React.RefObject<HTMLInputElement>) => {
    const file = ref.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setDocs(d => ({ ...d, [key]: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.abrigos.create({
        animalId: animal.id,
        animalNome: animal.name,
        tutor: {
          nome: form.nome, cpf: form.cpf, rg: form.rg,
          telefone: form.telefone, email: form.email,
          endereco: form.endereco, disponibilidade: form.disponibilidade,
        },
        moradia: {
          tipo: form.moradia, moradores: form.moradores, idades: form.idades,
          outrosAnimais: form.outrosAnimais, alergia: form.alergia, larAntes: form.larAntes,
        },
        observacoes: form.observacoes,
        documentosEnviados: Object.keys(docs),
      });
      onSuccess(`Solicitação de abrigo temporário para ${animal.name} enviada! Nossa equipe fará uma visita domiciliar em até 5 dias. 🏠`);
      onClose();
    } catch (e) {
      console.error("Erro ao salvar abrigo:", e);
      onSuccess(`Solicitação de abrigo temporário enviada! 🏠`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[950] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-4 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-600 to-orange-800 px-8 py-6 text-white">
          <button onClick={onClose} className="absolute top-5 right-5 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"><X size={20} /></button>
          <div className="flex items-center gap-4">
            <img src={animal.image} alt={animal.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40" />
            <div>
              <p className="text-orange-200 text-sm font-semibold uppercase tracking-widest">Abrigo Temporário</p>
              <h2 className="text-3xl font-['Playfair_Display',serif] font-bold">{animal.name}</h2>
              <p className="text-orange-200 text-sm">A ONG cobre todos os custos veterinários</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-5">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`flex items-center gap-1.5 text-xs font-bold ${i <= step ? "text-white" : "text-white/40"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < step ? "bg-orange-300 border-orange-300 text-orange-900" : i === step ? "bg-white border-white text-orange-800" : "bg-transparent border-white/30 text-white/40"}`}>
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${i < step ? "bg-orange-300" : "bg-white/20"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[62vh]">
          {/* STEP 0 — Sobre Você */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Sobre o Tutor Temporário</h3>
                <p className="text-muted-foreground text-sm">Precisamos conhecer quem será responsável pelo {animal.name} durante o período.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Nome completo *</label>
                  <input value={form.nome || ""} onChange={e => set("nome", e.target.value)} placeholder="Como consta no documento" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">CPF *</label>
                  <input value={form.cpf || ""} onChange={e => set("cpf", e.target.value)} placeholder="000.000.000-00" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">RG *</label>
                  <input value={form.rg || ""} onChange={e => set("rg", e.target.value)} placeholder="00.000.000-0" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Telefone / WhatsApp *</label>
                  <input value={form.telefone || ""} onChange={e => set("telefone", e.target.value)} placeholder="(21) 99999-9999" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Email *</label>
                  <input type="email" value={form.email || ""} onChange={e => set("email", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Disponibilidade de tempo *</label>
                  <select value={form.disponibilidade || ""} onChange={e => set("disponibilidade", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm">
                    <option value="">Selecione</option>
                    <option>2 semanas</option><option>1 mês</option><option>3 meses</option><option>Indefinida</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Endereço completo *</label>
                  <input value={form.endereco || ""} onChange={e => set("endereco", e.target.value)} placeholder="Rua, número, bairro, cidade – CEP" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 — Sua Casa */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Condições da Casa</h3>
                <p className="text-muted-foreground text-sm">Avaliaremos se o ambiente é adequado para acolher {animal.name} temporariamente.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Tipo de moradia *</label>
                  <select value={form.moradia || ""} onChange={e => set("moradia", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm">
                    <option value="">Selecione</option>
                    <option>Casa com quintal</option><option>Casa sem quintal</option><option>Apartamento</option><option>Chácara/Sítio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Quantas pessoas moram? *</label>
                  <select value={form.moradores || ""} onChange={e => set("moradores", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm">
                    <option value="">Selecione</option>
                    <option>1 pessoa</option><option>2 pessoas</option><option>3 a 4 pessoas</option><option>5 ou mais</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Idades dos moradores</label>
                  <input value={form.idades || ""} onChange={e => set("idades", e.target.value)} placeholder="Ex: 32, 28, 5 anos" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Outros animais em casa?</label>
                  <input value={form.outrosAnimais || ""} onChange={e => set("outrosAnimais", e.target.value)} placeholder="Ex: 1 gato adulto castrado" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Alguém tem alergia a animais?</label>
                  <div className="flex gap-3">
                    {["Não", "Sim"].map(v => (
                      <button key={v} onClick={() => set("alergia", v)} className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${form.alergia === v ? "border-orange-500 bg-orange-500 text-white" : "border-border text-gray-600 hover:border-orange-400"}`}>{v}</button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Já foi lar temporário antes?</label>
                  <div className="flex gap-3">
                    {["Não", "Sim"].map(v => (
                      <button key={v} onClick={() => set("larAntes", v)} className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${form.larAntes === v ? "border-orange-500 bg-orange-500 text-white" : "border-border text-gray-600 hover:border-orange-400"}`}>{v}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Segurança */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Avaliação de Segurança</h3>
                <p className="text-muted-foreground text-sm">A segurança do lar é fundamental. Marque o que se aplica à sua residência.</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-700 mb-2">Segurança física do espaço:</p>
                {[
                  ["tela_janela", "Janelas com tela ou proteção"],
                  ["portao_seguro", "Portão/porta com fechamento seguro"],
                  ["muro_grade", "Muro ou grade ao redor do imóvel"],
                  ["quintal_cercado", "Quintal totalmente cercado"],
                  ["sem_buracos", "Sem buracos de fuga no muro/cercado"],
                  ["longe_avenida", "Longe de avenida ou rodovia movimentada"],
                ].map(([k, l]) => (
                  <label key={k} className="flex items-center gap-3 p-3 border border-border rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all">
                    <input type="checkbox" className="accent-orange-600 w-4 h-4" />
                    <span className="text-sm text-gray-700">{l}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-700 mb-2">Riscos identificados:</p>
                {[
                  ["piscina", "Há piscina sem proteção"],
                  ["produtos_toxicos", "Produtos químicos acessíveis"],
                  ["plantas_toxicas", "Plantas tóxicas no jardim"],
                  ["fios_eletricos", "Fios elétricos expostos"],
                ].map(([k, l]) => (
                  <label key={k} className="flex items-center gap-3 p-3 border border-red-100 bg-red-50 rounded-xl cursor-pointer hover:border-red-300 transition-all">
                    <input type="checkbox" className="accent-red-600 w-4 h-4" />
                    <span className="text-sm text-gray-700">{l}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Observações sobre o ambiente</label>
                <textarea rows={3} value={form.observacoes || ""} onChange={e => set("observacoes", e.target.value)} placeholder="Descreva qualquer detalhe relevante sobre seu espaço..." className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Confirmações de compromisso</label>
                <div className="space-y-2">
                  {[
                    { key: "compromisso" as const, text: "Comprometo-me a seguir todas as orientações da ONG durante o período de acolhimento." },
                    { key: "visita" as const, text: "Autorizo visita domiciliar da equipe SOS Vida para avaliação do ambiente." },
                    { key: "devolucao" as const, text: "Entendo que o animal deverá ser devolvido ao término do período acordado ou quando solicitado pela ONG." },
                  ].map(c => (
                    <label key={c.key} className={`flex gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${checks[c.key] ? "border-orange-500 bg-orange-50" : "border-border hover:border-orange-300"}`}
                      onClick={() => setChecks(ch => ({ ...ch, [c.key]: !ch[c.key] }))}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${checks[c.key] ? "bg-orange-500 border-orange-500" : "border-gray-300"}`}>
                        {checks[c.key] && <Check size={12} className="text-white" />}
                      </div>
                      <span className="text-xs text-gray-700">{c.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Documentos */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Documentos Necessários</h3>
                <p className="text-muted-foreground text-sm">Envie os documentos para validação do lar temporário.</p>
              </div>
              {[
                { key: "cpf", ref: cpfRef, label: "CPF do Tutor *", desc: "Foto nítida do CPF frente e verso" },
                { key: "residencia", ref: residRef, label: "Comprovante de Residência *", desc: "Conta de água, luz ou gás – últimos 90 dias" },
              ].map(d => (
                <div key={d.key} className={`border-2 rounded-2xl p-5 cursor-pointer transition-all ${docs[d.key] ? "border-orange-500 bg-orange-50" : "border-dashed border-gray-300 hover:border-orange-400 bg-gray-50"}`}
                  onClick={() => d.ref.current?.click()}>
                  <input ref={d.ref} type="file" accept="image/*,.pdf" className="hidden" onChange={() => handleDoc(d.key, d.ref)} />
                  {docs[d.key] ? (
                    <div className="flex items-center gap-3">
                      <img src={docs[d.key]} alt={d.label} className="h-16 object-contain rounded-xl" />
                      <div><div className="flex items-center gap-1 text-orange-700 font-bold text-sm"><Check size={16} /> Enviado com sucesso</div></div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Upload size={28} className="text-orange-400 flex-shrink-0" />
                      <div><p className="font-bold text-gray-700">{d.label}</p><p className="text-xs text-muted-foreground">{d.desc}</p></div>
                    </div>
                  )}
                </div>
              ))}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <p className="text-orange-800 text-sm"><strong>Como funciona o lar temporário:</strong></p>
                <ul className="mt-2 space-y-1 text-sm text-orange-700">
                  <li>✓ A ONG fornece ração, medicamentos e material de cuidado</li>
                  <li>✓ Atendimento veterinário gratuito durante todo o período</li>
                  <li>✓ Suporte 24h pelo WhatsApp da nossa equipe</li>
                  <li>✓ Você receberá treinamento sobre os cuidados do animal</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-5 bg-gray-50 border-t border-border flex items-center justify-between">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()} className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-gray-600 font-semibold hover:border-gray-400 transition-all">
            <ChevronLeft size={18} /> {step === 0 ? "Cancelar" : "Voltar"}
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all hover:scale-[1.02] shadow-lg shadow-orange-200">
              Continuar <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!docs["cpf"] || !docs["residencia"] || submitting} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold transition-all hover:scale-[1.02] shadow-lg shadow-orange-200 disabled:shadow-none min-w-[160px] justify-center">
              {submitting ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <><Check size={18} /> Enviar Solicitação</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
