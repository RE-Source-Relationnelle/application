
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf

COPY <<'NGINX' /etc/nginx/conf.d/app.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;

  location / {
    try_files $uri /index.html;
  }
}
NGINX

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
