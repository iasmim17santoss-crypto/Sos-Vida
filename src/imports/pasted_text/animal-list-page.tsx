import { useState, useEffect } from "react";
import { PawPrint, Star, Heart, Share2, Plus, Dog, Cat, Bird, Rabbit, Loader2, AlertCircle } from "lucide-react";
import { Animal, ANIMALS as SEED_ANIMALS } from "./data";
import { api } from "./api";
import AdotarForm from "./AdotarForm";
import AbrigoForm from "./AbrigoForm";
import ApadrinharModal from "./ApadrinharModal";
import NovoAnimalModal from "./NovoAnimalModal";

interface Props {
  showToast: (msg: string) => void;
  isAdmin?: boolean;
}

const FILTERS = [
  { key: "todos", label: "Todos", icon: PawPrint },
  { key: "disponivel", label: "Disponíveis", icon: Heart },
  { key: "Cachorro", label: "Cachorros", icon: Dog },
  { key: "Gato", label: "Gatos", icon: Cat },
  { key: "Ave", label: "Aves", icon: Bird },
  { key: "Coelho", label: "Coelhos", icon: Rabbit },
];

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  disponivel: { label: "Disponível", color: "bg-green-500 text-white" },
  tratamento: { label: "Em Tratamento", color: "bg-amber-500 text-white" },
  adotado: { label: "Adotado ♥", color: "bg-gray-500 text-white" },
};

