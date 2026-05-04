# 🚀 DevOpsify 3-Tier EduConnect

A **production-grade DevOps project** demonstrating end-to-end automation using a **React.js + Spring Boot application** deployed on Kubernetes with GitOps, CI/CD, Infrastructure as Code, Security, and Monitoring.

---

# 📌 Project Overview

This repository acts as a **parent mono-repo** containing all components of a **3-tier architecture system**:

* **Frontend** → React.js application
* **Backend** → Spring Boot microservice
* **Infrastructure** → AWS provisioning using Terraform
* **GitOps** → Kubernetes manifests & Helm charts managed via ArgoCD

---

# 🏗️ Repository Structure

```
devopsify-3-tier-educonnect/
│
├── educonnect-frontend     # React.js frontend app
├── educonnect-backend      # Spring Boot backend service
├── educonnect-infra        # Terraform (EKS, VPC, IAM)
├── educonnect-gitops       # Kubernetes manifests + Helm + ArgoCD
├── eduops-notes            # Learning notes & documentation
```

---

# ⚙️ Tech Stack

## 🧱 Core

* Docker
* Kubernetes (EKS)
* Helm

## 🔄 CI/CD

* GitHub Actions (CI)
* Jenkins (advanced pipelines)

## 🚀 CD (GitOps)

* ArgoCD

## ☁️ Infrastructure

* Terraform (AWS EKS, VPC, IAM)

## 🔐 Security

* Trivy (image scanning)
* OWASP Dependency-Check
* Kubernetes Secrets / External Secrets

## 📊 Monitoring

* Prometheus
* Grafana

---

# 🔄 CI/CD Flow

```
Developer Push
↓
GitHub Actions (CI)
  - Build
  - Test
  - SonarQube
  - Security Scan (Trivy, OWASP)
  - Docker Build & Push
↓
Update GitOps Repo
↓
ArgoCD (CD)
↓
Kubernetes (EKS Cluster)
```

---

# ☁️ Infrastructure (Terraform)

Provisioned resources:

* VPC & Networking
* EKS Cluster
* Node Groups
* IAM Roles (IRSA)
* Security Groups

---

# 📦 Kubernetes Setup

* Deployments (Backend)
* Services (ClusterIP / NodePort)
* Ingress (AWS ALB)
* ConfigMaps & Secrets
* Helm Charts for packaging

---

# 🌐 Application Access

* **Ingress Controller**: AWS Load Balancer Controller
* **Domain**: `edubackend.viraldobariya.me`
* **SSL**: AWS ACM

---

# 🔐 Secrets Management

* AWS Parameter Store / Secrets Manager
* Managed via **External Secrets Operator**
* Secure access using **IAM Roles (IRSA)**

---

# 📊 Monitoring & Observability

* Prometheus → Metrics collection
* Grafana → Dashboards
* Health checks via `/actuator/health`

---

# 🚀 Key DevOps Highlights

* Multi-repo architecture with clear separation of concerns
* GitOps-based continuous deployment using ArgoCD
* Infrastructure provisioning using Terraform
* Secure secret management using External Secrets + AWS
* Fully automated CI/CD pipelines
* Production-grade Kubernetes deployment with ALB ingress
* Monitoring and observability integrated

---

# 🎯 Learning Outcomes

* End-to-end DevOps workflow implementation
* Kubernetes production deployment patterns
* GitOps vs traditional CD approaches
* Secure cloud-native architecture design
* CI/CD pipeline optimization

---

# 📌 How to Run (High-Level)

1. Provision infrastructure via Terraform
2. Install core components (ArgoCD, ALB Controller, External Secrets)
3. Push code → triggers CI pipeline
4. GitOps repo updates → ArgoCD deploys automatically

---

# ⚠️ Notes

* Requires AWS account with proper IAM permissions
* Ensure IRSA is configured for controllers
* Use correct Helm versions for CRDs (External Secrets, ALB Controller)

---

# 👨‍💻 Author

**Viral Dobariya**
DevOps | Cloud | Backend Engineer

---

# ⭐ Final Thought

This project demonstrates **real-world DevOps practices**, focusing on:

✔ Automation
✔ Scalability
✔ Security
✔ Maintainability

---
