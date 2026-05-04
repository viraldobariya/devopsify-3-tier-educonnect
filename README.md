# 🚀 DevOpsify 3-Tier EduConnect

A **production-grade DevOps project** implementing a full **3-tier architecture** with separate CI/CD pipelines, GitOps deployment, and cloud-native infrastructure.

---

# 📌 Project Overview

This repository acts as a **parent repo** containing all components of a scalable system:

* **Frontend** → React.js (deployed on S3 + CloudFront)
* **Backend** → Spring Boot (deployed on Kubernetes via ArgoCD)
* **Infrastructure** → AWS provisioned using Terraform
* **GitOps** → Kubernetes manifests managed via ArgoCD

---

# 🏗️ Repository Structure

```id="z3r9q1"
devopsify-3-tier-educonnect/
│
├── educonnect-frontend     # React.js frontend (S3 + CloudFront)
├── educonnect-backend      # Spring Boot backend (Kubernetes)
├── educonnect-infra        # Terraform (Jenkins CI/CD)
├── educonnect-gitops       # Helm charts + ArgoCD apps
├── eduops-notes            # Learning notes
```

---

# ⚙️ Tech Stack

## 🧱 Core

* Docker
* Kubernetes (EKS)
* Helm

## 🔄 CI/CD

* GitHub Actions → Frontend & Backend CI/CD
* Jenkins → Infrastructure CI/CD (Terraform with approval gate)

## 🚀 CD (GitOps)

* ArgoCD

## ☁️ Infrastructure

* Terraform (AWS: EKS, VPC, IAM, S3, CloudFront)

## 🔐 Security

* Trivy
* OWASP Dependency-Check
* External Secrets (AWS Parameter Store)

## 📊 Monitoring

* Prometheus
* Grafana

---

# 🔄 CI/CD Architecture

## 🔵 Frontend Pipeline (GitHub Actions)

```id="p3kz2s"
Code Push
↓
Build React App
↓
Upload to S3
↓
Invalidate CloudFront Cache
```

---

## 🔵 Backend Pipeline (GitHub Actions)

```id="l6rj8x"
Code Push
↓
Build (Maven/Gradle)
↓
Security Scans (Trivy, OWASP)
↓
Docker Build & Push 
↓
Update GitOps Repo
```

---

## 🟠 Infrastructure Pipeline (Jenkins)

```id="d9m1vb"
Terraform Init
↓
Terraform Plan
↓
Manual Approval (Gate)
↓
Terraform Apply
↓
Provision AWS Resources:
  - VPC
  - EKS Cluster
  - IAM Roles (IRSA)
  - S3 + CloudFront
```

👉 Includes a **manual approval step** to ensure safe infrastructure changes.

---

## 🟢 Deployment Flow (GitOps)

```id="k8z4qm"
GitOps Repo Update
↓
ArgoCD Watches Repo
↓
Auto Sync
↓
Deploy Backend to Kubernetes (EKS)
```

---

# 🌐 Application Architecture

## Frontend

* Hosted on **AWS S3**
* Delivered via **Amazon CloudFront**
* Public access via custom domain

## Backend

* Deployed on **Kubernetes (EKS)**
* Exposed via **AWS ALB Ingress Controller**
* Auto-deployed using ArgoCD

---

# ☁️ Infrastructure (Terraform)

Provisioned resources:

* VPC & Networking
* EKS Cluster (private nodes)
* IAM Roles (IRSA)
* S3 Bucket (frontend hosting)
* CloudFront Distribution
* Security Groups

---

# 📦 Kubernetes Setup

* Deployments (Backend)
* Services (ClusterIP)
* Ingress (AWS ALB)
* ConfigMaps & Secrets
* Helm Charts

---

# 🔐 Secrets Management

* AWS Parameter Store & AWS Seccrets Manager
* Managed via External Secrets Operator
* Secure access using IAM Roles (IRSA)

---

# 📊 Monitoring & Observability

* Prometheus → Metrics collection
* Grafana → Dashboards
* Health endpoint: `/actuator/health`

---

# 🚀 Key DevOps Highlights

* 🔹 Multi-repo architecture with clear separation
* 🔹 Separate CI/CD pipelines (frontend, backend, infra)
* 🔹 GitOps-based deployment using ArgoCD
* 🔹 Frontend hosted on S3 + CDN (CloudFront)
* 🔹 Backend deployed on Kubernetes (EKS)
* 🔹 Manual approval gate for infrastructure changes
* 🔹 Secure secret management using External Secrets
* 🔹 IRSA-based authentication for AWS services
* 🔹 Production-grade ALB ingress setup

---

# 📌 How to Run (High-Level)

1. Run Terraform via Jenkins → provision infra
2. Deploy ArgoCD & core controllers
3. Push frontend/backend code
4. CI pipelines trigger automatically
5. ArgoCD deploys backend to Kubernetes
6. Frontend served via CloudFront

---

# ⚠️ Notes

* Requires AWS account with proper IAM permissions
* IRSA must be configured correctly
* DNS should point to CloudFront / ALB

---

# 👨‍💻 Author

**Viral Dobariya**
DevOps | Cloud | Backend Engineer

---

# ⭐ Final Thought

This project demonstrates:

✔ Real-world CI/CD separation
✔ Safe infrastructure deployment (approval gates)
✔ GitOps-based delivery
✔ Cloud-native scalable architecture

---
