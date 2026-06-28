import { useState, useRef } from "react";
import { Users, Check, ChevronRight, ChevronLeft, Heart, Star, Shield, Send, Upload, Camera, AlertCircle } from "lucide-react";
import { api } from "./api";

interface Props { showToast: (msg: string) => void; }

const AREAS = [
  { key: "resgate", label: "🚑 Resgate", desc: "Vai a campo resgatar animais em situação de risco" },
  { key: "transporte", label: "🚗 Transporte", desc: "Leva animais ao hospital, adotantes e eventos" },
  { key: "redes", label: "📱 Redes Sociais", desc: "Cria conteúdo, posts de adoção e campanhas" },
  { key: "eventos", label: "🎉 Eventos", desc: "Organiza e participa de feiras de adoção" },
  { key: "veterinario", label: "🩺 Veterinário/Aux.", desc: "Auxilia no hospital com procedimentos e cuidados" },
  { key: "lar", label: "🏠 Lar Temporário", desc: "Acolhe animais em casa enquanto aguardam adoção" },
  { key: "marketing", label: "🎨 Design/Marketing", desc: "Cria materiais gráficos e campanhas visuais" },
  { key: "juridico", label: "⚖️ Jurídico", desc: "Assessoria legal para casos de maus-tratos e processos" },
  { key: "fotografia", label: "📷 Fotografia", desc: "Registra animais para posts e relatórios" },
  { key: "ti", label: "💻 TI/Tecnologia", desc: "Suporte técnico ao sistema e redes da ONG" },
];

const MOTIVATIONS = [
  "Amo animais e quero fazer a diferença",
  "Quero ganhar experiência na área animal",
  "Busco trabalho voluntário para crescimento pessoal",
  "Sofri perda de um pet e quero ajudar outros",
  "Fui adotado(a) pela ONG e quero retribuir",
  "Indicação de amigos/família que já voluntariam",
];

const STEPS_LABEL = ["Sobre Você", "Motivação", "Disponibilidade", "Documentos"];

