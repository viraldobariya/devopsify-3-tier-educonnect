resource "aws_s3_bucket" "frontend_static_bucket" {
  bucket = var.frontend_static_bucket

  tags = {
    Name = "Frontend Bucket"
    Environment = "Dev"
  }
}

data "aws_iam_policy_document" "origin_bucket_policy" {
  statement {
    sid = "AllowCloudfrontServicePrincipalReadWrite"

    effect = "Allow"

    principals {
      type = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.frontend_static_bucket.arn}/*"
    ]

    condition {
      test = "StringEquals"
      variable = "AWS:SourceArn"
      values = [aws_cloudfront_distribution.edu-frontend-cdn.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "s3_origin_bucket_policy" {
  bucket = aws_s3_bucket.frontend_static_bucket.bucket
  policy = data.aws_iam_policy_document.origin_bucket_policy.json

  depends_on = [aws_cloudfront_distribution.edu-frontend-cdn]
}

resource "aws_s3_bucket_public_access_block" "frontend_bucket_public_block" {
  bucket = aws_s3_bucket.frontend_static_bucket.id

  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}