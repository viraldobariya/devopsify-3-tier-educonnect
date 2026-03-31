
terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 6.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}



provider "aws" {
  region = var.region
}

provider "kubernetes" {
  host = module.eks-module.cluster_endpoint

  cluster_ca_certificate = base64decode(
    module.eks-module.cluster_ca
  )

  token = data.aws_eks_cluster_auth.cluster.token
}

data "aws_eks_cluster_auth" "cluster" {
  name = module.eks-module.cluster_name
}

provider "helm" {
  kubernetes {
    host = module.eks-module.cluster_endpoint

    cluster_ca_certificate = base64decode(
      module.eks-module.cluster_ca
    )

    token = data.aws_eks_cluster_auth.cluster.token
  }
}