export default function Voluntariado({ showToast }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [areas, setAreas] = useState<string[]>([]);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [docPhoto, setDocPhoto] = useState<string | null>(null);
  const [checks, setChecks] = useState({ termos: false, codigo: false });
  const [submitting, setSubmitting] = useState(false);
  const profileRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const toggle = <T,>(arr: T[], v: T, setter: (a: T[]) => void) =>
    setter(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setter(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.voluntarios.create({
        ...form,
        areas,
        motivations,
        disponibilidade,
        temFoto: !!profilePhoto,
        temDocumento: !!docPhoto,
      });
    } catch (e) {
      console.error("Erro ao salvar voluntário:", e);
    }
    showToast("Cadastro de voluntário enviado! Nossa equipe entrará em contato em até 3 dias. 💜");
    setStep(0); setForm({}); setAreas([]); setMotivations([]);
    setDisponibilidade([]); setProfilePhoto(null); setDocPhoto(null);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-purple-700 via-purple-800 to-purple-950 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 px-4 py-2 rounded-full text-sm font-semibold text-purple-200 mb-6">
              <Heart size={14} /> Mais de 180 voluntários ativos
            </div>
            <h1 className="font-['Playfair_Display',serif] font-black text-5xl sm:text-6xl leading-tight mb-4">
              Seja um<br /><span className="text-purple-300">Voluntário</span>
            </h1>
            <p className="text-purple-100 text-lg leading-relaxed mb-6">
              Cada hora doada salva vidas. Seja você um veterinário, motorista, fotógrafo ou simplesmente alguém que ama animais — há um espaço para você aqui.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[["180+", "Voluntários ativos"], ["12", "Áreas de atuação"], ["4h/mês", "Mínimo de dedicação"], ["Treinamento", "Gratuito para todos"]].map(([v, l]) => (
                <div key={v} className="bg-white/10 border border-white/20 rounded-2xl p-3 text-center">
                  <p className="font-black text-xl text-white">{v}</p>
                  <p className="text-purple-200 text-xs">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <img src="https://images.unsplash.com/photo-1522543558187-768b6df7c25c?w=500&h=400&fit=crop&auto=format" alt="Voluntários" className="rounded-3xl object-cover h-80 w-full shadow-2xl hidden lg:block" />
        </div>
      </div>

      {/* Formulário */}
      <div className="max-w-3xl mx-auto px-4 py-14">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS_LABEL.map((l, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 text-xs font-bold ${i <= step ? "text-purple-700" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < step ? "bg-purple-600 border-purple-600 text-white" : i === step ? "bg-white border-purple-600 text-purple-700" : "bg-white border-gray-200 text-gray-400"}`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className="hidden sm:block">{l}</span>
              </div>
              {i < STEPS_LABEL.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${i < step ? "bg-purple-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-8">
            {/* STEP 0 — Sobre você */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Dados Pessoais</h2>
                  <p className="text-muted-foreground text-sm">Para nos conhecermos melhor.</p>
                </div>
                {/* Foto */}
                <div className="flex flex-col items-center mb-2">
                  <div onClick={() => profileRef.current?.click()} className="w-24 h-24 rounded-full border-4 border-purple-200 hover:border-purple-500 overflow-hidden bg-purple-50 flex items-center justify-center mb-2 cursor-pointer transition-all">
                    {profilePhoto ? <img src={profilePhoto} alt="perfil" className="w-full h-full object-cover" /> : <Camera size={36} className="text-purple-300" />}
                  </div>
                  <button onClick={() => profileRef.current?.click()} className="text-xs text-purple-600 font-semibold hover:text-purple-800">Adicionar foto</button>
                  <input ref={profileRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e, setProfilePhoto)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">Nome completo *</label>
                    <input value={form.nome || ""} onChange={e => set("nome", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">CPF *</label>
                    <input value={form.cpf || ""} onChange={e => set("cpf", e.target.value)} placeholder="000.000.000-00" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">Data de nascimento *</label>
                    <input type="date" value={form.nascimento || ""} onChange={e => set("nascimento", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">Telefone / WhatsApp *</label>
                    <input value={form.telefone || ""} onChange={e => set("telefone", e.target.value)} placeholder="(21) 99999-9999" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">Email *</label>
                    <input type="email" value={form.email || ""} onChange={e => set("email", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">Profissão</label>
                    <input value={form.profissao || ""} onChange={e => set("profissao", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">Cidade / Bairro *</label>
                    <input value={form.cidade || ""} onChange={e => set("cidade", e.target.value)} placeholder="Ex: Rio de Janeiro – Bonsucesso" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Áreas de atuação desejadas * (escolha 1 ou mais)</label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {AREAS.map(a => (
                      <button key={a.key} onClick={() => toggle(areas, a.key, setAreas)}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${areas.includes(a.key) ? "border-purple-600 bg-purple-50" : "border-border hover:border-purple-300"}`}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${areas.includes(a.key) ? "bg-purple-600 border-purple-600" : "border-gray-300"}`}>
                          {areas.includes(a.key) && <Check size={12} className="text-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{a.label}</p>
                          <p className="text-xs text-muted-foreground">{a.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1 — Motivação */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Por que quer ser voluntário?</h2>
                  <p className="text-muted-foreground text-sm">Queremos entender sua motivação para direcionar melhor seu trabalho.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Selecione os que se aplicam:</label>
                  <div className="space-y-2">
                    {MOTIVATIONS.map(m => (
                      <button key={m} onClick={() => toggle(motivations, m, setMotivations)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${motivations.includes(m) ? "border-purple-600 bg-purple-50" : "border-border hover:border-purple-300"}`}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${motivations.includes(m) ? "bg-purple-600 border-purple-600" : "border-gray-300"}`}>
                          {motivations.includes(m) && <Check size={12} className="text-white" />}
                        </div>
                        <span className="text-sm text-gray-700">{m}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Conte com suas palavras *</label>
                  <textarea rows={4} value={form.motivacao || ""} onChange={e => set("motivacao", e.target.value)}
                    placeholder="O que te move a querer voluntariar? Qual experiência você tem ou quer desenvolver? Como imagina sua contribuição?"
                    className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Experiência anterior com animais</label>
                  <select value={form.experiencia || ""} onChange={e => set("experiencia", e.target.value)}
                    className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                    <option value="">Selecione</option>
                    <option>Nenhuma — estou começando</option>
                    <option>Tenho pet em casa</option>
                    <option>Já fui voluntário em outra ONG</option>
                    <option>Trabalho profissionalmente na área</option>
                    <option>Já fiz resgates informais</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Habilidades especiais (opcional)</label>
                  <input value={form.habilidades || ""} onChange={e => set("habilidades", e.target.value)}
                    placeholder="Ex: CNH cat. B, Primeiros socorros, Inglês, Edição de vídeo..."
                    className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                </div>
              </div>
            )}

            {/* STEP 2 — Disponibilidade */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Disponibilidade</h2>
                  <p className="text-muted-foreground text-sm">Selecione os períodos em que pode contribuir.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Horários disponíveis *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["☀️ Manhã (seg-sex)", "🌤️ Tarde (seg-sex)", "🌙 Noite (seg-sex)", "📅 Sábados", "📅 Domingos", "🗓️ Feriados"].map(p => (
                      <button key={p} onClick={() => toggle(disponibilidade, p, setDisponibilidade)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm transition-all ${disponibilidade.includes(p) ? "border-purple-600 bg-purple-50 text-purple-800 font-semibold" : "border-border text-gray-700 hover:border-purple-300"}`}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${disponibilidade.includes(p) ? "bg-purple-600 border-purple-600" : "border-gray-300"}`}>
                          {disponibilidade.includes(p) && <Check size={10} className="text-white" />}
                        </div>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Horas disponíveis por mês *</label>
                  <select value={form.horas || ""} onChange={e => set("horas", e.target.value)}
                    className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                    <option value="">Selecione</option>
                    <option>4 a 8 horas</option>
                    <option>8 a 16 horas</option>
                    <option>16 a 30 horas</option>
                    <option>Mais de 30 horas (semi-integral)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Tem veículo próprio?</label>
                  <div className="flex gap-3">
                    {["Não", "Sim, carro", "Sim, moto", "Sim, ambos"].map(v => (
                      <button key={v} onClick={() => set("veiculo", v)}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${form.veiculo === v ? "border-purple-600 bg-purple-600 text-white" : "border-border text-gray-600 hover:border-purple-400"}`}>{v}</button>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">Contato de emergência *</label>
                    <input value={form.emergenciaNome || ""} onChange={e => set("emergenciaNome", e.target.value)}
                      placeholder="Nome do contato" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5 text-gray-700">Telefone do contato *</label>
                    <input value={form.emergenciaTel || ""} onChange={e => set("emergenciaTel", e.target.value)}
                      placeholder="(21) 99999-9999" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">Tem restrições físicas ou de saúde que possam limitar atividades?</label>
                  <input value={form.restricoes || ""} onChange={e => set("restricoes", e.target.value)}
                    placeholder="Ex: Alergias, lesões, limitações de locomoção... (ou deixe em branco se não houver)"
                    className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
                </div>
              </div>
            )}

            {/* STEP 3 — Documentos e termos */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Documentos e Compromisso</h2>
                  <p className="text-muted-foreground text-sm">Última etapa! Envie sua foto e um documento para concluir.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className={`border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all text-center ${profilePhoto ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-400 bg-gray-50"}`}
                    onClick={() => profileRef.current?.click()}>
                    {profilePhoto ? (
                      <><img src={profilePhoto} alt="foto" className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-4 border-purple-200" />
                      <p className="text-purple-700 text-xs font-bold flex items-center justify-center gap-1"><Check size={13} /> Foto enviada</p></>
                    ) : (
                      <><Camera size={28} className="mx-auto text-gray-400 mb-2" />
                      <p className="font-bold text-sm text-gray-700">Foto pessoal *</p>
                      <p className="text-xs text-muted-foreground">Foto de rosto nítida</p></>
                    )}
                    <input ref={profileRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e, setProfilePhoto)} />
                  </div>
                  <div className={`border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all text-center ${docPhoto ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-400 bg-gray-50"}`}
                    onClick={() => docRef.current?.click()}>
                    {docPhoto ? (
                      <><img src={docPhoto} alt="doc" className="h-16 object-contain mx-auto mb-2 rounded" />
                      <p className="text-purple-700 text-xs font-bold flex items-center justify-center gap-1"><Check size={13} /> Documento enviado</p></>
                    ) : (
                      <><Upload size={28} className="mx-auto text-gray-400 mb-2" />
                      <p className="font-bold text-sm text-gray-700">RG ou CNH *</p>
                      <p className="text-xs text-muted-foreground">Frente do documento</p></>
                    )}
                    <input ref={docRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => handlePhoto(e, setDocPhoto)} />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-700">Compromissos do voluntário:</p>
                  {[
                    { key: "termos" as const, t: "Aceito os Termos de Voluntariado da SOS Vida, incluindo sigilo das informações dos adotantes, responsabilidade com os animais e uso de uniforme/identificação em campo." },
                    { key: "codigo" as const, t: "Li e aceito o Código de Conduta da ONG, comprometendo-me a agir com respeito, ética e responsabilidade em todas as atividades." },
                  ].map(c => (
                    <label key={c.key} onClick={() => setChecks(ch => ({ ...ch, [c.key]: !ch[c.key] }))}
                      className={`flex gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${checks[c.key] ? "border-purple-600 bg-purple-50" : "border-border hover:border-purple-300"}`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${checks[c.key] ? "bg-purple-600 border-purple-600" : "border-gray-300"}`}>
                        {checks[c.key] && <Check size={12} className="text-white" />}
                      </div>
                      <p className="text-xs text-gray-700">{c.t}</p>
                    </label>
                  ))}
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-sm text-purple-800">
                  <p className="font-bold mb-1">O que acontece depois?</p>
                  <ul className="space-y-1 text-xs">
                    <li>✓ Nossa equipe analisará seu cadastro em até 3 dias úteis</li>
                    <li>✓ Você receberá uma entrevista virtual de 20 minutos</li>
                    <li>✓ Treinamento online e presencial gratuito</li>
                    <li>✓ Recebimento de crachá e uniforme da ONG</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer navegação */}
          <div className="px-8 py-5 bg-gray-50 border-t border-border flex items-center justify-between">
            <button onClick={() => step > 0 ? setStep(s => s - 1) : null} disabled={step === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-gray-600 font-semibold hover:border-gray-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft size={18} /> Voltar
            </button>
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={(step === 0 && (!form.nome || areas.length === 0)) || (step === 1 && !form.motivacao) || (step === 2 && disponibilidade.length === 0)}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold transition-all hover:scale-[1.02] shadow-lg shadow-purple-200 disabled:shadow-none">
                Continuar <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!profilePhoto || !docPhoto || !checks.termos || !checks.codigo || submitting}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold transition-all hover:scale-[1.02] shadow-lg shadow-purple-200 disabled:shadow-none min-w-[160px] justify-center">
                {submitting ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <><Send size={18} /> Enviar Cadastro</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
