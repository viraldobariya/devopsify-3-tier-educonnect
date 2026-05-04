# Stage 1: Build the React app
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy all source code
COPY . ./

# Build the app for production
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:stable-alpine AS production

# Copy built files from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Optional: copy custom nginx config for SPA routing
# COPY nginx.conf /etc/nginx/conf.d/

# Expose port
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]