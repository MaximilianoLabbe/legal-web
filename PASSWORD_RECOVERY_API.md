# API de recuperacion de contraseña

Este documento describe los endpoints que debe implementar el backend para que el frontend pueda recuperar una contraseña olvidada.

## Base URL

Todos los endpoints usan la URL configurada en `VITE_API_URL`, por ejemplo:

```text
https://legal-service-7tq0.onrender.com/api
```

## 1. Solicitar recuperacion

### Endpoint

```http
POST /auth/forgot-password
```

### Headers

```http
Content-Type: application/json
```

### Body

```json
{
  "email": "usuario@correo.com"
}
```

### Respuesta exitosa

Se recomienda utilizar siempre una respuesta generica para no revelar si una cuenta existe:

```json
{
  "message": "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña."
}
```

### Comportamiento requerido

1. Validar y normalizar el email.
2. Buscar el usuario por email.
3. Si existe:
   - Generar un token criptograficamente seguro.
   - Asociar el token al usuario.
   - Guardar una fecha de expiracion corta, sugerida: 30 minutos.
   - Guardar solamente el hash del token; nunca el token original.
   - Enviar por email un enlace al frontend con el formato:

```text
https://<dominio-del-frontend>/reset-password?token=<token>
```

4. Invalidar o reemplazar tokens anteriores pendientes del usuario.
5. Responder igual que cuando el email no existe.
6. Aplicar limitacion de solicitudes por IP y por email.

## 2. Restablecer contraseña

### Endpoint

```http
POST /auth/reset-password
```

### Headers

```http
Content-Type: application/json
```

### Body

```json
{
  "token": "<token-de-recuperacion>",
  "password": "NuevaContrasena123"
}
```

### Respuesta exitosa

```json
{
  "message": "Contraseña restablecida exitosamente."
}
```

### Comportamiento requerido

1. Validar que `token` y `password` estén presentes.
2. Exigir al menos 6 caracteres para coincidir con la validacion actual del frontend.
3. Comparar el hash recibido con el token almacenado.
4. Rechazar tokens expirados, usados o invalidos.
5. Hashear la nueva contraseña con el algoritmo usado por el sistema.
6. Actualizar la contraseña del usuario.
7. Marcar el token como usado o eliminarlo.
8. Invalidar sesiones o refresh tokens anteriores si el sistema lo permite.
9. Responder un error 400 o 401 para tokens invalidos o expirados.

## Errores

Ejemplo de respuesta para validacion o token invalido:

```json
{
  "statusCode": 400,
  "message": "El enlace de recuperación no es válido o expiró.",
  "error": "Bad Request"
}
```

El frontend muestra `response.data.message` cuando esta disponible.

## Seguridad

- Usar HTTPS en ambos entornos.
- Los tokens deben ser de un solo uso y tener expiracion.
- No devolver el token por la API; enviarlo solo por correo.
- No incluir datos sensibles ni credenciales en el enlace.
- Configurar correctamente CORS para el dominio del frontend.
- No revelar si un email esta registrado.
- Limitar intentos de solicitud y restablecimiento.

## Integracion con correo

El email de recuperacion debe incluir un enlace construido por el backend o por la configuracion del frontend:

```text
https://<dominio>/reset-password?token=<token>
```

El frontend tambien acepta este formato alternativo:

```text
https://<dominio>/reset-password/<token>
```
