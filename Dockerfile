FROM node:18

ENV NODE_ENV=development  

# Crear directorio app
WORKDIR /usr/src/app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

RUN npx prisma generate 
# Compilar TypeScript
RUN npm run build

# Exponer puerto de la API
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "dev"]