export default function Animais({ showToast, isAdmin }: Props) {
  const [filter, setFilter] = useState("todos");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adopting, setAdopting] = useState<Animal | null>(null);
  const [sheltering, setSheltering] = useState<Animal | null>(null);
  const [sponsoring, setSponsoring] = useState<Animal | null>(null);
  const [showNewAnimal, setShowNewAnimal] = useState(false);
  const [hovered, setHovered] = useState<number | string | null>(null);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.animais.list();
    
      if (data.length === 0) {
        setAnimals(SEED_ANIMALS);
      } else {
        setAnimals(data);
      }
    } catch (e) {
      console.error("Erro ao carregar animais:", e);
      setError("Erro ao carregar animais. Usando dados locais.");
      setAnimals(SEED_ANIMALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAnimals(); }, []);

  const handleDelete = async (id: string | number) => {
    if (!confirm("Remover este animal do sistema?")) return;
    try {
      await api.animais.delete(String(id));
      showToast("Animal removido com sucesso.");
      loadAnimals();
    } catch (e) {
      showToast("Erro ao remover animal.");
    }
  };

  const filtered = animals.filter(a => {
    if (filter === "todos") return true;
    if (filter === "disponivel") return a.status === "disponivel";
    return a.species === filter;
  });

  return (
    <div className="min-h-screen bg-background">
      {adopting && <AdotarForm animal={adopting} onClose={() => setAdopting(null)} onSuccess={msg => { showToast(msg); setAdopting(null); }} />}
      {sheltering && <AbrigoForm animal={sheltering} onClose={() => setSheltering(null)} onSuccess={msg => { showToast(msg); setSheltering(null); }} />}
      {sponsoring && <ApadrinharModal animal={sponsoring} onClose={() => setSponsoring(null)} onSuccess={msg => { showToast(msg); setSponsoring(null); }} />}
      {showNewAnimal && <NovoAnimalModal onClose={() => setShowNewAnimal(false)} onSuccess={() => { showToast("Animal cadastrado com sucesso! 🐾"); setShowNewAnimal(false); loadAnimals(); }} />}

      <div className="relative bg-gradient-to-br from-green-800 via-green-900 to-green-950 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <PawPrint key={i} size={40} className="absolute text-white" style={{ top: `${(i * 17) % 100}%`, left: `${(i * 23) % 100}%`, transform: `rotate(${i * 45}deg)`, opacity: 0.3 }} />
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 px-4 py-2 rounded-full text-sm font-semibold text-green-200 mb-6">
            <PawPrint size={14} /> {animals.filter(a => a.status === "disponivel").length} animais esperando por você
          </div>
          <h1 className="font-['Playfair_Display',serif] font-black text-5xl sm:text-6xl leading-tight mb-4">
            Encontre seu<br /><span className="text-green-400">novo melhor amigo</span>
          </h1>
          <p className="text-green-200 text-lg max-w-xl mx-auto mb-6">Cada animal aqui tem uma história. Adotar é dar um recomeço — e ganhar amor incondicional.</p>
          {isAdmin && (
            <button onClick={() => setShowNewAnimal(true)} className="inline-flex items-center gap-2 bg-white text-green-800 font-bold px-6 py-3 rounded-2xl hover:scale-105 transition-all shadow-xl">
              <Plus size={20} /> Cadastrar Novo Animal
            </button>
          )}
        </div>
      </div>

  
      <div className="bg-white border-b border-border sticky top-16 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${filter === f.key ? "bg-green-600 text-white shadow-md shadow-green-200" : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"}`}>
              <f.icon size={15} />{f.label}
            </button>
          ))}
        </div>
      </div>


      <div className="max-w-6xl mx-auto px-4 py-10">
        {error && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-amber-800">
            <AlertCircle size={18} className="flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 size={40} className="animate-spin text-green-500 mb-4" />
            <p className="font-semibold">Carregando animais...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map(a => (
              <div key={a.id}
                onMouseEnter={() => setHovered(a.id)}
                onMouseLeave={() => setHovered(null)}
                className={`group bg-white rounded-3xl overflow-hidden border border-border transition-all duration-300 ${hovered === a.id ? "shadow-2xl -translate-y-2" : "shadow-sm hover:shadow-lg"}`}>
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img src={a.image} alt={a.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${STATUS_STYLE[a.status]?.color ?? "bg-gray-400 text-white"}`}>
                    {STATUS_STYLE[a.status]?.label ?? a.status}
                  </span>
                  <button onClick={() => showToast("Link copiado! Compartilhe e ajude a encontrar um lar.")}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                    <Share2 size={15} />
                  </button>
                  <div className="absolute bottom-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    {(a.personality ?? []).map((p: string) => (
                      <span key={p} className="bg-white/90 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>

        
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-['Playfair_Display',serif] font-bold text-xl text-gray-900">{a.name}</h3>
                      <p className="text-muted-foreground text-sm">{a.species} · {a.age} · {a.sex} · {a.size}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mb-3">
                    {a.castrated && <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold">✂ Castrado</span>}
                    {a.vaccinated && <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">💉 Vacinado</span>}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">{a.description}</p>

                  {a.status === "disponivel" && (
                    <div className="flex gap-2">
                      <button onClick={() => setAdopting(a)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] shadow-md shadow-green-100 flex items-center justify-center gap-1.5">
                        <PawPrint size={15} /> Adotar
                      </button>
                      <button onClick={() => setSheltering(a)} className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5">
                        🏠 Abrigo
                      </button>
                      <button onClick={() => setSponsoring(a)} className="bg-purple-100 hover:bg-purple-200 text-purple-700 py-2.5 px-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.05]" title="Apadrinhar">
                        <Star size={16} />
                      </button>
                    </div>
                  )}

                  {a.status === "tratamento" && (
                    <div className="space-y-2">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-center">
                        <p className="text-amber-700 text-sm font-semibold">Em tratamento veterinário</p>
                      </div>
                      <button onClick={() => setSponsoring(a)} className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                        <Star size={15} /> Apadrinhar enquanto trata
                      </button>
                    </div>
                  )}

                  {a.status === "adotado" && (
                    <div className="space-y-2">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-center">
                        <p className="text-gray-500 text-sm font-semibold">Já encontrou um lar! 💚</p>
                      </div>
                      {a.apadrinhar && (
                        <button onClick={() => setSponsoring(a)} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] shadow-md shadow-purple-100 flex items-center justify-center gap-2">
                          <Star size={15} /> Apadrinhar animais como {a.name}
                        </button>
                      )}
                    </div>
                  )}

                  {isAdmin && (
                    <button onClick={() => handleDelete(a.id)} className="mt-2 w-full border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-xl text-xs font-semibold transition-all">
                      Remover do sistema
                    </button>
                  )}
                </div>
              </div>
            ))}

      
            {isAdmin && (
              <button onClick={() => setShowNewAnimal(true)} className="border-2 border-dashed border-green-300 hover:border-green-500 rounded-3xl flex flex-col items-center justify-center gap-3 py-16 text-green-600 hover:text-green-700 hover:bg-green-50 transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-all">
                  <Plus size={28} />
                </div>
                <span className="font-bold">Cadastrar Animal</span>
              </button>
            )}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <PawPrint size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold">Nenhum animal encontrado para este filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
}
