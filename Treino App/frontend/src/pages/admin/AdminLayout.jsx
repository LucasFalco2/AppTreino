import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/alunos", label: "Alunos" },
  { to: "/admin/assinaturas", label: "Assinaturas" },
  { to: "/admin/pagamentos", label: "Pagamentos PIX" },
  { to: "/admin/feedbacks", label: "Feedbacks" },
  { to: "/admin/alimentos", label: "Alimentos" },
  { to: "/admin/cupons", label: "Cupons" },
];

export default function AdminLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-[80vh]">
      <aside className="md:w-56 border-b md:border-b-0 md:border-r border-white/10 px-4 py-6">
        <nav className="flex md:flex-col gap-2 overflow-x-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full md:rounded-lg text-sm whitespace-nowrap ${
                  isActive ? "bg-accent text-ink font-semibold" : "hover:bg-white/10"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
