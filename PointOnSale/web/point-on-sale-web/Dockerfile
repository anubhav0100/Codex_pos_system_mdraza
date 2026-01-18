# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
# Set build-time variables (they can be overridden by docker-compose if needed)
ARG VITE_API_URL=/
ENV VITE_API_URL=$VITE_API_URL

RUN npx vite build

# Production stage
FROM nginx:stable-alpine
# Copy custom nginx config
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
