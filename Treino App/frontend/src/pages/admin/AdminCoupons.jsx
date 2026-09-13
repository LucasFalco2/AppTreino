import { useEffect, useState } from "react";
import api from "../../api/client";

const initial = { code: "", discountValue: "", planId: "", startsAt: "", expiresAt: "", usageLimit: "", internalNote: "" };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState(null);

  function load() {
    api.get("/coupons").then((r) => setCoupons(r.data));
    api.get("/plans").then((r) => setPlans(r.data));
  }
  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/coupons", {
        code: form.code,
        discountValue: Number(form.discountValue),
        planId: form.planId || null,
        startsAt: form.startsAt,
        expiresAt: form.expiresAt,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        internalNote: form.internalNote || undefined,
      });
      setForm(initial);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao criar cupom.");
    }
  }

  async function toggleStatus(coupon) {
    await api.patch(`/coupons/${coupon.id}/status`, {
      status: coupon.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cupons de desconto</h1>

      <form onSubmit={submit} className="grid sm:grid-cols-3 gap-3 mb-8 bg-surface border border-white/10 rounded-2xl p-5">
        <input placeholder="Código (ex: LUCAS10)" value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" required />
        <input placeholder="Desconto (%)" type="number" value={form.discountValue}
          onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" required />
        <select value={form.planId} onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Todos os planos</option>
          {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="date" value={form.startsAt}
          onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" required />
        <input type="date" value={form.expiresAt}
          onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" required />
        <input placeholder="Limite de usos (vazio = ilimitado)" type="number" value={form.usageLimit}
          onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Descrição interna" value={form.internalNote}
          onChange={(e) => setForm((f) => ({ ...f, internalNote: e.target.value }))}
          className="sm:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <button className="bg-accent text-ink font-semibold rounded-lg py-2 text-sm hover:bg-accentDark">
          Criar cupom
        </button>
        {error && <p className="sm:col-span-3 text-red-400 text-sm">{error}</p>}
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-muted text-left border-b border-white/10">
            <tr>
              <th className="py-2 pr-4">Código</th>
              <th className="py-2 pr-4">Desconto</th>
              <th className="py-2 pr-4">Plano</th>
              <th className="py-2 pr-4">Usos</th>
              <th className="py-2 pr-4">Validade</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Ação</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-white/5">
                <td className="py-2 pr-4 font-medium">{c.code}</td>
                <td className="py-2 pr-4">{c.discountValue}%</td>
                <td className="py-2 pr-4">{c.plan?.name || "Todos"}</td>
                <td className="py-2 pr-4">{c._count.usages}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td className="py-2 pr-4">{new Date(c.expiresAt).toLocaleDateString("pt-BR")}</td>
                <td className="py-2 pr-4">
                  <span className={c.status === "ACTIVE" ? "text-accent" : "text-red-400"}>
                    {c.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <button onClick={() => toggleStatus(c)} className="text-xs border border-white/20 rounded-full px-3 py-1 hover:bg-white/10">
                    {c.status === "ACTIVE" ? "Desativar" : "Reativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
