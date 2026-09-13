import { useState } from "react";
import api from "../api/client";

const ORIGINS = [
  { value: "SITE", label: "Site" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "REFERRAL", label: "Indicação" },
  { value: "GOOGLE", label: "Google" },
  { value: "OTHER", label: "Outro" },
];

const initialForm = {
  name: "",
  whatsapp: "",
  objective: "",
  age: "",
  gender: "",
  heightCm: "",
  weightKg: "",
  origin: "SITE",
  notes: "",
};

export default function InterestFormPage() {
  const [form, setForm] = useState(initialForm);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/leads", {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
      });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Não foi possível enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Recebemos suas informações!</h1>
        <p className="text-muted">Em breve entraremos em contato pelo WhatsApp.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-2">Quero saber mais</h1>
      <p className="text-muted mb-8">Sem compromisso — é só pra te conhecer melhor.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome" required value={form.name} onChange={(v) => update("name", v)} />
        <Field label="WhatsApp" required value={form.whatsapp} onChange={(v) => update("whatsapp", v)} />
        <Field label="Objetivo" value={form.objective} onChange={(v) => update("objective", v)} />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Idade" type="number" value={form.age} onChange={(v) => update("age", v)} />
          <Field label="Gênero" value={form.gender} onChange={(v) => update("gender", v)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Altura (cm)" type="number" value={form.heightCm} onChange={(v) => update("heightCm", v)} />
          <Field label="Peso (kg)" type="number" value={form.weightKg} onChange={(v) => update("weightKg", v)} />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Como conheceu a plataforma?</label>
          <select
            value={form.origin}
            onChange={(e) => update("origin", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-accent"
          >
            {ORIGINS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <Field label="Observações" textarea value={form.notes} onChange={(v) => update("notes", v)} />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-ink font-semibold py-3 rounded-full hover:bg-accentDark disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text", textarea }) {
  const props = {
    value,
    required,
    onChange: (e) => onChange(e.target.value),
    className:
      "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-accent",
  };
  return (
    <div>
      <label className="block text-sm text-muted mb-1">{label}{required && " *"}</label>
      {textarea ? <textarea rows={3} {...props} /> : <input type={type} {...props} />}
    </div>
  );
}
