resource "helm_release" "external-secrets-release" {
  name = "external-secrets-release"
  repository = "https://charts.external-secrets.io"
  chart = "external-secrets"
  namespace = "external-secrets"

  create_namespace = false

  set {
    name = "serviceAccount.create"
    value = "false"
  }

  set {
    name = "serviceAccount.name"
    value = "external-secrets-sa"
  }

  depends_on = [
    aws_eks_node_group.edu-nodegroup,
    kubernetes_service_account.external-secrets-sa
  ]
}

resource "kubernetes_namespace" "external-secrets-ns" {
  metadata {
    name = "external-secrets"
  }

  depends_on = [
    aws_eks_node_group.edu-nodegroup
  ]
}

resource "kubernetes_service_account" "external-secrets-sa" {
  metadata {
    name = "external-secrets-sa"
    namespace = "external-secrets"
    annotations = {
      "eks.amazonaws.com/role-arn" = var.external-secret-role-arn
    }
  }

  depends_on = [
    aws_eks_node_group.edu-nodegroup,
    kubernetes_namespace.external-secrets-ns
  ]
}