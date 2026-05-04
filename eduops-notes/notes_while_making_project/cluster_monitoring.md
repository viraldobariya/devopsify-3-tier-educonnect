# How to Monitor EKS Cluster with Prometheus and Grafana Using Helm

## Overview

The industry-standard approach for monitoring EKS clusters is deploying the **kube-prometheus-stack** Helm chart. This single chart bundles everything you need:
- **Prometheus** (metrics collection & storage)
- **Grafana** (visualization with 34+ pre-built dashboards)
- **Alertmanager** (alert routing)
- **Node Exporter** (node-level metrics)
- **kube-state-metrics** (Kubernetes object metrics)
- **Prometheus Operator** (manages everything via CRDs)



---

## Prerequisites

Before starting, ensure you have:

| Prerequisite | Verification Command |
|--------------|---------------------|
| EKS cluster running | `kubectl get nodes` |
| kubectl configured | `kubectl cluster-info` |
| Helm 3.12+ installed | `helm version` |
| EBS CSI driver installed | `kubectl get pods -n kube-system \| grep ebs` |



### Critical: EBS CSI Driver for Persistent Storage

Prometheus and Grafana need persistent storage. The EBS CSI driver **must be installed** with an IRSA role; otherwise, PVCs will stay in `Pending` state forever.

Create a `gp3` StorageClass (better IOPS than gp2 at no extra cost):

```bash
cat <<EOF | kubectl apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  fsType: ext4
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
EOF
```

---

## Step 1: Add Helm Repository and Create Namespace

```bash
# Add the Prometheus community Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Create a dedicated namespace for monitoring
kubectl create namespace monitoring
```



---

## Step 2: Create EKS-Optimized Values File

EKS manages the control plane, which means `etcd`, `kube-controller-manager`, and `kube-scheduler` metrics are **not accessible**. Disable these scrapers to avoid noisy error logs.

Create a file called `prom-values.yaml`:

```yaml
# Disable control plane components (EKS manages these)
kubeEtcd:
  enabled: false
kubeControllerManager:
  enabled: false
kubeScheduler:
  enabled: false

# Prometheus configuration
prometheus:
  prometheusSpec:
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: gp3
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 10Gi
    retention: 15d
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
      limits:
        memory: 2Gi

# Grafana configuration
grafana:
  adminPassword: "YourStrongPasswordHere"  # Change this!
  persistence:
    enabled: true
    storageClassName: gp3
    size: 5Gi

# Alertmanager configuration
alertmanager:
  alertmanagerSpec:
    storage:
      volumeClaimTemplate:
        spec:
          storageClassName: gp3
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 5Gi
```



---

## Step 3: Install kube-prometheus-stack

```bash
helm upgrade --install kube-prom-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f prom-values.yaml \
  --wait
```



### Verify Installation

```bash
# Check all pods are running
kubectl get pods -n monitoring

# Expected output (7+ pods all Running)
# NAME                                                        READY   STATUS    RESTARTS
# alertmanager-kube-prom-stack-alertmanager-0                 2/2     Running   0
# kube-prom-stack-grafana-6d8f9c7b4d-k2x9p                    3/3     Running   0
# kube-prom-stack-kube-state-metrics-5f8b7d6c4-m7n3q           1/1     Running   0
# kube-prom-stack-prometheus-node-exporter-abc12               1/1     Running   0
# kube-prom-stack-operator-7f9b8c6d5-p4r2t                    1/1     Running   0
# prometheus-kube-prom-stack-prometheus-0                      2/2     Running   0

# Verify PVCs are Bound (critical check!)
kubectl get pvc -n monitoring
# Each should show STATUS: Bound with gp3 StorageClass
```



---

## Step 4: Access Grafana

### Option 1: Port-Forward (Quick Local Access)

```bash
kubectl port-forward -n monitoring svc/kube-prom-stack-grafana 3000:80
```

Then open `http://localhost:3000` in your browser.

### Option 2: NodePort (Direct Access)

```bash
# Get the NodePort
kubectl get svc -n monitoring kube-prom-stack-grafana
# Access at: http://<worker-node-public-ip>:<node-port>
```

### Option 3: LoadBalancer (Production)

```bash
# Edit the service
kubectl edit svc -n monitoring kube-prom-stack-grafana
# Change type: ClusterIP to type: LoadBalancer
```

### Get Grafana Admin Password

```bash
# Using the password you set in values
# Or retrieve from secret if not set:
kubectl get secret -n monitoring kube-prom-stack-grafana \
  -o jsonpath="{.data.admin-password}" | base64 --decode
```

**Login credentials:**
- Username: `admin`
- Password: [the password from above]



---

## Step 5: Explore Pre-built Dashboards

The kube-prometheus-stack ships with **34+ pre-built dashboards**. Navigate to **Dashboards → Browse** in Grafana.

### Most Important Dashboards for EKS:

| Dashboard | What It Shows |
|-----------|---------------|
| **Kubernetes / Compute Resources / Cluster** | High-level CPU/memory usage across entire cluster |
| **Kubernetes / Compute Resources / Node (Pods)** | Per-node resource consumption |
| **Kubernetes / Compute Resources / Pod** | Container-level CPU/memory with requests/limits |
| **Kubernetes / Networking / Cluster** | Network traffic patterns |
| **Kubernetes / Persistent Volumes** | PV usage and capacity (prevents full volumes!) |
| **CoreDNS** | DNS latency and cache hit ratio |
| **Prometheus / Overview** | Prometheus self-health (scrape duration, ingestion rate) |



---

## Step 6: Access Prometheus UI Directly (Optional)

```bash
kubectl port-forward -n monitoring svc/kube-prom-stack-kube-prom-prometheus 9090:9090
```

Open `http://localhost:9090` to run PromQL queries directly.

**Example PromQL queries to test:**

```promql
# CPU usage by namespace
sum(rate(container_cpu_usage_seconds_total{container!=""}[5m])) by (namespace)

# Memory usage by pod
sum(container_memory_working_set_bytes{container!=""}) by (pod)

# Node memory availability
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes
```

---

## Step 7: Add Custom Alerts (Optional)

Create a `custom-alerts.yaml` file:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: custom-node-alerts
  namespace: monitoring
spec:
  groups:
  - name: node_alerts
    rules:
    - alert: HighMemoryUsage
      expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 80
      for: 2m
      labels:
        severity: warning
      annotations:
        summary: "High memory usage on {{ $labels.instance }}"
        description: "Memory usage is above 80% for 2+ minutes"

    - alert: PodCrashLooping
      expr: increase(kube_pod_container_status_restarts_total[5m]) > 3
      for: 1m
      labels:
        severity: warning
      annotations:
        summary: "Pod crash looping in {{ $labels.namespace }}"
        description: "Container {{ $labels.container }} restarted 3+ times in 5 minutes"
```

Apply the alert:

```bash
kubectl apply -f custom-alerts.yaml
```



---

## Step 8: Configure Alertmanager for Slack/Email (Optional)

Extend your `prom-values.yaml`:

```yaml
alertmanager:
  config:
    route:
      receiver: 'slack-notifications'
      group_by: ['alertname']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 1h
    receivers:
      - name: 'slack-notifications'
        slack_configs:
          - channel: '#alerts'
            api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/HERE'
            title: 'Kubernetes Alert'
            text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
```

Then upgrade:

```bash
helm upgrade kube-prom-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  -f prom-values.yaml
```



---

## Complete Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR EKS CLUSTER                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    kube-prometheus-stack                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐  │  │
│  │  │  Prometheus │  │   Grafana   │  │   Alertmanager    │  │  │
│  │  │ StatefulSet │  │  Deployment │  │   StatefulSet     │  │  │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬──────────┘  │  │
│  │         │                │                  │              │  │
│  │  ┌──────┴──────┐  ┌──────┴──────┐  ┌────────┴──────────┐  │  │
│  │  │kube-state- │  │node-exporter│  │Prometheus Operator│  │  │
│  │  │  metrics   │  │ (DaemonSet) │  │   (Deployment)    │  │  │
│  │  └────────────┘  └─────────────┘  └───────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                     ┌────────┴────────┐                         │
│                     │  gp3 PVCs       │                         │
│                     │  (EBS volumes)  │                         │
│                     └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
          Port-Forward    LoadBalancer    NodePort
          (localhost)     (Production)    (Testing)
                │              │              │
                ▼              ▼              ▼
           http://local:   http://ALB-   http://node:
              3000           DNS/          30080
```



---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| PVC stuck in Pending | EBS CSI driver not installed; verify with `kubectl get pods -n kube-system \| grep ebs` |
| No data in dashboards | Check Prometheus targets: port-forward to 9090 and visit `/targets` |
| Can't access Grafana | Ensure port-forward is running; try NodePort or LoadBalancer instead |
| Alertmanager not sending | Verify Slack webhook URL and network connectivity |
| Prometheus consuming too much memory | Reduce `retention` or limit `scrapeInterval` in values |



---

## Summary

The complete monitoring stack deploys in **under 5 minutes** with this single command:

```bash
helm upgrade --install kube-prom-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace -f prom-values.yaml --wait
```

This gives you:
- ✅ **34+ pre-built Grafana dashboards** for immediate visibility
- ✅ **Persistent storage** with gp3 volumes (15-day retention default)
- ✅ **Automatic metrics collection** from nodes, pods, and services
- ✅ **Alerting** ready to configure for Slack/email
- ✅ **Production-ready** configuration tuned for EKS

The kube-prometheus-stack is the industry standard because it reduces setup time from hours to minutes and follows Kubernetes best practices out of the box.