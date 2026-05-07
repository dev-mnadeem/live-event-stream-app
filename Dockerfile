FROM node:22-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --ignore-scripts
COPY frontend/ ./
ARG REACT_APP_SOCKET_URL=http://localhost:3001
RUN npm run build
FROM node:22-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --ignore-scripts
COPY backend/ ./
RUN npm run build && npm prune --omit=dev --ignore-scripts
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3001
COPY --from=backend --chown=node:node /app/dist ./dist
COPY --from=backend --chown=node:node /app/node_modules ./node_modules
COPY --from=frontend --chown=node:node /app/build ./public
USER node
EXPOSE 3001
CMD ["node","dist/main.js"]
