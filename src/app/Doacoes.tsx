import { useState, useEffect } from "react";
import { Heart, CreditCard, QrCode, FileText, Check, Copy, AlertCircle, Lock, ChevronRight } from "lucide-react";
import { api } from "./api";

interface Props { showToast: (msg: string) => void; }

type Method = "pix" | "cartao" | "boleto";
type PayStep = "valor" | "pagamento" | "processando" | "aprovado";

const CAUSES = [
  { key: "resgate", label: "🐾 Resgate Animal", desc: "Equipes de resgate, equipamentos e transporte" },
  { key: "hospital", label: "🏥 Hospital Veterinário", desc: "Medicamentos, cirurgias e internações" },
  { key: "silvestre", label: "🦜 Animais Silvestres", desc: "Reabilitação e soltura monitorada" },
  { key: "castracao", label: "✂️ Castração Solidária", desc: "Castrações gratuitas para famílias carentes" },
  { key: "alimentacao", label: "🍖 Alimentação", desc: "Ração e suplementos para os abrigos" },
];

function CardForm({ value, cause, onApprove }: { value: string; cause: string; onApprove: () => void }) {
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [installments, setInstallments] = useState("1");
  const [flipped, setFlipped] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fmt = (v: string) => v.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19);
  const fmtExp = (v: string) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 5);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(onApprove, 2500);
  };

  const filled = card.number.replace(/\s/g, "").length === 16 && card.name.length > 2 && card.expiry.length === 5 && card.cvv.length >= 3;

  return (
    <div className="space-y-5">
      {/* Card Visual */}
      <div className="flex justify-center mb-2">
        <div className={`relative w-72 h-44 transition-transform duration-500 ${flipped ? "[transform:rotateY(180deg)]" : ""}`} style={{ perspective: "1000px", transformStyle: "preserve-3d" }}>
          {/* Front */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-700 via-green-800 to-teal-900 p-5 flex flex-col justify-between shadow-2xl" style={{ backfaceVisibility: "hidden" }}>
            <div className="flex justify-between items-start">
              <div className="w-10 h-7 bg-yellow-400 rounded opacity-90" />
              <span className="text-white/60 text-xs font-mono">SOS VIDA</span>
            </div>
            <div>
              <p className="text-white font-mono text-lg tracking-widest mb-3">
                {card.number ? card.number.padEnd(19, "·").replace(/(.{4})/g, "$1 ").trim() : "•••• •••• •••• ••••"}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/50 text-xs uppercase">Titular</p>
                  <p className="text-white font-semibold text-sm uppercase">{card.name || "SEU NOME"}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-xs uppercase">Validade</p>
                  <p className="text-white font-semibold text-sm">{card.expiry || "MM/AA"}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Back */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col justify-center shadow-2xl" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <div className="w-full h-10 bg-gray-600 mb-4" />
            <div className="px-5 flex justify-end items-center">
              <div className="bg-white rounded px-4 py-2 flex items-center gap-2">
                <span className="text-gray-500 text-xs">CVV</span>
                <span className="text-gray-800 font-mono font-bold text-sm tracking-widest">{card.cvv || "•••"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1.5 text-gray-700">Número do cartão *</label>
        <input value={card.number} onChange={e => setCard(c => ({ ...c, number: fmt(e.target.value) }))}
          placeholder="0000 0000 0000 0000" maxLength={19}
          className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm" />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1.5 text-gray-700">Nome no cartão *</label>
        <input value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))}
          placeholder="COMO APARECE NO CARTÃO"
          className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 uppercase text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1.5 text-gray-700">Validade *</label>
          <input value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: fmtExp(e.target.value) }))}
            placeholder="MM/AA" maxLength={5}
            className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1.5 text-gray-700">CVV *</label>
          <input value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
            onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)}
            placeholder="•••" maxLength={4}
            className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold mb-1.5 text-gray-700">Parcelamento</label>
        <select value={installments} onChange={e => setInstallments(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
          <option value="1">1x de R${value} sem juros</option>
          <option value="2">2x de R${(Number(value) / 2).toFixed(2)} sem juros</option>
          <option value="3">3x de R${(Number(value) / 3).toFixed(2)} sem juros</option>
        </select>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 rounded-xl p-3">
        <Lock size={14} className="text-green-600 flex-shrink-0" />
        <span>Pagamento 100% seguro · Criptografia SSL · Não armazenamos dados do cartão</span>
      </div>
      <button onClick={handlePay} disabled={!filled || processing}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.01] shadow-xl shadow-green-200 disabled:shadow-none flex items-center justify-center gap-2 min-h-[56px]">
        {processing ? (
          <><span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> Processando pagamento...</>
        ) : (
          <><Lock size={18} /> Pagar R${value}</>
        )}
      </button>
    </div>
  );
}

