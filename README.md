# 🚀 DevOps-Driven Three-Tier Deployment System

## 📌 Overview

This project demonstrates a **production-grade DevOps architecture** for deploying a full-stack application using:

* **React.js (Frontend)**
* **Spring Boot (Backend)**
* **AWS EKS (Kubernetes)**
* **Terraform (Infrastructure as Code)**
* **GitHub Actions + Jenkins (CI)**
* **ArgoCD (GitOps CD)**

🎯 **Goal:** Showcase real-world DevOps practices for 8–10 LPA roles.

---

# 🏗️ Architecture

```
Developer → GitHub → CI (GitHub Actions / Jenkins)
        → Docker Image → Registry (ECR/DockerHub)
        → GitOps Repo Update
        → ArgoCD → Kubernetes (EKS)
```

---

# 📁 Repository Structure

| Repository    | Description                        |
| ------------- | ---------------------------------- |
| frontend-repo | React.js application               |
| backend-repo  | Spring Boot application            |
| infra-repo    | Terraform (AWS EKS, VPC, IAM)      |
| gitops-repo   | Kubernetes manifests / Helm charts |

---

# ⚙️ Tech Stack

## Core

* Docker
* Kubernetes
* Helm

## CI/CD

* GitHub Actions (Primary CI)
* Jenkins (Advanced Pipelines)

## CD (GitOps)

* ArgoCD

## Infrastructure

* Terraform (AWS EKS)

## Security & Quality

* SonarQube
* Trivy
* OWASP Dependency-Check

## Monitoring

* Prometheus
* Grafana

---

# 🔄 CI/CD Workflow

## 🔵 GitHub Actions (CI)

Triggered on every push:

* Build application
* Run unit tests
* Code quality analysis (SonarQube)
* Security scans:

  * Trivy
  * OWASP Dependency-Check
* Build Docker image
* Push image to registry

---

## 🟠 Jenkins (Advanced CI)

* Integration testing
* API testing (Postman/Newman)
* Performance testing (JMeter)
* Scheduled jobs

---

## 🟢 ArgoCD (CD)

* Watches GitOps repo
* Syncs changes automatically
* Deploys to Kubernetes cluster

---

# ☁️ Infrastructure (Terraform)

Provisioned resources:

* VPC & Networking
* EKS Cluster
* Node Groups
* IAM Roles (IRSA)

---

# 📦 Kubernetes Setup

* Deployments (Frontend & Backend)
* Services (ClusterIP)
* Ingress (AWS ALB)
* ConfigMaps & Secrets
* Helm Charts

---

# 📊 Monitoring

## Prometheus

* Collects cluster & app metrics

## Grafana

* Dashboards:

  * CPU / Memory
  * Pod health
  * Application metrics

---

# 🔐 Security

* Trivy → Container scanning
* OWASP → Dependency scanning
* Kubernetes Secrets / External Secrets
* IAM Roles for Service Accounts (IRSA)

---

# 🧪 Testing Strategy

## GitHub Actions

* Unit tests
* Static code analysis
* Security scans

## Jenkins

* Integration tests
* End-to-end tests
* Performance tests

---

# 🚀 Getting Started

## 1. Clone Repositories

```
git clone <frontend-repo>
git clone <backend-repo>
git clone <infra-repo>
git clone <gitops-repo>
```

---

## 2. Provision Infrastructure

```
cd infra-repo
terraform init
terraform apply
```

---

## 3. Deploy ArgoCD

```
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

---

## 4. Connect GitOps Repo

* Add application in ArgoCD
* Sync manifests

---

## 5. Access Application

* Use Ingress URL (ALB DNS / custom domain)

---

# 📈 Key Features

* Multi-repo architecture
* End-to-end CI/CD pipeline
* GitOps-based deployment
* Infrastructure as Code
* Secure secret management
* Observability with monitoring stack

---

# 🎯 Resume Highlights

* Designed scalable DevOps architecture using multi-repo strategy
* Implemented CI pipelines with security and quality checks
* Automated infrastructure provisioning using Terraform
* Enabled GitOps deployments using ArgoCD
* Integrated monitoring with Prometheus & Grafana

---

# ✅ Success Checklist

* [x] Dockerized frontend & backend
* [x] Kubernetes deployment working
* [x] CI pipeline implemented
* [x] Jenkins pipelines added
* [x] ArgoCD auto-deployment working
* [x] Terraform infra provisioned
* [x] Monitoring dashboards setup
* [x] Security scans integrated

---

# 🔥 Final Note

This project demonstrates:

* Real-world DevOps workflows
* Automation-first mindset
* Production-grade architecture

👉 Focus is on **DevOps thinking, not just tools**
