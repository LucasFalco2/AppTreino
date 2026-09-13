import { useState } from "react";

const LUCAS_WHATSAPP_NUMBER = "554198996206"; // TODO: trocar pelo número real (formato internacional, só dígitos)

const ORIGINS = [
  { value: "SITE", label: "Site" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "REFERRAL", label: "Indicação" },
  { value: "GOOGLE", label: "Google" },
  { value: "OTHER", label: "Outro" },
];

export default function WhatsAppButton({ className, label = "Falar no WhatsApp" }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("SITE");

  function handleOpen() {
    const originLabel = ORIGINS.find((o) => o.value === origin)?.label || "Site";
    const message =
      origin === "SITE"
        ? `Olá Lucas, sou ${name}, gostaria de saber mais sobre os planos de treinamento.`
        : `Olá Lucas, sou ${name}, vim pelo ${originLabel} e gostaria de saber mais sobre os planos de treinamento.`;

    const url = `https://wa.me/${LUCAS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setOpen(false);
    setName("");
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-4">Antes de continuar...</h3>

            <label className="block text-sm text-muted mb-1">Seu nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-4 outline-none focus:border-accent"
              placeholder="Digite seu nome"
            />

            <label className="block text-sm text-muted mb-1">Como conheceu a plataforma?</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-6 outline-none focus:border-accent"
            >
              {ORIGINS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-full border border-white/20 hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleOpen}
                disabled={!name.trim()}
                className="flex-1 py-2 rounded-full bg-accent text-ink font-semibold hover:bg-accentDark disabled:opacity-50"
              >
                Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
