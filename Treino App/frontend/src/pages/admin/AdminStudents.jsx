import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  async function load(){try{setError("");const r=await api.get("/admin/students");setStudents(r.data||[])}catch(e){setError(e.response?.data?.error||"Não foi possível carregar os alunos.")}}
  useEffect(()=>{load()},[]);
  const filtered=useMemo(()=>students.filter(s=>`${s.name} ${s.user?.email||""}`.toLowerCase().includes(q.toLowerCase())),[students,q]);
  async function toggleActive(studentId,isActive){try{await api.patch(`/admin/students/${studentId}/active`,{isActive:!isActive});load()}catch(e){setError(e.response?.data?.error||"Não foi possível alterar o status.")}}
  return <div><h1 className="text-2xl font-bold mb-6">Alunos</h1><div className="flex gap-3 mb-5"><input className="field max-w-xl" placeholder="Pesquisar por nome ou e-mail..." value={q} onChange={e=>setQ(e.target.value)}/></div>{error&&<p className="text-red-400 bg-red-400/10 p-3 rounded-lg mb-4">{error}</p>}<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-muted text-left border-b border-white/10"><tr><th className="py-2 pr-4">Nome</th><th className="py-2 pr-4">Email</th><th className="py-2 pr-4">Plano</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Treino</th><th className="py-2 pr-4">Ação</th></tr></thead><tbody>{filtered.map(s=><tr key={s.id} className="border-b border-white/5"><td className="py-3 pr-4"><Link className="text-accent hover:underline" to={`/admin/alunos/${s.id}`}>{s.name}</Link></td><td className="py-3 pr-4 text-muted">{s.user?.email}</td><td className="py-3 pr-4">{s.subscriptions?.[0]?.plan?.name||"—"}</td><td className="py-3 pr-4"><span className={s.user?.isActive?"text-accent":"text-red-400"}>{s.user?.isActive?"Ativo":"Inativo"}</span></td><td className="py-3 pr-4">{s.workouts?.[0]?s.workouts[0].title:"Não criado"}</td><td className="py-3 pr-4"><button onClick={()=>toggleActive(s.id,s.user?.isActive)} className="text-xs border border-white/20 rounded-full px-3 py-1 hover:bg-white/10">{s.user?.isActive?"Desativar":"Ativar"}</button></td></tr>)}</tbody></table>{!filtered.length&&<p className="text-muted py-6">Nenhum aluno encontrado.</p>}</div></div>
}
