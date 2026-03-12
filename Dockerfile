# ===============================
# Build stage
# ===============================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ===============================
# Runtime stage
# ===============================
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

# Diretórios necessários
RUN mkdir -p /app/uploads/temp

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]