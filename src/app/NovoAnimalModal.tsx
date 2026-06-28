import { useState, useRef } from "react";
import { X, Upload, Check, Loader2 } from "lucide-react";
import { api } from "./api";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export default function NovoAnimalModal({ onClose, onSuccess, initialData }: Props) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    species: initialData?.species ?? "Cachorro",
    age: initialData?.age ?? "",
    size: initialData?.size ?? "Médio",
    sex: initialData?.sex ?? "Macho",
    castrated: initialData?.castrated ?? false,
    vaccinated: initialData?.vaccinated ?? false,
    status: initialData?.status ?? "disponivel",
    description: initialData?.description ?? "",
    personality: initialData?.personality?.join(", ") ?? "",
    apadrinhar: initialData?.apadrinhar ?? false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.age || !form.description) {
      setError("Preencha nome, idade e descrição.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let imageUrl = initialData?.image ?? "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=380&fit=crop&auto=format";
      if (imageFile) {
        imageUrl = await api.animais.uploadFoto(imageFile);
      } else if (imagePreview && imagePreview.startsWith("http")) {
        imageUrl = imagePreview;
      }

      const payload = {
        ...form,
        image: imageUrl,
        personality: form.personality.split(",").map((s: string) => s.trim()).filter(Boolean),
      };

      if (initialData?.id) {
        await api.animais.update(String(initialData.id), payload);
      } else {
        await api.animais.create(payload);
      }
      onSuccess();
    } catch (e: any) {
      console.error("Erro ao salvar animal:", e);
      setError(e.message ?? "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[960] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-4 overflow-hidden">
        <div className="bg-gradient-to-r from-green-700 to-green-900 px-7 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-['Playfair_Display',serif] font-bold text-white">
            {initialData ? "Editar Animal" : "Cadastrar Novo Animal"}
          </h2>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-all"><X size={20} /></button>
        </div>

        <div className="p-7 overflow-y-auto max-h-[75vh] space-y-5">
          {/* Foto */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">Foto do Animal</label>
            <div onClick={() => fileRef.current?.click()} className={`border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all ${imagePreview ? "border-green-400" : "border-gray-300 hover:border-green-400"}`}>
              {imagePreview ? (
                <div className="relative h-48">
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Trocar foto</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <Upload size={28} className="text-green-400" />
                  <span className="font-semibold text-sm">Clique para enviar foto</span>
                  <span className="text-xs">JPG, PNG até 10MB</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            {!imageFile && (
              <div className="mt-2">
                <input value={imagePreview.startsWith("http") ? imagePreview : ""} onChange={e => setImagePreview(e.target.value)}
                  placeholder="Ou cole uma URL de imagem" className="w-full border border-border rounded-xl px-3 py-2 text-xs bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold mb-1.5 text-gray-700">Nome *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nome do animal" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-gray-700">Espécie *</label>
              <select value={form.species} onChange={e => set("species", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                <option>Cachorro</option><option>Gato</option><option>Ave</option><option>Coelho</option><option>Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-gray-700">Idade *</label>
              <input value={form.age} onChange={e => set("age", e.target.value)} placeholder="Ex: 2 anos, 4 meses" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-gray-700">Porte</label>
              <select value={form.size} onChange={e => set("size", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                <option>Pequeno</option><option>Médio</option><option>Grande</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-gray-700">Sexo</label>
              <select value={form.sex} onChange={e => set("sex", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                <option>Macho</option><option>Fêmea</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1.5 text-gray-700">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
                <option value="disponivel">Disponível</option>
                <option value="tratamento">Em Tratamento</option>
                <option value="adotado">Adotado</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold mb-2 text-gray-700">Características</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[["castrated", "✂ Castrado"], ["vaccinated", "💉 Vacinado"], ["apadrinhar", "⭐ Apadrinhar"]].map(([k, l]) => (
                  <label key={String(k)} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm ${(form as any)[k as string] ? "border-green-500 bg-green-50 text-green-800 font-semibold" : "border-border text-gray-600 hover:border-green-300"}`}
                    onClick={() => set(k as string, !(form as any)[k as string])}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${(form as any)[k as string] ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                      {(form as any)[k as string] && <Check size={10} className="text-white" />}
                    </div>
                    {l}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold mb-1.5 text-gray-700">Personalidade (separada por vírgula)</label>
              <input value={form.personality} onChange={e => set("personality", e.target.value)} placeholder="Ex: Dócil, Brincalhão, Sociável" className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold mb-1.5 text-gray-700">Descrição *</label>
              <textarea rows={4} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Conte a história e características do animal..." className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <X size={16} /> {error}
            </div>
          )}
        </div>

        <div className="px-7 py-5 bg-gray-50 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-xl border-2 border-border text-gray-600 font-semibold hover:border-gray-400 transition-all">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-7 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold transition-all hover:scale-[1.02] shadow-lg shadow-green-200 disabled:shadow-none min-w-[140px] justify-center">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> {initialData ? "Salvar" : "Cadastrar"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
