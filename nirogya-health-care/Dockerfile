# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npx vite build

# Production stage
FROM nginx:stable-alpine
# Copy custom nginx config
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
