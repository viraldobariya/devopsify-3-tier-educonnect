# 🚀 AWS EKS — **Production & Real-World Master Notes**

---

# 🧠 0. Ultimate Mental Model (Never Forget This)

```text
EKS = Managed Control Plane + Your Infrastructure + Kubernetes
```

---

## 🔥 Responsibility Split

### AWS manages (Control Plane):

* API Server
* etcd
* Scheduler
* Controller Manager
* HA & scaling of control plane

---

### YOU manage (Data Plane + Infra):

* EC2 worker nodes / Fargate
* VPC & networking
* IAM roles & permissions
* Kubernetes objects (pods, services, ingress)
* Scaling & cost
* Monitoring & logging

---

## 🧭 Golden Insight

> Kubernetes decides **WHAT should happen**
> AWS (ALB, VPC, EC2) executes **HOW traffic flows**

---

# 🧩 1. End-to-End Architecture (Real Flow)

```text
Client
 → ALB (Ingress Controller)
 → Target Group
 → Pod IP
 → Container
```

Infra layer:

```text
VPC → Subnets → Nodes → Pods
```

---

# 🏗️ 2. VPC DESIGN (Foundation of Everything)

---

## ✅ Production Standard Layout

| Component      | Subnet Type |
| -------------- | ----------- |
| ALB            | Public      |
| Worker Nodes   | Private     |
| Database (RDS) | Private     |

---

## Typical Setup:

* 1 VPC
* 2+ Availability Zones

### Subnets:

* 2 Public Subnets (ALB)
* 2 Private Subnets (Nodes)
* 2 Private Subnets (DB)

---

## 🔥 Why this matters

* Security → nodes not exposed
* Scalability → multi-AZ
* ALB must be public-facing

---

## 🔥 Required Networking Components

* Internet Gateway (for public subnets)
* NAT Gateway (for private nodes outbound access)
* Route Tables correctly mapped

---

## ⚠️ CRITICAL: Subnet Tagging

Without this, ALB WILL NOT WORK.

### Public:

```
kubernetes.io/role/elb = 1
```

### Private:

```
kubernetes.io/role/internal-elb = 1
```

### Cluster association(Optional for single cluster inside vpc environment):

```
kubernetes.io/cluster/<cluster-name> = shared
```

---

# ⚙️ 3. EKS CLUSTER (Control Plane)

---

## What gets created:

* Kubernetes API endpoint
* Control plane (hidden, managed)
* ENIs in your VPC

---

## 🔐 API Access Configuration

```hcl
endpoint_public_access  = true
endpoint_private_access = true
```

* public endpoint for accessing API Server remotely from internet.
* private endpoint is used by resources inside your vpc(worker nodes) to access API Server privately. Also it requires to mention private_subnet_ids of your worker nodes inside vpc_config of cluster configuration, to create endpoint ENIs in each private subnet. These ENIs are required to access private endpoint of Cluster API Server.

---

## 🔥 Production Best Practice

* Prefer **private endpoint** only if possible.
* Access remotely via:

  * VPN
  * Bastion host

---

## ⚠️ Important Reality

> Control plane is NOT inside your VPC
> But it connects to your nodes via ENIs

---

# 🖥️ 4. NODE GROUPS (Compute Layer)

---

## Types

### ✅ Managed Node Group (Recommended)

* AWS manages lifecycle
* Auto scaling integrated

---

### ⚠️ Self-managed

* Full control
* More complexity

---

### ⚡ Fargate

* Serverless pods
* No node management

---

## 🔥 What a Node Actually Is

```text
EC2 + kubelet + container runtime + CNI
```

---

## Must-have Node IAM Policies:

* AmazonEKSWorkerNodePolicy
* AmazonEKS_CNI_Policy
* AmazonEC2ContainerRegistryReadOnly

---

## ⚠️ Common Failures

* Nodes not joining → IAM issue
* No internet → missing NAT
* Wrong subnet → no connectivity

---

# 🌐 5. NETWORKING (MOST CRITICAL PART)

---

## 🔥 Amazon VPC CNI

### Key Concept:

```text
Pod IP = VPC IP
```

---

## How it works:

1. Node gets ENI
2. ENI gets multiple IPs
3. Pods are assigned those IPs

---

## ⚠️ Real Production Problem

👉 **IP exhaustion**

---

## Formula:

```text
Max Pods = ENIs × IPs per ENI
```

Depends on EC2 instance type.

---

## ✅ Solutions

* Enable prefix delegation
* Configure:

  * WARM_IP_TARGET
  * MINIMUM_IP_TARGET

---

# 🔄 6. SERVICES (Internal Traffic Layer)

---

## Important Truth:

> Service is NOT a load balancer

It is:

```text
ClusterIP + iptables rules + endpoints
```

---

## Types

| Type         | Use Case               |
| ------------ | ---------------------- |
| ClusterIP    | Internal communication |
| NodePort     | Debugging              |
| LoadBalancer | Creates NLB            |
| Ingress      | Production routing     |

---

## 🔥 Real Behavior in EKS

* kube-proxy manages routing
* Uses iptables/IPVS

---

# 🌍 7. INGRESS + ALB (Production Traffic Entry)

---

## Component:

👉 AWS Load Balancer Controller

---

## What it does:

* Watches Kubernetes resources
* Calls AWS APIs
* Creates ALB automatically

---

## 🔥 Flow:

```text
Ingress YAML
 → Controller
 → AWS API
 → ALB created
```

---

## 🔥 Traffic Flow (REAL)

```text
Client
 → ALB
 → Target Group
 → Pod IP
```

---

## 🎯 Target Types

### ✅ IP Mode (Recommended)

```text
ALB → Pod IP directly
```

---

### ❌ Instance Mode

