import { useEffect, useState } from "react";
import api from "../../api/client";

const ORIGIN_LABEL = {
  SITE: "Site", INSTAGRAM: "Instagram", TIKTOK: "TikTok",
  REFERRAL: "Indicação", GOOGLE: "Google", OTHER: "Outro",
};

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    api.get("/admin/leads").then((r) => setLeads(r.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leads</h1>
      <div className="space-y-3">
        {leads.map((l) => (
          <div key={l.id} className="bg-surface border border-white/10 rounded-xl p-4 text-sm">
            <div className="flex justify-between">
              <p className="font-medium">{l.name}</p>
              <span className="text-muted">{ORIGIN_LABEL[l.origin]}</span>
            </div>
            <p className="text-muted">{l.whatsapp} · {l.objective || "sem objetivo informado"}</p>
            {l.notes && <p className="text-xs text-muted mt-1">Obs: {l.notes}</p>}
          </div>
        ))}
        {leads.length === 0 && <p className="text-muted">Nenhum lead ainda.</p>}
      </div>
    </div>
  );
}
