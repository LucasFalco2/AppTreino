import { useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../api/AuthContext";

const CATEGORIES = [
  ["SUGGESTION", "Sugestão"],
  ["BUG", "Bug"],
  ["WORKOUT_ISSUE", "Problema no treino"],
  ["APP_ISSUE", "Problema no aplicativo"],
  ["QUESTION", "Dúvida"],
  ["OTHER", "Outro"],
];

const PRIORITIES = [["LOW", "Baixa"], ["MEDIUM", "Média"], ["HIGH", "Alta"]];

export default function Feedback() {
  const { user } = useAuth();
  const [category, setCategory] = useState("SUGGESTION");
  const [priority, setPriority] = useState("LOW");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    await api.post("/feedback", { studentId: user.studentId, category, priority, description });
    setDescription("");
    setSent(true);
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Feedback</h1>
      {sent && <p className="text-accent mb-4">Obrigado! Recebemos seu feedback.</p>}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-muted mb-1">Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Prioridade</label>
          <div className="flex gap-2">
            {PRIORITIES.map(([v, l]) => (
              <button type="button" key={v} onClick={() => setPriority(v)}
                className={`px-4 py-1.5 rounded-full text-sm border ${
                  priority === v ? "bg-accent text-ink border-accent font-semibold" : "border-white/20 hover:bg-white/10"
                }`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Descrição</label>
          <textarea rows={4} required value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        </div>

        <button className="w-full bg-accent text-ink font-semibold rounded-full py-3 hover:bg-accentDark">
          Enviar feedback
        </button>
      </form>
    </div>
  );
}
