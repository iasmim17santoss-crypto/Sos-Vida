import { useState } from "react";
import { Stethoscope, Calendar, Clock, Phone, Award, Users, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Heart, Syringe, Scissors, Building2, Activity, Star } from "lucide-react";

interface Props { showToast: (msg: string) => void; }

const TEAM = [
  { name: "Dra. Mariangela", role: "Clínica Geral e Emergência", crmv: "CRMV-RJ 12.847", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&auto=format", exp: "12 anos de experiência" },
  { name: "Dr. Helvio Geronimo", role: "Cirurgias e Ortopedia", crmv: "CRMV-RJ 9.531", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&auto=format", exp: "8 anos de experiência" },
  { name: "Dra. Spancek", role: "Animais Silvestres", crmv: "CRMV-RJ 15.223", img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&auto=format", exp: "10 anos de experiência" },
  { name: "Dr. Marcelo", role: "Dermatologia e Nutrição", crmv: "CRMV-RJ 11.094", img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&auto=format", exp: "6 anos de experiência" },
];

const SERVICES = [
  { icon: Stethoscope, title: "Consultas", desc: "Consultas clínicas gerais para animais resgatados e cadastrados na ONG.", free: true, obs: "Gratuito para animais resgatados" },
  { icon: Syringe, title: "Vacinação", desc: "V8, V10, Antirrábica, Gripe Felina, FeLV e demais protocolos.", free: true, obs: "Gratuito no protocolo de resgate" },
  { icon: Scissors, title: "Castração", desc: "Castração fêmea (OSH) e macho (orquiectomia) com anestesia geral.", free: true, obs: "Gratuito pelo projeto Castração Solidária" },
  { icon: Activity, title: "Cirurgias", desc: "Cirurgias de emergência, ortopedia e procedimentos eletivos.", free: false, obs: "Custo a combinar conforme caso" },
  { icon: Building2, title: "Internação", desc: "UTI e internação 24h com monitoramento contínuo para casos críticos.", free: false, obs: "Avaliado por caso" },
  { icon: Heart, title: "Emergências 24h", desc: "Plantão noturno e de fins de semana para emergências e urgências.", free: false, obs: "Atendimento prioritário para resgates ativos" },
  { icon: Award, title: "Exames Lab.", desc: "Hemograma, bioquímica, radiografia digital, ultrassonografia e mais.", free: false, obs: "Tabela de preços reduzidos para tutores cadastrados" },
  { icon: Calendar, title: "Carteira Digital", desc: "Caderneta de vacinação digital com QR Code, acessível pelo celular.", free: true, obs: "Para todos os animais atendidos" },
];

const FAQS = [
  { q: "O hospital atende animais que não são da ONG?", a: "Atendemos prioritariamente animais resgatados pela SOS Vida. Tutores cadastrados na ONG também têm acesso a preços reduzidos. Para atendimento geral ao público, temos consultas avulsas com tabela solidária." },
  { q: "Como funciona a castração gratuita?", a: "O Projeto Castração Solidária atende cães e gatos de famílias em situação de vulnerabilidade social. É necessário cadastro prévio, comprovante de renda e agendamento. Vagas limitadas por mês." },
  { q: "O hospital tem UTI?", a: "Sim! Nossa UTI veterinária atende casos críticos com monitoramento 24h, ventilação assistida, fluidoterapia e cuidado intensivo. Disponível para animais resgatados e pacientes internados." },
  { q: "Como agendar uma consulta?", a: "Preencha o formulário de agendamento nesta página, entre em contato pelo WhatsApp (21) 99364-2230 ou pelo e-mail sosvidaipm@gmail.com. Confirmamos em até 24h." },
  { q: "Atendem animais silvestres?", a: "Sim! Temos a Dra. Juliana Mendes especialista em fauna silvestre. Realizamos triagem, tratamento e reabilitação de animais silvestres resgatados para devolução à natureza." },
];

export default function Hospital({ showToast }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast("Agendamento solicitado! Confirmaremos via WhatsApp em até 2h. 🏥");
      setForm({});
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-teal-700 via-teal-800 to-green-900 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 px-4 py-2 rounded-full text-sm font-semibold text-teal-200 mb-6">
                <Stethoscope size={14} /> Aberto 24h para emergências
              </div>
              <h1 className="font-['Playfair_Display',serif] font-black text-5xl sm:text-6xl leading-tight mb-4">
                Hospital Veterinário<br /><span className="text-teal-300">Solidário</span>
              </h1>
              <p className="text-teal-100 text-lg leading-relaxed mb-8 max-w-xl">
                Atendimento especializado para animais resgatados, com equipe veterinária dedicada e estrutura completa. Gratuito para animais da ONG.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <a href="tel:+5521993642230" className="flex items-center gap-2 bg-white text-teal-800 font-bold px-6 py-3 rounded-2xl hover:scale-105 transition-all shadow-lg">
                  <Phone size={18} /> (21) 99364-2230
                </a>
                <span className="flex items-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-6 py-3 rounded-2xl">
                  <Clock size={18} /> Emergências 24h
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {[["4 Veterinários", "Especializados"], ["UTI", "24 horas"], ["2.400+", "Atendimentos/ano"], ["Gratuito", "Para resgates"]].map(([v, l]) => (
                <div key={v} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                  <div className="font-['Playfair_Display',serif] font-bold text-2xl text-white">{v}</div>
                  <div className="text-teal-200 text-xs mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Equipe */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-['Playfair_Display',serif] font-bold text-4xl text-gray-900 mb-3">Nossa Equipe</h2>
            <p className="text-muted-foreground text-lg">Profissionais apaixonados por salvar vidas animais</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map(doc => (
              <div key={doc.name} className="group text-center border border-border rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <img src={doc.img} alt={doc.name} className="w-full h-full rounded-full object-cover border-4 border-teal-100 group-hover:border-teal-400 transition-all" />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle size={14} className="text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-1">{doc.name}</h3>
                <p className="text-teal-700 text-xs font-semibold mb-1">{doc.role}</p>
                <p className="text-muted-foreground text-xs">{doc.crmv}</p>
                <p className="text-muted-foreground text-xs mt-1">{doc.exp}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-teal-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-['Playfair_Display',serif] font-bold text-4xl text-gray-900 mb-3">Serviços</h2>
            <p className="text-muted-foreground text-lg">Atendimento completo do diagnóstico à reabilitação</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map(s => (
              <div key={s.title} className="bg-white rounded-3xl p-5 border border-border hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${s.free ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"} group-hover:scale-110 transition-transform`}>
                  <s.icon size={22} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed mb-3">{s.desc}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${s.free ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {s.free ? <><CheckCircle size={11} /> Gratuito</> : <><AlertCircle size={11} /> {s.obs}</>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agendamento */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-['Playfair_Display',serif] font-bold text-4xl text-gray-900 mb-3">Agendar Atendimento</h2>
            <p className="text-muted-foreground">Preencha o formulário e confirmaremos em até 2 horas úteis.</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-3xl border border-teal-100 p-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Nome do tutor *</label>
                <input value={form.tutor || ""} onChange={e => set("tutor", e.target.value)} placeholder="Seu nome completo" className="w-full border border-border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Telefone / WhatsApp *</label>
                <input value={form.telefone || ""} onChange={e => set("telefone", e.target.value)} placeholder="(21) 99999-9999" className="w-full border border-border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Nome do animal *</label>
                <input value={form.animal || ""} onChange={e => set("animal", e.target.value)} placeholder="Nome do pet" className="w-full border border-border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Espécie / Raça *</label>
                <input value={form.especie || ""} onChange={e => set("especie", e.target.value)} placeholder="Ex: Cão, SRD / Gato, Persa" className="w-full border border-border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Tipo de atendimento *</label>
                <select value={form.tipo || ""} onChange={e => set("tipo", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
                  <option value="">Selecione</option>
                  <option>Consulta geral</option>
                  <option>Vacinação</option>
                  <option>Castração</option>
                  <option>Cirurgia eletiva</option>
                  <option>Emergência</option>
                  <option>Exames laboratoriais</option>
                  <option>Animal silvestre</option>
                  <option>Retorno</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Data preferida *</label>
                <input type="date" value={form.data || ""} onChange={e => set("data", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Período preferido</label>
                <select value={form.periodo || ""} onChange={e => set("periodo", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
                  <option value="">Qualquer horário</option>
                  <option>Manhã (08h–12h)</option>
                  <option>Tarde (13h–17h)</option>
                  <option>Noite (18h–20h)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Animal é resgatado pela ONG?</label>
                <div className="flex gap-2">
                  {["Sim", "Não", "Não sei"].map(v => (
                    <button key={v} onClick={() => set("resgatado", v)} className={`flex-1 py-3 rounded-xl border-2 text-xs font-bold transition-all ${form.resgatado === v ? "border-teal-600 bg-teal-600 text-white" : "border-border text-gray-600 hover:border-teal-400"}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold mb-1.5 text-gray-700">Sintomas ou observações</label>
                <textarea rows={3} value={form.obs || ""} onChange={e => set("obs", e.target.value)} placeholder="Descreva os sintomas, histórico recente ou qualquer informação relevante..." className="w-full border border-border rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none" />
              </div>
            </div>
            <button onClick={handleSubmit} disabled={!form.tutor || !form.animal || !form.tipo || submitting}
              className="mt-6 w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.01] shadow-xl shadow-teal-200 disabled:shadow-none flex items-center justify-center gap-2">
              {submitting ? <span className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" /> : <><Calendar size={20} /> Solicitar Agendamento</>}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-['Playfair_Display',serif] font-bold text-3xl text-gray-900 mb-3">Dúvidas Frequentes</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-teal-50 transition-colors">
                  <span className="font-semibold text-gray-800 text-sm pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={18} className="text-teal-600 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-muted-foreground text-sm leading-relaxed border-t border-border pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
