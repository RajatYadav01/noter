# Use the official Node.js LTS image
FROM node:23.11.0-alpine3.21

# Set the working directory inside the container
WORKDIR /app/noter-backend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY .env* ./
COPY database*.sql ./
COPY index.js ./
COPY controllers ./controllers
COPY middleware ./middleware
COPY models ./models
COPY routes ./routes
COPY services ./services
COPY utilities ./utilities

# Expose the port the app runs on
EXPOSE 3050

# Start the application
CMD ["node", "index.js"]