function PixPayment({ value, onPay }: { value: string; onPay: () => void }) {
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState(899);
  const key = "sosvidaipm@gmail.com";

  useEffect(() => {
    const t = setInterval(() => setTime(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(time / 60)).padStart(2, "0");
  const ss = String(time % 60).padStart(2, "0");

  const copy = () => { navigator.clipboard.writeText(key).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-5 text-center">
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
        <p className="text-green-800 font-semibold text-sm">Expira em <span className="font-mono text-lg font-black text-green-700">{mm}:{ss}</span></p>
      </div>
      {/* Fake QR Code */}
      <div className="flex justify-center">
        <div className="w-44 h-44 bg-white border-2 border-gray-200 rounded-2xl p-3 shadow-inner">
          <div className="w-full h-full grid grid-cols-7 gap-0.5">
            {Array.from({ length: 49 }).map((_, i) => (
              <div key={i} className={`rounded-sm ${[0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48,8,10,15,17,22,24,29,31,36,38,11,12,18,19,25,26,32,33,39,40,9,16,23,30,37].includes(i) ? "bg-gray-900" : "bg-white"}`} />
            ))}
          </div>
        </div>
      </div>
      <div>
        <p className="text-muted-foreground text-sm mb-2">Ou copie a chave PIX:</p>
        <div className="flex items-center gap-2 bg-gray-50 border border-border rounded-xl px-4 py-3">
          <span className="flex-1 text-sm font-mono text-gray-700 text-left truncate">{key}</span>
          <button onClick={copy} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${copied ? "bg-green-100 text-green-700" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}>
            {copied ? <><Check size={13} /> Copiado!</> : <><Copy size={13} /> Copiar</>}
          </button>
        </div>
      </div>
      <div className="text-left bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
        <p className="font-bold mb-2">Como pagar:</p>
        <ol className="space-y-1 text-sm">
          <li>1. Abra o app do seu banco</li>
          <li>2. Acesse a área PIX</li>
          <li>3. Escaneie o QR Code ou cole a chave</li>
          <li>4. Confirme o valor de <strong>R${value}</strong></li>
          <li>5. Aguarde a confirmação automática</li>
        </ol>
      </div>
      <button onClick={onPay} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.01] shadow-xl shadow-green-200">
        ✓ Já realizei o pagamento
      </button>
    </div>
  );
}

function BoletoPayment({ value, onPay }: { value: string; onPay: () => void }) {
  const [copied, setCopied] = useState(false);
  const barcode = "34191.75501 00000.000007 00000.000000 1 00010000" + value.padStart(5, "0");
  const copy = () => { navigator.clipboard.writeText(barcode).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-5">
      <div className="bg-gray-50 border border-border rounded-2xl p-5">
        <p className="text-xs text-muted-foreground mb-3 text-center font-semibold uppercase tracking-wider">Código de Barras</p>
        {/* Fake barcode */}
        <div className="flex justify-center mb-4">
          <div className="flex gap-px h-14">
            {Array.from({ length: 80 }).map((_, i) => (
              <div key={i} style={{ width: [1,2,1,3,1,2,1,1,2,3][i % 10] + "px" }} className={`${i % 3 === 0 ? "bg-gray-900" : i % 7 === 0 ? "bg-gray-800" : "bg-gray-900"} h-full`} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2">
          <span className="flex-1 text-xs font-mono text-gray-600 truncate">{barcode}</span>
          <button onClick={copy} className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all flex-shrink-0 ${copied ? "bg-green-100 text-green-700" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
            {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Valor</p>
          <p className="font-bold text-gray-800">R$ {value}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Vencimento</p>
          <p className="font-bold text-gray-800">3 dias úteis</p>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <p className="font-bold mb-1">⚠️ Importante:</p>
        <ul className="space-y-1 text-xs">
          <li>• Boleto compensa em até 2 dias úteis após o pagamento</li>
          <li>• Pague pelo app do banco, lotérica ou internet banking</li>
          <li>• Não pague em caixas automáticos (pode não identificar)</li>
        </ul>
      </div>
      <button onClick={onPay} className="w-full bg-gray-800 hover:bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.01] shadow-xl flex items-center justify-center gap-2">
        <FileText size={20} /> Baixar Boleto PDF
      </button>
    </div>
  );
}

export default function Doacoes({ showToast }: Props) {
  const [valor, setValor] = useState("50");
  const [customValor, setCustomValor] = useState("");
  const [causa, setCausa] = useState("resgate");
  const [method, setMethod] = useState<Method>("pix");
  const [payStep, setPayStep] = useState<PayStep>("valor");
  const [freq, setFreq] = useState("unica");

  const finalValue = customValor || valor;

  const handleApprove = async () => {
    setPayStep("aprovado");
    try {
      await api.doacoes.create({
        valor: Number(finalValue),
        causa,
        frequencia: freq,
        metodo: method,
      });
    } catch (e) {
      console.error("Erro ao salvar doação:", e);
    }
    showToast(`Doação de R$${finalValue} confirmada! Obrigado por salvar vidas. 💚`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-red-700 via-red-800 to-red-950 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Heart key={i} size={80} className="absolute" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, transform: `rotate(${Math.random() * 360}deg)` }} />
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <Heart size={56} className="mx-auto mb-5 text-red-300" />
          <h1 className="font-['Playfair_Display',serif] font-black text-5xl sm:text-6xl mb-4">Faça uma Doação</h1>
          <p className="text-red-200 text-xl max-w-xl mx-auto">Cada real transforma uma vida. Transparência total sobre o uso das doações.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {payStep === "aprovado" ? (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={48} className="text-green-600" />
            </div>
            <h2 className="font-['Playfair_Display',serif] font-bold text-3xl text-gray-900 mb-3">Doação Confirmada!</h2>
            <p className="text-muted-foreground mb-2">Sua doação de <strong className="text-green-700">R${finalValue}</strong> foi processada.</p>
            <p className="text-muted-foreground mb-8">Você receberá um certificado de doação por email com todos os detalhes.</p>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-800 mb-6">
              <p><strong>Causa:</strong> {CAUSES.find(c => c.key === causa)?.label}</p>
              <p className="mt-1"><strong>Protocolo:</strong> DOA-{Date.now().toString().slice(-8)}</p>
            </div>
            <button onClick={() => { setPayStep("valor"); setValor("50"); setCustomValor(""); }} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-lg shadow-green-200">
              Fazer outra doação
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Left — escolhas */}
            <div className={`space-y-7 ${payStep !== "valor" ? "opacity-50 pointer-events-none" : ""}`}>
              {/* Valor */}
              <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                <h2 className="font-['Playfair_Display',serif] font-bold text-2xl text-gray-800 mb-5">Escolha o valor</h2>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {["20", "50", "100", "200"].map(v => (
                    <button key={v} onClick={() => { setValor(v); setCustomValor(""); }}
                      className={`py-3.5 rounded-2xl font-black text-lg border-2 transition-all ${valor === v && !customValor ? "border-red-600 bg-red-600 text-white shadow-lg shadow-red-200" : "border-border text-gray-700 hover:border-red-400 hover:text-red-700"}`}>
                      R${v}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">R$</span>
                  <input value={customValor} onChange={e => { setCustomValor(e.target.value.replace(/\D/g, "")); setValor(""); }}
                    placeholder="Outro valor" className="w-full border border-border rounded-xl pl-10 pr-4 py-3 bg-input-background focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                </div>
              </div>

              {/* Frequência */}
              <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                <h2 className="font-['Playfair_Display',serif] font-bold text-2xl text-gray-800 mb-4">Frequência</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[["unica", "Única", "Uma vez"], ["mensal", "Mensal", "Todo mês"], ["anual", "Anual", "Uma vez/ano"]].map(([k, l, d]) => (
                    <button key={k} onClick={() => setFreq(k)} className={`p-4 rounded-2xl border-2 transition-all text-left ${freq === k ? "border-red-500 bg-red-50" : "border-border hover:border-red-300"}`}>
                      <p className={`font-bold text-sm ${freq === k ? "text-red-800" : "text-gray-700"}`}>{l}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{d}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Causa */}
              <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                <h2 className="font-['Playfair_Display',serif] font-bold text-2xl text-gray-800 mb-4">Escolha a causa</h2>
                <div className="space-y-2">
                  {CAUSES.map(c => (
                    <button key={c.key} onClick={() => setCausa(c.key)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all ${causa === c.key ? "border-red-500 bg-red-50" : "border-border hover:border-red-300"}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${causa === c.key ? "bg-red-600 border-red-600" : "border-gray-300"}`}>
                        {causa === c.key && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${causa === c.key ? "text-red-800" : "text-gray-700"}`}>{c.label}</p>
                        <p className="text-xs text-muted-foreground">{c.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — pagamento */}
            <div className="bg-white rounded-3xl border border-border p-6 shadow-sm h-fit sticky top-24">
              {payStep === "valor" && (
                <>
                  <h2 className="font-['Playfair_Display',serif] font-bold text-2xl text-gray-800 mb-2">Forma de Pagamento</h2>
                  <div className="bg-gray-50 rounded-2xl px-4 py-3 mb-5 flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Total a doar:</span>
                    <span className="font-black text-2xl text-green-700">R${finalValue || "0"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {[["pix", "PIX", "⚡"], ["cartao", "Cartão", "💳"], ["boleto", "Boleto", "📄"]].map(([k, l, ic]) => (
                      <button key={k} onClick={() => setMethod(k as Method)}
                        className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 text-sm font-bold transition-all ${method === k ? "border-green-600 bg-green-600 text-white" : "border-border text-gray-600 hover:border-green-400"}`}>
                        <span className="text-xl">{ic}</span>{l}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setPayStep("pagamento")} disabled={!finalValue || Number(finalValue) < 5}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all hover:scale-[1.01] shadow-xl shadow-red-200 disabled:shadow-none flex items-center justify-center gap-2">
                    Continuar <ChevronRight size={20} />
                  </button>
                  {Number(finalValue) < 5 && finalValue && <p className="text-xs text-red-500 text-center mt-2">Valor mínimo: R$ 5,00</p>}
                </>
              )}

              {payStep === "pagamento" && (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-['Playfair_Display',serif] font-bold text-xl text-gray-800">
                      {method === "pix" ? "Pagar com PIX" : method === "cartao" ? "Pagar com Cartão" : "Gerar Boleto"}
                    </h2>
                    <button onClick={() => setPayStep("valor")} className="text-xs text-muted-foreground hover:text-gray-700 underline">Voltar</button>
                  </div>
                  <div className="bg-green-50 rounded-xl px-4 py-2.5 mb-5 flex items-center justify-between">
                    <span className="text-sm text-green-700">{CAUSES.find(c => c.key === causa)?.label}</span>
                    <span className="font-black text-xl text-green-800">R${finalValue}</span>
                  </div>
                  {method === "pix" && <PixPayment value={finalValue} onPay={handleApprove} />}
                  {method === "cartao" && <CardForm value={finalValue} cause={causa} onApprove={handleApprove} />}
                  {method === "boleto" && <BoletoPayment value={finalValue} onPay={handleApprove} />}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Itens */}
      <div className="bg-white border-t border-border py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-['Playfair_Display',serif] font-bold text-3xl text-gray-900 mb-8 text-center">Doação de Itens</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[["🍖 Ração", "Qualquer marca e porte, seca ou úmida"],["💊 Medicamentos", "Antibióticos, antiparasitários, vitaminas"],["🛏️ Cobertores e Camas", "Para proteger do frio nos abrigos"],["🧸 Brinquedos", "Enriquecimento ambiental e bem-estar"],["🧴 Produtos de Limpeza", "Desinfetante, álcool, sabão neutro"],["🩺 Material Veterinário", "Seringas, ataduras, soro fisiológico"]].map(([item, desc]) => (
              <div key={String(item)} className="border border-border rounded-2xl p-4 hover:border-red-400 hover:bg-red-50 transition-all group">
                <p className="font-bold text-gray-800 mb-1 group-hover:text-red-800">{item}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-green-50 border border-green-200 rounded-3xl p-6 text-center">
            <p className="text-green-800 font-semibold">📍 Entrega na sede · (21) 99364-2230 · sosvidaipm@gmail.com</p>
            <p className="text-green-700 text-sm mt-1">Também fazemos coleta em domicílio para grandes volumes!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
