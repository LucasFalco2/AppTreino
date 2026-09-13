import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../api/AuthContext";

const links=[
 {to:"/app",label:"Dashboard",end:true},
 {to:"/app/treino",label:"Meu treino"},
 {to:"/app/evolucao",label:"Evolução",feature:"hasTracking"},
 {to:"/app/alimentacao",label:"Alimentação",feature:"hasNutrition"},
 {to:"/app/metas",label:"Metas"},
 {to:"/app/checkin",label:"Check-in",feature:"hasCheckin"},
 {to:"/app/feedback",label:"Feedback"},
];
export default function StudentLayout(){const {user}=useAuth();const features=user?.planFeatures||{};function locked(feature){return user?.role==="STUDENT"&&feature&&!features[feature]}return <div className="flex flex-col md:flex-row min-h-[80vh]"><aside className="md:w-56 border-b md:border-b-0 md:border-r border-white/10 px-4 py-6"><nav className="flex md:flex-col gap-2 overflow-x-auto">{links.map(l=>{const isLocked=locked(l.feature);return <NavLink key={l.to} to={isLocked?"#":l.to} end={l.end} onClick={e=>{if(isLocked){e.preventDefault();alert("Este recurso não está incluído no seu plano. Faça um upgrade para desbloquear esta função.")}}} className={`px-4 py-2 rounded-full md:rounded-lg text-sm whitespace-nowrap ${isLocked?"opacity-40 cursor-not-allowed":"hover:bg-white/10"}`}>{l.label}{isLocked?" 🔒":""}</NavLink>})}</nav></aside><main className="flex-1 px-6 py-8"><Outlet/></main></div>}
