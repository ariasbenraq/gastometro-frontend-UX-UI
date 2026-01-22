import { useMemo, useState } from 'react';
import { signIn } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';

const loginInitialForm = {
  usuario: '',
  password: '',
};

export default function Login({ onNavigate, redirectMessage }) {
  const { login } = useAuth();
  const [form, setForm] = useState(loginInitialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoginValid = useMemo(() => {
    const usuarioValid =
      form.usuario.trim().length >= 4 && form.usuario.trim().length <= 80;
    const passwordValid =
      form.password.length >= 8 && form.password.length <= 128;
    return usuarioValid && passwordValid;
  }, [form]);

  const validateLogin = () => {
    const nextErrors = {};
    const usuario = form.usuario.trim();

    if (usuario.length < 4 || usuario.length > 80) {
      nextErrors.usuario = 'El usuario debe tener entre 4 y 80 caracteres.';
    }

    if (form.password.length < 8 || form.password.length > 128) {
      nextErrors.password = 'La contraseña debe tener entre 8 y 128 caracteres.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!validateLogin()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await signIn({
        usuario: form.usuario.trim(),
        password: form.password,
      });

      login({
        accessToken: data?.accessToken,
        refreshToken: data?.refreshToken,
        user: data?.user || null,
      });
      setStatus({ type: 'success', message: 'Inicio de sesión correcto.' });
      setForm(loginInitialForm);
      onNavigate('dashboard');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.message || 'No fue posible iniciar sesión.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h1 className="form-title">Bienvenido a Gastómetro</h1>
      <p className="form-subtitle">
        Inicia sesión para gestionar tus gastos y mantener tus finanzas al día.
      </p>

      {redirectMessage ? (
        <div className="alert-warning" role="alert">
          {redirectMessage}
        </div>
      ) : null}

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

      <form onSubmit={handleSubmit} className="form">
        <div className="input-wrapper">
          <label className="label" htmlFor="usuario">
            Usuario
          </label>
          <input
            id="usuario"
            name="usuario"
            type="text"
            placeholder="Ingresa tu usuario"
            value={form.usuario}
            onChange={handleChange}
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
            value={form.password}
            onChange={handleChange}
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
            onClick={() => onNavigate('register')}
          >
            Regístrate
          </button>
        </div>
        <div className="text-center">
          <button
            className="link-button"
            type="button"
            onClick={() => onNavigate('password-reset')}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>
    </section>
  );
}
