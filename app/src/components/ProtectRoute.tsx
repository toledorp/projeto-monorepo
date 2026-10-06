import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Estado trnsitorio: Aguarda a verificação do LocalStoraghe
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rouded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">
          Verificando credenciais de acesso...
        </p>
      </div>
    );
  }

  // 2. Não Autenticado: Redireciona para a tela de login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Autenticado: Renderiza o componente filho (Outlet)
  return <Outlet />;
}
