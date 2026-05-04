Here are your **complete, industry-level Jenkins notes** tailored for your DevOps project 👇

---

## 📘 Jenkins Complete Notes (DevOps / Production Level)

---

# 🧠 1. What is Jenkins?

**Jenkins** is an open-source **automation server** used to implement **CI/CD pipelines**.

👉 It helps automate:

* Build
* Test
* Deploy
* Infrastructure provisioning

---

# 🏗️ 2. Jenkins Architecture

```text
Jenkins Master (Controller)
   ↓
Agents (Workers / Nodes)
```

## 🔹 Master (Controller)

* Manages jobs
* Stores pipeline configs
* Schedules builds

## 🔹 Agents (Nodes)

* Execute jobs
* Can be:

  * EC2 instances
  * Docker containers
  * Kubernetes pods

---

# ⚙️ 3. Jenkins Setup (Your Case)

## On EC2:

Install:

```bash
Java
Jenkins
Git
Docker (optional)
Terraform
AWS CLI
kubectl (optional)
```

---

# 🔐 4. Authentication & Security

## Important:

### Use IAM Role (Best)

```text
EC2 → IAM Role → AWS access
```

### Jenkins Credentials Store

Store:

* GitHub token
* Docker credentials
* API keys

---

# 🔄 5. CI/CD Flow (Infra Repo)

```text
GitHub Push
   ↓
Webhook
   ↓
Jenkins Pipeline
   ↓
Terraform Init
Terraform Plan
Terraform Apply
   ↓
AWS Infrastructure
```

---

# 🧾 6. Jenkinsfile (Core of Everything)

👉 Jenkinsfile = **Pipeline as Code**

Stored inside repo.

---

# 🧱 7. Types of Pipelines

## 1. Declarative (Recommended ✅)

* Easy to read
* Structured
* Industry standard

## 2. Scripted (Advanced)

* Groovy-based
* More flexible
* Harder to maintain

👉 You should use **Declarative**

---

# 📦 8. Basic Jenkinsfile Structure

```groovy
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building...'
            }
        }
    }
}
```

---

# 🔍 9. Jenkinsfile Deep Explanation

---

## 🔹 pipeline {}

Top-level block

```groovy
pipeline {
}
```

Defines pipeline structure

---

## 🔹 agent

Where pipeline runs

```groovy
agent any
```

Options:

```groovy
agent any
agent { label 'docker-node' }
agent none
```

---

## 🔹 stages

Collection of steps

```groovy
stages {
    stage('Build') { ... }
}
```

---

## 🔹 stage

Represents one step

```groovy
stage('Terraform Init') {
    steps {
        sh 'terraform init'
    }
}
```

---

## 🔹 steps

Actual commands

```groovy
steps {
    sh 'terraform plan'
}
```

---

# ⚙️ 10. Real Jenkinsfile for Terraform (Production-Level)

```groovy
pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-south-1'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/your-username/infra-repo.git'
            }
        }

        stage('Terraform Init') {
            steps {
                sh 'terraform init'
            }
        }

        stage('Terraform Validate') {
            steps {
                sh 'terraform validate'
            }
        }

        stage('Terraform Plan') {
            steps {
                sh 'terraform plan -out=tfplan'
            }
        }

        stage('Manual Approval') {
            steps {
                input message: "Approve Terraform Apply?"
            }
        }

        stage('Terraform Apply') {
            steps {
                sh 'terraform apply tfplan'
            }
        }
    }
}
```

---

# 🧠 11. Key Concepts Explained

---

## 🔹 environment {}

Define variables

```groovy
environment {
    IMAGE_TAG = "${env.BUILD_NUMBER}"
}
```

---

## 🔹 input (Manual Approval)

```groovy
input message: "Approve?"
```

👉 Used in production pipelines

---

## 🔹 sh (Shell Command)

```groovy
sh 'terraform apply'
```

---

## 🔹 git

```groovy
git url: 'repo-url'
```

---

# 🔁 12. Pipeline Flow Explained

```text
1. Checkout repo
2. Initialize Terraform
3. Validate config
4. Plan changes
5. Manual approval
6. Apply changes
```

---

# 🔐 13. Credentials Usage

```groovy
withCredentials([string(credentialsId: 'aws-key', variable: 'AWS_KEY')]) {
    sh 'echo $AWS_KEY'
}
```

---

# 📦 14. Workspace Behavior

👉 Every build:

* Fresh clone of repo
* Runs pipeline
* Deletes after (optional)

---

# 🧪 15. Best Practices

---

## ✅ Use Remote Backend

```hcl
S3 + DynamoDB
```

---

## ✅ Use Manual Approval

Never auto-apply infra blindly

---

## ✅ Keep Jenkinsfile in Repo

Pipeline as code

---

## ✅ Use IAM Role

Avoid access keys

---

## ✅ Use Separate Environments

```text
dev / staging / prod
```

---

# 🚨 16. Common Mistakes

---

❌ Committing `.tfstate`
❌ Hardcoding secrets
❌ Skipping `terraform plan`
❌ No approval step
❌ Using local backend
❌ Huge Jenkinsfile (keep modular)

---

# ⚙️ 17. Advanced Concepts

---

## 🔹 Parallel Stages

```groovy
parallel {
    stage('Test1') { steps { ... } }
    stage('Test2') { steps { ... } }
}
```

---

## 🔹 Post Actions

```groovy
post {
    always {
        echo 'Cleanup'
    }
    success {
        echo 'Success'
    }
    failure {
        echo 'Failed'
    }
}
```

---

## 🔹 Parameters

```groovy
parameters {
    string(name: 'ENV', defaultValue: 'dev')
}
```

---

## 🔹 When Conditions

```groovy
when {
    branch 'main'
}
```

---

# 🚀 18. Your Final Architecture

```text
infra-repo (with Jenkinsfile)
   ↓
GitHub Webhook
   ↓
Jenkins (EC2)
   ↓
Terraform (S3 backend)
   ↓
AWS Infra (EKS, VPC)
```

---

# 🎯 19. Interview-Level Explanation

👉 If asked:

**“How did you implement infra CI/CD?”**

You answer:

* Used Jenkins with Pipeline as Code (Jenkinsfile)
* Integrated GitHub webhook for trigger
* Implemented Terraform stages: init, validate, plan, apply
* Used S3 backend with DynamoDB locking
* Added manual approval before apply
* Used IAM role for secure AWS access

---
