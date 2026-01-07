# Deploying Kubernetes Monitoring Stack on Minikube
## Event Registration Application

This guide documents the complete process of deploying the Event Registration application on Minikube with a full monitoring stack (Prometheus & Grafana).

---

## 1. 🚀 Deployment Steps (What We Did)

1.  **Started Minikube**: initialized a local Kubernetes cluster.
    ```powershell
    minikube start --driver=docker
    ```
2.  **Configured Docker Env**: Pointed local Docker CLI to Minikube's Docker daemon.
    ```powershell
    minikube -p minikube docker-env --shell powershell | Invoke-Expression
    ```
3.  **Built Docker Image**: Created the container image for the app directly inside Minikube.
    ```powershell
    docker build -t event-registration:latest .
    ```
4.  **Deployed Services**:
    *   **Namespace**: Created `event-app` and `monitoring` namespaces.
    *   **Prometheus**: Deployed ConfigMap, RBAC, Deployment, and Service.
    *   **Grafana**: Deployed ConfigMap (Dashboards/Datasources), Deployment, and Service.
    *   **Application**: Deployed MongoDB (Cloud Atlas connected) and the Node.js App.

---

## 2. 🔗 Access Links & Credentials

Use these links to access the services running in Minikube.
*(Note: Terminal tunnels must be open for these to work)*

| Service | URL | Credentials | Description |
| :--- | :--- | :--- | :--- |
| **Event App** | [http://127.0.0.1:49302](http://127.0.0.1:49302) | - | The main application for registration. |
| **Grafana** | [http://127.0.0.1:49296](http://127.0.0.1:49296) | `admin` / `admin123` | Dashboard UI for viewing charts. |
| **Prometheus**| [http://127.0.0.1:49289](http://127.0.0.1:49289) | - | Metric collector and query interface. |

---

## 3. 🛠️ Managing the Application (Open/Close)

### **Starting Everything (Open)**
If you restarted your computer, follow these steps to bring it back up:
1.  **Start Minikube:**
    ```powershell
    minikube start
    ```
2.  **Open Tunnels (Run in separate terminals):**
    ```powershell
    minikube service event-registration -n event-app --url
    minikube service grafana -n monitoring --url
    minikube service prometheus -n monitoring --url
    ```

### **Stopping Everything (Close)**
To save resources when you are done:
1.  **Stop Minikube:**
    ```powershell
    minikube stop
    ```
2.  **Close Terminal Windows:** This kills the tunnel processes.

### **Local Dev (Optional)**
If you want to run the app **locally** without Kubernetes:
```powershell
# Start
npm run dev

# Stop
npm stop  (or Ctrl + C)
```

---

## 4. 📊 Prometheus Queries (PromQL)

Use these queries in **Grafana** (Explore tab) or **Prometheus** (Graph tab) to monitor your app.

### **Application Business Metrics**
| Query | Description |
| :--- | :--- |
| `participants_total` | **Total Participants**: Current count of registered users in DB. |
| `http_requests_total` | **Traffic**: Total number of HTTP requests received. |
| `http_requests_total{status_code="201"}` | **Successful Registrations**: Count of successful create requests. |

### **Performance Metrics**
| Query | Description |
| :--- | :--- |
| `rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])` | **Avg Latency**: Average response time over the last 5 minutes. |
| `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))` | **99th % Latency**: Worst-case performance (excluding top 1% outliers). |

### **Infrastructure Health**
| Query | Description |
| :--- | :--- |
| `up{job="event-registration"}` | **App Up/Down**: 1 = Healthy, 0 = Down. |
| `sum(rate(container_cpu_usage_seconds_total{pod=~"event-registration.*"}[5m]))` | **CPU Usage**: Total CPU used by app pods. |
| `sum(container_memory_usage_bytes{pod=~"event-registration.*"})` | **Memory Usage**: RAM consumed by app pods. |

---

## 5. 📂 Architectectural Overview

```
[ Browser ]
    │
    ├── Local Tunnels (minikube service)
    │
[ Minikube Cluster ]
    │
    ├── Namespace: event-app
    │     ├── Pod: event-registration (Node.js) ──▶ [ MongoDB Cloud Atlas ]
    │     │      │ (Exposes /metrics)
    │     │
    ├── Namespace: monitoring
          ├── Pod: Prometheus (Scrapes /metrics from App)
          └── Pod: Grafana (Reads data from Prometheus)
```
