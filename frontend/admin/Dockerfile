# Build stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

# Bake base URL to use relative path in prod so Nginx can proxy it
ENV VITE_API_BASE_URL=/api/v1
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
