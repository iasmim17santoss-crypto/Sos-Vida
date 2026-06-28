import { useState } from "react";
import { X, Star, Heart, Check, Camera } from "lucide-react";
import { Animal } from "./data";
import { api } from "./api";

interface Props {
  animal: Animal;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

const PLANS = [
  { value: "30", label: "Essencial", desc: "Ração e cuidados básicos", perks: ["Foto mensal por email", "Relatório de saúde", "Certificado digital"] },
  { value: "60", label: "Amigo", desc: "Cuidado completo e carinho", perks: ["Fotos semanais", "Vídeo mensal", "Relatório de saúde", "Kit de apadrinhamento"], highlight: true },
  { value: "100", label: "Protetor", desc: "Tudo + atenção especial", perks: ["Fotos semanais", "Live mensal com o animal", "Relatório veterinário", "Kit especial + plaquinha com seu nome"], },
];

export default function ApadrinharModal({ animal, onClose, onSuccess }: Props) {
  const [plan, setPlan] = useState("60");
  const [form, setForm] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"plano" | "dados" | "confirmado">("plano");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleConfirm = async () => {
    setStep("confirmado");
    try {
      await api.apadrinhamentos.create({
        animalId: animal.id,
        animalNome: animal.name,
        plano: PLANS.find(p => p.value === plan)?.label,
        valorMensal: Number(plan),
        padrinho: { nome: form.nome, email: form.email, telefone: form.telefone },
      });
    } catch (e) {
      console.error("Erro ao salvar apadrinhamento:", e);
    }
    setTimeout(() => {
      onSuccess(`Você está apadrinhando ${animal.name} por R$ ${plan}/mês! Bem-vindo à família. 💜`);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[950] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="relative overflow-hidden">
          <img src={animal.image} alt={animal.name} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-800/50 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white transition-all"><X size={20} /></button>
          <div className="absolute bottom-4 left-6">
            <p className="text-purple-200 text-xs font-bold uppercase tracking-widest mb-1">Apadrinhamento</p>
            <h2 className="text-3xl font-['Playfair_Display',serif] font-bold text-white">{animal.name}</h2>
            <p className="text-purple-200 text-sm">{animal.species} · {animal.age} · {animal.sex}</p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[65vh]">
          {step === "plano" && (
            <div>
              <p className="text-muted-foreground text-sm mb-5 text-center">
                Ao apadrinhar, você acompanha a evolução de <strong>{animal.name}</strong> de perto, recebe atualizações e sabe que está fazendo diferença.
              </p>
              <div className="space-y-3 mb-6">
                {PLANS.map(p => (
                  <button key={p.value} onClick={() => setPlan(p.value)} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${plan === p.value ? "border-purple-600 bg-purple-50" : "border-border hover:border-purple-300"} ${p.highlight ? "relative" : ""}`}>
                    {p.highlight && <span className="absolute -top-2.5 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">Mais escolhido</span>}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-gray-800 text-base">{p.label}</span>
                        <span className="text-muted-foreground text-xs ml-2">{p.desc}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-black text-2xl text-purple-700">R${p.value}</span>
                        <span className="text-muted-foreground text-xs">/mês</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {p.perks.map(pk => (
                        <span key={pk} className="flex items-center gap-1 text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-semibold">
                          <Check size={10} /> {pk}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep("dados")} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] shadow-xl shadow-purple-200 flex items-center justify-center gap-2">
                <Heart size={20} /> Quero Apadrinhar por R${plan}/mês
              </button>
            </div>
          )}

          {step === "dados" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-1">Seus dados</h3>
                <p className="text-muted-foreground text-sm">Para enviarmos as atualizações e o certificado de apadrinhamento.</p>
              </div>
              <input value={form.nome || ""} onChange={e => set("nome", e.target.value)} placeholder="Nome completo" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
              <input type="email" value={form.email || ""} onChange={e => set("email", e.target.value)} placeholder="Email (para receber as fotos)" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
              <input value={form.telefone || ""} onChange={e => set("telefone", e.target.value)} placeholder="WhatsApp" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-sm text-purple-800">
                <strong>Plano selecionado:</strong> {PLANS.find(p => p.value === plan)?.label} — R${plan}/mês<br />
                Você será cobrado mensalmente. Pode cancelar a qualquer momento.
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("plano")} className="flex-1 py-3 rounded-xl border-2 border-border text-gray-600 font-semibold hover:border-gray-400 transition-all">Voltar</button>
                <button onClick={handleConfirm} disabled={!form.nome || !form.email} className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-purple-200 disabled:shadow-none">
                  Confirmar 💜
                </button>
              </div>
            </div>
          )}

          {step === "confirmado" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Heart size={40} className="text-purple-600" />
              </div>
              <h3 className="font-['Playfair_Display',serif] font-bold text-2xl text-gray-800 mb-2">Obrigado!</h3>
              <p className="text-muted-foreground">Você agora é padrinho(a) de <strong>{animal.name}</strong>. Enviamos um email de confirmação!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
