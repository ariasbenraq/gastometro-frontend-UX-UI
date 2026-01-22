import { useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const initialForm = {
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
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const passwordChecks = useMemo(
    () => getPasswordChecks(formData.password),
    [formData.password],
  );

  const isFormValid = useMemo(() => {
    const nombreValid =
      formData.nombre_apellido.trim().length >= 3 &&
      formData.nombre_apellido.trim().length <= 150;
    const usuarioValid =
      formData.usuario.trim().length >= 4 &&
      formData.usuario.trim().length <= 80 &&
      usuarioPattern.test(formData.usuario.trim());
    const emailValid =
      formData.email.trim().length > 0 &&
      formData.email.trim().length <= 150 &&
      emailPattern.test(formData.email.trim());
    const telefonoValid = formData.telefono.trim().length <= 50;
    const passwordValid = Object.values(passwordChecks).every(Boolean);
    const rolValid = !isAdmin || formData.rol !== '';

    return (
      nombreValid &&
      usuarioValid &&
      emailValid &&
      telefonoValid &&
      passwordValid &&
      rolValid
    );
  }, [formData, passwordChecks, isAdmin]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminToggle = (event) => {
    const checked = event.target.checked;
    setIsAdmin(checked);
    setFormData((prev) => ({
      ...prev,
      rol: checked ? prev.rol || 'USER' : '',
    }));
  };

  const validate = () => {
    const nextErrors = {};
    const nombre = formData.nombre_apellido.trim();
    const usuario = formData.usuario.trim();
    const email = formData.email.trim();

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

    if (formData.telefono.trim().length > 50) {
      nextErrors.telefono = 'El teléfono no puede superar 50 caracteres.';
    }

    if (!Object.values(passwordChecks).every(Boolean)) {
      nextErrors.password =
        'La contraseña debe cumplir todos los requisitos de seguridad.';
    }

    if (isAdmin && !formData.rol) {
      nextErrors.rol = 'Selecciona un rol para el nuevo usuario.';
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
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_apellido: formData.nombre_apellido.trim(),
          usuario: formData.usuario.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim() || undefined,
          password: formData.password,
          rol: formData.rol || undefined,
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
      setFormData(initialForm);
      setIsAdmin(false);
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
        <h1 className="form-title">Crea tu cuenta en Gastómetro</h1>
        <p className="form-subtitle">
          Regístrate para gestionar tus gastos y mantener tus finanzas al día.
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
            <label className="label" htmlFor="nombre_apellido">
              Nombre y apellido
            </label>
            <input
              id="nombre_apellido"
              name="nombre_apellido"
              type="text"
              placeholder="Ingresa tu nombre completo"
              value={formData.nombre_apellido}
              onChange={handleChange}
              autoComplete="name"
              required
            />
            {errors.nombre_apellido ? (
              <span className="field-error">{errors.nombre_apellido}</span>
            ) : null}
          </div>

          <div className="input-wrapper">
            <label className="label" htmlFor="usuario">
              Usuario
            </label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              placeholder="Usuario único (ej. gastometro_user)"
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
            <label className="label" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
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
              value={formData.telefono}
              onChange={handleChange}
              autoComplete="tel"
            />
            {errors.telefono ? (
              <span className="field-error">{errors.telefono}</span>
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
              placeholder="Crea una contraseña segura"
              value={formData.password}
              onChange={handleChange}
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
                value={formData.rol}
                onChange={handleChange}
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
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
      </section>
    </main>
  );
}
