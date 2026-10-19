# Build the local-first Atlas frontend.
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Static production runtime: no legacy Jant API, Prisma or ONNX dependency.
FROM nginx:1.27-alpine AS runner

COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

RUN sed -i 's/listen       80;/listen       3000;/' /etc/nginx/conf.d/default.conf \
    && sed -i 's/listen  \[::\]:80;/listen  [::]:3000;/' /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q -O - http://localhost:3000/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
