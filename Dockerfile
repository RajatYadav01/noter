# Stage 1: Use the official Node.js LTS image
FROM node:23.11.0-alpine3.21 AS build

# Set working directory
WORKDIR /app/noter-frontend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY .env* ./
COPY index.html ./
COPY src ./src
COPY public ./public
COPY eslint.config.js ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Build the app for production
RUN npm run build

# Stage 2: Serve the app using a web server like Nginx
FROM nginx:alpine

# Copy the build output to Nginx's public folder
COPY --from=build /app/noter-frontend/dist /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]