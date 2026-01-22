import { useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const initialForm = {
  usuario: '',
  password: '',
};

export default function App() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    const usuarioValid = formData.usuario.trim().length >= 4;
    const passwordValid = formData.password.length >= 8;
    return usuarioValid && passwordValid;
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (formData.usuario.trim().length < 4) {
      nextErrors.usuario = 'El usuario debe tener mínimo 4 caracteres.';
    }

    if (formData.password.length < 8) {
      nextErrors.password = 'La contraseña debe tener mínimo 8 caracteres.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!validate()) {
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
          usuario: formData.usuario.trim(),
          password: formData.password,
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
      setFormData(initialForm);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container">
      <section className="card">
        <h1 className="form-title">Bienvenido a Gastómetro</h1>
        <p className="form-subtitle">
          Inicia sesión para gestionar tus gastos y mantener tus finanzas al día.
        </p>

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
              value={formData.usuario}
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
              value={formData.password}
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
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </main>
  );
}
