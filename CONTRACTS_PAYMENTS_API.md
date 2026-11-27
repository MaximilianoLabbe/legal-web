# API de contratos y pagos

Este contrato de API conecta el módulo administrativo del frontend con el backend. Las rutas deben protegerse en el servidor: ocultar la opción en la interfaz no reemplaza la autorización.

## Autorización

- Requerir JWT válido en todas las rutas.
- Permitirlas exclusivamente al rol administrativo. Normalizar mayúsculas y alias como `administrator` o `administrador` al rol canónico `admin` antes de autorizar.
- Responder `403 Forbidden` si el usuario autenticado no es administrador.
- Usar los encabezados `Authorization: Bearer <token>` y `Content-Type: application/json`.

## Modelo

Un contrato pertenece a un cliente y contiene un plan de cuotas en pesos chilenos (CLP). Cada cuota se registra como pagada de una sola vez; se conserva fecha, medio y referencia del pago.

```json
{
  "id": "contract-id",
  "client_id": "client-id",
  "client_name": "Nombre del cliente",
  "title": "Asesoría legal",
  "description": "Descripción del servicio",
  "signed_at": "2026-11-27",
  "total_amount": 1200000,
  "currency": "CLP",
  "status": "active",
  "installments": [
    {
      "id": "installment-id",
      "number": 1,
      "amount": 600000,
      "due_date": "2026-12-10",
      "status": "pending",
      "paid_at": null,
      "payment_method": null,
      "payment_reference": null
    }
  ],
  "created_at": "2026-11-27T12:00:00.000Z",
  "updated_at": "2026-11-27T12:00:00.000Z"
}
```

Estados de contrato: `active`, `completed`, `cancelled`.

Estados de cuota: `pending`, `paid`. La interfaz determina si una cuota pendiente está vencida a partir de `due_date`.

## Listar contratos

```http
GET /admin/contracts
```

La respuesta debe incluir el nombre del cliente y sus cuotas. Se aceptan una lista JSON directa o una lista dentro de `data`.

```json
{
  "data": [
    {
      "id": "contract-id",
      "client_id": "client-id",
      "client_name": "Nombre del cliente",
      "title": "Asesoría legal",
      "description": "",
      "signed_at": "2026-11-27",
      "total_amount": 1200000,
      "currency": "CLP",
      "status": "active",
      "installments": []
    }
  ]
}
```

## Crear contrato y cuotas

```http
POST /admin/contracts
```

```json
{
  "client_id": "client-id",
  "title": "Asesoría legal",
  "description": "Descripción del servicio",
  "signed_at": "2026-11-27",
  "total_amount": 1200000,
  "currency": "CLP",
  "installments": [
    { "number": 1, "amount": 600000, "due_date": "2026-12-10" },
    { "number": 2, "amount": 600000, "due_date": "2027-01-10" }
  ]
}
```

Validar que el cliente exista, los importes sean enteros positivos y la suma de las cuotas sea exactamente igual al monto total. El backend debe guardar el contrato y sus cuotas en una transacción.

## Actualizar datos generales

```http
PATCH /admin/contracts/{contractId}
```

```json
{
  "title": "Asesoría legal anual",
  "description": "Descripción actualizada",
  "status": "active"
}
```

La interfaz solo permite actualizar estos campos generales para conservar intactos los montos, las cuotas y los pagos ya registrados.

## Registrar pago de una cuota

```http
POST /admin/contracts/{contractId}/installments/{installmentId}/payments
```

```json
{
  "paid_at": "2026-12-10",
  "payment_method": "transfer",
  "payment_reference": "OP-12345"
}
```

`payment_reference` puede ser una cadena vacía. Medios admitidos: `transfer`, `cash`, `card`, `other`. El backend debe impedir registrar dos veces el pago de una misma cuota, guardar los datos del pago y devolver el contrato actualizado con sus cuotas.

## Respuestas y errores

Las respuestas de creación, actualización y registro de pago deben incluir el contrato actualizado, directamente o dentro de `data`.

- `400 Bad Request`: datos inválidos o cuotas que no suman el total.
- `401 Unauthorized`: JWT ausente o inválido.
- `403 Forbidden`: usuario que no tiene rol administrativo.
- `404 Not Found`: cliente, contrato o cuota inexistente.
- `409 Conflict`: la cuota ya está pagada o el contrato no admite cambios.

Ejemplo:

```json
{
  "statusCode": 403,
  "message": "No tienes permisos para gestionar contratos y pagos.",
  "error": "Forbidden"
}
```