```text
ALB → Node → kube-proxy → Pod
```

---

## ⚠️ Requirements

* OIDC enabled (done by making OpenID Connect Provider for EKS cluster)
* IRSA configured (IAM Role for Service Account, it depends on OIDC)
* Subnets tagged

---

# 🔐 8. IAM & SECURITY (MOST COMMON FAILURE AREA)

---

## 1. Cluster Role

* AmazonEKSClusterPolicy
* AmazonEKSVPCResourceController

---

## 2. Node Role

* WorkerNodePolicy
* CNI Policy
* ECR ReadOnly

---

## 🔥 3. IRSA (VERY IMPORTANT)

### Problem:

Without IRSA:

```text
Pods use Node IAM Role ❌
```

---

### Solution:

```text
Pod → ServiceAccount → IAM Role
```

---

### Requires:

* OIDC provider
* Trust policy
* Annotation on ServiceAccount

---

## Example:

```yaml
annotations:
  eks.amazonaws.com/role-arn: arn:aws:iam::xxx:role/s3-access
```

---

## 🔐 Security Layers

| Layer       | Responsibility    |
| ----------- | ----------------- |
| VPC         | Isolation         |
| SecurityGrp | Traffic filtering |
| IAM         | AWS access        |
| RBAC        | Kubernetes access |

---

# 🔁 9. CORE KUBERNETES ENGINE (Reconciliation)

---

## Key Idea:

```text
Desired State vs Actual State
```

Controller continuously fixes differences.

---

## Example:

* You define 3 pods
* Only 2 running
* Controller creates 1 more

---

# 📦 10. STORAGE

---

## Types

### EBS (Block Storage)

* Per pod
* AZ-specific

---

### EFS (Shared Storage)

* Multi-node access

---

## Components

* StorageClass
* PersistentVolume (PV)
* PersistentVolumeClaim (PVC)

---

## Driver:

👉 EBS CSI Driver

---

# 📈 11. SCALING (REAL FLOW)

---

## 🔹 Pod Scaling

👉 HPA (Horizontal Pod Autoscaler)

---

## 🔹 Node Scaling

👉 Cluster Autoscaler

---

## 🔥 Real Scenario

```text
Traffic increases
 → HPA adds pods
 → Nodes full
 → Autoscaler adds nodes
```

---

# 📊 12. OBSERVABILITY

---

## Must Have in Production

### Logs:

* CloudWatch
* Fluent Bit

---

### Metrics:

* Prometheus
* Grafana

---

### Alerts:

* Alertmanager / CloudWatch

---

# 🚀 13. DEPLOYMENT WORKFLOW

---

## Standard Flow:

```text
Code → Build → Docker → Push to ECR → Deploy to EKS
```

---

## Deployment Tools:

* kubectl
* Helm
* ArgoCD (GitOps)

---

# 🔄 14. CI/CD (Industry Setup)

---

## Common Stack:

* GitHub Actions / Jenkins
* Docker → ECR
* Helm / kubectl deploy

---

# ⚠️ 15. COMMON PRODUCTION ISSUES

---

## ❌ Nodes not joining

* IAM role issue
* aws-auth ConfigMap missing

---

## ❌ Pods stuck Pending

* No resources
* IP exhaustion

---

## ❌ ALB not created

* Missing subnet tags
* IRSA issue

---

## ❌ Image pull errors

* No NAT Gateway
* Missing ECR permission

---

## ❌ Health check failing

* Wrong path
* Security group blocked

---

# 🔐 16. SECURITY BEST PRACTICES

---

* Use private nodes only
* Enable IRSA everywhere
* Restrict API access
* Use Secrets Manager
* Apply Network Policies

---

# 💰 17. COST OPTIMIZATION

---

## Major Costs:

* EC2 nodes
* NAT Gateway (VERY expensive)
* ALB

---

## Optimization Tips:

* Use Spot instances
* Use Graviton instances
* Right-size nodes
* Reduce NAT usage
* Avoid idle ALBs

---

# 🧠 18. CONTROL PLANE vs DATA PLANE

---

| Type          | Role              |
| ------------- | ----------------- |
| Control Plane | Decision making   |
| Data Plane    | Traffic execution |

---

## In EKS:

* Kubernetes → control
* ALB + VPC → data

---

# 🚀 19. ADVANCED CONCEPTS (Industry Level)

---

## 🔹 Fargate

* Serverless pods
* No node management

---

## 🔹 eBPF / Cilium

* Replaces kube-proxy
* Advanced networking

---

## 🔹 Service Mesh

* Istio / Linkerd
* Observability + traffic control

---

## 🔹 Multi-cluster

* Federation / global apps

---

# 🎯 20. FINAL PRODUCTION CHECKLIST

---

### Networking

* VPC, subnets, NAT, routing

---

### Cluster

* EKS configured properly

---

### Nodes

* Private + scalable

---

### IAM

* Cluster + node roles correct

---

### OIDC

* Enabled

---

### IRSA

* Used for controllers & apps

---

### Ingress

* ALB controller installed

---

### Monitoring

* Logs + metrics enabled

---

# 🧠 FINAL TAKEAWAY

---

## 🔥 EKS is NOT:

> “Create cluster and deploy pods”

---

## ✅ EKS IS:

```text
Networking + IAM + Kubernetes + AWS integrations
```

---

## 🧭 Ultimate Understanding

```text
Ingress = Rules
Controller = Translator
ALB = Execution
Service = Discovery
Pods = Compute
```

---

# 📌 HOW YOU SHOULD USE THIS

---

### Step 1

Understand flow deeply

---

### Step 2

Build cluster yourself (Terraform)

---

### Step 3

Break things intentionally

---

### Step 4

Debug everything

---

