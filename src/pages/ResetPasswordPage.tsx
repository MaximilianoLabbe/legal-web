import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiLock } from 'react-icons/fi';
import { Alert, Button } from '../components/ui';
import { authService } from '../services';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../utils';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [searchParams] = useSearchParams();
  const { token: routeToken } = useParams();
  const token = routeToken || searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const redirectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (redirectTimeout.current) {
      clearTimeout(redirectTimeout.current);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('El enlace de recuperación no incluye un token válido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, password);
      setSuccess(response.message);
      setPassword('');
      setConfirmPassword('');
      redirectTimeout.current = setTimeout(() => {
        logout();
        navigate('/login?passwordReset=success', { replace: true });
      }, 1800);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'No se pudo restablecer la contraseña'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
            <FiLock className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Nueva contraseña</h1>
          <p className="mt-3 text-sm text-blue-200">Elige una contraseña nueva de al menos 6 caracteres.</p>
        </div>

        {error && <div className="mb-6"><Alert type="error" title="Error" message={error} /></div>}
        {success && <div className="mb-6"><Alert type="success" title="Éxito" message={success} /></div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nueva contraseña"
            autoComplete="new-password"
            disabled={isLoading || Boolean(success)}
            className="w-full bg-white/10 border-2 border-white/20 focus:border-blue-400 focus:outline-none px-4 py-3 rounded-xl text-white placeholder:text-blue-200/50"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirmar contraseña"
            autoComplete="new-password"
            disabled={isLoading || Boolean(success)}
            className="w-full bg-white/10 border-2 border-white/20 focus:border-blue-400 focus:outline-none px-4 py-3 rounded-xl text-white placeholder:text-blue-200/50"
          />
          <Button type="submit" isLoading={isLoading} disabled={!token || isLoading || Boolean(success)} className="w-full py-3">
            Restablecer contraseña
          </Button>
        </form>

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
        >
          <FiArrowLeft />
          Ir al inicio de sesión
        </Link>
      </div>
    </div>
  );
};

ResetPasswordPage.displayName = 'ResetPasswordPage';
