# Linux Deployment Guide: PointOnSale Application Stack

This document outlines the steps to deploy the PointOnSale system (Backend, Frontend, and Nirogya Website) onto a Linux server (Ubuntu/Debian recommended) using Docker Compose.

---

## 1. Server Prerequisites

### Install Docker & Docker Compose
```bash
# Update package index
sudo apt-get update

# Install Docker
sudo apt-get install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo apt-get install docker-compose -y
```

### Database Preparation
The application currently expects an external SQL Server.
1. Ensure your SQL Server (on Linux or Windows) is accessible from the Docker network.
2. Note the connection string: `Server=<IP_OR_HOST>;Database=PointOnSaleDb;User Id=<USER>;Password=<PASS>;...`

---

## 2. Project Directory Structure

On the server, you only need the `docker-compose.yml` file to start the services if you are using pre-built images.

```text
/opt/pointonsale/
└── docker-compose.yml
```

---

## 3. Configuration

### Update `docker-compose.yml` for Production
Edit your `docker-compose.yml` to use tagged images from Docker Hub.

```yaml
version: "3.9"

services:
  backend:
    image: anubhav0100/pointonsale-backend:latest
    ports:
      - "5011:8080" # Host Port : Container Port
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_HTTP_PORTS=8080
      - ASPNETCORE_URLS=http://+:8080
      # IMPORTANT: Update with your real DB credentials
      - ConnectionStrings__DefaultConnection=Server=<SERVER_IP>;Database=PointOnSaleDb;User Id=<DB_USER>;Password=<DB_PASS>;TrustServerCertificate=True;MultipleActiveResultSets=true
    networks:
      - pos-network

  frontend:
    image: anubhav0100/pointonsale-frontend:latest
    environment:
      - VITE_API_URL=/v1
    depends_on:
      - backend
    ports:
      - "5010:80"
    networks:
      - pos-network

  nirogya-website:
    image: anubhav0100/nirogya-website:latest
    ports:
      - "5012:80"
    networks:
      - pos-network

networks:
  pos-network:
    driver: bridge
```

---

## 4. Deployment Steps

### Step 1: Copy `docker-compose.yml`
Transfer your `docker-compose.yml` to the server's `/opt/pointonsale/` directory.

### Step 2: Pull and Start Containers
Run the following commands from the `/opt/pointonsale/` directory:

```bash
# Pull the latest images from Docker Hub
sudo docker-compose pull

# Start the services in detached mode
sudo docker-compose up -d
```

### Step 3: Verify Services
Check the status of your containers:
```bash
sudo docker-compose ps
```

- **Frontend (POS)**: Accessible at `http://your-server-ip:5010`
- **Backend API**: Accessible at `http://your-server-ip:5011/v1`
- **Nirogya Website**: Accessible at `http://your-server-ip:5012`

---

## 5. Troubleshooting (Linux Specific)

### 1. Firewall (UFW)
Ensure the new ports are open:
```bash
sudo ufw allow 5010/tcp
sudo ufw allow 5011/tcp
sudo ufw allow 5012/tcp
```

### 2. Database Connectivity
If the backend cannot reach the SQL Server:
- Check if the SQL Server is listening on the network (not just localhost).
- Ensure the firewall on the SQL Server machine allows incoming connections from the Linux server's IP.

### 3. File Permissions
If Docker fails to copy files during build:
```bash
sudo chown -R $USER:$USER /opt/pointonsale
```

---
> [!IMPORTANT]
> Always run migrations or ensure the database schema is up-to-date before starting the backend for the first time on a new server.
