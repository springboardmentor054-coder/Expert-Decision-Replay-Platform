# Build stage — compiles the Vite/React app into static files
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite bakes VITE_* vars into the bundle at build time, not runtime,
# so this must be passed as a build arg (see docker-compose.yml).
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Serve stage — a small nginx image just to serve the built static files
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
