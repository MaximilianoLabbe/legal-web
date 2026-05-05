import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button, Alert } from '../components/ui';
import { validateEmail } from '../utils';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error: authError, user, token } = useAuthStore();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Auto-redirect when user is authenticated
  useEffect(() => {
    if (user && token) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, token, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFocusedField(null);
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    if (name === 'email') {
      if (!value) {
        newErrors.email = 'El email es requerido';
      } else if (!validateEmail(value)) {
        newErrors.email = 'Ingresa un email válido';
      } else {
        delete newErrors.email;
      }
    }

    if (name === 'password') {
      if (!value) {
        newErrors.password = 'La contraseña es requerida';
      } else if (value.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      // Navigation is handled by useEffect above
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-10" />
      </div>

      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative w-full max-w-md">
        {/* Glassmorphism card */}
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Header with animation */}
          <div className="text-center mb-10">
            <div className="inline-block mb-4 p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
              <span className="text-4xl">⚖️</span>
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              FGN Abogados
            </h1>
            <p className="text-blue-200 text-base font-light mt-3">
              Sistema de Gestión Legal Profesional
            </p>
          </div>

          {/* Error Alert */}
          {authError && (
            <div className="mb-6 animate-slideInDown">
              <Alert
                type="error"
                title="Error"
                message={authError}
              />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors">
                  <FiMail size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => setFocusedField('email')}
                  placeholder="tu@correo.com"
                  className={`w-full bg-white/10 border-2 backdrop-blur-md pl-12 pr-4 py-3 rounded-xl transition-all duration-300 focus:outline-none text-white placeholder:text-blue-200/50 ${
                    focusedField === 'email'
                      ? 'border-blue-400 bg-white/20 shadow-lg shadow-blue-500/20'
                      : touched.email && errors.email
                      ? 'border-red-400 bg-red-500/10'
                      : 'border-white/20 hover:border-blue-300/50'
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="mt-2 text-sm text-red-400 font-medium animate-slideInDown">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors">
                  <FiLock size={20} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={() => setFocusedField('password')}
                  placeholder="••••••••"
                  className={`w-full bg-white/10 border-2 backdrop-blur-md pl-12 pr-4 py-3 rounded-xl transition-all duration-300 focus:outline-none text-white placeholder:text-blue-200/50 ${
                    focusedField === 'password'
                      ? 'border-blue-400 bg-white/20 shadow-lg shadow-blue-500/20'
                      : touched.password && errors.password
                      ? 'border-red-400 bg-red-500/10'
                      : 'border-white/20 hover:border-blue-300/50'
                  }`}
                />
              </div>
              {touched.password && errors.password && (
                <p className="mt-2 text-sm text-red-400 font-medium animate-slideInDown">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mt-8"
              isLoading={isLoading}
              disabled={isLoading || Object.keys(errors).length > 0}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ingresando...
                </>
              ) : (
                <>
                  Acceder al Sistema
                  <FiArrowRight size={20} />
                </>
              )}
            </Button>
          </form>

          {/* Info Badge */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl backdrop-blur-md">
            <p className="text-sm text-blue-200 font-medium">
              ℹ️ Ingresa tus credenciales registradas en el sistema
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-300/60 text-xs mt-8 font-light">
          © 2026 FGN Abogados. Sistema profesional de gestión legal.
        </p>
      </div>
    </div>
  );
};

LoginPage.displayName = 'LoginPage';
