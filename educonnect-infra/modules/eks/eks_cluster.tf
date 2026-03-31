resource "aws_eks_cluster" "edu-cluster" {
  name = "edu-cluster"
  role_arn = aws_iam_role.cluster-role.arn
  vpc_config {
    endpoint_private_access = true
    endpoint_public_access = true
    subnet_ids = var.worker-subnet-ids
  }

  depends_on = [
    aws_iam_role_policy_attachment.cluster-eks-policy-attach,
    aws_iam_role_policy_attachment.cluster-vpc-policy-attach
  ]
}

resource "aws_iam_role" "cluster-role" {
  name = "cluster-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sts:AssumeRole"
        ]
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cluster-eks-policy-attach" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role = aws_iam_role.cluster-role.name
}

resource "aws_iam_role_policy_attachment" "cluster-vpc-policy-attach" {
  role       = aws_iam_role.cluster-role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
}

data "tls_certificate" "eks" {
  url = aws_eks_cluster.edu-cluster.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "cluster-oidc-provider" {
  url = aws_eks_cluster.edu-cluster.identity[0].oidc[0].issuer

  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = [
    data.tls_certificate.eks.certificates[0].sha1_fingerprint
  ]

  depends_on = [aws_eks_cluster.edu-cluster]
}