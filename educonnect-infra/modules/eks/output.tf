output "cluster_endpoint" {
  value = aws_eks_cluster.edu-cluster.endpoint
}

output "cluster_ca" {
  value = aws_eks_cluster.edu-cluster.certificate_authority[0].data
}

output "cluster_name" {
  value = aws_eks_cluster.edu-cluster.name
}

output "worker-sg-id" {
  value = aws_security_group.worker-sg.id
}

output "oidc-url" {
  value = aws_iam_openid_connect_provider.cluster-oidc-provider.url
}


output "oidc-arn" {
  value = aws_iam_openid_connect_provider.cluster-oidc-provider.arn
}