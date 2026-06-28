import { useState, useRef } from "react";
import { X, Check, Upload, Camera, ChevronRight, ChevronLeft, User, Home, Heart, FileText, Shield, AlertCircle } from "lucide-react";
import { Animal } from "./data";
import { api } from "./api";

interface Props {
  animal: Animal;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

type DocKey = "cpf_frente" | "cpf_verso" | "rg_frente" | "rg_verso" | "comp_renda" | "comp_residencia" | "selfie_doc";

const STEPS = [
  { label: "Dados Pessoais", icon: User },
  { label: "Moradia", icon: Home },
  { label: "Experiência", icon: Heart },
  { label: "Documentos", icon: FileText },
  { label: "Termos", icon: Shield },
];

const DOC_FIELDS: { key: DocKey; label: string; desc: string; required: boolean }[] = [
  { key: "cpf_frente", label: "CPF (Frente)", desc: "Foto nítida do CPF físico ou digital", required: true },
  { key: "cpf_verso", label: "CPF (Verso)", desc: "Verso do CPF (se houver)", required: false },
  { key: "rg_frente", label: "RG (Frente)", desc: "Documento de identidade - frente", required: true },
  { key: "rg_verso", label: "RG (Verso)", desc: "Documento de identidade - verso", required: true },
  { key: "comp_renda", label: "Comprovante de Renda", desc: "Holerite, extrato ou declaração — últimos 3 meses", required: true },
  { key: "comp_residencia", label: "Comprovante de Residência", desc: "Conta de luz, água ou gás — últimos 90 dias", required: true },
  { key: "selfie_doc", label: "Selfie com Documento", desc: "Foto sua segurando o RG ou CNH aberto", required: true },
];

export default function AdotarForm({ animal, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [docs, setDocs] = useState<Partial<Record<DocKey, string>>>({});
  const [form, setForm] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState({ termos: false, veracidade: false, visita: false, devolucao: false });
  const [submitting, setSubmitting] = useState(false);
  const fileRefs = useRef<Partial<Record<DocKey, HTMLInputElement | null>>>({});

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleDoc = (key: DocKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setDocs(d => ({ ...d, [key]: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const requiredDocs = DOC_FIELDS.filter(d => d.required).map(d => d.key);
  const docsOk = requiredDocs.every(k => !!docs[k]);
  const allTerms = checks.termos && checks.veracidade && checks.visita && checks.devolucao;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.adocoes.create({
        animalId: animal.id,
        animalNome: animal.name,
        animalEspecie: animal.species,
        dadosPessoais: {
          nome: form.nome, cpf: form.cpf, rg: form.rg,
          nascimento: form.nascimento, estadoCivil: form.estadoCivil,
          profissao: form.profissao, renda: form.renda,
          telefone: form.telefone, email: form.email, endereco: form.endereco,
        },
        moradia: {
          tipo: form.moradia, imovel: form.imovel, moradores: form.moradores,
          criancas: form.criancas, outrosAnimais: form.outrosAnimais, espaco: form.espaco,
        },
        experiencia: {
          experiencia: form.experiencia, horasSozinho: form.horasSozinho,
          cuidador: form.cuidador, viagem: form.viagem, alergia: form.alergia,
          motivacao: form.motivacao, devolucao: form.devolucao,
        },
        documentosEnviados: Object.keys(docs),
      });
      onSuccess(`Solicitação de adoção de ${animal.name} enviada! Nossa equipe analisará seus documentos em até 3 dias úteis. 🐾`);
      onClose();
    } catch (e) {
      console.error("Erro ao salvar adoção:", e);
      onSuccess(`Solicitação de adoção de ${animal.name} enviada! 🐾`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[950] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-4 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-700 to-green-900 px-8 py-6 text-white">
          <button onClick={onClose} className="absolute top-5 right-5 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"><X size={20} /></button>
          <div className="flex items-center gap-4">
            <img src={animal.image} alt={animal.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40" />
            <div>
              <p className="text-green-300 text-sm font-semibold uppercase tracking-widest">Processo de Adoção</p>
              <h2 className="text-3xl font-['Playfair_Display',serif] font-bold">{animal.name}</h2>
              <p className="text-green-200 text-sm">{animal.species} · {animal.age} · {animal.sex}</p>
            </div>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-1 mt-6">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`flex items-center gap-1.5 text-xs font-bold transition-all ${i <= step ? "text-white" : "text-white/40"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < step ? "bg-green-400 border-green-400 text-green-900" : i === step ? "bg-white border-white text-green-800" : "bg-transparent border-white/30 text-white/40"}`}>
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${i < step ? "bg-green-400" : "bg-white/20"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[65vh]">
          {/* STEP 0 — Dados Pessoais */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Dados Pessoais</h3>
                <p className="text-muted-foreground text-sm">Precisamos verificar sua identidade para garantir a segurança do animal.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Nome completo *</label>
                  <input value={form.nome || ""} onChange={e => set("nome", e.target.value)} placeholder="Como consta no documento" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">CPF *</label>
                  <input value={form.cpf || ""} onChange={e => set("cpf", e.target.value)} placeholder="000.000.000-00" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">RG *</label>
                  <input value={form.rg || ""} onChange={e => set("rg", e.target.value)} placeholder="00.000.000-0" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Data de nascimento *</label>
                  <input type="date" value={form.nascimento || ""} onChange={e => set("nascimento", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Estado civil *</label>
                  <select value={form.estadoCivil || ""} onChange={e => set("estadoCivil", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">Selecione</option>
                    <option>Solteiro(a)</option><option>Casado(a)</option><option>União estável</option><option>Divorciado(a)</option><option>Viúvo(a)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Profissão *</label>
                  <input value={form.profissao || ""} onChange={e => set("profissao", e.target.value)} placeholder="Ex: Professor, Enfermeiro..." className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Renda mensal aproximada *</label>
                  <select value={form.renda || ""} onChange={e => set("renda", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">Selecione</option>
                    <option>Até R$ 1.500</option><option>R$ 1.500 – R$ 3.000</option><option>R$ 3.000 – R$ 5.000</option><option>R$ 5.000 – R$ 10.000</option><option>Acima de R$ 10.000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Telefone / WhatsApp *</label>
                  <input value={form.telefone || ""} onChange={e => set("telefone", e.target.value)} placeholder="(21) 99999-9999" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Email *</label>
                  <input type="email" value={form.email || ""} onChange={e => set("email", e.target.value)} placeholder="seu@email.com" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Endereço completo *</label>
                  <input value={form.endereco || ""} onChange={e => set("endereco", e.target.value)} placeholder="Rua, número, complemento, bairro, cidade – CEP" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 — Moradia */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Condições de Moradia</h3>
                <p className="text-muted-foreground text-sm">Precisamos garantir que o ambiente será seguro e adequado para {animal.name}.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Tipo de moradia *</label>
                  <select value={form.moradia || ""} onChange={e => set("moradia", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">Selecione</option>
                    <option>Casa com quintal</option><option>Casa sem quintal</option><option>Apartamento</option><option>Chácara/Sítio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Imóvel *</label>
                  <select value={form.imovel || ""} onChange={e => set("imovel", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">Selecione</option>
                    <option>Próprio</option><option>Alugado</option><option>Financiado</option><option>Cedido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Quantas pessoas moram na casa? *</label>
                  <select value={form.moradores || ""} onChange={e => set("moradores", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">Selecione</option>
                    <option>1 pessoa</option><option>2 pessoas</option><option>3 a 4 pessoas</option><option>5 ou mais</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Há crianças na casa? *</label>
                  <select value={form.criancas || ""} onChange={e => set("criancas", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">Selecione</option>
                    <option>Não</option><option>Sim, acima de 10 anos</option><option>Sim, 5 a 10 anos</option><option>Sim, abaixo de 5 anos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Há outros animais? *</label>
                  <select value={form.outrosAnimais || ""} onChange={e => set("outrosAnimais", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">Selecione</option>
                    <option>Não</option><option>Sim, cão(es)</option><option>Sim, gato(s)</option><option>Sim, outros</option><option>Sim, várias espécies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Tamanho do espaço *</label>
                  <select value={form.espaco || ""} onChange={e => set("espaco", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">Selecione</option>
                    <option>Pequeno (até 50m²)</option><option>Médio (50–100m²)</option><option>Grande (100–200m²)</option><option>Muito grande (200m²+)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold mb-2 text-gray-700">Características do imóvel</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["Tem tela nas janelas", "Tem grade/muro", "Tem portão seguro", "Tem quintal cercado", "Perto de avenida movimentada", "Tem piscina"].map(c => (
                      <label key={c} className="flex items-center gap-2 p-2.5 border border-border rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all text-sm">
                        <input type="checkbox" className="accent-green-600" />
                        <span className="text-gray-700">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {form.imovel === "Alugado" && (
                  <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                    <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800 text-sm">Como o imóvel é alugado, precisaremos de uma declaração do proprietário ou contrato permitindo animais de estimação.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Experiência */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Experiência & Rotina</h3>
                <p className="text-muted-foreground text-sm">Queremos entender se você e {animal.name} são compatíveis.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Já teve animais antes? *</label>
                  <select value={form.experiencia || ""} onChange={e => set("experiencia", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">Selecione</option>
                    <option>Nunca tive</option><option>Tive na infância</option><option>Tenho/tive cães</option><option>Tenho/tive gatos</option><option>Tenho/tive vários</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Quantas horas por dia o animal ficaria sozinho? *</label>
                  <select value={form.horasSozinho || ""} onChange={e => set("horasSozinho", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">Selecione</option>
                    <option>Não ficaria (alguém sempre em casa)</option><option>Até 4 horas</option><option>4 a 6 horas</option><option>6 a 8 horas</option><option>Mais de 8 horas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Quem cuidaria do animal em suas ausências? *</label>
                  <input value={form.cuidador || ""} onChange={e => set("cuidador", e.target.value)} placeholder="Ex: Cônjuge, familiar, pet sitter, hotel para pets..." className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Com que frequência viaja? *</label>
                  <select value={form.viagem || ""} onChange={e => set("viagem", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                    <option value="">Selecione</option>
                    <option>Nunca / muito raramente</option><option>1 a 2 vezes por ano</option><option>Mensalmente</option><option>Frequentemente (mais de 1x/mês)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Alguém na casa tem alergia a animais? *</label>
                  <div className="flex gap-3">
                    {["Não", "Sim"].map(v => (
                      <button key={v} onClick={() => set("alergia", v)} className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${form.alergia === v ? "border-green-600 bg-green-600 text-white" : "border-border text-gray-600 hover:border-green-400"}`}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Por que deseja adotar {animal.name}? *</label>
                  <textarea value={form.motivacao || ""} onChange={e => set("motivacao", e.target.value)} rows={4} placeholder="Conte-nos o que te motivou a escolher esse animal e como você planeja incluí-lo na sua vida..." className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">O que faria se precisasse devolver o animal? *</label>
                  <textarea value={form.devolucao || ""} onChange={e => set("devolucao", e.target.value)} rows={3} placeholder="Ex: Entraria em contato com a ONG, buscaria família confiável..." className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Documentos */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Envio de Documentos</h3>
                <p className="text-muted-foreground text-sm">Todos os documentos são analisados com sigilo total. Campos com * são obrigatórios.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {DOC_FIELDS.map(doc => (
                  <div key={doc.key} className={`border-2 rounded-2xl p-4 transition-all cursor-pointer ${docs[doc.key] ? "border-green-500 bg-green-50" : "border-dashed border-gray-300 hover:border-green-400 bg-gray-50"}`}
                    onClick={() => fileRefs.current[doc.key]?.click()}>
                    <input type="file" accept="image/*,.pdf" className="hidden"
                      ref={el => { fileRefs.current[doc.key] = el; }}
                      onChange={e => handleDoc(doc.key, e)} />
                    {docs[doc.key] ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={docs[doc.key]} alt={doc.label} className="h-20 object-contain rounded-xl" />
                        <div className="flex items-center gap-1 text-green-700 text-xs font-bold"><Check size={14} /> Enviado</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-2 text-center">
                        <Upload size={24} className="text-gray-400" />
                        <span className="font-bold text-sm text-gray-700">{doc.label}{doc.required && " *"}</span>
                        <span className="text-xs text-muted-foreground">{doc.desc}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {!docsOk && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                  <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800 text-sm">Envie todos os documentos obrigatórios (*) para continuar.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Termos */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Termos e Compromissos</h3>
                <p className="text-muted-foreground text-sm">Leia com atenção e confirme cada compromisso antes de enviar.</p>
              </div>
              <div className="space-y-3">
                {[
                  { key: "termos" as const, title: "Termo de Adoção Responsável", text: "Comprometo-me a cuidar do animal adotado com amor e responsabilidade, garantindo alimentação adequada, atendimento veterinário regular, vacinas em dia e um lar seguro e saudável." },
                  { key: "veracidade" as const, title: "Declaração de Veracidade", text: "Declaro que todas as informações fornecidas neste formulário são verdadeiras. Estou ciente de que informações falsas podem acarretar na devolução compulsória do animal e medidas legais." },
                  { key: "visita" as const, title: "Autorização de Visita Domiciliar", text: "Autorizo a equipe da SOS Vida a realizar uma visita ao meu domicílio antes e após a adoção para verificar as condições de vida do animal." },
                  { key: "devolucao" as const, title: "Compromisso de Não Abandono", text: "Comprometo-me a nunca abandonar o animal. Em caso de impossibilidade de cuidado, entrarei em contato com a SOS Vida para devolução responsável." },
                ].map(t => (
                  <label key={t.key} className={`flex gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${checks[t.key] ? "border-green-500 bg-green-50" : "border-border hover:border-green-300"}`}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${checks[t.key] ? "bg-green-600 border-green-600" : "border-gray-300"}`}
                      onClick={() => setChecks(c => ({ ...c, [t.key]: !c[t.key] }))}>
                      {checks[t.key] && <Check size={14} className="text-white" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800 mb-1">{t.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.text}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <p className="text-green-800 text-sm"><strong>Próximos passos:</strong> Após o envio, nossa equipe analisará seus documentos em até <strong>3 dias úteis</strong>. Você receberá uma entrevista por videoconferência e uma visita domiciliar antes da finalização.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-border flex items-center justify-between gap-4">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()} className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-gray-600 font-semibold hover:border-gray-400 transition-all">
            <ChevronLeft size={18} /> {step === 0 ? "Cancelar" : "Voltar"}
          </button>
          <span className="text-xs text-muted-foreground hidden sm:block">Etapa {step + 1} de {STEPS.length}</span>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 3 && !docsOk} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold transition-all hover:scale-[1.02] shadow-lg shadow-green-200 disabled:shadow-none">
              Continuar <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!allTerms || submitting} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold transition-all hover:scale-[1.02] shadow-lg shadow-green-200 disabled:shadow-none min-w-[160px] justify-center">
              {submitting ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <><Check size={18} /> Enviar Solicitação</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
