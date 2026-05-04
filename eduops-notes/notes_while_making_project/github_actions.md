Alright — this is exactly the kind of depth you *should* aim for as a DevOps engineer. I’ll give you **complete, structured, no-BS markdown notes** you can literally save and revise before interviews.

---

# 📘 GitHub Actions — Complete DevOps Notes

---

# 🧠 1. What is GitHub Actions?

GitHub Actions is a **CI/CD automation platform** that allows you to:

* Build code
* Run tests
* Build Docker images
* Deploy to servers (EKS, EC2, etc.)

👉 Defined using **YAML workflows**

---

# 🏗️ 2. Core Architecture

```
Workflow → Jobs → Steps
```

### 🔹 Workflow

* YAML file in `.github/workflows/`
* Defines automation process

### 🔹 Job

* A group of steps
* Runs on a **runner (VM or EC2)**

### 🔹 Step

* Individual task
* Either:

  * `uses` → action
  * `run` → shell command

---

# 📂 3. Workflow File Structure

```yaml
name: CI Pipeline

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Build
        run: mvn clean install
```

---

# ⚡ 4. Triggers (`on`)

### 🔹 Basic

```yaml
on: push
```

### 🔹 Multiple events

```yaml
on: [push, pull_request]
```

### 🔹 Branch specific

```yaml
on:
  push:
    branches: [main, dev]
```

### 🔹 Path filtering (IMPORTANT for monorepo)

```yaml
on:
  push:
    paths:
      - "backend/**"
```

### 🔹 Manual trigger

```yaml
on:
  workflow_dispatch:
```

---

# 🧩 5. Jobs Deep Dive

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
```

## 🔹 `runs-on`

* Defines runner
* Types:

  * `ubuntu-latest` (GitHub-hosted)
  * `self-hosted` (EC2)

---

## 🔹 Multiple jobs

```yaml
jobs:
  build:
  test:
  deploy:
```

---

## 🔹 Job Dependencies (`needs`)

```yaml
jobs:
  test:
    needs: build
```

👉 test runs after build

---

## 🔹 Parallel vs Sequential

* Default: parallel
* With `needs`: sequential

---

# 🧱 6. Steps Deep Dive

## 🔹 1. `uses` (Actions)

```yaml
- uses: actions/checkout@v3
```

👉 Pre-built reusable logic

---

## 🔹 2. `run` (Shell commands)

```yaml
- run: mvn clean install
```

---

## 🔹 Multi-line commands

```yaml
- run: |
    npm install
    npm run build
```

---

## 🔹 Step naming

```yaml
- name: Install dependencies
```

---

## 🔹 Step conditions

```yaml
- name: Only run on main
  if: github.ref == 'refs/heads/main'
```

---

# 🔐 7. Environment Variables & Secrets

## 🔹 Step-level env

```yaml
- run: echo $DB_URL
  env:
    DB_URL: ${{ secrets.DB_URL }}
```

---

## 🔹 Job-level env

```yaml
jobs:
  build:
    env:
      NODE_ENV: production
```

---

## 🔹 Secrets

Stored in:

```
Repo → Settings → Secrets
```

Usage:

```yaml
${{ secrets.MY_SECRET }}
```

---

# 📦 8. Actions Inputs (`with`)

Used with `uses`

```yaml
- uses: actions/setup-node@v3
  with:
    node-version: 18
```

---

# 🧠 9. Contexts (VERY IMPORTANT)

```yaml
${{ github.ref }}
${{ github.actor }}
${{ github.event_name }}
```

Example:

```yaml
if: github.event_name == 'push'
```

---

# 🔁 10. Matrix Strategy (Advanced)

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
```

👉 Runs job multiple times

---

# 📂 11. Artifacts (Sharing Data Between Jobs)

## Upload

```yaml
- uses: actions/upload-artifact@v3
  with:
    name: build
    path: target/
```

## Download

```yaml
- uses: actions/download-artifact@v3
```

---

# 🧠 12. Caching (Performance Optimization)

```yaml
- uses: actions/cache@v3
  with:
    path: ~/.m2
    key: maven-${{ hashFiles('**/pom.xml') }}
```

---

# 🖥️ 13. Runners

## 🔹 GitHub-hosted

```yaml
runs-on: ubuntu-latest
```

* Ephemeral
* Clean every run

---

## 🔹 Self-hosted (EC2)

```yaml
runs-on: [self-hosted, ec2]
```

* Persistent
* Custom environment
* Access private VPC

---

# 🌐 14. Self-Hosted Runners (DevOps MUST KNOW)

### Setup flow:

1. Create EC2
2. Install runner
3. Configure with repo
4. Add labels
5. Use in workflow

---

## 🔹 Labels

```yaml
runs-on: [self-hosted, backend]
```

---

## 🔹 Use Cases

* Deploy to EKS
* Access RDS private subnet
* Terraform apply

---

# 🔄 15. Workflow Outputs

```yaml
jobs:
  build:
    outputs:
      version: ${{ steps.step1.outputs.version }}
```

---

# 🔗 16. Reusable Workflows (Advanced)

```yaml
jobs:
  call-workflow:
    uses: org/repo/.github/workflows/deploy.yml@main
```

---

# 🧪 17. Services (Containers in Workflow)

```yaml
services:
  postgres:
    image: postgres:13
```

👉 Useful for integration testing

---

# 🐳 18. Docker in GitHub Actions

```yaml
- run: docker build -t app .
- run: docker push repo/app
```

---

# ☁️ 19. AWS Integration (VERY IMPORTANT)

## Login to ECR

```yaml
- uses: aws-actions/amazon-ecr-login@v1
```

## Configure AWS

```yaml
- uses: aws-actions/configure-aws-credentials@v2
  with:
    role-to-assume: IAM_ROLE
```

---

# 🚀 20. Real DevOps Pipeline (Your Project)

```yaml
name: Backend CI/CD

on:
  push:
    paths:
      - "backend/**"

jobs:

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: mvn clean install

  docker:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: docker build -t app .
      - run: docker push repo/app

  deploy:
    needs: docker
    runs-on: [self-hosted, ec2]
    steps:
      - run: kubectl apply -f k8s/
```

---

# ⚠️ 21. Common Pitfalls

## ❌ Each job is isolated

* No shared files

## ❌ Fresh environment every time

* Must install dependencies

## ❌ YAML indentation errors

## ❌ Secrets not passed

---

# 🧠 22. Best Practices (DevOps Level)

✅ Use:

* Separate CI & CD
* Path-based triggers
* Self-hosted runners for deploy
* Caching
* Secrets properly

---

# 🔥 23. What YOU Must Know (Interview Level)

## MUST KNOW (Non-negotiable)

* Workflow structure
* jobs / steps / runners
* `uses` vs `run`
* secrets handling
* CI/CD pipeline design

---

## STRONG LEVEL

* self-hosted runners (EC2)
* matrix builds
* caching
* artifacts

---

## ADVANCED (Top 10%)

* reusable workflows
* OIDC with AWS (no static creds)
* dynamic runners (K8s)
* multi-env deployments

---

# 🧾 Final DevOps Summary

👉 GitHub Actions = CI/CD engine
👉 YAML = pipeline definition
👉 Runners = execution environment
👉 Jobs = stages
👉 Steps = commands/actions

---

# 🚀 If You Want Next

I can now help you build:

👉 **Production-grade pipeline**

* Build (Maven)
* Docker → ECR
* Deploy → EKS (via ArgoCD)
* Secure with OIDC (no secrets)

This will directly match **8–10 LPA DevOps expectations**.
