#external secret pod iam role

resource "aws_iam_role" "external-secret-role" {
  name = "external-secret-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = var.oidc_arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${replace(var.oidc_url, "https://", "")}:sub" = "system:serviceaccount:external-secrets:external-secrets-sa"
        }
      }
    }]
  })
}

resource "aws_iam_policy" "irsa_secrets_policy" {
  name = "irsa-secrets-access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_irsa_secrets_policy" {
  role       = aws_iam_role.external-secret-role.name
  policy_arn = aws_iam_policy.irsa_secrets_policy.arn
}





# backend pod iam role

resource "aws_iam_role" "backend_pod_role" {
  name = "backend-pod-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = var.oidc_arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${replace(var.oidc_url, "https://", "")}:sub" = "system:serviceaccount:backend:backend-sa"
        }
      }
    }]
  })
}

resource "aws_s3_bucket" "backend_static_content_bucket" {
  bucket = var.backend_bucket_name

  tags = {
    Name = var.backend_bucket_name
  }
}

resource "aws_iam_policy" "s3_policy" {
  name = "s3-irsa-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = "arn:aws:s3:::${var.backend_bucket_name}"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "arn:aws:s3:::${var.backend_bucket_name}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "backend_s3_attach" {
  role = aws_iam_role.backend_pod_role.name
  policy_arn = aws_iam_policy.s3_policy.arn
}