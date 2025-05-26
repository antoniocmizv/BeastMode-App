# Pruebas para las rutas QR

## Requisitos
- Usuario autenticado con suscripción activa
- Gimnasio existente en la base de datos
- Token JWT válido

## Ejemplos de uso

### 1. Generar QR para acceso
```bash
curl -X POST http://localhost:3000/api/qr/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gymId": "YOUR_GYM_ID"
  }'
```

Respuesta esperada:
```json
{
  "qrToken": "a1b2c3d4e5f6...",
  "expiresAt": "2025-05-26T21:15:00.000Z",
  "gymAccess": {
    "id": "...",
    "userId": "...",
    "gymId": "...",
    "user": { "id": "...", "name": "..." },
    "gym": { "id": "...", "name": "..." }
  }
}
```

### 2. Validar QR (ADMIN/TRAINER)
```bash
curl -X POST http://localhost:3000/api/qr/validate \
  -H "Authorization: Bearer ADMIN_OR_TRAINER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrToken": "a1b2c3d4e5f6..."
  }'
```

Respuesta esperada:
```json
{
  "message": "✅ Acceso autorizado",
  "user": {
    "id": "...",
    "name": "...",
    "email": "..."
  },
  "gym": {
    "id": "...",
    "name": "...",
    "address": "..."
  },
  "accessTime": "2025-05-26T21:10:00.000Z"
}
```

### 3. Obtener historial de accesos
```bash
curl -X GET http://localhost:3000/api/qr/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Obtener estadísticas del gimnasio (ADMIN/TRAINER)
```bash
curl -X GET http://localhost:3000/api/qr/stats/YOUR_GYM_ID \
  -H "Authorization: Bearer ADMIN_OR_TRAINER_JWT_TOKEN"
```

## Características del sistema QR

1. **Seguridad**: 
   - QR dinámico con token único
   - Expira en 5 minutos
   - Un solo uso por QR
   - Requiere suscripción activa

2. **Control de acceso**:
   - Valida permisos del usuario al gym
   - Solo ADMIN/TRAINER pueden validar QRs
   - Registra timestamp de uso

3. **Estadísticas**:
   - Accesos del día actual
   - Usuarios únicos por día
   - Historial completo
   - Detalles de cada acceso

## Errores comunes

- **403**: Sin suscripción activa o sin acceso al gym
- **400**: QR expirado o ya usado
- **404**: QR no encontrado
- **401**: Token JWT inválido o faltante
