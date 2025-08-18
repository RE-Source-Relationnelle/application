<<<<<<< HEAD
# Étape 1 : build du frontend (React)
=======
>>>>>>> 4de2cf4a3725c1d99bf8b912ea2f0e6f368451b7
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

<<<<<<< HEAD
# Étape 2 : serveur Nginx pour servir les fichiers statiques
FROM nginx:alpine
# On supprime la conf par défaut pour éviter les conflits
RUN rm -f /etc/nginx/conf.d/default.conf
# Conf Nginx minimale pour SPA (fallback vers index.html)
=======
FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf
>>>>>>> 4de2cf4a3725c1d99bf8b912ea2f0e6f368451b7
COPY <<'NGINX' /etc/nginx/conf.d/app.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;

  location / {
    try_files $uri /index.html;
  }
<<<<<<< HEAD

  # Exemple de proxy API si besoin (à activer et adapter) :
  # location /api/ {
  #   proxy_pass http://backend:5000;
  #   proxy_http_version 1.1;
  #   proxy_set_header Upgrade $http_upgrade;
  #   proxy_set_header Connection 'upgrade';
  #   proxy_set_header Host $host;
  #   proxy_cache_bypass $http_upgrade;
  # }
}
NGINX

# Copier le résultat du build vers le dossier web d'Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port HTTP
=======
}
NGINX

COPY --from=build /app/dist /usr/share/nginx/html
>>>>>>> 4de2cf4a3725c1d99bf8b912ea2f0e6f368451b7
EXPOSE 80
