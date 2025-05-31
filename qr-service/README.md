# 🔗 BeastMode QR Service

Servicio de generación de códigos QR para acceso al gimnasio desarrollado en Python con FastAPI.

## 🚀 Características

- **Generación de QR**: Códigos QR únicos para acceso al gimnasio
- **Integración JWT**: Autenticación segura con tokens
- **Validación automática**: Verificación de permisos y expiración
- **Base64 encoding**: QR listos para mostrar en React Native
- **FastAPI**: API REST rápida y moderna

## 📋 Endpoints

### **POST** `/generate-qr`
Genera un código QR para acceso al gimnasio

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "gymId": "uuid-del-gimnasio"
}
```

**Response:**
```json
{
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "qr_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-05-31T15:30:00",
  "user_info": {
    "id": "user-uuid",
    "name": "Usuario Ejemplo",
    "email": "usuario@email.com",
    "role": "USER",
    "gym": {
      "id": "gym-uuid",
      "name": "BeastMode Fitness"
    }
  }
}
```

### **POST** `/validate-qr`
Valida un código QR (solo ADMIN/TRAINER)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Body:**
```json
{
  "qr_token": "token-del-qr"
}
```

### **GET** `/health`
Verificar estado del servicio

## 🐳 Docker

El servicio se ejecuta automáticamente con `docker-compose up`:

```bash
# Construir y ejecutar todos los servicios
docker-compose up -d --build

# Ver logs del servicio QR
docker-compose logs qr-service

# Acceder al contenedor
docker-compose exec qr-service bash
```

**URL del servicio:** http://localhost:8000

## 🔧 Configuración

Variables de entorno:

```env
JWT_SECRET=supersecret
API_BASE_URL=http://backend:3000/api
```

## 📱 Integración con React Native

### **Generar QR:**
```javascript
const generateQR = async (gymId) => {
  const response = await fetch('http://localhost:8000/generate-qr', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ gymId }),
  });
  
  const data = await response.json();
  return data.qr_code; // Base64 image
};
```

### **Mostrar QR en React Native:**
```jsx
import { Image } from 'react-native';

<Image 
  source={{ uri: qrCodeBase64 }}
  style={{ width: 200, height: 200 }}
/>
```

## 🔒 Seguridad

- ✅ Tokens JWT firmados
- ✅ Validación de permisos por gimnasio
- ✅ Expiración automática (15 minutos)
- ✅ Verificación de roles para validación
- ✅ Comunicación segura entre servicios

## 🧪 Testing

```bash
# Probar endpoint de salud
curl http://localhost:8000/health

# Generar QR (requiere token)
curl -X POST http://localhost:8000/generate-qr \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gymId": "your-gym-id"}'
```

## 📖 Documentación API

Accede a la documentación interactiva:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
