import { useEffect, useState } from "react";
import api from "../../api/client";

export default function AdminFoodRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try { setLoading(true); setError(""); const r = await api.get("/nutrition/admin/food-requests"); setRequests(Array.isArray(r.data) ? r.data : []); }
    catch (e) { setError(e.response?.data?.error || "Não foi possível carregar as solicitações."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function status(id, value) {
    try { await api.patch(`/nutrition/admin/food-requests/${id}`, { status: value }); await load(); }
    catch (e) { setError(e.response?.data?.error || "Não foi possível atualizar a solicitação."); }
  }

  return <div>
    <h1 className="text-2xl font-bold mb-6">Solicitações de alimentos</h1>
    {error && <p className="text-red-400 bg-red-400/10 p-3 rounded-lg mb-4">{error}</p>}
    {loading ? <p className="text-muted">Carregando...</p> : requests.length === 0 ? <p className="text-muted">Nenhuma solicitação encontrada.</p> :
      requests.map((x) => <div key={x.id} className="bg-surface border border-white/10 rounded-xl p-4 mb-3">
        <p className="font-semibold">{x.student?.name || "Aluno"} — {x.name || "Alimento"}</p><p className="text-muted text-sm">{x.brand || "Sem marca"} · {x.quantity || "Qtd não informada"}</p>
        <div className="flex gap-2 mt-3"><button onClick={() => status(x.id, "IN_REVIEW")} className="border border-white/20 px-3 py-1 rounded-full text-sm">Em análise</button><button onClick={() => status(x.id, "REGISTERED")} className="bg-accent text-ink px-3 py-1 rounded-full text-sm">Cadastrado</button><button onClick={() => status(x.id, "REJECTED")} className="border border-red-400/40 text-red-400 px-3 py-1 rounded-full text-sm">Recusar</button></div>
      </div>)}
  </div>;
}