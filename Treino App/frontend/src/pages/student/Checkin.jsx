import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../api/AuthContext";

const initial = {
  mood: "",
  energyLevel: "",
  sleepQuality: "",
  followingWorkout: null,
  hasDifficulty: null,
  hasDiscomfort: null,
  motivation: "",
  message: "",
};

export default function Checkin() {
  const { user } = useAuth();
  const [form, setForm] = useState(initial);
  const [history, setHistory] = useState([]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const allowed = user?.planFeatures?.hasCheckin;

  function load() {
    if (!user?.studentId) return;
    api.get(`/checkins/students/${user.studentId}`).then((r) => setHistory(r.data));
  }
  useEffect(load, [user]);
  if (!allowed) return <div><h1 className="text-2xl font-bold mb-3">Check-in</h1><div className="card"><p>Este recurso não está incluído no seu plano atual.</p><p className="text-muted text-sm mt-2">Faça um upgrade para desbloquear esta função.</p></div></div>;

  async function submit(e) {
    e.preventDefault();
    try {
      setError("");
      await api.post("/checkins", { ...form, studentId: user.studentId });
      setForm(initial);
    } catch (e) { setError(e.response?.data?.error || "Não foi possível enviar o check-in."); return; }
    setSent(true);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Check-in</h1>

      {sent && <p className="text-accent mb-4">Enviado! Status: Enviado.</p>}
      {error && <p className="text-red-400 bg-red-400/10 p-3 rounded-lg mb-4">{error}</p>}

      <form onSubmit={submit} className="space-y-4 max-w-lg mb-10">
        <TextField label="Como você está se sentindo?" value={form.mood} onChange={(v) => setForm((f) => ({ ...f, mood: v }))} />
        <TextField label="Como está seu nível de energia?" value={form.energyLevel} onChange={(v) => setForm((f) => ({ ...f, energyLevel: v }))} />
        <TextField label="Como está seu sono?" value={form.sleepQuality} onChange={(v) => setForm((f) => ({ ...f, sleepQuality: v }))} />
        <BoolField label="Está conseguindo seguir o treino?" value={form.followingWorkout} onChange={(v) => setForm((f) => ({ ...f, followingWorkout: v }))} />
        <BoolField label="Está tendo alguma dificuldade?" value={form.hasDifficulty} onChange={(v) => setForm((f) => ({ ...f, hasDifficulty: v }))} />
        <BoolField label="Está sentindo algum desconforto?" value={form.hasDiscomfort} onChange={(v) => setForm((f) => ({ ...f, hasDiscomfort: v }))} />
        <TextField label="Como está sua motivação?" value={form.motivation} onChange={(v) => setForm((f) => ({ ...f, motivation: v }))} />
        <TextArea label="Gostaria de falar alguma coisa com Lucas?" value={form.message} onChange={(v) => setForm((f) => ({ ...f, message: v }))} />

        <button className="w-full bg-accent text-ink font-semibold rounded-full py-3 hover:bg-accentDark">
          Enviar check-in
        </button>
      </form>

      <h2 className="font-semibold mb-3">Histórico</h2>
      <div className="space-y-3">
        {history.map((c) => (
          <div key={c.id} className="bg-surface border border-white/10 rounded-xl p-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>{new Date(c.createdAt).toLocaleDateString("pt-BR")}</span>
              <span>{c.status === "ANSWERED" ? "Respondido" : "Enviado"}</span>
            </div>
            {c.coachReply && (
              <p className="mt-2 border-t border-white/10 pt-2">
                <span className="text-accent">Lucas: </span>{c.coachReply}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-muted mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-muted mb-1">{label}</label>
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
    </div>
  );
}

function BoolField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-muted mb-1">{label}</label>
      <div className="flex gap-2">
        {[["Sim", true], ["Não", false]].map(([text, v]) => (
          <button
            type="button"
            key={text}
            onClick={() => onChange(v)}
            className={`px-4 py-1.5 rounded-full text-sm border ${
              value === v ? "bg-accent text-ink border-accent font-semibold" : "border-white/20 hover:bg-white/10"
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
