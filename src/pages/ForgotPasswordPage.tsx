import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMail } from 'react-icons/fi';
import { Alert, Button } from '../components/ui';
import { authService } from '../services';
import { validateEmail } from '../utils';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('El email es requerido');
      return;
    }
    if (!validateEmail(email)) {
      setError('Ingresa un email válido');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.requestPasswordReset(email);
      setSuccess(response.message);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'No se pudo enviar la solicitud de recuperación'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
            <FiMail className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Recuperar contraseña</h1>
          <p className="mt-3 text-sm text-blue-200">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {error && <div className="mb-6"><Alert type="error" title="Error" message={error} /></div>}
        {success && <div className="mb-6"><Alert type="success" title="Solicitud enviada" message={success} /></div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
              disabled={isLoading}
              className="w-full bg-white/10 border-2 border-white/20 hover:border-blue-300/50 focus:border-blue-400 focus:outline-none pl-12 pr-4 py-3 rounded-xl text-white placeholder:text-blue-200/50"
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full py-3">
            Enviar enlace de recuperación
          </Button>
        </form>

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
        >
          <FiArrowLeft />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
};

ForgotPasswordPage.displayName = 'ForgotPasswordPage';
