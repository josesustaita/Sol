FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY sol/package*.json ./
RUN npm ci --no-audit --no-fund
COPY sol/ ./
RUN npm test && npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/server.mjs /app/weather.mjs ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
