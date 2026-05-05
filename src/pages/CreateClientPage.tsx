import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout';
import { Button, Card, Input, Alert } from '../components/ui';
import { useClientStore } from '../store/clientStore';
import { validateEmail, validateRut } from '../utils';

export const CreateClientPage: React.FC = () => {
  const navigate = useNavigate();
  const { createClient, isLoading, error: storeError } = useClientStore();

  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    email: '',
    telefono: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.rut.trim()) {
      newErrors.rut = 'El RUT es requerido';
    } else if (!validateRut(formData.rut)) {
      newErrors.rut = 'Ingresa un RUT válido (ej: 12345678-K)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
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
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          newErrors.nombre = 'El nombre es requerido';
        } else {
          delete newErrors.nombre;
        }
        break;

      case 'rut':
        if (!value.trim()) {
          newErrors.rut = 'El RUT es requerido';
        } else if (!validateRut(value)) {
          newErrors.rut = 'Ingresa un RUT válido (ej: 12345678-K)';
        } else {
          delete newErrors.rut;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'El email es requerido';
        } else if (!validateEmail(value)) {
          newErrors.email = 'Ingresa un email válido';
        } else {
          delete newErrors.email;
        }
        break;

      case 'telefono':
        if (!value.trim()) {
          newErrors.telefono = 'El teléfono es requerido';
        } else {
          delete newErrors.telefono;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createClient(
        formData.rut,
        formData.nombre,
        formData.telefono,
        formData.email
      );
      navigate('/clients');
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  return (
    <div>
      <Header
        title="Nuevo Cliente"
        subtitle="Registra un nuevo cliente en el sistema"
      />

      <div className="p-6 max-w-2xl">
        <Card>
          {storeError && (
            <Alert
              type="error"
              title="Error"
              message={storeError}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nombre Completo"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.nombre ? errors.nombre : undefined}
              placeholder="Juan Pérez García"
            />

            <Input
              label="RUT"
              name="rut"
              value={formData.rut}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.rut ? errors.rut : undefined}
              placeholder="12345678-K"
              helperText="Formato: XX.XXX.XXX-X o XXXXXXXX-X"
            />

            <Input
              label="Correo Electrónico"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : undefined}
              placeholder="juan@example.com"
            />

            <Input
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.telefono ? errors.telefono : undefined}
              placeholder="+56912345678"
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={isLoading}
                disabled={isLoading || Object.keys(errors).length > 0}
              >
                {isLoading ? 'Creando...' : 'Crear Cliente'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => navigate('/clients')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

CreateClientPage.displayName = 'CreateClientPage';
