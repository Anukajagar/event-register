# Event Registration Application with Kubernetes Monitoring Stack

A complete Event Registration Web Application with CRUD operations, deployed on Kubernetes (Minikube) with Prometheus and Grafana monitoring.

## 📁 Project Structure

```
event-regestration/
├── server.js                    # Node.js backend with Express & MongoDB
├── package.json                 # Dependencies
├── Dockerfile                   # Docker image config
├── deploy.ps1                   # Deployment script
├── public/
│   ├── index.html              # Frontend HTML
│   ├── style.css               # CSS styling
│   └── script.js               # JavaScript CRUD logic
└── k8s/
    ├── namespace.yaml          # Kubernetes namespaces
    ├── app-deployment.yaml     # App & MongoDB deployment
    ├── prometheus-config.yaml  # Prometheus configuration
    ├── prometheus-deployment.yaml  # Prometheus deployment
    └── grafana-deployment.yaml # Grafana deployment
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Minikube
- kubectl

### Deploy to Kubernetes

1. **Start Minikube**
   ```powershell
   minikube start --driver=docker
   ```

2. **Configure Docker for Minikube**
   ```powershell
   minikube -p minikube docker-env --shell powershell | Invoke-Expression
   ```

3. **Build Docker Image**
   ```powershell
   docker build -t event-registration:latest .
   ```

4. **Deploy all components**
   ```powershell
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/prometheus-config.yaml
   kubectl apply -f k8s/prometheus-deployment.yaml
   kubectl apply -f k8s/grafana-deployment.yaml
   kubectl apply -f k8s/app-deployment.yaml
   ```

5. **Or use the deployment script**
   ```powershell
   .\deploy.ps1
   ```

## 🔗 Access URLs

Get service URLs using:

```powershell
# Event Registration App
minikube service event-registration -n event-app --url

# Prometheus
minikube service prometheus -n monitoring --url

# Grafana
minikube service grafana -n monitoring --url
```

## 📊 Monitoring Stack

### Prometheus
- **Purpose**: Collects metrics from the application
- **Metrics Endpoint**: `/metrics`
- **Access**: Run `minikube service prometheus -n monitoring`

### Grafana
- **Purpose**: Visualizes metrics in dashboards
- **Login**: `admin` / `admin123`
- **Access**: Run `minikube service grafana -n monitoring`
- **Pre-configured**: Prometheus datasource + Kubernetes dashboard

## 📈 Application Metrics

The application exposes these Prometheus metrics:

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | Request duration |
| `participants_total` | Gauge | Total registered participants |

## 🛠️ Useful Commands

```powershell
# Check pod status
kubectl get pods -n event-app
kubectl get pods -n monitoring

# View logs
kubectl logs -f deployment/event-registration -n event-app
kubectl logs -f deployment/prometheus -n monitoring
kubectl logs -f deployment/grafana -n monitoring

# Restart deployments
kubectl rollout restart deployment/event-registration -n event-app

# Delete everything
kubectl delete namespace event-app monitoring
```

## 🐳 Local Development

To run locally (without Kubernetes):

```powershell
npm install
npm start
```

Then open http://localhost:3000

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/participants` | Get all participants |
| GET | `/api/participants/:id` | Get single participant |
| POST | `/api/participants` | Create participant |
| PUT | `/api/participants/:id` | Update participant |
| DELETE | `/api/participants/:id` | Delete participant |
| GET | `/metrics` | Prometheus metrics |
| GET | `/health` | Health check |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Minikube Cluster                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    event-app namespace                       ││
│  │  ┌──────────────────┐    ┌──────────────────┐               ││
│  │  │ Event Reg App    │───▶│    MongoDB       │               ││
│  │  │ (2 replicas)     │    │   (1 replica)    │               ││
│  │  └──────────────────┘    └──────────────────┘               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    monitoring namespace                      ││
│  │  ┌──────────────────┐    ┌──────────────────┐               ││
│  │  │   Prometheus     │───▶│    Grafana       │               ││
│  │  │   (metrics)      │    │  (dashboards)    │               ││
│  │  └──────────────────┘    └──────────────────┘               ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```
