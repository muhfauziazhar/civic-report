# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY web/package.json web/
COPY e2e/package.json e2e/
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage — server only, serving the built frontend
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
RUN npm ci --omit=dev --workspace=server
COPY --from=build /app/server/dist server/dist
COPY --from=build /app/web/dist server/public
EXPOSE 3001
USER node
CMD ["node", "server/dist/index.js"]
