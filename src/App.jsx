import { useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const loginInitialForm = {
  usuario: '',
  password: '',
};

const signupInitialForm = {
  nombre_apellido: '',
  usuario: '',
  email: '',
  telefono: '',
  password: '',
  rol: '',
};

const usuarioPattern = /^[a-zA-Z0-9_.]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordChecks = (password) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
  symbol: /[^A-Za-z0-9]/.test(password),
});

export default function App() {
  const [view, setView] = useState('login');
  const [loginForm, setLoginForm] = useState(loginInitialForm);
  const [signupForm, setSignupForm] = useState(signupInitialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const passwordChecks = useMemo(
    () => getPasswordChecks(signupForm.password),
    [signupForm.password],
  );

  const isLoginValid = useMemo(() => {
    const usuarioValid =
      loginForm.usuario.trim().length >= 4 &&
      loginForm.usuario.trim().length <= 80;
    const passwordValid =
      loginForm.password.length >= 8 && loginForm.password.length <= 128;
    return usuarioValid && passwordValid;
  }, [loginForm]);

  const isSignupValid = useMemo(() => {
    const nombreValid =
      signupForm.nombre_apellido.trim().length >= 3 &&
      signupForm.nombre_apellido.trim().length <= 150;
    const usuarioValid =
      signupForm.usuario.trim().length >= 4 &&
      signupForm.usuario.trim().length <= 80 &&
      usuarioPattern.test(signupForm.usuario.trim());
    const emailValid =
      signupForm.email.trim().length > 0 &&
      signupForm.email.trim().length <= 150 &&
      emailPattern.test(signupForm.email.trim());
    const telefonoValid = signupForm.telefono.trim().length <= 50;
    const passwordValid = Object.values(passwordChecks).every(Boolean);
    const rolValid = !isAdmin || signupForm.rol !== '';

    return (
      nombreValid &&
      usuarioValid &&
      emailValid &&
      telefonoValid &&
      passwordValid &&
      rolValid
    );
  }, [signupForm, passwordChecks, isAdmin]);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminToggle = (event) => {
    const checked = event.target.checked;
    setIsAdmin(checked);
    setSignupForm((prev) => ({
      ...prev,
      rol: checked ? prev.rol || 'USER' : '',
    }));
  };

  const validateLogin = () => {
    const nextErrors = {};
    const usuario = loginForm.usuario.trim();

    if (usuario.length < 4 || usuario.length > 80) {
      nextErrors.usuario = 'El usuario debe tener entre 4 y 80 caracteres.';
    }

    if (loginForm.password.length < 8 || loginForm.password.length > 128) {
      nextErrors.password = 'La contraseña debe tener entre 8 y 128 caracteres.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateSignup = () => {
    const nextErrors = {};
    const nombre = signupForm.nombre_apellido.trim();
    const usuario = signupForm.usuario.trim();
    const email = signupForm.email.trim();

    if (nombre.length < 3 || nombre.length > 150) {
      nextErrors.nombre_apellido =
        'El nombre y apellido debe tener entre 3 y 150 caracteres.';
    }

    if (usuario.length < 4 || usuario.length > 80) {
      nextErrors.usuario = 'El usuario debe tener entre 4 y 80 caracteres.';
    } else if (!usuarioPattern.test(usuario)) {
      nextErrors.usuario =
        'El usuario solo puede incluir letras, números, puntos y guiones bajos.';
    }

    if (email.length === 0 || email.length > 150 || !emailPattern.test(email)) {
      nextErrors.email = 'Ingresa un correo válido (máximo 150 caracteres).';
    }

    if (signupForm.telefono.trim().length > 50) {
      nextErrors.telefono = 'El teléfono no puede superar 50 caracteres.';
    }

    if (!Object.values(passwordChecks).every(Boolean)) {
      nextErrors.password =
        'La contraseña debe cumplir todos los requisitos de seguridad.';
    }

    if (isAdmin && !signupForm.rol) {
      nextErrors.rol = 'Selecciona un rol para el nuevo usuario.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!validateLogin()) {
      return;
    }

    if (!API_BASE_URL) {
      setStatus({
        type: 'error',
        message: 'Configura VITE_API_BASE_URL en tu archivo .env.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: loginForm.usuario.trim(),
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'No fue posible iniciar sesión.');
      }

      if (data?.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      if (data?.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      setStatus({
        type: 'success',
        message: 'Inicio de sesión correcto. Tokens guardados.',
      });
      setLoginForm(loginInitialForm);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!validateSignup()) {
      return;
    }

    if (!API_BASE_URL) {
      setStatus({
        type: 'error',
        message: 'Configura VITE_API_BASE_URL en tu archivo .env.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_apellido: signupForm.nombre_apellido.trim(),
          usuario: signupForm.usuario.trim(),
          email: signupForm.email.trim(),
          telefono: signupForm.telefono.trim() || undefined,
          password: signupForm.password,
          rol: signupForm.rol || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'No fue posible registrar el usuario.');
      }

      setStatus({
        type: 'success',
        message: 'Registro completado. Ya puedes iniciar sesión.',
      });
      setSignupForm(signupInitialForm);
      setIsAdmin(false);
      setView('login');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.message || 'No fue posible completar el registro.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container">
      <section className="card">
        {view === 'login' ? (
          <>
            <h1 className="form-title">Bienvenido a Gastómetro</h1>
            <p className="form-subtitle">
              Inicia sesión para gestionar tus gastos y mantener tus finanzas al
              día.
            </p>
          </>
        ) : (
          <>
            <h1 className="form-title">Crea tu cuenta en Gastómetro</h1>
            <p className="form-subtitle">
              Regístrate para gestionar tus gastos y mantener tus finanzas al día.
            </p>
          </>
        )}

        {status.message ? (
          <div
            className={
              status.type === 'success' ? 'alert-success' : 'alert-error'
            }
            role="alert"
          >
            {status.message}
          </div>
        ) : null}

        {view === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="form">
            <div className="input-wrapper">
              <label className="label" htmlFor="usuario">
                Usuario
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                placeholder="Ingresa tu usuario"
                value={loginForm.usuario}
                onChange={handleLoginChange}
                autoComplete="username"
                required
              />
              {errors.usuario ? (
                <span className="field-error">{errors.usuario}</span>
              ) : null}
            </div>

            <div className="input-wrapper">
              <label className="label" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={loginForm.password}
                onChange={handleLoginChange}
                autoComplete="current-password"
                required
              />
              {errors.password ? (
                <span className="field-error">{errors.password}</span>
              ) : null}
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={!isLoginValid || isSubmitting}
            >
              {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
            </button>

            <div className="text-center">
              <span className="helper-text">¿No tienes cuenta?</span>{' '}
              <button
                className="link-button"
                type="button"
                onClick={() => {
                  setView('signup');
                  setErrors({});
                  setStatus({ type: '', message: '' });
                }}
              >
                Regístrate
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="form">
            <div className="input-wrapper">
              <label className="label" htmlFor="nombre_apellido">
                Nombre y apellido
              </label>
              <input
                id="nombre_apellido"
                name="nombre_apellido"
                type="text"
                placeholder="Ingresa tu nombre completo"
                value={signupForm.nombre_apellido}
                onChange={handleSignupChange}
                autoComplete="name"
                required
              />
              {errors.nombre_apellido ? (
                <span className="field-error">{errors.nombre_apellido}</span>
              ) : null}
            </div>

            <div className="input-wrapper">
              <label className="label" htmlFor="signup_usuario">
                Usuario
              </label>
              <input
                id="signup_usuario"
                name="usuario"
                type="text"
                placeholder="Usuario único (ej. gastometro_user)"
                value={signupForm.usuario}
                onChange={handleSignupChange}
                autoComplete="username"
                required
              />
              {errors.usuario ? (
                <span className="field-error">{errors.usuario}</span>
              ) : null}
            </div>

            <div className="input-wrapper">
              <label className="label" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={signupForm.email}
                onChange={handleSignupChange}
                autoComplete="email"
                required
              />
              {errors.email ? (
                <span className="field-error">{errors.email}</span>
              ) : null}
            </div>

            <div className="input-wrapper">
              <label className="label" htmlFor="telefono">
                Teléfono (opcional)
              </label>
              <input
                id="telefono"
                name="telefono"
                type="text"
                placeholder="Número de contacto"
                value={signupForm.telefono}
                onChange={handleSignupChange}
                autoComplete="tel"
              />
              {errors.telefono ? (
                <span className="field-error">{errors.telefono}</span>
              ) : null}
            </div>

            <div className="input-wrapper">
              <label className="label" htmlFor="signup_password">
                Contraseña
              </label>
              <input
                id="signup_password"
                name="password"
                type="password"
                placeholder="Crea una contraseña segura"
                value={signupForm.password}
                onChange={handleSignupChange}
                autoComplete="new-password"
                required
              />
              {errors.password ? (
                <span className="field-error">{errors.password}</span>
              ) : null}
              <div className="password-hints" aria-live="polite">
                <p className="helper-text">La contraseña debe incluir:</p>
                <ul>
                  <li className={passwordChecks.length ? 'valid' : 'invalid'}>
                    Mínimo 8 caracteres
                  </li>
                  <li className={passwordChecks.uppercase ? 'valid' : 'invalid'}>
                    1 letra mayúscula
                  </li>
                  <li className={passwordChecks.lowercase ? 'valid' : 'invalid'}>
                    1 letra minúscula
                  </li>
                  <li className={passwordChecks.number ? 'valid' : 'invalid'}>
                    1 número
                  </li>
                  <li className={passwordChecks.symbol ? 'valid' : 'invalid'}>
                    1 símbolo (ej. !@#$)
                  </li>
                </ul>
              </div>
            </div>

            <div className="input-wrapper">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={handleAdminToggle}
                />
                Registrar usuario como administrador
              </label>
              <span className="helper-text">
                El selector de rol solo está disponible para administradores.
              </span>
            </div>

            {isAdmin ? (
              <div className="input-wrapper">
                <label className="label" htmlFor="rol">
                  Rol
                </label>
                <select
                  id="rol"
                  name="rol"
                  value={signupForm.rol}
                  onChange={handleSignupChange}
                  required
                >
                  <option value="">Selecciona un rol</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="USER">Usuario</option>
                  <option value="ANALYST_BALANCE">Analista de balance</option>
                </select>
                {errors.rol ? (
                  <span className="field-error">{errors.rol}</span>
                ) : null}
              </div>
            ) : null}

            <button
              className="btn-primary"
              type="submit"
              disabled={!isSignupValid || isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
            </button>

            <div className="text-center">
              <button
                className="link-button"
                type="button"
                onClick={() => {
                  setView('login');
                  setErrors({});
                  setStatus({ type: '', message: '' });
                }}
              >
                Volver a iniciar sesión
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
