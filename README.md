# BeastMode Backend

Este es el backend del proyecto BeastMode, desarrollado con Node.js, Express y Prisma. Proporciona una API para gestionar usuarios, gimnasios, clases y suscripciones.

## Estructura del Proyecto

- **`src/`**: Contiene el código fuente principal.
  - **`controllers/`**: Controladores para manejar la lógica de las rutas.
  - **`middlewares/`**: Middlewares para la autenticación y otras funcionalidades.
  - **`routes/`**: Definición de las rutas de la API.
  - **`services/`**: Servicios para manejar la lógica de negocio.
  - **`utils/`**: Utilidades como generación y verificación de JWT.
- **`prisma/`**: Configuración de Prisma, incluyendo el esquema y las migraciones.
- **`docker-compose.yml`**: Configuración para desplegar el proyecto con Docker.
- **`Dockerfile`**: Archivo para construir la imagen del backend.

## Requisitos Previos

- Docker y Docker Compose instalados.
- Node.js y npm instalados (opcional para desarrollo local).

## Despliegue con Docker

1. Clona este repositorio:

   ```bash
   git clone (https://github.com/antoniocmizv/BeastMode-App.git)
   cd beastmode-backend
   ```

2. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno:

   ```env
      DATABASE_URL="postgresql://beastuser:beastpass@db:5432/beastmode"
      JWT_SECRET=supersecret
   ```

3. Construye y levanta los contenedores:

   ```bash
   docker-compose up -d --build
   ```

4. Accede a la API en [http://localhost:3000](http://localhost:3000).

## Uso de Prisma

- Para abrir Prisma Studio y gestionar la base de datos:

  ```bash
  docker-compose exec backend npx prisma studio --hostname=0.0.0.0
  ```

## Migraciones

- Para aplicar migraciones:

  ```bash
  docker-compose exec backend npx prisma migrate deploy
  ```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo.
- `npm run build`: Compila el proyecto.
- `npm start`: Inicia el servidor en producción.

## Variables de Entorno

- `JWT_SECRET`: Secreto para firmar y verificar JWT.
- `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL.

## Ejecución Local

1. Clona el repositorio y entra al directorio:
   ```bash
   git clone https://github.com/antoniocmizv/BeastMode-App.git
   cd beastmode-backend
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Copia `.env.example` a `.env` y ajusta las variables.
4. Levanta el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
5. La API estará disponible en `http://localhost:${PORT||3000}`.

## Endpoints de la API

### Autenticación
- `POST /api/auth/register`  
  Registra un usuario. Body: `{ name, email, password }`
- `POST /api/auth/login`  
  Obtiene JWT. Body: `{ email, password }`

### Usuarios
- `GET /api/users`  
- `GET /api/users/:id`
- `PUT /api/users/:id`  
- `DELETE /api/users/:id`

### Gimnasios
- `GET /api/gyms`
- `GET /api/gyms/:id`
- `POST /api/gyms`
- `PUT /api/gyms/:id`
- `DELETE /api/gyms/:id`

### Clases
- `GET /api/classes`
- `GET /api/classes/:id`
- `POST /api/classes`
- `PUT /api/classes/:id`
- `DELETE /api/classes/:id`

### Suscripciones
- `GET /api/subscriptions`
- `GET /api/subscriptions/:id`
- `POST /api/subscriptions`
- `PUT /api/subscriptions/:id`
- `DELETE /api/subscriptions/:id`

## Prisma & Base de Datos

- Abrir Prisma Studio:
  ```bash
  npx prisma studio
  ```
- Crear/aplicar migraciones:
  ```bash
  npx prisma migrate dev
  ```
- Desplegar migraciones en producción:
  ```bash
  npx prisma migrate deploy
  ```

## Licencia

Este proyecto está bajo la licencia MIT.

