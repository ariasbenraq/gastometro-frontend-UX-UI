import { useMemo, useState } from 'react';
import { signUp } from '../../api/authApi';
import { getPasswordChecks, emailPattern, usuarioPattern } from '../../utils/validators';

const signupInitialForm = {
  nombre_apellido: '',
  usuario: '',
  email: '',
  telefono: '',
  password: '',
  rol: '',
};

export default function Register({ onNavigate }) {
  const [form, setForm] = useState(signupInitialForm);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = useMemo(
    () => getPasswordChecks(form.password),
    [form.password],
  );

  const isSignupValid = useMemo(() => {
    const nombreValid =
      form.nombre_apellido.trim().length >= 3 &&
      form.nombre_apellido.trim().length <= 150;
    const usuarioValid =
      form.usuario.trim().length >= 4 &&
      form.usuario.trim().length <= 80 &&
      usuarioPattern.test(form.usuario.trim());
    const emailValid =
      form.email.trim().length > 0 &&
      form.email.trim().length <= 150 &&
      emailPattern.test(form.email.trim());
    const telefonoValid = form.telefono.trim().length <= 50;
    const passwordValid = Object.values(passwordChecks).every(Boolean);
    const rolValid = !isAdmin || form.rol !== '';

    return (
      nombreValid &&
      usuarioValid &&
      emailValid &&
      telefonoValid &&
      passwordValid &&
      rolValid
    );
  }, [form, passwordChecks, isAdmin]);

  const validateSignup = () => {
    const nextErrors = {};
    const nombre = form.nombre_apellido.trim();
    const usuario = form.usuario.trim();
    const email = form.email.trim();

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

    if (form.telefono.trim().length > 50) {
      nextErrors.telefono = 'El teléfono no puede superar 50 caracteres.';
    }

    if (!Object.values(passwordChecks).every(Boolean)) {
      nextErrors.password =
        'La contraseña debe cumplir todos los requisitos de seguridad.';
    }

    if (isAdmin && !form.rol) {
      nextErrors.rol = 'Selecciona un rol para el nuevo usuario.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminToggle = (event) => {
    const checked = event.target.checked;
    setIsAdmin(checked);
    setForm((prev) => ({
      ...prev,
      rol: checked ? prev.rol || 'USER' : '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!validateSignup()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp({
        nombre_apellido: form.nombre_apellido.trim(),
        usuario: form.usuario.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || undefined,
        password: form.password,
        rol: form.rol || undefined,
      });

      setStatus({ type: 'success', message: 'Registro completado.' });
      setForm(signupInitialForm);
      setIsAdmin(false);
      onNavigate('login');
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
            value={form.nombre_apellido}
            onChange={handleChange}
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
          <label className="label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={form.email}
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
            value={form.telefono}
            onChange={handleChange}
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
            value={form.password}
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
            <input type="checkbox" checked={isAdmin} onChange={handleAdminToggle} />
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
              value={form.rol}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un rol</option>
              <option value="ADMIN">Administrador</option>
              <option value="USER">Usuario</option>
              <option value="ANALYST_BALANCE">Analista de balance</option>
            </select>
            {errors.rol ? <span className="field-error">{errors.rol}</span> : null}
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
            onClick={() => onNavigate('login')}
          >
            Volver a iniciar sesión
          </button>
        </div>
      </form>
    </section>
  );
}
