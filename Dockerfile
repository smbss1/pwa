# Utiliser une image légère basée sur Node.js pour construire l'application React
FROM node:14-alpine as build

# Créer et définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de l'application vers le répertoire de travail
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Construire l'application React
RUN npm run build

# Utiliser une image légère basée sur Nginx pour servir l'application construite
FROM nginx:alpine

# Copier les fichiers de build depuis le conteneur de build vers le répertoire public de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exposer le port sur lequel Nginx servira l'application
EXPOSE 3000

# La commande CMD n'est pas nécessaire pour l'image Nginx, elle utilise la configuration par défaut
