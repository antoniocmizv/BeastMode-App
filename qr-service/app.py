from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import qrcode
import io
import base64
import requests
import jwt
import os
from datetime import datetime, timedelta
import uvicorn
from typing import Optional
import json
import pytz  # Para manejo de zonas horarias

app = FastAPI(
    title="BeastMode QR Service",
    description="Servicio de generación de códigos QR para acceso al gimnasio",
    version="1.0.0"
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración
JWT_SECRET = os.getenv("JWT_SECRET", "supersecret")
API_BASE_URL = os.getenv("API_BASE_URL", "http://backend:3000/api")
security = HTTPBearer()

# Zona horaria de España
SPAIN_TZ = pytz.timezone('Europe/Madrid')

def get_spain_time():
    """Obtiene la hora actual en España"""
    return datetime.now(SPAIN_TZ)

def get_utc_time():
    """Obtiene la hora UTC actual"""
    return datetime.now(pytz.UTC)

# Modelos Pydantic
class QRRequest(BaseModel):
    gymId: str

class QRResponse(BaseModel):
    qr_code: str  # Base64 encoded
    qr_token: str
    expires_at: str
    user_info: dict

class UserInfo(BaseModel):
    id: str
    name: str
    email: str
    role: str
    gym: Optional[dict] = None

# Funciones auxiliares
def verify_jwt_token(token: str) -> dict:
    """Verifica y decodifica el token JWT"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Obtiene el usuario actual desde el token JWT"""
    token = credentials.credentials
    payload = verify_jwt_token(token)
    return payload

async def fetch_user_data(user_id: str, token: str) -> dict:
    """Obtiene los datos del usuario desde la API de Node.js"""
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{API_BASE_URL}/users/me",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get("user", {})
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error al obtener datos del usuario: {response.text}"
            )
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Error de conexión con la API: {str(e)}"
        )

def generate_qr_token(user_data: dict, gym_id: str) -> str:
    """Genera un token específico para el QR con expiración"""
    now = get_utc_time()  # Usar UTC para JWT (estándar)
    expires_at = now + timedelta(minutes=15)  # QR válido por 15 minutos
    
    qr_payload = {
        "user_id": user_data["id"],
        "user_name": user_data["name"],
        "gym_id": gym_id,
        "exp": int(expires_at.timestamp()),  # Usar timestamp para JWT
        "iat": int(now.timestamp()),
        "type": "gym_access_qr"
    }
    
    return jwt.encode(qr_payload, JWT_SECRET, algorithm="HS256")

def create_qr_code(data: str) -> str:
    """Genera un código QR y lo devuelve como base64"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    # Crear imagen del QR
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convertir a base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

# Endpoints
@app.get("/")
async def root():
    return {
        "service": "BeastMode QR Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Endpoint de salud del servicio"""
    spain_time = get_spain_time()
    utc_time = get_utc_time()
    return {
        "status": "healthy",
        "timestamp_spain": spain_time.isoformat(),
        "timestamp_utc": utc_time.isoformat(),
        "timezone": "Europe/Madrid",
        "api_connection": "ok"
    }

@app.post("/generate-qr", response_model=QRResponse)
async def generate_gym_qr(
    request: QRRequest,
    current_user: dict = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Genera un código QR para acceso al gimnasio
    """
    try:
        token = credentials.credentials
        
        # Obtener datos completos del usuario desde la API
        user_data = await fetch_user_data(current_user["id"], token)
        
        # Verificar que el usuario tenga acceso al gimnasio solicitado
        if user_data.get("gymId") != request.gymId:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes acceso a este gimnasio"
            )
        
        # Generar token específico para el QR
        qr_token = generate_qr_token(user_data, request.gymId)
          # Datos que irán en el QR
        qr_data = {
            "token": qr_token,
            "user_id": user_data["id"],
            "gym_id": request.gymId,
            "generated_at": get_spain_time().isoformat()
        }
        
        # Generar código QR
        qr_code_base64 = create_qr_code(json.dumps(qr_data))
          # Calcular expiración en hora de España
        spain_expires_at = (get_spain_time() + timedelta(minutes=15)).isoformat()
        
        return QRResponse(
            qr_code=qr_code_base64,
            qr_token=qr_token,
            expires_at=spain_expires_at,
            user_info={
                "id": user_data["id"],
                "name": user_data["name"],
                "email": user_data["email"],
                "role": user_data["role"],
                "gym": user_data.get("gym", {})
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

@app.post("/validate-gym-qr")
async def validate_gym_qr(
    qr_token: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Valida un código QR para acceso al gimnasio (para admins/trainers)
    """
    try:
        # Verificar que el usuario actual tenga permisos para validar
        if current_user.get("role") not in ["ADMIN", "TRAINER"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para validar códigos QR"
            )
        
        # Decodificar y validar el token del QR
        qr_payload = jwt.decode(qr_token, JWT_SECRET, algorithms=["HS256"])
        
        # Verificar tipo de token
        if qr_payload.get("type") != "gym_access_qr":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de token inválido"
            )
        
        return {
            "valid": True,
            "user_id": qr_payload["user_id"],
            "user_name": qr_payload["user_name"],
            "gym_id": qr_payload["gym_id"],
            "expires_at": qr_payload["exp"],
            "message": "Acceso autorizado al gimnasio"
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código QR expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código QR inválido"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al validar QR: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )


