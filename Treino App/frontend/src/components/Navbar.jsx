import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../api/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
      <Link to="/" className="font-bold text-lg tracking-tight">
        LUCAS FALCO <span className="text-accent">TRAINING</span>
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        {!user && (
          <>
            <Link to="/planos" className="hover:text-accent">Planos</Link>
            <Link to="/quero-saber-mais" className="hover:text-accent">Quero saber mais</Link>
            <Link
              to="/login"
              className="bg-accent text-ink font-semibold px-4 py-2 rounded-full hover:bg-accentDark"
            >
              Entrar
            </Link>
          </>
        )}

        {user?.role === "STUDENT" && (
          <>
            <Link to="/app" className="hover:text-accent">Dashboard</Link>
            <button
              onClick={async () => { await logout(); navigate("/"); }}
              className="text-muted hover:text-white"
            >
              Sair
            </button>
          </>
        )}

        {user?.role === "ADMIN" && (
          <>
            <Link to="/admin" className="hover:text-accent">Painel</Link>
            <button
              onClick={async () => { await logout(); navigate("/"); }}
              className="text-muted hover:text-white"
            >
              Sair
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
