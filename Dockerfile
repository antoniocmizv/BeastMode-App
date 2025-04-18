FROM node:18

# Crear directorio app
WORKDIR /usr/src/app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install
RUN npx prisma generate 

# Copiar el resto del código
COPY . .

# Compilar TypeScript
RUN npm run build

# Exponer puerto de la API
EXPOSE 3000

# Comando por defecto
CMD ["node", "dist/index.js"]
