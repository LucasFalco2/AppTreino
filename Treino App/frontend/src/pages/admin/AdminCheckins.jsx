import { useEffect, useState } from "react";
import api from "../../api/client";

export default function AdminCheckins() {
  const [checkins, setCheckins] = useState([]);
  const [replyDraft, setReplyDraft] = useState({});

  function load() {
    api.get("/checkins/pending").then((r) => setCheckins(r.data));
  }
  useEffect(load, []);

  async function reply(id) {
    const text = replyDraft[id];
    if (!text?.trim()) return;
    await api.patch(`/checkins/${id}/reply`, { reply: text });
    setReplyDraft((d) => ({ ...d, [id]: "" }));
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Check-ins pendentes</h1>

      <div className="space-y-4">
        {checkins.map((c) => (
          <div key={c.id} className="bg-surface border border-white/10 rounded-xl p-4 text-sm">
            <p className="font-medium">{c.student.name}</p>
            <div className="text-muted mt-2 space-y-1">
              <p>Humor: {c.mood || "—"} · Energia: {c.energyLevel || "—"} · Sono: {c.sleepQuality || "—"}</p>
              <p>Seguindo o treino: {c.followingWorkout === null ? "—" : c.followingWorkout ? "Sim" : "Não"}</p>
              <p>Dificuldade: {c.hasDifficulty ? "Sim" : "Não"} · Desconforto: {c.hasDiscomfort ? "Sim" : "Não"}</p>
              {c.message && <p className="text-white">"{c.message}"</p>}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                placeholder="Responder..."
                value={replyDraft[c.id] || ""}
                onChange={(e) => setReplyDraft((d) => ({ ...d, [c.id]: e.target.value }))}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
              <button onClick={() => reply(c.id)} className="bg-accent text-ink font-semibold rounded-lg px-4 text-sm hover:bg-accentDark">
                Enviar
              </button>
            </div>
          </div>
        ))}
        {checkins.length === 0 && <p className="text-muted">Nenhum check-in pendente.</p>}
      </div>
    </div>
  );
}
