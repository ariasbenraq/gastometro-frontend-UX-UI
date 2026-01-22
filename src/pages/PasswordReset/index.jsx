import { useMemo, useState } from 'react';
import {
  confirmPasswordReset,
  requestPasswordReset,
  verifyPasswordReset,
} from '../../api/authApi';
import { emailPattern } from '../../utils/validators';

const resetInitialForm = {
  email: '',
  code: '',
  password: '',
};

export default function PasswordReset({ onNavigate }) {
  const [form, setForm] = useState(resetInitialForm);
  const [resetStep, setResetStep] = useState('request');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isResetValid = useMemo(() => {
    const emailValid =
      form.email.trim().length > 0 &&
      form.email.trim().length <= 150 &&
      emailPattern.test(form.email.trim());
    const codeValid = form.code.trim().length > 0;
    const passwordValid = form.password.length >= 8;

    if (resetStep === 'request') {
      return emailValid;
    }

    if (resetStep === 'verify') {
      return emailValid && codeValid;
    }

    return emailValid && codeValid && passwordValid;
  }, [form, resetStep]);

  const validateReset = () => {
    const nextErrors = {};
    const email = form.email.trim();

    if (email.length === 0 || email.length > 150 || !emailPattern.test(email)) {
      nextErrors.email = 'Ingresa un correo válido (máximo 150 caracteres).';
    }

    if (resetStep !== 'request' && form.code.trim().length === 0) {
      nextErrors.code = 'Ingresa el código que recibiste por correo.';
    }

    if (resetStep === 'confirm' && form.password.length < 8) {
      nextErrors.password = 'La nueva contraseña debe tener mínimo 8 caracteres.';
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

    if (!validateReset()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (resetStep === 'request') {
        await requestPasswordReset({ email: form.email.trim() });
        setStatus({ type: 'success', message: 'Te enviamos un código al correo indicado.' });
        setResetStep('verify');
      } else if (resetStep === 'verify') {
        await verifyPasswordReset({
          email: form.email.trim(),
          code: form.code.trim(),
        });
        setStatus({
          type: 'success',
          message: 'Código verificado. Ahora crea tu nueva contraseña.',
        });
        setResetStep('confirm');
      } else {
        await confirmPasswordReset({
          email: form.email.trim(),
          code: form.code.trim(),
          password: form.password,
        });
        setStatus({
          type: 'success',
          message: 'Contraseña actualizada. Ya puedes iniciar sesión.',
        });
        setForm(resetInitialForm);
        setResetStep('request');
        onNavigate('login');
      }
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Ocurrió un error inesperado.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h1 className="form-title">Recupera tu contraseña</h1>
      <p className="form-subtitle">
        Sigue los pasos para restablecer tu acceso a Gastómetro.
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
          <label className="label" htmlFor="reset_email">
            Correo electrónico
          </label>
          <input
            id="reset_email"
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

        {resetStep !== 'request' ? (
          <div className="input-wrapper">
            <label className="label" htmlFor="reset_code">
              Código de verificación
            </label>
            <input
              id="reset_code"
              name="code"
              type="text"
              placeholder="Ingresa el código"
              value={form.code}
              onChange={handleChange}
              required
            />
            {errors.code ? (
              <span className="field-error">{errors.code}</span>
            ) : null}
          </div>
        ) : null}

        {resetStep === 'confirm' ? (
          <div className="input-wrapper">
            <label className="label" htmlFor="reset_password">
              Nueva contraseña
            </label>
            <input
              id="reset_password"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            {errors.password ? (
              <span className="field-error">{errors.password}</span>
            ) : null}
          </div>
        ) : null}

        <button
          className="btn-primary"
          type="submit"
          disabled={!isResetValid || isSubmitting}
        >
          {isSubmitting
            ? 'Procesando...'
            : resetStep === 'request'
              ? 'Enviar código'
              : resetStep === 'verify'
                ? 'Verificar código'
                : 'Actualizar contraseña'}
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
