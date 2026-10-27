import { Outlet, NavLink } from 'react-router-dom';
import { Cog, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <header className="workshop-header">
        <NavLink to="/dashboard" className="workshop-brand"><Cog aria-hidden="true" /> PlatformHub</NavLink>
        <nav aria-label="Navegação principal">
          <NavLink to="/dashboard">Painel</NavLink>
          <NavLink to="/perfil">Perfil</NavLink>
        </nav>
        <div className="workshop-account">
          <span>{user?.nome || user?.email}</span>
          <button onClick={logout}><LogOut size={16} aria-hidden="true" /> Sair</button>
        </div>
      </header>
      <main className="workshop-main"><Outlet /></main>
      <footer className="workshop-footer">PlatformHub · Oficina de projetos <span>FATEC DSM / 2026</span></footer>
    </div>
  );
}
