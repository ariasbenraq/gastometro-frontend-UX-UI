import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import PasswordReset from '../pages/PasswordReset';
import MovilidadCreate from '../pages/MovilidadCreate';
import IngresoCreate from '../pages/IngresoCreate';
import MovilidadList from '../pages/MovilidadList';
import IngresoList from '../pages/IngresoList';
import Balance from '../pages/Balance';
import Clientes from '../pages/Clientes';
import Distritos from '../pages/Distritos';
import Usuarios from '../pages/Usuarios';
import Perfil from '../pages/Perfil';

const protectedRoutes = new Set([
  'dashboard',
  'movilidad-create',
  'ingreso-create',
  'movilidad-list',
  'ingreso-list',
  'balance',
  'clientes',
  'distritos',
  'usuarios',
  'perfil',
]);

const authRoutes = ['login', 'register', 'password-reset'];

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const [route, setRoute] = useState(
    isAuthenticated ? 'dashboard' : 'login',
  );
  const [redirectMessage, setRedirectMessage] = useState('');

  useEffect(() => {
    if (protectedRoutes.has(route) && !isAuthenticated) {
      setRedirectMessage('Debes iniciar sesión para acceder a esta página.');
      setRoute('login');
    }
  }, [route, isAuthenticated]);

  const handleNavigate = (nextRoute) => {
    setRedirectMessage('');
    setRoute(nextRoute);
  };

  const containerClass = useMemo(
    () => (route === 'dashboard' ? 'dashboard-shell' : 'container'),
    [route],
  );

  return (
    <main className={containerClass}>
      {authRoutes.includes(route) ? (
        <section className="auth-wrapper">
          {route === 'login' ? (
            <Login onNavigate={handleNavigate} redirectMessage={redirectMessage} />
          ) : null}
          {route === 'register' ? (
            <Register onNavigate={handleNavigate} />
          ) : null}
          {route === 'password-reset' ? (
            <PasswordReset onNavigate={handleNavigate} />
          ) : null}
        </section>
      ) : null}

      {route === 'dashboard' ? <Dashboard /> : null}
      {route === 'movilidad-create' ? <MovilidadCreate /> : null}
      {route === 'ingreso-create' ? <IngresoCreate /> : null}
      {route === 'movilidad-list' ? <MovilidadList /> : null}
      {route === 'ingreso-list' ? <IngresoList /> : null}
      {route === 'balance' ? <Balance /> : null}
      {route === 'clientes' ? <Clientes /> : null}
      {route === 'distritos' ? <Distritos /> : null}
      {route === 'usuarios' ? <Usuarios /> : null}
      {route === 'perfil' ? <Perfil /> : null}
    </main>
  );
}
