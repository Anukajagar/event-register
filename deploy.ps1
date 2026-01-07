# Kubernetes Monitoring Stack Deployment Script
# Run this script after Minikube is started

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Kubernetes Monitoring Stack Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Check Minikube status
Write-Host "`n[1/7] Checking Minikube status..." -ForegroundColor Yellow
minikube status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Minikube is not running. Starting Minikube..." -ForegroundColor Red
    minikube start --driver=docker
}

# Step 2: Configure Docker to use Minikube's Docker daemon
Write-Host "`n[2/7] Configuring Docker environment for Minikube..." -ForegroundColor Yellow
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Step 3: Build Docker image
Write-Host "`n[3/7] Building Docker image for Event Registration App..." -ForegroundColor Yellow
docker build -t event-registration:latest .

# Step 4: Create Namespaces
Write-Host "`n[4/7] Creating Kubernetes namespaces..." -ForegroundColor Yellow
kubectl apply -f k8s/namespace.yaml

# Step 5: Deploy Prometheus Configuration and Deployment
Write-Host "`n[5/7] Deploying Prometheus..." -ForegroundColor Yellow
kubectl apply -f k8s/prometheus-config.yaml
kubectl apply -f k8s/prometheus-deployment.yaml

# Step 6: Deploy Grafana
Write-Host "`n[6/7] Deploying Grafana..." -ForegroundColor Yellow
kubectl apply -f k8s/grafana-deployment.yaml

# Step 7: Deploy Event Registration Application
Write-Host "`n[7/7] Deploying Event Registration Application..." -ForegroundColor Yellow
kubectl apply -f k8s/app-deployment.yaml

# Wait for deployments
Write-Host "`nWaiting for deployments to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check deployment status
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Deployment Status" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`n--- Event App Namespace ---" -ForegroundColor Cyan
kubectl get pods -n event-app
kubectl get svc -n event-app

Write-Host "`n--- Monitoring Namespace ---" -ForegroundColor Cyan
kubectl get pods -n monitoring
kubectl get svc -n monitoring

# Get URLs
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Access URLs (run these commands)" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "`nEvent Registration App:" -ForegroundColor White
Write-Host "  minikube service event-registration -n event-app" -ForegroundColor Yellow

Write-Host "`nPrometheus:" -ForegroundColor White
Write-Host "  minikube service prometheus -n monitoring" -ForegroundColor Yellow

Write-Host "`nGrafana:" -ForegroundColor White
Write-Host "  minikube service grafana -n monitoring" -ForegroundColor Yellow
Write-Host "  Login: admin / admin123" -ForegroundColor Gray

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
